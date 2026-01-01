import { useState, useEffect } from 'react';
import { UserProfile, DEFAULT_PROFILE } from '@/types/profile';

const PROFILE_STORAGE_KEY = 'smartspend_user_profile';

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from localStorage on mount
  useEffect(() => {
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (storedProfile) {
      try {
        setProfileState(JSON.parse(storedProfile));
      } catch (error) {
        console.error('Failed to parse profile:', error);
        setProfileState(DEFAULT_PROFILE);
      }
    }
    setIsLoading(false);
  }, []);

  const updateProfile = (updates: Partial<UserProfile>) => {
    const updatedProfile = { ...profile, ...updates };
    setProfileState(updatedProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
  };

  return {
    profile,
    updateProfile,
    isLoading,
  };
}
