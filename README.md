# jitsi-meet-electron-simple

## Description
A minimal Electron-based desktop application for joining Jitsi Meet conferences. Features a simple interface with a URL input field and "Go" button to connect to any Jitsi Meet room.

## Download

Download the latest release:

- **macOS**: [jitsi-meet-simple.dmg](https://github.com/csett86/jitsi-meet-electron-simple/releases/latest/download/jitsi-meet-simple.dmg)
- **Windows**: [jitsi-meet-simple.exe](https://github.com/csett86/jitsi-meet-electron-simple/releases/latest/download/jitsi-meet-simple.exe)
- **Linux (x86_64)**: [jitsi-meet-simple-x86_64.AppImage](https://github.com/csett86/jitsi-meet-electron-simple/releases/latest/download/jitsi-meet-simple-x86_64.AppImage)
- **Linux (arm64)**: [jitsi-meet-simple-arm64.AppImage](https://github.com/csett86/jitsi-meet-electron-simple/releases/latest/download/jitsi-meet-simple-arm64.AppImage)

## Usage
1. Launch the application
2. Enter a Jitsi Meet URL in the input field (e.g., `https://meet.jit.si/yourroom`)
3. Click the "Go" button or press Enter
4. The Jitsi conference will load in the window

## Features
- Join Jitsi Meet
- Support screen sharing, if possible with native screensharing pickers (macOS 15+, Linux Wayland)
- otherwise only the first screen is shared full-screen
- Light mode and dark mode

## Development and Testing
```bash
npm test
```

The tests use Playwright for Electron to automate the application testing.
In CI / headless systems, use ```npm run test:ci``` to run the tests inside xvfb.
