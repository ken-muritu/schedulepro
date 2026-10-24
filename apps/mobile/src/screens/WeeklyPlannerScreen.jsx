import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import { CalendarDays, ChevronRight, BarChart } from 'lucide-react-native';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function WeeklyPlannerScreen() {
  const { tasks } = useScheduleContext();

  const weekData = useMemo(() => {
    const today = new Date();
    const sun = new Date(today);
    sun.setDate(today.getDate() - today.getDay());

    return DAYS.map((dayName, i) => {
      const date = new Date(sun);
      date.setDate(sun.getDate() + i);
      const dayTasks = tasks.filter(t => t.day === dayName);
      return {
        name: dayName,
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        taskCount: dayTasks.length,
        completedCount: dayTasks.filter(t => t.isCompleted).length,
      };
    });
  }, [tasks]);

  const totalTasks = weekData.reduce((sum, d) => sum + d.taskCount, 0);
  const totalCompleted = weekData.reduce((sum, d) => sum + d.completedCount, 0);
  const progress = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="px-6 py-6">
        <View className="mb-8 mt-4">
          <Text className="text-slate-500 text-lg">Your Week</Text>
          <Text className="text-3xl font-black text-slate-900 mt-1">Weekly Planner</Text>
        </View>

        {/* Weekly Stats Card */}
        <View className="bg-blue-600 rounded-3xl p-6 mb-8 shadow-xl shadow-blue-600/30">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white/80 font-bold uppercase text-xs tracking-widest">Efficiency</Text>
            <BarChart color="white" size={20} />
          </View>
          <Text className="text-white text-4xl font-black mb-2">{Math.round(progress)}%</Text>
          <Text className="text-white/60 text-sm">You've completed {totalCompleted} out of {totalTasks} tasks this week.</Text>
          
          <View className="w-full h-2 bg-white/20 rounded-full mt-6 overflow-hidden">
            <View 
              className="h-full bg-white rounded-full" 
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>

        <View className="space-y-4">
          <Text className="text-slate-900 font-bold text-xl mb-2">Daily Overviews</Text>
          {weekData.map((day) => (
            <TouchableOpacity 
              key={day.name}
              className="bg-white p-5 rounded-3xl flex-row items-center border border-slate-100 shadow-sm"
            >
              <View className="w-14 items-center mr-4 border-r border-slate-100 pr-4">
                <Text className="text-slate-400 font-bold text-xs uppercase">{day.month}</Text>
                <Text className="text-slate-900 font-black text-2xl">{day.date}</Text>
              </View>
              
              <View className="flex-1">
                <Text className="text-slate-900 font-bold text-lg">{day.name}</Text>
                <Text className="text-slate-500 text-sm">
                  {day.taskCount === 0 
                    ? 'No tasks scheduled' 
                    : `${day.taskCount} tasks • ${day.completedCount} completed`}
                </Text>
              </View>
              
              <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>
          ))}
        </View>

        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
