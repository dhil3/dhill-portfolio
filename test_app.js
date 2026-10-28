/**
 * Comprehensive Automated Test Suite for Dhill Digital Marketing Portfolio
 * Using Puppeteer (Headless Chrome)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 STARTING DIGITAL MARKETING PORTFOLIO TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName, details = '') {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? '- ' + details : ''}`);
    }
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Track console errors and failed network requests
  const consoleErrors = [];
  const networkErrors = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', response => {
    if (response.status() >= 400) {
      networkErrors.push(`${response.status()} ${response.url()}`);
    }
  });

  try {
    // ------------------------------------------------------------------------
    // TEST 1: Page Load & Network Status
    // ------------------------------------------------------------------------
    console.log('--- TEST GROUP 1: Page Load & Network Integrity ---');
    const response = await page.goto('http://localhost:4321', { waitUntil: 'networkidle0' });
    
    assert(response.status() === 200, 'Server responded with HTTP 200 OK');
    assert(networkErrors.length === 0, 'No 404 or failed asset requests', networkErrors.join(', '));
    assert(consoleErrors.length === 0, 'No JavaScript console errors', consoleErrors.join(', '));

    const pageTitle = await page.title();
    assert(pageTitle.includes('Dhill') && pageTitle.includes('Digital Marketing Portfolio'), 
      'Page title matches expected branding', `Got: "${pageTitle}"`);

    // ------------------------------------------------------------------------
    // TEST 2: Image Asset Loading Verification
    // ------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 2: Visual Assets & Images ---');
    const imagesCheck = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        complete: img.complete,
        naturalWidth: img.naturalWidth
      }));
    });

    assert(imagesCheck.length >= 4, `At least 4 images exist on page (Found: ${imagesCheck.length})`);
    
    const allImagesLoaded = imagesCheck.every(img => img.complete && img.naturalWidth > 0);
    assert(allImagesLoaded, 'All images loaded successfully with non-zero dimensions');

    const heroImage = imagesCheck.find(img => img.src.includes('hero_growth.jpg'));
    assert(!!heroImage && heroImage.naturalWidth > 0, 'Hero 3D analytics image is loaded');

    const sparkImage = imagesCheck.find(img => img.src.includes('spark_advertising.jpg'));
    assert(!!sparkImage && sparkImage.naturalWidth > 0, 'Spark Advertising mockup image is loaded');

    const ideaImage = imagesCheck.find(img => img.src.includes('idea_enterprises.jpg'));
    assert(!!ideaImage && ideaImage.naturalWidth > 0, 'Idea Enterprises mockup image is loaded');

    const profileImage = imagesCheck.find(img => img.src.includes('profile.jpg'));
    assert(!!profileImage && profileImage.naturalWidth > 0, 'Marketer profile portrait image is loaded');

    // ------------------------------------------------------------------------
    // TEST 3: Desktop Navigation & Drawer Visibility (Bug Fix Check)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 3: Navigation & Desktop Layout Verification ---');
    const drawerIsHiddenOnDesktop = await page.evaluate(() => {
      const drawer = document.getElementById('mobileDrawer');
      if (!drawer) return false;
      const style = window.getComputedStyle(drawer);
      return style.display === 'none';
    });
    assert(drawerIsHiddenOnDesktop, 'Mobile navigation drawer is hidden (display: none) on desktop');

    const navLinksCount = await page.$$eval('.nav-link', links => links.length);
    assert(navLinksCount >= 6, `Desktop navigation links rendered properly (Found: ${navLinksCount})`);

    // ------------------------------------------------------------------------
    // TEST 4: Theme Toggle (Dark/Light Mode)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 4: Theme Switcher (Dark / Light Mode) ---');
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(initialTheme === 'dark', 'Initial theme is dark mode');

    await page.click('#themeToggleBtn');
    const toggledTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(toggledTheme === 'light', 'Theme toggled to light mode on button click');

    const savedThemeInStorage = await page.evaluate(() => localStorage.getItem('dhill_theme'));
    assert(savedThemeInStorage === 'light', 'Theme preference saved in localStorage');

    // Toggle back to dark
    await page.click('#themeToggleBtn');
    const finalTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    assert(finalTheme === 'dark', 'Theme toggled back to dark mode');

    // ------------------------------------------------------------------------
    // TEST 5: Portfolio Projects (Spark Advertising & Idea Enterprises)
    // ------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 5: Projects & Case Study Modal ---');
    const sparkCardExists = await page.$('#project-spark') !== null;
    const ideaCardExists = await page.$('#project-idea') !== null;
    assert(sparkCardExists, 'Project 01 (Spark Advertising) card exists');
    assert(ideaCardExists, 'Project 02 (Idea Enterprises) card exists');

    // Test Case Study Modal for Spark Advertising
    await page.click('#project-spark .open-case-study-btn');
    await page.waitForSelector('#caseStudyModal.open', { timeout: 2000 });
    
    const modalSparkTitle = await page.$eval('#modalCaseStudyContent', el => el.textContent);
    assert(modalSparkTitle.includes('Spark Advertising') && modalSparkTitle.includes('Google Business Profile setup'), 
      'Case study modal opened with Spark Advertising deliverables');

    // Close modal via Escape key
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => !document.getElementById('caseStudyModal').classList.contains('open'));
    assert(true, 'Case study modal closed via Escape key');

    // Test Case Study Modal for Idea Enterprises
    await page.click('#project-idea .open-case-study-btn');
    await page.waitForSelector('#caseStudyModal.open', { timeout: 2000 });
    const modalIdeaTitle = await page.$eval('#modalCaseStudyContent', el => el.textContent);
    assert(modalIdeaTitle.includes('Idea Enterprises'), 'Case study modal opened with Idea Enterprises content');

    // Close modal via Close Button
    await page.click('#modalCloseBtn');
    await page.waitForFunction(() => !document.getElementById('caseStudyModal').classList.contains('open'));
    assert(true, 'Case study modal closed via close button');

    // ------------------------------------------------------------------------
    // TEST 6: Core Services Filtering & Keyword Search
    // ------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 6: Services Filter & Real-Time Search ---');
    const totalServices = await page.$$eval('.service-card', cards => cards.length);
    assert(totalServices === 11, `All 11 Core Services rendered (Found: ${totalServices})`);

    // Click "Local SEO & Discovery" filter
    await page.click('.filter-btn[data-filter="local-seo"]');
    const visibleAfterCat = await page.$$eval('.service-card', cards => 
      cards.filter(c => c.style.display !== 'none').length
    );
    assert(visibleAfterCat > 0 && visibleAfterCat < 11, `Category filter works (Visible: ${visibleAfterCat} of 11)`);

    // Reset to All Services
    await page.click('.filter-btn[data-filter="all"]');
    const visibleAfterAll = await page.$$eval('.service-card', cards => 
      cards.filter(c => c.style.display !== 'none').length
    );
    assert(visibleAfterAll === 11, 'Reset to All Services displays all 11 cards');

    // Search for "video"
    await page.type('#serviceSearchInput', 'video');
    const visibleAfterSearch = await page.$$eval('.service-card', cards => 
      cards.filter(c => c.style.display !== 'none').length
    );
    assert(visibleAfterSearch > 0 && visibleAfterSearch < 11, `Keyword search for "video" filtered cards (Visible: ${visibleAfterSearch})`);

    // Clear search
    await page.$eval('#serviceSearchInput', el => el.value = '');
    await page.type('#serviceSearchInput', ' ');
    await page.keyboard.press('Backspace');

    // ------------------------------------------------------------------------
    // TEST 7: Interactive 6-Step Workflow Timeline
    // ------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 7: 6-Stage Workflow Timeline Switcher ---');
    const workflowCardsCount = await page.$$eval('.workflow-step-card', cards => cards.length);
    assert(workflowCardsCount === 6, `All 6 Workflow Timeline Steps rendered (Found: ${workflowCardsCount})`);

    // Click Phase 02
    await page.click('.workflow-step-card[data-step-index="1"]');
    const panelText02 = await page.$eval('#workflowDetailPanel', el => el.textContent);
    assert(panelText02.includes('PHASE 02') && panelText02.includes('Establish the Foundation'), 
      'Workflow detail panel updated to Phase 02 (Establish the Foundation)');

    // Click Phase 06
    await page.click('.workflow-step-card[data-step-index="5"]');
    const panelText06 = await page.$eval('#workflowDetailPanel', el => el.textContent);
    assert(panelText06.includes('PHASE 06') && panelText06.includes('Analyse & Improve'), 
      'Workflow detail panel updated to Phase 06 (Analyse & Improve)');

    // ------------------------------------------------------------------------
    // TEST 8: Interactive Project Scope Builder & Brief Generator
    // ------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 8: Interactive Project Scope Builder ---');
    // Select Service A from card
    const firstServiceCard = await page.$('.service-card[data-service-name="Google Business Profile & Local SEO"]');
    await firstServiceCard.$eval('.select-service-btn', btn => btn.click());

    // Select Service B from card
    const secondServiceCard = await page.$('.service-card[data-service-name="Social Media Management"]');
    await secondServiceCard.$eval('.select-service-btn', btn => btn.click());

    const selectedCount = await page.$eval('#selectedCountBadge', el => el.textContent);
    assert(selectedCount === '2', `Selected scope badge updated to 2 (Got: ${selectedCount})`);

    // Fill in business details
    await page.type('#clientBusinessName', 'Dhill Growth Partners');
    await page.type('#clientWebsite', 'https://dhillmarketing.example.com');
    await page.type('#clientPainPoints', 'Need consistent social presence and local Google Maps visibility.');

    // Click Copy Brief button
    await page.click('#copyBriefBtn');
    await page.waitForSelector('#toastNotice.show', { timeout: 2000 });
    const toastMessage = await page.$eval('#toastNotice', el => el.textContent);
    assert(toastMessage.includes('copied to clipboard'), 'Toast notification appeared when copying project brief');

    // ------------------------------------------------------------------------
    // TEST 9: Mobile Viewport & Navigation Drawer
    // ------------------------------------------------------------------------
    console.log('\n--- TEST GROUP 9: Mobile Responsiveness & Drawer Toggle ---');
    await page.setViewport({ width: 375, height: 667 });

    const menuBtnVisibleOnMobile = await page.evaluate(() => {
      const btn = document.getElementById('mobileMenuBtn');
      return window.getComputedStyle(btn).display === 'flex';
    });
    assert(menuBtnVisibleOnMobile, 'Mobile hamburger menu button is visible on 375px viewport');

    // Open mobile menu
    await page.click('#mobileMenuBtn');
    await new Promise(r => setTimeout(r, 400));
    const drawerIsOpen = await page.$eval('#mobileDrawer', el => el.classList.contains('open'));
    assert(drawerIsOpen, 'Mobile navigation drawer opened on menu click');

    // Click a nav link inside drawer to verify it closes
    await page.evaluate(() => {
      document.querySelector('#mobileDrawer .mobile-nav-link[href="#services"]').click();
    });
    await new Promise(r => setTimeout(r, 400));
    const drawerIsClosed = await page.$eval('#mobileDrawer', el => !el.classList.contains('open'));
    assert(drawerIsClosed, 'Mobile navigation drawer closed after clicking a section link');

    // Reset viewport to desktop
    await page.setViewport({ width: 1280, height: 800 });

    // Capture screenshot of clean hero & navigation
    const screenshotPath = path.join(__dirname, 'test_verification.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    assert(fs.existsSync(screenshotPath), `Verification screenshot captured at ${screenshotPath}`);

  } catch (error) {
    console.error('❌ Test suite encountered unhandled error:', error);
  } finally {
    await browser.close();
  }

  console.log('\n====================================================');
  console.log(`📊 TEST SUITE SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! APPLICATION IS 100% HEALTHY.');
  } else {
    console.log(`⚠️ ${totalTests - passedTests} TESTS FAILED.`);
  }
  console.log('====================================================');

  process.exit(passedTests === totalTests ? 0 : 1);
}

runTestSuite();
