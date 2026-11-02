# ClubFree

> Free club officers from copywriting hell with AI.

ClubFree turns **one event brief** into the **full promo kit** a student club sends for every event, then **checks it** for the mistakes that slip through by hand.

## Why
Every week, club officers rewrite the same event info into a signup form, an announcement email, a Line post, an Instagram caption, a reminder, a feedback form and a thank-you email. Dates get the wrong weekday, a field gets invented, a `forms.gle/xxx` link goes out. ClubFree automates all of it.

## What it generates
| Output | Format |
|---|---|
| Signup form spec | numbered questions, type, required flag |
| Announcement email | email-safe HTML (table layout, inline styles, one primary CTA, Google Calendar link) |
| Line message | short, emoji |
| Instagram caption | with hashtags |
| Day-of reminder email | email-safe HTML |
| Post-event feedback form spec | |
| Thank-you email | email-safe HTML |

**Rule checker** flags: weekday that doesn't match the date, dates that differ from the brief, missing brief fields (must show as `待補` = "TBD", never invented), placeholder links, fees not in the brief, emails with ≠1 primary CTA or non-inline styles.

UI in **Traditional Chinese and English** (toggle top-right).

## Run
```bash
npm start            # http://localhost:3000 — demo mode, no key needed
npm test
XAI_API_KEY=xai-... XAI_MODEL=grok-4-fast npm start   # real Grok
```
No dependencies; Node 18+. Without `XAI_API_KEY` it runs a deterministic **demo mode** with realistic output; with a key it switches automatically to Grok.

## Tech stack
- Node.js built-in `http` server (zero npm dependencies) + vanilla HTML/JS frontend
- xAI Grok API via the OpenAI-compatible endpoint `https://api.x.ai/v1/chat/completions` (JSON mode)
- Deployable to any free Node host (Render, Railway, Fly.io) — start command `npm start`

## AI usage
Grok writes all seven outputs from a strict system prompt (no invented facts, `待補` for gaps, email-safe HTML rules). Then a **deterministic rule checker** (no AI) verifies the result, so the model's mistakes are caught instead of trusted. Development was assisted by an AI coding assistant.

## Credits
- [xAI Grok API](https://docs.x.ai/)
- Google Calendar event template links
- No third-party libraries.

Sample data (星火創新社 / Spark Innovation Club, speaker 林小晴) is **fictional**. No real member lists or emails are included.

## Team
Solo — a Taiwanese 3rd-year university student and student club officer.

Built for the Remote Control AI hackathon (Devpost); all code written during the event window.

License: MIT
