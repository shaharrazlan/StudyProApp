import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Load the data for a specific course environment.
 * @param {string} courseName - The name of the course.
 * @returns {object} The course environment data or default structure if not found.
 */
export const loadCourseEnvironment = async (courseName) => {
  try {
    const data = await AsyncStorage.getItem(`course_env_${courseName}`);
    return data
      ? JSON.parse(data)
      : {
          assignments: [],
          tests: [],
          others: [],
          categoryPercentages: { assignments: 0, tests: 0, others: 0 },
        };
  } catch (error) {
    console.error('Error loading course environment:', error);
    return {
      assignments: [],
      tests: [],
      others: [],
      categoryPercentages: { assignments: 0, tests: 0, others: 0 },
    };
  }
};

/**
 * Save the data for a specific course environment.
 * @param {string} courseName - The name of the course.
 * @param {object} data - The data to save.
 */
export const saveCourseEnvironment = async (courseName, data) => {
  try {
    await AsyncStorage.setItem(`course_env_${courseName}`, JSON.stringify(data));
    console.log(`Saved course data for ${courseName}:`, data);
  } catch (error) {
    console.error('Error saving course environment:', error);
  }
};

/**
 * Delete the data for a specific course environment.
 * @param {string} courseName - The name of the course.
 */
export const deleteCourseEnvironment = async (courseName) => {
  try {
    await AsyncStorage.removeItem(`course_env_${courseName}`);
    console.log('Deleted course data:', courseName);
  } catch (error) {
    console.error('Failed to delete course environment:', error);
  }
};
