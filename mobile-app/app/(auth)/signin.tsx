import { router } from 'expo-router';
import { useEffect } from 'react';

export default function SignInScreen() {
  useEffect(() => {
    // Redirect to the unified auth screen
    router.replace('/(auth)');
  }, []);

  return null;
}
