// Vercel Serverless Function & Local Proxy: /api/proxy
// Strips X-Frame-Options and CSP headers, neutralizes frame-busting, rewrites relative links with <base>,
// and injects a client-side navigation bridge so link clicks and form submits stay inside the browser panel.

try {
  const dns = require('node:dns');
  if (dns && dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
  const { setGlobalDispatcher, Agent } = require('undici');
  setGlobalDispatcher(new Agent({
    connect: {
      lookup: (hostname, opts, cb) => {
        if (typeof opts === 'function') { cb = opts; opts = {}; }
        dns.lookup(hostname, { ...opts, family: 4 }, cb);
      }
    }
  }));
} catch {}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    return res.status ? res.status(204).end() : (res.writeHead(204), res.end());
  }

  const targetUrl = req.query ? req.query.url : new URL(req.url, 'http://localhost').searchParams.get('url');
  if (!targetUrl || typeof targetUrl !== 'string') {
    return res.status ? res.status(400).send('Missing url parameter') : (res.writeHead(400), res.end('Missing url parameter'));
  }

  try {
    const fullUrl = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;
    const urlObj = new URL(fullUrl);

    const response = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    const contentType = response.headers.get('content-type') || 'text/html';
    const isHtml = contentType.includes('text/html');

    if (!isHtml) {
      const buffer = await response.arrayBuffer();
      res.setHeader('Content-Type', contentType);
      const buf = Buffer.from(buffer);
      return res.status ? res.status(response.status).send(buf) : (res.writeHead(response.status), res.end(buf));
    }

    let html = await response.text();
    const finalUrl = response.url || fullUrl;
    const finalUrlObj = new URL(finalUrl);
    const basePath = finalUrlObj.origin + finalUrlObj.pathname.substring(0, finalUrlObj.pathname.lastIndexOf('/') + 1);

    // Detect DuckDuckGo anti-bot block page
    if (html.includes('If this persists, please email us') || html.includes('anonymized error code')) {
      const searchMatch = finalUrl.match(/[?&]q=([^&]+)/);
      const queryTerm = searchMatch ? decodeURIComponent(searchMatch[1].replace(/\+/g, ' ')) : 'Search';
      html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Search: ${queryTerm}</title>
  <style>
    body { background: #09090d; color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 80vh; padding: 24px; text-align: center; }
    h2 { font-size: 20px; margin-bottom: 8px; color: #fff; }
    p { color: #a1a1aa; font-size: 14px; max-width: 480px; line-height: 1.5; margin-bottom: 24px; }
    .btn-group { display: flex; gap: 12px; flex-wrap: wrap; justify-content: center; }
    .btn { display: inline-flex; align-items: center; gap: 6px; padding: 10px 18px; border-radius: 12px; background: #27272a; color: #fff; text-decoration: none; font-size: 13px; font-weight: 600; transition: background 0.2s; }
    .btn:hover { background: #3f3f46; }
    .btn-primary { background: #38bdf8; color: #000; }
    .btn-primary:hover { background: #7dd3fc; }
  </style>
</head>
<body>
  <h2>Web Search Portal</h2>
  <p>External search engine rate-limiting was detected. Launch your query directly for "<strong>${queryTerm}</strong>":</p>
  <div class="btn-group">
    <a class="btn btn-primary" href="https://www.google.com/search?q=${encodeURIComponent(queryTerm)}" target="_blank" rel="noopener noreferrer">Search with Google &rarr;</a>
    <a class="btn" href="https://duckduckgo.com/?q=${encodeURIComponent(queryTerm)}" target="_blank" rel="noopener noreferrer">Open DuckDuckGo &rarr;</a>
    <a class="btn" href="https://search.brave.com/search?q=${encodeURIComponent(queryTerm)}" target="_blank" rel="noopener noreferrer">Search with Brave &rarr;</a>
    <a class="btn" href="https://arxiv.org/search/?query=${encodeURIComponent(queryTerm)}&searchtype=all" target="_blank" rel="noopener noreferrer">Search arXiv &rarr;</a>
  </div>
</body>
</html>`;
    }

    // Strip framing restrictions, meta CSP, and frame busting
    html = html.replace(/<meta[^>]*http-equiv=["']?(content-security-policy|x-frame-options)["']?[^>]*>/gi, '');
    html = html.replace(/\b(top|parent)\.location/g, 'window.location');

    const baseTag = `<base href="${basePath}">`;

    // Interactive navigation bridge & frame isolation
    const bridgeScript = `
<script>
(function() {
  try {
    Object.defineProperty(window, 'top', { get: function() { return window; } });
    Object.defineProperty(window, 'parent', { get: function() { return window; } });
  } catch(e) {}

  document.addEventListener('click', function(e) {
    var a = e.target.closest('a');
    if (a && a.href && !a.href.startsWith('javascript:') && !a.href.startsWith('#')) {
      e.preventDefault();
      window.parent.postMessage({
        type: 'BROWSER_NAVIGATE',
        url: a.href,
        title: a.innerText ? a.innerText.trim() : document.title || a.href
      }, '*');
    }
  }, true);

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (form && form.action) {
      e.preventDefault();
      var formData = new FormData(form);
      var params = new URLSearchParams();
      for (var pair of formData.entries()) {
        params.append(pair[0], pair[1]);
      }
      var actionUrl = new URL(form.action, window.location.href);
      var target = actionUrl.origin + actionUrl.pathname + '?' + params.toString();
      window.parent.postMessage({
        type: 'BROWSER_NAVIGATE',
        url: target,
        title: 'Search: ' + (params.get('q') || params.get('query') || '')
      }, '*');
    }
  }, true);

  window.addEventListener('load', function() {
    window.parent.postMessage({
      type: 'BROWSER_PAGE_LOADED',
      url: "${finalUrl}",
      title: document.title || "${finalUrlObj.hostname}"
    }, '*');
  });
})();
</script>
`;

    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}${bridgeScript}`);
    } else if (html.includes('<HEAD>')) {
      html = html.replace('<HEAD>', `<HEAD>${baseTag}${bridgeScript}`);
    } else {
      html = `${baseTag}${bridgeScript}${html}`;
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status ? res.status(200).send(html) : (res.writeHead(200), res.end(html));
  } catch (err) {
    const errorHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{background:#0a0a0e;color:#f4f4f5;font-family:sans-serif;padding:32px;text-align:center;}h2{color:#ef4444;}p{color:#a1a1aa;}</style></head><body><h2>Unable to Load Web Page</h2><p>${err.message}</p><p><a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="color:#38bdf8;">Open in External Tab &rarr;</a></p></body></html>`;
    return res.status ? res.status(500).send(errorHtml) : (res.writeHead(500), res.end(errorHtml));
  }
};
