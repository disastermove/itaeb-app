import React, { useEffect, useRef } from "react";
import { StyleSheet, FlatList, TouchableOpacity, View } from "react-native";
import { Text } from "@rneui/themed";
import moment from "moment";

const DaySelector = ({ days, selectedDay, onSelectDay }) => {
  const flatListRef = useRef(null);

  useEffect(() => {
    if (flatListRef.current) {
      const index = days.findIndex((day) => day.key === selectedDay);
      if (index >= 0) {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [selectedDay, days]);

  const festius = [
    "2024-09-11",
    "2024-09-24",
    "2024-10-31",
    "2024-11-01",
    "2024-12-06",
    "2024-12-23",
    "2024-12-24",
    "2024-12-25",
    "2024-12-26",
    "2024-12-27",
    "2024-12-30",
    "2024-12-31",
    "2025-01-01",
    "2025-01-02",
    "2025-01-03",
    "2025-01-06",
    "2025-01-07",
    "2025-03-03",
    "2025-03-28",
    "2025-04-14",
    "2025-04-15",
    "2025-04-16",
    "2025-04-17",
    "2025-04-18",
    "2025-04-21",
    "2025-05-01",
    "2025-05-02",
    "2025-06-09",
    "2025-06-24",
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={days}
        horizontal
        ref={flatListRef}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          const dayOfWeek = moment(item.key).format("dddd");
          const isWeekend = ["Sábado", "Domingo"].includes(dayOfWeek);
          const isHoliday = festius.includes(item.key);
          const isToday = item.key === moment().format("YYYY-MM-DD");
          const isDisabled = isWeekend || isHoliday;

          return (
            <TouchableOpacity
              disabled={isDisabled}
              style={[
                styles.dayButton,
                isToday && styles.todayButton,
                item.key === selectedDay && styles.selectedDayButton,
                isDisabled && styles.disabledButton,
              ]}
              onPress={() => onSelectDay(item.key)}
            >
              <Text
                style={[
                  styles.dayText,
                  isToday && styles.todayText,
                  item.key === selectedDay && styles.selectedDayText,
                  isDisabled && styles.disabledText,
                ]}
              >
                {`${dayOfWeek.slice(0, 3)}`}
              </Text>
              <Text
                style={[
                  styles.dateText,
                  isToday && styles.todayText,
                  item.key === selectedDay && styles.selectedDayText,
                  isDisabled && styles.disabledText,
                ]}
              >
                {moment(item.key).format("DD")}
              </Text>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.daysContainer}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(data, index) => ({
          length: 80,
          offset: 80 * index,
          index,
        })}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  daysContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  dayButton: {
    borderRadius: 12,
    marginHorizontal: 4,
    width: 64,
    height: 64,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  todayButton: {
    backgroundColor: "#FDE68A",
  },
  selectedDayButton: {
    backgroundColor: "#3B82F6",
  },
  disabledButton: {
    backgroundColor: "#E5E7EB", // Gris más claro
  },
  dayText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4B5563",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4B5563",
    marginTop: 4,
  },
  todayText: {
    color: "#92400E",
  },
  selectedDayText: {
    color: "#FFFFFF",
  },
  disabledText: {
    color: "#9CA3AF", // Texto gris claro
  },
});

export default DaySelector;
