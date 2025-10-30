# Building AutoBerapi

## Development

To run the app in development mode:

```bash
npm start
```

## Building for Distribution

### Build for Windows (.exe)

```bash
npm run build:win
```

This will create an installer in the `dist/` folder:
- `AutoBerapi Setup x.x.x.exe` - Installer for Windows

### Build for All Platforms

```bash
npm run build
```

### Build for Mac

```bash
npm run build:mac
```

### Build for Linux

```bash
npm run build:linux
```

## Distribution

After building, you'll find the distributable files in the `dist/` directory:

- **Windows**: `.exe` installer
- **Mac**: `.dmg` disk image
- **Linux**: `.AppImage` executable

## Icon

To use a custom icon, replace the placeholder `icon.png` with your own icon in these formats:
- `icon.ico` - Windows (256x256)
- `icon.icns` - macOS (1024x1024)
- `icon.png` - Linux (512x512)

You can use online tools like:
- https://icoconvert.com/ - Convert PNG to ICO
- https://cloudconvert.com/png-to-icns - Convert PNG to ICNS

## Publishing to GitHub

1. Create a new GitHub repository
2. Initialize git and push your code:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/autoberapi.git
git push -u origin main
```

3. Create a release with the built executables

## Notes

- The built app includes all necessary dependencies
- Puppeteer and Chromium are bundled with the app
- Users don't need Node.js installed to run the .exe
- First run may take a moment as Puppeteer downloads Chromium
