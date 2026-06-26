import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Alert, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Header } from '../components/Header';
import { getMonthlyTotals, formatCurrency, getCategoryBreakdown } from '../utils';
import { getCategoryColor, getCategoryIcon } from '../constants/categories';
import { Ionicons } from '@expo/vector-icons';
import { scaleFont, scaleSpacing } from '../constants/theme';
import { FadeInView } from '../components/FadeInView';

export const BudgetScreen = ({ navigation }: any) => {
  const { colors, spacing } = useTheme();
  
  const budget = useFinanceStore((state) => state.budget);
  const updateBudget = useFinanceStore((state) => state.updateBudget);
  const transactions = useFinanceStore((state) => state.transactions);
  const currency = useFinanceStore((state) => state.settings.currency);

  const [newLimit, setNewLimit] = useState(budget.limit.toString());
  const [isEditing, setIsEditing] = useState(false);

  const monthly = getMonthlyTotals(transactions);
  const limit = budget.limit;
  const spent = monthly.expense;
  const remaining = limit - spent;
  const usagePercent = limit > 0 ? (spent / limit) * 100 : 0;
  
  // Category spending for monthly breakdowns
  const categoryBreakdown = getCategoryBreakdown(transactions);

  const handleSaveBudget = () => {
    const limitNum = parseFloat(newLimit);
    if (isNaN(limitNum) || limitNum <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid positive number for your budget limit.');
      return;
    }
    updateBudget(limitNum);
    setIsEditing(false);
    Alert.alert('Success', 'Monthly budget updated successfully.');
  };

  const getDaysRemainingInMonth = () => {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDayOfMonth.getDate() - today.getDate();
  };

  const daysRemaining = getDaysRemainingInMonth();

  // Progress Bar color selector
  let progressBarColor = colors.success;
  if (usagePercent > 100) {
    progressBarColor = colors.error;
  } else if (usagePercent > 80) {
    progressBarColor = colors.warning;
  } else {
    progressBarColor = colors.primary;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Budgets"
        showBackButton
        onBackPress={() => navigation.navigate('DashboardTab')}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
          {/* Main Budget Summary Card */}
          <FadeInView delay={50} duration={400}>
            <Card style={[styles.summaryCard, { borderColor: usagePercent > 80 ? (usagePercent > 100 ? colors.error + '30' : colors.warning + '30') : 'transparent', borderWidth: usagePercent > 80 ? 1 : 0 }]}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Remaining Budget</Text>
                  <Text style={[styles.summaryValue, { color: remaining >= 0 ? colors.text : colors.error }]}>
                    {formatCurrency(remaining, currency)}
                  </Text>
                </View>
                <View style={[styles.badge, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="calendar-outline" size={11} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={[styles.badgeText, { color: colors.primary }]}>{daysRemaining} days left</Text>
                </View>
              </View>

              {/* Linear Progress Bar */}
              <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
                <View style={[styles.progressBar, { width: `${Math.min(usagePercent, 100)}%`, backgroundColor: progressBarColor }]} />
              </View>

              {/* Spent vs Limit details */}
              <View style={styles.summaryBottom}>
                <View style={styles.limitDetails}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Spent</Text>
                  <Text style={[styles.detailVal, { color: colors.text }]}>{formatCurrency(spent, currency)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.limitDetails}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Limit</Text>
                  <Text style={[styles.detailVal, { color: colors.text }]}>{formatCurrency(limit, currency)}</Text>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <View style={styles.limitDetails}>
                  <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Usage</Text>
                  <Text style={[styles.detailVal, { color: progressBarColor }]}>{usagePercent.toFixed(0)}%</Text>
                </View>
              </View>
            </Card>
          </FadeInView>

          {/* Budget Warnings if >80% */}
          {usagePercent > 80 && (
            <FadeInView delay={120} duration={400}>
              <View 
                style={[
                  styles.alertBox, 
                  { 
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                    borderLeftColor: usagePercent > 100 ? colors.error : colors.warning
                  }
                ]}
              >
                <Ionicons 
                  name={usagePercent > 100 ? 'close-circle' : 'warning'} 
                  size={16} 
                  color={usagePercent > 100 ? colors.error : colors.warning} 
                  style={{ marginRight: 10, marginTop: 1 }}
                />
                <Text style={[styles.alertText, { color: colors.text }]}>
                  {usagePercent > 100 
                    ? `You have spent ${formatCurrency(Math.abs(remaining), currency)} over your limit.` 
                    : `You've used ${usagePercent.toFixed(0)}% of your limit. Consider holding off on extra expenses.`
                  }
                </Text>
              </View>
            </FadeInView>
          )}

          {/* Edit Budget Form */}
          <FadeInView delay={200} duration={400}>
            <Card style={styles.formCard}>
              {!isEditing ? (
                <View style={styles.viewBudgetRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.formLabel, { color: colors.textSecondary }]}>Monthly Budget Limit</Text>
                    <Text style={[styles.formValue, { color: colors.text }]}>{formatCurrency(limit, currency)}</Text>
                  </View>
                  <Button 
                    title="Modify" 
                    variant="outline" 
                    onPress={() => {
                      setNewLimit(limit.toString());
                      setIsEditing(true);
                    }}
                    size="small"
                  />
                </View>
              ) : (
                <View style={styles.editBudgetContainer}>
                  <Text style={[styles.formLabel, { color: colors.textSecondary, marginBottom: spacing.xs }]}>
                    Set Monthly Limit
                  </Text>
                  <Input
                    keyboardType="numeric"
                    placeholder="e.g. 2000"
                    value={newLimit}
                    onChangeText={setNewLimit}
                    iconName="cash-outline"
                  />
                  <View style={styles.formActions}>
                    <Button 
                      title="Cancel" 
                      variant="outline" 
                      onPress={() => setIsEditing(false)} 
                      style={styles.actionBtn}
                    />
                    <Button 
                      title="Save Budget" 
                      onPress={handleSaveBudget}
                      style={[styles.actionBtn, { marginLeft: 12 }]}
                    />
                  </View>
                </View>
              )}
            </Card>
          </FadeInView>

          {/* Category-wise Spending Progress */}
          <FadeInView delay={300} duration={400}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Spending</Text>
            {categoryBreakdown.length === 0 ? (
              <Card style={styles.emptyCard} outlined>
                <Text style={{ color: colors.textSecondary, fontSize: scaleFont(12) }}>No expenses recorded this month.</Text>
              </Card>
            ) : (
              <Card style={styles.categoriesContainer}>
                {categoryBreakdown.map((cat, idx) => {
                  const catColor = getCategoryColor(cat.name);
                  const catIcon = getCategoryIcon(cat.name);
                  
                  return (
                    <View key={`${cat.name}-${idx}`}>
                      {idx > 0 && <View style={[styles.listDivider, { backgroundColor: colors.border }]} />}
                      <View style={styles.categoryRow}>
                        <View style={styles.catCardTop}>
                          <View style={styles.catLeft}>
                            <View style={[styles.catIconContainer, { backgroundColor: catColor + '10' }]}>
                              <Ionicons name={catIcon as any} size={15} color={catColor} />
                            </View>
                            <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
                          </View>
                          <Text style={[styles.catAmt, { color: colors.text }]}>
                            {formatCurrency(cat.amount, currency)}
                          </Text>
                        </View>
                        
                        <View style={[styles.catProgressContainer, { backgroundColor: colors.border }]}>
                          <View 
                            style={[
                              styles.catProgressBar, 
                              { 
                                backgroundColor: catColor, 
                                width: `${cat.percentage}%` 
                              }
                            ]} 
                          />
                        </View>

                        <View style={styles.catCardBottom}>
                          <Text style={[styles.catShareLabel, { color: colors.textSecondary }]}>
                            Share of expenses
                          </Text>
                          <Text style={[styles.catShareVal, { color: colors.text }]}>
                            {cat.percentage}%
                          </Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </Card>
            )}
          </FadeInView>
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: scaleFont(20),
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: scaleSpacing(24),
    paddingTop: 16,
  },
  summaryCard: {
    padding: scaleSpacing(18),
    borderRadius: 16,
    marginBottom: 12,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: scaleSpacing(16),
  },
  summaryLabel: {
    fontSize: scaleFont(11),
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: scaleFont(24),
    fontWeight: '800',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: scaleFont(10),
    fontWeight: '700',
  },
  progressContainer: {
    height: scaleSpacing(8),
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: scaleSpacing(16),
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  summaryBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitDetails: {
    flex: 1,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: scaleFont(9),
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  detailVal: {
    fontSize: scaleFont(13),
    fontWeight: '700',
  },
  divider: {
    width: 0.5,
    height: scaleSpacing(18),
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: scaleSpacing(12),
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 14,
  },
  alertText: {
    flex: 1,
    fontSize: scaleFont(11.5),
    fontWeight: '600',
    lineHeight: 16,
  },
  formCard: {
    padding: scaleSpacing(14),
    borderRadius: 14,
    marginBottom: 20,
  },
  viewBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: scaleFont(10),
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  formValue: {
    fontSize: scaleFont(16),
    fontWeight: '700',
  },
  editBudgetContainer: {
    width: '100%',
  },
  formActions: {
    flexDirection: 'row',
    marginTop: 6,
  },
  actionBtn: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: scaleSpacing(18),
    borderRadius: 14,
  },
  categoriesContainer: {
    paddingVertical: 4,
    paddingHorizontal: scaleSpacing(16),
    borderRadius: 16,
  },
  categoryRow: {
    paddingVertical: scaleSpacing(12),
  },
  catCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIconContainer: {
    width: scaleSpacing(28),
    height: scaleSpacing(28),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  catName: {
    fontSize: scaleFont(12.5),
    fontWeight: '600',
  },
  catAmt: {
    fontSize: scaleFont(12.5),
    fontWeight: '700',
  },
  catProgressContainer: {
    height: scaleSpacing(5),
    borderRadius: 2.5,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 6,
  },
  catProgressBar: {
    height: '100%',
    borderRadius: 2.5,
  },
  catCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  catShareLabel: {
    fontSize: scaleFont(9),
  },
  catShareVal: {
    fontSize: scaleFont(9),
    fontWeight: '700',
  },
  listDivider: {
    height: 0.5,
    width: '100%',
  },
});
