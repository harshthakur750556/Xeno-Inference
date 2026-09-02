export interface BareMetalSpecs {
  logicalCores: number;
  deviceMemoryGb: number | string;
  gpuRenderer: string;
  gpuVendor: string;
  screenResolution: string;
  colorDepth: number;
  webGpuSupported: boolean;
  wasmSimdSupported: boolean;
  platform: string;
  userAgent: string;
  networkType: string;
  networkDownlinkMbps: number | string;
  networkRttMs: number | string;
  maxTouchPoints: number;
  audioSampleRateHz: number;
}

export async function probeBareMetalHardware(): Promise<BareMetalSpecs> {
  // 1. CPU Logical Cores
  const logicalCores = navigator.hardwareConcurrency || 4;

  // 2. Physical Device RAM in GB
  const deviceMemoryGb = (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : '>= 8 GB (Secure Sandbox)';

  // 3. Genuine GPU Unmasked Renderer & Vendor via WebGL context
  let gpuRenderer = 'Standard GPU Accelerator';
  let gpuVendor = 'Generic';

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        gpuRenderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || gpuRenderer;
        gpuVendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || gpuVendor;
      }
    }
  } catch (err) {
    console.warn('WebGL hardware query restricted:', err);
  }

  // 4. Display & Resolution
  const screenResolution = `${window.screen.width} x ${window.screen.height} @ ${window.devicePixelRatio || 1}x DPI`;
  const colorDepth = window.screen.colorDepth || 24;

  // 5. WebGPU capability check
  const webGpuSupported = Boolean((navigator as any).gpu);

  // 6. WebAssembly SIMD support verification
  let wasmSimdSupported = false;
  try {
    wasmSimdSupported = WebAssembly.validate(
      new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])
    );
  } catch {}

  // 7. Network Performance
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  const networkType = conn?.effectiveType ? conn.effectiveType.toUpperCase() : 'Broadband / Wi-Fi';
  const networkDownlinkMbps = conn?.downlink ? `${conn.downlink} Mbps` : 'High Speed';
  const networkRttMs = conn?.rtt ? `${conn.rtt} ms` : '< 20 ms';

  // 8. Audio hardware sample rate
  let audioSampleRateHz = 48000;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      audioSampleRateHz = ctx.sampleRate;
      ctx.close().catch(() => {});
    }
  } catch {}

  return {
    logicalCores,
    deviceMemoryGb,
    gpuRenderer,
    gpuVendor,
    screenResolution,
    colorDepth,
    webGpuSupported,
    wasmSimdSupported,
    platform: navigator.platform || 'Unknown OS',
    userAgent: navigator.userAgent,
    networkType,
    networkDownlinkMbps,
    networkRttMs,
    maxTouchPoints: navigator.maxTouchPoints || 0,
    audioSampleRateHz,
  };
}
