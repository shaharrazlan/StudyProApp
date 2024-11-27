import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from 'react-native';

const SetCategoryPercentagesModal = ({ visible, onClose, onSave }) => {
  const [percentages, setPercentages] = useState({
    assignments: '',
    tests: '',
    others: '',
  });

  const handleSave = () => {
    const { assignments, tests, others } = percentages;

    // Validate inputs
    if (
      assignments === '' ||
      tests === '' ||
      others === '' ||
      isNaN(assignments) ||
      isNaN(tests) ||
      isNaN(others)
    ) {
      alert('Please enter valid numeric values for all categories.');
      return;
    }

    const assignmentsPercent = parseFloat(assignments);
    const testsPercent = parseFloat(tests);
    const othersPercent = parseFloat(others);

    if (assignmentsPercent + testsPercent + othersPercent !== 100) {
      alert('The total percentages must equal 100%.');
      return;
    }

    // Save the percentages and close the modal
    onSave({ assignments: assignmentsPercent, tests: testsPercent, others: othersPercent });
    setPercentages({ assignments: '', tests: '', others: '' }); // Reset fields
    onClose();
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalView}>
        <Text style={styles.modalTitle}>Set Category Percentages</Text>

        <TextInput
          style={styles.input}
          placeholder="Assignments (%)"
          keyboardType="numeric"
          value={percentages.assignments}
          onChangeText={(value) => setPercentages({ ...percentages, assignments: value })}
        />

        <TextInput
          style={styles.input}
          placeholder="Tests (%)"
          keyboardType="numeric"
          value={percentages.tests}
          onChangeText={(value) => setPercentages({ ...percentages, tests: value })}
        />

        <TextInput
          style={styles.input}
          placeholder="Others (%)"
          keyboardType="numeric"
          value={percentages.others}
          onChangeText={(value) => setPercentages({ ...percentages, others: value })}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#F0F4F8',
    borderWidth: 1,
    borderColor: '#DDD',
    padding: 10,
    marginBottom: 12,
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#4DB6AC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: '#FF8A65',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default SetCategoryPercentagesModal;
