"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Button, Card, Icon, Overlay } from "@rneui/themed";
import { getCollectionRealtime } from "../../firebase/api";
import { db } from "../../firebase/firebaseConfig";
import moment from "moment";
import "moment/locale/es";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";

moment.locale("es");

const { width } = Dimensions.get("window");

const ReservasPendientes = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = () => {
    const unsubscribe = getCollectionRealtime("reservas-pendientes", (data) => {
      const sortedData = [...data].sort((a, b) => {
        const timeA = a.day ? moment(a.day) : moment(0);
        const timeB = b.day ? moment(b.day) : moment(0);
        return timeB.diff(timeA); // Orden descendente (más reciente primero)
      });

      const filteredData = sortedData.filter(
        (item) => item.status !== "accepted"
      );

      setReservations(filteredData);
      setLoading(false);
      setRefreshing(false);
    });

    return unsubscribe;
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadReservations();
  };

  const handleAccept = async (id) => {
    try {
      setProcessingId(id);
      const pendingDocRef = doc(db, "reservas-pendientes", id);
      const pendingDocSnapshot = await getDoc(pendingDocRef);

      if (!pendingDocSnapshot.exists()) {
        Alert.alert("Error", "La reserva no existe");
        setProcessingId(null);
        return;
      }

      const reservationData = pendingDocSnapshot.data();
      const acceptedDocRef = doc(db, "events", id);
      await setDoc(acceptedDocRef, reservationData);
      await updateDoc(pendingDocRef, { status: "accepted" });

      // Mostrar alerta de éxito con animación
      setProcessingId(null);
      Alert.alert(
        "Reserva Aceptada",
        `La reserva para ${reservationData.location} ha sido aceptada correctamente.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Error al aceptar la reserva:", error);
      Alert.alert("Error", "No se pudo aceptar la reserva");
      setProcessingId(null);
    }
  };

  const handleReject = async (id) => {
    try {
      setProcessingId(id);

      // Mostrar confirmación antes de rechazar
      Alert.alert(
        "Confirmar Rechazo",
        "¿Estás seguro de que deseas rechazar esta reserva?",
        [
          {
            text: "Cancelar",
            style: "cancel",
            onPress: () => setProcessingId(null),
          },
          {
            text: "Rechazar",
            style: "destructive",
            onPress: async () => {
              await deleteDoc(doc(db, "reservas-pendientes", id));
              setProcessingId(null);
              Alert.alert("Éxito", "Reserva rechazada correctamente");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error al rechazar la reserva:", error);
      Alert.alert("Error", "No se pudo rechazar la reserva");
      setProcessingId(null);
    }
  };

  const renderReservationItem = ({ item, index }) => {
    const isProcessing = processingId === item.id;
    const animationDelay = index * 150;

    return (
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        delay={animationDelay}
        useNativeDriver
      >
        <Card containerStyle={styles.card}>
          <LinearGradient
            colors={["rgba(255,255,255,0.8)", "rgba(244,251,248,0.9)"]}
            style={styles.cardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.locationContainer}>
                <Icon
                  name="location-pin"
                  type="material"
                  color="#3498db"
                  size={20}
                />
                <Text style={styles.classroom}>{item.location}</Text>
              </View>
              <View style={styles.dateContainer}>
                <Icon
                  name="calendar"
                  type="feather"
                  color="#7f8c8d"
                  size={16}
                />
                <Text style={styles.date}>
                  {moment(item.day).format("DD MMM YYYY")}
                </Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailItem}>
                <Icon name="clock" type="feather" color="#2c3e50" size={16} />
                <Text style={styles.hour}>{item.hour}</Text>
              </View>

              <View style={styles.detailItem}>
                <Icon name="user" type="feather" color="#34495e" size={16} />
                <Text style={styles.student}>{item.alumne || item.user}</Text>
              </View>

              <View style={styles.detailItem}>
                <Icon
                  name="calendar-clock"
                  type="material-community"
                  color="#7f8c8d"
                  size={16}
                />
                <Text style={styles.timeAgo}>
                  {moment(item.createdAt.toDate()).fromNow()}
                </Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Button
                title="Aceptar"
                onPress={() => handleAccept(item.id)}
                buttonStyle={[styles.button, styles.acceptButton]}
                loading={isProcessing && processingId === item.id}
                disabled={isProcessing}
                icon={
                  !isProcessing && {
                    name: "check",
                    type: "feather",
                    color: "white",
                    size: 18,
                  }
                }
                titleStyle={styles.buttonTitle}
              />
              <Button
                title="Rechazar"
                onPress={() => handleReject(item.id)}
                buttonStyle={[styles.button, styles.rejectButton]}
                disabled={isProcessing}
                icon={
                  !isProcessing && {
                    name: "x",
                    type: "feather",
                    color: "white",
                    size: 18,
                  }
                }
                titleStyle={styles.buttonTitle}
              />
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => {
                  setSelectedReservation(item);
                  setIsOverlayVisible(true);
                }}
                disabled={isProcessing}
              >
                <Icon
                  name="info"
                  type="feather"
                  color="#3498db"
                  size={24}
                  containerStyle={styles.infoIcon}
                />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Card>
      </Animatable.View>
    );
  };

  const renderEmptyComponent = () => (
    <Animatable.View
      animation="fadeIn"
      duration={800}
      style={styles.emptyContainer}
    >
      <Icon
        name="calendar-remove"
        type="material-community"
        color="#bdc3c7"
        size={80}
      />
      <Text style={styles.emptyText}>No hay reservas pendientes</Text>
      <Text style={styles.emptySubtext}>
        Las reservas pendientes aparecerán aquí para su aprobación
      </Text>
    </Animatable.View>
  );

  return (
    <LinearGradient colors={["#F4FBF8", "#E6F7FF"]} style={styles.container}>
      <StatusBar style="dark" backgroundColor="#F4FBF8" translucent={true} />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Cargando reservas...</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderReservationItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#3498db"]}
              tintColor="#3498db"
            />
          }
        />
      )}

      <Overlay
        isVisible={isOverlayVisible}
        onBackdropPress={() => setIsOverlayVisible(false)}
        overlayStyle={styles.overlay}
        animationType="fade"
      >
        {selectedReservation && (
          <Animatable.View
            animation="fadeInUp"
            duration={300}
            style={styles.overlayContent}
          >
            <View style={styles.overlayHeader}>
              <Text style={styles.overlayTitle}>Detalles de la Reserva</Text>
              <TouchableOpacity
                onPress={() => setIsOverlayVisible(false)}
                style={styles.closeOverlayButton}
              >
                <Icon name="x" type="feather" color="#7f8c8d" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.overlayDetailsContainer}>
              <View style={styles.overlayDetailItem}>
                <Icon name="map-pin" type="feather" color="#3498db" size={20} />
                <Text style={styles.overlayDetailText}>
                  <Text style={styles.overlayDetailLabel}>Aula: </Text>
                  {selectedReservation.location}
                </Text>
              </View>

              <View style={styles.overlayDetailItem}>
                <Icon
                  name="calendar"
                  type="feather"
                  color="#3498db"
                  size={20}
                />
                <Text style={styles.overlayDetailText}>
                  <Text style={styles.overlayDetailLabel}>Fecha: </Text>
                  {moment(selectedReservation.day).format("DD MMMM YYYY")}
                </Text>
              </View>

              <View style={styles.overlayDetailItem}>
                <Icon name="clock" type="feather" color="#3498db" size={20} />
                <Text style={styles.overlayDetailText}>
                  <Text style={styles.overlayDetailLabel}>Hora: </Text>
                  {selectedReservation.hour}
                </Text>
              </View>

              <View style={styles.overlayDetailItem}>
                <Icon name="user" type="feather" color="#3498db" size={20} />
                <Text style={styles.overlayDetailText}>
                  <Text style={styles.overlayDetailLabel}>Solicitante: </Text>
                  {selectedReservation.user || selectedReservation.alumne}
                </Text>
              </View>

              <View style={styles.overlayDetailItem}>
                <Icon name="users" type="feather" color="#3498db" size={20} />
                <View style={styles.studentsContainer}>
                  <Text style={styles.overlayDetailLabel}>Estudiantes:</Text>
                  {selectedReservation.students.map((student, index) => (
                    <Text key={index} style={styles.studentItem}>
                      • {student}
                    </Text>
                  ))}
                </View>
              </View>

              <View style={styles.overlayDetailItem}>
                <Icon name="info" type="feather" color="#3498db" size={20} />
                <Text style={styles.overlayDetailText}>
                  <Text style={styles.overlayDetailLabel}>Creada: </Text>
                  {moment(selectedReservation.createdAt.toDate()).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.overlayButtonsContainer}>
              <Button
                title="Aceptar Reserva"
                onPress={() => {
                  setIsOverlayVisible(false);
                  handleAccept(selectedReservation.id);
                }}
                buttonStyle={styles.overlayAcceptButton}
                icon={{
                  name: "check",
                  type: "feather",
                  color: "white",
                  size: 18,
                }}
                titleStyle={styles.buttonTitle}
              />
              <Button
                title="Rechazar"
                onPress={() => {
                  setIsOverlayVisible(false);
                  handleReject(selectedReservation.id);
                }}
                buttonStyle={styles.overlayRejectButton}
                icon={{
                  name: "x",
                  type: "feather",
                  color: "white",
                  size: 18,
                }}
                titleStyle={styles.buttonTitle}
              />
            </View>
          </Animatable.View>
        )}
      </Overlay>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: "#7f8c8d",
  },
  listContainer: {
    paddingBottom: 20,
    paddingTop: 10,
    minHeight: "100%",
  },
  card: {
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 0,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 15,
    borderRadius: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    alignItems: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  classroom: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3498db",
    marginLeft: 5,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  date: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 5,
  },
  detailsContainer: {
    marginBottom: 15,
    backgroundColor: "rgba(255,255,255,0.5)",
    padding: 10,
    borderRadius: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  hour: {
    fontSize: 16,
    color: "#2c3e50",
    marginLeft: 8,
  },
  student: {
    fontSize: 14,
    color: "#34495e",
    marginLeft: 8,
  },
  timeAgo: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: width * 0.3,
  },
  buttonTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  acceptButton: {
    backgroundColor: "#2ecc71",
  },
  rejectButton: {
    backgroundColor: "#e74c3c",
  },
  infoButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  infoIcon: {
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#7f8c8d",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#95a5a6",
    textAlign: "center",
    marginTop: 10,
  },
  overlay: {
    width: width * 0.9,
    maxWidth: 500,
    borderRadius: 15,
    padding: 0,
    overflow: "hidden",
  },
  overlayContent: {
    borderRadius: 15,
  },
  overlayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
    backgroundColor: "#f8f9fa",
  },
  overlayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  closeOverlayButton: {
    padding: 5,
  },
  overlayDetailsContainer: {
    padding: 15,
  },
  overlayDetailItem: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  overlayDetailText: {
    fontSize: 16,
    color: "#34495e",
    marginLeft: 10,
    flex: 1,
  },
  overlayDetailLabel: {
    fontWeight: "bold",
    color: "#2c3e50",
  },
  studentsContainer: {
    marginLeft: 10,
    flex: 1,
  },
  studentItem: {
    fontSize: 16,
    color: "#34495e",
    marginTop: 5,
    marginLeft: 5,
  },
  overlayButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    backgroundColor: "#f8f9fa",
  },
  overlayAcceptButton: {
    backgroundColor: "#2ecc71",
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
  },
  overlayRejectButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 15,
    borderRadius: 10,
  },
});

export default ReservasPendientes;
