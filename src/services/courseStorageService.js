import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteCourseEnvironment } from './courseEnvironmentService';

/**
 * Load data for a specific course by its name.
 * @param {string} courseName - The name of the course.
 * @returns {object|null} The course data or null if not found.
 */
export const loadCourseData = async (courseName) => {
  try {
    const data = await AsyncStorage.getItem(`course_${courseName}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Failed to load course data:', error);
    return null;
  }
};

/**
 * Save data for a specific course.
 * @param {string} courseName - The name of the course.
 * @param {object} data - The data to save for the course.
 */
export const saveCourseData = async (courseName, data) => {
  try {
    await AsyncStorage.setItem(`course_${courseName}`, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save course data:', error);
  }
};

/**
 * Delete data for a specific course.
 * @param {string} courseName - The name of the course.
 */
export const deleteCourseData = async (courseName) => {
  try {
    await AsyncStorage.removeItem(`course_${courseName}`);
  } catch (error) {
    console.error('Failed to delete course data:', error);
  }
};

/**
 * Load the list of all courses.
 * @returns {array} The list of all courses.
 */
export const loadCoursesList = async () => {
  try {
    const courses = await AsyncStorage.getItem('courses_list');
    return courses ? JSON.parse(courses) : [];
  } catch (error) {
    console.error('Failed to load courses list:', error);
    return [];
  }
};

/**
 * Save the list of all courses.
 * @param {array} courses - The list of courses to save.
 */
export const saveCoursesList = async (courses) => {
  try {
    await AsyncStorage.setItem('courses_list', JSON.stringify(courses));
  } catch (error) {
    console.error('Failed to save courses list:', error);
  }
};

/**
 * Delete a course from the list of courses and its associated data.
 * @param {string} courseName - The name of the course to delete.
 * @returns {array} The updated list of courses.
 */
export const deleteCourse = async (courseName) => {
  try {
    const courses = await loadCoursesList();
    const updatedCourses = courses.filter((course) => course.name !== courseName);
    await saveCoursesList(updatedCourses);
    await deleteCourseData(courseName); // Delete course metadata
    await deleteCourseEnvironment(courseName); // Delete course environment
    return updatedCourses;
  } catch (error) {
    console.error('Failed to delete course:', error);
    return [];
  }
};

/**
 * Synchronize course metadata with updates.
 * @param {string} courseName - The name of the course.
 * @param {object} updates - The updates to apply to the course metadata.
 */
export const syncCourseMetadata = async (courseName, updates) => {
  try {
    const courseData = (await loadCourseData(courseName)) || {};
    const updatedData = { ...courseData, ...updates };
    await saveCourseData(courseName, updatedData);
  } catch (error) {
    console.error('Failed to sync course metadata:', error);
  }
};
