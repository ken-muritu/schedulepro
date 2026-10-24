import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import { getTasksForDate } from '@schedulepro/shared/src/utils/recurrence';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react-native';
import TaskItem from '../components/TaskItem';
import TaskEditorModal from '../components/TaskEditorModal';

export default function DailyViewScreen() {
  const { tasks, toggleCompletion, saveTask, loading } = useScheduleContext();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  const dateString = selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const dayTasks = useMemo(() => {
    return getTasksForDate(tasks, selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [tasks, selectedDate]);

  const changeDate = (days) => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + days);
    setSelectedDate(next);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const onSaveTask = async (taskData) => {
    const taskWithDay = { 
      ...taskData, 
      day: dayName, 
      date: selectedDate.toISOString().split('T')[0] 
    };
    await saveTask(taskWithDay);
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Date Header */}
      <View className="bg-white px-6 py-4 border-b border-slate-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => changeDate(-1)} className="p-2">
          <ChevronLeft color="#334155" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setSelectedDate(new Date())}
          className="items-center"
        >
          <Text className="text-sm font-bold text-blue-600 uppercase tracking-widest">{dayName}</Text>
          <Text className="text-xl font-black text-slate-900">{dateString}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => changeDate(1)} className="p-2">
          <ChevronRight color="#334155" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView className="px-6 py-4">
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator color="#3b82f6" size="large" />
            <Text className="mt-4 text-slate-500">Loading schedule...</Text>
          </View>
        ) : dayTasks.length === 0 ? (
          <View className="py-20 items-center">
            <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
              <CalendarIcon color="#94a3b8" size={32} />
            </View>
            <Text className="text-slate-400 text-center italic text-lg">Nothing planned for this day.</Text>
            <TouchableOpacity 
              onPress={handleAddTask}
              className="mt-6 bg-blue-600 px-8 py-4 rounded-2xl shadow-lg shadow-blue-600/20"
            >
              <Text className="text-white font-bold">Add Your First Task</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="flex-row items-center justify-between mb-4 mt-2">
              <Text className="text-slate-500 font-bold uppercase text-xs tracking-widest">Timeline</Text>
              <Text className="text-slate-400 text-xs font-bold">{dayTasks.length} total</Text>
            </View>
            {dayTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggle={toggleCompletion} 
                onPress={() => handleEditTask(task)} 
              />
            ))}
          </View>
        )}
        <View className="h-20" />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={{ position: 'absolute', bottom: 30, right: 30 }}
        onPress={handleAddTask}
        className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center shadow-xl shadow-blue-600/40"
      >
        <Plus color="white" size={32} />
      </TouchableOpacity>

      <TaskEditorModal 
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={onSaveTask}
        editingTask={editingTask}
      />
    </SafeAreaView>
  );
}
