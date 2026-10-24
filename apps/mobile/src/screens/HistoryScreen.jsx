import React, { useMemo } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import { History as HistoryIcon, CheckCircle2 } from 'lucide-react-native';
import TaskItem from '../components/TaskItem';

export default function HistoryScreen() {
  const { tasks, toggleCompletion, loading } = useScheduleContext();

  const completedTasks = useMemo(() => {
    return tasks
      .filter(t => t.isCompleted)
      .sort((a, b) => {
        const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
        const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
        return dateB - dateA;
      });
  }, [tasks]);

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="px-6 py-6">
        <View className="mb-8 mt-4">
          <Text className="text-slate-500 text-lg">History</Text>
          <Text className="text-3xl font-black text-slate-900 mt-1">Completed Tasks</Text>
        </View>

        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator color="#3b82f6" size="large" />
          </View>
        ) : completedTasks.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
              <HistoryIcon color="#94a3b8" size={32} />
            </View>
            <Text className="text-slate-400 text-center italic text-lg">No history yet.</Text>
            <Text className="text-slate-400 text-center text-sm mt-2">Complete some tasks to see them here!</Text>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-4 mt-2">
              <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest">Recent Success</Text>
              <Text className="text-slate-400 text-xs font-bold">{completedTasks.length} completed</Text>
            </View>
            {completedTasks.map(task => (
              <TaskItem 
                key={`${task.id}_history`} 
                task={task} 
                onToggle={toggleCompletion} 
                onPress={() => {}} 
              />
            ))}
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
