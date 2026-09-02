const { spawn } = require('child_process');
const path = require('path');

console.log('════════════════════════════════════════════════════════════');
console.log('  🌌 LAUNCHING XENO INFERENCE (TypeScript + Rust Architecture)');
console.log('════════════════════════════════════════════════════════════');

// 1. Start Backend Server
const backend = spawn('node', ['backend/server.js'], {
  stdio: 'inherit',
  shell: true,
  cwd: __dirname,
});

// 2. Start Frontend Vite Server
const frontend = spawn('cmd.exe', ['/c', 'npm.cmd run dev'], {
  stdio: 'inherit',
  shell: true,
  cwd: path.join(__dirname, 'frontend'),
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});