import { auth } from "../../firebase/firebaseConfig";
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { onAuthStateChanged } from "firebase/auth";
import Bottom from "./bottom/index";
import LoginStack from "./stack/login";
import { CURRENT_VERSION } from "@env"; // Asegúrate de tener configurado react-native-dotenv
import { checkAppVersion } from "../../utils/versionCheck"; // Tu función externa

export default function RootStack() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificación de versión en segundo plano
    checkAppVersion(CURRENT_VERSION).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setInitializing(false); // Ya podemos mostrar la UI
    });

    return () => unsubscribe();
  }, []);

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <Bottom /> : <LoginStack />}
    </NavigationContainer>
  );
}
