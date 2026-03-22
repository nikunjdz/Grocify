import { useAuth, useSignUp } from '@clerk/clerk-expo'
import { type Href, Link, useRouter } from 'expo-router'
import React from 'react'
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const { isSignedIn } = useAuth()
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

  const handleSubmit = async () => {
    if (!isLoaded) return
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    setError('')
    try {
      await signUp.create({ firstName, lastName, emailAddress, password })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setPendingVerification(true)
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!isLoaded) return
    setLoading(true)
    setError('')
    try {
      const result = await signUp.attemptEmailAddressVerification({ code })
      if (result.status === 'complete') {
        setVerified(true)
        setTimeout(async () => {
          await setActive({ session: result.createdSessionId })
          router.replace('/(home)' as Href)
        }, 2500)
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  if (isSignedIn) return null

  // ── Verified ─────────────────────────────────────────────────────
  if (verified) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.centeredView}>
          <View style={s.successCircle}>
            <Text style={s.checkmark}>✓</Text>
          </View>
          <Text style={s.successTitle}>Email Verified!</Text>
          <Text style={s.successSubtitle}>
            Your account has been successfully{'\n'}verified. Redirecting you now...
          </Text>
          <Pressable
            style={({ pressed }) => [s.outlineBtn, pressed && s.pressed]}
            onPress={() => router.replace('/(auth)/sign-in' as Href)}
          >
            <Text style={s.outlineBtnText}>Back to Sign In</Text>
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
              We sent a code to{'\n'}
              <Text style={s.highlight}>{emailAddress}</Text>
            </Text>

            {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

            <TextInput
              style={s.codeInput}
              value={code}
              placeholder="000000"
              placeholderTextColor="rgba(255,255,255,0.3)"
              onChangeText={setCode}
              keyboardType="numeric"
              maxLength={6}
            />

            <Pressable
              style={({ pressed }) => [s.btn, (loading || !code) && s.btnDisabled, pressed && s.pressed]}
              onPress={handleVerify}
              disabled={loading || !code}
            >
              <Text style={s.btnText}>{loading ? 'Verifying...' : 'Verify Email'}</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.secondaryBtn, pressed && s.pressed]}
              onPress={() => signUp.prepareEmailAddressVerification({ strategy: 'email_code' })}
            >
              <Text style={s.secondaryBtnText}>Resend code</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [s.secondaryBtn, pressed && s.pressed]}
              onPress={() => setPendingVerification(false)}
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
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <Text style={s.appName}>GROCIFY</Text>
          <Text style={s.title}>Create Account</Text>
          <Text style={s.subtitle}>Sign up to get started today</Text>

          {error ? <View style={s.errorBox}><Text style={s.errorText}>{error}</Text></View> : null}

          {/* Name Row */}
          <View style={s.nameRow}>
            <TextInput
              style={[s.input, s.halfInput]}
              autoCapitalize="words"
              value={firstName}
              placeholder="First Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              onChangeText={setFirstName}
            />
            <TextInput
              style={[s.input, s.halfInput]}
              autoCapitalize="words"
              value={lastName}
              placeholder="Last Name"
              placeholderTextColor="rgba(255,255,255,0.4)"
              onChangeText={setLastName}
            />
          </View>

          <TextInput
            style={s.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email address"
            placeholderTextColor="rgba(255,255,255,0.4)"
            onChangeText={setEmailAddress}
            keyboardType="email-address"
          />

          <TextInput
            style={s.input}
            value={password}
            placeholder="Password (min 8 characters)"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            onChangeText={setPassword}
          />

          <TextInput
            style={s.input}
            value={confirmPassword}
            placeholder="Confirm Password"
            placeholderTextColor="rgba(255,255,255,0.4)"
            secureTextEntry
            onChangeText={setConfirmPassword}
          />

          <Pressable
            style={({ pressed }) => [s.btn, (!emailAddress || !password || !firstName || loading) && s.btnDisabled, pressed && s.pressed]}
            onPress={handleSubmit}
            disabled={!emailAddress || !password || !firstName || loading}
          >
            <Text style={s.btnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
          </Pressable>

          {/* Divider */}
          <View style={s.divider}>
            <View style={s.dividerLine} />
            <Text style={s.dividerText}>or</Text>
            <View style={s.dividerLine} />
          </View>

          <View style={s.signInRow}>
            <Text style={s.signInText}>Already have an account? </Text>
            <Link href="/sign-in"><Text style={s.signInLink}>Sign In</Text></Link>
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
  centeredView: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  appName: { fontSize: 32, fontWeight: '800', color: WHITE, letterSpacing: 4, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: WHITE, marginBottom: 6 },
  subtitle: { fontSize: 14, color: WHITE_DIM, marginBottom: 28, lineHeight: 22, textAlign: 'center' },
  highlight: { color: '#4ade80', fontWeight: '600' },
  nameRow: { flexDirection: 'row', gap: 12, marginBottom: 0 },
  halfInput: { flex: 1 },
  input: { borderWidth: 1, borderColor: WHITE_FAINT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, marginBottom: 14, color: WHITE, backgroundColor: GREEN_CARD },
  codeInput: { borderWidth: 1, borderColor: WHITE_FAINT, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 18, fontSize: 28, marginBottom: 20, color: WHITE, backgroundColor: GREEN_CARD, textAlign: 'center', letterSpacing: 12, fontWeight: 'bold', width: '100%' },
  btn: { backgroundColor: '#4ade80', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: GREEN, fontWeight: '700', fontSize: 16 },
  pressed: { opacity: 0.75 },
  secondaryBtn: { paddingVertical: 10, alignItems: 'center', marginBottom: 4 },
  secondaryBtnText: { color: WHITE_DIM, fontWeight: '600', fontSize: 14 },
  outlineBtn: { borderWidth: 1.5, borderColor: '#4ade80', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  outlineBtnText: { color: '#4ade80', fontWeight: '600', fontSize: 15 },
  errorBox: { backgroundColor: 'rgba(220,38,38,0.15)', borderWidth: 1, borderColor: 'rgba(220,38,38,0.4)', borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { color: '#fca5a5', fontSize: 13, textAlign: 'center' },
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: WHITE_FAINT },
  dividerText: { marginHorizontal: 12, color: WHITE_DIM, fontSize: 12 },
  signInRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24 },
  signInText: { color: WHITE_DIM, fontSize: 14 },
  signInLink: { color: '#4ade80', fontWeight: '600', fontSize: 14 },
  successCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(74,222,128,0.2)', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 28, borderWidth: 2, borderColor: '#4ade80' },
  checkmark: { fontSize: 46, color: '#4ade80' },
  successTitle: { fontSize: 28, fontWeight: 'bold', color: WHITE, textAlign: 'center', marginBottom: 12 },
  successSubtitle: { fontSize: 15, color: WHITE_DIM, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  emailCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: GREEN_CARD, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24, borderWidth: 1, borderColor: WHITE_FAINT },
  emailIcon: { fontSize: 40 },
})