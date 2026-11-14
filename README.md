# NeuroPath

Privacy-first surgical referral and consult-prep platform, built for the #BuildHybridAI 2026 hackathon.

> **Research prototype. Not a medical device. Not for diagnosis or treatment. Use synthetic data only.**

## What it does
A patient describes their condition by voice or text. NeuroPath removes personal identifiers **on-device** (Gemini Nano), then builds a surgeon-ready brief in the cloud: timeline, red flags, urgency, **missing-information list**, and questions for the surgeon. The patient approves what is saved to Firestore.

Roles: patient, referring doctor, surgeon (MVP). Roadmap: nurses, radiology, anesthesia, education mode, payments, referrals.

## Firebase AI Logic (hybrid)
- `src/ai.js` creates `PREFER_ON_DEVICE` and `ONLY_IN_CLOUD` models through `firebase/ai`.
- Step 1 (on-device when available): strip identifiers.
- Step 2 (cloud): structured case brief.
- App Check is initialised in `src/firebase.js` (debug token in dev).

## Run it
1. Chrome desktop v139+, enable `chrome://flags/#prompt-api-for-gemini-nano-multimodal-input`, restart.
2. Create a Firebase project, enable **AI Logic** (Gemini Developer API), Firestore, and Anonymous Auth. Register App Check (reCAPTCHA v3).
3. `cp .env.example .env` and fill in your keys.
4. `npm install && npm run dev`
5. Deploy `firebase/firestore.rules`.

## Design
Brand tokens live in `src/styles/tokens.css` (Deep Teal + Amber). Logo: `public/neuropath-logo.svg`.

## License
MIT. See `LICENSE`.