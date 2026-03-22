import { useAuth } from '@clerk/clerk-expo'
import { Redirect } from 'expo-router'
import { View } from 'react-native'

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return <View style={{ flex: 1, backgroundColor: '#1e4d2b' }} />

  if (isSignedIn) return <Redirect href="/" />

  return <Redirect href="/(auth)/sign-in" />
}