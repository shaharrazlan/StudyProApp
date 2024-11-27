// WeeklyTimetable.js
import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { saveSchedule, loadSchedule } from '../../services/scheduleStorage';
import LessonModal from '../schedule/LessonModal';


const WeeklyTimetable = ({ navigation }) => {
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i);
  const days = ['שישי', 'חמישי', 'רביעי', 'שלישי', 'שני', 'ראשון'];
  const [timetable, setTimetable] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  
  useEffect(() => {
    const loadTimetable = async () => {
      const savedTimetable = await loadSchedule();
      setTimetable(savedTimetable);
    };
    loadTimetable();
  }, [timetable]); // Re-run whenever `timetable` changes
  
  const updateTimetable = async (newTimetable) => {
    await saveSchedule(newTimetable);
    setTimetable(newTimetable);
  };
  
  const addLesson = (lesson) => {
    const updatedTimetable = {
      ...timetable,
      [lesson.day]: {
        ...timetable[lesson.day],
        [lesson.lessonStartTime]: lesson, // Store the lesson by start time for the day
      },
    };
  
    updateTimetable(updatedTimetable); // Save and set timetable immediately
    setModalVisible(false);
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>לוח שיעורים שבועי</Text>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuButtonText}>תפריט</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.eventsGrid}>
        
          {days.map((day) => (
            <View key={day} style={styles.dayColumn}>
              <Text style={styles.dayHeaderText}>{day}</Text>
              {hours.map((hour) => {
                const timeKey = `${hour}:00`;
                const event = timetable[day]?.[timeKey];

                return (
                  <View key={timeKey} style={[styles.eventCell, event && styles.eventCellWithEvent]}>
                    
                    {event ? (
                      <>
                        <Text style={styles.eventText}>{event.lessonName}</Text>
                      </>
                    ) : null}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
        <View style={styles.timeColumn}>
          {hours.map((hour) => (
            <View key={hour} style={styles.timeLabel}>
              <Text style={styles.timeText}>{`${hour}:00`}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>הוסף שיעור</Text>
      </TouchableOpacity>

      <LessonModal visible={modalVisible} onClose={() => setModalVisible(false)} onSave={addLesson} />
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 40,
      backgroundColor: '#f5f5f5',
      paddingHorizontal: 10, // Light gray for background
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 15,
      marginBottom: 10,
      backgroundColor: '#4DB6AC', // Warm gradient header color (start)
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
      elevation: 5,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#FFFFFF', // White text for contrast
      textAlign: 'center',
      marginRight: 20,
      
    },
    menuButton: {
      position: 'absolute',
      right: 10,
      backgroundColor: '#FFFFFF', // White button background
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    menuButtonText: {
      color: '#4DB6AC', // Match header color for cohesive design
      fontSize: 14,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
    },
    timeColumnHeader: {
      width: 50,
    },
    dayHeader: {
        flex: 1,
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        backgroundColor: '#4DB6AC', // Sunny pastel yellow for days
        marginHorizontal: 4, // Adds space between days
        marginVertical: 10,
        borderRadius: 6, // Rounded corners like the menu button
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 4, // Shadow for Android
    },
    dayHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000', // Darker text color for contrast
        textAlign: 'center',
    },
    
    scrollViewContent: {
      flexDirection: 'row',
    },
    eventsGrid: {
      flexDirection: 'row',
      flex: 1,
    },
    dayColumn: {
      flex: 1,
      width: 120,
      borderLeftWidth: 1,
      borderLeftColor: '#eee', // Light gray border
    },
    timeColumn: {
      width: 50,
      borderLeftWidth: 1,
      borderLeftColor: '#eee',
    },
    timeLabel: {
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
    },
    timeText: {
      fontSize: 12,
      color: '#757575', // Medium gray for text
    },
    eventCell: {
      height: 52,
      justifyContent: 'center',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: '#eee',
      margin: 4,
      borderRadius: 10, // Rounded corners for a softer look
      backgroundColor: '#E1F5FE', // Light pastel blue for empty cells
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    eventCellWithEvent: {
      backgroundColor: '#FFCCBC', // Light coral color for cells with events
    },
    eventText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#E64A19', // Vibrant orange for event text
    },
    addButton: {
      marginTop: 20,
      width: 150,
      paddingVertical: 10,
      backgroundColor: '#4DB6AC', // Mint green for a lively button
      borderRadius: 5,
      alignSelf: 'center',
      alignItems: 'center',
    },
    addButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
    },
    
  });
  

export default WeeklyTimetable;
