import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { loadSchedule } from '../services/scheduleStorage';
import { loadActiveTasks } from '../services/tasksStorageService';
import motivationalQuotes from '../utils/motivationalQuotes'; 
import Icon from 'react-native-vector-icons/MaterialIcons';


const HomeScreen = ({ navigation }) => {
  const [nextLessons, setNextLessons] = useState([]);
  const [closestTasks, setClosestTasks] = useState([]);

  const todayIndex = new Date().getDate() % motivationalQuotes.length;
  const dailyQuote = motivationalQuotes[todayIndex];

  const getTimeGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "בוקר טוב";
    if (currentHour < 18) return "צהריים טובים";
    return "ערב טוב";
  };
  const timeGreeting = getTimeGreeting();

  useEffect(() => {
    const fetchNextLessons = async () => {
      const timetable = await loadSchedule();
      const currentHour = new Date().getHours();
      const currentDay = new Date().toLocaleDateString('he-IL', { weekday: 'long' }).replace("יום ", "");
      const todayLessons = timetable[currentDay] || {};

      const upcomingLessons = Object.keys(todayLessons)
        .map(time => ({ time, ...todayLessons[time] }))
        .filter(lesson => {
          const lessonHour = parseInt(lesson.time.split(':')[0], 10);
          return lessonHour >= currentHour && lessonHour <= currentHour + 4;
        });

      setNextLessons(upcomingLessons);
    };

    const fetchClosestTasks = async () => {
      const tasks = await loadActiveTasks(); // Load active tasks only
      const now = new Date();

      const sortedTasks = tasks
        .map((task) => ({
          ...task,
          submitDateTime: new Date(task.submitDate), // Parse task submit date
        }))
        .filter((task) => task.submitDateTime > now) // Exclude past tasks
        .sort((a, b) => a.submitDateTime - b.submitDateTime) // Sort by date
        .slice(0, 3); // Take the 3 closest tasks

      setClosestTasks(sortedTasks);
    };

    fetchNextLessons();
    fetchClosestTasks();
  }, []);

  return (
    <ImageBackground
      source={require('../../assets/background1.png')} // Replace with your actual background file path
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.topContainer}>
        <TouchableOpacity onPress={() => navigation.openDrawer()} style={styles.menuButton}>
          <Icon name="menu" size={30} color="#4B7F79" />
        </TouchableOpacity>
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>{timeGreeting},</Text>
        </View>
      </View>
  
      <ScrollView contentContainerStyle={styles.container}>
        {/* Lessons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>הרצאות קרובות</Text>
          {nextLessons.length > 0 ? (
            nextLessons.map((lesson, index) => (
              <View key={index} style={styles.recordContainer}>
                <View style={styles.lessonRow}>
                  <Text style={styles.scheduleTime}>{lesson.time}</Text>
                  <Text style={styles.scheduleSubject}>בניין: {lesson.building}</Text>
                  <Text style={styles.scheduleSubject}> חדר: {lesson.room}</Text>
                  <Text style={styles.scheduleName}>{lesson.lessonName}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noLessonsText}>אין שיעורים בשעות הקרובות</Text>
          )}
        </View>


  
         {/* Closest Tasks Section */}
         <View style={styles.section}>
          <Text style={styles.sectionTitle}>משימות קרובות</Text>
          {closestTasks.length > 0 ? (
            closestTasks.map((task) => {
              const taskDate = task.submitDateTime;
              return (
                <View key={task.id} style={styles.recordContainer}>
                  <View style={styles.taskRow}>
                    <Text style={styles.taskDate}>
                      {taskDate.toLocaleDateString('he-IL', { month: '2-digit', day: '2-digit' })}
                    </Text>
                    <Text style={styles.taskName}>{task.title}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <Text style={styles.noLessonsText}>אין משימות קרובות</Text>
          )}
        </View>
      </ScrollView>
  
      {/* Daily Quote Section */}
      <View style={styles.dailyQuoteContainer}>
        <Text style={styles.dailyQuote}>" {dailyQuote} "</Text>
      </View>
    </ImageBackground>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  background: {
    flex: 1, // Makes the background cover the entire screen
  },
  topContainer: {
    paddingHorizontal: 16,
    paddingTop: 50, // To account for the status bar
    paddingBottom: 20,
    backgroundColor: '#FFFFFFDD', // Optional background for readability
    marginBottom: 20, // Gap between the top container and the next section
    flexDirection: 'row-reverse', // Ensures the menu and greeting section align horizontally
    alignItems: 'center', // Aligns items to the top of the container
  },
  greetingSection: {
    flex: 1, // Allows the greeting section to take up remaining space
    flexDirection: 'column', // Stacks the greeting vertically
    justifyContent: 'center', // Centers items vertically in the section
  },
  greeting: {
    fontSize: 22,
    fontFamily: 'Rubik',
    color: '#4B7F79',
    textAlign: 'center',
  },
  container: {
    padding: 16,
    flex: 1,
    paddingBottom: 80,
  },
  section: {
    marginBottom: 24,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    
    fontFamily: 'Rubik',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'right',
  },
  recordContainer: {
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
  taskRow: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Align items with space between them
    alignItems: 'center', // Vertically align items
    flexWrap: 'nowrap', // Prevent items from wrapping to the next line
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: '#4B7F79',
    flex: 1, // Allows the name to take up available space without overflowing
    textAlign: 'right', // Ensures the text stays aligned to the left
  },
  taskDate: {
    fontSize: 14,
    fontFamily: 'RubikItalic',
    color: '#4B7F79',
    flexShrink: 1, // Ensures the date stays within the row
    textAlign: 'left', // Aligns the date to the right of the container
  },
  lessonRow: {
    flexDirection: 'row', // Align items horizontally
    justifyContent: 'space-between', // Space out the elements
    alignItems: 'center', // Vertically align items
  },
  scheduleTime: {
    fontSize: 14,
    fontFamily: 'RubikItalic',
    color: '#4B7F79',
    textAlign: 'left', // Aligns time to the far left
    flex: 1, // Pushes other elements to the right
  },
  scheduleSubject: {
    fontSize: 14,
    fontFamily: 'Rubik',
    color: '#666666',
    textAlign: 'center', // Centers building and room in the middle
    flex: 1,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Rubik',
    color: '#4B7F79',
    textAlign: 'right', // Aligns name to the far right
    flex: 1,
  },
  noLessonsText: {
    fontSize: 14,
    fontFamily: 'Rubik',
    color: '#4B7F79',
    textAlign: 'center',
  },
  dailyQuoteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFFDD',
    padding: 16,
    alignItems: 'center',
  },
  dailyQuote: {
    fontSize: 16,
    
    fontFamily: 'RubikItalic',
    color: '#4B7F79',
    textAlign: 'center',
  },
});
 

