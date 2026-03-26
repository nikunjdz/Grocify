import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type GroceryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  completed: boolean;
  priority: 'high' | 'normal';
};

const INITIAL_ITEMS: GroceryItem[] = [
  { id: '1', name: 'Sourdough Bread', category: 'Bakery', quantity: 1, completed: false, priority: 'high' },
  { id: '2', name: 'Chicken Thighs', category: 'Meat', quantity: 2, completed: false, priority: 'high' },
  { id: '3', name: 'Pasta', category: 'Pantry', quantity: 3, completed: true, priority: 'normal' },
  { id: '4', name: 'Tomatoes', category: 'Produce', quantity: 4, completed: false, priority: 'normal' },
  { id: '5', name: 'Cheddar Cheese', category: 'Dairy', quantity: 1, completed: true, priority: 'normal' },
  { id: '6', name: 'Orange Juice', category: 'Drinks', quantity: 2, completed: false, priority: 'normal' },
  { id: '7', name: 'Greek Yogurt', category: 'Dairy', quantity: 2, completed: false, priority: 'normal' },
  { id: '8', name: 'Almonds', category: 'Snacks', quantity: 1, completed: false, priority: 'normal' },
  { id: '9', name: 'Spinach', category: 'Produce', quantity: 1, completed: false, priority: 'high' },
  { id: '10', name: 'Cookies', category: 'Bakery', quantity: 2, completed: true, priority: 'normal' },
];

const CATEGORIES = ['All', 'Produce', 'Dairy', 'Meat', 'Bakery', 'Pantry', 'Snacks', 'Drinks'];

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [isDark, setIsDark] = useState(colorScheme === 'dark');
  useEffect(() => { setIsDark(colorScheme === 'dark'); }, [colorScheme]);

  const c = isDark ? dark : light;

  const [items] = useState<GroceryItem[]>(INITIAL_ITEMS);
  const [bugModal, setBugModal] = useState(false);
  const [bugName, setBugName] = useState('');
  const [bugEmail, setBugEmail] = useState('');
  const [bugDesc, setBugDesc] = useState('');

  const total = items.length;
  const completed = items.filter(i => i.completed).length;
  const remaining = total - completed;
  const highPriority = items.filter(i => i.priority === 'high' && !i.completed).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const categoryStats = CATEGORIES.slice(1).map(cat => ({
    name: cat,
    count: items.filter(i => i.category === cat).length,
    done: items.filter(i => i.category === cat && i.completed).length,
  })).filter(c => c.count > 0);

  const sendBug = () => {
    if (!bugDesc.trim()) { Alert.alert('Required', 'Please describe the bug'); return; }
    Alert.alert('Sent!', 'Bug report received. Thank you!');
    setBugModal(false);
    setBugName('');
    setBugEmail('');
    setBugDesc('');
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <View>
          <Text style={[s.appName, { color: c.green }]}>GROCIFY</Text>
          <Text style={[s.greeting, { color: c.sub }]}>
            Hey, {user?.firstName || 'there'} 👋
          </Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity
            style={[s.headerBtn, { backgroundColor: c.card }]}
            onPress={() => setIsDark(!isDark)}
          >
            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={18} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.headerBtn, { backgroundColor: c.card }]}
            onPress={() => setBugModal(true)}
          >
            <Ionicons name="bug-outline" size={18} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.avatar, { backgroundColor: c.green }]}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={s.avatarText}>
              {user?.firstName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.statsRow}>
          <View style={[s.statCard, { backgroundColor: c.card }]}>
            <Text style={[s.statNum, { color: c.green }]}>{total}</Text>
            <Text style={[s.statLbl, { color: c.sub }]}>Total</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: c.card }]}>
            <Text style={[s.statNum, { color: '#4ade80' }]}>{completed}</Text>
            <Text style={[s.statLbl, { color: c.sub }]}>Done</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: c.card }]}>
            <Text style={[s.statNum, { color: '#fb923c' }]}>{remaining}</Text>
            <Text style={[s.statLbl, { color: c.sub }]}>Left</Text>
          </View>
        </View>

        <View style={[s.card, { backgroundColor: c.card }]}>
          <View style={s.cardRow}>
            <Text style={[s.cardTitle, { color: c.text }]}>Completion rate</Text>
            <Text style={[s.cardTitle, { color: c.green }]}>{completionRate}%</Text>
          </View>
          <View style={[s.barBg, { backgroundColor: c.border }]}>
            <View style={[s.barFill, { width: `${completionRate}%`, backgroundColor: c.green }]} />
          </View>
          <Text style={[s.cardSub, { color: c.sub, marginTop: 8 }]}>
            {completed} of {total} items completed
          </Text>
        </View>

        {highPriority > 0 && (
          <View style={[s.card, { backgroundColor: c.card }]}>
            <View style={s.cardRow}>
              <Text style={[s.cardTitle, { color: c.text }]}>High priority remaining</Text>
              <View style={s.urgentBadge}>
                <Text style={s.urgentText}>urgent</Text>
              </View>
            </View>
            <Text style={[s.bigNum, { color: '#f87171' }]}>{highPriority}</Text>
            <Text style={[s.cardSub, { color: c.sub }]}>These items need your attention first!</Text>
            <TouchableOpacity
              style={[s.actionBtn, { backgroundColor: c.green }]}
              onPress={() => router.push('/(tabs)/list')}
            >
              <Text style={s.actionBtnText}>View grocery list</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={[s.card, { backgroundColor: c.card }]}>
          <View style={s.cardRow}>
            <Text style={[s.cardTitle, { color: c.text }]}>Items by category</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/list')}>
              <Text style={[s.seeAll, { color: c.green }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {categoryStats.map(cat => (
            <View key={cat.name} style={s.catRow}>
              <Text style={[s.catName, { color: c.text }]}>{cat.name}</Text>
              <View style={[s.catBarBg, { backgroundColor: c.border }]}>
                <View style={[s.catBarFill, { width: `${(cat.count / total) * 100}%`, backgroundColor: c.green }]} />
              </View>
              <Text style={[s.catCount, { color: c.sub }]}>{cat.count}</Text>
            </View>
          ))}
        </View>

        <View style={s.quickRow}>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: c.card }]} onPress={() => router.push('/(tabs)/list')}>
            <Ionicons name="list-outline" size={24} color={c.green} />
            <Text style={[s.quickBtnText, { color: c.text }]}>My List</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: c.card }]} onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="person-outline" size={24} color={c.green} />
            <Text style={[s.quickBtnText, { color: c.text }]}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.quickBtn, { backgroundColor: c.card }]} onPress={() => setBugModal(true)}>
            <Ionicons name="bug-outline" size={24} color={c.green} />
            <Text style={[s.quickBtnText, { color: c.text }]}>Report</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            <TextInput style={[s.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]} placeholder="Your name" placeholderTextColor={c.sub} value={bugName} onChangeText={setBugName} />
            <Text style={[s.inputLbl, { color: c.text }]}>Email</Text>
            <TextInput style={[s.input, { backgroundColor: c.card, color: c.text, borderColor: c.border }]} placeholder="your@email.com" placeholderTextColor={c.sub} value={bugEmail} onChangeText={setBugEmail} keyboardType="email-address" autoCapitalize="none" />
            <Text style={[s.inputLbl, { color: c.text }]}>Description <Text style={{ color: '#f87171' }}>(required)</Text></Text>
            <TextInput style={[s.input, s.textArea, { backgroundColor: c.card, color: c.text, borderColor: c.border }]} placeholder="What's the bug?" placeholderTextColor={c.sub} value={bugDesc} onChangeText={setBugDesc} multiline numberOfLines={4} />
            <TouchableOpacity style={[s.submitBtn, { backgroundColor: '#6366f1' }]} onPress={sendBug}>
              <Text style={s.submitBtnText}>Send Bug Report</Text>
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
  appName: { fontSize: 22, fontWeight: '800', letterSpacing: 3 },
  greeting: { fontSize: 13, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  scroll: { padding: 16, paddingBottom: 100 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  statNum: { fontSize: 30, fontWeight: '800' },
  statLbl: { fontSize: 12, marginTop: 4, fontWeight: '500' },
  card: { borderRadius: 16, padding: 16, marginBottom: 16 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '600' },
  cardSub: { fontSize: 13 },
  barBg: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  bigNum: { fontSize: 48, fontWeight: '800', marginBottom: 4 },
  urgentBadge: { backgroundColor: 'rgba(248,113,113,0.15)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  urgentText: { color: '#f87171', fontSize: 11, fontWeight: '600' },
  actionBtn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  seeAll: { fontSize: 13, fontWeight: '500' },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  catName: { width: 68, fontSize: 13 },
  catBarBg: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  catBarFill: { height: 6, borderRadius: 3 },
  catCount: { width: 20, fontSize: 12, textAlign: 'right' },
  quickRow: { flexDirection: 'row', gap: 12 },
  quickBtn: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center', gap: 8 },
  quickBtnText: { fontSize: 13, fontWeight: '500' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  inputLbl: { fontSize: 14, fontWeight: '500', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 15, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  submitBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
  cancelBtnText: { fontSize: 15 },
});
