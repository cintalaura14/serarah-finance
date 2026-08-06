require('dotenv').config();
const { spawn } = require('child_process');
const child = spawn('node', ['server.js'], { cwd: __dirname, stdio: 'pipe' });
let output = '';
child.stdout.on('data', d => output += d.toString());
child.stderr.on('data', d => console.error('STDERR:', d.toString()));
(async () => {
  await new Promise(r => setTimeout(r, 4000));
  try {
    const h = await fetch('http://localhost:3000/health', { method: 'GET' });
    const j = await h.json();
    console.log('=== /health ===');
    console.log('Status:', h.status);
    console.log(JSON.stringify(j, null, 2));
  } catch (e) {
    console.error('HEALTH ERROR:', e.message);
  }
  console.log('=== Server startup log ===');
  console.log(output);
  child.kill();
  process.exit(0);
})();
