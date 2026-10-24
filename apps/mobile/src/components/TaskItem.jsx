import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CheckCircle2, Circle, Clock, MessageSquare, AlertCircle } from 'lucide-react-native';

export default function TaskItem({ task, onToggle, onPress }) {
  const getCategoryColor = (cat) => {
    switch (cat) {
      case 'work': return '#3b82f6';
      case 'coding': return '#6366f1';
      case 'spirituality': return '#8b5cf6';
      case 'health': return '#10b981';
      case 'languages': return '#f59e0b';
      case 'literature': return '#ec4899';
      case 'leadership': return '#f97316';
      case 'meals': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress}
      className={`bg-white p-4 rounded-3xl flex-row items-center border ${task.isCompleted ? 'border-green-100 opacity-70' : 'border-slate-100'} shadow-sm mb-3`}
    >
      <TouchableOpacity 
        onPress={() => onToggle(task.id)}
        className={`w-10 h-10 rounded-2xl items-center justify-center mr-3 ${task.isCompleted ? 'bg-green-50' : 'bg-slate-50'}`}
      >
        {task.isCompleted ? <CheckCircle2 color="#22c55e" size={20} /> : <Circle color="#94a3b8" size={20} />}
      </TouchableOpacity>
      
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className={`text-base font-bold ${task.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
            {task.title}
          </Text>
          {task.priority === 'high' && <AlertCircle size={14} color="#ef4444" />}
        </View>
        <View className="flex-row items-center mt-1">
          <Clock size={12} color="#94a3b8" />
          <Text className="text-slate-400 text-xs ml-1">{task.startTime} - {task.endTime}</Text>
          <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
          <View 
            className="px-2 py-0.5 rounded-full" 
            style={{ backgroundColor: getCategoryColor(task.category) + '22' }}
          >
            <Text 
              className="text-[10px] font-bold capitalize" 
              style={{ color: getCategoryColor(task.category) }}
            >
              {task.category}
            </Text>
          </View>
          {task.notes ? (
            <View className="ml-2 flex-row items-center">
              <MessageSquare size={12} color="#94a3b8" />
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
