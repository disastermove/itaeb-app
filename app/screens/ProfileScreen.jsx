"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Avatar, Button, Input, Card } from "@rneui/themed";
import { auth, db } from "../../firebase/firebaseConfig";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { signOut, updateProfile } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import appjson from "../../app.json";
import Icon from "react-native-vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

const AvatarDefault = [
  {
    id: 1,
    image:
      "https://firebasestorage.googleapis.com/v0/b/vital-2ccac.appspot.com/o/avatar%2Fplaystation.png?alt=media&token=1adf66d5-90bf-48a6-be14-f0c5574b9bb8",
  },
  {
    id: 2,
    image:
      "https://firebasestorage.googleapis.com/v0/b/vital-2ccac.appspot.com/o/avatar%2Fconsola.png?alt=media&token=65a3fd9c-bd1b-44e3-b86e-084b576c093a",
  },
  {
    id: 3,
    image:
      "https://firebasestorage.googleapis.com/v0/b/vital-2ccac.appspot.com/o/avatar%2Fchampi%C3%B1on_rojo.png?alt=media&token=7fc9e4db-f970-4604-bbf0-f5d9a4cf91b8",
  },
  {
    id: 4,
    image:
      "https://firebasestorage.googleapis.com/v0/b/vital-2ccac.appspot.com/o/avatar%2Fsniper.png?alt=media&token=5d956b08-150a-4d0c-831c-9b3a510d1e42",
  },
  {
    id: 5,
    image:
      "https://firebasestorage.googleapis.com/v0/b/vital-2ccac.appspot.com/o/avatar%2Fzidanne.png?alt=media&token=86a5f2ca-bfb3-4608-856d-0b2955aea901",
  },
  {
    id: 6,
    image:
      "https://firebasestorage.googleapis.com/v0/b/vital-2ccac.appspot.com/o/avatar%2Fspiderman.png?alt=media&token=bbb14a79-c723-4c30-8bb1-30c4289224fe",
  },
];

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [reservationsCount, setReservationsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data());
            setName(userDoc.data().displayName || "");
            setBio(userDoc.data().bio || "");
          }

          const reservationsRef = collection(db, "events");
          const q = query(
            reservationsRef,
            where("userId", "==", auth.currentUser.uid)
          );
          const querySnapshot = await getDocs(q);
          setReservationsCount(querySnapshot.size);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await signOut(auth);
      // La navegación ocurrirá automáticamente
    } catch (error) {
      console.error("Error signing out: ", error);
      Alert.alert("Error", "No se pudo cerrar sesión.");
      setLoggingOut(false);
    }
  };

  const assignDefaultAvatar = async (name) => {
    try {
      setSavingProfile(true);
      const index = name.length % AvatarDefault.length;
      const selectedAvatar = AvatarDefault[index].image;

      const currentUser = auth.currentUser;
      const docRef = doc(db, "users", currentUser.uid);

      await updateDoc(docRef, {
        displayName: name,
        photoURL: selectedAvatar,
        bio: bio,
      });

      await updateProfile(currentUser, {
        displayName: name,
        photoURL: selectedAvatar,
      });

      setUser((prevUser) => ({
        ...prevUser,
        displayName: name,
        photoURL: selectedAvatar,
        bio: bio,
      }));

      setSavingProfile(false);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (error) {
      console.error("Error asignando avatar: ", error);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
      setSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C9BFF" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>No se pudo cargar el perfil</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#F4FBF8", "#E6F7FF"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card containerStyle={styles.card}>
          <View style={styles.header}>
            <TouchableOpacity activeOpacity={0.8}>
              <Avatar
                size="xlarge"
                rounded
                source={{
                  uri: user.photoURL || "https://via.placeholder.com/150",
                }}
                containerStyle={styles.avatar}
              />
            </TouchableOpacity>
            {editing ? (
              <Input
                placeholder="Nombre"
                value={name}
                onChangeText={setName}
                containerStyle={styles.input}
                leftIcon={<Icon name="person" size={20} color="#4C9BFF" />}
              />
            ) : (
              <Text style={styles.name}>
                {user.displayName || "Sin nombre"}
              </Text>
            )}
          </View>

          {editing ? (
            <Input
              placeholder="Bio"
              value={bio}
              onChangeText={setBio}
              multiline
              containerStyle={styles.input}
              leftIcon={<Icon name="info" size={20} color="#4C9BFF" />}
            />
          ) : (
            <View style={styles.bioContainer}>
              <Text style={styles.bio}>{user.bio || "Sin bio"}</Text>
            </View>
          )}

          {editing ? (
            <Button
              title="Guardar"
              onPress={() => {
                setEditing(false);
                assignDefaultAvatar(name);
              }}
              loading={savingProfile}
              buttonStyle={styles.saveButton}
              titleStyle={styles.buttonTitle}
              loadingProps={{ color: "white" }}
            />
          ) : (
            <Button
              title="Editar Perfil"
              onPress={() => setEditing(true)}
              icon={
                <Icon
                  name="edit"
                  size={20}
                  color="white"
                  style={{ marginRight: 10 }}
                />
              }
              buttonStyle={styles.editButton}
              titleStyle={styles.buttonTitle}
            />
          )}

          <Button
            title="Cerrar Sesión"
            onPress={handleLogout}
            loading={loggingOut}
            buttonStyle={styles.logoutButton}
            titleStyle={styles.buttonTitle}
            loadingProps={{ color: "white" }}
            icon={
              <Icon
                name="logout"
                size={20}
                color="white"
                style={{ marginRight: 10 }}
              />
            }
          />
        </Card>

        <Card containerStyle={styles.infoCard}>
          <View style={styles.infoContainer}>
            <Icon
              name="info"
              size={20}
              color="#4C9BFF"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>ID: {auth.currentUser.uid}</Text>
          </View>
          <View style={styles.infoContainer}>
            <Icon
              name="android"
              size={20}
              color="#4C9BFF"
              style={styles.infoIcon}
            />
            <Text style={styles.infoText}>Versión: {appjson.expo.version}</Text>
          </View>
        </Card>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F4FBF8",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  card: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatar: {
    borderWidth: 3,
    borderColor: "#4C9BFF",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 15,
    color: "#333",
  },
  bioContainer: {
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  bio: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  input: {
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: "#4C9BFF",
    borderRadius: 10,
    height: 50,
    marginBottom: 15,
  },
  editButton: {
    backgroundColor: "#4C9BFF",
    borderRadius: 10,
    height: 50,
    marginBottom: 15,
  },
  logoutButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 10,
    height: 50,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  statsCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "#E8ECF4",
  },
  infoCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  infoIcon: {
    marginRight: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
});

export default ProfileScreen;
