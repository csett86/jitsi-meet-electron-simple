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
    // Enter a semi-random conference URL
    const conferenceUrl = 'https://alpha.jitsi.net/ztexfftt644';
    await window.locator('#jitsi-url').fill(conferenceUrl);

    // Click the Go button
    await window.locator('#go-button').click();

    // Wait for the iframe to be created by JitsiMeetExternalAPI
    // The API creates an iframe inside the jitsi-container
    const iframe = await window.locator('#jitsi-container iframe');
    
    // Verify the iframe is present and the title of the conference is visible on prejoin
    await expect(iframe).toBeAttached();
    await expect(iframe.contentFrame().getByText('Ztexfftt 644')).toBeVisible();
  });
});
