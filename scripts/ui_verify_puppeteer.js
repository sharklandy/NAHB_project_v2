/**
 * Quick headless UI verification using Puppeteer.
 * - Visits the frontend at http://localhost:3000
 * - Collects the first N stories from the StoryList
 * - For each story: opens it, clicks up to M choices (first choice each time), records page texts
 * - Produces a JSON report in `scripts/ui_verify_report.json`
 *
 * Usage:
 * 1) Install puppeteer: `npm i puppeteer --save-dev`
 * 2) Run: `node ./scripts/ui_verify_puppeteer.js`
 *
 * Note: Puppeteer downloads Chromium; installation may take time and disk space.
 */

const fs = require('fs');
const puppeteer = require('puppeteer');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const OUTPUT = 'scripts/ui_verify_report.json';
const STORY_COUNT = 5; // number of stories to sample
const MAX_DEPTH = 6; // max choices to follow per story

(async () => {
  console.log('Starting headless UI verification...');
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  try {
    await page.goto(FRONTEND, { waitUntil: 'networkidle2' });
    await page.waitForSelector('.story-card', { timeout: 10000 });

    // Collect story card elements
    const storyHandles = await page.$$('.story-card');
    const sampleCount = Math.min(STORY_COUNT, storyHandles.length);
    console.log(`Found ${storyHandles.length} stories, sampling ${sampleCount}`);

    const report = [];

    for (let i = 0; i < sampleCount; i++) {
      // Re-query story cards each loop to avoid stale elements
      const cards = await page.$$('.story-card');
      const card = cards[i];

      // Extract title
      const title = await card.$eval('h3', n => n.innerText).catch(() => 'unknown');
      console.log(`\n--- Story #${i + 1}: ${title}`);

      // Click the story to open PlayView
      const content = await card.$('.story-card-content');
      if (!content) {
        console.warn('Could not find clickable content for story, skipping');
        continue;
      }
      await content.click();

      // Wait for play view content
      await page.waitForTimeout(600); // small delay for route transition
      // wait for either story page or choice button
      await page.waitForFunction(() => {
        return document.querySelector('.story-page') || document.querySelector('.choice-button') || document.querySelector('.story-header');
      }, { timeout: 8000 }).catch(() => {});

      const storyReport = { title, navigated: [], errors: [] };

      // Follow choices up to depth
      for (let depth = 0; depth < MAX_DEPTH; depth++) {
        // capture current page text
        const pageText = await page.evaluate(() => {
          const el = document.querySelector('.story-page') || document.querySelector('.story-header') || document.querySelector('.story-card-content');
          return el ? el.innerText.slice(0, 2000) : null;
        });

        storyReport.navigated.push({ depth, pageText: pageText || '' });

        // find choice button
        const choice = await page.$('.choice-button, .choice, button.choice, button.choice-button, .choices button');
        if (!choice) {
          console.log('  No choice button found — likely an end or UI mismatch');
          break;
        }

        // click the first available choice
        try {
          await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 8000 }).catch(() => {}),
            choice.click()
          ]);
        } catch (err) {
          // sometimes the navigation is via client-side render; just wait briefly
          await page.waitForTimeout(600);
        }

        // small pause
        await page.waitForTimeout(400);
      }

      // push report
      report.push(storyReport);

      // go back to story list
      await page.goto(FRONTEND, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.story-card', { timeout: 8000 }).catch(() => {});
    }

    fs.writeFileSync(OUTPUT, JSON.stringify(report, null, 2), 'utf8');
    console.log('\n✅ UI verification done. Report written to', OUTPUT);

  } catch (err) {
    console.error('Error during UI verification:', err);
  } finally {
    await browser.close();
  }
})();
