import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  Dimensions,
  Animated,
  StyleSheet,
  StatusBar,
  ScrollView,
  SafeAreaView,
  Platform,
  BackHandler,
  Alert
} from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useUser } from "../../context/userContext.js";
import { useFocusEffect } from "@react-navigation/native";
import { getAccessToken, getRefreshToken } from "../../utils/tokenStorage.js"

import pastYearCompany from "@/assets/homepageImages/pastyearcompany-Photoroom.png";
import placementStat from "@/assets/homepageImages/placementstat-Photoroom.png";
import alumni from "@/assets/homepageImages/alumni-Photoroom.png";
import interviewPreparation from "@/assets/homepageImages/questionaskbycompany-Photoroom.png";
import upcomingCompany from "@/assets/homepageImages/upcomingcompany-Photoroom.png";
import branchStat from "@/assets/homepageImages/branchstat-Photoroom.png";
import placementPolicies from "@/assets/homepageImages/placementpolicies-Photoroom.png";
import uploadResume from "@/assets/homepageImages/uploadresume-Photoroom.png";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width * 0.28;

// const menuItems = [
//   {
//     id: 0,
//     title: "Past Year Companies",
//     icon: pastYearCompany,
//     route: "/screens/PastYearCompanies",
//     color: "#4F46E5",
//   },
//   {
//     id: 1,
//     title: "Placement Statistics",
//     icon: placementStat,
//     route: "/screens/BranchWisePlacement",
//     color: "#EC4899",
//   },
//   {
//     id: 2,
//     title: "Connect with Alumni",
//     icon: alumni,
//     route: "/screens/ConnectWithAlumni",
//     color: "#10B981",
//   },
//   {
//     id: 3,
//     title: "Interview Preparation",
//     icon: interviewPreparation,
//     route: "/screens/InterviewPrep",
//     color: "#F59E0B",
//   },
//   {
//     id: 4,
//     title: "Upcoming Companies",
//     icon: upcomingCompany,
//     route: "/screens/UpcomingCompanies",
//     color: "#8B5CF6",
//   },
//   {
//     id: 5,
//     title: "Student Placement",
//     icon: branchStat,
//     route: "/screens/StudentPlacements",
//     color: "#EF4444",
//   },
//   {
//     id: 6,
//     title: "Placement Policies",
//     icon: placementPolicies,
//     route: "/screens/PlacementPolicies",
//     color: "#06B6D4",
//   },
//   {
//     id: 7,
//     title: "Upload Resume",
//     icon: uploadResume,
//     route: "/screens/UploadResume",
//     color: "#F97316",
//   },
//   // {
//   //   id: 8,
//   //   title: "AI Assistant",
//   //   icon: chatbot,
//   //   route: "/screens/ChatBot",
//   //   color: "#C92EFF",
//   // },
// ];

const menuItems = []

const PlacementPlus = () => {
  const scrollViewRef = useRef(null);
  const scaleAnims = useRef(menuItems.map(() => new Animated.Value(1))).current;
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState(menuItems);
  const { alumni, theme } = useUser()
  const [newNotifications, setNewNotifications] = useState(0)

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        Alert.alert(
          "Exit App",
          "Are you sure you want to exit?",
          [
            { text: "Cancel", onPress: () => null, style: "cancel" },
            { text: "Yes", onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  const handleSearch = (text) => {
    setSearchQuery(text);

    if (text.trim() === "") {
      setFilteredItems(menuItems);
      return;
    }

    const filtered = menuItems.filter(item =>
      item.title.toLowerCase().includes(text.toLowerCase())
    );

    setFilteredItems(filtered);
  };

  const handlePressIn = (index) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.95,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = (route) => {
    // console.log(route);
    if (route)
      router.push(route);
  };

  const getDynamicStyles = (currentTheme) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: currentTheme === 'light' ? "#F5F5F5" : "#14011F",
    },
    backgroundGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      backgroundColor: currentTheme === 'light'
        ? 'linear-gradient(to bottom, #FFFFFF, #E0E0E0)'
        : undefined,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingTop: Platform.OS === 'android' ? 33 : 10,
      paddingBottom: 16,
      borderBottomWidth: currentTheme === 'light' ? 1 : 0,
      borderBottomColor: currentTheme === 'light' ? "#E0E0E0" : "transparent",
    },
    logoContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    logo: {
      width: 28,
      height: 28,
      resizeMode: "contain",
      marginRight: 8,
    },
    logoText: {
      color: currentTheme === 'light' ? "#6A0DAD" : "white",
      fontSize: 20,
      fontWeight: "bold",
    },
    headerRight: {
      flexDirection: "row",
      alignItems: "center",
    },
    notificationButton: {
      padding: 8,
      marginRight: 8,
      position: "relative",
    },
    notificationBadge: {
      position: "absolute",
      top: 6,
      right: 6,
      backgroundColor: "#FF4747",
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center",
    },
    badgeText: {
      color: "white",
      fontSize: 10,
      fontWeight: "bold",
    },
    profileButton: {
      padding: 4,
    },
    welcomeSection: {
      paddingHorizontal: 16,
      marginBottom: 20,
    },
    welcomeText: {
      color: currentTheme === 'light' ? "#333333" : "white",
      fontSize: 28,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    welcomeSubtext: {
      color: currentTheme === 'light' ? "#666666" : "#BBB",
      fontSize: 16,
      marginTop: 4,
    },
    searchContainer: {
      paddingHorizontal: 16,
      marginBottom: 24,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: currentTheme === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.08)",
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: currentTheme === 'light' ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.05)",
    },
    searchIcon: {
      marginRight: 12,
      color: currentTheme === 'light' ? "#666666" : "#9D9DB5",
    },
    searchInput: {
      flex: 1,
      color: currentTheme === 'light' ? "#333333" : "white",
      fontSize: 16,
      padding: 0,
    },
    gridContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      // justifyContent: "space-between",
    },
    gridItemWrapper: {
      width: "33%",
      paddingHorizontal: 4,
      marginBottom: 20,
    },
    gridItem: {
      alignItems: "center",
    },
    iconContainer: {
      width: CARD_WIDTH,
      height: CARD_WIDTH,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 10,
      borderWidth: 1,
      borderColor: currentTheme === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)",
      backgroundColor: currentTheme === 'light' ? "rgba(106, 13, 173, 0.05)" : undefined,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    gridIcon: {
      width: CARD_WIDTH * 0.7,
      height: CARD_WIDTH * 0.7,
      resizeMode: "contain",
    },
    gridText: {
      color: currentTheme === 'light' ? "#333333" : "white",
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
      width: CARD_WIDTH + 8,
      lineHeight: 18,
    },
    noResults: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
    },
    noResultsText: {
      color: currentTheme === 'light' ? "#333333" : "white",
      fontSize: 18,
      fontWeight: "600",
      marginTop: 16,
    },
    noResultsSubText: {
      color: currentTheme === 'light' ? "#666666" : "#9D9DB5",
      fontSize: 14,
      marginTop: 8,
    },
    footerContainer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      overflow: "hidden",
    },
    footerGradient: {
      position: "absolute",
      height: 100,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: currentTheme === 'light'
        ? 'linear-gradient(to top, #F5F5F5, transparent)'
        : undefined,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      backgroundColor: currentTheme === 'light'
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(29, 10, 63, 0.6)",
      paddingVertical: 16,
      paddingBottom: Platform.OS === 'ios' ? 36 : 16,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      borderTopWidth: 1,
      borderColor: currentTheme === 'light' ? "#E0E0E0" : "rgba(255, 255, 255, 0.05)",
    },
    socialButton: {
      alignItems: "center",
      justifyContent: "center",
    },
    socialIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 3,
    },
    homeButton: {
      marginTop: -20,
      shadowColor: "#6A0DAD",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 10,
    },
    homeButtonGradient: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: currentTheme === 'light' ? "#F5F5F5" : "#14011F",
    },
  });
  const dynamicStyles = getDynamicStyles(theme)

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <StatusBar
        style={theme === 'light' ? 'dark' : 'light'}
        backgroundColor={theme === 'light' ? "#F5F5F5" : "#14011F"}
      />
      <LinearGradient
        colors={theme === 'dark'
          ? ['#1D0A3F', '#14011F']
          : ['#FFFFFF', '#F5F5F5']
        }
        style={dynamicStyles.backgroundGradient}
      />

      <View style={dynamicStyles.header}>
        <View style={dynamicStyles.logoContainer}>
          <Image source={require("@/assets/images/logo.png")} style={dynamicStyles.logo} />
          <Text style={dynamicStyles.logoText}>Placement Plus</Text>
        </View>
        <View style={dynamicStyles.headerRight}>
          <Pressable
            style={dynamicStyles.notificationButton}
            onPress={() => router.push("/screens/Notifications")}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme === 'light' ? "#333" : "#fff"}
            />
            {typeof newNotifications === 'number' && newNotifications > 0 && (
              <View style={dynamicStyles.notificationBadge}>
                <Text style={dynamicStyles.badgeText}>{newNotifications}</Text>
              </View>
            )}
          </Pressable>
          <Pressable
            style={dynamicStyles.profileButton}
            onPress={() => router.push("/screens/Alumni Profile/Profile")}
          >
            <Ionicons
              name="person-circle"
              size={34}
              color={theme === 'light' ? "#6A0DAD" : "#C92EFF"}
            />
          </Pressable>
        </View>
      </View>

      <View style={dynamicStyles.welcomeSection}>
        <Text style={dynamicStyles.welcomeText}>{`Hello, ${alumni?.name.split(" ")[0]}`}</Text>
        <Text style={dynamicStyles.welcomeSubtext}>What would you like to explore today?</Text>
      </View>

      <View style={dynamicStyles.searchContainer}>
        <View style={dynamicStyles.searchBar}>
          <Ionicons
            name="search"
            size={20}
            color={theme === 'light' ? "#666666" : "#9D9DB5"}
            style={dynamicStyles.searchIcon}
          />
          <TextInput
            placeholder="Search for resources..."
            style={dynamicStyles.searchInput}
            placeholderTextColor={theme === 'light' ? "#666666" : "#9D9DB5"}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={theme === 'light' ? "#666666" : "#9D9DB5"}
              />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length > 0 ? (
          <View style={dynamicStyles.gridContainer}>
            {filteredItems.map((item, index) => (
              <Pressable
                key={item.id}
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                onPress={() => handlePress(item.route)}
                style={dynamicStyles.gridItemWrapper}
              >
                <Animated.View
                  style={[
                    dynamicStyles.gridItem,
                    { transform: [{ scale: scaleAnims[index] }] },
                  ]}
                >
                  <LinearGradient
                    colors={[`${item.color}40`, `${item.color}15`]}
                    style={dynamicStyles.iconContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Image source={item.icon} style={dynamicStyles.gridIcon} />
                  </LinearGradient>
                  <Text style={dynamicStyles.gridText} numberOfLines={2}>
                    {item.title}
                  </Text>
                </Animated.View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={dynamicStyles.noResults}>
            <Ionicons
              name="search-outline"
              size={50}
              color={theme === 'light' ? "#666666" : "#3A3A5A"}
            />
            <Text style={dynamicStyles.noResultsText}>No matching resources found</Text>
            <Text style={dynamicStyles.noResultsSubText}>Try searching with different keywords</Text>
          </View>
        )}
      </ScrollView>

      {/* Social Media Footer */}
      <View style={dynamicStyles.footerContainer}>
        <LinearGradient
          colors={
            theme === 'dark'
              ? ['rgba(20, 1, 31, 0)', 'rgba(29, 10, 63, 0.95)']
              : ['rgba(245, 245, 245, 0)', 'rgba(245, 245, 245, 0.95)']
          }
          style={dynamicStyles.footerGradient}
        />
        <View style={dynamicStyles.footer}>
          <Pressable style={styles.socialButton}>
            <LinearGradient
              colors={['#3b5998', '#324e8d']}
              style={styles.socialIconContainer}
            >
              <FontAwesome name="facebook" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.socialButton}>
            <LinearGradient
              colors={['#d62976', '#962fbf']}
              style={styles.socialIconContainer}
            >
              <FontAwesome name="instagram" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.homeButton}>
            <LinearGradient
              colors={['#C92EFF', '#9332FF']}
              style={styles.homeButtonGradient}
            >
              <FontAwesome name="home" size={30} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.socialButton}>
            <LinearGradient
              colors={['#1DA1F2', '#0d8ad6']}
              style={styles.socialIconContainer}
            >
              <FontAwesome name="twitter" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>

          <Pressable style={styles.socialButton}>
            <LinearGradient
              colors={['#FF0000', '#cc0000']}
              style={styles.socialIconContainer}
            >
              <FontAwesome name="youtube-play" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#14011F",
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 33 : 10,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 28,
    height: 28,
    resizeMode: "contain",
    marginRight: 8,
  },
  logoText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationButton: {
    padding: 8,
    marginRight: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "#FF4747",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
  },
  profileButton: {
    padding: 4,
  },
  welcomeSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  welcomeText: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  welcomeSubtext: {
    color: "#BBB",
    fontSize: 16,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    color: "white",
    fontSize: 16,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItemWrapper: {
    width: "33%",
    paddingHorizontal: 4,
    marginBottom: 20,
  },
  gridItem: {
    alignItems: "center",
  },
  iconContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  gridIcon: {
    width: CARD_WIDTH * 0.7,
    height: CARD_WIDTH * 0.7,
    resizeMode: "contain",
  },
  gridText: {
    color: "white",
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    width: CARD_WIDTH + 8,
    lineHeight: 18,
  },
  noResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  noResultsText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  noResultsSubText: {
    color: "#9D9DB5",
    fontSize: 14,
    marginTop: 8,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  footerGradient: {
    position: "absolute",
    height: 100,
    left: 0,
    right: 0,
    bottom: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(29, 10, 63, 0.6)",
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 36 : 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  socialButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  socialIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  homeButton: {
    marginTop: -20,
    shadowColor: "#C92EFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
  homeButtonGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#14011F",
  },
});

export default PlacementPlus;