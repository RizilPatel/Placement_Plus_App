import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAccessToken, getRefreshToken } from '../../../utils/tokenStorage';
import { router } from 'expo-router';
import { useUser } from '../../../context/userContext.js';
import CustomAlert from '../../../components/CustomAlert.jsx';

const CompanyCard = ({ company, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);

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
                    <Text style={[styles.statusText, { color: themeColor }]}>{company.applicationStatus}</Text>
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
                            {company.ctc && (
                                <View style={styles.detailItem}>
                                    <View style={[styles.detailIconContainer, {
                                        backgroundColor: theme === 'light'
                                            ? 'rgba(106, 13, 173, 0.2)'
                                            : 'rgba(201, 46, 255, 0.2)'
                                    }]}>
                                        <Ionicons name="cash-outline" size={20} color={themeColor} />
                                    </View>
                                    <Text style={[styles.detailText, { color: textColor }]}>
                                        CTC: {company.ctc || 'Not specified'}
                                    </Text>
                                </View>
                            )}
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
                                    CGPA: {company.cgpaCriteria}
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
                                    Mode: {company.mode}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Additional Information */}
                    {(company.extraDetails || company.hiringProcess) && (
                        <View style={[styles.additionalInfoSection, { borderTopColor: borderColor }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Additional Information</Text>
                            {company.hiringProcess && (
                                <Text style={[styles.infoText, { color: textColor }]}>
                                    <Text style={[styles.infoLabel, { color: themeColor }]}>Hiring Process: </Text>
                                    {company.hiringProcess}
                                </Text>
                            )}
                            {company.extraDetails && (
                                <Text style={[styles.infoText, { color: textColor }]}>
                                    <Text style={[styles.infoLabel, { color: themeColor }]}>Extra Details: </Text>
                                    {company.extraDetails}
                                </Text>
                            )}
                        </View>
                    )}

                    {company.pocDetails && (
                        <View style={[styles.additionalInfoSection, { borderTopColor: borderColor }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Point of Contact</Text>
                            <Text style={[styles.infoText, { color: textColor }]}>
                                <Text style={[styles.infoLabel, { color: themeColor }]}>Name: </Text> {company.pocDetails.name}
                            </Text>
                            <Text style={[styles.infoText, { color: textColor }]}>
                                <Text style={[styles.infoLabel, { color: themeColor }]}>Contact No: </Text> {company.pocDetails.contactNo}
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const AppliedCompaniesPage = () => {
    const [companies, setCompanies] = useState([]);
    const { theme } = useUser()
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

    const fetchAppliedCompanies = async () => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/companies/get-company-details`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            const result = await response.json();

            if (result.statusCode === 200) {
                setCompanies(result.data);
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
        }
    };

    useEffect(() => {
        fetchAppliedCompanies();
    }, []);

    return (
        <View style={[styles.container, { backgroundColor }]}>
            <View style={[styles.header, { borderBottomColor: borderColor }]}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={themeColor} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: themeColor }]}>Applied Companies</Text>
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
                {companies && companies.length > 0 ? (
                    companies.map((company, index) => (
                        <CompanyCard key={index} company={company} theme={theme} />
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                            No companies found. You haven't applied to any companies yet.
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
        paddingTop: 15,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#390852',
        marginTop: 20,
    },
    backButton: {
        padding: 5,
        marginLeft: 5
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginRight: 100
    },
    scrollViewContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    companycardContainer: {
        marginTop: 15,
        borderRadius: 15,
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
        marginTop: 15
    },
    roleText: {
        fontSize: 14,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusText: {
        marginRight: 10,
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
        marginBottom: 10,
    },
    detailIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
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
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 30,
    },
    emptyStateText: {
        textAlign: 'center',
        fontSize: 16,
    },
});

export default AppliedCompaniesPage;