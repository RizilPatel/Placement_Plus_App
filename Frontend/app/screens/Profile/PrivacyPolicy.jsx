import React, { useState, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Linking,
    findNodeHandle,
    UIManager
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../../context/userContext.js';
import CustomAlert from '../../../components/CustomAlert.jsx';

const PrivacyPolicyScreen = () => {
    const { theme, user } = useUser();
    const router = useRouter();
    const [expandedSection, setExpandedSection] = useState(null);
    const lastUpdatedDate = "April 15, 2025";
    const scrollViewRef = useRef(null);
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const styles = useMemo(() => getStyles(theme), [theme]);

    const privacyPolicySections = [
        {
            id: 1,
            title: "Introduction",
            content: "Welcome to Alumni Connect's Privacy Policy. This document outlines how we collect, use, disclose, and safeguard your personal information when you use our mobile application. We respect your privacy and are committed to protecting your personal data. Please read this policy carefully to understand our practices regarding your personal information."
        },
        {
            id: 2,
            title: "Information We Collect",
            content: "We collect several types of information from and about users of our app, including:\n\n• Personal identifiers such as name, email address, phone number, date of birth, and alumni ID.\n\n• Professional information including educational background, work experience, and professional achievements.\n\n• Usage data such as app interactions, features used, time spent on the app, and preferences.\n\n• Device information including device type, operating system, unique device identifiers, and network information."
        },
        {
            id: 3,
            title: "How We Use Your Information",
            content: "We use the information we collect to:\n\n• Create and maintain your account.\n\n• Provide and improve our services.\n\n• Facilitate networking with other alumni.\n\n• Send notifications about events, job opportunities, and announcements.\n\n• Analyze usage patterns to enhance user experience.\n\n• Ensure compliance with our terms and policies."
        },
        {
            id: 4,
            title: "Information Sharing and Disclosure",
            content: "We may share your information with:\n\n• Other alumni in the network (based on your privacy settings).\n\n• Third-party service providers who perform services on our behalf.\n\n• Educational institutions for verification purposes.\n\n• Legal authorities when required by law or to protect our rights.\n\nWe do not sell personal information to third parties for marketing purposes."
        },
        {
            id: 5,
            title: "Data Security",
            content: "We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. These measures include encryption, access controls, regular security assessments, and staff training on privacy practices."
        },
        {
            id: 6,
            title: "Your Privacy Rights",
            content: "Depending on your location, you may have the right to:\n\n• Access personal information we hold about you.\n\n• Correct inaccurate or incomplete information.\n\n• Delete your personal data under certain circumstances.\n\n• Restrict or object to certain processing activities.\n\n• Data portability (receiving your data in a structured, commonly used format).\n\n• Withdraw consent at any time where processing is based on consent."
        },
        {
            id: 7,
            title: "Children's Privacy",
            content: "Our app is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we discover that we have collected personal information from a child, we will promptly delete that information."
        },
        {
            id: 8,
            title: "Changes to Our Privacy Policy",
            content: "We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date. You are advised to review this Privacy Policy periodically for any changes."
        },
        {
            id: 9,
            title: "Contact Us",
            content: "If you have any questions about this Privacy Policy or our data practices, please contact us at:\n\nPrivacy Officer\nAlumni Connect\nEmail: privacy@alumniapp.com\nPhone: (555) 123-4567"
        }
    ];

    const frequentPrivacyActions = [
        {
            id: 1,
            title: "Download My Data",
            description: "Request a copy of all your personal data",
            icon: "cloud-download",
            iconType: "MaterialIcons",
            color: "#4285F4",
            action: () => handleDownloadData()
        },
        {
            id: 2,
            title: "Delete My Account",
            description: "Request permanent deletion of your account",
            icon: "delete-forever",
            iconType: "MaterialIcons",
            color: "#EA4335",
            action: () => handleDeleteAccount()
        },
        {
            id: 3,
            title: "Privacy Settings",
            description: "Manage your privacy preferences",
            icon: "shield-lock",
            iconType: "MaterialCommunityIcons",
            color: "#34A853",
            action: () => router.push('/profile/settings/privacy')
        },
        {
            id: 4,
            title: "Opt-Out of Analytics",
            description: "Stop sharing usage data with us",
            icon: "chart-box",
            iconType: "MaterialCommunityIcons",
            color: "#FBBC05",
            action: () => handleOptOutAnalytics()
        }
    ];

    const handleDownloadData = () => {
        setAlertConfig({
            header: "Download My Data",
            message:
                "We will prepare a copy of all your personal data and send it to your registered email address within 48 hours.",
            buttons: [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Confirm",
                    onPress: () => {
                        setAlertVisible(false);
                        setTimeout(() => {
                            setAlertConfig({
                                header: "Request Submitted",
                                message: "Your data download request has been submitted. You'll receive an email with further instructions.",
                                buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }],
                            });
                            setAlertVisible(true);
                        }, 1000);
                    },
                },
            ],
        });
        setAlertVisible(true)
    };

    const handleDeleteAccount = () => {
        setAlertConfig({
            header: "Delete Account",
            message: "Are you sure you want to delete your account? This action cannot be undone and will permanently remove all your data.",
            buttons: [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        setAlertVisible(false);
                        setTimeout(() => {
                            setAlertConfig({
                                header: "Request Submitted",
                                message: "Your account deletion request has been submitted. You'll receive a confirmation email within 24 hours.",
                                buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }],
                            });
                            setAlertVisible(true);
                        }, 1000);
                    },
                }
            ]
        })
        setAlertVisible(true)
    };

    const handleOptOutAnalytics = () => {
        setAlertConfig({
            header: "Opt-Out of Analytics",
            message: "You will no longer share app usage data with us. This may affect personalized experiences.",
            buttons: [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Opt-Out",
                    onPress: () => {
                        setAlertVisible(false);
                        setTimeout(() => {
                            setAlertConfig({
                                header: "Setting Updated",
                                message: "You have successfully opted out of analytics tracking.",
                                buttons: [{ text: "OK", onPress: () => setAlertVisible(false) }],
                            });
                            setAlertVisible(true);
                        }, 1000);
                    }
                }
            ]
        })
        setAlertVisible(true)
    };

    const scrollToSection = (id) => {
        setExpandedSection(id);
        if (sectionRefs[id] && scrollViewRef.current) {
            const handle = findNodeHandle(sectionRefs[id]);
            if (handle) {
                setTimeout(() => {
                    UIManager.measure(handle, (x, y, width, height, pageX, pageY) => {
                        scrollViewRef.current.scrollTo({
                            y: pageY - 100,
                            animated: true,
                        });
                    });
                }, 100);
            }
        }
    };

    const toggleSection = (id) => {
        setExpandedSection(expandedSection === id ? null : id);
    };

    const sectionRefs = {};

    const renderPrivacyAction = (option) => {
        let IconComponent;
        switch (option.iconType) {
            case 'MaterialIcons':
                IconComponent = MaterialIcons;
                break;
            case 'FontAwesome5':
                IconComponent = FontAwesome5;
                break;
            case 'MaterialCommunityIcons':
                IconComponent = MaterialCommunityIcons;
                break;
            default:
                IconComponent = Ionicons;
        }

        return (
            <TouchableOpacity
                key={option.id}
                style={styles.actionCard}
                onPress={option.action}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                    <IconComponent name={option.icon} size={28} color={option.color} />
                </View>
                <View style={styles.actionTextContainer}>
                    <Text style={styles.actionTitle}>{option.title}</Text>
                    <Text style={styles.actionDescription}>{option.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
            </TouchableOpacity>
        );
    };

    const renderPolicySection = (section) => {
        const isExpanded = expandedSection === section.id;

        return (
            <View
                key={section.id}
                style={styles.policySection}
                ref={ref => sectionRefs[section.id] = ref}
            >
                <TouchableOpacity
                    style={styles.sectionHeader}
                    onPress={() => toggleSection(section.id)}
                >
                    <Text style={styles.sectionTitle}>{section.title}</Text>
                    <MaterialIcons
                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                        size={24}
                        color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.sectionContent}>
                        <Text style={styles.sectionText}>{section.content}</Text>
                    </View>
                )}
            </View>
        );
    };

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
                <Text style={styles.headerTitle}>Privacy Policy</Text>
                <TouchableOpacity onPress={() => Linking.openURL('mailto:privacy@alumniapp.com')}>
                    <Ionicons
                        name="mail-outline"
                        size={24}
                        color={theme === 'light' ? '#6A0DAD' : 'white'}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                style={styles.scrollContainer}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>Your Privacy Matters</Text>
                        <Text style={styles.heroSubtitle}>
                            Last updated: {lastUpdatedDate}
                        </Text>
                    </View>
                    <MaterialIcons
                        name="security"
                        size={40}
                        color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'}
                    />
                </View>

                <CustomAlert
                    visible={alertVisible}
                    header={alertConfig.header}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                    onClose={() => setAlertVisible(false)}
                />

                {/* Quick Actions */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeading}>Quick Actions</Text>
                    <View style={styles.actionsContainer}>
                        {frequentPrivacyActions.map(option => renderPrivacyAction(option))}
                    </View>
                </View>

                {/* Table of Contents */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeading}>Table of Contents</Text>
                    <View style={styles.tocContainer}>
                        {privacyPolicySections.map(section => (
                            <TouchableOpacity
                                key={section.id}
                                style={styles.tocItem}
                                onPress={() => scrollToSection(section.id)}
                            >
                                <Text style={styles.tocNumber}>{section.id}</Text>
                                <Text style={styles.tocText}>{section.title}</Text>
                                <MaterialIcons name="arrow-forward-ios" size={16} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Privacy Policy Content */}
                <View style={styles.policyContainer}>
                    <Text style={styles.sectionHeading}>Privacy Policy</Text>
                    <View style={styles.policySectionsContainer}>
                        {privacyPolicySections.map(section => renderPolicySection(section))}
                    </View>
                </View>

                {/* Consent Section */}
                <View style={styles.consentCard}>
                    <Text style={styles.consentTitle}>Your Consent</Text>
                    <Text style={styles.consentDescription}>
                        By using Alumni Connect, you consent to our Privacy Policy and agree to its terms.
                    </Text>
                    <TouchableOpacity
                        style={styles.consentButton}
                    >
                        <Text style={styles.consentButtonText}>I Understand and Agree</Text>
                    </TouchableOpacity>
                </View>

                {/* App Information */}
                <View style={styles.appInfoContainer}>
                    <Text style={styles.appVersion}>Alumni Connect v1.2.0</Text>
                    <Text style={styles.copyright}>© 2025 Alumni Connect. All rights reserved.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme === 'light' ? '#F8F9FA' : '#120023',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: theme === 'light' ? 'white' : '#1A0533',
        borderBottomWidth: 1,
        borderBottomColor: theme === 'light' ? '#EAEAEA' : 'rgba(255, 255, 255, 0.05)',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme === 'light' ? '#6A0DAD' : 'white',
    },
    backButton: {
        padding: 4,
    },
    scrollContainer: {
        flex: 1,
    },
    heroSection: {
        backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(139, 8, 144, 0.2)',
        borderRadius: 16,
        padding: 20,
        margin: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    heroContent: {
        flex: 1,
    },
    heroTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme === 'light' ? '#6A0DAD' : '#f0c5f1',
        marginBottom: 8,
    },
    heroSubtitle: {
        fontSize: 14,
        color: theme === 'light' ? '#666' : '#AAA',
        lineHeight: 20,
    },
    sectionContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: '600',
        color: theme === 'light' ? '#333' : '#FFF',
        marginBottom: 12,
    },
    actionsContainer: {
        backgroundColor: theme === 'light' ? '#FFF' : '#2c0847',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme === 'light' ? '#333' : '#FFF',
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 13,
        color: theme === 'light' ? '#666' : '#AAA',
    },
    tocContainer: {
        backgroundColor: theme === 'light' ? '#FFF' : '#2c0847',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    tocItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    },
    tocNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(139, 8, 144, 0.3)',
        textAlign: 'center',
        lineHeight: 24,
        color: theme === 'light' ? '#6A0DAD' : '#f0c5f1',
        fontWeight: '700',
        marginRight: 12,
    },
    tocText: {
        flex: 1,
        fontSize: 14,
        fontWeight: '500',
        color: theme === 'light' ? '#333' : '#FFF',
    },
    policyContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    policySectionsContainer: {
        backgroundColor: theme === 'light' ? '#FFF' : '#2c0847',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    policySection: {
        borderBottomWidth: 1,
        borderBottomColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: theme === 'light' ? '#333' : '#FFF',
        flex: 1,
        paddingRight: 8,
    },
    sectionContent: {
        padding: 16,
        paddingTop: 0,
        backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.03)' : 'rgba(139, 8, 144, 0.1)',
    },
    sectionText: {
        fontSize: 14,
        lineHeight: 20,
        color: theme === 'light' ? '#666' : '#CCC',
    },
    consentCard: {
        backgroundColor: theme === 'light' ? '#FFF' : '#2c0847',
        borderRadius: 12,
        padding: 20,
        margin: 16,
        alignItems: 'center',
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    consentTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme === 'light' ? '#333' : '#FFF',
        marginBottom: 8,
    },
    consentDescription: {
        fontSize: 14,
        color: theme === 'light' ? '#666' : '#AAA',
        textAlign: 'center',
        marginBottom: 16,
    },
    consentButton: {
        backgroundColor: theme === 'light' ? '#6A0DAD' : '#8b0890',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 8,
    },
    consentButtonText: {
        color: 'white',
        fontWeight: '600',
        textAlign: 'center',
    },
    appInfoContainer: {
        alignItems: 'center',
        padding: 20,
        paddingBottom: 32,
    },
    appVersion: {
        fontSize: 14,
        color: theme === 'light' ? '#888' : '#AAA',
        marginBottom: 4,
    },
    copyright: {
        fontSize: 12,
        color: theme === 'light' ? '#AAA' : '#888',
    },
});

export default PrivacyPolicyScreen;