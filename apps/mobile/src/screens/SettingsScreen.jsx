import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';
import { User, Mail, LogOut, ChevronRight, Bell, Shield, Moon, CircleUser } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, userProfile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign Out", style: "destructive", onPress: signOut }
      ]
    );
  };

  const SettingItem = ({ icon: Icon, label, value, onPress, color = "#64748b" }) => (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center bg-white p-5 rounded-3xl mb-3 border border-slate-100 shadow-sm"
    >
      <View className="w-10 h-10 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: color + '15' }}>
        <Icon size={20} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-slate-900 font-bold text-base">{label}</Text>
        {value && <Text className="text-slate-500 text-xs mt-0.5">{value}</Text>}
      </View>
      <ChevronRight size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="px-6 py-6">
        <View className="mb-8 mt-4">
          <Text className="text-slate-500 text-lg">Settings</Text>
          <Text className="text-3xl font-black text-slate-900 mt-1">Your Profile</Text>
        </View>

        {/* Profile Card */}
        <View className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-sm items-center mb-10">
          <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-4">
            <CircleUser size={64} color="#3b82f6" strokeWidth={1} />
          </View>
          <Text className="text-2xl font-black text-slate-900">{userProfile?.full_name || 'User'}</Text>
          <Text className="text-slate-500 font-medium">{user?.email}</Text>
          
          <TouchableOpacity className="mt-6 bg-slate-900 px-8 py-3 rounded-full">
            <Text className="text-white font-bold">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-slate-900 font-bold text-xl mb-4 ml-1">Account</Text>
        <SettingItem 
          icon={Mail} 
          label="Email Address" 
          value={user?.email} 
          color="#3b82f6"
        />
        <SettingItem 
          icon={Bell} 
          label="Notifications" 
          value="Enabled" 
          color="#f59e0b"
        />
        <SettingItem 
          icon={Shield} 
          label="Privacy & Security" 
          color="#10b981"
        />

        <Text className="text-slate-900 font-bold text-xl mt-6 mb-4 ml-1">Preferences</Text>
        <SettingItem 
          icon={Moon} 
          label="Dark Mode" 
          value="System Default" 
          color="#6366f1"
        />

        <TouchableOpacity 
          onPress={handleSignOut}
          className="flex-row items-center justify-center bg-red-50 p-5 rounded-3xl mt-10 border border-red-100"
        >
          <LogOut size={20} color="#ef4444" className="mr-2" />
          <Text className="text-red-500 font-bold text-lg ml-2">Sign Out</Text>
        </TouchableOpacity>

        <View className="items-center mt-12 mb-10">
          <Text className="text-slate-300 font-bold uppercase text-[10px] tracking-[4px]">SchedulePro v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
