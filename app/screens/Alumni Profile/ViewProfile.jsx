import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useUser } from '../../../context/userContext.js';
import CustomAlert from '../../../components/CustomAlert.jsx';
import { getAccessToken, getRefreshToken } from '../../../utils/tokenStorage.js';
import { getFileFromAppwrite } from '../../../utils/appwrite.js';

const AlumniProfileView = ({ route }) => {
    const navigation = useNavigation();
    const { theme, alumni } = useUser();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    });
    const [alumniDetails, setAlumniDetails] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const themeColors = {
        primary: theme === 'light' ? '#6A0DAD' : '#C92EFF',
        background: theme === 'light' ? '#F5F5F5' : '#1a0525',
        cardBackground: theme === 'light' ? '#FFFFFF' : '#2d0a41',
        cardBorder: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : '#390852',
        headerBackground: theme === 'light' ? '#F0E6F5' : '#2d0a41',
        text: theme === 'light' ? '#333333' : '#fff',
        secondaryText: theme === 'light' ? '#666666' : '#b388e9',
        accentColor: theme === 'light' ? '#4361EE' : '#4361EE',
    };

    useEffect(() => {
        fetchAlumniDetails()
    }, [])

    const fetchAlumniDetails = async () => {
        setIsLoading(true)
        try {
            const accessToken = await getAccessToken()
            const refreshToken = await getRefreshToken()
            if (!accessToken || !refreshToken) {
                throw new Error("Tokens are required")
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/alumnis/get-alumni-details/c/${alumni._id}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken,
                }
            })

            if (!response.ok) {
                const error = await response.text()
                console.log("Network Error: ", error);
                return
            }

            const result = await response.json()           

            if (result.statusCode === 200) {
                result.data.profilePicId = await getFileFromAppwrite(result.data.profilePicId)
                setAlumniDetails(result.data)
            } else {
                setAlertConfig({
                    header: "Error",
                    message: result?.message || "Something went wrong. Please try again later.",
                    buttons: [{
                        text: 'OK',
                        onPress: () => setAlertVisible(false)
                    }]
                })
                setAlertVisible(true)
            }

        } catch (error) {
            setAlertConfig({
                header: "Fetch Error",
                message: result?.message || "Something went wrong. Please try again later.",
                buttons: [{
                    text: 'OK',
                    onPress: () => setAlertVisible(false)
                }]
            })
            setAlertVisible(true)
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoBack = () => {
        navigation.goBack();
    };

    const handleOpenLinkedIn = () => {
        if (alumni?.linkedInId) {
            Linking.openURL(alumni.linkedInId)
                .catch(err => {
                    setAlertConfig({
                        header: "Error",
                        message: "Could not open LinkedIn profile.",
                        buttons: [
                            {
                                text: "OK",
                                onPress: () => setAlertVisible(false),
                                style: "default"
                            }
                        ]
                    });
                    setAlertVisible(true);
                });
        }
    };

    const ProfileField = ({ label, value }) => {
        if (!value) return null;

        return (
            <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: themeColors.secondaryText }]}>
                    {label}
                </Text>
                <Text style={[styles.fieldValue, { color: themeColors.text }]}>
                    {value}
                </Text>
            </View>
        );
    };

    const CompanyCard = ({ company, position, duration, experience, isCurrent }) => {
        if (!company) return null;        

        return (
            <View style={[styles.companyCard, {
                backgroundColor: themeColors.cardBackground,
                borderColor: themeColors.cardBorder,
                borderLeftColor: isCurrent ? themeColors.primary : themeColors.accentColor,
                borderLeftWidth: 4
            }]}>
                <View style={styles.companyHeader}>
                    <Text style={[styles.companyName, { color: themeColors.text }]}>
                        {company}
                    </Text>
                    {isCurrent && (
                        <View style={[styles.currentBadge, { backgroundColor: themeColors.primary }]}>
                            <Text style={styles.currentBadgeText}>Current</Text>
                        </View>
                    )}
                </View>
                <Text style={[styles.positionText, { color: themeColors.primary }]}>
                    {position}
                </Text>
                {duration && (
                    <Text style={[styles.durationText, { color: themeColors.secondaryText }]}>
                        Duration: {duration} {duration === 1 ? 'month' : 'months'}
                    </Text>
                )}
                {experience && (
                    <Text style={[styles.experienceText, { color: themeColors.text }]}>
                        {experience}
                    </Text>
                )}
            </View>
        );
    };

    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme === 'light' ? '#F8F9FA' : '#120023',
            }}>
                <ActivityIndicator size="large" color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
                <Text style={{ color: theme === 'light' ? '#6A0DAD' : '#f0c5f1', marginTop: 10 }}>
                    Loading profile details...
                </Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <View style={[styles.header, { backgroundColor: themeColors.headerBackground, borderBottomColor: themeColors.cardBorder }]}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
                    <Text style={[styles.backButtonText, { color: themeColors.primary }]}>Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColors.text }]}>Alumni Profile</Text>
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
                    {alumniDetails?.profilePicId ? (
                        <Image
                            source={{ uri: alumniDetails.profilePicId }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={[styles.avatarPlaceholder, { backgroundColor: themeColors.primary, borderColor: themeColors.primary }]}>
                            <Text style={styles.avatarText}>{alumniDetails?.name?.charAt(0) || 'A'}</Text>
                        </View>
                    )}
                    <Text style={[styles.profileName, { color: themeColors.text }]}>{alumniDetails?.name || 'alumniDetails'}</Text>
                    {alumniDetails?.currentCompany?.position && (
                        <Text style={[styles.positionOverview, { color: themeColors.secondaryText }]}>
                            {alumniDetails.currentCompany.position} at {alumniDetails.currentCompany.name}
                        </Text>
                    )}

                    {alumniDetails?.linkedInId && (
                        <TouchableOpacity
                            style={[styles.linkedInButton, { backgroundColor: '#0077B5' }]}
                            onPress={handleOpenLinkedIn}
                        >
                            <FontAwesome name="linkedin-square" size={20} color="#FFFFFF" />
                            <Text style={styles.linkedInButtonText}>View LinkedIn Profile</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.card, {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: themeColors.cardBorder,
                    shadowColor: theme === 'light' ? "#6A0DAD" : "#000",
                }]}>
                    <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                        Personal Information
                    </Text>
                    <ProfileField label="Name" value={alumniDetails?.name} />
                    <ProfileField label="Email" value={alumniDetails?.email} />
                    <ProfileField label="Batch" value={alumniDetails?.batch ? `Batch of ${alumniDetails.batch}` : null} />
                </View>

                {alumniDetails?.currentCompany?.name && (
                    <View style={[styles.card, {
                        backgroundColor: themeColors.cardBackground,
                        borderColor: themeColors.cardBorder,
                        shadowColor: theme === 'light' ? "#6A0DAD" : "#000",
                    }]}>
                        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                            Current Position
                        </Text>
                        <CompanyCard
                            company={alumniDetails.currentCompany.name}
                            position={alumniDetails.currentCompany.position}
                            isCurrent={true}
                        />
                    </View>
                )}

                {alumniDetails?.previousCompany && alumniDetails.previousCompany.length > 0 && (
                    <View style={[styles.card, {
                        backgroundColor: themeColors.cardBackground,
                        borderColor: themeColors.cardBorder,
                        shadowColor: theme === 'light' ? "#6A0DAD" : "#000",
                    }]}>
                        <Text style={[styles.sectionTitle, { color: themeColors.primary }]}>
                            Previous Experience
                        </Text>
                        {alumniDetails.previousCompany.map((company, index) => (
                            <CompanyCard
                                key={index}
                                company={company.name}
                                position={company.Position}
                                duration={company.Duration}
                                experience={company.Experience}
                                isCurrent={false}
                            />
                        ))}
                    </View>
                )}
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
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 3,
    },
    avatarText: {
        fontSize: 40,
        color: '#fff',
        fontWeight: 'bold',
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    positionOverview: {
        fontSize: 16,
        marginBottom: 16,
    },
    linkedInButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    linkedInButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
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
    companyCard: {
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
    },
    companyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    currentBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    currentBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    positionText: {
        fontSize: 15,
        fontWeight: '500',
        marginBottom: 4,
    },
    durationText: {
        fontSize: 14,
        marginBottom: 4,
    },
    experienceText: {
        fontSize: 14,
        lineHeight: 20,
    },
});

export default AlumniProfileView;