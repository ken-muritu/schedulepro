import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';
import { LogIn, UserPlus } from 'lucide-react-native';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) Alert.alert('Login Failed', error.message);
      } else {
        const { error } = await signUp(email, password);
        if (error) Alert.alert('Registration Failed', error.message);
        else Alert.alert('Success', 'Profile created! Please check your email and sign in.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-slate-50">
      <View className="flex-1 justify-center px-8 py-12">
        <View className="items-center mb-12">
          <View className="w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center shadow-xl shadow-blue-500/30">
            <Text className="text-white text-4xl font-black">SP</Text>
          </View>
          <Text className="text-3xl font-black text-slate-900 mt-6 text-center">SchedulePro</Text>
          <Text className="text-slate-500 mt-2 text-center text-lg">Master your time, reach your goals</Text>
        </View>

        <View className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <Text className="text-2xl font-bold text-slate-900 mb-8">{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
          
          <View className="space-y-6">
            <View>
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-slate-900"
              />
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-slate-900"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleAuth}
            disabled={loading}
            className={`mt-10 py-5 rounded-2xl items-center shadow-lg ${loading ? 'bg-blue-400' : 'bg-blue-600 shadow-blue-600/20'}`}
          >
            <View className="flex-row items-center">
              {isLogin ? <LogIn color="white" size={20} className="mr-2" /> : <UserPlus color="white" size={20} className="mr-2" />}
              <Text className="text-white font-bold text-lg ml-2">{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsLogin(!isLogin)}
            className="mt-6 items-center"
          >
            <Text className="text-slate-500">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <Text className="text-blue-600 font-bold">{isLogin ? 'Sign Up' : 'Sign In'}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
