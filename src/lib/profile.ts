export type Profile = {
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  city_id: string | null;
  interests: string[];
  timezone?: string;
};
export function isOnboardingComplete(profile: Profile | null): boolean {
  return Boolean(profile?.first_name?.trim() && profile.last_name?.trim() && profile.date_of_birth && profile.city_id);
}
