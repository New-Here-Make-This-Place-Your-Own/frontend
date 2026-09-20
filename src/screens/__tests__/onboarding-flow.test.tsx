import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { beforeEach, expect, jest, test } from '@jest/globals';
import { OnboardingPersonalizeScreen } from '../OnboardingPersonalizeScreen';
import { PlacePicker } from '@/components/PlacePicker';
import { PrimaryButton } from '@/components/PrimaryButton';
import { EntryBack } from '@/components/EntryUI';
import { submitOnboarding } from '@/lib/backend';
import { useProfile } from '@/providers/profile-provider';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() }, useFocusEffect: jest.fn() }));
jest.mock('expo-image', () => ({ Image: 'Image' }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('@/components/PlacePicker', () => ({ PlacePicker: 'PlacePicker' }));
jest.mock('@/providers/profile-provider', () => ({ useProfile: jest.fn() }));
jest.mock('@/lib/backend', () => ({ submitOnboarding: jest.fn(), deviceTimezone: () => 'Indian/Mauritius' }));
const reload = jest.fn<() => Promise<void>>();
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useProfile).mockReturnValue({ profile: null, error: '', loading: false, reload });
});
test('onboarding validates details, keeps drafts on back, retries failure and shows completion only after save', async () => {
  let view!: ReactTestRenderer;
  await act(async () => { view = create(<OnboardingPersonalizeScreen />); });
  expect(view.root.findByType(PrimaryButton).props.disabled).toBe(true);
  await act(async () => { view.root.findByType(PlacePicker).props.onSelect({ name: 'Port Louis', country: 'Mauritius', latitude: -20.16, longitude: 57.5 }); });
  await act(async () => { view.root.findByType(PrimaryButton).props.onPress(); });
  await act(async () => { view.root.findByType(PrimaryButton).props.onPress(); });
  expect(submitOnboarding).not.toHaveBeenCalled();
  expect(JSON.stringify(view.toJSON())).toContain('Please enter your first and last name.');
  for (const [label, value] of [['First name', 'A'], ['Last name', 'B'], ['Birth day', '31'], ['Birth month', '2'], ['Birth year', '2000']]) {
    await act(async () => { view.root.findAllByProps({ accessibilityLabel: label }).find(node => node.props.onChangeText)!.props.onChangeText(value); });
  }
  await act(async () => { view.root.findByType(PrimaryButton).props.onPress(); });
  expect(JSON.stringify(view.toJSON())).toContain('Enter a real date of birth');
  await act(async () => { view.root.findAllByProps({ accessibilityLabel: 'Birth day' }).find(node => node.props.onChangeText)!.props.onChangeText('29'); });
  await act(async () => { view.root.findByType(PrimaryButton).props.onPress(); });
  await act(async () => { view.root.findByType(EntryBack).props.onPress(); });
  expect(view.root.findAllByProps({ accessibilityLabel: 'First name' }).find(node => node.props.onChangeText)!.props.value).toBe('A');
  await act(async () => { view.root.findByType(PrimaryButton).props.onPress(); });
  await act(async () => { view.root.findAllByProps({ accessibilityLabel: 'Food & Markets' }).find(node => node.props.onPress)!.props.onPress(); });
  jest.mocked(submitOnboarding).mockRejectedValueOnce(new Error('Network unavailable'));
  await act(async () => { await view.root.findByType(PrimaryButton).props.onPress(); });
  expect(JSON.stringify(view.toJSON())).toContain('Network unavailable');
  expect(reload).not.toHaveBeenCalled();
  jest.mocked(submitOnboarding).mockResolvedValueOnce({ city_id: 'city', city_name: 'Port Louis', city_status: 'initializing' });
  await act(async () => { await view.root.findByType(PrimaryButton).props.onPress(); });
  expect(submitOnboarding).toHaveBeenLastCalledWith(expect.objectContaining({ date_of_birth: '2000-02-29', interests: ['food', 'culture'], place_name: 'Port Louis' }));
  expect(JSON.stringify(view.toJSON())).toContain('Your map is waiting.');
  expect(JSON.stringify(view.toJSON())).not.toContain('Your first two quests are ready');
  expect(reload).not.toHaveBeenCalled();
  await act(async () => { await view.root.findByType(PrimaryButton).props.onPress(); });
  expect(reload).toHaveBeenCalledTimes(1);
  await act(async () => { view.unmount(); });
}, 30000);
