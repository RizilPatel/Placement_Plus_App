import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../context/userContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const loadingMessages = [
  "Checking login status",
  "Loading app for you",
  "Fetching data",
  "Collecting resources",
  "Setting things up",
  "Almost there"
];

const RoleSelectionScreen = () => {
  const router = useRouter();
  const { isLoggedIn, isAdminLoggedIn, isAlumniLoggedIn, loading, setLoading } = useUser();
  const messages = [
    "Checking login status...",
    "Fetching your details...",
    "Collecting resources...",
    "Getting everything ready for you...",
  ];
  const [messageIndex, setMessageIndex] = useState(() => Math.floor(Math.random() * messages.length));


  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000);

    const checkUserType = async () => {
      const userType = await AsyncStorage.getItem("userType");
      console.log("User type from AsyncStorage:", userType);

      if (userType === "admin") {
        router.replace("HomePage/AdminHome");
      } else if (userType === "student") {
        router.replace("HomePage/Home");
      } else if (userType === "alumni") {
        router.replace("HomePage/AlumniHome");
      }
    };

    if (!isLoggedIn && !isAdminLoggedIn && !isAlumniLoggedIn) {
      checkUserType();
    }

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <LinearGradient
        colors={['#0D021F', '#1D0442']}
        style={styles.loadingContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.logoContainer}>
          <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
          <Text style={styles.logoText}>Placement Plus</Text>
        </View>

        <ActivityIndicator size="large" color="#C92EFF" style={styles.loadingIndicator} />

        <Text style={styles.loadingText}>
          {messages[messageIndex]}<Text style={styles.loadingDots}>...</Text>
        </Text>
      </LinearGradient>
    );
  }


  return (
    <LinearGradient
      colors={['#0D021F', '#1D0442']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.logoContainer}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.logoText}>Placement Plus</Text>
      </View>

      <Text style={styles.title}>
        Let's Get <Text style={styles.highlight}>Started</Text>
      </Text>

      <Pressable
        style={styles.buttonContainer}
        onPress={() => router.push("Admin/login")}
      >
        <LinearGradient
          colors={['#C92EFF', '#8428B2']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="shield-checkmark" size={28} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>ADMIN</Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        style={styles.buttonContainer}
        onPress={() => router.push("screens/Roles/Alumni")}
      >
        <LinearGradient
          colors={['#C92EFF', '#8428B2']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <FontAwesome5 name="user-graduate" size={26} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>ALUMNI</Text>
        </LinearGradient>
      </Pressable>

      <Pressable
        style={styles.buttonContainer}
        onPress={() => router.push("screens/Roles/Student")}
      >
        <LinearGradient
          colors={['#C92EFF', '#8428B2']}
          style={styles.button}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="school" size={28} color="white" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>STUDENT</Text>
        </LinearGradient>
      </Pressable>
    </LinearGradient>
  );
};

export default RoleSelectionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 60,
  },
  logo: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginRight: 10,
  },
  logoText: {
    color: "white",
    fontSize: 22,
    fontWeight: "bold",
    fontFamily: "sans-serif",
  },
  title: {
    fontSize: 55,
    fontFamily: "sans-serif",
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 60,
    fontStyle: "italic",
    textShadowColor: 'rgba(201, 46, 255, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  highlight: {
    color: "#C92EFF",
  },
  buttonContainer: {
    width: "80%",
    marginVertical: 12,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: "#C92EFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 15,
  },
  buttonIcon: {
    marginRight: 16,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  loadingIndicator: {
    marginBottom: 20,
  },
  loadingText: {
    color: "white",
    fontSize: 18,
    fontFamily: "sans-serif",
    textAlign: "center",
    textShadowColor: 'rgba(201, 46, 255, 0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  loadingDots: {
    color: "#C92EFF",
    fontWeight: "bold",
  }
});
