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
    Image,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../../context/userContext.js';

const HelpSupportScreen = () => {
    const { theme } = useUser();
    const router = useRouter();
    const [expandedFaq, setExpandedFaq] = useState(null);

    const styles = useMemo(() => getStyles(theme), [theme]);

    const faqData = [
        {
            id: 1,
            question: "How do I update my profile information?",
            answer: "To update your profile information, go to the Profile tab and tap on 'Edit Profile'. From there, you can update your personal details, education information, work experience, and skills."
        },
        {
            id: 2,
            question: "How can I connect with other alumni?",
            answer: "You can search for and connect with other alumni through the Alumni Directory. Simply use the search or filter functionality to find alumni based on batch, location, company, or expertise area."
        },
        {
            id: 3,
            question: "What should I do if I forget my password?",
            answer: "If you forget your password, tap on 'Forgot Password' on the login screen. You'll receive a password reset link on your registered email address. Follow the instructions to create a new password."
        },
        {
            id: 4,
            question: "How can I see upcoming events and opportunities?",
            answer: "All upcoming events, job opportunities, and announcements can be found on the Home tab. You can also check the Notifications section for the latest updates related to your interests and eligibility."
        },
        {
            id: 5,
            question: "Can I change my notification preferences?",
            answer: "Yes, you can customize your notification preferences in the Settings menu. Go to Profile > Settings > Notifications to select which types of notifications you'd like to receive."
        }
    ];

    const supportOptions = [
        {
            id: 1,
            title: "Contact Support Team",
            description: "Get help from our dedicated support team",
            icon: "headset",
            iconType: "MaterialIcons",
            color: "#4CAF50",
            action: () => Linking.openURL('mailto:support@placementplusapp.com')
        },
        {
            id: 2,
            title: "FAQs",
            description: "Find answers to common questions",
            icon: "question-circle",
            iconType: "FontAwesome5",
            color: "#2196F3",
            action: () => scrollToFaqs()
        },
        {
            id: 3,
            title: "Report a Bug",
            description: "Help us improve by reporting issues",
            icon: "bug",
            iconType: "MaterialCommunityIcons",
            color: "#F44336",
            action: () => Linking.openURL('mailto:bugs@placementplusapp.com?subject=Bug%20Report')
        },
        {
            id: 4,
            title: "Feature Request",
            description: "Suggest new features for the app",
            icon: "lightbulb",
            iconType: "MaterialCommunityIcons",
            color: "#FF9800",
            action: () => Linking.openURL('mailto:feedback@placementplusapp.com?subject=Feature%20Request')
        }
    ];

    const faqsRef = useRef(null);

    const scrollToFaqs = () => {
        if (faqsRef.current) {
            faqsRef.current.scrollTo({
                y: faqsRef.current.position,
                animated: true,
            });
        }
    };

    const toggleFaq = (id) => {
        setExpandedFaq(expandedFaq === id ? null : id);
    };

    const renderSupportOption = (option) => {
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
                style={styles.supportOptionCard}
                onPress={option.action}
            >
                <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                    <IconComponent name={option.icon} size={28} color={option.color} />
                </View>
                <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
            </TouchableOpacity>
        );
    };

    const renderFaqItem = (item) => {
        const isExpanded = expandedFaq === item.id;

        return (
            <View key={item.id} style={styles.faqItem}>
                <TouchableOpacity
                    style={styles.faqQuestion}
                    onPress={() => toggleFaq(item.id)}
                >
                    <Text style={styles.faqQuestionText}>{item.question}</Text>
                    <MaterialIcons
                        name={isExpanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                        size={24}
                        color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={styles.faqAnswer}>
                        <Text style={styles.faqAnswerText}>{item.answer}</Text>
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
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={styles.placeholderView} />
            </View>

            <ScrollView
                ref={faqsRef}
                showsVerticalScrollIndicator={false}
                style={styles.scrollContainer}
                onScrollEndDrag={(event) => {
                    // Store current scroll position
                    faqsRef.current.position = event.nativeEvent.contentOffset.y;
                }}
                onMomentumScrollEnd={(event) => {
                    // Store current scroll position
                    faqsRef.current.position = event.nativeEvent.contentOffset.y;
                }}
            >
                {/* Hero Section */}
                <View style={styles.heroSection}>
                    <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>How can we help you?</Text>
                        <Text style={styles.heroSubtitle}>
                            Find answers, get support, and share your feedback
                        </Text>
                    </View>
                    {/* <Image
                        source={require('../../assets/support-illustration.png')}
                        style={styles.heroImage}
                        resizeMode="contain"
                    /> */}
                </View>


                {/* Support Options */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Support Options</Text>
                    <View style={styles.supportOptionsContainer}>
                        {supportOptions.map(option => renderSupportOption(option))}
                    </View>
                </View>

                {/* FAQs Section */}
                <View
                    style={styles.sectionContainer}
                    onLayout={(event) => {
                        const layout = event.nativeEvent.layout;
                        if (faqsRef.current) {
                            faqsRef.current.position = layout.y;
                        }
                    }}
                >
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
                    <View style={styles.faqContainer}>
                        {faqData.map(item => renderFaqItem(item))}
                    </View>
                </View>

                {/* Additional Resources */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Additional Resources</Text>
                    <View style={styles.resourcesCard}>
                        <TouchableOpacity style={styles.resourceItem}>
                            <MaterialIcons name="menu-book" size={20} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
                            <Text style={styles.resourceText}>User Guide</Text>
                        </TouchableOpacity>
                        <View style={styles.resourceDivider} />
                        <TouchableOpacity style={styles.resourceItem}>
                            <MaterialIcons name="privacy-tip" size={20} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
                            <Text style={styles.resourceText}>Privacy Policy</Text>
                        </TouchableOpacity>
                        <View style={styles.resourceDivider} />
                        <TouchableOpacity style={styles.resourceItem}>
                            <MaterialIcons name="description" size={20} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
                            <Text style={styles.resourceText}>Terms of Service</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Contact Information */}
                <View style={styles.contactCard}>
                    <Text style={styles.contactTitle}>Still need help?</Text>
                    <Text style={styles.contactDescription}>
                        Our support team is available Monday to Friday, 9 AM to 6 PM
                    </Text>
                    <TouchableOpacity
                        style={styles.contactButton}
                        onPress={() => Linking.openURL('mailto:support@alumniapp.com')}
                    >
                        <Ionicons name="mail" size={18} color="white" />
                        <Text style={styles.contactButtonText}>Contact Support</Text>
                    </TouchableOpacity>
                </View>

                {/* App Information */}
                <View style={styles.appInfoContainer}>
                    <Text style={styles.appVersion}>Placement Plus v1.2.0</Text>
                    <Text style={styles.copyright}>© 2025 Placement Plus. All rights reserved.</Text>
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
    placeholderView: {
        width: 24,
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
    heroImage: {
        width: 100,
        height: 100,
    },
    sectionContainer: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme === 'light' ? '#333' : '#FFF',
        marginBottom: 12,
    },
    supportOptionsContainer: {
        backgroundColor: theme === 'light' ? '#FFF' : '#2c0847',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    supportOptionCard: {
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
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme === 'light' ? '#333' : '#FFF',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: 13,
        color: theme === 'light' ? '#666' : '#AAA',
    },
    faqContainer: {
        backgroundColor: theme === 'light' ? '#FFF' : '#2c0847',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    faqItem: {
        borderBottomWidth: 1,
        borderBottomColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    },
    faqQuestion: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    faqQuestionText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme === 'light' ? '#333' : '#FFF',
        flex: 1,
        paddingRight: 8,
    },
    faqAnswer: {
        padding: 16,
        paddingTop: 0,
        backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.03)' : 'rgba(139, 8, 144, 0.1)',
    },
    faqAnswerText: {
        fontSize: 14,
        lineHeight: 20,
        color: theme === 'light' ? '#666' : '#CCC',
    },
    resourcesCard: {
        backgroundColor: theme === 'light' ? '#FFF' : '#2c0847',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    resourceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    resourceText: {
        fontSize: 15,
        fontWeight: '500',
        color: theme === 'light' ? '#333' : '#FFF',
        marginLeft: 12,
    },
    resourceDivider: {
        height: 1,
        backgroundColor: theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
    },
    contactCard: {
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
    contactTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme === 'light' ? '#333' : '#FFF',
        marginBottom: 8,
    },
    contactDescription: {
        fontSize: 14,
        color: theme === 'light' ? '#666' : '#AAA',
        textAlign: 'center',
        marginBottom: 16,
    },
    contactButton: {
        backgroundColor: theme === 'light' ? '#6A0DAD' : '#8b0890',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginTop: 8,
    },
    contactButtonText: {
        color: 'white',
        fontWeight: '600',
        marginLeft: 8,
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

export default HelpSupportScreen;