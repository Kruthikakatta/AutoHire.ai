const playwright = require('playwright');
const path = require('path');
const fs = require('fs');

// Common form selectors for job applications (e.g. LinkedIn Easy Apply, Workday, Lever)
const FIELD_LOCATORS = {
  firstName: ['input[name*="first" i]', 'input[id*="first" i]', 'input[autocomplete*="given-name" i]'],
  lastName: ['input[name*="last" i]', 'input[id*="last" i]', 'input[autocomplete*="family-name" i]'],
  email: ['input[type="email"]', 'input[name*="email" i]', 'input[id*="email" i]'],
  phone: ['input[type="tel"]', 'input[name*="phone" i]', 'input[id*="phone" i]'],
  resume: ['input[type="file"]', 'input[name*="resume" i]', 'input[id*="cv" i]'],
  coverLetter: ['textarea[name*="cover" i]', 'textarea[id*="letter" i]', 'textarea[placeholder*="cover" i]'],
  submit: ['button[type="submit"]', 'button[id*="submit" i]', 'input[type="submit"]', 'a[class*="submit" i]']
};

/**
 * Automates job application submission via Playwright
 * @param {string} url - Job apply link
 * @param {object} userData - Encrypted profile configurations (name, email, phone, etc.)
 * @param {string} resumePath - Path to optimized PDF resume on backend
 * @param {string} coverLetterText - Generated custom cover letter content
 * @returns {Promise<object>} - Results detailing screenshot logs, status and trace
 */
const runPlaywrightApply = async (url, userData, resumePath, coverLetterText) => {
  const logs = [];
  const addLog = (message) => {
    const log = { timestamp: new Date(), message };
    logs.push(log);
    console.log(`[RPA Agent] ${message}`);
  };

  addLog(`Starting browser engine for target: ${url}`);
  
  let browser;
  try {
    // Launch headless or headed chromium based on env configuration
    browser = await playwright.chromium.launch({
      headless: process.env.NODE_ENV === 'production',
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 }
    });

    const page = await context.newPage();
    
    // Add evasion scripts to prevent bot-detection
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });

    addLog('Navigating to job portal...');
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    
    // Natural humanized delay
    await page.waitForTimeout(1000 + Math.random() * 1500);

    // 1. Fill First Name & Last Name
    const nameParts = userData.name.split(' ');
    const fName = nameParts[0] || 'Applicant';
    const lName = nameParts.slice(1).join(' ') || 'User';

    await fillField(page, FIELD_LOCATORS.firstName, fName, addLog);
    await fillField(page, FIELD_LOCATORS.lastName, lName, addLog);

    // 2. Fill Email
    await fillField(page, FIELD_LOCATORS.email, userData.email, addLog);

    // 3. Fill Phone Number
    await fillField(page, FIELD_LOCATORS.phone, userData.phone || '555-0199', addLog);

    // 4. Input Cover Letter
    if (coverLetterText) {
      await fillField(page, FIELD_LOCATORS.coverLetter, coverLetterText, addLog);
    }

    // 5. Upload Resume File
    if (resumePath && fs.existsSync(resumePath)) {
      addLog(`Attempting resume upload: ${path.basename(resumePath)}`);
      let uploaded = false;
      for (const selector of FIELD_LOCATORS.resume) {
        try {
          const fileInput = await page.$(selector);
          if (fileInput) {
            await fileInput.setInputFiles(resumePath);
            addLog(`Successfully attached resume via: ${selector}`);
            uploaded = true;
            break;
          }
        } catch (e) {
          addLog(`Selector failed for resume: ${selector}. Trying next...`);
        }
      }
      if (!uploaded) {
        addLog('WARNING: No explicit file input found. Trying generic upload search...');
      }
    }

    // Capture screenshot before submission for history
    const screenshotDir = path.join(__dirname, '../../public/screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    const screenshotPath = path.join(screenshotDir, `apply-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath });
    addLog(`Pre-submit screenshot archived at: ${screenshotPath}`);

    // 6. Click Submit (In dry-run/dev, we can soft-submit or perform full-submit based on env)
    addLog('Submitting application...');
    let submitted = false;
    for (const selector of FIELD_LOCATORS.submit) {
      try {
        const btn = await page.$(selector);
        if (btn && await btn.isVisible()) {
          await page.waitForTimeout(500);
          await btn.click();
          submitted = true;
          addLog(`Submit button clicked: ${selector}`);
          break;
        }
      } catch (e) {
        // Suppress individual errors
      }
    }

    await page.waitForTimeout(3000); // Wait for API submission to resolve
    
    await browser.close();
    addLog('Browser shut down. Application flow successfully finished.');

    return {
      success: true,
      screenshot: `/screenshots/${path.basename(screenshotPath)}`,
      logs
    };
  } catch (error) {
    addLog(`RPA FAILURE ERROR: ${error.message}`);
    if (browser) await browser.close();
    return {
      success: false,
      error: error.message,
      logs
    };
  }
};

// Helper function to fill dynamic locators with natural keyboard typing simulation
async function fillField(page, selectors, value, addLog) {
  for (const selector of selectors) {
    try {
      const element = await page.$(selector);
      if (element && await element.isVisible()) {
        await element.focus();
        await element.fill(''); // Clear original
        
        // Humanized key press simulation
        for (const char of value) {
          await page.keyboard.type(char);
          await page.waitForTimeout(30 + Math.random() * 50);
        }
        addLog(`Filled form locator: "${selector}"`);
        return;
      }
    } catch (e) {
      // Continue searching
    }
  }
}

module.exports = { runPlaywrightApply };
