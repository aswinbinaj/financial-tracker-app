import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { FadeInView } from '../components/FadeInView';
import { getTotals, getMonthlyTotals, formatCurrency, formatDate } from '../utils';
import { getCategoryIcon, getCategoryColor } from '../constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { scaleFont, scaleSpacing } from '../constants/theme';

export const DashboardScreen = ({ navigation }: any) => {
  const { colors, spacing, shadows } = useTheme();
  
  const transactions = useFinanceStore((state) => state.transactions);
  const budget = useFinanceStore((state) => state.budget);
  const currency = useFinanceStore((state) => state.settings.currency);
  const user = useFinanceStore((state) => state.auth.user);

  // Computations
  const totals = getTotals(transactions);
  const monthly = getMonthlyTotals(transactions);
  const budgetLimit = budget.limit;
  
  const budgetUsagePercent = budgetLimit > 0 ? (monthly.expense / budgetLimit) * 100 : 0;
  const showBudgetWarning = monthly.expense > budgetLimit * 0.8;

  // Top 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.background === '#08090A' ? 'light-content' : 'dark-content'} />
      
      {/* Top Header */}
      <View style={[styles.headerContainer, { paddingHorizontal: spacing.md, paddingVertical: spacing.md }]}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user ? getInitials(user.name) : 'U'}</Text>
          </View>
          <View style={styles.welcomeTextContainer}>
            <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.welcomeName, { color: colors.text }]}>{user ? user.name : 'Guest'}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate('SettingsTab')} 
          style={[styles.headerIconButton, { borderColor: colors.border }]}
        >
          <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: 110 }]} showsVerticalScrollIndicator={false}>
        {/* Sleek Balance Card */}
        <FadeInView delay={50} duration={400}>
          <Card style={styles.balanceCard}>
            <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Total Balance</Text>
            <Text style={[styles.balanceValue, { color: colors.text }]}>{formatCurrency(totals.balance, currency)}</Text>
            
            <View style={[styles.balanceDivider, { backgroundColor: colors.border }]} />

            <View style={styles.balanceRow}>
              {/* Income */}
              <View style={styles.balanceItem}>
                <View style={styles.balanceHeader}>
                  <Ionicons name="arrow-down" size={11} color={colors.success} style={{ marginRight: 4 }} />
                  <Text style={[styles.balanceItemLabel, { color: colors.textSecondary }]}>Income</Text>
                </View>
                <Text style={[styles.balanceItemValue, { color: colors.success }]}>
                  {formatCurrency(totals.income, currency)}
                </Text>
              </View>

              {/* Vertical Divider */}
              <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

              {/* Expense */}
              <View style={styles.balanceItem}>
                <View style={styles.balanceHeader}>
                  <Ionicons name="arrow-up" size={11} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.balanceItemLabel, { color: colors.textSecondary }]}>Expenses</Text>
                </View>
                <Text style={[styles.balanceItemValue, { color: colors.text }]}>
                  {formatCurrency(totals.expense, currency)}
                </Text>
              </View>
            </View>
          </Card>
        </FadeInView>

        {/* Budget Alert Banner */}
        {showBudgetWarning && (
          <Card style={[styles.warningCard, { borderColor: colors.error + '30', borderWidth: 1 }]}>
            <View style={styles.warningHeader}>
              <Ionicons name="warning" size={18} color={colors.error} />
              <View style={styles.warningTextContainer}>
                <Text style={[styles.warningTitle, { color: colors.text }]}>
                  {monthly.expense > budgetLimit ? 'Budget Exceeded' : 'Budget Alert'}
                </Text>
                <Text style={[styles.warningDesc, { color: colors.textSecondary }]}>
                  Spent {budgetUsagePercent.toFixed(0)}% of your monthly budget ({formatCurrency(monthly.expense, currency)} / {formatCurrency(budgetLimit, currency)}).
                </Text>
              </View>
            </View>
            <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: colors.error, 
                    width: `${Math.min(budgetUsagePercent, 100)}%` 
                  }
                ]} 
              />
            </View>
          </Card>
        )}

        {/* Compact Quick Actions */}
        <FadeInView delay={150} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: spacing.md }]}>Quick Actions</Text>
          <View style={[styles.quickActionsContainer, { paddingHorizontal: spacing.md }]}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('AddTransaction', { defaultType: 'income' })}
              style={styles.actionItem}
            >
              <View style={[styles.actionCircle, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="add" size={20} color={colors.success} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Add Income</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('AddTransaction', { defaultType: 'expense' })}
              style={styles.actionItem}
            >
              <View style={[styles.actionCircle, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="remove" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>Add Expense</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => navigation.navigate('BudgetTab')}
              style={styles.actionItem}
            >
              <View style={[styles.actionCircle, { backgroundColor: colors.info + '15' }]}>
                <Ionicons name="wallet-outline" size={18} color={colors.info} />
              </View>
              <Text style={[styles.actionLabel, { color: colors.text }]}>My Budgets</Text>
            </TouchableOpacity>
          </View>
        </FadeInView>

        {/* Recent Transactions List (Grouped inside a single Card) */}
        <FadeInView delay={250} duration={400}>
          <View style={[styles.sectionHeader, { paddingHorizontal: spacing.md }]}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginHorizontal: 0 }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={{ paddingHorizontal: spacing.md }}>
            {recentTransactions.length === 0 ? (
              <Card style={styles.emptyCard} outlined>
                <Ionicons name="receipt-outline" size={28} color={colors.textSecondary} style={{ marginBottom: 12 }} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions yet.</Text>
                <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>Tap the float button to record a transaction.</Text>
              </Card>
            ) : (
              <Card style={styles.transactionsListContainer}>
                {recentTransactions.map((tx, idx) => {
                  const isIncome = tx.type === 'income';
                  const catColor = getCategoryColor(tx.category);
                  const catIcon = getCategoryIcon(tx.category);

                  return (
                    <View key={tx.id}>
                      {idx > 0 && <View style={[styles.listDivider, { backgroundColor: colors.border }]} />}
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => navigation.navigate('AddTransaction', { transactionId: tx.id })}
                        style={styles.txRow}
                      >
                        <View style={styles.txLeft}>
                          <View style={[styles.txIconContainer, { backgroundColor: catColor + '10' }]}>
                            <Ionicons name={catIcon as any} size={16} color={catColor} />
                          </View>
                          <View style={styles.txDetails}>
                            <Text style={[styles.txTitle, { color: colors.text }]} numberOfLines={1}>
                              {tx.title}
                            </Text>
                            <Text style={[styles.txCategory, { color: colors.textSecondary }]}>
                              {tx.category} • {formatDate(tx.date)}
                            </Text>
                          </View>
                        </View>
                        <Text 
                          style={[
                            styles.txAmount, 
                            { color: isIncome ? colors.success : colors.text, fontWeight: '600' }
                          ]}
                        >
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </Card>
            )}
          </View>
        </FadeInView>
      </ScrollView>

      {/* Floating Add Transaction Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('AddTransaction')}
        style={[styles.fab, { backgroundColor: colors.primary }, shadows]}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    paddingTop: 4,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: scaleSpacing(38),
    height: scaleSpacing(38),
    borderRadius: scaleSpacing(38) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: scaleFont(13),
    fontWeight: '700',
  },
  welcomeTextContainer: {
    marginLeft: scaleSpacing(10),
  },
  welcomeSub: {
    fontSize: scaleFont(11),
    fontWeight: '500',
  },
  welcomeName: {
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  headerIconButton: {
    width: scaleSpacing(36),
    height: scaleSpacing(36),
    borderRadius: scaleSpacing(36) / 2,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: scaleSpacing(16),
    marginVertical: scaleSpacing(12),
    padding: scaleSpacing(20),
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: scaleFont(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  balanceValue: {
    fontSize: scaleFont(28),
    fontWeight: '800',
    marginBottom: scaleSpacing(16),
  },
  balanceDivider: {
    height: 1,
    width: '100%',
    marginBottom: scaleSpacing(16),
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  balanceItemLabel: {
    fontSize: scaleFont(11),
    fontWeight: '600',
  },
  balanceItemValue: {
    fontSize: scaleFont(14),
    fontWeight: '700',
  },
  verticalDivider: {
    width: 1,
    height: scaleSpacing(24),
    marginHorizontal: scaleSpacing(16),
  },
  warningCard: {
    marginHorizontal: scaleSpacing(16),
    marginBottom: scaleSpacing(16),
    padding: scaleSpacing(14),
    borderRadius: 14,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningTextContainer: {
    marginLeft: scaleSpacing(10),
    flex: 1,
  },
  warningTitle: {
    fontSize: scaleFont(13),
    fontWeight: '700',
  },
  warningDesc: {
    fontSize: scaleFont(11),
    lineHeight: 14,
  },
  progressContainer: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: scaleSpacing(8),
    marginBottom: scaleSpacing(8),
  },
  sectionTitle: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    marginTop: scaleSpacing(8),
    marginBottom: scaleSpacing(6),
  },
  seeAllText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: scaleSpacing(12),
    paddingVertical: 4,
  },
  actionItem: {
    alignItems: 'center',
    width: scaleSpacing(80),
  },
  actionCircle: {
    width: scaleSpacing(44),
    height: scaleSpacing(44),
    borderRadius: scaleSpacing(44) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: scaleFont(10.5),
    fontWeight: '600',
    textAlign: 'center',
  },
  transactionsListContainer: {
    paddingVertical: 4,
    paddingHorizontal: scaleSpacing(16),
    borderRadius: 16,
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
  txAmount: {
    fontSize: scaleFont(13.5),
  },
  listDivider: {
    height: 0.5,
    width: '100%',
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSpacing(30),
    paddingHorizontal: scaleSpacing(20),
    borderRadius: 16,
  },
  emptyText: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    marginBottom: 4,
  },
  emptySubText: {
    fontSize: scaleFont(11),
    textAlign: 'center',
    lineHeight: 16,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    right: 16,
    width: scaleSpacing(48),
    height: scaleSpacing(48),
    borderRadius: scaleSpacing(48) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
});
