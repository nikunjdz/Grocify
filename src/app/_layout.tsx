import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
      <StatusBar style="auto" />
    </>
  );
}