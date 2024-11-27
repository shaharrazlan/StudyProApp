import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import TaskModal from './TaskModal';
import {
  loadActiveTasks,
  loadCompletedTasks,
  saveActiveTasks,
  saveCompletedTasks,
} from '../../services/tasksStorageService';

const Tasks = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskType, setSelectedTaskType] = useState('active');
  const [isEditing, setIsEditing] = useState(false); // New state to differentiate add/edit

  useEffect(() => {
    const fetchTasks = async () => {
      const active = await loadActiveTasks();
      const completed = await loadCompletedTasks();
      setTasks(active);
      setCompletedTasks(completed);
    };
    fetchTasks();
  }, []);

  const saveTasksToStorage = () => {
    saveActiveTasks(tasks);
    saveCompletedTasks(completedTasks);
  };

  useEffect(() => {
    saveTasksToStorage();
  }, [tasks, completedTasks]);

  const openAddModal = () => {
    setIsEditing(false); // Set to add mode
    setSelectedTask(null); // Clear selectedTask
    setModalVisible(true); // Open modal
  };

  const openEditModal = (task) => {
    setIsEditing(true); // Set to edit mode
    setSelectedTask(task); // Set task to be edited
    setModalVisible(true); // Open modal
  };

  const handleSaveTask = (task) => {
    if (isEditing && selectedTask) {
      // Editing an existing task
      if (selectedTaskType === 'active') {
        setTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === selectedTask.id ? { ...t, ...task } : t))
        );
      } else {
        setCompletedTasks((prevTasks) =>
          prevTasks.map((t) => (t.id === selectedTask.id ? { ...t, ...task } : t))
        );
      }
    } else {
      // Adding a new task
      addTask({ ...task, id: Date.now() });
    }

    setModalVisible(false); // Close modal
  };

  const addTask = (task) => {
    setTasks((prevTasks) => [...prevTasks, task]);
  };

  const editTask = () => {
    openEditModal(selectedTask); // Open modal for editing
    setOptionsModalVisible(false); // Close options modal
  };

  const deleteTask = () => {
    if (selectedTaskType === 'active') {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== selectedTask.id));
    } else {
      setCompletedTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== selectedTask.id)
      );
    }
    setOptionsModalVisible(false); // Close options modal
  };

  const openOptionsModal = (task, taskType) => {
    setSelectedTask(task); // Set selected task
    setSelectedTaskType(taskType); // Set task type
    setOptionsModalVisible(true); // Open options modal
  };

  const markTaskAsCompleted = (taskId) => {
    const taskToComplete = tasks.find((task) => task.id === taskId);
    if (taskToComplete) {
      const updatedTasks = tasks.filter((task) => task.id !== taskId);
      const updatedCompletedTasks = [...completedTasks, { ...taskToComplete, completed: true }];
  
      setTasks(updatedTasks);
      setCompletedTasks(updatedCompletedTasks);
    }
  };
  
  const markTaskAsActive = (taskId) => {
    const taskToActivate = completedTasks.find((task) => task.id === taskId);
    if (taskToActivate) {
      const updatedCompletedTasks = completedTasks.filter((task) => task.id !== taskId);
      const updatedTasks = [...tasks, { ...taskToActivate, completed: false }];
  
      setCompletedTasks(updatedCompletedTasks);
      setTasks(updatedTasks);
    }
  };
  
  const renderTaskItem = ({ item }) => {
    const workDate = new Date(item.workDate);
    const formattedTime = workDate.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const formattedDate = workDate.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  
    return (
      <TouchableOpacity
        onPress={() => openOptionsModal(item, 'active')}
        style={styles.taskCard}
      >
        <View style={styles.taskRow}>
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => markTaskAsCompleted(item.id)}
          >
            <MaterialIcons name="check-box-outline-blank" size={24} color="#4B7F79" />
          </TouchableOpacity>
          <Text style={styles.taskTitle}>{item.title}</Text>
        </View>
        {item.course && <Text style={styles.course}>קורס: {item.course}</Text>}
        <View style={styles.descriptionRow}>
          {item.description && <Text style={styles.description}>{item.description}</Text>}
        </View>
        <View style={styles.dateTimeRow}>
          <Text style={styles.time}>{formattedTime}</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </TouchableOpacity>
    );
  };
  

  const renderCompletedTaskItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openOptionsModal(item, 'completed')}
      style={styles.completedTaskCard}
    >
      <View style={styles.taskRow}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => markTaskAsActive(item.id)}
        >
          <MaterialIcons name="check-box" size={24} color="#4B7F79" />
        </TouchableOpacity>
        <Text style={styles.completedTaskTitle}>{item.title}</Text>
      </View>
      {item.course && <Text style={styles.course}>קורס: {item.course}</Text>}
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../../../assets/background1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.topContainer}>
        <Text style={styles.title}>המשימות שלי</Text>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <MaterialIcons name="menu" size={30} color="#4B7F79" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.container}>
        {/* Active Tasks Section */}
        <Text style={styles.sectionTitle}>משימות פעילות</Text>
        {tasks.length > 0 ? (
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTaskItem}
          />
        ) : (
          <Text style={styles.noTasksText}>אין משימות פעילות</Text>
        )}

        {/* Completed Tasks Section */}
        <Text style={styles.sectionTitle}>משימות הושלמו</Text>
        {completedTasks.length > 0 ? (
          <FlatList
            data={completedTasks}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCompletedTaskItem}
          />
        ) : (
          <Text style={styles.noTasksText}>אין משימות הושלמו</Text>
        )}
      </View>

      <TaskModal
        visible={modalVisible}
        closeModal={() => setModalVisible(false)}
        onSave={handleSaveTask}
        initialTask={isEditing && selectedTask ? selectedTask : null} // Only provide task data if editing
      />
      <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
        <Text style={styles.buttonText}>הוסף משימה</Text>
      </TouchableOpacity>

      {/* Options Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={optionsModalVisible}
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={editTask}
            >
              <Text style={styles.optionText}>ערוך</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButtonDelete}
              onPress={deleteTask}
            >
              <Text style={styles.optionText}>מחק</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButtonCancel}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={styles.optionText}>בטל</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

export default Tasks;

const styles = StyleSheet.create({
  // ... (same styles as before, including any new styles)
  background: {
    flex: 1,
  },
  topContainer: {
    backgroundColor: '#FFFFFFDD',
    paddingTop: 50,
    paddingBottom: 20,
    alignItems: 'center',
    position: 'relative',
  },
  menuButton: {
    position: 'absolute',
    right: 16,
    top: 50,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Rubik',
    color: '#4B7F79',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Rubik',
    color: '#4B7F79',
    marginVertical: 10,
    textAlign: 'right',
  },
  noTasksText: {
    fontSize: 16,
    fontFamily: 'RubikItalic',
    color: '#888888',
    textAlign: 'center',
    marginVertical: 10,
  },
  completedTaskCard: {
    backgroundColor: '#E8F6F3',
    padding: 16,
    marginVertical: 5,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  completedTaskTitle: {
    fontSize: 18,
    fontFamily: 'Rubik',
    color: '#333333',
    textDecorationLine: 'line-through',
  },
    taskCard: {
      backgroundColor: '#FFFFFF',
      padding: 16,
      marginVertical: 5,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      position: 'relative', // Allows positioning of elements inside the card
    },
    taskRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
    },
    checkbox: {
      marginLeft: 10,
    },
    taskTitle: {
      fontSize: 18,
      fontFamily: 'Rubik',
      fontWeight: 'bold',
      color: '#333333',
      textAlign: 'right',
      flex: 1,
    },
    course: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#555555',
      marginTop: 5,
      textAlign: 'right',
    },
    descriptionRow: {
      marginVertical: 8,
    },
    description: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#666666',
      textAlign: 'right',
    },
    dateTimeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 10,
    },
    time: {
      fontSize: 12,
      fontFamily: 'Rubik',
      color: '#4B7F79',
      textAlign: 'left',
    },
    date: {
      fontSize: 12,
      fontFamily: 'Rubik',
      color: '#4B7F79',
      textAlign: 'left',
      marginLeft: 10,
    },
  
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#A0D8D5',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Rubik',
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  optionsModal: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#4B7F79',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  optionButtonDelete: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  optionButtonCancel: {
    backgroundColor: '#A0A0A0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
