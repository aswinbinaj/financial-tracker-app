import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  TextInput,
  Clipboard,
  Platform,
} from 'react-native';
import { useFinanceStore } from '../store/useFinanceStore';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Header } from '../components/Header';
import { getCurrencySymbol } from '../utils';
import { Ionicons } from '@expo/vector-icons';
import { scaleFont, scaleSpacing } from '../constants/theme';
import { FadeInView } from '../components/FadeInView';

export const SettingsScreen = ({ navigation }: any) => {
  const { colors, spacing } = useTheme();

  const settings = useFinanceStore((state) => state.settings);
  const auth = useFinanceStore((state) => state.auth);
  const transactions = useFinanceStore((state) => state.transactions);
  const budget = useFinanceStore((state) => state.budget);
  
  const toggleDarkMode = useFinanceStore((state) => state.toggleDarkMode);
  const setCurrency = useFinanceStore((state) => state.setCurrency);
  const resetAllData = useFinanceStore((state) => state.resetAllData);
  const logout = useFinanceStore((state) => state.logout);
  const updateProfile = useFinanceStore((state) => state.updateProfile);

  // States
  const [profileName, setProfileName] = useState(auth.user?.name || '');
  const [profileEmail, setProfileEmail] = useState(auth.user?.email || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isJsonModalVisible, setIsJsonModalVisible] = useState(false);
  const [currencyDropdownVisible, setCurrencyDropdownVisible] = useState(false);

  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];

  const handleUpdateProfile = () => {
    if (!profileName.trim() || !profileEmail.trim()) {
      Alert.alert('Required Fields', 'Please fill in both name and email.');
      return;
    }
    updateProfile(profileName.trim(), profileEmail.trim());
    setIsEditingProfile(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

  const handleResetData = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Reset All Data\n\nThis will delete all transactions, budget configurations, and settings. This action CANNOT be undone. Proceed?');
      if (confirm) {
        resetAllData();
        alert('All data has been reset to defaults.');
      }
    } else {
      Alert.alert(
        'Reset All Data',
        'This will delete all transactions, budget configurations, and settings. This action CANNOT be undone. Proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset Everything',
            style: 'destructive',
            onPress: () => {
              resetAllData();
              Alert.alert('Cleared', 'All data has been reset to defaults.');
            },
          },
        ]
      );
    }
  };

  const handleExportData = () => {
    const dataToExport = {
      transactions,
      budget,
      settings,
    };
    const jsonStr = JSON.stringify(dataToExport, null, 2);
    try {
      Clipboard.setString(jsonStr);
      Alert.alert(
        'Database Copied',
        'Your finance database has been exported as a JSON string and copied to your clipboard!'
      );
    } catch (e) {
      console.error('Clipboard copy failed', e);
    }
    setIsJsonModalVisible(true);
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm('Sign Out\n\nAre you sure you want to sign out?');
      if (confirm) {
        logout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Settings"
        showBackButton
        onBackPress={() => navigation.navigate('DashboardTab')}
      />

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 }]} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <FadeInView delay={50} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
          <Card style={styles.profileCard}>
            {!isEditingProfile ? (
              <View style={styles.profileRow}>
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Ionicons name="person" size={18} color="#FFFFFF" />
                </View>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: colors.text }]}>
                    {auth.user?.name || 'Guest User'}
                  </Text>
                  <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                    {auth.user?.email || 'guest@example.com'}
                  </Text>
                </View>
                <Button
                  title="Edit"
                  variant="outline"
                  size="small"
                  onPress={() => {
                    setProfileName(auth.user?.name || '');
                    setProfileEmail(auth.user?.email || '');
                    setIsEditingProfile(true);
                  }}
                />
              </View>
            ) : (
              <View style={styles.editProfileContainer}>
                <Input
                  label="Full Name"
                  placeholder="Enter name"
                  value={profileName}
                  onChangeText={setProfileName}
                  iconName="person-outline"
                />
                <Input
                  label="Email Address"
                  placeholder="Enter email"
                  value={profileEmail}
                  onChangeText={setProfileEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  iconName="mail-outline"
                />
                <View style={styles.profileEditActions}>
                  <Button
                    title="Cancel"
                    variant="outline"
                    size="small"
                    onPress={() => setIsEditingProfile(false)}
                    style={styles.profileBtn}
                  />
                  <Button
                    title="Save Profile"
                    size="small"
                    onPress={handleUpdateProfile}
                    style={[styles.profileBtn, { marginLeft: spacing.sm }]}
                  />
                </View>
              </View>
            )}
          </Card>
        </FadeInView>

        {/* Preferences Group */}
        <FadeInView delay={120} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          <Card style={styles.settingsCard}>
            {/* Dark Mode */}
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconWrap, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="moon-outline" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Dark Theme</Text>
              </View>
              <Switch
                value={settings.darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={Platform.OS === 'android' ? colors.surface : undefined}
              />
            </View>

            {/* Currency */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <TouchableOpacity
              style={styles.settingItem}
              activeOpacity={0.6}
              onPress={() => setCurrencyDropdownVisible(!currencyDropdownVisible)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconWrap, { backgroundColor: colors.info + '10' }]}>
                  <Ionicons name="cash-outline" size={16} color={colors.info} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Currency</Text>
              </View>
              <View style={styles.currencySelect}>
                <Text style={[styles.currencyText, { color: colors.primary }]}>
                  {settings.currency} ({getCurrencySymbol(settings.currency)})
                </Text>
                <Ionicons
                  name={currencyDropdownVisible ? 'chevron-up' : 'chevron-down'}
                  size={12}
                  color={colors.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </View>
            </TouchableOpacity>

            {/* Currency Dropdown Expansion */}
            {currencyDropdownVisible && (
              <View style={[styles.dropdownContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                {currencies.map((curr) => (
                  <TouchableOpacity
                    key={curr}
                    onPress={() => {
                      setCurrency(curr);
                      setCurrencyDropdownVisible(false);
                    }}
                    style={[
                      styles.dropdownItem,
                      settings.currency === curr && { backgroundColor: colors.primary + '10' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        { color: colors.text },
                        settings.currency === curr && { color: colors.primary, fontWeight: '700' },
                      ]}
                    >
                      {curr} ({getCurrencySymbol(curr)})
                    </Text>
                    {settings.currency === curr && (
                      <Ionicons name="checkmark" size={12} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>
        </FadeInView>

        {/* Database Options Group */}
        <FadeInView delay={200} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Database</Text>
          <Card style={styles.settingsCard}>
            {/* Export JSON */}
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.6} onPress={handleExportData}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconWrap, { backgroundColor: colors.success + '10' }]}>
                  <Ionicons name="cloud-download-outline" size={16} color={colors.success} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Export Database JSON</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Reset Data */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.6} onPress={handleResetData}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconWrap, { backgroundColor: colors.error + '10' }]}>
                  <Ionicons name="refresh-outline" size={16} color={colors.error} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.error, fontWeight: '600' }]}>
                  Reset All Data
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Sign Out */}
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={styles.settingItem} activeOpacity={0.6} onPress={handleLogout}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconWrap, { backgroundColor: colors.textSecondary + '10' }]}>
                  <Ionicons name="log-out-outline" size={16} color={colors.textSecondary} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Sign Out</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </FadeInView>

        {/* About App */}
        <FadeInView delay={280} duration={400}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>System</Text>
          <Card style={styles.aboutCard}>
            <View style={[styles.aboutIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.aboutTitle, { color: colors.text }]}>Personal Finance Tracker</Text>
            <Text style={[styles.aboutTagline, { color: colors.primary }]}>Secure Ledger & Allocations</Text>
            <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
              Take complete control of your financial journey. Securely track transactions, establish budget limits, customize categories, and build your emergency fund. All your data is saved locally and synced to the cloud.
            </Text>
            
            <View style={[styles.bulletList, { borderColor: colors.border }]}>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} style={{ marginRight: 6 }} />
                <Text style={[styles.bulletText, { color: colors.text }]}>Real-time Cloud Sync</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} style={{ marginRight: 6 }} />
                <Text style={[styles.bulletText, { color: colors.text }]}>Budget limits & Categories</Text>
              </View>
              <View style={styles.bulletItem}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success} style={{ marginRight: 6 }} />
                <Text style={[styles.bulletText, { color: colors.text }]}>Offline-first caching</Text>
              </View>
            </View>

            <Text style={[styles.aboutCredits, { color: colors.textSecondary, marginTop: 4 }]}>
              Version 1.0.0
            </Text>
            <Text style={[styles.aboutCreditsHighlight, { color: colors.primary }]}>
              Powered by Vedhora Digital
            </Text>
          </Card>
        </FadeInView>
      </ScrollView>

      {/* JSON Viewer Modal */}
      <Modal visible={isJsonModalVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBg, borderColor: colors.border, borderTopWidth: 1 }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Exported Database JSON</Text>
              <TouchableOpacity onPress={() => setIsJsonModalVisible(false)}>
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
              The database JSON string is copied to your clipboard. You can paste it into a file to back up your data.
            </Text>
            <ScrollView style={[styles.jsonTextContainer, { backgroundColor: colors.background }]}>
              <TextInput
                multiline
                editable={false}
                value={JSON.stringify({ transactions, budget, settings }, null, 2)}
                style={[styles.jsonTextInput, { color: colors.text }]}
              />
            </ScrollView>
            <Button
              title="Close Panel"
              onPress={() => setIsJsonModalVisible(false)}
              style={styles.modalCloseBtn}
            />
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: scaleFont(14),
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    padding: scaleSpacing(16),
    borderRadius: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: scaleSpacing(40),
    height: scaleSpacing(40),
    borderRadius: scaleSpacing(40) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: scaleSpacing(12),
  },
  profileName: {
    fontSize: scaleFont(15),
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: scaleFont(12),
    marginTop: 2,
  },
  editProfileContainer: {
    width: '100%',
  },
  profileEditActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  profileBtn: {
    flex: 1,
  },
  settingsCard: {
    paddingVertical: 2,
    paddingHorizontal: scaleSpacing(16),
    borderRadius: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: scaleSpacing(12),
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIconWrap: {
    width: scaleSpacing(32),
    height: scaleSpacing(32),
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  settingLabel: {
    fontSize: scaleFont(13.5),
    fontWeight: '600',
  },
  separator: {
    height: 0.5,
  },
  currencySelect: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyText: {
    fontSize: scaleFont(13),
    fontWeight: '700',
  },
  dropdownContainer: {
    borderWidth: 1,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dropdownItemText: {
    fontSize: scaleFont(12.5),
    fontWeight: '600',
  },
  aboutCard: {
    padding: scaleSpacing(16),
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutIconContainer: {
    width: scaleSpacing(48),
    height: scaleSpacing(48),
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutTitle: {
    fontSize: scaleFont(15),
    fontWeight: '700',
    marginBottom: 4,
  },
  aboutTagline: {
    fontSize: scaleFont(12),
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  aboutDesc: {
    fontSize: scaleFont(11.5),
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  bulletList: {
    width: '100%',
    paddingVertical: 10,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    marginVertical: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    paddingHorizontal: 8,
  },
  bulletText: {
    fontSize: scaleFont(12),
    fontWeight: '600',
  },
  aboutCredits: {
    fontSize: scaleFont(10),
  },
  aboutCreditsHighlight: {
    fontSize: scaleFont(12),
    fontWeight: '800',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: scaleSpacing(24),
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: scaleFont(16),
    fontWeight: '700',
  },
  modalDesc: {
    fontSize: scaleFont(11.5),
    lineHeight: 16,
    marginBottom: 14,
  },
  jsonTextContainer: {
    height: 200,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
  },
  jsonTextInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: scaleFont(10.5),
  },
  modalCloseBtn: {
    marginBottom: Platform.OS === 'ios' ? 12 : 0,
  },
});
