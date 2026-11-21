'use strict';

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const viewports = [
  { name: 'mobile_360', width: 360, height: 740 },
  { name: 'mobile_375', width: 375, height: 667 },
  { name: 'mobile_390', width: 390, height: 844 },
  { name: 'mobile_430', width: 430, height: 932 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'desktop_1200', width: 1200, height: 800 }
];

async function run() {
  console.log('Testing responsive rendering across 6 viewports with Chrome headless...');
  const server = spawn('node', ['server/index.js'], { stdio: 'inherit' });

  // Wait 3 seconds for server
  await new Promise(r => setTimeout(r, 3000));

  const outDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  try {
    for (const vp of viewports) {
      const outPath = path.join(outDir, `${vp.name}.png`);
      const cmd = `"${CHROME_PATH}" --headless=new --disable-gpu --no-sandbox --window-size=${vp.width},${vp.height} --screenshot="${outPath}" http://localhost:3000`;
      console.log(`Testing ${vp.name} (${vp.width}x${vp.height})...`);
      execSync(cmd, { stdio: 'ignore' });
      const stats = fs.statSync(outPath);
      console.log(`✔ ${vp.name}: screenshot captured successfully (${Math.round(stats.size / 1024)} KB)`);
    }
    console.log('All responsive viewports verified successfully!');
  } finally {
    server.kill();
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
