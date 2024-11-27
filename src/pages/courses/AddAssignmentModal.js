import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const AddtaskModal = ({ visible, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [percent, setPercent] = useState('');
  const [workDate, setWorkDate] = useState(null);
  const [submissionDate, setSubmissionDate] = useState(null);

  const [currentPicker, setCurrentPicker] = useState(null); // Track which picker is active

  const handleSave = () => {
    if (name.trim() === '' || name.split(' ').length > 5) {
      alert('Name must be provided and up to 5 words!');
      return;
    }

    onSave({
      name,
      grade: grade ? parseFloat(grade) : null,
      percent: percent ? parseFloat(percent) : null,
      workDate,
      submissionDate,
    });

    // Reset fields and close modal
    setName('');
    setGrade('');
    setPercent('');
    setWorkDate(null);
    setSubmissionDate(null);
    onClose();
  };

  const handleDateConfirm = (setter) => (date) => {
    setter(date); // Set the selected date
    setCurrentPicker(null); // Close the picker
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Add New Assignment</Text>

        <TextInput
          style={styles.input}
          placeholder="Name (up to 5 words)"
          value={name}
          onChangeText={setName}
          maxLength={50}
        />

        <TextInput
          style={styles.input}
          placeholder="Grade (optional)"
          keyboardType="numeric"
          value={grade}
          onChangeText={setGrade}
        />

        <TextInput
          style={styles.input}
          placeholder="Percent of Grade (optional)"
          keyboardType="numeric"
          value={percent}
          onChangeText={setPercent}
        />

        {/* Work Date Picker */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setCurrentPicker('work')}
        >
          <Text style={styles.buttonText}>
            {workDate
              ? `Work Date: ${workDate.toLocaleString()}`
              : 'Set Work Date & Time (optional)'}
          </Text>
        </TouchableOpacity>

        {/* Submission Date Picker */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setCurrentPicker('submission')}
        >
          <Text style={styles.buttonText}>
            {submissionDate
              ? `Submission Date: ${submissionDate.toLocaleString()}`
              : 'Set Submission Date & Time (optional)'}
          </Text>
        </TouchableOpacity>

        {/* Modal Date Pickers */}
        <DateTimePickerModal
          isVisible={currentPicker === 'work'}
          mode="datetime"
          onConfirm={handleDateConfirm(setWorkDate)}
          onCancel={() => setCurrentPicker(null)}
        />
        <DateTimePickerModal
          isVisible={currentPicker === 'submission'}
          mode="datetime"
          onConfirm={handleDateConfirm(setSubmissionDate)}
          onCancel={() => setCurrentPicker(null)}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.buttonText}>Cancel</Text>
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
    margin: 20,
    borderRadius: 10,
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
  input: {
    backgroundColor: '#f0f4f8',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
  dateButton: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#FF8A65',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default AddtaskModal;
