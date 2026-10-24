import React, { useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import { BarChart2, TrendingUp, Target, Award } from 'lucide-react-native';

export default function PerformanceScreen() {
  const { tasks } = useScheduleContext();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    // Group by category
    const categories = {};
    tasks.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + 1;
    });

    return { total, completed, completionRate, categories };
  }, [tasks]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex-1">
      <View className="w-10 h-10 rounded-2xl items-center justify-center mb-3" style={{ backgroundColor: color + '15' }}>
        <Icon size={20} color={color} />
      </View>
      <Text className="text-slate-500 font-bold text-xs uppercase tracking-widest mb-1">{title}</Text>
      <Text className="text-slate-900 font-black text-2xl">{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="px-6 py-6">
        <View className="mb-8 mt-4">
          <Text className="text-slate-500 text-lg">Performance</Text>
          <Text className="text-3xl font-black text-slate-900 mt-1">Your Stats</Text>
        </View>

        <View className="flex-row space-x-4 mb-4">
          <StatCard 
            title="Total Tasks" 
            value={stats.total} 
            icon={Target} 
            color="#3b82f6" 
          />
          <StatCard 
            title="Completed" 
            value={stats.completed} 
            icon={Award} 
            color="#10b981" 
          />
        </View>

        <View className="bg-slate-900 rounded-[40px] p-8 mb-8 shadow-xl shadow-slate-900/20">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-white/60 font-bold uppercase text-xs tracking-[2px]">Completion Rate</Text>
            <TrendingUp color="#10b981" size={20} />
          </View>
          <Text className="text-white text-5xl font-black mb-4">{Math.round(stats.completionRate)}%</Text>
          <View className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <View 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${stats.completionRate}%` }}
            />
          </View>
          <Text className="text-white/40 text-xs mt-4">Keep it up! Consistency is the key to mastery.</Text>
        </View>

        <Text className="text-slate-900 font-bold text-xl mb-4 ml-1">Distribution</Text>
        <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          {Object.entries(stats.categories).map(([cat, count]) => (
            <View key={cat} className="flex-row items-center justify-between">
              <Text className="text-slate-700 font-bold capitalize">{cat}</Text>
              <View className="flex-row items-center">
                <View className="w-32 h-2 bg-slate-50 rounded-full mr-3 overflow-hidden">
                  <View 
                    className="h-full bg-blue-400" 
                    style={{ width: `${(count / stats.total) * 100}%` }}
                  />
                </View>
                <Text className="text-slate-900 font-black w-6 text-right">{count}</Text>
              </View>
            </View>
          ))}
          {Object.keys(stats.categories).length === 0 && (
            <Text className="text-slate-400 text-center italic py-4">No data to display yet.</Text>
          )}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
