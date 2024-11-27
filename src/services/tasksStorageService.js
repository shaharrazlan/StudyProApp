import AsyncStorage from '@react-native-async-storage/async-storage';

const ACTIVE_TASKS_KEY = 'active_tasks_data';
const COMPLETED_TASKS_KEY = 'completed_tasks_data';


export const saveActiveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(ACTIVE_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving active tasks:', error);
  }
};

// Save completed tasks
export const saveCompletedTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(COMPLETED_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Error saving completed tasks:', error);
  }
};

// Load active tasks
export const loadActiveTasks = async () => {
  try {
    const tasks = await AsyncStorage.getItem(ACTIVE_TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading active tasks:', error);
    return [];
  }
};

// Load completed tasks
export const loadCompletedTasks = async () => {
  try {
    const tasks = await AsyncStorage.getItem(COMPLETED_TASKS_KEY);
    return tasks ? JSON.parse(tasks) : [];
  } catch (error) {
    console.error('Error loading completed tasks:', error);
    return [];
  }
};


// Delete task from active or completed lists
export const deleteTask = async (id, currentTasks, isCompleted = false) => {
  try {
    const updatedTasks = currentTasks.filter((task) => task.id !== id);
    if (isCompleted) {
      await saveCompletedTasks(updatedTasks);
    } else {
      await saveActiveTasks(updatedTasks);
    }
    return updatedTasks;
  } catch (error) {
    console.error('Error deleting task:', error);
    return currentTasks;
  }
};

