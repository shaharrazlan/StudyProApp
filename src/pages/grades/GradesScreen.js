import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ImageBackground,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { saveCourses, loadCourses } from '../../services/gradeStorage';
import { MaterialIcons } from '@expo/vector-icons';

const GradesScreen = ({ navigation }) => {
  const [gregorianYear, setGregorianYear] = useState(2024);
  const [courseName, setCourseName] = useState('');
  const [courseGrade, setCourseGrade] = useState('');
  const [creditPoints, setCreditPoints] = useState('');
  const [semester, setSemester] = useState('א');
  const [courses, setCourses] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [optionModalVisible, setOptionModalVisible] = useState(false);
  const [selectedCourseIndex, setSelectedCourseIndex] = useState(null);

  // Load courses when the component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      const savedCourses = await loadCourses();
      setCourses(savedCourses || {});
    };
    fetchCourses();
  }, []);

  const updateYear = (change) => {
    const newGregorianYear = gregorianYear + change;
    setGregorianYear(newGregorianYear);
  };

  const resetForm = () => {
    setCourseName('');
    setCourseGrade('');
    setCreditPoints('');
    setSemester('א');
    setSelectedCourseIndex(null);
  };

  const addCourse = async () => {
    // Validate fields
    if (!courseName.trim()) {
      alert('Please enter the course name.');
      return;
    }
    if (
      !courseGrade ||
      isNaN(courseGrade) ||
      parseFloat(courseGrade) < 0 ||
      parseFloat(courseGrade) > 100
    ) {
      alert('Please enter a valid grade (0-100).');
      return;
    }
    if (!creditPoints || isNaN(creditPoints) || parseFloat(creditPoints) <= 0) {
      alert('Please enter valid credit points (greater than 0).');
      return;
    }

    const updatedCourses = { ...courses };
    const yearCourses = updatedCourses[gregorianYear] || [];

    const newCourse = {
      name: courseName.trim(),
      grade: parseFloat(courseGrade),
      creditPoints: parseFloat(creditPoints),
      semester: semester || 'א',
    };

    updatedCourses[gregorianYear] = [...yearCourses, newCourse];
    setCourses(updatedCourses);
    await saveCourses(updatedCourses);

    // Reset form inputs and close modal
    resetForm();
    setModalVisible(false);
  };

  const saveEditedCourse = async () => {
    const updatedCourses = { ...courses };
    const yearCourses = updatedCourses[gregorianYear] || [];

    const editedCourse = {
      name: courseName.trim(),
      grade: parseFloat(courseGrade),
      creditPoints: parseFloat(creditPoints),
      semester,
    };

    if (selectedCourseIndex !== null) {
      yearCourses[selectedCourseIndex] = editedCourse; // Update existing course
    }

    updatedCourses[gregorianYear] = yearCourses;
    setCourses(updatedCourses);
    await saveCourses(updatedCourses);

    // Reset form inputs and close modal
    resetForm();
    setEditModalVisible(false);
  };

  const startEditCourse = () => {
    const yearCourses = courses[gregorianYear] || [];
    const course = yearCourses[selectedCourseIndex];

    if (!course) {
      alert('The selected course could not be found.');
      return;
    }

    setCourseName(course.name);
    setCourseGrade(course.grade.toString());
    setCreditPoints(course.creditPoints.toString());
    setSemester(course.semester);
    setEditModalVisible(true);
    setOptionModalVisible(false);
  };

  const deleteCourse = async () => {
    const updatedCourses = { ...courses };
    updatedCourses[gregorianYear].splice(selectedCourseIndex, 1);
    setCourses(updatedCourses);
    await saveCourses(updatedCourses);
    setOptionModalVisible(false);
  };

  const calculateTotalYearlyPoints = () => {
    const yearCourses = courses[gregorianYear] || [];
    return yearCourses.reduce((sum, course) => sum + course.creditPoints, 0);
  };

  

  const calculateGPA = () => {
    const yearCourses = courses[gregorianYear] || [];
    const totalCredits = yearCourses.reduce((sum, course) => sum + course.creditPoints, 0);
    if (totalCredits === 0) return 0;
    const weightedTotal = yearCourses.reduce(
      (sum, course) => sum + course.grade * course.creditPoints,
      0
    );
    return (weightedTotal / totalCredits).toFixed(2);
  };

  const calculateOverallGPA = () => {
    let totalCredits = 0;
    let weightedTotal = 0;

    Object.values(courses).forEach((yearCourses) => {
      if (Array.isArray(yearCourses)) {
        yearCourses.forEach((course) => {
          totalCredits += course.creditPoints;
          weightedTotal += course.grade * course.creditPoints;
        });
      }
    });

    return totalCredits === 0 ? 0 : (weightedTotal / totalCredits).toFixed(2);
  };

  const renderCourses = (semesterTitle) => {
    const yearCourses = courses[gregorianYear] || [];
    const filteredCourses = yearCourses.filter(
      (course) => course.semester === semesterTitle || course.semester === 'Yearly'
    );

    return (
      <View style={styles.semesterContainer}>
        <Text style={styles.semesterTitle}>סמסטר {semesterTitle}</Text>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gradeRecordContainer}
              onPress={() => {
                setSelectedCourseIndex(index);
                setOptionModalVisible(true);
              }}
            >
              <View style={styles.courseDetailsRow}>
                <Text style={styles.courseName}>{item.name}</Text>
                <Text style={styles.coursePoints}> נק"ז: {item.creditPoints}</Text>
                <Text style={styles.courseGrade}>ציון: {item.grade}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyCoursesContainer}>
            <Text style={styles.noCoursesText}>אין קורסים לסמסטר זה</Text>
          </View>
        )}
      </View>
    );
  };

  

  return (
    <ImageBackground
      source={require('../../../assets/background1.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.topContainer}>
      <View style={styles.yearButtonsContainer}>
          <TouchableOpacity onPress={() => updateYear(1)} style={styles.leftButton}>
            <Text style={styles.yearButtonText}>שנה הבאה</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{gregorianYear}</Text>
          </View>
          <TouchableOpacity onPress={() => updateYear(-1)} style={styles.rightButton}>
            <Text style={styles.yearButtonText}>שנה קודמת</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.prominentContainer}>
        <View style={styles.row}>
          <Text style={styles.prominentLabel}>ממוצע משוקלל לשנה</Text>
          <Text style={styles.prominentLabel}>ממוצע כללי</Text>
          <Text style={styles.prominentLabel}>סה"כ נקודות זכות לשנה</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.prominentValue}>{calculateGPA()}</Text>
          <Text style={styles.prominentValue}>{calculateOverallGPA()}</Text>
          <Text style={styles.prominentValue}>{calculateTotalYearlyPoints()}</Text>
        </View>
      </View>

      <View style={styles.container}>
    {/* Prominent container for grades */}

        <FlatList
          data={['א', 'ב', 'קורס קיץ']}
          keyExtractor={(item) => item}
          renderItem={({ item }) => renderCourses(item)}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>הוסף ציון</Text>
        </TouchableOpacity>
      </View>

      {/* Options Modal */}
      {/* Options Modal */}
      <Modal animationType="fade" transparent={true} visible={optionModalVisible}>
        <View style={styles.optionModalContainer}>
          <View style={styles.optionModalBox}>
            <TouchableOpacity style={styles.optionButton} onPress={startEditCourse}>
              <Text style={styles.optionButtonText}>ערוך</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButtonDelete} onPress={deleteCourse}>
              <Text style={styles.optionButtonText}>מחק</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButtonCancel}
              onPress={() => setOptionModalVisible(false)}
            >
              <Text style={styles.optionButtonText}>בטל</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal animationType="slide" transparent={true} visible={modalVisible || editModalVisible}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>
            {selectedCourseIndex !== null ? 'ערוך קורס' : 'הוסף קורס'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder="שם הקורס"
            value={courseName}
            onChangeText={setCourseName}
          />
          <TextInput
            style={styles.input}
            placeholder="ציון הקורס"
            keyboardType="numeric"
            value={courseGrade}
            onChangeText={setCourseGrade}
          />
          <TextInput
            style={styles.input}
            placeholder="נקודות זכות"
            keyboardType="numeric"
            value={creditPoints}
            onChangeText={setCreditPoints}
          />
          <Picker
            selectedValue={semester}
            style={styles.picker}
            onValueChange={(itemValue) => setSemester(itemValue)}
          >
            <Picker.Item label="סמסטר א" value="א" />
            <Picker.Item label="סמסטר ב" value="ב" />
            <Picker.Item label="קורס קיץ" value="קורס קיץ" />
            <Picker.Item label="שנתי" value="Yearly" />
          </Picker>
          <TouchableOpacity
            style={styles.modalButton}
            onPress={selectedCourseIndex !== null ? saveEditedCourse : addCourse}
          >
            <Text style={styles.buttonText}>שמור</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modalButtonCancel}
            onPress={() => {
              resetForm();
              setModalVisible(false);
              setEditModalVisible(false);
            }}
          >
            <Text style={styles.buttonText}>בטל</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </ImageBackground>
  );
};

  
  export default GradesScreen;
  
  const styles = StyleSheet.create({
    background: {
      flex: 1,
    },
    topContainer: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 40,
      paddingBottom: 20, // Increase padding to accommodate GPA
      backgroundColor: '#FFFFFFDD',
      marginBottom: 5,
    },
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    totalGpaText: {
      fontSize: 16, // Smaller size for the GPA text
      fontFamily: 'Rubik',
      color: '#4B7F79',
      textAlign: 'center',
      marginTop: 5, // Spacing between year and GPA
    },
    prominentContainer: {
      backgroundColor: '#A0D8D5', // Prominent background color
      paddingVertical: 20,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginHorizontal: 16, // Align with the rest of the layout
      marginTop: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 6, // Elevation for Android shadow
      alignItems: 'center',
      marginBottom: 10,
    },
    row: {
      flexDirection: 'row-reverse', // Arrange items in a row
      justifyContent: 'space-between', // Space out items evenly
      width: '100%', // Take full width of the container
      marginBottom: 10, // Space between the rows
    },
    prominentLabel: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#FFFFFF', // Contrasting text color
      textAlign: 'center',
      flex: 1, // Equal space for each label
    },
    prominentValue: {
      fontSize: 20,
      fontFamily: 'Rubik',
      color: '#FFFFFF', // Contrasting text color
      fontWeight: 'bold',
      textAlign: 'center',
      flex: 1, // Equal space for each value
    },
    
    
    menuButton: {
      marginRight: 10,
    },
    titleContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 22,
      fontFamily: 'Rubik',
      color: '#4B7F79',
      textAlign: 'center',
    },
    yearButtonsContainer: {
      flexDirection: 'row', // Horizontal layout for buttons
      justifyContent: 'space-between', // Space between buttons
      marginVertical: 10, // Add vertical spacing
      paddingHorizontal: 16, // Add horizontal padding
    },
    leftButton: {
      backgroundColor: '#A0D8D5',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignSelf: 'flex-start', // Align the "Next Year" button to the left
    },
    rightButton: {
      backgroundColor: '#A0D8D5',
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      alignSelf: 'flex-end', // Align the "Previous Year" button to the right
    },
    yearButtonText: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#FFFFFF',
      fontWeight: '600',
      textAlign: 'center',
    },
    container: {
      flex: 1,
      paddingHorizontal: 16,
      paddingBottom: 80,
    },
    semesterContainer: {
      backgroundColor: '#FFFFFF',
      padding: 16,
      marginVertical: 10,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    semesterTitle: {
      fontSize: 20,
      fontFamily: 'Rubik',
      color: '#4B7F79',
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'right',
    },
    gradeRecordContainer: {
      backgroundColor: '#E8F6F3', // White background for individual records
      padding: 16,
      marginVertical: 8,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      flexDirection: 'row-reverse', // Align items in a single row for RTL
      justifyContent: 'space-between', // Distribute items evenly
      alignItems: 'center', // Align items vertically
    },
    courseRecordsContainer: {
      backgroundColor: '#E8F6F3', // Light background for course records
      padding: 10,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    courseRecord: {
      flexDirection: 'row-reverse', // Align items in a single row for RTL
      justifyContent: 'space-between', // Distribute items evenly
      alignItems: 'center', // Align items vertically
      borderBottomWidth: 1,
      borderBottomColor: '#D6E9E6',
      paddingVertical: 8,
    },
    courseName: {
      fontSize: 16,
      fontFamily: 'Rubik',
      fontWeight: 'bold',
      color: '#333333',
      textAlign: 'right', // Align to the right
      flex: 2, // Larger flex for subject name
    },
    coursePoints: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#666666',
      textAlign: 'center', // Center align for points
      flex: 1, // Centered column for points
    },
    courseGrade: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#666666',
      textAlign: 'left', // Align to the left
      flex: 1, // Small column for grade
    },
  
    emptyCoursesContainer: {
      marginTop: 10,
      padding: 10,
      borderRadius: 8,
      backgroundColor: '#FFEBEE', // Light red for empty state
      alignItems: 'center',
    },
    noCoursesText: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#D32F2F',
      textAlign: 'center',
    },
  
    gpaTitleContainer: {
      alignItems: 'flex-end', // Align the container to the right
      marginVertical: 10,
      paddingHorizontal: 16, // Padding for alignment
    },
    
    gpaTextWrapper: {
      alignItems: 'flex-end', // Align text items to the right
    },
    
    gpaText: {
      fontSize: 18,
      fontFamily: 'Rubik',
      color: '#4B7F79',
      textAlign: 'right', // Right-align text
      marginBottom: 5, // Add spacing between Year GPA and Overall GPA
    },
    
    gpaTextOverall: {
      fontSize: 18,
      fontFamily: 'Rubik',
      color: '#4B7F79', // Use a distinct color for Overall GPA
      textAlign: 'right', // Right-align text
    },
    addButton: {
      position: 'absolute',
      bottom: 20,
      alignSelf: 'center',
      backgroundColor: '#A0D8D5',
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
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
    modalView: {
      flex: 1,
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      margin: 20,
      borderRadius: 12,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Rubik',
      color: '#4B7F79',
      textAlign: 'center',
      marginBottom: 20,
    },
    input: {
      backgroundColor: '#E8F6F3',
      borderWidth: 1,
      borderColor: '#D6E9E6',
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
    },
    picker: {
      backgroundColor: '#E8F6F3',
      borderRadius: 8,
      marginBottom: 10,
    },
    modalButton: {
      backgroundColor: '#A0D8D5',
      paddingVertical: 10,
      borderRadius: 12,
      marginVertical: 10,
      alignItems: 'center',
    },
    modalButtonCancel: {
      backgroundColor: '#FFB6A6',
      paddingVertical: 10,
      borderRadius: 12,
      marginVertical: 10,
      alignItems: 'center',
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    gradeRecordContainer: {
      backgroundColor: '#E8F6F3',
      padding: 16,
      marginVertical: 8,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    courseDetailsRow: {
      flexDirection: 'row-reverse', // Align items in a single row for RTL
      justifyContent: 'space-between', // Space out elements
      alignItems: 'center', // Align items vertically
    },
    
    actionButtonsRow: {
      flexDirection: 'row-reverse', // Align buttons to the right in RTL
      justifyContent: 'flex-start', // Align buttons to the left
      marginTop: 8, // Add spacing between details and buttons
    },
    
    courseName: {
      fontSize: 16,
      fontFamily: 'Rubik',
      fontWeight: 'bold',
      color: '#4B7F79',
      textAlign: 'right', // Align text to the right
      flex: 2,
    },
    
    coursePoints: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#666666',
      textAlign: 'center', // Align text to the center
      flex: 1,
    },
    
    courseGrade: {
      fontSize: 14,
      fontFamily: 'Rubik',
      color: '#666666',
      textAlign: 'left', // Align text to the left
      flex: 1,
    },
    
    editButton: {
      backgroundColor: '#FFD700',
      padding: 8,
      borderRadius: 8,
      marginRight: 8, // Spacing between buttons
    },
    
    deleteButton: {
      backgroundColor: '#FF6347',
      padding: 8,
      borderRadius: 8,
    },
    
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: 'bold',
    },
    optionModalView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#000000aa',
      padding: 20,
    },
    modalButtonClose: {
      backgroundColor: '#CCCCCC',
      paddingVertical: 10,
      borderRadius: 12,
      marginVertical: 10,
      alignItems: 'center',
    },

    optionModalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    },
    optionModalBox: {
      width: 250,
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    optionButton: {
      backgroundColor: '#4B7F79',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 10,
      width: '100%',
      alignItems: 'center',
    },
    optionButtonDelete: {
      backgroundColor: '#FF6B6B',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginBottom: 10,
      width: '100%',
      alignItems: 'center',
    },
    optionButtonCancel: {
      backgroundColor: '#A0A0A0',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      width: '100%',
      alignItems: 'center',
    },
    optionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
    
    
  });
  