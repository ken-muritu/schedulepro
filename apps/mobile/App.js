import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@schedulepro/shared/src/contexts/AuthContext';
import { ScheduleProvider } from '@schedulepro/shared/src/contexts/ScheduleContext';
import RootNavigator from './src/navigation/RootNavigator';
import './global.css';

export default function App() {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <RootNavigator />
        <StatusBar style="auto" />
      </ScheduleProvider>
    </AuthProvider>
  );
}
