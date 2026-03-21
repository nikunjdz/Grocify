import { ClerkProvider } from "@clerk/clerk-expo";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import "../../global.css";

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return await SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey="pk_test_ZW1pbmVudC1weXRob24tNzAuY2xlcmsuYWNjb3VudHMuZGV2JA"
      tokenCache={tokenCache}
    >
      <Stack screenOptions={{ headerShown: false }} />
    </ClerkProvider>
  );
}