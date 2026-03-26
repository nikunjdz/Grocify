import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

type Priority = 'high' | 'normal';

type GroceryItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
  completed: boolean;
  priority: Priority;
  note?: string;
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

const getCategoryIcon = (cat: string): string => {
  switch (cat) {
    case 'All': return 'cart-outline';
    case 'Produce': return 'leaf-outline';
    case 'Dairy': return 'cafe-outline';
    case 'Meat': return 'fish-outline';
    case 'Bakery': return 'pizza-outline';
    case 'Pantry': return 'cube-outline';
    case 'Snacks': return 'ice-cream-outline';
    case 'Drinks': return 'wine-outline';
    default: return 'help-circle-outline';
  }
};

export default function ListScreen() {
  const { isDark } = useTheme();
  const c = isDark ? dark : light;

  const [items, setItems] = useState<GroceryItem[]>(INITIAL_ITEMS);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editItem, setEditItem] = useState<GroceryItem | null>(null);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Produce');
  const [newQty, setNewQty] = useState('1');
  const [newPriority, setNewPriority] = useState<Priority>('normal');
  const [newNote, setNewNote] = useState('');

  const completed = items.filter((i) => i.completed).length;
  const total = items.length;

  const filteredItems = items
    .filter((item) => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const completedMatch = showCompleted || !item.completed;
      return categoryMatch && searchMatch && completedMatch;
    })
    .sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;
      return 0;
    });

  const toggleItem = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, completed: !i.completed } : i)));

  const deleteItem = (id: string) => {
    Alert.alert('Delete Item', 'Remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setItems((prev) => prev.filter((i) => i.id !== id)) },
    ]);
  };

  const clearCompleted = () => {
    Alert.alert('Clear Completed', 'Remove all completed items?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setItems((prev) => prev.filter((i) => !i.completed)) },
    ]);
  };

  const openAdd = () => {
    setEditItem(null);
    setNewName('');
    setNewCategory('Produce');
    setNewQty('1');
    setNewPriority('normal');
    setNewNote('');
    setAddModal(true);
  };

  const openEdit = (item: GroceryItem) => {
    setEditItem(item);
    setNewName(item.name);
    setNewCategory(item.category);
    setNewQty(item.quantity.toString());
    setNewPriority(item.priority);
    setNewNote(item.note || '');
    setAddModal(true);
  };

  const saveItem = () => {
    if (!newName.trim()) {
      Alert.alert('Required', 'Please enter item name');
      return;
    }
    if (editItem) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === editItem.id
            ? {
                ...i,
                name: newName.trim(),
                category: newCategory,
                quantity: parseInt(newQty) || 1,
                priority: newPriority,
                note: newNote.trim() || undefined,
              }
            : i
        )
      );
    } else {
      setItems((prev) => [
        {
          id: Date.now().toString(),
          name: newName.trim(),
          category: newCategory,
          quantity: parseInt(newQty) || 1,
          completed: false,
          priority: newPriority,
          note: newNote.trim() || undefined,
        },
        ...prev,
      ]);
    }
    setAddModal(false);
  };

  const decrementQty = () => setNewQty((q) => Math.max(1, (parseInt(q) || 1) - 1).toString());
  const incrementQty = () => setNewQty((q) => ((parseInt(q) || 1) + 1).toString());

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: c.bg }]}>
      {/* Header */}
      <View style={[s.header, { borderBottomColor: c.border }]}>
        <View>
          <Text style={[s.title, { color: c.text }]}>Your Grocery Board</Text>
          <Text style={[s.subtitle, { color: c.sub }]}>{completed}/{total} items completed</Text>
        </View>
        <TouchableOpacity style={[s.addBtn, { backgroundColor: c.green }]} onPress={openAdd}>
          <Ionicons name="add" size={22} color="#fff" />
          <Text style={s.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[s.searchWrap, { backgroundColor: c.card, borderColor: c.border }]}>
        <Ionicons name="search-outline" size={18} color={c.sub} />
        <TextInput
          style={[s.searchInput, { color: c.text }]}
          placeholder="Search Items"
          placeholderTextColor={c.sub}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={c.sub} />
          </TouchableOpacity>
        )}
      </View>

      {/* Uniform Size Category Blocks */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.catScroll}
        contentContainerStyle={s.catScrollContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              s.catChip,
              {
                backgroundColor: selectedCategory === cat ? c.green : c.card,
                borderColor: selectedCategory === cat ? c.green : c.border,
              },
            ]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Ionicons
              name={getCategoryIcon(cat)}
              size={18}
              color={selectedCategory === cat ? '#fff' : c.sub}
              style={{ marginBottom: 3 }}
            />
            <Text
              style={[
                s.catChipText,
                { color: selectedCategory === cat ? '#fff' : c.text },
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Toolbar */}
      <View style={[s.toolbar, { borderBottomColor: c.border }]}>
        <TouchableOpacity style={s.toolbarBtn} onPress={() => setShowCompleted(!showCompleted)}>
          <Ionicons name={showCompleted ? 'eye-outline' : 'eye-off-outline'} size={16} color={c.sub} />
          <Text style={[s.toolbarBtnText, { color: c.sub }]}>
            {showCompleted ? 'Hide done' : 'Show done'}
          </Text>
        </TouchableOpacity>
        {completed > 0 && (
          <TouchableOpacity style={s.toolbarBtn} onPress={clearCompleted}>
            <Ionicons name="trash-outline" size={16} color="#f87171" />
            <Text style={[s.toolbarBtnText, { color: '#f87171' }]}>Clear {completed} done</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Items List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.listContent}>
        {filteredItems.length === 0 && (
          <View style={s.emptyState}>
            <Ionicons name="cart-outline" size={60} color={c.sub} style={{ marginBottom: 16 }} />
            <Text style={[s.emptyTitle, { color: c.text }]}>No items found</Text>
            <Text style={[s.emptySub, { color: c.sub }]}>
              {searchQuery ? 'Try a different search' : 'Tap + Add to get started'}
            </Text>
          </View>
        )}

        {filteredItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              s.itemCard,
              {
                backgroundColor: c.card,
                borderLeftColor: item.priority === 'high' && !item.completed ? '#f87171' : 'transparent',
              },
            ]}
            onPress={() => toggleItem(item.id)}
            onLongPress={() => openEdit(item)}
            activeOpacity={0.7}
          >
            <View
              style={[
                s.checkbox,
                {
                  backgroundColor: item.completed ? c.green : 'transparent',
                  borderColor: item.completed ? c.green : c.border,
                },
              ]}
            >
              {item.completed && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>

            <View style={s.itemBody}>
              <View style={s.itemTopRow}>
                <Text
                  style={[
                    s.itemName,
                    {
                      color: c.text,
                      textDecorationLine: item.completed ? 'line-through' : 'none',
                      opacity: item.completed ? 0.45 : 1,
                    },
                  ]}
                >
                  {item.name}
                </Text>
                {item.priority === 'high' && !item.completed && (
                  <View style={s.urgentBadge}>
                    <Text style={s.urgentText}>urgent</Text>
                  </View>
                )}
              </View>
              <View style={s.itemBottomRow}>
                <Text style={[s.itemCat, { color: c.sub }]}>{item.category}</Text>
                {item.note && (
                  <Text style={[s.itemNote, { color: c.sub }]} numberOfLines={1}>
                    · {item.note}
                  </Text>
                )}
              </View>
            </View>

            <View style={s.itemRight}>
              <Text style={[s.itemQty, { color: c.sub }]}>×{item.quantity}</Text>
              <TouchableOpacity onPress={() => deleteItem(item.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="trash-outline" size={15} color="#f87171" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal visible={addModal} transparent animationType="slide" onRequestClose={() => setAddModal(false)}>
        {/* Your modal code */}
      </Modal>
    </SafeAreaView>
  );
}

// Colors
const dark = {
  bg: '#0f1a12',
  card: '#1a2e1e',
  text: '#ffffff',
  sub: 'rgba(255,255,255,0.6)',
  border: 'rgba(255,255,255,0.12)',
  green: '#4ade80',
};

const light = {
  bg: '#f0faf4',
  card: '#ffffff',
  text: '#111827',
  sub: '#6b7280',
  border: '#e5e7eb',
  green: '#16a34a',
};

// Styles - Uniform Size for All Category Blocks
const s = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginTop: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15 },

  catScroll: { marginTop: 3 },
  catScrollContent: { 
    paddingHorizontal: 14, 
    paddingVertical: 8, 
    gap: 9 
  },
  catChip: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    width: 80,           // Fixed width for uniform size
    height: 62,          // Fixed height for uniform size
  },
  catChipText: { 
    fontSize: 11.5, 
    fontWeight: '500', 
    textAlign: 'center' 
  },

  toolbar: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 1, borderBottomWidth: 1, marginTop: 1 },
  toolbarBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toolbarBtnText: { fontSize: 13 },

  listContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyTitle: { fontSize: 19, fontWeight: '600', marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center' },

  itemCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10, gap: 12, borderLeftWidth: 3 },
  checkbox: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  itemBody: { flex: 1 },
  itemTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  itemName: { fontSize: 15, fontWeight: '500', flex: 1 },
  itemBottomRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemCat: { fontSize: 12 },
  itemNote: { fontSize: 12, flex: 1 },
  urgentBadge: { backgroundColor: 'rgba(248,113,113,0.15)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  urgentText: { color: '#f87171', fontSize: 10, fontWeight: '600' },
  itemRight: { alignItems: 'flex-end', gap: 8 },
  itemQty: { fontSize: 13, fontWeight: '600' },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700' },
});