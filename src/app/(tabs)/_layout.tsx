import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { Redirect, Tabs } from 'expo-router'
import { useColorScheme } from 'react-native'

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  if (!isLoaded) return null
  if (!isSignedIn) return <Redirect href="/(auth)/sign-in" />

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1a2e1e' : '#ffffff',
          borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
          paddingBottom: 8,
          height: 62,
        },
        tabBarActiveTintColor: isDark ? '#4ade80' : '#16a34a',
        tabBarInactiveTintColor: isDark ? 'rgba(255,255,255,0.4)' : '#9ca3af',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'List',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}