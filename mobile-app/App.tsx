import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  const { width } = useWindowDimensions();
  const isWebLargeScreen = Platform.OS === 'web' && width > 540;

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <View style={[styles.rootContainer, isWebLargeScreen && styles.webDesktopWrapper]}>
        <View style={[styles.appFrame, isWebLargeScreen && styles.webDesktopFrame]}>
          <AuthProvider>
            <NavigationContainer>
              <RootNavigator />
              <StatusBar style="dark" />
            </NavigationContainer>
          </AuthProvider>
        </View>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  rootContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  appFrame: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  webDesktopWrapper: {
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  webDesktopFrame: {
    maxWidth: 480,
    height: '100%',
    maxHeight: 960,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    ...Platform.select({
      web: {
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      } as any,
      default: {},
    }),
  },
});
