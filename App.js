import "react-native-gesture-handler";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useFonts } from "expo-font";
import Navigation from "./app/navigation";
import SystemNavigationBar from "react-native-system-navigation-bar";
import { StatusBar } from "expo-status-bar";

const App = () => {
  const [fontsLoaded] = useFonts({
    Roboto: require("./assets/fonts/Roboto-Regular.ttf"),
    RobotoBold: require("./assets/fonts/Roboto-Bold.ttf"),
  });

  useEffect(() => {
    SystemNavigationBar.setNavigationColor("#F4FBF8");
  }, []);

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" backgroundColor="#3B82F6" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" backgroundColor="#F4FBF8" />
      <Navigation />
    </>
  );
};

export default App;
