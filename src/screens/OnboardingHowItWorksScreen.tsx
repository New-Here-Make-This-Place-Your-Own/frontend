// Keep existing deep links working; the V2 introduction now includes these concepts.
import { Redirect } from 'expo-router';
export function OnboardingHowItWorksScreen() { return <Redirect href="/(onboarding)/personalize" />; }
