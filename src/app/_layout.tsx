import { ClerkProvider } from '@clerk/clerk-expo';
import { Stack } from 'expo-router';
import '../../global.css';
import { tokenCache } from '../lib/token-cache';
import { ThemeProvider } from '../context/ThemeContext';   // ← Add this

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default function RootLayout() {
  if (!publishableKey) {
    throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in the app environment.');
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider>                    {/* ← Wrap everything with ThemeProvider */}
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </ClerkProvider>
  );
}