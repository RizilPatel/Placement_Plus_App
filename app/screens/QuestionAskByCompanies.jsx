import React, { useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Animated, StatusBar, Dimensions, Pressable } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useUser } from "../../context/userContext.js";

import microsoftLogo from "@/assets/companyImages/Microsoft_Logo_512px.png";
import appleLogo from "@/assets/companyImages/apple-white.png";
import appleLogoBlack from "@/assets/companyImages/apple.png";
import googleLogo from "@/assets/companyImages/Google-new.png";
import amazonLogo from "@/assets/companyImages/amazon2.png";
import netflixLogo from "@/assets/companyImages/Netflix_Symbol_RGB.png";
import metaLogo from "@/assets/companyImages/meta-new.webp";
import uberLogo from "@/assets/companyImages/uber-white-without-back.png";
import uberLogoBlack from "@/assets/companyImages/uber.png";
import nvidiaLogo from "@/assets/companyImages/Nvidia-white.jpg";
import nvidiaLogoBlack from "@/assets/companyImages/Nvidia-new.png";
import flipkartLogo from "@/assets/companyImages/flipkart-bg.png";
import gameskraftLogo from "@/assets/companyImages/gameskraft-bg.png";
import morganStanleyLogo from "@/assets/companyImages/morganStanley.jpg"
import techMahindraLogo from "@/assets/companyImages/tech-mahindra-new.png"

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 60) / 2;

const companies = [
  {
    name: "Microsoft",
    dark: {
      logo: microsoftLogo
    },
    light: {
      logo: microsoftLogo
    }
  },
  {
    name: "Apple",
    dark: {
      logo: appleLogo
    },
    light: {
      logo: appleLogoBlack
    }
  },
  {
    name: "Google",
    dark: {
      logo: googleLogo
    },
    light: {
      logo: googleLogo
    }
  },
  {
    name: "Amazon",
    dark: {
      logo: amazonLogo
    },
    light: {
      logo: amazonLogo
    }
  },
  {
    name: "Flipkart",
    dark: {
      logo: flipkartLogo
    },
    light: {
      logo: flipkartLogo
    }
  },
  {
    name: "Netflix",
    dark: {
      logo: netflixLogo
    },
    light: {
      logo: netflixLogo
    }
  },
  {
    name: "Meta",
    dark: {
      logo: metaLogo
    },
    light: {
      logo: metaLogo
    }
  },
  {
    name: "Uber",
    dark: {
      logo: uberLogo
    },
    light: {
      logo: uberLogoBlack
    }
  },
  {
    name: "Nvidia",
    dark: {
      logo: nvidiaLogo
    },
    light: {
      logo: nvidiaLogoBlack
    }
  },
  {

    name: "Gameskraft",
    dark: {
      logo: gameskraftLogo
    },
    light: {
      logo: gameskraftLogo
    }
  },
  {

    name: "Morgan Stanley",
    dark: {
      logo: morganStanleyLogo
    },
    light: {
      logo: morganStanleyLogo
    }
  },
  {

    name: "Tech Mahindra",
    dark: {
      logo: techMahindraLogo
    },
    light: {
      logo: techMahindraLogo
    }
  }
];

const PastYearCompanies = () => {
  const router = useRouter();
  const scaleAnimations = useRef(companies.map(() => new Animated.Value(1))).current;
  const { theme } = useUser()

  // Theme colors
  const themeColors = {
    darkBackground: "#14011F",
    lightBackground: "#F5F5F5",
    darkText: "#fff",
    lightText: "#333333",
    lightSubtitleText: "#666666",
    darkSubtitleText: "#AAA",
    darkPurple: "#C92EFF",
    lightPurple: "#6A0DAD",
  };

  const handleCompanyPress = (index, companyName) => {
    Animated.sequence([
      Animated.timing(scaleAnimations[index], {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      // router.push(`/company/${companyName.toLowerCase().replace(/ /g, "-")}`);
      router.push(`screens/${companyName}`);
    });

  };

  // Get current theme color
  const getThemeColor = (darkValue, lightValue) => theme === 'dark' ? darkValue : lightValue;

  return (
    <View style={[
      styles.container,
      { backgroundColor: getThemeColor(themeColors.darkBackground, themeColors.lightBackground) }
    ]}>
      <StatusBar
        barStyle={theme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor={getThemeColor(themeColors.darkBackground, themeColors.lightBackground)}
      />

      {/* Header */}
      <View style={[
        styles.header,
        {
          borderBottomColor: getThemeColor("rgba(255, 255, 255, 0.1)", "rgba(106, 13, 173, 0.1)")
        }
      ]}>
        <View style={styles.logoContainer}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <Text style={[
            styles.logoText,
            { color: getThemeColor(themeColors.darkText, themeColors.lightText) }
          ]}>DSA Preparation</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('screens/Profile/Profile')}>
            <Ionicons
              name="person-circle"
              size={34}
              color={getThemeColor(themeColors.darkPurple, themeColors.lightPurple)}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchBar,
          {
            backgroundColor: getThemeColor(
              "rgba(255, 255, 255, 0.08)",
              "rgba(106, 13, 173, 0.1)"
            )
          }
        ]}>
          <Ionicons
            name="search"
            size={20}
            color={getThemeColor("#666", "#6A0DAD")}
            style={styles.searchIcon}
          />
          <Text style={[
            styles.searchPlaceholder,
            { color: getThemeColor("#888", "#666666") }
          ]}>Search companies...</Text>
        </View>
        <TouchableOpacity style={[
          styles.filterButton,
          {
            backgroundColor: getThemeColor(
              "rgba(201, 46, 255, 0.15)",
              "rgba(106, 13, 173, 0.1)"
            )
          }
        ]}>
          <MaterialIcons
            name="filter-list"
            size={22}
            color={getThemeColor(themeColors.darkPurple, themeColors.lightPurple)}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleContainer}>
          <Text style={[
            styles.title,
            { color: getThemeColor(themeColors.darkText, themeColors.lightText) }
          ]}>Interview Questions</Text>
          <Text style={[
            styles.subtitle,
            { color: getThemeColor(themeColors.darkSubtitleText, themeColors.lightSubtitleText) }
          ]}>Prepare with real questions from top companies</Text>
        </View>

        <View style={styles.companyList}>
          {companies.map((company, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleCompanyPress(index, company.name)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.companyItem,
                  {
                    backgroundColor: getThemeColor(
                      "rgba(255, 255, 255, 0.06)",
                      "rgba(106, 13, 173, 0.05)"
                    ),
                    borderColor: getThemeColor(
                      "rgba(255, 255, 255, 0.1)",
                      "rgba(106, 13, 173, 0.1)"
                    ),
                    transform: [{ scale: scaleAnimations[index] }]
                  },
                ]}
              >
                <Image source={company[theme].logo} style={styles.companyLogo} />
                <Text style={[
                  styles.companyText,
                  { color: getThemeColor(themeColors.darkText, themeColors.lightText) }
                ]}>{company.name}</Text>
                <View style={[
                  styles.questionsCount,
                  {
                    backgroundColor: getThemeColor(
                      "rgba(201, 46, 255, 0.2)",
                      "rgba(106, 13, 173, 0.2)"
                    )
                  }
                ]}>
                  <Text style={[
                    styles.countText,
                    { color: getThemeColor(themeColors.darkPurple, themeColors.lightPurple) }
                  ]}>50+</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    marginTop: -15
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
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 10
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  themeToggle: {
    padding: 8,
    marginRight: 8,
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    fontSize: 15,
  },
  filterButton: {
    padding: 10,
    borderRadius: 10,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
  },
  companyList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  companyItem: {
    width: ITEM_WIDTH,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  companyLogo: {
    width: 56,
    height: 56,
    resizeMode: "contain",
    marginBottom: 12,
  },
  companyText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  questionsCount: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default PastYearCompanies;