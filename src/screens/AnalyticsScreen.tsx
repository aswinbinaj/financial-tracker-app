import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { CustomPieChart } from '../components/CustomPieChart';
import { CustomBarChart } from '../components/CustomBarChart';
import { CustomLineChart } from '../components/CustomLineChart';
import { getCategoryBreakdown, getSixMonthTrend, getFinancialInsights, getTotals, formatCurrency } from '../utils';
import { Ionicons } from '@expo/vector-icons';
import { FadeInView } from '../components/FadeInView';

export const AnalyticsScreen = ({ navigation }: any) => {
  const { colors, spacing } = useTheme();
  
  const transactions = useFinanceStore((state) => state.transactions);
  const budget = useFinanceStore((state) => state.budget);
  const currency = useFinanceStore((state) => state.settings.currency);

  // Computations
  const totals = getTotals(transactions);
  const pieData = getCategoryBreakdown(transactions);
  const trendData = getSixMonthTrend(transactions);
  const insights = getFinancialInsights(transactions, budget.limit);
  
  const savingsPercent = totals.income > 0 ? ((totals.income - totals.expense) / totals.income) * 100 : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Analytics"
        showBackButton
        onBackPress={() => navigation.navigate('DashboardTab')}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
        {/* Savings Performance Card */}
        <FadeInView delay={50} duration={400}>
          <Card style={styles.savingsCard}>
            <View style={styles.savingsHeader}>
              <View style={[styles.iconWrap, { backgroundColor: colors.success + '10' }]}>
                <Ionicons name="sparkles" size={16} color={colors.success} />
              </View>
              <View style={styles.savingsTitleBlock}>
                <Text style={[styles.savingsLabel, { color: colors.textSecondary }]}>Savings Rate</Text>
                <Text style={[styles.savingsVal, { color: colors.text }]}>
                  {savingsPercent > 0 ? `${savingsPercent.toFixed(0)}%` : '0%'}
                </Text>
              </View>
            </View>
            <View style={[styles.savingsProgressContainer, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.savingsProgressBar, 
                  { 
                    backgroundColor: colors.success, 
                    width: `${Math.max(0, Math.min(savingsPercent, 100))}%` 
                  }
                ]} 
              />
            </View>
            <Text style={[styles.savingsSubtext, { color: colors.textSecondary }]}>
              Saved {formatCurrency(Math.max(0, totals.income - totals.expense), currency)} of your total {formatCurrency(totals.income, currency)} income.
            </Text>
          </Card>
        </FadeInView>

        {/* Financial Insights */}
        <FadeInView delay={150} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Insights</Text>
          <View style={styles.insightsList}>
            {insights.map((insight, index) => {
              // Determine dynamic left accent border color based on alert icon
              let indicatorColor = colors.info;
              if (insight.includes('🚨')) {
                indicatorColor = colors.error;
              } else if (insight.includes('⚠️')) {
                indicatorColor = colors.warning;
              } else if (insight.includes('🎉')) {
                indicatorColor = colors.success;
              }

              const rawText = insight.replace('⚠️ ', '').replace('🚨 ', '').replace('🎉 ', '').replace('🔍 ', '').replace('💡 ', '');

              return (
                <View 
                  key={`insight-${index}`} 
                  style={[
                    styles.insightBox, 
                    { 
                      backgroundColor: colors.cardBg, 
                      borderLeftColor: indicatorColor,
                      borderColor: colors.border
                    }
                  ]}
                >
                  <Text style={[styles.insightText, { color: colors.text }]}>
                    {rawText}
                  </Text>
                </View>
              );
            })}
          </View>
        </FadeInView>

        {/* Expenses Breakdown Pie Chart */}
        <FadeInView delay={250} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Breakdown</Text>
          <Card style={styles.chartCard}>
            <CustomPieChart data={pieData} currency={currency} />
          </Card>
        </FadeInView>

        {/* Income vs Expenses Bar Chart */}
        <FadeInView delay={350} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Income vs Expense</Text>
          <Card style={styles.chartCard}>
            <CustomBarChart data={trendData} />
          </Card>
        </FadeInView>

        {/* Expenses Trend Line Chart */}
        <FadeInView delay={450} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending Trend</Text>
          <Card style={styles.chartCard}>
            <CustomLineChart data={trendData} />
          </Card>
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    borderBottomWidth: 1,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  savingsCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 6,
  },
  savingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  savingsTitleBlock: {
    flex: 1,
  },
  savingsLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  savingsVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  savingsProgressContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  savingsProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
  savingsSubtext: {
    fontSize: 10,
    lineHeight: 14,
  },
  insightsList: {
    width: '100%',
  },
  insightBox: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  insightText: {
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  chartCard: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
});
