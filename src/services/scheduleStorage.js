// scheduleStorage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Function to load the schedule from AsyncStorage
export const loadSchedule = async () => {
  try {
    const savedSchedule = await AsyncStorage.getItem('weeklyTimetable');
    return savedSchedule ? JSON.parse(savedSchedule) : {};
  } catch (error) {
    console.error('Error loading schedule:', error);
    return {};
  }
};

// Function to save the schedule to AsyncStorage
export const saveSchedule = async (schedule) => {
  try {
    await AsyncStorage.setItem('weeklyTimetable', JSON.stringify(schedule));
  } catch (error) {
    console.error('Error saving schedule:', error);
  }
};


