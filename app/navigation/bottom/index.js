import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import BottomScreen1 from "../stack/index";
import calendar from "../stack/calendar";
import { auth, db } from "../../../firebase/firebaseConfig";
import IonIcon from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import ProfileScreen from "../stack/profile";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

const BottomTab = createBottomTabNavigator();

const BottomNav = () => {
  const [isProfesor, setIsProfesor] = useState(false);

  useEffect(() => {
    // Verifica si el usuario actual está en la colección profesores
    const colRef = collection(db, "profesores");
    const unsubscribe = onSnapshot(colRef, (snapshot) => {
      const profesores = snapshot.docs.map((doc) => doc.id);
      setIsProfesor(profesores.includes(auth.currentUser?.uid));
    });

    return () => unsubscribe();
  }, []);

  return (
    <BottomTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#F4FBF8",
          borderTopColor: "#F4FBF8",
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 12,
          },
          shadowOpacity: 0.58,
          shadowRadius: 16.0,
          elevation: 24,
        },
      }}
      shifting={true}
      sceneAnimationEnabled={false}
    >
      <BottomTab.Screen
        name="Calendario"
        component={calendar}
        options={{
          tabBarIcon: ({ color, size, focused }) =>
            focused ? (
              <IonIcon name="calendar-number" size={size} color={color} />
            ) : (
              <IonIcon
                name="calendar-number-outline"
                size={size}
                color={color}
              />
            ),
        }}
      />
      {isProfesor && (
        <BottomTab.Screen
          name="Nombre Screen 1"
          component={BottomScreen1}
          options={{
            tabBarIcon: ({ color, size, focused }) =>
              focused ? (
                <MaterialCommunityIcons
                  name="checkbox-multiple-blank"
                  size={size}
                  color={color}
                />
              ) : (
                <MaterialCommunityIcons
                  name="checkbox-multiple-blank-outline"
                  size={size}
                  color={color}
                />
              ),
          }}
        />
      )}
      <BottomTab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="account-circle"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </BottomTab.Navigator>
  );
};

export default BottomNav;
