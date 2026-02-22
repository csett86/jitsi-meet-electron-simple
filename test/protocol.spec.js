import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';


test.describe('Protocol URL Handling', () => {
  test('should convert jitsi-meet:// protocol URL to https:// and load conference', async () => {
    const roomName = Math.random().toString(36).replace(/[0-9]/g, '').substring(1);
    const protocolUrl = `jitsi-meet://alpha.jitsi.net/${roomName}`;

    const electronApp = await electron.launch({
      args: ['main.js', '--no-sandbox', protocolUrl]
    });
    const window = await electronApp.firstWindow();

    try {
      // Verify the URL input has the converted https:// URL
      const urlInput = window.locator('#jitsi-url');
      await expect(urlInput).toHaveValue(`https://alpha.jitsi.net/${roomName}`);

      // Verify the conference iframe is created
      const iframe = window.locator('#jitsi-container iframe');
      await expect(iframe).toBeAttached();
      await expect(iframe.contentFrame().getByText(roomName)).toBeVisible();
    } finally {
      await electronApp.close();
    }
  });
});
