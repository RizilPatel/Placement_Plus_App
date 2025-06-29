import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    SafeAreaView,
    Linking,
    ActivityIndicator,
} from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import { useUser } from '../../context/userContext.js';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getFileFromAppwrite } from '../../utils/appwrite.js';
import CustomAlert from '../../components/CustomAlert.jsx';

const dummyAlumniData = {
    id: "12345abcde",
    name: "Priya Sharma",
    email: "priya.sharma@gmail.com",
    phone: "+91 98765 43210",
    profilePicUrl: "https://randomuser.me/api/portraits/women/44.jpg",
    profilePicId: "prof12345",
    location: "Bangalore, Karnataka",
    currentLocation: "Bangalore, India",
    specialization: "Machine Learning & AI",
    branch: "Computer Science Engineering",
    batch: 2018,

    // Current company details
    currentCompany: {
        name: "TechInnovate Solutions",
        position: "Senior AI Engineer",
        location: "Bangalore, India",
        joiningDate: "2021-06-15"
    },

    // Company culture description
    companyCulture: "TechInnovate has a collaborative and innovation-focused culture. We follow agile methodologies with bi-weekly sprints and have a strong emphasis on work-life balance. The company supports continued learning through workshops and conference sponsorships, and encourages team members to explore new technologies.",

    // Technical skills
    skills: [
        "Python",
        "TensorFlow",
        "PyTorch",
        "Natural Language Processing",
        "Computer Vision",
        "AWS",
        "Docker"
    ],

    // Previous work experience
    previousCompany: [
        {
            name: "DataMinds Analytics",
            Position: "Machine Learning Engineer",
            Duration: "24",
            Experience: "Developed and deployed production-grade ML models for customer segmentation and recommendation systems. Reduced inference time by 40% through model optimization techniques."
        },
        {
            name: "CodeCraft Technologies",
            Position: "Software Engineer",
            Duration: "18",
            Experience: "Worked on backend development using Django and Flask. Designed RESTful APIs and implemented data processing pipelines for real-time analytics."
        }
    ],

    // Social profiles
    linkedInId: "https://www.linkedin.com/in/priya-sharma-ai/",
    githubId: "https://github.com/priyasharma-ai",

    // Additional information
    additionalInfo: "I'm passionate about applying AI to solve real-world problems. Currently exploring multimodal learning and responsible AI practices. I've published two research papers on efficient deep learning models for edge devices and regularly contribute to open-source ML libraries. I'm also a mentor for women in tech programs and occasionally speak at tech conferences about AI ethics and career progression in the field.",

    // Achievements
    achievements: [
        "Best Paper Award at Regional AI Conference 2022",
        "Winner, TechInnovate Hackathon 2021",
        "Gold Medalist, University Graduation 2018"
    ],

    // Education details beyond graduation
    education: [
        {
            institution: "IIT Delhi",
            degree: "Master of Technology",
            field: "Artificial Intelligence",
            year: 2020
        },
        {
            institution: "BITS Pilani",
            degree: "Bachelor of Engineering",
            field: "Computer Science",
            year: 2018
        }
    ],

    // Mentorship availability
    mentorshipAvailable: true,
    mentorshipAreas: ["AI Career Guidance", "Technical Skill Development", "Research Directions"],

    // Last updated timestamp
    lastUpdated: "2023-09-15T10:30:00Z"
};

const AlumniDetail = () => {
    const [alumni, setAlumni] = useState(null);
    const { theme } = useUser();
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    useEffect(() => {
        if (id) {
            fetchAlumniDetails(id);
            // setAlumni(dummyAlumniData); 
        }
    }, [id]);

    const fetchAlumniDetails = async (alumniId) => {
        setIsLoading(true);
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/alumnis/get-details/c/${alumniId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            const result = await response.json();

            if (result.statusCode === 200) {
                let alumniData = result.data;

                if (alumniData?.profilePicId) {
                    const url = await getFileFromAppwrite(alumniData.profilePicId);
                    alumniData = { ...alumniData, profilePicUrl: url };
                }

                setAlumni(alumniData);
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
        } catch (error) {
            console.error('Failed to fetch alumni details:', error);
            setAlertConfig({
                header: "Failed to fetch data",
                message: error?.message || "Something went wrong. Please try again.",
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
            setIsLoading(false);
        }
    };

    const handleConnect = (linkedInId) => {
        if (!linkedInId) {
            alert('LinkedIn profile not available');
            return;
        }

        Linking.openURL(linkedInId).catch((err) => {
            console.error('Failed to open LinkedIn:', err);
            alert('Failed to open LinkedIn profile. Please check the URL.');
        });
    };

    const DetailItem = ({ icon, label, value }) => (
        <View style={styles.detailItem}>
            <View style={styles.iconBackground}>
                <FontAwesome name={icon} size={16} color="#fff" />
            </View>
            <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>{label}</Text>
                <Text style={styles.detailValue}>{value}</Text>
            </View>
        </View>
    );

    const getStyles = (currentTheme) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme === 'light' ? '#F8F9FA' : '#120023',
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            paddingVertical: 16,
            paddingHorizontal: 16,
            backgroundColor: currentTheme === 'light' ? 'white' : '#1A0533',
            borderBottomWidth: 1,
            borderBottomColor: currentTheme === 'light' ? '#EAEAEA' : 'rgba(255, 255, 255, 0.05)',
            marginTop: 20,
        },
        headerTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: currentTheme === 'light' ? '#6A0DAD' : 'white',
        },
        backButton: {
            padding: 4,
        },
        contentContainer: {
            paddingHorizontal: 16,
            paddingVertical: 16,
        },
        card: {
            backgroundColor: currentTheme === 'light' ? '#FFFFFF' : '#2c0847',
            borderRadius: 16,
            padding: 20,
            shadowColor: currentTheme === 'light' ? '#6A0DAD' : '#e535f7',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: currentTheme === 'light' ? 0.08 : 0.2,
            shadowRadius: 8,
            elevation: 6,
            width: '100%',
            marginBottom: 16,
        },
        alumniHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        profileImage: {
            width: 90,
            height: 90,
            borderRadius: 45,
            marginRight: 16,
            borderWidth: 3,
            borderColor: currentTheme === 'light' ? 'rgba(136, 19, 220, 0.8)' : 'rgba(255, 255, 255, 0.2)',
        },
        infoContainer: {
            flex: 1,
        },
        alumniName: {
            fontSize: 22,
            fontWeight: '700',
            color: currentTheme === 'light' ? '#222' : '#fff',
            marginBottom: 4,
        },
        roleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
        },
        roleText: {
            fontSize: 15,
            color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
            marginLeft: 6,
            fontWeight: '500',
        },
        batchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 5,
        },
        batchText: {
            fontSize: 14,
            color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
            marginLeft: 6,
            fontWeight: '400',
        },
        contentSection: {
            backgroundColor: currentTheme === 'light' ? 'rgba(106, 13, 173, 0.03)' : 'rgba(139, 8, 144, 0.12)',
            borderRadius: 12,
            padding: 16,
            marginTop: 12,
        },
        divider: {
            height: 1,
            backgroundColor: currentTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(254, 254, 254, 0.1)',
            marginVertical: 16,
        },
        detailsContainer: {
            width: '100%',
        },
        detailItem: {
            flexDirection: 'row',
            marginBottom: 16,
            alignItems: 'center',
        },
        iconBackground: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: currentTheme === 'light' ? '#6A0DAD' : '#8b0890',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        detailTextContainer: {
            flex: 1,
        },
        detailLabel: {
            fontSize: 13,
            color: currentTheme === 'light' ? '#666' : '#bebebe',
            marginBottom: 2,
        },
        detailValue: {
            fontSize: 16,
            color: currentTheme === 'light' ? '#333' : '#fff',
            fontWeight: '500',
        },
        sectionTitle: {
            fontSize: 17,
            fontWeight: '600',
            color: currentTheme === 'light' ? '#333' : '#fff',
            marginBottom: 0,
        },
        sectionHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
        },
        sectionIcon: {
            marginRight: 8,
            color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
        },
        connectButton: {
            backgroundColor: currentTheme === 'light' ? '#6A0DAD' : '#8b0890',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            marginTop: 16,
        },
        connectButtonText: {
            color: 'white',
            fontWeight: '600',
            fontSize: 16,
            marginLeft: 8,
        },
        companyNameText: {
            fontSize: 17,
            fontWeight: '600',
            color: currentTheme === 'light' ? '#333' : '#fff',
            marginBottom: 4,
        },
        companyRoleText: {
            fontSize: 15,
            color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
            marginBottom: 6,
        },
        companyLocationText: {
            fontSize: 14,
            color: currentTheme === 'light' ? '#666' : '#bebebe',
            flexDirection: 'row',
            alignItems: 'center',
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: currentTheme === 'light' ? '#F8F9FA' : '#120023',
        },
        noContentContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        noContentText: {
            fontSize: 16,
            color: currentTheme === 'light' ? '#666' : '#bebebe',
            textAlign: 'center',
        },
        previousCompanyItem: {
            marginBottom: 16,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
        },
        previousCompanyName: {
            color: currentTheme === 'light' ? '#333333' : 'white',
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 4,
        },
        previousCompanyDuration: {
            color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
            fontSize: 14,
            marginBottom: 4,
        },
        previousCompanyExperience: {
            color: currentTheme === 'light' ? '#666666' : 'white',
            fontSize: 14,
            lineHeight: 20,
        },
        cultureBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: currentTheme === 'light' ? '#6A0DAD' : '#8b0890',
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            marginTop: 12,
            marginBottom: 8,
        },
        cultureLabel: {
            color: 'white',
            fontSize: 12,
            fontWeight: 'bold',
            marginLeft: 4,
        },
        cultureDescription: {
            color: currentTheme === 'light' ? '#333333' : 'white',
            fontSize: 14,
            lineHeight: 20,
        },
        lastItem: {
            borderBottomWidth: 0,
            marginBottom: 0,
            paddingBottom: 0,
        },
        skills: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 10,
        },
        skillBadge: {
            backgroundColor: currentTheme === 'light' ? 'rgba(106, 13, 173, 0.08)' : 'rgba(139, 8, 144, 0.25)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 8,
            marginRight: 8,
            marginBottom: 8,
        },
        skillText: {
            color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
            fontSize: 13,
            fontWeight: '500',
        },
        cardHeader: {
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
            paddingBottom: 12,
        },
    });

    const styles = useMemo(() => getStyles(theme), [theme]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
                <Text style={{ color: theme === 'light' ? '#6A0DAD' : '#f0c5f1', marginTop: 10 }}>
                    Loading alumni details...
                </Text>
            </View>
        );
    }

    if (!alumni) {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
                <View style={styles.header}>
                    <CustomAlert
                        visible={alertVisible}
                        header={alertConfig.header}
                        message={alertConfig.message}
                        buttons={alertConfig.buttons}
                        onClose={() => setAlertVisible(false)}
                    />
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={theme === 'light' ? '#6A0DAD' : 'white'}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Alumni Profile</Text>
                    <View style={{ width: 24 }} />
                </View>
                <View style={styles.noContentContainer}>
                    <Text style={styles.noContentText}>
                        No alumni information available. Please try again later.
                    </Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={theme === 'light' ? '#6A0DAD' : 'white'}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Alumni Profile</Text>
                <View style={{ width: 24 }} />
            </View>

            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />

            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.contentContainer}>
                    {/* Profile Card */}
                    <View style={styles.card}>
                        <View style={styles.alumniHeader}>
                            <Image
                                source={
                                    alumni.profilePicUrl
                                    && { uri: alumni.profilePicUrl }
                                }
                                style={styles.profileImage}
                            />
                            <View style={styles.infoContainer}>
                                <Text style={styles.alumniName}>{alumni.name}</Text>
                                {alumni.currentCompany && (
                                    <View style={styles.roleContainer}>
                                        <MaterialIcons
                                            name="work"
                                            size={16}
                                            color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'}
                                        />
                                        <Text style={styles.roleText}>
                                            {alumni.currentCompany.position || 'Not specified'}
                                        </Text>
                                    </View>
                                )}
                                <View style={styles.batchContainer}>
                                    <Ionicons
                                        name="school"
                                        size={16}
                                        color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'}
                                    />
                                    <Text style={styles.batchText}>
                                        Batch of {alumni.batch || 'Not specified'}
                                    </Text>
                                </View>
                                {alumni.currentLocation && (
                                    <View style={[styles.batchContainer, { marginTop: 5 }]}>
                                        <Ionicons
                                            name="location"
                                            size={16}
                                            color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'}
                                        />
                                        <Text style={styles.batchText}>{alumni.currentLocation}</Text>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Connect Button */}
                        {alumni.linkedInId && (
                            <TouchableOpacity
                                style={styles.connectButton}
                                onPress={() => handleConnect(alumni.linkedInId)}
                            >
                                <FontAwesome name="linkedin-square" size={20} color="white" />
                                <Text style={styles.connectButtonText}>Connect on LinkedIn</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Career Information Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons
                                    name="business"
                                    size={20}
                                    style={styles.sectionIcon}
                                />
                                <Text style={styles.sectionTitle}>Career Information</Text>
                            </View>
                        </View>

                        {/* Current Company */}
                        {alumni.currentCompany && (
                            <>
                                <Text style={{ fontSize: 15, fontWeight: '600', color: theme === 'light' ? '#555' : '#ddd', marginBottom: 8 }}>
                                    Current Position
                                </Text>
                                <View style={styles.contentSection}>
                                    <Text style={styles.companyNameText}>{alumni.currentCompany.name}</Text>
                                    <Text style={styles.companyRoleText}>{alumni.currentCompany.position || 'Not specified'}</Text>

                                    {/* Skills */}
                                    {alumni.skills && alumni.skills.length > 0 && (
                                        <View style={{ marginTop: 8 }}>
                                            <Text style={[styles.detailLabel, { marginBottom: 4 }]}>Skills & Technologies</Text>
                                            <View style={styles.skills}>
                                                {alumni.skills.map((skill, index) => (
                                                    <View key={index} style={styles.skillBadge}>
                                                        <Text style={styles.skillText}>{skill}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}

                        {/* Company Culture Section (if available) */}
                        {alumni.companyCulture && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.cultureBadge}>
                                    <MaterialIcons name="groups" size={12} color="white" />
                                    <Text style={styles.cultureLabel}>Company Culture</Text>
                                </View>
                                <Text style={styles.cultureDescription}>{alumni.companyCulture}</Text>
                            </>
                        )}

                        {/* Previous Experience */}
                        {alumni.previousCompany && alumni.previousCompany.length > 0 && (
                            <>
                                <View style={styles.divider} />
                                <Text style={{ fontSize: 15, fontWeight: '600', color: theme === 'light' ? '#555' : '#ddd', marginBottom: 8 }}>
                                    Previous Experience
                                </Text>
                                <View style={styles.contentSection}>
                                    {alumni.previousCompany.map((company, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.previousCompanyItem,
                                                index === alumni.previousCompany.length - 1 && styles.lastItem,
                                            ]}
                                        >
                                            <Text style={styles.previousCompanyName}>{company.name}</Text>
                                            <Text style={styles.companyRoleText}>{company.Position || 'Position not specified'}</Text>
                                            <Text style={styles.previousCompanyDuration}>
                                                {`${company.Duration} months`}
                                            </Text>
                                            {company.Experience && (
                                                <Text style={styles.previousCompanyExperience}>
                                                    {company.Experience}
                                                </Text>
                                            )}
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>

                    {/* Contact and Personal Details Card */}
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={styles.sectionHeader}>
                                <MaterialIcons
                                    name="person"
                                    size={20}
                                    style={styles.sectionIcon}
                                />
                                <Text style={styles.sectionTitle}>Personal Details</Text>
                            </View>
                        </View>
                        <View style={styles.contentSection}>
                            {alumni.email && (
                                <DetailItem
                                    icon="envelope"
                                    label="Email"
                                    value={alumni.email}
                                />
                            )}
                            {alumni.phone && (
                                <DetailItem
                                    icon="phone"
                                    label="Phone"
                                    value={alumni.phone}
                                />
                            )}
                            {alumni.location && (
                                <DetailItem
                                    icon="map-marker"
                                    label="Location"
                                    value={alumni.location}
                                />
                            )}
                            {alumni.specialization && (
                                <DetailItem
                                    icon="star"
                                    label="Specialization"
                                    value={alumni.specialization}
                                />
                            )}
                            {alumni.branch && (
                                <DetailItem
                                    icon="code-fork"
                                    label="Branch"
                                    value={alumni.branch}
                                />
                            )}
                            {alumni.graduationYear && (
                                <DetailItem
                                    icon="graduation-cap"
                                    label="Graduation Year"
                                    value={alumni.graduationYear.toString()}
                                />
                            )}
                        </View>
                    </View>

                    {/* Additional Information */}
                    {alumni.additionalInfo && (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.sectionHeader}>
                                    <MaterialIcons
                                        name="info"
                                        size={20}
                                        style={styles.sectionIcon}
                                    />
                                    <Text style={styles.sectionTitle}>Additional Information</Text>
                                </View>
                            </View>
                            <View style={styles.contentSection}>
                                <Text style={styles.cultureDescription}>{alumni.additionalInfo}</Text>
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default AlumniDetail;