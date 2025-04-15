import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { Text, Button, Overlay } from "@rneui/themed";
import { MaterialIcons } from "@expo/vector-icons";

const ReservationActionSheet = ({
  isVisible,
  onClose,
  onConfirmReservation,
  students,
  selectedHours,
}) => {
  const [localStudents, setLocalStudents] = useState(students);

  useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  const handleAddStudent = () => {
    setLocalStudents([...localStudents, ""]);
  };

  const handleRemoveStudent = (index) => {
    const newStudents = localStudents.filter((_, i) => i !== index);
    setLocalStudents(newStudents);
  };

  const handleStudentChange = (index, value) => {
    const newStudents = [...localStudents];
    newStudents[index] = value;
    setLocalStudents(newStudents);
  };

  const handleConfirm = () => {
    const validStudents = localStudents.filter(
      (student) => student.trim() !== ""
    );
    if (validStudents.length === 0) {
      Alert.alert("Error", "Por favor ingresa al menos un nombre de alumno.");
      return;
    }
    onConfirmReservation(validStudents);
    onClose();
  };

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onClose}
      overlayStyle={styles.overlay}
    >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Reservar Aula</Text>
        <Text style={styles.subtitle}>
          Horas seleccionadas: {selectedHours.join(", ")}
        </Text>
        {localStudents.map((student, index) => (
          <View key={index} style={styles.studentInputContainer}>
            <TextInput
              style={styles.studentInput}
              placeholder={`Alumno ${index + 1}`}
              value={student}
              onChangeText={(value) => handleStudentChange(index, value)}
            />
            {localStudents.length > 1 && (
              <TouchableOpacity
                onPress={() => handleRemoveStudent(index)}
                style={styles.removeButton}
              >
                <MaterialIcons
                  name="remove-circle-outline"
                  size={24}
                  color="#FF6347"
                />
              </TouchableOpacity>
            )}
          </View>
        ))}
        <TouchableOpacity onPress={handleAddStudent} style={styles.addButton}>
          <MaterialIcons name="add-circle-outline" size={24} color="#4CAF50" />
          <Text style={styles.addButtonText}>Agregar Alumno</Text>
        </TouchableOpacity>
        <Button
          title="Confirmar Reserva"
          onPress={handleConfirm}
          buttonStyle={styles.confirmButton}
        />
        <Button
          title="Cancelar"
          onPress={onClose}
          type="outline"
          buttonStyle={styles.cancelButton}
          titleStyle={styles.cancelButtonText}
        />
      </ScrollView>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 12,
    padding: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
  studentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  studentInput: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  removeButton: {
    marginLeft: 10,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  addButtonText: {
    marginLeft: 8,
    color: "#4CAF50",
    fontSize: 16,
  },
  confirmButton: {
    backgroundColor: "#3B82F6",
    borderRadius: 8,
    marginTop: 20,
  },
  cancelButton: {
    borderColor: "#EF4444",
    borderRadius: 8,
    marginTop: 10,
  },
  cancelButtonText: {
    color: "#EF4444",
  },
});

export default ReservationActionSheet;
