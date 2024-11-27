import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { saveSchedule, loadSchedule } from '../../services/scheduleStorage';
import LessonModal from '../schedule/LessonModal';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DailySchedule = ({ navigation }) => {
  const hours = Array.from({ length: 15 }, (_, i) => 7 + i); // Hours 8:00 - 19:00
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];
  const [timetable, setTimetable] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState('ראשון'); // Default to the first day of the week
  const [currentTimePosition, setCurrentTimePosition] = useState(null);
  const [optionsModalVisible, setOptionsModalVisible] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);



  useEffect(() => {
    const loadTimetable = async () => {
      const savedTimetable = await loadSchedule();
      setTimetable(savedTimetable || {});
    };
    loadTimetable();
  }, []);

  useEffect(() => {
    const updateCurrentTimePosition = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const scheduleStartMinutes = 7 * 60; // Schedule starts at 8:00 AM
      const position = currentMinutes - scheduleStartMinutes;
  
      // Only update if within the schedule range
      if (position >= 0 && position <= 660) {
        setCurrentTimePosition(position);
      } else {
        setCurrentTimePosition(null); // Outside schedule range
      }
    };
  
    updateCurrentTimePosition();
    const intervalId = setInterval(updateCurrentTimePosition, 60000); // Update every minute
  
    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);
  

  const generateTimeSlots = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
  
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour}:00`);
    }
    if (endMinute > 0) {
      slots.push(`${endHour}:00`); // Add the end hour if it includes minutes
    }
    return slots;
  };

  const getCurrentDayName = () => {
    const currentDayIndex = new Date().getDay(); // Get the current day index (0 for Sunday, etc.)
    return days[currentDayIndex]; // Map it to the Hebrew day name
  };
  
  const isToday = selectedDay === getCurrentDayName(); // Check if the selected day is today
  
  const handleEditLesson = () => {
    setModalVisible(true); // Open the modal
    setOptionsModalVisible(false); // Close options modal
};


  const openOptionsModal = (lesson) => {
    setSelectedLesson(lesson); // Set the lesson to be edited or deleted
    setOptionsModalVisible(true); // Open the options modal
  };
  
  const handleDeleteLesson = () => {
    if (selectedLesson) {
      const updatedTimetable = { ...timetable };
      const dayLessons = updatedTimetable[selectedLesson.day];
      if (dayLessons) {
        delete dayLessons[selectedLesson.lessonStartTime];
        if (Object.keys(dayLessons).length === 0) {
          delete updatedTimetable[selectedLesson.day]; // Remove day if no lessons remain
        }
        saveSchedule(updatedTimetable);
        setTimetable(updatedTimetable);
      }
      setOptionsModalVisible(false);
      alert('Lesson deleted successfully.');
    }
  };

  const editLesson = (updatedLesson) => {
    const updatedTimetable = { ...timetable };
    const originalDay = selectedLesson.day;
    const originalStartTime = selectedLesson.lessonStartTime;
  
    // Remove the original lesson
    if (updatedTimetable[originalDay]) {
      delete updatedTimetable[originalDay][originalStartTime];
  
      // If the original day no longer has lessons, remove the day entry
      if (Object.keys(updatedTimetable[originalDay]).length === 0) {
        delete updatedTimetable[originalDay];
      }
    }
  
    // Add the updated lesson
    const { day, lessonStartTime } = updatedLesson;
    if (!updatedTimetable[day]) {
      updatedTimetable[day] = {};
    }
    updatedTimetable[day][lessonStartTime] = updatedLesson;
  
    // Save the updated timetable to AsyncStorage
    saveSchedule(updatedTimetable);
  
    // Update the state
    setTimetable(updatedTimetable);
    setModalVisible(false);
    alert('Lesson updated successfully.');
  };
  
  

  const calculateLessonPosition = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startPosition = (startHour - 7) * 60 + startMinute; // Minutes from the start of the day
    const endPosition = (endHour - 7) * 60 + endMinute;
    const height = endPosition - startPosition - 5;

    return { top: startPosition, height };
  };

  const addLesson = (lesson) => {
    const { lessonStartTime, lessonEndTime, day, lessonName, building, room } = lesson;
  
    // Validate the lesson data
    if (!lessonStartTime || !lessonEndTime || !lessonName || !day) {
      console.error('Invalid lesson data:', lesson);
      alert('Please provide all lesson details.');
      return;
    }
  
    const updatedTimetable = { ...timetable };
  
    // Prevent overlapping lessons
    const lessonsForDay = updatedTimetable[day] || {};
    const timeSlots = Object.keys(lessonsForDay);
    const isOverlap = timeSlots.some((slot) => {
      const existingLesson = lessonsForDay[slot];
      const existingStart = existingLesson.lessonStartTime;
      const existingEnd = existingLesson.lessonEndTime;
  
      return (
        (lessonStartTime >= existingStart && lessonStartTime < existingEnd) || // Start overlaps
        (lessonEndTime > existingStart && lessonEndTime <= existingEnd) || // End overlaps
        (lessonStartTime <= existingStart && lessonEndTime >= existingEnd) // Encloses existing
      );
    });
  
    if (isOverlap) {
      alert('The lesson overlaps with an existing one.');
      return;
    }
  
    // Add the lesson to the timetable
    if (!updatedTimetable[day]) {
      updatedTimetable[day] = {};
    }
    updatedTimetable[day][lessonStartTime] = {
      lessonStartTime,
      lessonEndTime,
      lessonName,
      building,
      room,
    };
  
    // Save to AsyncStorage
    saveSchedule(updatedTimetable);
  
    // Update state
    setTimetable(updatedTimetable);
    setModalVisible(false);
  
    // Feedback
    alert('Lesson added successfully.');
  };
  
  const lessonsForToday = timetable[selectedDay] || {};

  return (
    <ImageBackground
      source={require('../../../assets/background1.png')}
      style={styles.background}
      resizeMode="cover"
    >
    {/* Top Container */}
    <View style={styles.topContainer}>
      <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
        <Icon name="menu" size={30} color="#4B7F79" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>לוח שיעורים</Text>
      </View>
    </View>
    
      {/* Day Picker */}
      <View style={styles.dayPickerContainer}>
      <Picker
        selectedValue={selectedDay}
        onValueChange={(itemValue) => setSelectedDay(itemValue)}
        style={styles.picker}
      >
        {days.map((day, index) => (
          <Picker.Item key={index} label={day} value={day} />
        ))}
      </Picker>
    </View>

      {/* Main Schedule */}
      <ScrollView contentContainerStyle={styles.scheduleContainer}>
        {/* Hour Labels */}
        <View style={styles.hoursScale}>
          {hours.map((hour) => (
            <View key={hour} style={styles.hourRow}>
              <Text style={styles.hourLabel}>{`${hour}:00`}</Text>
            </View>
          ))}
        </View>

        {/* Events Grid */}
        <View style={styles.eventsGrid}>
          {hours.map((hour) => (
            <View key={hour} style={styles.hourCell} />
          ))}

      {Object.values(lessonsForToday).map((lesson, index) => {
        if (!lesson.lessonStartTime || !lesson.lessonEndTime) {
          console.warn('Skipping invalid lesson:', lesson);
          return null; // Skip rendering invalid lessons
        }

        const { top, height } = calculateLessonPosition(
          lesson.lessonStartTime,
          lesson.lessonEndTime
        );

        return (
          <TouchableOpacity
            key={index}
            style={[styles.lessonBlock, { top, height }]}
            onPress={() => openOptionsModal({ ...lesson, day: selectedDay })}
          >
            <Text style={styles.lessonText}>{lesson.lessonName}</Text>
            <Text style={styles.lessonSubText}>
              בניין: {lesson.building} | חדר: {lesson.room}
            </Text>
          </TouchableOpacity>
        );
      })}


      {isToday && currentTimePosition !== null && (
        <View
          style={[
            styles.currentTimeLine,
            { top: currentTimePosition },
          ]}
        />
      )}

        </View>
      </ScrollView>

      {/* Add Lesson Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>הוסף שיעור</Text>
      </TouchableOpacity>


      <Modal
        visible={optionsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setOptionsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsModal}>
            <TouchableOpacity style={styles.optionButton} onPress={handleEditLesson}>
              <Text style={styles.optionText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButtonDelete} onPress={handleDeleteLesson}>
              <Text style={styles.optionText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.optionButtonCancel}
              onPress={() => setOptionsModalVisible(false)}
            >
              <Text style={styles.optionText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

<LessonModal
    visible={modalVisible}
    onClose={() => {
        setModalVisible(false);
        setSelectedLesson(null); // Reset selected lesson when modal is closed
    }}
    onSave={(lesson) => {
        if (selectedLesson) {
            editLesson(lesson); // Edit existing lesson
        } else {
            addLesson(lesson); // Add a new lesson
        }
    }}
    initialLesson={selectedLesson} // Pre-fill fields if editing
    selectedDay={selectedDay} // Ensure default day is passed for adding
/>



    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  topContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#FFFFFFDD',
  },
  menuButton: {
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Rubik',
    color: '#4B7F79',
  },
  scheduleContainer: {
    flexDirection: 'row-reverse', // Side-by-side layout: hours bar + events grid
    position: 'relative',
    margin: 16, // Add space around the container
    padding: 10, // Inner padding for better spacing
    borderRadius: 16, // Rounded corners
    backgroundColor: '#FFFFFF', // Container background color
    shadowColor: '#000', // Shadow for container
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4, // For Android shadow
  },
  hoursScale: {
    width: 60,
    backgroundColor: '#FFFFFF',
  },
  hourRow: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E9E6',
  },
  hourLabel: {
    fontSize: 14,
    color: '#666666',
  },
  eventsGrid: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#F8F8F8', // Slightly different from the container for visual distinction
    borderLeftWidth: 1,
    borderLeftColor: '#D6E9E6',
    borderRadius: 12, // Match the rounded edges of the container
    overflow: 'hidden', // Ensure content fits within rounded corners
  },
  hourCell: {
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E9E6',
  },
  lessonBlock: {
    position: 'absolute',
    left: 1,
    right: 1,
    backgroundColor: '#A0D8D5',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign:'right',
  },
  lessonSubText: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign:'right',
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#4B7F79',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },

  dayPickerContainer: {
    alignSelf: 'flex-end', // Aligns the picker container to the right
    marginHorizontal: 16, // Adds space from the edges of the screen
    marginVertical: 10, // Adds space above and below to separate from other containers
    paddingVertical: 4, // Optional: Reduces the internal padding
    width: '40%', // Reduces the width of the container
    borderRadius: 8, // Rounded edges for visual separation
    backgroundColor: '#FFFFFF', // Background color for contrast
    shadowColor: '#000', // Add a shadow for elevation
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Elevation for Android
    height: 50, // Explicitly set a reduced height
    justifyContent: 'center', // Centers the picker vertically
  },
  
  picker: {
    height: 60, // Height of the picker
    color: '#4B7F79', // Text color
    textAlign: 'right', // Align text to the right
  },
  currentTimeLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2, // Thickness of the line
    backgroundColor: 'red', // Line color
    zIndex: 10, // Ensure it appears above other elements
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



export default DailySchedule;
