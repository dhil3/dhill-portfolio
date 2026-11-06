/**
 * End-to-end checks for the Dhill portfolio. Run: npm test
 * Serves the site itself on port 4321, then drives it with Puppeteer.
 */
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = 4321;
const URL = `http://localhost:${PORT}/`;
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.xml': 'text/xml', '.txt': 'text/plain' };

let passed = 0;
let total = 0;
function check(ok, name, detail = '') {
  total++;
  if (ok) passed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${!ok && detail ? ` - ${detail}` : ''}`);
}

const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]);
  const file = path.join(ROOT, rel === '/' ? 'index.html' : rel);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise((r) => server.listen(PORT, r));
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const errors = [];
  const external = /fonts\.(googleapis|gstatic)\.com/;
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => { if (r.status() >= 400 && !external.test(r.url())) errors.push(`${r.status()} ${r.url()}`); });

  const visible = (sel) => page.$eval(sel, (el) => el.getBoundingClientRect().height > 0 && getComputedStyle(el).visibility !== 'hidden');

  try {
    console.log('\nPage and SEO');
    const res = await page.goto(URL, { waitUntil: 'load' });
    check(res.status() === 200, 'Page responds 200');
    check((await page.$$('h1')).length === 1, 'Exactly one H1');
    check(!!(await page.$('link[rel="canonical"]')), 'Canonical URL present');
    const ogImage = await page.$eval('meta[property="og:image"]', (m) => m.content);
    check(ogImage.startsWith('https://') && fs.existsSync(path.join(ROOT, 'assets/images/og-card.png')), 'Open Graph image is absolute and exists');
    check(fs.existsSync(path.join(ROOT, 'robots.txt')) && fs.existsSync(path.join(ROOT, 'sitemap.xml')), 'robots.txt and sitemap.xml exist');

    console.log('\nCredibility');
    const text = await page.$eval('body', (b) => b.innerText);
    for (const banned of ['100%', 'Data-Driven', 'revenue-driving', 'profitable', 'compounding', 'high-converting', 'guarantee']) {
      check(!text.toLowerCase().includes(banned.toLowerCase()), `Page does not claim "${banned}"`);
    }
    const srcs = await page.$$eval('img', (imgs) => imgs.map((i) => i.getAttribute('src')));
    check(!srcs.some((s) => /hero_growth|spark_advertising|idea_enterprises|profile\.jpg/.test(s)), 'No mockup images or stock portrait in use');
    check(text.includes('Illustrative data') && text.includes('not client results'), 'Sample report is labelled as illustrative');

    console.log('\nContact links');
    const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    check(!hrefs.includes('https://wa.me/') && hrefs.includes('https://wa.me/919360123584') && !hrefs.includes('https://linkedin.com'), 'No empty WhatsApp or LinkedIn links');

    console.log('\nTheme');
    await page.click('#themeToggleBtn');
    check(await page.evaluate(() => document.documentElement.dataset.theme === 'light' && localStorage.getItem('dhill_theme') === 'light'), 'Toggle switches to light and saves it');
    await page.click('#themeToggleBtn');
    check(await page.evaluate(() => document.documentElement.dataset.theme === 'dark'), 'Toggle returns to dark');

    console.log('\nStructure');
    check((await page.$$('#project-spark, #project-idea')).length === 2, 'Both case studies present');
    check((await page.$$('.svc')).length === 4, 'Four service groups');
    check((await page.$$('.step')).length === 6, 'Six workflow stages');
    check((await page.$$('.pillars li')).length === 5, 'Five growth pillars');

    await page.click('.step:nth-child(3) summary');
    const openSteps = await page.$$eval('.step[open]', (s) => s.length);
    check(openSteps === 1, 'Opening a workflow stage closes the previous one', `open: ${openSteps}`);

    console.log('\nEnquiry flow');
    await page.$eval('.svc .discuss[data-need="Local visibility"]', (a) => a.click());
    await page.click('#nextBtn');
    check((await page.$eval('#err-clientBusinessName', (e) => e.textContent)).length > 0, 'Step 1 requires a company name');
    await page.type('#clientBusinessName', 'Test Co');
    await page.click('#nextBtn');
    check(await page.$eval('input[value="Local visibility"]', (c) => c.checked), 'Service card preselects its need');
    await page.$eval('input[value="Content creation"]', (c) => c.click());
    check((await page.$eval('#selectedCountBadge', (e) => e.textContent)) === '2', 'Selected count updates');
    await page.$eval('#pickedList .pill:last-child', (b) => b.click());
    check((await page.$eval('#selectedCountBadge', (e) => e.textContent)) === '1', 'Selection can be removed');
    await page.click('#nextBtn');
    await page.type('#clientGoal', 'More enquiries from Maps');
    await page.click('#prevBtn');
    await page.click('#prevBtn');
    check((await page.$eval('#clientBusinessName', (e) => e.value)) === 'Test Co', 'Going back keeps entries');
    await page.click('#nextBtn');
    await page.click('#nextBtn');
    await page.click('#nextBtn');
    await page.type('#clientName', 'Asha');
    await page.type('#clientContact', 'not-an-email');
    await page.click('#nextBtn');
    check((await page.$eval('#err-clientContact', (e) => e.textContent)).includes('valid email'), 'Invalid email is rejected');
    await page.$eval('#clientContact', (e) => { e.value = ''; });
    await page.type('#clientContact', 'asha@test.co');
    await page.click('#nextBtn');
    const brief = await page.$eval('#briefPreview', (e) => e.textContent);
    check(brief.includes('Test Co') && brief.includes('Local visibility') && brief.includes('asha@test.co'), 'Brief contains the entered details');
    check(!(await page.$eval('#whatsappInquiryBtn', (b) => b.hidden)), 'WhatsApp send is available');
    await page.click('#copyBriefBtn');
    await page.waitForFunction(() => document.getElementById('sendStatus').textContent.length > 0);
    check((await page.$eval('#sendStatus', (e) => e.textContent)).length > 0, 'Copy gives feedback');

    console.log('\nResponsive');
    for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
      await page.setViewport({ width, height: 800 });
      await new Promise((r) => setTimeout(r, 100));
      const over = await page.evaluate(() => {
        const w = document.documentElement.clientWidth;
        const bad = [...document.querySelectorAll('main *, header *, footer *')].filter((el) => {
          if (el.closest('.table-wrap') || el.closest('#briefPreview')) return false;
          const r = el.getBoundingClientRect();
          return r.width > 0 && (r.right > w + 1 || r.left < -1) && !el.closest('.skip') && el.className !== 'skip';
        });
        return { sw: document.documentElement.scrollWidth, w, bad: bad.slice(0, 3).map((e) => e.tagName + '.' + e.className) };
      });
      check(over.sw <= over.w && over.bad.length === 0, `No horizontal overflow at ${width}px`, JSON.stringify(over));
      if (width <= 430) {
        const size = await page.$eval('body', (b) => parseFloat(getComputedStyle(b).fontSize));
        check(size >= 16, `Body text is at least 16px at ${width}px`, String(size));
      }
    }

    await page.setViewport({ width: 390, height: 800 });
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    check(await visible('#mobileMenuBtn'), 'Menu button visible on mobile');
    await page.click('#mobileMenuBtn');
    check(await page.$eval('#mobileMenuBtn', (b) => b.getAttribute('aria-expanded') === 'true') && await visible('#mobileDrawer'), 'Menu opens');
    await page.keyboard.press('Escape');
    check(!(await visible('#mobileDrawer')), 'Escape closes the menu');
    const small = await page.evaluate(() => [...document.querySelectorAll('.btn, .icon-btn, .to-top, .step summary, .more summary')]
      .filter((el) => el.getBoundingClientRect().height > 0)
      .filter((el) => { const r = el.getBoundingClientRect(); return r.height < 44 || r.width < 44; }).map((e) => e.className));
    check(small.length === 0, 'Primary controls are at least 44px', small.join(', '));

    check(errors.length === 0, 'No page errors or failed requests', errors.join(', '));
  } catch (e) {
    check(false, 'Suite ran to completion', e.message);
  } finally {
    await browser.close();
    server.close();
  }

  console.log(`\n${passed} of ${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
})();
