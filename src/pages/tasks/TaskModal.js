import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { loadCoursesList } from '../../services/courseStorageService';

const TaskModal = ({ visible, closeModal, onSave, initialTask }) => {
  const [task, setTask] = useState({
    title: '',
    course: '',
    description: '',
    workDate: null,
    submitDate: null,
  });

  const [pickerVisible, setPickerVisible] = useState({ work: false, submit: false });
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (initialTask) {
      setTask(initialTask); // Pre-fill fields if editing
    } else {
      setTask({ title: '', course: '', description: '', workDate: null, submitDate: null });
    }
  }, [initialTask]);

  useEffect(() => {
    const fetchCourses = async () => {
      const loadedCourses = await loadCoursesList();
      setCourses(loadedCourses || []);
    };
    fetchCourses();
  }, []);

  const handleDateConfirm = (date, field) => {
    setTask({ ...task, [field]: date });
    setPickerVisible({ ...pickerVisible, [field]: false });
  };

  const handleSaveTask = () => {
    if (task.title && task.workDate && task.submitDate) {
      onSave(task);
      closeModal();
    } else {
      alert('Please fill in all required fields!');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.heading}>{initialTask ? 'Edit Task' : 'Add Task'}</Text>

          <TextInput
            style={styles.input}
            placeholder="Task Title"
            value={task.title}
            onChangeText={(text) => setTask({ ...task, title: text })}
          />

          <Picker
            selectedValue={task.course}
            onValueChange={(value) => setTask({ ...task, course: value })}
            style={styles.picker}
          >
            <Picker.Item label="Select Course" value="" key="placeholder" />
            {courses.map((course, index) => (
              <Picker.Item key={`course-${index}`} label={course.name} value={course.name} />
            ))}
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Description (Max 7 Words)"
            value={task.description}
            maxLength={50}
            onChangeText={(text) => setTask({ ...task, description: text })}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => setPickerVisible({ ...pickerVisible, work: true })}
          >
            <Text>
              {task.workDate
                ? `Work Date: ${task.workDate.toLocaleString()}`
                : 'Select Work Date & Time'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={pickerVisible.work}
            mode="datetime"
            onConfirm={(date) => handleDateConfirm(date, 'workDate')}
            onCancel={() => setPickerVisible({ ...pickerVisible, work: false })}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={() => setPickerVisible({ ...pickerVisible, submit: true })}
          >
            <Text>
              {task.submitDate
                ? `Submission Date: ${task.submitDate.toLocaleString()}`
                : 'Select Submission Date & Time'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={pickerVisible.submit}
            mode="datetime"
            onConfirm={(date) => handleDateConfirm(date, 'submitDate')}
            onCancel={() => setPickerVisible({ ...pickerVisible, submit: false })}
          />

          <TouchableOpacity style={styles.addButton} onPress={handleSaveTask}>
            <Text style={styles.addButtonText}>{initialTask ? 'Save Changes' : 'Add Task'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeModal}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default TaskModal;

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
  },
  picker: {
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#FF0000',
  },
});
