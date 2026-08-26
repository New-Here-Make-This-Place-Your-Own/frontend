# New Here — Screens from Figma

5 screens, styled from your Figma file, wired to the real backend where
endpoints already exist. These are **reference components** — drop them
into your existing `expo-router` routes rather than replacing your project
structure.

## What's here

```
theme/tokens.ts              Design tokens pulled from Figma (colors, fonts, radii, shadows)
components/PrimaryButton.tsx Shared gradient CTA button
components/Card.tsx          Shared bordered card (plain or gradient)
components/Chip.tsx          Toggleable preference tag
components/PlacePicker.tsx   Typeahead place picker (from earlier work)
screens/OnboardingWelcomeScreen.tsx
screens/OnboardingHowItWorksScreen.tsx
screens/OnboardingPersonalizeScreen.tsx   <- wired to POST /users/onboarding
screens/LoginSignupScreen.tsx             <- styling reference only, see note below
screens/DailyHomeScreen.tsx               <- wired to GET /quests/daily
```

## One real design gap, and the call I made

The Figma **personalize** screen only has interest tags — no fields for
name, date of birth, or place, even though your onboarding API requires
all three. Rather than design a new screen that isn't in your Figma file,
I added those fields to the top of the personalize screen, styled to
match the existing input pattern from the login screen. Worth a look to
confirm that's the flow you want before you build more screens around it.

## Login screen — don't replace your working auth

`LoginSignupScreen.tsx` is styling only. You already have working Supabase
email/password auth (`auth-provider.tsx`, the SecureStore adapter, the
`getSession()` flow) from earlier in this build — pull the JSX and
`StyleSheet` into your existing login screen rather than swapping out the
logic. It takes an `onSubmit(email, password)` prop so you wire your real
`supabase.auth.signInWithPassword` call in.

## Required installs

```bash
npx expo install expo-linear-gradient lucide-react-native react-native-safe-area-context
npx expo install @expo-google-fonts/outfit @expo-google-fonts/lora expo-font
```

(`expo-location` should already be installed from the PlacePicker work.)

## Font loading

Add to your root `_layout.tsx`, before rendering anything else:

```tsx
import { useFonts, Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import { Lora_400Regular, Lora_400Regular_Italic } from '@expo-google-fonts/lora';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Lora_400Regular,
    Lora_400Regular_Italic,
  });

  if (!fontsLoaded) return null; // or a loading screen

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
```

## Wiring into your routes

Given your existing structure (`src/app`, with `/(auth)/login` and
`/(app)` already referenced in your redirect logic), the natural mapping:

```
src/app/(onboarding)/welcome.tsx        -> renders <OnboardingWelcomeScreen />
src/app/(onboarding)/how-it-works.tsx   -> renders <OnboardingHowItWorksScreen />
src/app/(onboarding)/personalize.tsx    -> renders <OnboardingPersonalizeScreen />
src/app/(app)/index.tsx                 -> renders <DailyHomeScreen />
```

Each screen file is a one-liner, e.g.:

```tsx
// src/app/(onboarding)/welcome.tsx
export { OnboardingWelcomeScreen as default } from '../../screens/OnboardingWelcomeScreen';
```

(adjust the relative path to wherever you place the `screens/` folder).

## Bottom navigation

Not included in `DailyHomeScreen` on purpose — the 4-tab bottom nav (Home,
Map, Camera, Profile) shown in the Figma mock is standard expo-router tab
navigation territory (`(app)/_layout.tsx` using `Tabs` from
`expo-router`), not something to hand-roll inside each screen. Set that up
once at the layout level and every screen under `(app)` gets it for free.

## Placeholder images

Two decorative content photos (the onboarding polaroid illustration, the
home-screen avatar) are left as solid placeholder blocks rather than
pulled from Figma's temporary asset URLs (which expire in ~7 days and
aren't meant to ship anyway). Swap in real assets when you have them —
search for `polaroidPhoto` and `avatar` in the style sheets.

## Not built yet

- Curator quest card on `DailyHomeScreen` is static/locked — wire it to
  `GET /quests/curator` once that endpoint exists (next backend slice).
- `pin-drop-reflection`, `interactive-map`, `camera-capture-screen`, and
  `sunday-unfold-screen` weren't pulled from Figma this round — ask
  whenever you're ready for those, same process.
