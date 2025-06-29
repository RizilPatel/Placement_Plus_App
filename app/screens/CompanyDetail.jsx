import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Alert,
    StatusBar,
    Image
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import { FontAwesome } from '@expo/vector-icons';
import { useUser } from '../../context/userContext.js';
import CustomAlert from '../../components/CustomAlert.jsx';

const dummyData = {
    "_id": "67efa2864b0becc2304464d5",
    "companyName": "Meta",
    "cgpaCriteria": 7,
    "ctc": "60 LPA",
    "eligibleBatch": [2026],
    "eligibleBranches": ["CSE", "ECE", "AI/ML", "Data Science"],
    "hiringProcess": "Online Assessment → Technical Interviews → System Design → HR Interview",
    "jobLocation": "Menlo Park, California, USA",
    "mode": "Online",
    "opportunityType": "Internship + Full Time",
    "role": "Machine Learning Engineer",
    "schedule": "Coding Round: 18-May-2025, Interview: 25-May-2025",
    "stipend": "75,000",
    "pocDetails": {
        "contactNo": 1122334455,
        "name": "Daniel Johnson"
    },
    "appliedStudents": [],
    "__v": 0
}

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

const CompanyDetails = () => {
    const [companyData, setCompanyData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [applying, setApplying] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const { theme, user: userData, login } = useUser();
    const { companyId } = useLocalSearchParams();
    const router = useRouter();
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const themeColor = theme === 'light' ? '#6A0DAD' : '#C92EFF';
    const backgroundColor = theme === 'light' ? '#F5F5F5' : '#0D021F';
    const cardBackgroundColor = theme === 'light' ? '#FFFFFF' : '#1C1235';
    const cardBorderColor = theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : '#2A1E43';
    const textColor = theme === 'light' ? '#333333' : 'white';
    const secondaryTextColor = theme === 'light' ? '#666666' : '#BA68C8';
    const inputBackgroundColor = theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : '#1C1235';

    useEffect(() => {
        getCompanyDetails();
        checkApplicationStatus();
        // setCompanyData(dummyData)
    }, []);

    const getCompanyDetails = async () => {
        setLoading(true);
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();
            if (!accessToken || !refreshToken) {
                Alert.alert("Error", "Tokens are required. Please login again");
                return;
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/companies/get-details/c/${companyId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Server response:", errorText);
                throw new Error(`HTTP Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result?.statusCode === 200) {
                setCompanyData(result?.data);
            } else {
                console.log(result.message);
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
                setAlertVisible(true);
            }
        } catch (error) {
            console.log(error.message);
            setAlertConfig({
                header: "Failed to fetch company data",
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
            setLoading(false);
        }
    };

    const checkApplicationStatus = async () => {
        setLoading(true);
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            if (!accessToken || !refreshToken) {
                console.log("No tokens available");
                return;
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/application-status/get-application-status/c/${companyId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok) {
                console.log("No application found or server error");
                return;
            }

            const result = await response.json();
            console.log("API Response:", result);

            if (result?.statusCode === 200 && result?.data) {
                setApplicationStatus(result.data.status);
            }
        } catch (error) {
            console.log("Application status check error:", error.message);
        } finally {
            setLoading(false);
        }
    };

    const applyForCompany = async () => {
        setApplying(true);
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();
            if (!accessToken || !refreshToken) {
                Alert.alert("Error", "Tokens are required. Please login again");
                return;
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/companies/apply-to-company/c/${companyData._id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Server response:", errorText);
                throw new Error(`HTTP Error ${response.status}: ${errorText}`);
            }

            const result = await response.json();

            if (result?.statusCode === 200) {
                setAlertConfig({
                    header: "Success",
                    message: "Applied successfully!",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default"
                        }
                    ]
                });
                setAlertVisible(true);
                setApplicationStatus("Applied");
                await login(result.data)
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
            console.log(error.message);
            setAlertConfig({
                header: "Failed to apply",
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
            setApplying(false);
        }
    };

    const getSlab = (lpa) => {
        if (lpa <= 8)
            return 0;
        else if (lpa <= 12)
            return 1;
        else if (lpa <= 18)
            return 2;
        else if (lpa <= 25)
            return 3;
        else
            return 4;
    };

    const isEligible = () => {
        if (!companyData || !userData)
            return false

        // console.log("User: ", userData);


        const branchEligibility = companyData?.eligibleBranches?.includes(userData.branch);
        const batchEligibility = companyData?.eligibleBatches?.includes(userData.batch) || true;
        const cgpaEligibility = companyData?.cgpaCriteria <= userData.CGPA;
        const internshipEligibility = userData.internshipEligible;
        let fullTimeEligibility = userData.fullTimeEligible;

        if (!fullTimeEligibility)
            fullTimeEligibility = getSlab(parseFloat(companyData?.ctc?.split(" ")[0])) > userData.slab;

        if (companyData.opportunityType === 'Internship')
            return branchEligibility && batchEligibility && cgpaEligibility && internshipEligibility;
        else if (companyData.opportunityType === 'Full Time') {
            return branchEligibility && batchEligibility && cgpaEligibility && fullTimeEligibility;
        } else {
            return branchEligibility && batchEligibility && cgpaEligibility && internshipEligibility && fullTimeEligibility;
        }
    };

    const getStatusColor = () => {
        switch (applicationStatus) {
            case "Applied": return "#3498db"; // Blue
            case "Shortlisted": return "#f39c12"; // Orange
            case "Selected": return "#2ecc71"; // Green
            case "Rejected": return "#e74c3c"; // Red
            default: return themeColor;
        }
    };

    const goBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <View style={[styles.loadingContainer, { backgroundColor }]}>
                <ActivityIndicator size="large" color={themeColor} />
                <Text style={[styles.loadingText, { color: textColor }]}>Loading company details...</Text>
            </View>
        );
    }

    if (!companyData) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor }]}>
                <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
                <View style={[styles.errorContainer, { backgroundColor: cardBackgroundColor }]}>
                    <FontAwesome name="exclamation-triangle" size={50} color={themeColor} style={styles.errorIcon} />
                    <Text style={[styles.errorTitle, { color: textColor }]}>Company Not Found</Text>
                    <Text style={[styles.errorMessage, { color: secondaryTextColor }]}>
                        We couldn't find the company details you're looking for.
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
                    <View style={[styles.companyHeader, { borderBottomColor: cardBorderColor }]}>
                        {/* Add company logo */}
                        <View style={styles.logoContainer}>
                            {companyData.companyName && imageMap[`${companyData.companyName}.png`] ? (
                                <Image
                                    source={imageMap[`${companyData.companyName}.png`]}
                                    style={styles.companyLogo}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View style={[styles.placeholderLogo, { backgroundColor: themeColor + '20' }]}>
                                    <Text style={[styles.placeholderText, { color: themeColor }]}>
                                        {companyData.companyName.charAt(0)}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={[styles.companyHeader, { borderBottomColor: cardBorderColor }]}>
                            <Text style={[styles.companyName, { color: textColor }]}>{companyData.companyName}</Text>
                            <View style={styles.tagRow}>
                                <View style={[styles.tag, { backgroundColor: themeColor + '20' }]}>
                                    <Text style={[styles.tagText, { color: themeColor }]}>{companyData.mode}</Text>
                                </View>
                                <View style={[styles.tag, { backgroundColor: themeColor + '20' }]}>
                                    <Text style={[styles.tagText, { color: themeColor }]}>{companyData.opportunityType}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Role */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Role Information</Text>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Position:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{companyData.role}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Location:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{companyData.jobLocation}</Text>
                            </View>
                            {companyData.ctc && (
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>CTC:</Text>
                                    <Text style={[styles.detailValue, { color: textColor }]}>{companyData.ctc}</Text>
                                </View>
                            )}
                            {companyData.stipend && (
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Stipend:</Text>
                                    <Text style={[styles.detailValue, { color: textColor }]}>{companyData.stipend}</Text>
                                </View>
                            )}
                        </View>

                        {/* Eligibility */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Eligibility Criteria</Text>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Branches:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>
                                    {companyData.eligibleBranches.join(', ')}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Batches:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>
                                    {companyData.eligibleBatch.join(', ')}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Min CGPA:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{companyData.cgpaCriteria}</Text>
                            </View>
                        </View>

                        {/* Process */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Hiring Process</Text>
                            <Text style={[styles.processText, { color: textColor }]}>{companyData.hiringProcess}</Text>
                        </View>

                        {/* Schedule */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Schedule Information</Text>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Schedule:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{companyData.schedule}</Text>
                            </View>
                        </View>

                        {/* POC Details */}
                        <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                            <Text style={[styles.sectionTitle, { color: themeColor }]}>Contact Person</Text>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Name:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{companyData?.pocDetails?.name || "Not specified"}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Contact:</Text>
                                <Text style={[styles.detailValue, { color: textColor }]}>{companyData?.pocDetails?.contactNo || "Not specified"}</Text>
                            </View>
                        </View>

                        {/* Extra Details if available */}
                        {companyData.extraDetails && (
                            <View style={[styles.section, { borderTopWidth: 1, borderTopColor: cardBorderColor, paddingTop: 15 }]}>
                                <Text style={[styles.sectionTitle, { color: themeColor }]}>Additional Information</Text>
                                <Text style={[styles.processText, { color: textColor }]}>{companyData.extraDetails}</Text>
                            </View>
                        )}

                        {/* Application Status */}
                        {applicationStatus && (
                            <View style={[styles.applicationStatus, { borderTopWidth: 1, borderTopColor: cardBorderColor }]}>
                                <Text style={[styles.statusLabel, { color: secondaryTextColor }]}>Application Status:</Text>
                                <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor() }]}>{applicationStatus}</Text>
                                </View>
                            </View>
                        )}

                        {/* Apply Button */}
                        {!applicationStatus && (
                            <TouchableOpacity
                                style={[
                                    styles.applyButton,
                                    {
                                        backgroundColor: isEligible() ? themeColor : secondaryTextColor,
                                        opacity: isEligible() ? 1 : 0.7
                                    }
                                ]}
                                onPress={applyForCompany}
                                disabled={!isEligible() || applying}
                            >
                                {applying ? (
                                    <ActivityIndicator color="white" size="small" />
                                ) : (
                                    <Text style={styles.applyButtonText}>
                                        {isEligible() ? "Apply Now" : "Not Eligible"}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Eligibility Note */}
                {!isEligible() && !applicationStatus && (
                    <View style={[styles.eligibilityNote, { backgroundColor: cardBackgroundColor, borderColor: cardBorderColor }]}>
                        <FontAwesome name="info-circle" size={20} color="#f39c12" style={styles.infoIcon} />
                        <Text style={[styles.eligibilityText, { color: secondaryTextColor }]}>
                            You don't meet the eligibility criteria for this opportunity.
                        </Text>
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
    companyHeader: {
        padding: 20,
        borderBottomWidth: 1,
    },
    // Add these to your existing styles object
    logoContainer: {
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
    companyName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
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
    applyButton: {
        margin: 20,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    applicationStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    statusLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusText: {
        fontWeight: 'bold',
    },
    eligibilityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        marginVertical: 5,
    },
    infoIcon: {
        marginRight: 10,
    },
    eligibilityText: {
        flex: 1,
        fontSize: 14,
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
});

export default CompanyDetails;