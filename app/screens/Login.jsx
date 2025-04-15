import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebaseConfig";
import SwitchSelector from "react-native-switch-selector";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

// Asume que Header es un componente SVG importado
import Header from "../../assets/svg/header";

const { width } = Dimensions.get("window");

const LoginScreen = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [passLength, setPassLength] = useState(0);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake] = useState(new Animated.Value(0));

  // Animación para el logo
  const [logoAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(logoAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const shakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shake, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shake, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLogin = async () => {
    try {
      setError("");
      setIsLoading(true);

      if (!validateEmail(email)) {
        setError("El correo no es válido");
        shakeAnimation();
        setIsLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      // No necesitamos setIsLoading(false) aquí porque la navegación ocurrirá automáticamente
    } catch (err) {
      setError("Correo o contraseña incorrectos.");
      shakeAnimation();
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError("El correo no es válido.");
      shakeAnimation();
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      shakeAnimation();
      setIsLoading(false);
      return;
    }

    if (!name.trim()) {
      setError("Por favor ingresa un nombre de usuario.");
      shakeAnimation();
      setIsLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(userCredential.user, { displayName: name });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        displayName: name,
        isProfileSetup: false,
      });

      // No necesitamos setIsLoading(false) aquí porque la navegación ocurrirá automáticamente
    } catch (error) {
      console.error("Error de registro:", error);
      setError(
        error.code === "auth/email-already-in-use"
          ? "Este correo ya está registrado."
          : "No se pudo registrar el usuario."
      );
      shakeAnimation();
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passLength < 6) return "#FF6B6B"; // Rojo
    if (passLength < 10) return "#FFD166"; // Amarillo
    return "#06D6A0"; // Verde
  };

  const getPasswordStrengthWidth = () => {
    if (passLength === 0) return "0%";
    if (passLength < 6) return "33%";
    if (passLength < 10) return "66%";
    return "100%";
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <LinearGradient colors={["#F4FBF8", "#E6F7FF"]} style={styles.container}>
        <Animatable.View
          animation="fadeIn"
          duration={1000}
          style={styles.header}
        >
          <Animated.View
            style={{
              transform: [
                { scale: logoAnim },
                {
                  translateY: logoAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            }}
          >
            <Header width={130} height={135} />
          </Animated.View>

          <SwitchSelector
            initial={selectedIndex}
            style={styles.switchSelector}
            textColor="#383838"
            selectedColor="#fff"
            textStyle={{ fontWeight: "500" }}
            selectedTextStyle={{ fontWeight: "600" }}
            fontSize={15}
            borderRadius={12}
            hasPadding={true}
            buttonColor="#4C9BFF"
            borderColor="#ccc"
            backgroundColor="#eaeaea"
            onPress={(value) => {
              setSelectedIndex(value);
              setError("");
            }}
            selectedIndex={selectedIndex}
            options={[
              { label: "Registro", value: 0 },
              { label: "Iniciar Sesión", value: 1 },
            ]}
            animationDuration={250}
          />
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          duration={800}
          delay={300}
          style={styles.contentContainer}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View
              style={{
                transform: [{ translateX: shake }],
              }}
            >
              {error ? (
                <Animatable.View animation="fadeIn" duration={300}>
                  <Text style={styles.error}>{error}</Text>
                </Animatable.View>
              ) : null}

              <Text style={styles.title}>
                {selectedIndex === 0 ? "Crea tu cuenta" : "Bienvenido de nuevo"}
              </Text>

              {selectedIndex === 0 && (
                <Animatable.View animation="fadeIn" duration={500}>
                  <View style={styles.inputContainer}>
                    <MaterialIcons
                      name="person"
                      size={20}
                      color="#4C9BFF"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Nombre de usuario"
                      autoCapitalize="none"
                      onChangeText={setName}
                      style={styles.input}
                    />
                  </View>
                </Animatable.View>
              )}

              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="email"
                  size={20}
                  color="#4C9BFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Correo electrónico"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={setEmail}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons
                  name="lock"
                  size={20}
                  color="#4C9BFF"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Contraseña"
                  autoCapitalize="none"
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (selectedIndex === 0) setPassLength(text.length);
                  }}
                  style={styles.input}
                />
                <TouchableOpacity
                  onPress={() => setPasswordVisible(!passwordVisible)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons
                    name={passwordVisible ? "visibility" : "visibility-off"}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              {selectedIndex === 0 && passLength > 0 && (
                <Animatable.View animation="fadeIn" duration={300}>
                  <Text style={styles.passStrengthLabel}>
                    Seguridad:{" "}
                    {passLength < 6
                      ? "Débil"
                      : passLength < 10
                      ? "Buena"
                      : "Fuerte"}
                  </Text>
                  <View style={styles.passStrengthContainer}>
                    <View
                      style={[
                        styles.passStrengthBar,
                        {
                          width: getPasswordStrengthWidth(),
                          backgroundColor: getPasswordStrengthColor(),
                        },
                      ]}
                    />
                  </View>
                </Animatable.View>
              )}

              <TouchableOpacity
                onPress={selectedIndex === 0 ? handleRegister : handleLogin}
                style={styles.buttonContainer}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={["#4C9BFF", "#2D7EFF"]}
                  style={styles.button}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.buttonText}>
                      {selectedIndex === 0 ? "Registrarse" : "Iniciar Sesión"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {selectedIndex === 1 && (
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    ¿Olvidaste tu contraseña?
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          </ScrollView>
        </Animatable.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FBF8",
  },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 20,
  },
  switchSelector: {
    width: width * 0.8,
    marginTop: 30,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    paddingBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginBottom: 25,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: "#E8ECF4",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    fontSize: 16,
    color: "#333",
  },
  eyeIcon: {
    padding: 10,
  },
  passStrengthLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  passStrengthContainer: {
    height: 6,
    backgroundColor: "#E8ECF4",
    borderRadius: 3,
    marginBottom: 20,
    overflow: "hidden",
  },
  passStrengthBar: {
    height: "100%",
    borderRadius: 3,
    transition: "width 0.3s ease",
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#4C9BFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  button: {
    height: 55,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#FFEEEE",
    borderRadius: 8,
    overflow: "hidden",
    fontSize: 14,
  },
  forgotPassword: {
    alignSelf: "center",
    marginTop: 20,
  },
  forgotPasswordText: {
    color: "#4C9BFF",
    fontSize: 14,
  },
});

export default LoginScreen;
