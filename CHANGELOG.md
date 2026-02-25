# Changelog

All notable changes to Notlok will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.6] - 2025-01-26

### Fixed
- 🔧 Fixed macOS DMG "damaged" error by enabling code signing
- ✅ Added `signingIdentity: "-"` for ad-hoc signing
- ✅ Enabled `hardenedRuntime: true` for better security

### Added
- 📝 Added comprehensive macOS build guide (`BUILD_MACOS.md`)
- 🔐 Added notarization script (`notarize.sh`)
- 📚 Added Flowglad integration guide (`FLOWGLAD_INTEGRATION_GUIDE.md`)

### Changed
- 🔨 Updated Tauri config for proper macOS code signing

## [2.0.5] - 2025-01-25

### Previous Release
- Full AI-powered transcription
- LemonSqueezy license integration
- Freemium model (60s recording limit for free users)
- Premium features: unlimited recording, AI reports, history
- Multi-language support (Turkish & English)
- Whisper & Parakeet model support

---

## Version Format

`MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

## Links

- [GitHub Releases](https://github.com/ssilistre/notlok/releases)
- [Website](https://notlok.app)
- [Documentation](https://notlok.app/docs)

