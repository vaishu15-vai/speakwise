---
name: AI provider fallback
description: The built-in AI provisioning path may require an account upgrade; direct provider access can be used only after securely collecting the provider key.
---

When managed AI provisioning cannot be enabled because the account needs an upgrade, use the secure secrets flow for the user’s own provider key and keep the key server-side. A provider response such as HTTP 429 may still mean the key has no quota or is rate-limited, not that the integration code is malformed.

**Why:** The managed AI setup can be unavailable independently of the app, and exposing or requesting a key in chat is unsafe.

**How to apply:** Check the managed AI setup first for AI apps; if it exits for upgrade, request the provider key securely once and surface provider quota errors clearly.