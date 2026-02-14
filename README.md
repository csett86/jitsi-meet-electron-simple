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
