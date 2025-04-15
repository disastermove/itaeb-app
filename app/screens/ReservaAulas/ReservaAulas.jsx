import React, { useState, useCallback } from "react";
import { StyleSheet, Alert, StatusBar, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { db, auth } from "../../../firebase/firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getCollectionRealtime } from "../../../firebase/api";
import moment from "moment";
import HourList from "./HourList";
import DaySelector from "./DaySelector";
import ReservationActionSheet from "./ReservationActionSheet";
import { useFocusEffect } from "@react-navigation/native";
import FadeInView from "../FadeInView";
import { send, EmailJSResponseStatus } from "@emailjs/react-native";

const sendReservationEmail = async (email) => {
  try {
    await send(
      "service_1fkvybp",
      "template_71kn8er",
      {
        email,
        title: "Reserva pendiente",
        body: "Tu solicitud de reserva ha sido recibida correctamente y se ha puesto en espera. El equipo de reservas de ITAEB revisará tu solicitud y te responderá lo antes posible.",
      },
      {
        publicKey: "D7kkjjUfo3TOpQKR_",
      }
    );

    console.log("SUCCESS!");
  } catch (err) {
    if (err instanceof EmailJSResponseStatus) {
      console.log("EmailJS Request Failed...", err);
    }

    console.log("ERROR", err);
  }
};

const ReservaAulas = () => {
  moment.updateLocale("es", {
    weekdays: [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ],
  });

  const today = moment();
  const initialDay =
    today.isoWeekday() >= 6 ? today.startOf("isoWeek").add(1, "days") : today;
  const [selectedDay, setSelectedDay] = useState(
    initialDay.add(1, "week").format("YYYY-MM-DD")
  );
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [selectedHours, setSelectedHours] = useState([]);
  const [students, setStudents] = useState(["Alumno"]);
  const [reservations, setReservations] = useState([]);
  const [isActionSheetVisible, setIsActionSheetVisible] = useState(false);

  const hours = [
    "8:00 - 9:00",
    "9:00 - 9:55",
    "9:55 - 10:50",
    "11:20 - 12:20",
    "12:20 - 13:15",
    "13:15 - 14:10",
    "15:00 - 16:00",
    "16:00 - 16:55",
    "16:55 - 17:50",
    "18:20 - 19:20",
    "19:20 - 20:15",
    "20:15 - 21:10",
  ];

  const classrooms = [
    {
      name: "Aula Podcast",
      isAvailable: (day) => {
        const formattedDay = moment(day).locale("es").format("dddd");
        return ["miércoles", "viernes"].includes(formattedDay.toLowerCase());
      },
    },
    {
      name: "Espectacle",
      isAvailable: (day) => {
        const formattedDay = moment(day).locale("es").format("dddd");
        return formattedDay.toLowerCase() === "martes";
      },
    },
    {
      name: "A24",
      isAvailable: (day, hour) => {
        const formattedDay = moment(day).locale("es").format("dddd");
        const restrictedHours = [
          "11:20 - 12:20",
          "12:20 - 13:15",
          "13:15 - 14:10",
        ];
        return !(
          restrictedHours.includes(hour) &&
          ["martes", "jueves"].includes(formattedDay.toLowerCase())
        );
      },
    },
  ];

  useFocusEffect(
    useCallback(() => {
      const unsubscribe = getCollectionRealtime(
        "reservas-pendientes",
        (data) => {
          setReservations(data);
        }
      );

      return () => unsubscribe();
    }, [])
  );

  const getAvailableClassrooms = useCallback(
    (hour) => {
      return classrooms.filter((classroom) => {
        const isAvailable = classroom.isAvailable(selectedDay, hour);

        const isReserved = reservations.some(
          (reservation) =>
            reservation.location === classroom.name &&
            reservation.hour === hour &&
            moment(reservation.day).isSame(moment(selectedDay), "day")
        );

        return isAvailable && !isReserved;
      });
    },
    [selectedDay, reservations]
  );

  const makeReservation = async (students) => {
    try {
      const validStudents = students.filter((student) => student.trim() !== "");

      if (validStudents.length === 0) {
        Alert.alert("Error", "Por favor ingresa al menos un nombre de alumno.");
        return;
      }

      for (const hour of selectedHours) {
        const [startTime, endTime] = hour.split(" - ");
        const start = moment(
          `${selectedDay} ${startTime}`,
          "YYYY-MM-DD HH:mm"
        ).toDate();
        const end = moment(
          `${selectedDay} ${endTime}`,
          "YYYY-MM-DD HH:mm"
        ).toDate();
        console.log("Start:", start);
        console.log("End:", end);
        // const createdAt = reserva.createdAt?.toDate?.() || new Date();

        await addDoc(collection(db, "reservas-pendientes"), {
          location: selectedClassroom,
          day: selectedDay,
          hour: hour,
          start,
          end,
          title: "Reserva de " + "(" + selectedClassroom + ")",
          createdAt: new Date(),
          user: auth.currentUser.displayName,
          type: "Aula",
          userId: auth.currentUser.uid,
          students: validStudents,
        });
      }

      await sendReservationEmail(auth.currentUser.email);
      console.log(auth.currentUser.email);

      Alert.alert(
        "Reserva en proceso",
        `La clase ${selectedClassroom} ha sido enviada a revisión para los siguientes alumnos: ${validStudents.join(
          ", "
        )} en el horario: ${selectedHours.join(", ")}.`
      );

      setReservations((prevReservations) => [
        ...prevReservations,
        ...selectedHours.map((hour) => ({
          classroom: selectedClassroom,
          day: selectedDay,
          hour: hour,
          students: validStudents,
        })),
      ]);

      setSelectedHours([]);
    } catch (error) {
      Alert.alert("Error", "Hubo un problema al realizar la reserva.");
      console.error(error);
    }
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const date = moment().add(2, "week").startOf("week").add(i, "days");
    return {
      key: date.format("YYYY-MM-DD"),
      label: date.format("dddd DD"),
    };
  });

  const handleReserve = (classroom, hours) => {
    setSelectedClassroom(classroom);
    setSelectedHours(hours);
    setIsActionSheetVisible(true);
  };

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

  const isHoliday = (day) => festius.includes(moment(day).format("YYYY-MM-DD"));

  return (
    <SafeAreaProvider>
      <StatusBar
        style="dark" // Usa texto oscuro para contrastar con el fondo claro (#F4FBF8)
        backgroundColor="#F4FBF8" // Fondo igual al fondo de la aplicación
        translucent={true} // Para un efecto más moderno (puedes cambiar a false si prefieres opaco)
      />
      <FadeInView style={styles.container}>
        <DaySelector
          days={days}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />
        {isHoliday(selectedDay) ? (
          <FadeInView style={{ padding: 20 }}>
            <Text style={{ fontSize: 16, textAlign: "center", color: "#444" }}>
              Este día es festivo. No se pueden hacer reservas.
            </Text>
          </FadeInView>
        ) : (
          <HourList
            hours={hours}
            selectedDay={selectedDay}
            getAvailableClassrooms={getAvailableClassrooms}
            reservations={reservations}
            onReserve={handleReserve}
          />
        )}
        <ReservationActionSheet
          isVisible={isActionSheetVisible}
          onClose={() => setIsActionSheetVisible(false)}
          onConfirmReservation={makeReservation}
          students={students}
          selectedHours={selectedHours}
        />
      </FadeInView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FBF8",
  },
  scrollContainer: {
    flex: 1,
  },
});

export default ReservaAulas;
