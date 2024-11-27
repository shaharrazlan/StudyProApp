// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save courses to AsyncStorage
export const saveCourses = async (courses) => {
  try {
    const jsonValue = JSON.stringify(courses);
    await AsyncStorage.setItem('@user_courses', jsonValue);
  } catch (error) {
    console.error('Error saving courses:', error);
  }
};

// Load courses from AsyncStorage
export const loadCourses = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('@user_courses');
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error('Error loading courses:', error);
    return [];
  }
};
