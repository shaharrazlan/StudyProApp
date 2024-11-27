import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';

const CoursesEnv = ({ coursesData }) => {
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Sample structure for coursesData
  // const coursesData = [
  //   { name: "Data Structures", assignments: [...], grades: [...], openAssignments: [...] },
  //   ...
  // ];

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Course Environment</Text>
      
      {/* Course List */}
      <ScrollView style={styles.coursesList}>
        {coursesData.map((course, index) => (
          <TouchableOpacity 
            key={index} 
            style={[styles.courseItem, selectedCourse === course && styles.selectedCourse]}
            onPress={() => handleCourseSelect(course)}
          >
            <Text style={styles.courseName}>{course.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Course Details */}
      {selectedCourse && (
        <View style={styles.courseDetails}>
          <Text style={styles.sectionTitle}>{selectedCourse.name} Details</Text>

          {/* Assignments */}
          <Text style={styles.subTitle}>Assignments</Text>
          {selectedCourse.assignments.map((assignment, index) => (
            <View key={index} style={styles.assignmentItem}>
              <Text>{assignment.title}</Text>
              <Text>Due: {assignment.dueDate}</Text>
            </View>
          ))}

          {/* Grades */}
          <Text style={styles.subTitle}>Grades</Text>
          {selectedCourse.grades.map((grade, index) => (
            <View key={index} style={styles.gradeItem}>
              <Text>Assignment: {grade.assignment}</Text>
              <Text>Grade: {grade.grade}</Text>
            </View>
          ))}

          {/* Open Assignments */}
          <Text style={styles.subTitle}>Open Assignments</Text>
          {selectedCourse.openAssignments.length > 0 ? (
            selectedCourse.openAssignments.map((openAssignment, index) => (
              <View key={index} style={styles.openAssignmentItem}>
                <Text>{openAssignment.title}</Text>
                <Text>Due: {openAssignment.dueDate}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.noAssignmentsText}>No open assignments</Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#E8F6F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4B7F79',
    marginBottom: 20,
  },
  coursesList: {
    backgroundColor: '#A0D8D5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  courseItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E9E6',
  },
  selectedCourse: {
    backgroundColor: '#FFB6A6',
    borderRadius: 5,
    marginVertical: 4,
    paddingVertical: 12,
  },
  courseName: {
    fontSize: 18,
    color: '#333',
  },
  courseDetails: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B7F79',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 6,
  },
  assignmentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E9E6',
  },
  gradeItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E9E6',
  },
  openAssignmentItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D6E9E6',
  },
  noAssignmentsText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default CoursesEnv;
