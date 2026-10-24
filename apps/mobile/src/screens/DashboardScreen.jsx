import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useAuth } from '@schedulepro/shared/src/contexts/AuthContext';
import { useScheduleContext } from '@schedulepro/shared/src/contexts/ScheduleContext';
import { CheckCircle2, Circle, Clock, Plus } from 'lucide-react-native';
import TaskEditorModal from '../components/TaskEditorModal';

export default function DashboardScreen() {
  const { userProfile } = useAuth();
  const { tasks, toggleCompletion, saveTask } = useScheduleContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayTasks = tasks.filter(t => t.day === today);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalVisible(true);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalVisible(true);
  };

  const onSaveTask = async (taskData) => {
    await saveTask(taskData);
    setIsModalVisible(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="px-6 py-6">
        <View className="mb-8 mt-4">
          <Text className="text-slate-500 text-lg">Hello, {userProfile?.full_name || 'there'} 👋</Text>
          <Text className="text-3xl font-black text-slate-900 mt-1">Today's Schedule</Text>
        </View>

        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-xl font-bold text-slate-900">{today}</Text>
          <Text className="text-blue-600 font-semibold">{todayTasks.length} tasks</Text>
        </View>

        {todayTasks.length === 0 ? (
          <View className="bg-white p-10 rounded-3xl items-center border border-slate-100 shadow-sm mt-4">
            <Text className="text-slate-400 text-center italic">No tasks scheduled for today.</Text>
            <TouchableOpacity onPress={handleAddTask} className="mt-6 bg-blue-100 px-6 py-3 rounded-2xl">
              <Text className="text-blue-600 font-bold">Plan Your Day</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="space-y-4">
            {todayTasks.map((task) => (
              <TouchableOpacity 
                key={task.id}
                onPress={() => handleEditTask(task)}
                className={`bg-white p-5 rounded-3xl flex-row items-center border ${task.isCompleted ? 'border-green-100 opacity-70' : 'border-slate-100'} shadow-sm`}
              >
                <TouchableOpacity 
                  onPress={() => toggleCompletion(task.id)}
                  className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${task.isCompleted ? 'bg-green-50' : 'bg-blue-50'}`}
                >
                  {task.isCompleted ? <CheckCircle2 color="#22c55e" size={24} /> : <Circle color="#3b82f6" size={24} />}
                </TouchableOpacity>
                
                <View className="flex-1">
                  <Text className={`text-lg font-bold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{task.title}</Text>
                  <View className="flex-row items-center mt-1">
                    <Clock size={14} color="#94a3b8" />
                    <Text className="text-slate-400 text-sm ml-1">{task.startTime} - {task.endTime}</Text>
                    <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
                    <Text className="text-slate-400 text-sm capitalize">{task.category}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Spacer for FAB */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating Action Button */}
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
