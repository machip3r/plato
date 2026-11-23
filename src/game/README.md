# Game core

Keep PLATO rules, turn sequencing, card/deck logic, bot decisions, and token accounting in this module as plain TypeScript. It must not import React Native, Expo, Skia, Reanimated, Rive, or storage APIs.

The app will call the same game core on web, iOS, and Android. A future online version can move authoritative command handling to a server while keeping these domain types and deterministic rules reusable.

Open game decisions are listed in `PRODUCT.md` and the source PRD. Do not resolve them implicitly while implementing the rules.
