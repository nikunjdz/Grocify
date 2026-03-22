import { useSignUp, useClerk } from '@clerk/clerk-expo'
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
  const { isLoaded, signUp } = useSignUp()
  const { setActive } = useClerk()
  const router = useRouter()

  const [firstName, setFirstName] = React.useState('')
  const [lastName, setLastName] = React.useState('')
  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')
  const [code, setCode] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [verified, setVerified] = React.useState(false)
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [countdown, setCountdown] = React.useState(3)

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
        emailAddress: emailAddress.trim().toLowerCase(),
        password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      console.error('CREATE ERROR:', JSON.stringify(err, null, 2))
      setError(
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        err?.message ||
        'Sign up failed. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!isLoaded) return
    if (code.trim().length < 6) { setError('Please enter the 6-digit code'); return }
    setLoading(true)
    setError('')

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: code.trim() })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setVerified(true)
        let count = 3
        setCountdown(3)
        const interval = setInterval(() => {
          count -= 1
          setCountdown(count)
          if (count === 0) {
            clearInterval(interval)
            router.replace('/')
          }
        }, 1000)
      } else {
        setError('Verification not complete. Please try again.')
      }
    } catch (err: any) {
      console.error('VERIFY ERROR:', JSON.stringify(err, null, 2))
      setError(
        err?.errors?.[0]?.longMessage ||
        err?.errors?.[0]?.message ||
        'Invalid code. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    if (!isLoaded) return
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setError('')
      setCode('')
    } catch {
      setError('Failed to resend code')
    }
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <SafeAreaView style={[s.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4ade80" />
      </SafeAreaView>
    )
  }

  // ── Verified ─────────────────────────────────────────────────────
  if (verified) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.verifiedScreen}>
          <View style={s.successRing}>
            <View style={s.successCircle}>
              <Text style={s.checkmark}>✓</Text>
            </View>
          </View>
          <Text style={s.verifiedTitle}>Account Created!</Text>
          <Text style={s.verifiedSubtitle}>
            Welcome to Grocify, {firstName}! 🎉{'\n'}
            Your email has been verified successfully.
          </Text>
          <View style={s.countdownWrap}>
            <Text style={s.countdownText}>
              Redirecting in <Text style={s.countdownNum}>{countdown}</Text>...
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [s.goHomeBtn, pressed && s.pressed]}
            onPress={() => router.replace('/')}
          >
            <Text style={s.goHomeBtnText}>Go to Home Now →</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // ── OTP ──────────────────────────────────────────────────────────
  if (pendingVerification) {
    return (
      <SafeAreaView style={s.safe}>
        <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.centeredView}>
            <View style={s.emailCircle}>
              <Text style={s.emailIcon}>📧</Text>
            </View>
            <Text style={s.title}>Check your email</Text>
            <Text style={s.subtitle}>
              We sent a 6-digit code to{'\n'}
              <Text style={s.highlight}>{emailAddress}</Text>
            </Text>

            {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

            <TextInput
              style={s.codeInput}
              value={code}
              placeholder="000000"
              placeholderTextColor="rgba(255,255,255,0.3)"
              onChangeText={(text) => { setCode(text); setError('') }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
            />

            <Pressable
              style={({ pressed }) => [s.btn, (loading || code.length < 6) && s.btnDisabled, pressed && s.pressed]}
              onPress={handleVerify}
              disabled={loading || code.length < 6}
            >
              {loading ? <ActivityIndicator color="#1e4d2b" /> : <Text style={s.btnText}>Verify Email</Text>}
            </Pressable>

            <Pressable style={({ pressed }) => [s.secondaryBtn, pressed && s.pressed]} onPress={resendCode}>
              <Text style={s.secondaryBtnText}>Resend code</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.secondaryBtn, pressed && s.pressed]}
              onPress={() => { setPendingVerification(false); setCode(''); setError('') }}
            >
              <Text style={s.secondaryBtnText}>Wrong email? Go back</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // ── Sign Up Form ──────────────────────────────────────────────────
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

          {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

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
          />

          <TextInput
            style={s.input}
            value={password}
            placeholder="Password (min 8 characters)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            onChangeText={(t) => { setPassword(t); setError('') }}
          />

          <TextInput
            style={s.input}
            value={confirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            onChangeText={(t) => { setConfirmPassword(t); setError('') }}
          />

          <Pressable
            style={({ pressed }) => [
              s.btn,
              (!emailAddress || !password || !firstName || loading) && s.btnDisabled,
              pressed && s.pressed,
            ]}
            onPress={handleSubmit}
            disabled={!emailAddress || !password || !firstName || loading}
          >
            {loading ? <ActivityIndicator color="#1e4d2b" /> : <Text style={s.btnText}>Create Account</Text>}
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

          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const GREEN = '#1e4d2b'
const WHITE = '#ffffff'
const WHITE_DIM = 'rgba(255,255,255,0.7)'
const WHITE_FAINT = 'rgba(255,255,255,0.15)'
const GREEN_CARD = 'rgba(255,255,255,0.08)'

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: GREEN },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: 24, paddingTop: 32 },
  verifiedScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  successRing: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#4ade80', alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  successCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(74,222,128,0.2)', alignItems: 'center', justifyContent: 'center' },
  checkmark: { fontSize: 46, color: '#4ade80' },
  verifiedTitle: { fontSize: 30, fontWeight: '800', color: WHITE, textAlign: 'center', marginBottom: 12 },
  verifiedSubtitle: { fontSize: 15, color: WHITE_DIM, textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  countdownWrap: { backgroundColor: GREEN_CARD, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12, marginBottom: 24, borderWidth: 1, borderColor: WHITE_FAINT },
  countdownText: { color: WHITE_DIM, fontSize: 15, textAlign: 'center' },
  countdownNum: { color: '#4ade80', fontWeight: '800', fontSize: 18 },
  goHomeBtn: { backgroundColor: '#4ade80', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, alignItems: 'center' },
  goHomeBtnText: { color: GREEN, fontWeight: '700', fontSize: 16 },
  centeredView: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emailCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: GREEN_CARD, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24, borderWidth: 1, borderColor: WHITE_FAINT },
  emailIcon: { fontSize: 40 },
  codeInput: { borderWidth: 1, borderColor: WHITE_FAINT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 18, fontSize: 28, marginBottom: 20, color: WHITE, backgroundColor: GREEN_CARD, textAlign: 'center', letterSpacing: 12, fontWeight: 'bold', width: '100%' },
  appName: { fontSize: 32, fontWeight: '800', color: WHITE, letterSpacing: 4, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: WHITE, marginBottom: 6 },
  subtitle: { fontSize: 14, color: WHITE_DIM, marginBottom: 28, lineHeight: 22 },
  highlight: { color: '#4ade80', fontWeight: '600' },
  nameRow: { flexDirection: 'row', gap: 12 },
  halfInput: { flex: 1 },
  input: { borderWidth: 1, borderColor: WHITE_FAINT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 14, color: WHITE, backgroundColor: GREEN_CARD },
  btn: { backgroundColor: '#4ade80', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: GREEN, fontWeight: '700', fontSize: 16 },
  pressed: { opacity: 0.75 },
  secondaryBtn: { paddingVertical: 10, alignItems: 'center', marginBottom: 4 },
  secondaryBtnText: { color: WHITE_DIM, fontWeight: '600', fontSize: 14 },
  errorBox: { backgroundColor: 'rgba(220,38,38,0.15)', borderWidth: 1, borderColor: 'rgba(220,38,38,0.4)', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#fca5a5', fontSize: 13, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: WHITE_FAINT },
  dividerText: { marginHorizontal: 12, color: WHITE_DIM, fontSize: 12 },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  signInText: { color: WHITE_DIM, fontSize: 14 },
  signInLink: { color: '#4ade80', fontWeight: '600', fontSize: 14 },
})