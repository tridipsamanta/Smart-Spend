export type Gender = 'male' | 'female' | 'other' | 'prefer-not-to-say';

export interface UserProfile {
  name: string;
  age: number | null;
  gender: Gender | null;
  profilePicture: string | null; // Base64 encoded image
  createdAt: string;
}

export const DEFAULT_PROFILE: UserProfile = {
  name: 'SmartSpend User',
  age: null,
  gender: null,
  profilePicture: null,
  createdAt: new Date().toISOString(),
};
