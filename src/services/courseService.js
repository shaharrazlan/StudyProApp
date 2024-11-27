import AsyncStorage from '@react-native-async-storage/async-storage';

const COURSES_KEY = 'courses';

// Save courses to AsyncStorage
export const saveCoursesToStorage = async (courses) => {
  try {
    await AsyncStorage.setItem(COURSES_KEY, JSON.stringify(courses));
  } catch (error) {
    console.error('Failed to save courses:', error);
  }
};

// Load courses from AsyncStorage
export const loadCoursesFromStorage = async () => {
  try {
    const storedCourses = await AsyncStorage.getItem(COURSES_KEY);
    return storedCourses ? JSON.parse(storedCourses) : [];
  } catch (error) {
    console.error('Failed to load courses:', error);
    return [];
  }
};

// Delete a specific course
export const deleteCourseFromStorage = async (courseName) => {
  try {
    const courses = await loadCoursesFromStorage();
    const updatedCourses = courses.filter((course) => course.name !== courseName);
    await saveCoursesToStorage(updatedCourses);
    return updatedCourses;
  } catch (error) {
    console.error('Failed to delete course:', error);
    return [];
  }
};
