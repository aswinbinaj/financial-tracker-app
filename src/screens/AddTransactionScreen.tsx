import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../hooks/useTheme';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Header } from '../components/Header';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants/categories';
import { TransactionType } from '../types';
import { Ionicons } from '@expo/vector-icons';
import { scaleFont, scaleSpacing } from '../constants/theme';
import { FadeInView } from '../components/FadeInView';

interface TransactionForm {
  title: string;
  amount: string;
  type: TransactionType;
  category: string;
  date: string;
  notes: string;
}

export const AddTransactionScreen = ({ route, navigation }: any) => {
  const { colors, spacing, shadows } = useTheme();
  
  const addTransaction = useFinanceStore((state) => state.addTransaction);
  const editTransaction = useFinanceStore((state) => state.editTransaction);
  const deleteTransaction = useFinanceStore((state) => state.deleteTransaction);
  const transactions = useFinanceStore((state) => state.transactions);

  const transactionId = route.params?.transactionId;
  const defaultType = route.params?.defaultType || 'expense';

  const editTx = transactionId ? transactions.find((t) => t.id === transactionId) : null;
  const isEditing = !!editTx;

  const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<TransactionForm>({
    defaultValues: {
      title: editTx?.title || '',
      amount: editTx?.amount ? editTx.amount.toString() : '',
      type: editTx?.type || defaultType,
      category: editTx?.category || '',
      date: editTx?.date || new Date().toISOString().split('T')[0],
      notes: editTx?.notes || '',
    },
  });

  const selectedType = watch('type');
  const selectedCategory = watch('category');
  const categoriesList = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Reset category if type changes and is not compatible
  useEffect(() => {
    const list = selectedType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const isCompatible = list.some((c) => c.name === selectedCategory);
    if (!isCompatible && !isEditing) {
      setValue('category', '');
    }
  }, [selectedType, setValue, selectedCategory, isEditing]);

  const onSubmit = (data: TransactionForm) => {
    const amountNum = parseFloat(data.amount);
    
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number for amount.');
      return;
    }

    if (!data.category) {
      Alert.alert('Category Required', 'Please select a category.');
      return;
    }

    const payload = {
      title: data.title.trim(),
      amount: amountNum,
      type: data.type,
      category: data.category,
      date: data.date,
      notes: data.notes.trim(),
    };

    if (isEditing && transactionId) {
      editTransaction(transactionId, payload);
    } else {
      addTransaction(payload);
    }

    navigation.goBack();
  };

  const handleDelete = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Delete Transaction\n\nAre you sure you want to delete this transaction permanently?');
      if (confirm) {
        if (transactionId) {
          deleteTransaction(transactionId);
          navigation.goBack();
        }
      }
    } else {
      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to delete this transaction permanently?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => {
              if (transactionId) {
                deleteTransaction(transactionId);
                navigation.goBack();
              }
            }
          }
        ]
      );
    }
  };

  const setQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    setValue('date', d.toISOString().split('T')[0]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <Header
        title={isEditing ? 'Edit Transaction' : 'Add Transaction'}
        showBackButton
        rightAction={
          isEditing ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
              <Ionicons name="trash-outline" size={20} color={colors.error} />
            </TouchableOpacity>
          ) : undefined
        }
      />
      
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <FadeInView delay={50} duration={400}>
          {/* Type Selector */}
          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View style={[styles.typeSelector, { backgroundColor: colors.border }]}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onChange('expense')}
                  style={[
                    styles.typeTab,
                    value === 'expense' && { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: value === 'expense' ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    Expense
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => onChange('income')}
                  style={[
                    styles.typeTab,
                    value === 'income' && { backgroundColor: colors.success },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeText,
                      { color: value === 'income' ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    Income
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />

          {/* Input Fields */}
          <Controller
            control={control}
            name="title"
            rules={{ required: 'Title is required', minLength: { value: 2, message: 'Too short' } }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Transaction Title"
                placeholder="e.g. Starbucks Coffee"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.title?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="amount"
            rules={{ required: 'Amount is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Amount"
                placeholder="0.00"
                keyboardType="numeric"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.amount?.message}
                iconName="cash-outline"
              />
            )}
          />

          {/* Categories Grid */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Select Category</Text>
          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, value } }) => (
              <View style={styles.categoriesGrid}>
                {categoriesList.map((cat) => {
                  const isSelected = value === cat.name;
                  return (
                    <TouchableOpacity
                      key={cat.name}
                      onPress={() => onChange(cat.name)}
                      activeOpacity={0.7}
                      style={[
                        styles.categoryCard,
                        { backgroundColor: colors.cardBg },
                        isSelected && { borderColor: cat.color, borderWidth: 1.5, transform: [{ scale: 1.02 }] },
                      ]}
                    >
                      <View style={[styles.catIconWrap, { backgroundColor: cat.color + '10' }]}>
                        <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                      </View>
                      <Text style={[styles.catLabel, { color: colors.text }]} numberOfLines={1}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          />

          {/* Date Field & Shortcuts */}
          <Controller
            control={control}
            name="date"
            rules={{ required: 'Date is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <Input
                  label="Date (YYYY-MM-DD)"
                  placeholder="YYYY-MM-DD"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.date?.message}
                  iconName="calendar-outline"
                />
                <View style={styles.quickDateRow}>
                  <TouchableOpacity 
                    onPress={() => setQuickDate(0)} 
                    style={[styles.quickDateBtn, { backgroundColor: colors.border }]}
                  >
                    <Text style={[styles.quickDateText, { color: colors.text }]}>Today</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setQuickDate(1)} 
                    style={[styles.quickDateBtn, { backgroundColor: colors.border }]}
                  >
                    <Text style={[styles.quickDateText, { color: colors.text }]}>Yesterday</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Notes */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Notes (Optional)"
                placeholder="Add details about this transaction..."
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                multiline
                numberOfLines={3}
                style={styles.notesInput}
              />
            )}
          />

          {/* Submit */}
          <Button
            title={isEditing ? 'Save Changes' : 'Add Transaction'}
            onPress={handleSubmit(onSubmit)}
            variant={selectedType === 'income' ? 'secondary' : 'primary'}
            size="large"
            style={styles.submitBtn}
          />
        </FadeInView>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    padding: scaleSpacing(20),
    paddingBottom: 48,
  },
  deleteBtn: {
    padding: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    height: scaleSpacing(44),
    borderRadius: 12,
    padding: 4,
    marginBottom: scaleSpacing(20),
  },
  typeTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  typeText: {
    fontSize: scaleFont(13.5),
    fontWeight: '700',
  },
  sectionLabel: {
    fontSize: scaleFont(11.5),
    fontWeight: '600',
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: scaleSpacing(16),
  },
  categoryCard: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: scaleSpacing(10),
    borderRadius: 12,
    marginBottom: scaleSpacing(8),
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  catIconWrap: {
    width: scaleSpacing(34),
    height: scaleSpacing(34),
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  catLabel: {
    fontSize: scaleFont(10.5),
    fontWeight: '700',
  },
  quickDateRow: {
    marginTop: -8,
    marginBottom: scaleSpacing(16),
    flexDirection: 'row',
  },
  quickDateBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginRight: 6,
  },
  quickDateText: {
    fontSize: scaleFont(10.5),
    fontWeight: '600',
  },
  notesInput: {
    height: 70,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 8,
  },
});
