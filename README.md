# 🎙️ Notlok

**Real-time audio transcription app powered by Whisper AI**

Notlok is a cross-platform desktop application that provides real-time audio transcription with support for multiple languages, AI-powered meeting summaries, and advanced audio device management.

![Notlok Banner](public/icon.png)

> **⚠️ PROPRIETARY SOFTWARE**  
> This is a commercial product requiring a valid license key.  
> Get your license at [notlok.app](https://notlok.app)

## ✨ Features

- 🎯 **Real-time Transcription** - Live audio transcription using Whisper AI
- 🌍 **Multi-language Support** - Turkish, English, and auto-detection
- 🎤 **Advanced Audio Capture** - Both microphone and system audio
- 🔊 **Device Selection** - Choose your preferred input/output devices
- 🤖 **AI Reports** - Generate meeting summaries with Notlok AI or Gemini
- 📝 **Recording History** - Save and review past transcriptions
- 🔄 **Auto-updates** - Seamless update system
- 🔐 **License Management** - Secure licensing with LemonSqueezy
- 🎨 **Theme Support** - Light, dark, and system themes

## 🚀 Quick Start

### Prerequisites

- macOS 13.0+ (Apple Silicon or Intel)
- Windows 10+ (coming soon via GitHub Actions)
- Microphone and/or system audio access

### Installation

1. Download the latest release from [Releases](https://github.com/unkownpr/Notlok/releases)
2. Install the app:
   - **macOS**: Open the `.dmg` file and drag to Applications
   - **Windows**: Run the `.msi` or `.exe` installer
3. Launch Notlok
4. Enter your license key (get one at [notlok.app](https://notlok.app))
5. Grant microphone and screen recording permissions
6. Download your preferred Whisper model
7. Start recording! 🎉

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/unkownpr/Notlok.git
cd Notlok

# Install dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Build

```bash
# Build for your current platform
npm run tauri build

# For multi-platform builds, see GITHUB_ACTIONS_GUIDE.md
```

## 📦 Project Structure

```
notlok/
├── src/                    # React frontend
│   ├── App.tsx            # Main application
│   ├── App.css            # Styles
│   └── utils/             # Utilities
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── audio_capture/ # Audio recording
│   │   ├── transcription/ # Whisper integration
│   │   └── lib.rs         # Main Tauri code
│   └── swift/             # macOS Swift code
└── .github/workflows/     # CI/CD automation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

**This is proprietary software - NOT open source.**

Notlok is a commercial product that requires a valid license key to use. The source code is available for reference and contributions, but you may NOT:

- ❌ Use this software without a valid license
- ❌ Redistribute or sell copies
- ❌ Remove or modify license checks
- ❌ Create derivative commercial products

✅ You MAY contribute improvements via Pull Requests

**Get your license key at [notlok.app](https://notlok.app)**

## 🔗 Links

- **Website**: [notlok.app](https://notlok.app)
- **Issues**: [GitHub Issues](https://github.com/unkownpr/Notlok/issues)
- **Developer**: [ssilistre.dev](https://ssilistre.dev)

## 🙏 Acknowledgments

- [Whisper AI](https://github.com/openai/whisper) - Speech recognition
- [Tauri](https://tauri.app/) - Desktop app framework
- [React](https://react.dev/) - UI framework

---

Made with ❤️ by [ssilistre.dev](https://ssilistre.dev)
