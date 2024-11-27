import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const TaskItem = ({ task, onDelete }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleCheck = () => {
    if (!isCompleted) {
      setIsCompleted(true); // Show the "V" sign
      setTimeout(() => {
        Alert.alert(
          'Task Completed',
          `Are you sure you want to delete "${task.title}"?`,
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsCompleted(false) },
            { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
          ]
        );
      }, 300); // Delay for visual confirmation
    }
  };

  return (
    <View style={styles.taskCard}>
      {/* Title and Course */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>{task.title}</Text>
        {task.course ? <Text style={styles.course}>{task.course}</Text> : null}
        <TouchableOpacity onPress={handleCheck} style={styles.checkbox}>
          {isCompleted ? (
            <MaterialIcons name="check" size={24} color="green" />
          ) : (
            <MaterialIcons name="check-box-outline-blank" size={24} color="gray" />
          )}
        </TouchableOpacity>
      </View>

      {/* Description */}
      {task.description ? <Text style={styles.description}>{task.description}</Text> : null}

      {/* Work Date */}
      <View style={styles.dateRow}>
        <Text style={styles.date}>
          Work Date: {new Date(task.workDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  taskCard: {
    backgroundColor: 'white',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  course: {
    fontSize: 14,
    color: '#555',
    marginLeft: 8,
  },
  checkbox: {
    padding: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
});
