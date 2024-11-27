import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ImageBackground,
} from 'react-native';
import AddCourseModal from './AddCourseModal';
import {
  loadCoursesList,
  saveCoursesList,
  deleteCourse,
  saveCourseData,
} from '../../services/courseStorageService';
import Icon from 'react-native-vector-icons/MaterialIcons'; // For menu icon

const CoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);

  // Load the list of courses on component mount
  useEffect(() => {
    const loadCourses = async () => {
      const storedCourses = await loadCoursesList();
      setCourses(storedCourses);
    };

    loadCourses();
  }, []);

  // Add a new course
  const addCourse = async (newCourse) => {
    if (!newCourse.name.trim()) {
      alert('Please enter a valid course name.');
      return;
    }

    // Ensure the course name is unique
    if (courses.some((course) => course.name === newCourse.name.trim())) {
      alert('This course already exists.');
      return;
    }

    const updatedCourses = [...courses, { name: newCourse.name }];
    setCourses(updatedCourses);

    // Save the new course in both the list and its metadata
    await saveCoursesList(updatedCourses);
    await saveCourseData(newCourse.name, { createdAt: new Date().toISOString() });
  };

  // Delete a course
  const deleteCourseHandler = async (courseName) => {
    Alert.alert(
      'Delete Course',
      `Are you sure you want to delete the course "${courseName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedCourses = await deleteCourse(courseName);
            setCourses(updatedCourses);
          },
        },
      ]
    );
  };

  return (
    <ImageBackground
      source={require('../../../assets/background1.png')} // Replace with your actual background file path
      style={styles.background}
      resizeMode="cover"
    >
    <View style={styles.topContainer}>
      <Text style={styles.title}>הקורסים שלי</Text>
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
        <Icon name="menu" size={30} color="#4B7F79" />
      </TouchableOpacity>
    </View>



      {/* Main Content */}
      <View style={styles.mainContent}>
        {courses.length > 0 ? (
          <FlatList
            data={courses}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('CourseEnvironment', { courseName: item.name })}
                style={styles.recordContainer}
              >
                <View style={styles.courseRow}>
                  <Text style={styles.courseName}>{item.name}</Text>
                  <TouchableOpacity onPress={() => deleteCourseHandler(item.name)}>
                    <Text style={styles.deleteText}>מחק</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Text style={styles.noCoursesText}>לא נוספו קורסים</Text>
        )}

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}> הוסף קורס + </Text>
        </TouchableOpacity>

        <AddCourseModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onSave={addCourse}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  topContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#FFFFFFDD',
    position: 'relative', // Allows positioning of the menu button
    alignItems: 'center', // Center-aligns the title
  },
  menuButton: {
    position: 'absolute', // Removes it from the flow
    right: 16, // Positions the button on the right
    top: 50, // Aligns it vertically
  },
  title: {
    fontSize: 22,
    fontFamily: 'Rubik',
    color: '#4B7F79',
    textAlign: 'center', // Ensures the title text is centered
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  noCoursesText: {
    fontSize: 16,
    fontFamily: 'RubikItalic',
    color: '#4B7F79',
    textAlign: 'center',
    marginVertical: 20,
  },
  recordContainer: {
    padding: 16,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseName: {
    fontSize: 16,
    fontFamily: 'Rubik',
    color: '#333333',
  },
  deleteText: {
    fontSize: 14,
    fontFamily: 'Rubik',
    color: '#4B7F79',
  },
  addButton: {
    backgroundColor: '#A0D8D5',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 150,
  },
  buttonText: {
    fontFamily: 'Rubik',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default CoursesScreen;
