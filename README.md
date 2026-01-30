# Lossless Ghost (Spicetify Extension)

Hides the **“Lossless”** badge/label in Spotify’s **bottom-left Now Playing widget**.

Website: https://pasme.dev

## What it does
- Removes the visible **Lossless** badge in the Now Playing widget (bottom-left)
- Scoped to the Now Playing widget only (no global UI side effects)
- Robust against Spotify UI re-renders (MutationObserver-based)

## Install
1) Download `lossless-ghost.js`
2) Put it into your Spicetify Extensions folder:

- **Windows:** `%appdata%\spicetify\Extensions\`
- **macOS:** `~/.config/spicetify/Extensions/`
- **Linux:** `~/.config/spicetify/Extensions/`

Tip:
```bash
spicetify config-dir
```

3) Enable + apply:
```bash
spicetify config extensions lossless-ghost.js
spicetify apply
```

## Update
Replace `lossless-ghost.js`, then:
```bash
spicetify apply
# if Spotify didn't reload:
spicetify restart
```

## Uninstall / Disable
```bash
spicetify config extensions lossless-ghost.js-
spicetify apply
```

## Notes
- This extension matches the badge by its visible label text ("Lossless").
- If Spotify changes the label, update the label match in `lossless-ghost.js`.

## License
MIT
