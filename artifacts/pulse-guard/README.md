# PulseGuard

PulseGuard is a privacy-first mobile security app built with React Native + Expo.
It uses open, transparent threat-intelligence APIs to scan URLs, IPs, domains
and file hashes, and includes additional tools for Wi-Fi safety, password
breach checks, and a privacy audit checklist.

## Cloud APIs used (no API keys required)

- **URLhaus** (abuse.ch) — live malware-distribution URL & host database
- **MalwareBazaar** (abuse.ch) — file-hash lookups
- **Have I Been Pwned** — Pwned Passwords k-anonymity API (your password
  never leaves the device)
- **ipapi.co** + **ipwho.is** — IP / network metadata for the Wi-Fi safety
  check

## Build an installable APK from GitHub

PulseGuard is a standard Expo project, so you can produce a signed APK using
**EAS Build** and host the artifact in a GitHub release.

### 1. One-time setup

```bash
# from the repo root, or from artifacts/pulse-guard
npm install -g eas-cli
eas login                    # use your free Expo account
cd artifacts/pulse-guard
eas init                     # links the project (creates eas project id)
```

### 2. Add an APK build profile

Create `artifacts/pulse-guard/eas.json` (or extend the file if it already
exists):

```json
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "preview": {
      "android": { "buildType": "apk" },
      "distribution": "internal"
    },
    "production": {
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

### 3. Build the APK

```bash
cd artifacts/pulse-guard
eas build -p android --profile preview
```

EAS will produce a downloadable `.apk` URL when the build finishes (typically
10–15 minutes on the free tier).

### 4. Publish to GitHub

1. Download the `.apk` from the EAS build page.
2. Create a new release in your GitHub repository.
3. Drag the `.apk` into the **Assets** section of the release and publish.
4. Users can install by enabling **Install unknown apps** on Android and
   tapping the downloaded `.apk`.

### Optional — automate with GitHub Actions

If you'd like every push to `main` to produce an APK and attach it to a
GitHub release, create `.github/workflows/release-apk.yml` with the EAS
GitHub Action and a `softprops/action-gh-release` step. (See
<https://docs.expo.dev/build/setting-up-ci/> for the latest workflow.)

## Local development inside Replit

The Expo dev server is wired up via the standard Replit Expo workflow.
Restart the `pulse-guard: expo` workflow and scan the QR code from the
Replit URL bar with Expo Go on your phone.
