import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import ReservaAulas from "../../screens/ReservaAulas/ReservaAulas.jsx";

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        cardStyle: { backgroundColor: "#F4FBF8" },
        headerStyle: {
          backgroundColor: "#F4FBF8",
          borderBottomWidth: 0,
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.18,
          shadowRadius: 1.0,

          elevation: 1,
        },
        headerTintColor: "#000",
      }}
    >
      <Stack.Screen name="Reservar Aulas" component={ReservaAulas} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
