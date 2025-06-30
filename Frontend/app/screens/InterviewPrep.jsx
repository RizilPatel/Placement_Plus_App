import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../context/userContext.js";

const PreparationHub = () => {
  const router = useRouter();
  const { theme } = useUser()
  const navigateTo = (routeName) => {
    try {
      console.log("Navigating to:", routeName);
      if (router) {
        router.push(routeName);
      } else {
        console.error("Router is not initialized.");
      }
    } catch (error) {
      console.error("Navigation error:", error);
    }
  };

  const preparationOptions = [
    {
      id: "dsa",
      title: "DSA Preparation",
      description: "Data Structures & Algorithms",
      route: "/screens/QuestionAskByCompanies", // Route for DSA preparation
      icon: (props) => <FontAwesome5 name="code" {...props} />, // Icon for DSA
      gradient: theme === 'light'
        ? ["#f0f0ff", "#e0e0ff"]
        : ["#3a1c71", "#d76d77"], // Gradient colors
      topics: "100+ Algorithms & 50+ Data Structures", // Topics description
    },
    {
      id: "cs",
      title: "Computer Fundamentals",
      description: "OS, DBMS, CN & OOPS",
      route: "/screens/FundamentalSubject", // Route for Computer Fundamentals
      icon: (props) => <MaterialCommunityIcons name="laptop" {...props} />, // Icon for CS
      gradient: theme === 'light'
        ? ["#e6f7ff", "#c2e0ff"] // Updated light theme gradient
        : ["#000428", "#004e92"], // Gradient colors
      topics: "4 Subjects & 200+ Important Topics", // Topics description
    },
    {
      id: "hr",
      title: "HR Preparation",
      description: "Interview Skills & Communication",
      route: "/screens/hrQuestions",
      icon: (props) => <Ionicons name="people" {...props} />,
      gradient: theme === 'light'
        ? ["#fff5f0", "#ffe6e0"]
        : ["#603813", "#b29f94"],
      topics: "50+ Common Questions & Mock Interviews", // Topics description
    },
  ];

  // Function to render each preparation card
  const renderPreparationCard = (option, index) => {
    return (
      <TouchableOpacity
        key={option.id}
        style={styles.cardContainer}
        activeOpacity={0.7}
        onPress={() => navigateTo(option.route)} // Navigate on press
      >
        <LinearGradient
          colors={option.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              {option.icon({
                size: 32,
                color: theme === 'light' ? '#6A0DAD' : 'white'
              })}
            </View>
            <View style={styles.cardTextContent}>
              <Text style={[
                styles.cardTitle,
                { color: theme === 'light' ? '#333333' : 'white' }
              ]}>
                {option.title}
              </Text>
              <Text style={[
                styles.cardDescription,
                { color: theme === 'light' ? '#6A0DAD' : 'rgba(255, 255, 255, 0.8)' }
              ]}>
                {option.description}
              </Text>
              <View style={[
                styles.topicsContainer,
                {
                  backgroundColor: theme === 'light'
                    ? 'rgba(106, 13, 173, 0.05)'
                    : 'rgba(0, 0, 0, 0.15)'
                }
              ]}>
                <Text style={[
                  styles.topicsText,
                  { color: theme === 'light' ? '#6A0DAD' : 'rgba(255, 255, 255, 0.9)' }
                ]}>
                  {option.topics}
                </Text>
              </View>
            </View>
          </View>
          <View style={[
            styles.cardFooter,
            {
              backgroundColor: theme === 'light'
                ? 'rgba(106, 13, 173, 0.1)'
                : 'rgba(0, 0, 0, 0.2)'
            }
          ]}>
            <Text style={[
              styles.getStartedText,
              { color: theme === 'light' ? '#6A0DAD' : 'white' }
            ]}>
              Get Started
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={theme === 'light' ? '#6A0DAD' : 'white'}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme === 'light' ? '#F5F5F5' : '#1a012c' }
    ]}>
      <StatusBar
        barStyle={theme === 'light' ? "dark-content" : "light-content"}
        backgroundColor={theme === 'light' ? '#F5F5F5' : '#1a012c'}
      />

      {/* Header */}
      <View style={[
        styles.header,
        {
          borderBottomColor: theme === 'light'
            ? '#E0E0E0'
            : 'rgba(255, 255, 255, 0.1)'
        }
      ]}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} >
            <Ionicons name="arrow-back" size={30} color="white" />
          </Pressable>
          <View>
            <Text style={[
              styles.greeting,
              { color: theme === 'light' ? '#333333' : 'white' }
            ]}>
              Crack The Interview
            </Text>
          </View>
          <TouchableOpacity style={[
            styles.profileButton,
            { borderColor: theme === 'light' ? '#6A0DAD' : '#8b0890' }
          ]}
            onPress={() => router.push('screens/Profile/Profile')}
          >
            <Ionicons
              name="person-circle"
              size={45}
              color={'#6A0DAD'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Page Content */}
      <View style={styles.content}>
        <Text style={[
          styles.sectionTitle,
          { color: theme === 'light' ? '#333333' : 'white' }
        ]}>
          Preparation Tracks
        </Text>

        {/* Preparation Options */}
        <View style={styles.cardsContainer}>
          {preparationOptions.map(renderPreparationCard)}
        </View>
      </View>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    marginTop: 10
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 5,
  },
  profileButton: {
    width: 45,
    height: 45,
    borderRadius: 25,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  cardsContainer: {
    flex: 1,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
  },
  cardContent: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTextContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  cardDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  topicsContainer: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-start",
  },
  topicsText: {
    fontSize: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 15,
  },
  getStartedText: {
    fontSize: 14,
    fontWeight: "bold",
    marginRight: 8,
  },
});

export default PreparationHub;

