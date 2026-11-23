# PLATO

PLATO is being built as an adaptive game for web, iOS, and Android. The first playable version will run locally against automatic bots; networking and accounts are intentionally not part of this setup.

## Stack

- Expo SDK 58, React Native, Expo Router, and TypeScript.
- Reanimated for UI motion and gestures.
- React Native Skia for custom table and card graphics where native drawing is useful.
- Rive's React Native runtime on iOS/Android and WebGL2 runtime on web.
- A plain TypeScript game core under `src/game`, independent of UI and device APIs.
- An infinite American card set: every draw independently samples one of 13 values and one of 4 suits.

## Run

Use pnpm 12.11.2 (declared in `package.json`). Install dependencies with `pnpm install`; CI should use `pnpm install --frozen-lockfile`. Keep `pnpm-lock.yaml` as the only dependency lockfile.

For Expo-compatible packages, use `pnpm exec expo install <package> --pnpm`. The pnpm configuration keeps a hoisted dependency layout for Expo and native tooling.

```sh
pnpm start        # Expo development client
pnpm run web      # Copy CanvasKit for Skia, then run in a browser
pnpm run start:go # Expo Go while the app does not load native Rive views
```

`pnpm run setup:skia-web` copies CanvasKit into `public/` for local web development. `pnpm run build:web` prepares CanvasKit and exports the web build.

After adding native Rive views, create a development build for a device or simulator:

```sh
pnpm run ios:build
pnpm run android:build
```

The native Rive runtime is not included in Expo Go. The project uses Continuous Native Generation; do not hand-edit generated `ios/` or `android/` folders.

## Validation

```sh
pnpm lint
pnpm typecheck
```

## Current state

The first local playable screen is in place: start with 1–7 randomly selected bots and play against risk-taking opponents, view the shared pot and your hand, and pass or wager. It runs without an account or backend. The selected art direction and layout contract are recorded in `DESIGN.md`. Rive is installed for future authored character and celebration animations; the first pass uses Skia and Reanimated so it can run in the web preview before custom `.riv` assets are made. Confirmed chat decisions in `PRODUCT.md` supersede conflicting Spanish-deck proposals in the source PRD.
