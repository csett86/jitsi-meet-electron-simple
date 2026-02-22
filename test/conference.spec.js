import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';


test.describe('Jitsi Meet Conference Loading', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    electronApp = await electron.launch({ args: ['main.js', '--no-sandbox'] });
    window = await electronApp.firstWindow();
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should load conference from URL and create iframe via API', async () => {
    // Enter a semi-random conference URL
    const roomName = Math.random().toString(36).replace(/[0-9]/g, '').substring(1);
    const conferenceUrl = 'https://alpha.jitsi.net/'.concat(roomName);
    await window.locator('#jitsi-url').fill(conferenceUrl);

    // Click the Go button
    await window.locator('#go-button').click();

    // Wait for the iframe to be created by JitsiMeetExternalAPI
    // The API creates an iframe inside the jitsi-container
    const iframe = await window.locator('#jitsi-container iframe');
    
    // Verify the iframe is present and the title of the conference is visible on prejoin
    await expect(iframe).toBeAttached();
    await expect(iframe.contentFrame().getByText(roomName)).toBeVisible();
  });
});

test.describe('Protocol URL Handling', () => {
  let electronApp;
  let window;

  test.afterEach(async () => {
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('should handle jitsi-meet:// protocol URL and load conference', async () => {
    // Launch the app with a jitsi-meet:// protocol URL as a command line argument
    const roomName = Math.random().toString(36).replace(/[0-9]/g, '').substring(1);
    const protocolUrl = `jitsi-meet://alpha.jitsi.net/${roomName}`;

    electronApp = await electron.launch({
      args: ['main.js', '--no-sandbox', protocolUrl]
    });
    window = await electronApp.firstWindow();

    // The URL input should contain the converted https:// URL
    await expect(window.locator('#jitsi-url')).toHaveValue(`https://alpha.jitsi.net/${roomName}`);

    // Wait for the iframe to be created by JitsiMeetExternalAPI
    const iframe = window.locator('#jitsi-container iframe');

    // Verify the iframe is present and the title of the conference is visible on prejoin
    await expect(iframe).toBeAttached();
    await expect(iframe.contentFrame().getByText(roomName)).toBeVisible();
  });
});
