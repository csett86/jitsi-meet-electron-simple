# jitsi-meet-electron-simple
A simple electron app for jitsi meet

## Description
A minimal Electron-based desktop application for joining Jitsi Meet conferences. Features a simple interface with a URL input field and "Go" button to connect to any Jitsi Meet room.

## Installation
```bash
npm install
```

## Running the App
```bash
npm start
```

## Building the App
```bash
npm run build
```

The built application will be available in the `dist` folder.

## Usage
1. Launch the application
2. Enter a Jitsi Meet URL in the input field (e.g., `https://meet.jit.si/yourroom`)
3. Click the "Go" button or press Enter
4. The Jitsi conference will load in the window

## Dependencies
- electron: For the desktop application framework
- @jitsi/electron-sdk: For Jitsi Meet integration and screen sharing
- electron-builder: For building distributable packages

## Testing
```bash
npm test
```

The test suite includes an automated end-to-end test that:
1. Launches the Electron app
2. Enters a conference URL
3. Clicks the "Go" button
4. Verifies that the conference loads successfully via the JitsiMeetExternalAPI

The tests use Playwright for Electron to automate the application testing. On Linux systems without a display server, the tests automatically run with xvfb (X virtual framebuffer).
