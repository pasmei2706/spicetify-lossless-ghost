# Changelog
All notable changes to this project will be documented in this file.

## [1.1.0] - 2026-10-22
### Fixed
- Detect the Lossless badge when Spotify renders it as plain text or an accessible label, not only as a button.
- Support multiple Now Playing widget selectors while keeping matching scoped to that widget.
- Avoid hiding a larger track button when it contains the badge alongside title or artist text.
### Improved
- Clarify Spotify and Spicetify search terms, features, Marketplace discovery, and recovery after Spotify updates in the README.
- Add relevant Marketplace tags to the manifest.
### Verified
- Node.js syntax and manifest JSON checks pass.
- Local DOM smoke tests pass for buttons, plain text, accessible labels, and track metadata safety.
- Live Spotify verification on Windows with Spotify 1.3.6.1921 and Spicetify 2.46.2: the extension loaded and hid one Lossless label.

## [1.0.0] - 2026-01-30
### Added
- Initial release of Lossless Ghost.
- Hide the “Lossless” badge in Spotify’s bottom-left Now Playing widget.
- Robust DOM detection with MutationObserver.
- Scoped behavior limited to the Now Playing widget.
- Console logging with [Lossless Ghost] prefix.
### Technical
- Text-based badge detection for UI stability.
- Re-render resilience for Spotify UI updates.
