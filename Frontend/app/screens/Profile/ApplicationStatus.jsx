import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAccessToken, getRefreshToken } from '../../../utils/tokenStorage.js';
import { router } from 'expo-router';
import { useUser } from '../../../context/userContext.js';
import CustomAlert from '../../../components/CustomAlert.jsx';

const CompanyCard = ({ application, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const company = application.companyDetails;

    // Get theme-specific colors
    const themeColor = theme === 'light' ? '#6A0DAD' : '#C92EFF';
    const textColor = theme === 'light' ? '#333333' : '#fff';
    const secondaryTextColor = theme === 'light' ? '#666666' : '#b388e9';
    const cardBackground = theme === 'light' ? '#F8F5FF' : '#2d0a41';
    const borderColor = theme === 'light' ? 'rgba(106, 13, 173, 0.2)' : '#390852';

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <View style={[styles.companycardContainer, { backgroundColor: cardBackground }]}>
            {/* Company Header */}
            <TouchableOpacity
                style={styles.companycardHeader}
                onPress={toggleExpand}
            >
                <View style={styles.headerLeft}>
                    <View>
                        <Text style={[styles.companyName, { color: textColor }]}>{company.companyName}</Text>
                        <Text style={[styles.roleText, { color: secondaryTextColor }]}>{company.role}</Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={[styles.statusText, { color: themeColor }]}>{application.status}</Text>
                    <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={24}
                        color={themeColor}
                    />
                </View>
            </TouchableOpacity>

            {/* Expanded Details */}
            {isExpanded && (
                <View style={[styles.expandedContent, { borderTopColor: borderColor }]}>
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailsColumn}>
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIconContainer, {
                                    backgroundColor: theme === 'light'
                                        ? 'rgba(106, 13, 173, 0.2)'
                                        : 'rgba(201, 46, 255, 0.2)'
                                }]}>
                                    <Ionicons name="location-outline" size={20} color={themeColor} />
                                </View>
                                <Text style={[styles.detailText, { color: textColor }]}>
                                    Location: {company.jobLocation}
                                </Text>
                            </View>
                            {company.stipend && (
                                <View style={styles.detailItem}>
                                    <View style={[styles.detailIconContainer, {
                                        backgroundColor: theme === 'light'
                                            ? 'rgba(106, 13, 173, 0.2)'
                                            : 'rgba(201, 46, 255, 0.2)'
                                    }]}>
                                        <Ionicons name="cash-outline" size={20} color={themeColor} />
                                    </View>
                                    <Text style={[styles.detailText, { color: textColor }]}>
                                        Stipend: {company.stipend || 'Not specified'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIconContainer, {
                                    backgroundColor: theme === 'light'
                                        ? 'rgba(106, 13, 173, 0.2)'
                                        : 'rgba(201, 46, 255, 0.2)'
                                }]}>
                                    <Ionicons name="time-outline" size={20} color={themeColor} />
                                </View>
                                <Text style={[styles.detailText, { color: textColor }]}>
                                    Applied: {new Date(application.createdAt).toLocaleDateString()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.detailsColumn}>
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIconContainer, {
                                    backgroundColor: theme === 'light'
                                        ? 'rgba(106, 13, 173, 0.2)'
                                        : 'rgba(201, 46, 255, 0.2)'
                                }]}>
                                    <Ionicons name="school-outline" size={20} color={themeColor} />
                                </View>
                                <Text style={[styles.detailText, { color: textColor }]}>
                                    CGPA: {company.cgpaCriteria}+
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIconContainer, {
                                    backgroundColor: theme === 'light'
                                        ? 'rgba(106, 13, 173, 0.2)'
                                        : 'rgba(201, 46, 255, 0.2)'
                                }]}>
                                    <Ionicons name="briefcase-outline" size={20} color={themeColor} />
                                </View>
                                <Text style={[styles.detailText, { color: textColor }]}>
                                    Type: {company.opportunityType}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIconContainer, {
                                    backgroundColor: theme === 'light'
                                        ? 'rgba(106, 13, 173, 0.2)'
                                        : 'rgba(201, 46, 255, 0.2)'
                                }]}>
                                    <Ionicons name="globe-outline" size={20} color={themeColor} />
                                </View>
                                <Text style={[styles.detailText, { color: textColor }]}>
                                    Mode: {company.mode}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Schedule */}
                    {company.schedule && (
                        <View style={[styles.additionalInfoSection, { borderTopColor: borderColor }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Schedule</Text>
                            <Text style={[styles.infoText, { color: textColor }]}>
                                {company.schedule}
                            </Text>
                        </View>
                    )}

                    {/* Hiring Process */}
                    {company.hiringProcess && (
                        <View style={[styles.additionalInfoSection, { borderTopColor: borderColor }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Hiring Process</Text>
                            <Text style={[styles.infoText, { color: textColor }]}>
                                {company.hiringProcess}
                            </Text>
                        </View>
                    )}

                    {/* Additional Information */}
                    {company.extraDetails && (
                        <View style={[styles.additionalInfoSection, { borderTopColor: borderColor }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Additional Information</Text>
                            <Text style={[styles.infoText, { color: textColor }]}>
                                {company.extraDetails}
                            </Text>
                        </View>
                    )}

                    {/* Point of Contact */}
                    {company.pocDetails && (
                        <View style={[styles.additionalInfoSection, { borderTopColor: borderColor }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Point of Contact</Text>
                            <Text style={[styles.infoText, { color: textColor }]}>
                                <Text style={[styles.infoLabel, { color: themeColor }]}>Name: </Text>
                                {company.pocDetails.name}
                            </Text>
                            <Text style={[styles.infoText, { color: textColor }]}>
                                <Text style={[styles.infoLabel, { color: themeColor }]}>Contact No: </Text>
                                {company.pocDetails.contactNo}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const ApplicationsStatusPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { theme } = useUser();
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    // Theme variables
    const backgroundColor = theme === 'light' ? '#F5F5F5' : '#1a012c';
    const themeColor = theme === 'light' ? '#6A0DAD' : '#C92EFF';
    const borderColor = theme === 'light' ? 'rgba(106, 13, 173, 0.2)' : '#390852';
    const textColor = theme === 'light' ? '#333333' : '#fff';
    const secondaryTextColor = theme === 'light' ? '#8324D4' : '#b388e9';

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/application-status/get-all-application-status`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            const result = await response.json();

            if (result.statusCode === 200) {
                setApplications(result.data);
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
                setAlertVisible(true)
            }
        } catch (error) {
            console.error('Error: ', error?.message);
            setAlertConfig({
                header: "Error",
                message: error?.message || "Something went wrong. Please try again.",
                buttons: [
                    {
                        text: "OK",
                        onPress: () => setAlertVisible(false),
                        style: "default"
                    }
                ]
            });
            setAlertVisible(true)
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={themeColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColor }]}>My Applications</Text>
                <TouchableOpacity onPress={fetchApplications}>
                    <Ionicons name="refresh" size={24} color={themeColor} />
                </TouchableOpacity>
            </View>

            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />

            <ScrollView
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={[styles.loadingText, { color: secondaryTextColor }]}>Loading applications...</Text>
                    </View>
                ) : applications && applications.length > 0 ? (
                    applications.map((application, index) => (
                        <CompanyCard key={index} application={application} theme={theme} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Ionicons name="document-outline" size={48} color={secondaryTextColor} />
                        <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                            You haven't applied to any companies yet.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        marginTop: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        paddingBottom: 30,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 30,
    },
    loadingText: {
        fontSize: 16,
    },
    companycardContainer: {
        marginBottom: 15,
        borderRadius: 15,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    companycardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    headerLeft: {
        flex: 1,
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    roleText: {
        fontSize: 14,
        marginTop: 4,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginRight: 10,
        fontWeight: '600',
        fontSize: 14,
    },
    expandedContent: {
        padding: 15,
        borderTopWidth: 1,
    },
    detailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailsColumn: {
        width: '48%',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    detailText: {
        fontSize: 14,
        flex: 1,
    },
    additionalInfoSection: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    infoLabel: {
        fontWeight: 'bold',
    },
    infoText: {
        marginBottom: 8,
        lineHeight: 20,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 50,
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
        marginTop: 15,
        maxWidth: '80%',
    },
});

export default ApplicationsStatusPage;