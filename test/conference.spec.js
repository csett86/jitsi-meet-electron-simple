const { test, expect } = require('@playwright/test');
const { _electron: electron } = require('playwright');
const path = require('path');

test.describe('Jitsi Meet Conference Loading', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Launch Electron app with sandbox disabled for testing
    electronApp = await electron.launch({
      args: [
        path.join(__dirname, '..', 'main.js'),
        '--no-sandbox',
        '--disable-gpu'
      ]
    });

    // Get the first window that the app opens
    window = await electronApp.firstWindow();
    
    // Wait for the window to be ready
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterAll(async () => {
    // Close the app
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should load conference from URL and create iframe via API', async () => {
    // Verify the URL input field is present
    const urlInput = await window.locator('#jitsi-url');
    await expect(urlInput).toBeVisible();

    // Enter the conference URL (as specified in requirements)
    const conferenceUrl = 'https://alpha.jitsi.net/ztexfftt644';
    await urlInput.fill(conferenceUrl);

    // Click the Go button
    const goButton = await window.locator('#go-button');
    await goButton.click();

    // Wait for the jitsi container to have the fullscreen class
    const jitsiContainer = await window.locator('#jitsi-container');
    await expect(jitsiContainer).toHaveClass(/fullscreen/);

    // Wait for the iframe to be created by JitsiMeetExternalAPI
    // The API creates an iframe inside the jitsi-container
    const iframe = await window.locator('#jitsi-container iframe');
    
    // Wait for iframe to appear (may take a few seconds to initialize)
    await iframe.waitFor({ state: 'attached', timeout: 10000 });
    
    // Verify the iframe is present
    await expect(iframe).toBeAttached();

    // Verify the iframe src contains the expected domain
    const iframeSrc = await iframe.getAttribute('src');
    expect(iframeSrc).toContain('alpha.jitsi.net');

    // Verify the URL bar is hidden when conference is active
    const urlBar = await window.locator('#url-bar');
    await expect(urlBar).toHaveClass(/hidden/);

    // Verify the conference container is visible
    await expect(jitsiContainer).toBeVisible();
  });
});
