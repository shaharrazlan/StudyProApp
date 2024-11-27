import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ImageBackground,
  ScrollView,
} from 'react-native';
import SetCategoryPercentagesModal from './SetCategoryPercentagesModal';
import {
  loadCourseEnvironment,
  saveCourseEnvironment,
} from '../../services/courseEnvironmentService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const CourseEnvironment = ({ route }) => {
  const { courseName } = route.params;
  const navigation = useNavigation();

  const [assignments, setAssignments] = useState([]);
  const [tests, setTests] = useState([]);
  const [others, setOthers] = useState([]);
  const [categoryPercentages, setCategoryPercentages] = useState({
    assignments: 0,
    tests: 0,
    others: 0,
  });
  const [finalGrade, setFinalGrade] = useState(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [modalCategory, setModalCategory] = useState(null);
  const [newGrade, setNewGrade] = useState({ name: '', grade: '', percent: '' });
  const [isPercentageModalVisible, setPercentageModalVisible] = useState(false);

  const [recordOptionsModalVisible, setRecordOptionsModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [loading, setLoading] = useState(true);

  // Load course data on mount
  useEffect(() => {
    const loadEnvironment = async () => {
      setLoading(true);
      try {
        const courseData = await loadCourseEnvironment(courseName);
        console.log('Loaded course data:', courseData);
        setAssignments(courseData?.assignments || []);
        setTests(courseData?.tests || []);
        setOthers(courseData?.others || []);
        setCategoryPercentages(courseData?.categoryPercentages || {
          assignments: 0,
          tests: 0,
          others: 0,
        });
      } catch (error) {
        console.error('Error loading course environment:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEnvironment();
  }, [courseName]);

  // Automatically save data when any key state changes
  useEffect(() => {
    const saveEnvironment = async () => {
      if (!courseName) return;

      const courseData = {
        assignments,
        tests,
        others,
        categoryPercentages,
      };

      try {
        console.log('Saving course environment:', courseData);
        await saveCourseEnvironment(courseName, courseData);
      } catch (error) {
        console.error('Error saving course environment:', error);
      }
    };

    saveEnvironment();
  }, [assignments, tests, others, categoryPercentages]);

  const calculateTotalGrade = (records) => {
    if (!records.length) return 0;

    const weightedSum = records.reduce(
      (sum, record) => sum + (record.grade * record.percent) / 100,
      0
    );
    const totalPercent = records.reduce((sum, record) => sum + record.percent, 0);

    return totalPercent > 0 ? (weightedSum / totalPercent) * 100 : 0;
  };

  const calculateFinalCourseGrade = () => {
    const { assignments: assignmentPercent, tests: testPercent, others: otherPercent } =
      categoryPercentages;

    if (assignmentPercent + testPercent + otherPercent === 100) {
      const assignmentGrade = calculateTotalGrade(assignments) * (assignmentPercent / 100);
      const testGrade = calculateTotalGrade(tests) * (testPercent / 100);
      const otherGrade = calculateTotalGrade(others) * (otherPercent / 100);

      return assignmentGrade + testGrade + otherGrade;
    }

    return 0; // Return 0 if percentages do not sum to 100
  };

  const openOptionsModal = (record, category) => {
    setSelectedRecord(record);
    setSelectedCategory(category);
    setRecordOptionsModalVisible(true);
  };

  const handleDeleteRecord = () => {
    if (selectedCategory === 'assignments') {
      setAssignments((prev) => prev.filter((_, index) => index !== selectedRecord.index));
    } else if (selectedCategory === 'tests') {
      setTests((prev) => prev.filter((_, index) => index !== selectedRecord.index));
    } else if (selectedCategory === 'others') {
      setOthers((prev) => prev.filter((_, index) => index !== selectedRecord.index));
    }

    setRecordOptionsModalVisible(false);
  };

  const handleEditRecord = () => {
  if (!selectedRecord) {
    console.error('No record selected for editing');
    return;
  }

  // Pre-fill `newGrade` with the selected record's data
  setNewGrade({
    name: selectedRecord.name,
    grade: selectedRecord.grade.toString(),
    percent: selectedRecord.percent.toString(),
  });

  // Set the modal category based on the selected category
  setModalCategory(selectedCategory);

  // Open the edit modal
  setModalVisible(true);

  // Close the options modal
  setRecordOptionsModalVisible(false);
};

  const handleAddGrade = () => {
    const { name, grade, percent } = newGrade;

    if (!name || !grade || !percent) {
      alert('Please fill in all fields!');
      return;
    }

    const record = {
      name,
      grade: parseFloat(grade),
      percent: parseFloat(percent),
    };

    if (selectedRecord) {
      if (modalCategory === 'assignments') {
        const updated = [...assignments];
        updated[selectedRecord.index] = record;
        setAssignments(updated);
      } else if (modalCategory === 'tests') {
        const updated = [...tests];
        updated[selectedRecord.index] = record;
        setTests(updated);
      } else if (modalCategory === 'others') {
        const updated = [...others];
        updated[selectedRecord.index] = record;
        setOthers(updated);
      }
    } else {
      if (modalCategory === 'assignments') {
        setAssignments((prev) => [...prev, record]);
      } else if (modalCategory === 'tests') {
        setTests((prev) => [...prev, record]);
      } else if (modalCategory === 'others') {
        setOthers((prev) => [...prev, record]);
      }
    }

    setNewGrade({ name: '', grade: '', percent: '' });
    setSelectedRecord(null);
    setModalVisible(false);
  };

  useEffect(() => {
    const newFinalGrade = calculateFinalCourseGrade();
    setFinalGrade(newFinalGrade);
  }, [assignments, tests, others, categoryPercentages]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
  <ImageBackground
    source={require('../../../assets/background1.png')}
    style={styles.background}
    resizeMode="cover"
  >
  <View style={styles.topContainer}>
    {/* Title */}
    <Text style={styles.title}>{courseName}</Text>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.navigate('Courses')} style={styles.backButton}>
      <Icon name="arrow-forward" size={30} color="#4B7F79" />
    </TouchableOpacity>
  </View>


    <View style={styles.prominentContainer}>
  <View style={styles.prominentRow}>
    <Text style={styles.prominentLabel}>ציון קורס</Text>
    <Text style={styles.prominentValue}>{finalGrade?.toFixed(2) || '0.00'}</Text>
    <TouchableOpacity
      style={styles.editButton}
      onPress={() => setPercentageModalVisible(true)} // Opens modal for editing percentages
    >
      <Icon name="edit" size={24} color="#FFFFFF" />
    </TouchableOpacity>
  </View>

    <View style={styles.percentagesContainer}>
      <View style={styles.percentageBlock}>
        <Text style={styles.percentageLabel}>מטלות</Text>
        <Text style={styles.percentageValue}>{categoryPercentages.assignments || 0}%</Text>
      </View>
      <View style={styles.percentageBlock}>
        <Text style={styles.percentageLabel}>מבחנים</Text>
        <Text style={styles.percentageValue}>{categoryPercentages.tests || 0}%</Text>
      </View>
      <View style={styles.percentageBlock}>
        <Text style={styles.percentageLabel}>אחר</Text>
        <Text style={styles.percentageValue}>{categoryPercentages.others || 0}%</Text>
      </View>
    </View>
  </View>

 
    <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Assignments Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setModalCategory('assignments');
                setModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>
              מטלות ({categoryPercentages.assignments || 0}%)
              {assignments.length > 0 && ` | ממוצע: ${calculateTotalGrade(assignments).toFixed(0)}`}
            </Text>
          </View>
          {assignments.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gradeItem}
              onPress={() => openOptionsModal({ ...item, index }, 'assignments')}
            >
              <Text style={styles.gradeValue}>
                ציון: {item.grade} ({item.percent}%)
              </Text>
              <Text style={styles.gradeName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tests Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setModalCategory('tests');
                setModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>
              מבחנים ({categoryPercentages.tests || 0}%)
              {tests.length > 0 && ` | ממוצע: ${calculateTotalGrade(tests).toFixed(0)}`}
            </Text>
          </View>
          {tests.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gradeItem}
              onPress={() => openOptionsModal({ ...item, index }, 'tests')}
            >
              <Text style={styles.gradeValue}>
                ציון: {item.grade} ({item.percent}%)
              </Text>
              <Text style={styles.gradeName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Others Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setModalCategory('others');
                setModalVisible(true);
              }}
            >
              <Text style={styles.buttonText}>+</Text>
            </TouchableOpacity>
            <Text style={styles.sectionTitle}>
              אחר ({categoryPercentages.others || 0}%)
              {others.length > 0 && ` | ממוצע: ${calculateTotalGrade(others).toFixed(0)}`}
            </Text>
          </View>
          {others.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.gradeItem}
              onPress={() => openOptionsModal({ ...item, index }, 'others')}
            >
              <Text style={styles.gradeValue}>
                ציון: {item.grade} ({item.percent}%)
              </Text>
              <Text style={styles.gradeName}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>


      <SetCategoryPercentagesModal
        visible={isPercentageModalVisible}
        onClose={() => setPercentageModalVisible(false)}
        onSave={(percentages) => {
          setCategoryPercentages(percentages);
          setPercentageModalVisible(false);
        }}
      />

      {/* Add Grade Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>הוסף ציון</Text>
          <TextInput
            style={styles.input}
            placeholder="שם"
            value={newGrade.name}
            onChangeText={(value) =>
              setNewGrade((prev) => ({ ...prev, name: value }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="ציון"
            keyboardType="numeric"
            value={newGrade.grade}
            onChangeText={(value) =>
              setNewGrade((prev) => ({ ...prev, grade: value }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="אחוזים"
            keyboardType="numeric"
            value={newGrade.percent}
            onChangeText={(value) =>
              setNewGrade((prev) => ({ ...prev, percent: value }))
            }
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddGrade}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
          visible={recordOptionsModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setRecordOptionsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.optionsModal}>
              <TouchableOpacity
                style={styles.optionButton}
                onPress={handleEditRecord}
              >
                <Text style={styles.optionText}>ערוך</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButtonDelete}
                onPress={handleDeleteRecord}
              >
                <Text style={styles.optionText}>מחק</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.optionButtonCancel}
                onPress={() => setRecordOptionsModalVisible(false)}
              >
                <Text style={styles.optionText}>בטל</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


    </View>
  </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row', // Items in a row
    alignItems: 'center', // Vertically center items
    justifyContent: 'space-between', // Space between title and menu button
    backgroundColor: '#FFFFFFDD', // Optional background for readability
    paddingHorizontal: 16,
    paddingTop: 50, // To account for the status bar
    paddingBottom: 20,
  },
  titleContainer: {
    flex: 1, // Take up remaining space
    alignItems: 'center', 
    textAlign:'center'// Center the title horizontally
  },
  topContainer: {
    position: 'relative', // Ensures the back button can be positioned relative to the container
    alignItems: 'center', // Centers the title
    backgroundColor: '#FFFFFFDD', // Optional background for readability
    paddingHorizontal: 16,
    paddingTop: 50, // To account for the status bar
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute', // Removes it from normal layout flow
    right: 16, // Position it to the right
    top: '150%', // Vertically align it
   
  },
  title: {
    fontSize: 22,
    fontFamily: 'Rubik',
    color: '#4B7F79',
    textAlign: 'center',
  },
  
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Rubik',
    color: '#4B7F79',
    textAlign: 'center'
  },
  section: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Rubik',
    color: '#4B7F79',
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: '#E8F6F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeName: {
    fontSize: 16,
    fontFamily: 'Rubik',
    color: '#4B4B4B',
  },
  gradeValue: {
    fontSize: 16,
    fontFamily: 'Rubik',
    color: '#666666',
  },
  addButton: {
    backgroundColor: '#A0D8D5',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  finalGrade: {
    fontSize: 18,
    fontFamily: 'Rubik',
    color: '#4B7F79',
    textAlign: 'center',
    marginVertical: 10,
  },
  modalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    margin: 20,
    borderRadius: 12, // פינות מעוגלות
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#4A90E2', // כחול עז
  },
  input: {
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#4DB6AC', // ירוק עדין לכפתור שמירה
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8, // פינות מעוגלות
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FF6F61', // ורוד חם לכפתור ביטול
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  setPercentagesButton: {
    backgroundColor: '#A0D8D5', // כתום עז לכפתור אחוזים
    padding: 6,
    borderRadius: 8, // פינות מעוגלות
    alignItems: 'center',
    alignSelf: 'center',
    width: 200,
    marginVertical: 10,
  },
  finalGrade: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B7F79', // ירוק כהה לטקסט ציון סופי
    textAlign: 'right',
    marginTop: 10,
    marginBottom: 15,
    marginRight: 10,
  },
  prominentContainer: {
    backgroundColor: '#A0D8D5', // Distinctive background color
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
    alignItems: 'center',
  },
  prominentRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  prominentLabel: {
    fontSize: 20,
    fontFamily: 'Rubik',
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  editButton: {
    backgroundColor: '#A0D8D5', // Light green button
    borderRadius: 12,
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prominentValue: {
    fontSize: 24,
    fontFamily: 'Rubik',
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  percentagesContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  percentageBlock: {
    alignItems: 'center',
    flex: 1,
  },
  percentageLabel: {
    fontSize: 16,
    fontFamily: 'Rubik',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  percentageValue: {
    fontSize: 18,
    fontFamily: 'Rubik',
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  optionsModal: {
    width: 250,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
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


export default CourseEnvironment;
