import { useAuth, useUser } from '@clerk/clerk-expo';  // ✅ fixed import
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  const c = isDark ? dark : light;

  const [editModal, setEditModal] = useState(false);
  const [bugModal, setBugModal] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bugName, setBugName] = useState('');
  const [bugEmail, setBugEmail] = useState(user?.emailAddresses?.[0]?.emailAddress || '');
  const [bugDesc, setBugDesc] = useState('');
  const [saving, setSaving] = useState(false);

  const email = user?.emailAddresses?.[0]?.emailAddress || '';
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U';
  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  const saveProfile = async () => {
    if (!firstName.trim()) { Alert.alert('Required', 'First name cannot be empty'); return; }
    setSaving(true);
    try {
      await user?.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      setEditModal(false);
      Alert.alert('Saved!', 'Your profile has been updated.');
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission required', 'Please allow photo library access.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        await user?.setProfileImage({ file: result.assets[0].uri });
        Alert.alert('Updated!', 'Profile photo updated.');
      } catch {
        Alert.alert('Error', 'Failed to update profile photo.');
      }
    }
  };

  const sendBug = () => {
    if (!bugDesc.trim()) { Alert.alert('Required', 'Please describe the bug'); return; }
    Alert.alert('Sent!', 'Bug report received. Thank you!');
    setBugModal(false);
    setBugName('');
    setBugDesc('');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>

      {/* Header */}
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <Text style={[s.headerTitle, { color: c.text }]}>Profile</Text>
        <TouchableOpacity style={[s.headerBtn, { backgroundColor: c.card }]} onPress={() => setIsDark(!isDark)}>
          <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Avatar */}
        <View style={[s.avatarSection, { backgroundColor: c.card }]}>
          <TouchableOpacity style={s.avatarWrap} onPress={pickImage}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={s.avatarImg} />
            ) : (
              <View style={[s.avatarFallback, { backgroundColor: c.green }]}>
                <Text style={s.avatarInitials}>{initials}</Text>
              </View>
            )}
            <View style={[s.avatarEditBadge, { backgroundColor: c.green }]}>
              <Ionicons name="camera-outline" size={12} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={[s.profileName, { color: c.text }]}>{fullName}</Text>
          <Text style={[s.profileEmail, { color: c.sub }]}>{email}</Text>
          <Text style={[s.profileJoin, { color: c.sub }]}>Member since {joinDate}</Text>
          <TouchableOpacity
            style={[s.editProfileBtn, { backgroundColor: c.green }]}
            onPress={() => { setFirstName(user?.firstName || ''); setLastName(user?.lastName || ''); setEditModal(true); }}
          >
            <Ionicons name="pencil-outline" size={16} color="#fff" />
            <Text style={s.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Settings */}
        <View style={[s.section, { backgroundColor: c.card }]}>
          <Text style={[s.sectionTitle, { color: c.text }]}>Settings</Text>
          <View style={[s.settingRow, { borderBottomColor: c.border }]}>
            <View style={s.settingLeft}>
              <View style={[s.settingIcon, { backgroundColor: 'rgba(74,222,128,0.15)' }]}>
                <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={18} color={c.green} />
              </View>
              <View>
                <Text style={[s.settingTitle, { color: c.text }]}>Dark Mode</Text>
                <Text style={[s.settingSub, { color: c.sub }]}>Toggle app appearance</Text>
              </View>
            </View>
            <Switch value={isDark} onValueChange={setIsDark} trackColor={{ false: '#e5e7eb', true: c.green }} thumbColor="#fff" />
          </View>
          <View style={[s.settingRow, { borderBottomColor: 'transparent' }]}>
            <View style={s.settingLeft}>
              <View style={[s.settingIcon, { backgroundColor: 'rgba(251,146,60,0.15)' }]}>
                <Ionicons name="notifications-outline" size={18} color="#fb923c" />
              </View>
              <View>
                <Text style={[s.settingTitle, { color: c.text }]}>Notifications</Text>
                <Text style={[s.settingSub, { color: c.sub }]}>Shopping reminders</Text>
              </View>
            </View>
            <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: '#e5e7eb', true: c.green }} thumbColor="#fff" />
          </View>
        </View>

        {/* More */}
        <View style={[s.section, { backgroundColor: c.card }]}>
          <Text style={[s.sectionTitle, { color: c.text }]}>More</Text>
          <TouchableOpacity style={[s.menuRow, { borderBottomColor: c.border }]} onPress={() => setBugModal(true)}>
            <View style={s.settingLeft}>
              <View style={[s.settingIcon, { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
                <Ionicons name="bug-outline" size={18} color="#6366f1" />
              </View>
              <View>
                <Text style={[s.settingTitle, { color: c.text }]}>Report a Bug</Text>
                <Text style={[s.settingSub, { color: c.sub }]}>Help us improve the app</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.sub} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.menuRow, { borderBottomColor: c.border }]} onPress={() => Alert.alert('Privacy Policy', 'Coming soon.')}>
            <View style={s.settingLeft}>
              <View style={[s.settingIcon, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#3b82f6" />
              </View>
              <View>
                <Text style={[s.settingTitle, { color: c.text }]}>Privacy Policy</Text>
                <Text style={[s.settingSub, { color: c.sub }]}>How we handle your data</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.sub} />
          </TouchableOpacity>
          <TouchableOpacity style={[s.menuRow, { borderBottomColor: 'transparent' }]} onPress={() => Alert.alert('Version', 'Grocify v1.0.0')}>
            <View style={s.settingLeft}>
              <View style={[s.settingIcon, { backgroundColor: 'rgba(156,163,175,0.15)' }]}>
                <Ionicons name="information-circle-outline" size={18} color="#9ca3af" />
              </View>
              <View>
                <Text style={[s.settingTitle, { color: c.text }]}>App Version</Text>
                <Text style={[s.settingSub, { color: c.sub }]}>v1.0.0</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={c.sub} />
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={[s.signOutBtn, { backgroundColor: c.card }]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color="#f87171" />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[s.footerText, { color: c.sub }]}>Grocify · Plan smarter. Shop happier.</Text>

      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <View style={s.overlay}>
          <View style={[s.modalCard, { backgroundColor: c.bg }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: c.text }]}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Ionicons name="close" size={24} color={c.sub} />
              </TouchableOpacity>
            </View>
            <Text style={[s.inputLbl, { color: c.text }]}>First Name</Text>
            <TextInput
              style={[s.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
              placeholder="First name"
              placeholderTextColor={c.sub}
              value={firstName}
              onChangeText={setFirstName}
              autoFocus
            />
            <Text style={[s.inputLbl, { color: c.text }]}>Last Name</Text>
            <TextInput
              style={[s.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
              placeholder="Last name"
              placeholderTextColor={c.sub}
              value={lastName}
              onChangeText={setLastName}
            />
            <Text style={[s.inputLbl, { color: c.sub }]}>Email (cannot be changed)</Text>
            <View style={[s.input, s.disabledInput, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={{ color: c.sub }}>{email}</Text>
            </View>
            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: c.green, opacity: saving ? 0.7 : 1 }]}
              onPress={saveProfile}
              disabled={saving}
            >
              <Text style={s.saveBtnText}>{saving ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bug Report Modal */}
      <Modal visible={bugModal} transparent animationType="slide" onRequestClose={() => setBugModal(false)}>
        <View style={s.overlay}>
          <View style={[s.modalCard, { backgroundColor: c.bg }]}>
            <View style={s.modalHeader}>
              <Text style={[s.modalTitle, { color: c.text }]}>Report a Bug</Text>
              <TouchableOpacity onPress={() => setBugModal(false)}>
                <Ionicons name="close" size={24} color={c.sub} />
              </TouchableOpacity>
            </View>
            <Text style={[s.inputLbl, { color: c.text }]}>Name</Text>
            <TextInput
              style={[s.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
              placeholder="Your name"
              placeholderTextColor={c.sub}
              value={bugName}
              onChangeText={setBugName}
            />
            <Text style={[s.inputLbl, { color: c.text }]}>Email</Text>
            <TextInput
              style={[s.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
              placeholder="your@email.com"
              placeholderTextColor={c.sub}
              value={bugEmail}
              onChangeText={setBugEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={[s.inputLbl, { color: c.text }]}>Description <Text style={{ color: '#f87171' }}>(required)</Text></Text>
            <TextInput
              style={[s.input, s.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]}
              placeholder="What's the bug?"
              placeholderTextColor={c.sub}
              value={bugDesc}
              onChangeText={setBugDesc}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity style={[s.saveBtn, { backgroundColor: '#6366f1' }]} onPress={sendBug}>
              <Text style={s.saveBtnText}>Send Bug Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.cancelBtn} onPress={() => setBugModal(false)}>
              <Text style={[s.cancelBtnText, { color: c.sub }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const dark = { bg: '#0f1a12', card: '#1a2e1e', text: '#ffffff', sub: 'rgba(255,255,255,0.55)', border: 'rgba(255,255,255,0.1)', green: '#4ade80' };
const light = { bg: '#f0faf4', card: '#ffffff', text: '#111827', sub: '#6b7280', border: '#e5e7eb', green: '#16a34a' };

const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 22, fontWeight: '700' },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 100 },
  avatarSection: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 16 },
  avatarWrap: { position: 'relative', marginBottom: 14 },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
  avatarFallback: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: '#fff', fontSize: 34, fontWeight: '800' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  profileName: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  profileEmail: { fontSize: 14, marginBottom: 4 },
  profileJoin: { fontSize: 12, marginBottom: 16 },
  editProfileBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 12, paddingHorizontal: 20, paddingVertical: 10 },
  editProfileBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  section: { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingTitle: { fontSize: 15, fontWeight: '500' },
  settingSub: { fontSize: 12, marginTop: 2 },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16, marginBottom: 16 },
  signOutText: { color: '#f87171', fontWeight: '700', fontSize: 16 },
  footerText: { textAlign: 'center', fontSize: 12, marginBottom: 8 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  inputLbl: { fontSize: 14, fontWeight: '500', marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 13, fontSize: 15, marginBottom: 16 },
  disabledInput: { justifyContent: 'center', opacity: 0.6 },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveBtn: { borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginBottom: 8 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 15 },
});