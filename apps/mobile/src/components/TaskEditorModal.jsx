import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { X, Clock, Calendar, Tag, AlertCircle } from 'lucide-react-native';

const CATEGORIES = [
  { value: 'work', label: 'Work', color: '#3b82f6' },
  { value: 'coding', label: 'Coding', color: '#6366f1' },
  { value: 'spirituality', label: 'Spirituality', color: '#8b5cf6' },
  { value: 'health', label: 'Health', color: '#10b981' },
  { value: 'languages', label: 'Languages', color: '#f59e0b' },
  { value: 'literature', label: 'Literature', color: '#ec4899' },
  { value: 'leadership', label: 'Leadership', color: '#f97316' },
  { value: 'meals', label: 'Meals', color: '#ef4444' },
  { value: 'chores', label: 'Chores', color: '#64748b' },
  { value: 'leisure', label: 'Leisure', color: '#a855f7' },
];

const defaultFormState = {
  title: '',
  category: 'work',
  date: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '10:00',
  duration: 60,
  priority: 'medium',
  notes: '',
};

export default function TaskEditorModal({ 
  isVisible, 
  onClose, 
  onSave, 
  editingTask = null 
}) {
  const [form, setForm] = useState(defaultFormState);

  useEffect(() => {
    if (isVisible) {
      if (editingTask) {
        setForm({
          ...defaultFormState,
          ...editingTask,
        });
      } else {
        setForm({
          ...defaultFormState,
          date: new Date().toISOString().split('T')[0],
        });
      }
    }
  }, [isVisible, editingTask]);

  const handleSave = () => {
    if (!form.title.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end bg-black/50"
      >
        <View className="bg-white rounded-t-3xl h-[90%] px-6 pt-6 pb-10 shadow-2xl">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-2xl font-black text-slate-900">
              {editingTask ? 'Edit Task' : 'New Task'}
            </Text>
            <TouchableOpacity onPress={onClose} className="p-2 bg-slate-100 rounded-full">
              <X color="#64748b" size={20} />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="space-y-6">
              {/* Title Section */}
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Task Title</Text>
                <TextInput
                  value={form.title}
                  onChangeText={(val) => setForm({ ...form, title: val })}
                  placeholder="What are you planning?"
                  className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-slate-900 text-lg"
                />
              </View>

              {/* Category Picker */}
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Category</Text>
                <View className="flex-row flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      onPress={() => setForm({ ...form, category: cat.value })}
                      className={`px-4 py-2 rounded-full border ${
                        form.category === cat.value 
                          ? 'bg-blue-600 border-blue-600' 
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <Text className={`font-bold ${form.category === cat.value ? 'text-white' : 'text-slate-600'}`}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time Section */}
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Start Time</Text>
                  <View className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl flex-row items-center">
                    <Clock size={18} color="#94a3b8" className="mr-2" />
                    <TextInput
                      value={form.startTime}
                      onChangeText={(val) => setForm({ ...form, startTime: val })}
                      placeholder="09:00"
                      className="text-slate-900 flex-1 ml-2"
                    />
                  </View>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">End Time</Text>
                  <View className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl flex-row items-center">
                    <Clock size={18} color="#94a3b8" className="mr-2" />
                    <TextInput
                      value={form.endTime}
                      onChangeText={(val) => setForm({ ...form, endTime: val })}
                      placeholder="10:00"
                      className="text-slate-900 flex-1 ml-2"
                    />
                  </View>
                </View>
              </View>

              {/* Date Section */}
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Date</Text>
                <View className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl flex-row items-center">
                  <Calendar size={18} color="#94a3b8" />
                  <TextInput
                    value={form.date}
                    onChangeText={(val) => setForm({ ...form, date: val })}
                    placeholder="YYYY-MM-DD"
                    className="text-slate-900 flex-1 ml-3"
                  />
                </View>
              </View>

              {/* Notes */}
              <View>
                <Text className="text-sm font-bold text-slate-700 mb-2 ml-1">Notes</Text>
                <TextInput
                  value={form.notes}
                  onChangeText={(val) => setForm({ ...form, notes: val })}
                  placeholder="Any details or links..."
                  multiline
                  numberOfLines={4}
                  className="bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-slate-900 min-h-[100px] text-left"
                  textAlignVertical="top"
                />
              </View>
            </View>
            
            <View className="h-10" />
          </ScrollView>

          {/* Action Buttons */}
          <View className="flex-row space-x-4 mt-6">
            <TouchableOpacity 
              onPress={onClose}
              className="flex-1 py-4 rounded-2xl border border-slate-200 items-center"
            >
              <Text className="text-slate-600 font-bold text-lg">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={handleSave}
              className="flex-1 py-4 rounded-2xl bg-blue-600 items-center shadow-lg shadow-blue-600/30"
            >
              <Text className="text-white font-bold text-lg">Save Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
