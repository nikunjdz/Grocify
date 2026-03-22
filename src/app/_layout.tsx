import { ClerkProvider } from '@clerk/clerk-expo'
import { Slot } from 'expo-router'
import * as SecureStore from 'expo-secure-store'
import '../../global.css'

const tokenCache = {
  async getToken(key: string) {
    try {
      return await SecureStore.getItemAsync(key)
    } catch {
      return null
    }
  },
  async saveToken(key: string, value: string) {
    try {
      await SecureStore.setItemAsync(key, value)
    } catch {}
  },
  async deleteToken(key: string) {
    try {
      await SecureStore.deleteItemAsync(key)
    } catch {}
  },
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey="pk_test_ZW1pbmVudC1weXRob24tNzAuY2xlcmsuYWNjb3VudHMuZGV2JA"
      tokenCache={tokenCache}
    >
      <Slot />
    </ClerkProvider>
  )
}