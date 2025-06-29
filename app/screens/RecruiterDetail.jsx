import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import { useUser } from '../../context/userContext.js';
import CustomAlert from '../../components/CustomAlert.jsx';

const imageMap = {
    'Apple.png': require('@/assets/companyImages/apple.png'),
    'Google.png': require('@/assets/companyImages/Google-new.png'),
    'Microsoft.png': require('@/assets/companyImages/Microsoft.png'),
    'Amazon.png': require('@/assets/companyImages/amazon2.png'),
    'Meta.png': require('@/assets/companyImages/meta-new.webp'),
    'Netflix.png': require('@/assets/companyImages/Netflix_Symbol_RGB.png'),
    'Nvidia.png': require('@/assets/companyImages/Nvidia.png'),
    'Gameskraft.png': require("@/assets/companyImages/gameskraft-bg.png"),
    'Morgan Stanley.png': require("@/assets/companyImages/morganStanley.jpg"),
    'Uber.png': require("@/assets/companyImages/uber.png")
};

const questionsList = [
    "Implement LRU Cache",
    "Find the longest substring without repeating characters",
    "Design a scalable notification system",
    "Solve the meeting rooms problem",
    "Implement a rate limiter",
    "Design a URL shortener service",
];

const PastRecruiterDetails = () => {
    const [recruiterData, setRecruiterData] = useState(null);
    const [loading, setLoading] = useState(true);
    //   const [error, setError] = useState(null);
    const [sideCardExpanded, setSideCardExpanded] = useState(false);
    const { theme } = useUser();
    const { recruiterId } = useLocalSearchParams();
    const router = useRouter();
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    // Theme colors
    const themeColor = theme === 'light' ? '#6A0DAD' : '#C92EFF';
    const backgroundColor = theme === 'light' ? '#F5F5F5' : '#0D021F';
    const cardBackgroundColor = theme === 'light' ? '#FFFFFF' : '#1C1235';
    const cardBorderColor = theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : '#2A1E43';
    const textColor = theme === 'light' ? '#333333' : 'white';
    const secondaryTextColor = theme === 'light' ? '#666666' : '#BA68C8';

    useEffect(() => {
        fetchRecruiterDetails();
    }, [recruiterId]);

    const fetchRecruiterDetails = async () => {
        setLoading(true);
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            if (!accessToken || !refreshToken) {
                setError("Authentication required. Please login again.");
                setLoading(false);
                return;
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/past-recruiter/get-recruiter/c/${recruiterId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch recruiter details. Status: ${response.status}`);
            }

            const result = await response.json();

            if (result?.statusCode === 200) {
                setRecruiterData(result.data);
                console.log(result.data);

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
                setAlertVisible(true);
            }
        } catch (err) {
            console.error("Error fetching recruiter details:", err);
            setError(err.message || "An error occurred while loading recruiter data");
            setAlertConfig({
                header: "Fetch Error",
                message: err?.message || "Something went wrong. Please try again.",
                buttons: [
                    {
                        text: "OK",
                        onPress: () => setAlertVisible(false),
                        style: "default"
                    }
                ]
            });
            setAlertVisible(true);
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        router.back();
    };

    const toggleSideCard = () => {
        setSideCardExpanded(!sideCardExpanded);
    };

    const navigateToAllQuestions = (companyName) => {
        // console.log("Route: ", `screens/${companyName}`);

        router.push(`screens/${companyName}`);
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color={themeColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>Loading recruiter details...</Text>
            </View>
        );
    }

    if (!recruiterData) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

                <CustomAlert
                    visible={alertVisible}
                    header={alertConfig.header}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                    onClose={() => setAlertVisible(false)}
                />
                
                <View style={[styles.errorContainer, { backgroundColor: cardBackgroundColor }]}>
                    <FontAwesome name="exclamation-triangle" size={50} color={themeColor} style={styles.errorIcon} />
                    <Text style={[styles.errorTitle, { color: textColor }]}>Error Loading Data</Text>
                    <Text style={[styles.errorMessage, { color: secondaryTextColor }]}>
                        {"Recruiter information not found"}
                    </Text>
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: themeColor }]}
                        onPress={goBack}
                    >
                        <Text style={styles.backButtonText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

            <View style={styles.mainContent}>
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header with back button */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={[styles.backButtonIcon, { backgroundColor: cardBackgroundColor }]}
                            onPress={goBack}
                        >
                            <FontAwesome name="chevron-left" size={16} color={themeColor} />
                        </TouchableOpacity>
                        <View style={{ flex: 1 }} />
                    </View>

                    <CustomAlert
                        visible={alertVisible}
                        header={alertConfig.header}
                        message={alertConfig.message}
                        buttons={alertConfig.buttons}
                        onClose={() => setAlertVisible(false)}
                    />

                    {/* Company Info Card */}
                    <View style={[styles.companyCard, {
                        backgroundColor: cardBackgroundColor,
                        borderColor: cardBorderColor
                    }]}>
                        {/* Company Logo */}
                        <View style={styles.logoContainer}>
                            {recruiterData.companyName && imageMap[`${recruiterData.companyName}.png`] ? (
                                <Image
                                    source={imageMap[`${recruiterData.companyName}.png`]}
                                    style={styles.companyLogo}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={[styles.placeholderLogo, { backgroundColor: themeColor + '20' }]}>
                                    <Text style={[styles.placeholderText, { color: themeColor }]}>
                                        {recruiterData.companyName?.charAt(0) || "C"}
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Company Name and Tags */}
                        <View style={[styles.companyHeader, { borderBottomColor: cardBorderColor }]}>
                            <Text style={[styles.companyName, { color: textColor }]}>{recruiterData.companyName}</Text>
                            <View style={styles.yearTag}>
                                <Text style={[styles.yearTagText, { color: themeColor }]}>
                                    Visited in {recruiterData.roles.map(role => role.year).join(", ")}
                                </Text>
                            </View>
                            <View style={styles.tagRow}>
                                <View style={[styles.tag, { backgroundColor: themeColor + '20' }]}>
                                    <Text style={[styles.tagText, { color: themeColor }]}>{recruiterData.mode || "On-Campus"}</Text>
                                </View>
                                <View style={[styles.tag, { backgroundColor: themeColor + '20' }]}>
                                    <Text style={[styles.tagText, { color: themeColor }]}>{recruiterData.opportunityType || "Full Time"}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Role Information */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Role Information</Text>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Position:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{recruiterData.role || "Software Engineer"}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Location:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{recruiterData.jobLocation || "Bangalore, India"}</Text>
                            </View>
                            {recruiterData.ctc && (
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>CTC Offered:</Text>
                                    <Text style={[styles.detailValue, { color: textColor }]}>{recruiterData.ctc}</Text>
                                </View>
                            )}
                        </View>

                        {/* Eligibility */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Eligibility Criteria</Text>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Branches:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>
                                    {recruiterData.eligibleBranches?.join(', ') || "CSE, ECE, IT"}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Min CGPA:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{recruiterData.cgpaCriteria || "7.5"}</Text>
                            </View>
                        </View>

                        {/* Selection Process */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Selection Process</Text>
                            <Text style={[styles.processText, { color: textColor }]}>
                                {recruiterData.selectionProcess || "Online Assessment → Technical Interviews (2 rounds) → HR Interview"}
                            </Text>
                        </View>

                        {/* Interview Experience */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Interview Experience</Text>
                            <Text style={[styles.processText, { color: textColor }]}>
                                {recruiterData.interviewExperience ||
                                    "The selection process was rigorous, with a focus on data structures, algorithms, and system design. The first round was a coding assessment with medium-hard difficulty problems. The technical interviews covered topics like binary trees, dynamic programming, and distributed systems. The HR round focused on behavioral questions and culture fit."}
                            </Text>
                        </View>

                        {/* Questions Asked */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Questions Asked</Text>
                            {(recruiterData.questionsAsked || [
                                "Implement LRU Cache",
                                "Find the longest substring without repeating characters",
                                "Design a scalable notification system",
                                "Solve the meeting rooms problem"
                            ]).map((question, index) => (
                                <View key={index} style={styles.questionItem}>
                                    <FontAwesome name="circle" size={8} color={themeColor} style={styles.bulletPoint} />
                                    <Text style={[styles.questionText, { color: textColor }]}>{question}</Text>
                                </View>
                            ))}
                            <TouchableOpacity
                                style={[styles.viewAllButton, { backgroundColor: themeColor }]}
                                onPress={() => navigateToAllQuestions(recruiterData.companyName)}
                            >
                                <Text style={styles.viewAllButtonText}>
                                    View All
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Results */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Recruitment Results</Text>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Total Selected:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{recruiterData.studentsSelected || "12"} students</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>From Branch:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>
                                    {recruiterData.branchWiseSelection || "CSE: 8, ECE: 3, IT: 1"}
                                </Text>
                            </View>
                        </View>

                        {/* Additional Info */}
                        {recruiterData.additionalInfo && (
                            <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                                <Text style={[styles.sectionTitle, { color: themeColor }]}>Additional Information</Text>
                                <Text style={[styles.processText, { color: textColor }]}>{recruiterData.additionalInfo}</Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            </View>

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
    },
    mainContent: {
        flex: 1,
        // marginRight: 30, // Space for collapsed side card
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
    },
    scrollContent: {
        padding: 15,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 20
    },
    backButtonIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    companyCard: {
        borderRadius: 15,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    logoContainer: {
        marginTop: 20,
        marginBottom: 10,
        alignItems: 'center',
    },
    companyLogo: {
        width: 80,
        height: 80,
        marginBottom: 5,
    },
    placeholderLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 5,
    },
    placeholderText: {
        fontSize: 36,
        fontWeight: 'bold',
    },
    companyHeader: {
        padding: 20,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    yearTag: {
        marginBottom: 10,
    },
    yearTagText: {
        fontSize: 16,
        fontWeight: '500',
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    tag: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 10,
        marginBottom: 5,
    },
    tagText: {
        fontSize: 13,
        fontWeight: '600',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
    },
    detailLabel: {
        width: 100,
        fontWeight: 'bold',
        marginRight: 5,
    },
    detailValue: {
        flex: 1,
    },
    processText: {
        lineHeight: 22,
    },
    questionItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
    },
    bulletPoint: {
        marginTop: 6,
        marginRight: 10,
    },
    questionText: {
        flex: 1,
        lineHeight: 20,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        margin: 20,
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    errorIcon: {
        marginBottom: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    errorMessage: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    backButton: {
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginTop: 10,
    },
    backButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },

    // Side Card Styles - UPDATED TO BE SIMPLER
    sideCard: {
        position: 'absolute',
        right: 0,
        top: 80,
        height: '20%',
        // height: 'auto',
        borderLeftWidth: 1,
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: -2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        zIndex: 10,
    },
    toggleButton: {
        position: 'absolute',
        top: 15,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 15,
    },
    sideCardContent: {
        flex: 1,
        padding: 15,
        paddingTop: 40,
    },
    sideCardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 15,
    },
    questionsList: {
        flex: 1,
        marginBottom: 15,
    },
    questionListItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        paddingRight: 5,
    },
    questionIcon: {
        marginTop: 2,
        marginRight: 5,
    },
    questionListText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 16,
    },
    viewAllButton: {
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    viewAllButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    }
});

export default PastRecruiterDetails;