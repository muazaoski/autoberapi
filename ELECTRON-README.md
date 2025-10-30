# AutoBerapi - Desktop App

A dark minimalist desktop application to automate TikTok DM sending for maintaining streaks.

## Features

- **Dark Minimalist UI** - Clean, modern interface with smooth animations
- **Easy Configuration** - Simple form to set up your credentials and message
- **Live Console** - Real-time logging of bot activities
- **Headless Mode** - Run with or without browser window
- **Cross-Platform** - Works on Windows, macOS, and Linux

## Quick Start

### 1. Development Mode

```bash
npm install
npm start
```

### 2. Build Executable

#### Windows (.exe)
```bash
npm run build:win
```

The installer will be created in `dist/AutoBerapi Setup x.x.x.exe`

#### macOS (.dmg)
```bash
npm run build:mac
```

#### Linux (.AppImage)
```bash
npm run build:linux
```

## Using the App

1. **Launch the app** - Double click the .exe or run `npm start`
2. **Enter your credentials**:
   - TikTok Username
   - TikTok Password
   - Target Username (who you're messaging)
   - Message (optional, defaults to a streak message)
3. **Configure headless mode** - Check/uncheck based on preference
4. **Save Config** - Saves your settings locally
5. **Run Bot** - Starts the automation process
6. **Monitor Console** - Watch real-time logs of the bot's activities

## UI Features

- **Status Indicator** - Shows current bot status (Ready/Running/Error)
- **Live Console** - Color-coded output for different log types
- **Persistent Config** - Your settings are saved between sessions
- **Clear Console** - Clean up logs when needed
- **Responsive Design** - Adapts to different window sizes

## Security

- All credentials are stored locally in a `.env` file
- No data is sent to external servers
- The app only communicates with TikTok directly
- Never commit your `.env` file to version control

## Publishing

### GitHub Release

1. Build the executables for your target platforms
2. Create a new release on GitHub
3. Upload the built files from the `dist/` folder
4. Add release notes and version information

### Distribution Notes

- Users don't need Node.js installed
- Puppeteer and Chromium are bundled with the app
- First run may take a moment as dependencies initialize
- The .exe file is standalone and portable

## Customization

### Custom Icon

Replace `icon.png` (and create `icon.ico` for Windows) with your own:
- Windows: 256x256 .ico file
- macOS: 1024x1024 .icns file
- Linux: 512x512 .png file

### UI Theming

Edit `renderer/styles.css` to customize:
- Colors (CSS variables in `:root`)
- Typography
- Layout and spacing
- Animations

### Features

Add new features by:
1. Updating `renderer/index.html` for UI
2. Adding handlers in `renderer/renderer.js`
3. Creating IPC handlers in `main.js`

## Troubleshooting

### App won't start
- Make sure Node.js is installed (for development)
- Run `npm install` to install dependencies
- Check console for error messages

### Build fails
- Ensure electron-builder is installed
- Check that all paths in package.json are correct
- For Windows builds, you may need Visual Studio Build Tools

### Bot fails to run
- Check your TikTok credentials
- Try running with headless mode OFF to see what's happening
- TikTok may require CAPTCHA verification
- Check the console output for specific errors

## Disclaimer

This bot is for personal use and educational purposes. Automating TikTok interactions may violate their Terms of Service. Use at your own risk.

---

Built with Electron, Puppeteer, and love 💜
