import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Pressable,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";

const PlacementPoliciesScreen = () => {
  const [activeTab, setActiveTab] = useState('eligibility');

  const handleBackPress = () => {
    router.back();
  };

  // Custom Icon component that uses Ionicons
  const IconComponent = ({ name, size = 22, color = "#C92EFF" }) => {
    const iconMap = {
      bell: <Ionicons name="notifications-outline" size={size} color={color} />,
      briefcase: <Ionicons name="briefcase-outline" size={size} color={color} />,
      calendar: <Ionicons name="calendar-outline" size={size} color={color} />,
      users: <Ionicons name="people-outline" size={size} color={color} />,
      book: <Ionicons name="book-outline" size={size} color={color} />,
      award: <Ionicons name="trophy-outline" size={size} color={color} />,
      shield: <Ionicons name="shield-outline" size={size} color={color} />,
      info: <Ionicons name="information-circle-outline" size={size} color={color} />
    };

    return iconMap[name] || <Text style={[styles.icon, { color }]}>•</Text>;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'eligibility':
        return (
          <View style={styles.tabContent}>
            <PolicyCard
              icon="users"
              title="Academic Requirements"
              items={[
                "Minimum CGPA of 7.0 or 70% aggregate throughout the academic program",
                "No current backlogs in any semester",
                "Maximum of two backlogs allowed if cleared within the prescribed time"
              ]}
            />

            <PolicyCard
              icon="book"
              title="Attendance & Participation"
              items={[
                "Minimum 75% attendance in all placement training sessions",
                "Mandatory participation in mock interviews and group discussions",
                "Completion of assigned pre-placement courses and assessments"
              ]}
            />
          </View>
        );
      case 'process':
        return (
          <View style={styles.tabContent}>
            <PolicyCard
              icon="calendar"
              title="Application Timeline"
              items={[
                "Job notifications published 7 days before application deadline",
                "Resume submission deadline strictly enforced",
                "Interview schedules announced minimum 48 hours in advance"
              ]}
            />

            <PolicyCard
              icon="briefcase"
              title="Selection Stages"
              items={[
                "Resume shortlisting based on company requirements",
                "Aptitude tests and technical assessments",
                "Group discussion and personal interviews",
                "HR interview and document verification"
              ]}
            />
          </View>
        );
      case 'rules':
        return (
          <View style={styles.tabContent}>
            <PolicyCard
              icon="award"
              title="Job Offers"
              items={[
                "Students can receive a maximum of 2 offers",
                "Option to upgrade if new offer is at least 30% higher",
                "All offer decisions must be communicated within 48 hours"
              ]}
            />

            <PolicyCard
              icon="shield"
              title="Code of Conduct"
              items={[
                "Professional behavior during all placement activities",
                "Formal dress code for all interviews and company interactions",
                "Punctuality for all placement events is mandatory",
                "Dishonesty or misrepresentation will lead to disqualification"
              ]}
            />
          </View>
        );
      case 'blackout':
        return (
          <View style={styles.tabContent}>
            <PolicyCard
              icon="bell"
              title="Blackout Period"
              items={[
                "Students with job offers may be restricted from further placements",
                "Blackout period applies for 2 weeks after receiving an offer",
                "Students may apply for exemption for specific high-tier companies"
              ]}
            />

            <PolicyCard
              icon="info"
              title="Special Considerations"
              items={[
                "Dream company policy allows applications regardless of existing offers",
                "Deferred placements for those pursuing higher studies",
                "Entrepreneur track for students with validated startup ideas"
              ]}
            />
          </View>
        );
      default:
        return null;
    }
  };

  // Policy Card Component
  const PolicyCard = ({ icon, title, items }) => (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
      style={styles.policyCard}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.policyHeader}>
        <View style={styles.iconContainer}>
          <IconComponent name={icon} color="#fff" />
        </View>
        <Text style={styles.policyHeaderText}>{title}</Text>
      </View>
      <View style={styles.divider} />
      {items.map((item, index) => (
        <View key={index} style={styles.policyItem}>
          <View style={styles.bulletPoint} />
          <Text style={styles.policyText}>{item}</Text>
        </View>
      ))}
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#14011F" />

      {/* Background gradient */}
      <LinearGradient
        colors={['#1D0A3F', '#14011F']}
        style={styles.backgroundGradient}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.headerText}>Placement Policies</Text>
        <Pressable style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Banner */}
        <LinearGradient
          colors={['#C92EFF', '#9332FF']}
          style={styles.banner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.bannerIconContainer}>
            <MaterialIcons name="policy" size={36} color="#fff" />
          </View>
          <Text style={styles.bannerTitle}>Your Path to Success</Text>
          <Text style={styles.bannerText}>
            These policies are designed to create fair opportunities and maintain the institution's reputation with employers.
          </Text>
        </LinearGradient>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            {[
              { id: 'eligibility', label: 'Eligibility', icon: 'checkmark-circle-outline' },
              { id: 'process', label: 'Process', icon: 'git-branch-outline' },
              { id: 'rules', label: 'Rules', icon: 'list-outline' },
              { id: 'blackout', label: 'Blackout', icon: 'alert-circle-outline' }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tab, isActive && styles.activeTab]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={['#C92EFF', '#9332FF']}
                      style={styles.activeTabGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    >
                      <Ionicons name={tab.icon} size={18} color="#fff" style={styles.tabIcon} />
                      <Text style={styles.activeTabText}>{tab.label}</Text>
                    </LinearGradient>
                  ) : (
                    <>
                      <Ionicons name={tab.icon} size={18} color="#9D9DB5" style={styles.tabIcon} />
                      <Text style={styles.tabText}>{tab.label}</Text>
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Need Help?</Text>
          <Text style={styles.contactText}>Contact the Training & Placement Office</Text>

          <LinearGradient
            colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
            style={styles.contactCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={22} color="#C92EFF" />
              <Text style={styles.contactInfo}>placement@institute.edu</Text>
            </View>
            <View style={styles.contactDivider} />

            <View style={styles.contactItem}>
              <Ionicons name="business-outline" size={22} color="#C92EFF" />
              <Text style={styles.contactInfo}>Room 201, Admin Block</Text>
            </View>
            <View style={styles.contactDivider} />

            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={22} color="#C92EFF" />
              <Text style={styles.contactInfo}>Mon-Fri: 9:00 AM - 5:00 PM</Text>
            </View>
          </LinearGradient>

          <TouchableOpacity style={styles.chatButton}>
            <LinearGradient
              colors={['#C92EFF', '#9332FF']}
              style={styles.chatButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="chatbubbles-outline" size={20} color="#fff" style={styles.chatIcon} />
              <Text style={styles.chatButtonText}>Chat with Placement Officer</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14011F',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 50 : 10,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  notificationButton: {
    padding: 8,
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
  scrollView: {
    flex: 1,
  },
  banner: {
    margin: 16,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#C92EFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bannerIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  bannerText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
    lineHeight: 24,
  },
  tabContainer: {
    marginTop: 8,
    marginBottom: 16,
  },
  tabScroll: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabIcon: {
    marginRight: 8,
  },
  activeTab: {
    padding: 0, // Removed padding to accommodate gradient
    overflow: 'hidden',
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
  },
  tabText: {
    fontSize: 15,
    color: '#9D9DB5',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  tabContent: {
    padding: 16,
  },
  policyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(201, 46, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  policyHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 12,
  },
  policyItem: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C92EFF',
    marginTop: 8,
    marginRight: 12,
  },
  policyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
    lineHeight: 24,
  },
  contactSection: {
    padding: 20,
    marginBottom: 20,
  },
  contactTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  contactCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  contactInfo: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 12,
  },
  contactDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chatButton: {
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: '#C92EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  chatButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  chatIcon: {
    marginRight: 10,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default PlacementPoliciesScreen; 8