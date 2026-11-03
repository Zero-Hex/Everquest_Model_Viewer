// Headless shot of a model in the EQG viewer: node shot.js <viewer index.html> <archive> <out.png> [anim name] [seconds]
const { chromium } = require('playwright');
(async () => {
  const [page_, arc, out, anim, secs, drag] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const logs = []; page.on('console', m => logs.push(m.type() + ': ' + m.text())); page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await page.goto('file://' + page_);
  await page.setInputFiles('#file', arc);
  await page.waitForTimeout(2500);
  const info = await page.evaluate(() => ({ arc: document.getElementById('arcInfo').textContent, anims: [...document.querySelectorAll('#anim option')].map(o => o.value) }));
  console.log(JSON.stringify(info));
  if (anim) { await page.selectOption('#anim', anim); await page.waitForTimeout(1000 * (+secs || 1)); }
  else { await page.selectOption('#anim', ''); await page.waitForTimeout(800); }
  if (drag) { const b = await page.locator('#cv').boundingBox(); const cx = b.x + b.width / 2, cy = b.y + b.height / 2;
    await page.mouse.move(cx, cy); await page.mouse.down(); await page.mouse.move(cx + (+drag), cy, { steps: 20 }); await page.mouse.up(); await page.waitForTimeout(300); }
  await page.locator('#cv').screenshot({ path: out });
  console.log(logs.filter(l => /error|warn/i.test(l)).slice(0, 10).join('\n'));
  await browser.close();
})();
