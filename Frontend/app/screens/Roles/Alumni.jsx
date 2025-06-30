import React from "react";
import { View, Text, Image, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

const WelcomeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ position: 'absolute', top: 50, left: 20 }}
      >
        <Feather name="arrow-left" size={30} color="white" />
      </TouchableOpacity>
      <View style={styles.logoContainer}>
        <Image source={require("@/assets/images/logo.png")} style={styles.logo} />
        <Text style={styles.logoText}>Placement Plus</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Alumni <Text style={styles.highlight}>Login</Text>
      </Text>

      {/* Navigate to Login */}
      <Pressable style={styles.button} onPress={() => router.push("Alumni/login")}>
        <Text style={styles.buttonText}>SIGN IN</Text>
      </Pressable>

      {/* Navigate to Signup */}
      <Pressable style={styles.button} onPress={() => router.push("Alumni/signup")}>
        <Text style={styles.buttonText}>SIGN UP</Text>
      </Pressable>
    </View>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D021F",
    padding: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 80,
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
    fontSize: 50,
    fontFamily: "sans-serif",
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 80,
    textDecorationStyle: "solid",
    fontStyle: "italic",
  },
  highlight: {
    color: "#C92EFF",
  },
  button: {
    backgroundColor: "#C92EFF",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 10,
    marginVertical: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    color: "white",
    marginVertical: 15,
  },
  socialIcons: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  icon: {
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 50,
    marginHorizontal: 10,
  },
  signupText: {
    color: "white",
    marginTop: 20,
    textAlign: "center",
  },
});