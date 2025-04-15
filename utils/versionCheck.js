import { Platform } from "react-native";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Alert, Linking } from "react-native";

export const checkAppVersion = async (currentVersion) => {
  try {
    const docRef = doc(db, "app_versions", Platform.OS);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const { latestVersion, minVersion, updateUrl } = docSnap.data();

      if (currentVersion < minVersion) {
        Alert.alert(
          "Actualización obligatoria",
          "Debes actualizar la aplicación para continuar.",
          [
            {
              text: "Actualizar",
              onPress: () => Linking.openURL(updateUrl),
            },
          ],
          { cancelable: false }
        );
        console.log("Update required");
      } else if (currentVersion < latestVersion) {
        Alert.alert(
          "Actualización disponible",
          "Hay una nueva versión disponible. ¿Deseas actualizar?",
          [
            {
              text: "Actualizar",
              onPress: () => Linking.openURL(updateUrl),
            },
            {
              text: "Más tarde",
              style: "cancel",
            },
          ]
        );
        // console.log("Update available", latestVersion, currentVersion);
      }
    }
  } catch (error) {
    console.error("Error checking app version:", error);
  }
};
