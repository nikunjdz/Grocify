import { useAuth, useSignIn, useOAuth } from '@clerk/clerk-expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
  Image,
  ScrollView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignInPage() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const { isSignedIn } = useAuth()
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: 'oauth_google' })
  const { startOAuthFlow: githubAuth } = useOAuth({ strategy: 'oauth_github' })
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: 'oauth_apple' })
  const router = useRouter()

  const [showEmailForm, setShowEmailForm] = React.useState(false)
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleEmailSignIn = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.replace('/(home)' as Href)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    try {
      const { createdSessionId, setActive: sa } = await googleAuth()
      if (createdSessionId) {
        await sa!({ session: createdSessionId })
        router.replace('/(home)' as Href)
      }
    } catch {
      setError('Google sign in failed')
    }
  }

  const handleGithub = async () => {
    try {
      const { createdSessionId, setActive: sa } = await githubAuth()
      if (createdSessionId) {
        await sa!({ session: createdSessionId })
        router.replace('/(home)' as Href)
      }
    } catch {
      setError('GitHub sign in failed')
    }
  }

  const handleApple = async () => {
    try {
      const { createdSessionId, setActive: sa } = await appleAuth()
      if (createdSessionId) {
        await sa!({ session: createdSessionId })
        router.replace('/(home)' as Href)
      }
    } catch {
      setError('Apple sign in failed')
    }
  }

  if (isSignedIn) return null

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={s.heroSection}>
          <Text style={s.appName}>GROCIFY</Text>
          <Text style={s.tagline}>Plan smarter. Shop happier.</Text>
          <View style={s.heroImageBox}>
            <Image
              source={require('../../../assets/images/grocify-hero.png')}
              style={s.heroImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Card */}
        <View style={s.card}>
          <Text style={s.welcomeLabel}>WELCOME BACK</Text>
          <Text style={s.welcomeSubtitle}>
            Choose a social provider and jump right into your personalized grocery experience.
          </Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Google */}
          <Pressable
            style={({ pressed }) => [s.oauthBtn, pressed && s.pressed]}
            onPress={handleGoogle}
          >
            <Image
              source={require('../../../assets/images/google_logo.png')}
              style={s.oauthIcon}
            />
            <Text style={s.oauthBtnText}>Continue with Google</Text>
            <Text style={s.chevron}>›</Text>
          </Pressable>

          {/* GitHub */}
          <Pressable
            style={({ pressed }) => [s.oauthBtn, pressed && s.pressed]}
            onPress={handleGithub}
          >
            <Image
              source={require('../../../assets/images/github-logo.png')}
              style={s.oauthIcon}
            />
            <Text style={s.oauthBtnText}>Continue with GitHub</Text>
            <Text style={s.chevron}>›</Text>
          </Pressable>

          {/* Apple - iOS only */}
          {Platform.OS === 'ios' && (
            <Pressable
              style={({ pressed }) => [s.oauthBtn, s.appleBtn, pressed && s.pressed]}
              onPress={handleApple}
            >
              <Image
                source={require('../../../assets/images/apple-logo.png')}
                style={s.oauthIcon}
              />
              <Text style={s.appleBtnText}>Continue with Apple</Text>
              <Text style={s.chevronDark}>›</Text>
            </Pressable>
          )}

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          {/* Email Toggle */}
          {!showEmailForm ? (
            <Pressable
              style={({ pressed }) => [s.emailToggleBtn, pressed && s.pressed]}
              onPress={() => setShowEmailForm(true)}
            >
              <Text style={s.emailToggleText}>Continue with Email</Text>
            </Pressable>
          ) : (
            <View>
              <TextInput
                style={s.input}
                autoCapitalize="none"
                value={emailAddress}
                placeholder="Enter email"
                placeholderTextColor="rgba(255,255,255,0.4)"
                onChangeText={setEmailAddress}
                keyboardType="email-address"
              />
              <TextInput
                style={s.input}
                value={password}
                placeholder="Enter password"
                placeholderTextColor="rgba(255,255,255,0.4)"
                secureTextEntry
                onChangeText={setPassword}
              />
              <Pressable
                style={({ pressed }) => [
                  s.signInBtn,
                  (!emailAddress || !password || loading) && s.btnDisabled,
                  pressed && s.pressed,
                ]}
                onPress={handleEmailSignIn}
                disabled={!emailAddress || !password || loading}
              >
                <Text style={s.signInBtnText}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </Text>
              </Pressable>
              <Pressable style={s.forgotRow}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </Pressable>
            </View>
          )}

          {/* Terms */}
          <Text style={s.terms}>
            By continuing, you agree to our{' '}
            <Text style={s.termsLink}>Terms</Text>
            {' '}and{' '}
            <Text style={s.termsLink}>Privacy Policy</Text>.
          </Text>

          {/* Sign Up */}
          <View style={s.signUpRow}>
            <Text style={s.signUpText}>Don't have an account? </Text>
            <Link href="/sign-up">
              <Text style={s.signUpLink}>Sign up</Text>
            </Link>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const GREEN = '#1e4d2b'
const WHITE = '#ffffff'
const WHITE_DIM = 'rgba(255,255,255,0.7)'
const WHITE_FAINT = 'rgba(255,255,255,0.15)'
const GREEN_CARD = 'rgba(255,255,255,0.08)'

const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: GREEN,
  },
  scroll: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  heroSection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingHorizontal: 24,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: 4,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: WHITE_DIM,
    marginBottom: 20,
  },
  heroImageBox: {
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: 240,
    backgroundColor: 'transparent',
  },
  card: {
    marginHorizontal: 16,
    backgroundColor: GREEN_CARD,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: WHITE_FAINT,
  },
  welcomeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: WHITE_DIM,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: WHITE_DIM,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.4)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 13,
    textAlign: 'center',
  },
  oauthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE_FAINT,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  appleBtn: {
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  pressed: {
    opacity: 0.75,
  },
  oauthIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  oauthBtnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },
  appleBtnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  chevron: {
    fontSize: 22,
    color: WHITE_DIM,
  },
  chevronDark: {
    fontSize: 22,
    color: '#00000055',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: WHITE_FAINT,
  },
  dividerText: {
    marginHorizontal: 12,
    color: WHITE_DIM,
    fontSize: 12,
  },
  emailToggleBtn: {
    borderWidth: 1.5,
    borderColor: WHITE_FAINT,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  emailToggleText: {
    color: WHITE,
    fontWeight: '600',
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: WHITE_FAINT,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    marginBottom: 12,
    color: WHITE,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  signInBtn: {
    backgroundColor: '#4ade80',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  signInBtnText: {
    color: GREEN,
    fontWeight: '700',
    fontSize: 15,
  },
  forgotRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  forgotText: {
    color: WHITE_DIM,
    fontSize: 13,
  },
  terms: {
    fontSize: 12,
    color: WHITE_DIM,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  termsLink: {
    color: WHITE,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  signUpText: {
    color: WHITE_DIM,
    fontSize: 14,
  },
  signUpLink: {
    color: '#4ade80',
    fontWeight: '600',
    fontSize: 14,
  },
})