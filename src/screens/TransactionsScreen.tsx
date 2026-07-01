import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { getCategoryColor, getCategoryIcon, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants/categories';
import { formatCurrency, formatDate } from '../utils';
import { Ionicons } from '@expo/vector-icons';
import { scaleFont, scaleSpacing } from '../constants/theme';
import { FadeInView } from '../components/FadeInView';

export const TransactionsScreen = ({ navigation, route }: any) => {
  const { colors, spacing } = useTheme();
  
  const transactions = useFinanceStore((state) => state.transactions);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const currency = useFinanceStore((state) => state.settings.currency);

  // States
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Handle parameter-based filtering from other screens (e.g. Dashboard savings card click)
  useEffect(() => {
    if (route?.params?.category) {
      setSelectedCategory(route.params.category);
      setSelectedType('all');
      setSearch('');
      setSelectedTimeframe('all');
      // Clear the parameter so it does not persist on subsequent visits to the tab
      navigation.setParams({ category: undefined });
    }
  }, [route?.params?.category]);

  // Filter lists based on type
  const activeCategories = selectedType === 'all' 
    ? ['All', ...INCOME_CATEGORIES.map(c => c.name), ...EXPENSE_CATEGORIES.map(c => c.name)]
    : selectedType === 'income' 
      ? ['All', ...INCOME_CATEGORIES.map(c => c.name)]
      : ['All', ...EXPENSE_CATEGORIES.map(c => c.name)];

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    // 1. Search Query
    const matchesSearch = tx.title.toLowerCase().includes(search.toLowerCase()) || 
                          (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));
    
    // 2. Type Filter
    const matchesType = selectedType === 'all' || tx.type === selectedType;
    
    // 3. Category Filter
    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    
    // 4. Timeframe Filter
    let matchesTimeframe = true;
    const txDate = new Date(tx.date);
    const today = new Date();
    
    if (selectedTimeframe === 'today') {
      const todayStr = today.toISOString().split('T')[0];
      matchesTimeframe = tx.date === todayStr;
    } else if (selectedTimeframe === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);
      matchesTimeframe = txDate >= oneWeekAgo && txDate <= today;
    } else if (selectedTimeframe === 'month') {
      matchesTimeframe = txDate.getFullYear() === today.getFullYear() && txDate.getMonth() === today.getMonth();
    }
    
    return matchesSearch && matchesType && matchesCategory && matchesTimeframe;
  });

  const handleDeletePrompt = (id: string, title: string) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm(`Delete Transaction\n\nAre you sure you want to delete "${title}"?`);
      if (confirm) {
        deleteTransaction(id);
      }
    } else {
      Alert.alert(
        'Delete Transaction',
        `Are you sure you want to delete "${title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => deleteTransaction(id)
          }
        ]
      );
    }
  };

  const renderTransactionItem = ({ item, index }: { item: any, index: number }) => {
    const isIncome = item.type === 'income';
    const catColor = getCategoryColor(item.category);
    const catIcon = getCategoryIcon(item.category);

    return (
      <View>
        {index > 0 && <View style={[styles.listDivider, { backgroundColor: colors.border }]} />}
        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => navigation.navigate('AddTransaction', { transactionId: item.id })}
          onLongPress={() => handleDeletePrompt(item.id, item.title)}
          style={styles.txRow}
        >
          <View style={styles.txLeft}>
            <View style={[styles.txIconContainer, { backgroundColor: catColor + '10' }]}>
              <Ionicons name={catIcon as any} size={16} color={catColor} />
            </View>
            <View style={styles.txDetails}>
              <Text style={[styles.txTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={[styles.txCategory, { color: colors.textSecondary }]}>
                {item.category} • {formatDate(item.date)}
              </Text>
            </View>
          </View>
          <View style={styles.txRight}>
            <Text 
              style={[
                styles.txAmount, 
                { color: isIncome ? colors.success : colors.text, fontWeight: '600' }
              ]}
            >
              {isIncome ? '+' : '-'}{formatCurrency(item.amount, currency)}
            </Text>
            {item.notes ? (
              <Ionicons name="chatbubble-ellipses-outline" size={10} color={colors.textSecondary} style={styles.notesIndicator} />
            ) : null}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Filter Bar */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 }}>
          <TouchableOpacity 
            onPress={() => navigation.navigate('DashboardTab')} 
            style={{ marginRight: 10, padding: 4 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text, marginBottom: 0 }]}>Transactions</Text>
        </View>
        
        {/* Search */}
        <Input
          placeholder="Search transactions..."
          value={search}
          onChangeText={setSearch}
          iconName="search-outline"
          containerStyle={styles.searchContainer}
          style={styles.searchInput}
        />
      </View>

      {/* Horizontal Filters ScrollView */}
      <FadeInView delay={50} duration={350}>
        <View style={styles.filtersWrapper}>
          {/* Type Filter Row */}
          <FlatList
            data={[
              { id: 'all', label: 'All' },
              { id: 'income', label: 'Income' },
              { id: 'expense', label: 'Expenses' }
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            style={styles.filterRow}
            contentContainerStyle={styles.filterRowContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedType(item.id as any);
                  setSelectedCategory('All'); // Reset category
                }}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                  selectedType === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
              >
                <Text style={[
                  styles.filterText,
                  { color: colors.textSecondary },
                  selectedType === item.id && { color: '#FFFFFF' }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Date Filter Row */}
          <FlatList
            data={[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' }
            ]}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            style={styles.filterRow}
            contentContainerStyle={styles.filterRowContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedTimeframe(item.id as any)}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                  selectedTimeframe === item.id && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
              >
                <Text style={[
                  styles.filterText,
                  { color: colors.textSecondary },
                  selectedTimeframe === item.id && { color: '#FFFFFF' }
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />

          {/* Category Filter Row */}
          <FlatList
            data={activeCategories}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            style={styles.filterRow}
            contentContainerStyle={styles.filterRowContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={[
                  styles.filterPill,
                  { backgroundColor: colors.cardBg, borderColor: colors.border },
                  selectedCategory === item && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
              >
                <Text style={[
                  styles.filterText,
                  { color: colors.textSecondary },
                  selectedCategory === item && { color: '#FFFFFF' }
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </FadeInView>

      {/* Transactions List */}
      <FadeInView delay={120} duration={400} style={{ flex: 1 }}>
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          contentContainerStyle={[styles.listContent, { paddingBottom: 60 }]}
          ListEmptyComponent={
            <Card style={styles.emptyCard} outlined>
              <Ionicons name="funnel-outline" size={28} color={colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: colors.text }]}>No transactions found</Text>
              <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                Adjust your filters or search query.
              </Text>
            </Card>
          }
        />
      </FadeInView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: scaleSpacing(24),
    paddingTop: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: scaleFont(20),
    fontWeight: '800',
    marginBottom: 8,
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInput: {
    height: scaleSpacing(38),
  },
  filtersWrapper: {
    paddingVertical: scaleSpacing(8),
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  filterRow: {
    marginBottom: 4,
  },
  filterRowContent: {
    paddingHorizontal: scaleSpacing(24),
    paddingVertical: 1,
  },
  filterPill: {
    paddingHorizontal: scaleSpacing(10),
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterText: {
    fontSize: scaleFont(10.5),
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: scaleSpacing(24),
    paddingTop: 12,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scaleSpacing(12),
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  txIconContainer: {
    width: scaleSpacing(34),
    height: scaleSpacing(34),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txDetails: {
    marginLeft: scaleSpacing(10),
    flex: 1,
  },
  txTitle: {
    fontSize: scaleFont(13),
    fontWeight: '600',
    marginBottom: 2,
  },
  txCategory: {
    fontSize: scaleFont(10),
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: scaleFont(13.5),
  },
  notesIndicator: {
    marginTop: 2,
  },
  listDivider: {
    height: 0.5,
    width: '100%',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSpacing(40),
    paddingHorizontal: scaleSpacing(20),
    borderRadius: 16,
    marginTop: 20,
  },
  emptyText: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: scaleFont(11),
    textAlign: 'center',
    lineHeight: 16,
  },
});
