import React, { useState, useEffect } from "react";
import { View, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Text, Button, ListItem } from "@rneui/themed";
import { MaterialIcons } from "@expo/vector-icons";
import { auth } from "../../../firebase/firebaseConfig";

const HourList = ({
  hours,
  selectedDay,
  getAvailableClassrooms,
  reservations,
  onReserve,
}) => {
  const [selectedHours, setSelectedHours] = useState([]);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    setSelectedHours([]);
    setSelectedClassroom(null);
    setIsSelecting(false);
  }, [selectedDay]);

  const handleHourPress = (hour, classroom) => {
    if (isSelecting) {
      if (classroom === selectedClassroom) {
        setSelectedHours((prevHours) => {
          if (prevHours.includes(hour)) {
            return prevHours.filter((h) => h !== hour);
          } else {
            return [...prevHours, hour].sort(
              (a, b) => hours.indexOf(a) - hours.indexOf(b)
            );
          }
        });
      }
    } else {
      onReserve(classroom, [hour]);
    }
  };

  const handleLongPress = (hour, classroom) => {
    if (!isSelecting) {
      setIsSelecting(true);
      setSelectedClassroom(classroom);
      setSelectedHours([hour]);
    }
  };

  const handleCancelSelection = () => {
    setSelectedHours([]);
    setSelectedClassroom(null);
    setIsSelecting(false);
  };

  const handleConfirmSelection = () => {
    if (selectedHours.length > 0 && selectedClassroom) {
      onReserve(selectedClassroom, selectedHours);
      setSelectedHours([]);
      setSelectedClassroom(null);
      setIsSelecting(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={hours}
        keyExtractor={(item) => item}
        renderItem={({ item: hour }) => {
          const availableClassrooms = getAvailableClassrooms(hour);
          const isAccepted = hour.status === "accepted";
          const isReservedByMe = reservations.some(
            (res) =>
              res.user === auth.currentUser.displayName &&
              res.hour === hour &&
              res.day === selectedDay
          );

          if (isAccepted) return null;

          const listItemStyle = [
            styles.listItemContainer,
            isReservedByMe && { backgroundColor: "#FFF9C4" },
          ];

          return (
            <ListItem bottomDivider containerStyle={listItemStyle}>
              <ListItem.Content>
                <ListItem.Title style={styles.hourText}>{hour}</ListItem.Title>
                <View style={styles.classroomContainer}>
                  {availableClassrooms.length > 0 ? (
                    availableClassrooms.map((classroom) => {
                      const isSelected =
                        selectedHours.includes(hour) &&
                        classroom.name === selectedClassroom;

                      return (
                        <TouchableOpacity
                          key={classroom.name}
                          style={[
                            styles.classroomButton,
                            isSelected && styles.selectedClassroomButton,
                          ]}
                          onPress={() => handleHourPress(hour, classroom.name)}
                          onLongPress={() =>
                            handleLongPress(hour, classroom.name)
                          }
                        >
                          <MaterialIcons
                            name="school"
                            size={16}
                            color={isSelected ? "#FFFFFF" : "#3b82f6"}
                            style={styles.classroomIcon}
                          />
                          <Text
                            style={[
                              styles.classroomButtonText,
                              isSelected && styles.selectedClassroomButtonText,
                            ]}
                          >
                            {classroom.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.noClassroomsContainer}>
                      <Text style={styles.noClassroomsText}>
                        No hay aulas disponibles en este horario.
                      </Text>
                      {isReservedByMe && (
                        <Text style={styles.reservedByMeText}>
                          Has realizado esta reserva. Está pendiente de
                          aprobación y recibirás un email con la confirmación.
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              </ListItem.Content>
            </ListItem>
          );
        }}
        contentContainerStyle={styles.hoursContainer}
      />

      {isSelecting && selectedHours.length > 0 && selectedClassroom && (
        <View style={styles.floatingButtonContainer}>
          <Button
            title="Confirmar selección"
            onPress={handleConfirmSelection}
            buttonStyle={styles.confirmButton}
            containerStyle={styles.confirmButtonContainer}
          />
          <Button
            title="Cancelar"
            onPress={handleCancelSelection}
            buttonStyle={styles.cancelButton}
            containerStyle={styles.cancelButtonContainer}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hoursContainer: {
    paddingBottom: 20,
  },
  listItemContainer: {
    backgroundColor: "#F4FBF8",
    borderBottomColor: "#E0E0E0",
    borderBottomWidth: 1,
  },
  hourText: {
    fontSize: 18,
    color: "#333333",
    fontWeight: "bold",
    marginBottom: 10,
  },
  classroomContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  classroomButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderColor: "#3b82f6",
    borderWidth: 1,
  },
  selectedClassroomButton: {
    backgroundColor: "#3b82f6",
  },
  classroomButtonText: {
    fontSize: 14,
    color: "#3b82f6",
    marginLeft: 4,
  },
  selectedClassroomButtonText: {
    color: "#FFFFFF",
  },
  classroomIcon: {
    marginRight: 4,
  },
  noClassroomsText: {
    color: "#ef4444",
    fontStyle: "italic",
    fontSize: 14,
  },
  confirmButton: {
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    paddingVertical: 12,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
    borderRadius: 8,
    paddingVertical: 12,
  },
  confirmButtonContainer: {
    width: "60%",
  },
  cancelButtonContainer: {
    width: "40%",
  },
  floatingButtonContainer: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 5,
    marginHorizontal: 16,
  },
});

export default HourList;
