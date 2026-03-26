import { useSignUp, useAuth } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const { isSignedIn } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [verifyLoading, setVerifyLoading] = React.useState(false)

  React.useEffect(() => {
    if (isSignedIn) router.replace('/(tabs)')
  }, [isSignedIn])

  const handleSubmit = async () => {
    if (!isLoaded) return
    if (!firstName.trim()) { setError('First name is required'); return }
    if (!emailAddress.trim()) { setError('Email is required'); return }
    if (!password) { setError('Password is required'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    setError('')
    try {
      await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: emailAddress.trim().toLowerCase(),
        password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      console.log('SIGNUP ERROR:', JSON.stringify(err, null, 2))
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Sign up failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!isLoaded || verifyLoading) return
    if (code.trim().length < 6) { setError('Please enter the 6-digit code'); return }

    setVerifyLoading(true)
    setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() })

      console.log('VERIFY RESULT status:', result.status)
      console.log('VERIFY RESULT createdSessionId:', result.createdSessionId)

      // Handle all possible complete states
      if (
        result.status === 'complete' ||
        result.createdSessionId != null
      ) {
        await setActive({ session: result.createdSessionId })
        router.replace('/(tabs)')
        return
      }

      // If still missing requirements, check what's left
      if (result.status === 'missing_requirements') {
        console.log('Missing fields:', result.missingFields)
        console.log('Unverified fields:', result.unverifiedFields)
        setError(`Almost done! Missing: ${result.missingFields?.join(', ') || 'unknown'}`)
        return
      }

      setError(`Unexpected status: ${result.status}. Please try again.`)
    } catch (err: any) {
      console.log('VERIFY ERROR:', JSON.stringify(err, null, 2))
      const msg =
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Invalid code. Please try again.'
      if (msg.toLowerCase().includes('already been verified')) {
        router.replace('/(tabs)')
        return
      }
      setError(msg)
    } finally {
      setVerifyLoading(false)
    }
  }

  const resendCode = async () => {
    if (!isLoaded) return
    setError('')
    setCode('')
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
    } catch {
      setError('Failed to resend code. Please try again.')
    }
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4ade80" />
      </SafeAreaView>
    )
  }

  /* ─────────────── VERIFICATION SCREEN ─────────────── */
  if (pendingVerification) {
    return (
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView
            contentContainerStyle={s.centeredScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={s.emailCircle}>
              <Text style={s.emailIcon}>📧</Text>
            </View>

            <Text style={s.title}>Check your email</Text>
            <Text style={s.subtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={s.highlight}>{emailAddress}</Text>
            </Text>

            {error ? (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            ) : null}

            <TextInput
              style={s.codeInput}
              value={code}
              placeholder="• • • • • •"
              placeholderTextColor="rgba(255,255,255,0.25)"
              onChangeText={(text) => { setCode(text.replace(/[^0-9]/g, '')); setError('') }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textContentType="oneTimeCode"
            />

            <Pressable
              style={({ pressed }) => [
                s.verifyBtn,
                (verifyLoading || code.length < 6) && s.btnDisabled,
                pressed && s.pressed,
              ]}
              onPress={handleVerify}
              disabled={verifyLoading || code.length < 6}
            >
              <View style={s.btnInner}>
                {verifyLoading ? (
                  <ActivityIndicator color="#1e4d2b" />
                ) : (
                  <>
                    <Text style={s.btnIcon}>✓</Text>
                    <Text style={s.btnText}>Verify & Continue</Text>
                  </>
                )}
              </View>
            </Pressable>

            <View style={s.linkRow}>
              <Pressable style={({ pressed }) => [s.linkBtn, pressed && s.pressed]} onPress={resendCode}>
                <Text style={s.linkText}>Resend code</Text>
              </Pressable>
              <Text style={s.linkDot}>·</Text>
              <Pressable
                style={({ pressed }) => [s.linkBtn, pressed && s.pressed]}
                onPress={() => { setPendingVerification(false); setCode(''); setError('') }}
              >
                <Text style={s.linkText}>Wrong email? Go back</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  /* ─────────────── SIGN UP SCREEN ─────────────── */
  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={s.appName}>GROCIFY</Text>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Sign up to get started today</Text>

          {error ? (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={s.nameRow}>
            <TextInput
              style={[s.input, s.halfInput]}
              autoCapitalize="words"
              value={firstName}
              placeholder="First Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              onChangeText={(t) => { setFirstName(t); setError('') }}
            />
            <TextInput
              style={[s.input, s.halfInput]}
              autoCapitalize="words"
              value={lastName}
              placeholder="Last Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              onChangeText={(t) => { setLastName(t); setError('') }}
            />
          </View>

          <TextInput
            style={s.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email address"
            placeholderTextColor="rgba(255,255,255,0.4)"
            onChangeText={(t) => { setEmailAddress(t); setError('') }}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <TextInput
            style={s.input}
            value={password}
            placeholder="Password (min 8 characters)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            onChangeText={(t) => { setPassword(t); setError('') }}
            textContentType="newPassword"
          />
          <TextInput
            style={s.input}
            value={confirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            onChangeText={(t) => { setConfirmPassword(t); setError('') }}
            textContentType="newPassword"
          />

          <Pressable
            style={({ pressed }) => [
              s.signUpBtn,
              (!emailAddress || !password || !firstName || loading) && s.btnDisabled,
              pressed && s.pressed,
            ]}
            onPress={handleSubmit}
            disabled={!emailAddress || !password || !firstName || loading}
          >
            <View style={s.btnInner}>
              {loading ? (
                <ActivityIndicator color="#1e4d2b" />
              ) : (
                <>
                  <Text style={s.btnIcon}>🛒</Text>
                  <Text style={s.btnText}>Start My Grocery Journey</Text>
                </>
              )}
            </View>
          </Pressable>

          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={s.signInRow}>
            <Text style={s.signInText}>Already have an account? </Text>
            <Link href="/(auth)/sign-in">
              <Text style={s.signInLink}>Sign In</Text>
            </Link>
          </View>

          {Platform.OS === 'web' && <View nativeID="clerk-captcha" />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

/* ─────────────── STYLES ─────────────── */
const GREEN       = '#1e4d2b'
const GREEN_LIGHT = '#4ade80'
const WHITE       = '#ffffff'
const WHITE_DIM   = 'rgba(255,255,255,0.7)'
const WHITE_FAINT = 'rgba(255,255,255,0.15)'
const GREEN_CARD  = 'rgba(255,255,255,0.08)'

const s = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: GREEN },
  flex:           { flex: 1 },
  container:      { flexGrow: 1, padding: 24, paddingTop: 32 },
  centeredScroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },

  emailCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: GREEN_CARD,
    alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: 24,
    borderWidth: 1, borderColor: WHITE_FAINT,
  },
  emailIcon: { fontSize: 40 },

  appName:   { fontSize: 32, fontWeight: '800', color: WHITE, letterSpacing: 4, marginBottom: 16 },
  title:     { fontSize: 26, fontWeight: '700', color: WHITE, marginBottom: 6 },
  subtitle:  { fontSize: 14, color: WHITE_DIM, marginBottom: 28, lineHeight: 22 },
  highlight: { color: GREEN_LIGHT, fontWeight: '600' },

  nameRow:   { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  input: {
    borderWidth: 1, borderColor: WHITE_FAINT, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, marginBottom: 14,
    color: WHITE, backgroundColor: GREEN_CARD,
  },

  codeInput: {
    borderWidth: 2, borderColor: GREEN_LIGHT, borderRadius: 16,
    paddingHorizontal: 16, paddingVertical: 20,
    fontSize: 32, color: WHITE,
    backgroundColor: GREEN_CARD,
    textAlign: 'center', letterSpacing: 14,
    fontWeight: '800', marginBottom: 28,
  },

  btnInner: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10,
    paddingVertical: 18, paddingHorizontal: 24,
  },
  btnIcon: { fontSize: 20, color: GREEN, fontWeight: '900' },
  btnText: { color: GREEN, fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },

  verifyBtn: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 24,
    backgroundColor: GREEN_LIGHT,
    shadowColor: GREEN_LIGHT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5, shadowRadius: 12, elevation: 8,
  },
  signUpBtn: {
    borderRadius: 16, overflow: 'hidden', marginBottom: 20,
    backgroundColor: GREEN_LIGHT,
    shadowColor: GREEN_LIGHT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 12, elevation: 8,
  },

  btnDisabled: { opacity: 0.45 },
  pressed:     { opacity: 0.75 },

  linkRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, flexWrap: 'wrap',
  },
  linkBtn:  { paddingVertical: 8, paddingHorizontal: 4 },
  linkText: { color: WHITE_DIM, fontWeight: '600', fontSize: 14 },
  linkDot:  { color: WHITE_FAINT, fontSize: 18 },

  errorBox: {
    backgroundColor: 'rgba(220,38,38,0.15)',
    borderWidth: 1, borderColor: 'rgba(220,38,38,0.4)',
    borderRadius: 10, padding: 12, marginBottom: 16,
  },
  errorText: { color: '#fca5a5', fontSize: 13, textAlign: 'center' },

  divider:     { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: WHITE_FAINT },
  dividerText: { marginHorizontal: 12, color: WHITE_DIM, fontSize: 12 },

  signInRow:  { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  signInText: { color: WHITE_DIM, fontSize: 14 },
  signInLink: { color: GREEN_LIGHT, fontWeight: '600', fontSize: 14 },
})