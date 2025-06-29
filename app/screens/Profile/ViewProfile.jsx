import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Platform, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../context/userContext.js';
import { getAccessToken, getRefreshToken } from '../../../utils/tokenStorage';
import * as IntentLauncher from 'expo-intent-launcher';
import CustomAlert from '../../../components/CustomAlert.jsx';

const ProfileView = () => {
    const navigation = useNavigation();
    const { user, theme } = useUser();
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const profile = {
        name: user?.name || '-',
        email: user?.email || '-',
        rollNo: user?.rollNo || '-',
        mobileNo: user?.mobileNo || '-',
        semester: user?.semester || '-',
        cgpa: user?.CGPA || 'N/A',
        branch: user?.branch || '-',
        batch: user?.batch || '-',
        resumeUrl: user?.resumeLink || '-',
        internshipEligible: user?.internshipEligible,
        fullTimeEligible: user?.fullTimeEligible,
        slab: user?.slab || '-'
    };

    const themeColors = {
        primary: theme === 'light' ? '#6A0DAD' : '#C92EFF',
        background: theme === 'light' ? '#F5F5F5' : '#1a0525',
        cardBackground: theme === 'light' ? '#FFFFFF' : '#2d0a41',
        cardBorder: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : '#390852',
        headerBackground: theme === 'light' ? '#F0E6F5' : '#2d0a41',
        text: theme === 'light' ? '#333333' : '#fff',
        secondaryText: theme === 'light' ? '#666666' : '#b388e9',
        positiveBadge: theme === 'light' ? '#4CAF50' : '#4CAF50',
        negativeBadge: theme === 'light' ? '#F44336' : '#F44336',
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleViewResume = async () => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            if (!accessToken || !refreshToken)
                throw new Error("Tokens are required");

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/users/view-resume`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok)
                throw new Error("Something went wrong");

            const result = await response.json();
            if (result.statusCode === 200) {
                await openPdf(result?.data);
            } else {
                setAlertConfig({
                    header: "Error",
                    message: result?.message || "Something went wrong. Please try again.",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default"
                        }
                    ]
                });
            }
        } catch (error) {
            console.error('Error fetching resume:', error?.message);
            setAlertConfig({
                header: "Failed to fetch resume",
                message: result?.message || "Something went wrong. Please try again.",
                buttons: [
                    {
                        text: "OK",
                        onPress: () => setAlertVisible(false),
                        style: "default"
                    }
                ]
            });
            setAlertVisible(true);
        }
    };

    const openPdf = async (pdfLink) => {
        if (Platform.OS === 'android') {
            IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: pdfLink,
                type: 'application/pdf',
            });
        } else {
            await Linking.openURL(pdfLink);
        }
    };

    const ProfileField = ({ label, value }) => (
        <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: themeColors.secondaryText }]}>
                {label}
            </Text>
            <Text style={[styles.fieldValue, { color: themeColors.text }]}>
                {value}
            </Text>
        </View>
    );

    const Badge = ({ text, isPositive, outlined }) => (
        <View style={[
            styles.badge,
            isPositive ?
                { backgroundColor: themeColors.positiveBadge } :
                { backgroundColor: themeColors.negativeBadge },
            outlined && {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: themeColors.primary
            }
        ]}>
            <Text style={[
                styles.badgeText,
                outlined && { color: themeColors.primary }
            ]}>
                {text}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={[styles.header, { backgroundColor: themeColors.headerBackground, borderBottomColor: themeColors.cardBorder }]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
                    <Text style={[styles.backButtonText, { color: themeColors.primary }]}>Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>Profile</Text>
                <View style={{ width: 60 }} />
            </View>

            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />

            <ScrollView style={styles.scrollView}>
                <View style={styles.profileHeader}>
                    <View style={[styles.avatarPlaceholder, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]}>
                        <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
                    </View>
                    <Text style={[styles.profileName, { color: themeColors.text }]}>{profile.name}</Text>
                </View>

                {/* Stats section for semester and CGPA */}
                <View style={[styles.statsContainer,
                {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    shadowColor: theme === 'light' ? "#6A0DAD" : "#000",
                }
                ]}>
                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: themeColors.text }]}>
                            {profile.semester}
                        </Text>
                        <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>
                            Semester
                        </Text>
                    </View>

                    <View style={[styles.statDivider, { backgroundColor: themeColors.cardBorder }]} />

                    <View style={styles.statItem}>
                        <Text style={[styles.statValue, { color: themeColors.text }]}>
                            {profile.cgpa}
                        </Text>
                        <Text style={[styles.statLabel, { color: themeColors.secondaryText }]}>
                            CGPA
                        </Text>
                    </View>
                </View>

                <View style={[styles.card, {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    shadowColor: theme === 'light' ? "#6A0DAD" : "#000",
                }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                        Personal Information
                    </Text>
                    <ProfileField label="Email" value={profile.email} />
                    <ProfileField label="Roll Number" value={profile.rollNo} />
                    <ProfileField label="Mobile Number" value={profile.mobileNo} />
                </View>

                <View style={[styles.card, {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    shadowColor: theme === 'light' ? "#6A0DAD" : "#000",
                }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                        Academic Information
                    </Text>
                    <ProfileField label="Branch" value={profile.branch} />
                    <ProfileField label="Batch" value={profile.batch} />
                </View>

                <View style={[styles.card, {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    shadowColor: theme === 'light' ? "#6A0DAD" : "#000",
                }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                        Eligibility Status
                    </Text>
                    <View style={styles.badgesContainer}>
                        <Badge
                            text={profile.internshipEligible ? "Internship Eligible" : "Not Eligible for Internship"}
                            isPositive={profile.internshipEligible}
                        />
                        <Badge
                            text={profile.fullTimeEligible ? "Full-Time Eligible" : "Not Eligible for Full-Time"}
                            isPositive={profile.fullTimeEligible}
                        />
                        {!profile.fullTimeEligible && profile.slab && (
                            <Badge text={`Slab: ${profile.slab}`} outlined={true} />
                        )}
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.button, { backgroundColor: themeColors.primary }]}
                    onPress={handleViewResume}
                >
                    <Text style={styles.buttonText}>View Resume</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        marginTop: 25
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        marginLeft: 4,
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    profileHeader: {
        alignItems: 'center',
        padding: 24,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 3,
    },
    avatarText: {
        fontSize: 32,
        color: '#fff',
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    card: {
        borderRadius: 15,
        padding: 16,
        marginHorizontal: 15,
        marginBottom: 16,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
        borderWidth: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    fieldContainer: {
        marginBottom: 12,
    },
    fieldLabel: {
        fontSize: 14,
        marginBottom: 4,
    },
    fieldValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    badgesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 8,
    },
    badgeText: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14,
    },
    button: {
        borderRadius: 15,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 15,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    // Stats section styles
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 15,
        marginBottom: 16,
        padding: 15,
        borderRadius: 15,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
        borderWidth: 1,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    statLabel: {
        fontSize: 14,
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        height: '80%',
    },
});

export default ProfileView;