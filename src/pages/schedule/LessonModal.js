import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { addLessonToGoogleCalendar } from '../../services/googleCalendar';

const LessonModal = ({ visible, onClose, onSave, initialLesson, selectedDay }) => {
  const hours = Array.from({ length: 14 }, (_, i) => 7 + i); // Include 7:00 to 20:00
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי'];

  const [lessonName, setLessonName] = useState('');
  const [lessonStartTime, setLessonStartTime] = useState('8:00'); // Default start time
  const [lessonEndTime, setLessonEndTime] = useState('9:00'); // Default end time
  const [building, setBuilding] = useState('');
  const [room, setRoom] = useState('');
  const [day, setDay] = useState(selectedDay);

  // Pre-fill fields with initialLesson if provided, or default to selectedDay
  useEffect(() => {
    if (initialLesson) {
      setLessonName(initialLesson.lessonName || '');
      setLessonStartTime(initialLesson.lessonStartTime || '8:00');
      setLessonEndTime(initialLesson.lessonEndTime || '9:00');
      setBuilding(initialLesson.building || '');
      setRoom(initialLesson.room || '');
      setDay(initialLesson.day || selectedDay);
    } else {
      setDay(selectedDay); // Default to the currently selected day
    }
  }, [initialLesson, selectedDay]);

  const handleSave = () => {
    if (!lessonName || !lessonStartTime || !lessonEndTime) {
      alert('Please fill in all required fields.');
      return;
    }

    onSave({
      lessonName,
      lessonStartTime,
      lessonEndTime,
      building,
      room,
      day,
    });

    addLessonToGoogleCalendar(lessonName, day, lessonStartTime, lessonEndTime, building, room);
    resetFields();
  };

  const resetFields = () => {
    setLessonName('');
    setLessonStartTime('8:00'); // Reset to default start time
    setLessonEndTime('9:00'); // Reset to default end time
    setBuilding('');
    setRoom('');
    setDay(selectedDay);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>הוסף או ערוך שיעור</Text>

        <Text style={styles.label}>שם השיעור</Text>
        <TextInput
          style={styles.input}
          placeholder="שם השיעור"
          value={lessonName}
          onChangeText={setLessonName}
        />

        <Text style={styles.label}>בחר שעת התחלה</Text>
        <Picker
          selectedValue={lessonStartTime}
          style={styles.picker}
          onValueChange={(itemValue) => setLessonStartTime(itemValue)}
        >
          {hours.map((hour) => (
            <Picker.Item key={hour} label={`${hour}:00`} value={`${hour}:00`} />
          ))}
        </Picker>

        <Text style={styles.label}>בחר שעת סיום</Text>
        <Picker
          selectedValue={lessonEndTime}
          style={styles.picker}
          onValueChange={(itemValue) => setLessonEndTime(itemValue)}
        >
          {hours.map((hour) => (
            <Picker.Item key={hour} label={`${hour}:00`} value={`${hour}:00`} />
          ))}
        </Picker>

        <Text style={styles.label}>בחר יום</Text>
        <Picker
          selectedValue={day}
          style={styles.picker}
          onValueChange={(itemValue) => setDay(itemValue)}
        >
          {days.map((day) => (
            <Picker.Item key={day} label={day} value={day} />
          ))}
        </Picker>

        <Text style={styles.label}>בניין</Text>
        <TextInput
          style={styles.input}
          placeholder="הכנס את הבניין"
          value={building}
          onChangeText={setBuilding}
        />

        <Text style={styles.label}>חדר</Text>
        <TextInput
          style={styles.input}
          placeholder="הכנס את מספר החדר"
          value={room}
          onChangeText={setRoom}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>שמור שיעור</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>בטל</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 15,
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
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#f0f4f8',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  picker: {
    backgroundColor: '#f0f4f8',
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4DB6AC',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FF8A65',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LessonModal;
