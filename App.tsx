import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useFinanceStore } from './src/store/useFinanceStore';

export default function App() {
  const isWeb = Platform.OS === 'web';
  const initializeAuth = useFinanceStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isWeb) {
    return (
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#020617' }}>
        <View style={styles.webWrapper}>
          <View style={styles.webContainer}>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </View>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={{ flex: 1 }}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#020617', // Ultra dark background for desktop canvas
    justifyContent: 'center',
    alignItems: 'center',
  },
  webContainer: {
    width: '100%',
    maxWidth: 500, // Premium mobile aspect ratio constraint on desktop
    height: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
});
