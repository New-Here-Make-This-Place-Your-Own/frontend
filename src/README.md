# Source layout

- `app/`: Expo Router routes for authentication, email callback, onboarding, and the app tabs.
- `screens/`: screen UI; authentication and onboarding use the scoped V2 entry design.
- `providers/`: Supabase session lifecycle and persisted onboarding profile loading.
- `lib/`: validation, email callback/session handling, authenticated API requests, and regression tests.
- `components/`: shared form layout, route guards, buttons, cards, and place picker.
- `theme/tokens.ts`: colors, fonts, spacing, borders, and radii. Fonts load in the root layout.
- `theme/entry.ts`: V2 authentication and onboarding tokens; `entry-assets.ts` maps bundled Figma exports.

See the root README for environment configuration, email redirect allowlists, and verification steps.
The Explore tab and parts of the daily quest UI still contain starter/placeholder features outside
this authentication and onboarding slice.
