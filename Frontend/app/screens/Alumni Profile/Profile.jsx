import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Switch, BackHandler, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../../context/userContext.js';
import { router } from 'expo-router';
import { getAccessToken, getRefreshToken, removeAccessToken, removeRefreshToken } from '../../../utils/tokenStorage.js';
import CustomAlert from '../../../components/CustomAlert.jsx';
import { getFileFromAppwrite } from '../../../utils/appwrite.js';

const ProfileSettings = () => {
    const navigation = useNavigation();
    const { alumni: loggedInAlumni, alumniLogout, theme, toggleTheme } = useUser()
    const [darkModeEnabled, setDarkModeEnabled] = useState(theme === "dark");
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })
    const [alumni, setAlumni] = useState({
        name: '',
        email: '',
        batch: '',
        profilePic: ''
    });
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setDarkModeEnabled(theme === "dark")
    }, [])

    useEffect(() => {
        const fetchProfilePic = async () => {
            try {
                setIsLoading(true);
                const profilePicFile = await getFileFromAppwrite(loggedInAlumni.profilePicId);

                setAlumni({
                    name: loggedInAlumni?.name || '-',
                    email: loggedInAlumni?.email || '-',
                    batch: loggedInAlumni?.batch || '-',
                    profilePic: profilePicFile
                });

                // console.log(profilePicFile);
            } catch (error) {
                console.error('Error fetching profile pic:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (loggedInAlumni) {
            fetchProfilePic();
        }
    }, [loggedInAlumni]);

    const handleLogout = async () => {
        try {
            const accessToken = await getAccessToken()
            const refreshToken = await getRefreshToken()

            if (!accessToken || !refreshToken) {
                throw new Error('Missing authentication tokens');
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/alumnis/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            })

            if (!response.ok) {
                const error = await response.text()
                throw new Error('Failed to log out: ', error)
            }

            const result = await response.json()

            if (result.statusCode === 200) {
                await alumniLogout()
                await removeAccessToken()
                await removeRefreshToken()

                router.replace("/");

                setTimeout(() => {
                    BackHandler.addEventListener('hardwareBackPress', () => true);
                }, 100);
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
            console.error('Error logging out:', error?.message);
            setAlertConfig({
                header: "Error logging out",
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
    };

    const confirmLogout = async () => {
        setAlertConfig({
            header: "Log Out",
            message: "Are you sure you want to log out?",
            buttons: [
                {
                    text: "Cancel",
                    onPress: () => setAlertVisible(false),
                    style: "cancel"
                },
                {
                    text: "Logout",
                    onPress: handleLogout,
                    style: "destructive"
                },
            ]
        });
        setAlertVisible(true);
    };

    const handleToggleDarkMode = () => {
        setDarkModeEnabled(!darkModeEnabled);
        toggleTheme()
    };

    const getDynamicStyles = (currentTheme) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme === 'light' ? "#f0f0f0" : "#1a012c",
        },
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme === 'light' ? "#e0e0e0" : '#390852',
            marginTop: 15
        },
        headerTitle: {
            color: currentTheme === 'light' ? "#6a0dad" : '#C92EFF',
            fontSize: 20,
            fontWeight: 'bold',
        },
        profileCard: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: currentTheme === 'light' ? "#ffffff" : '#2d0a41',
            marginHorizontal: 15,
            marginTop: 20,
            padding: 20,
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
        profileName: {
            color: currentTheme === 'light' ? "#333" : '#fff',
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 2,
        },
        profileEmail: {
            color: currentTheme === 'light' ? "#666" : '#b388e9',
            fontSize: 14,
            marginBottom: 5,
        },
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: currentTheme === 'light' ? "#ffffff" : '#2d0a41',
            marginHorizontal: 15,
            marginTop: 15,
            padding: 15,
            borderRadius: 15,
        },
        statValue: {
            color: currentTheme === 'light' ? "#333" : '#fff',
            fontSize: 24,
            fontWeight: 'bold',
        },
        statLabel: {
            color: currentTheme === 'light' ? "#666" : '#b388e9',
            fontSize: 14,
            marginTop: 5,
        },
        statDivider: {
            width: 1,
            height: '80%',
            backgroundColor: currentTheme === 'light' ? "#e0e0e0" : '#390852',
        },
        settingsGroupTitle: {
            color: currentTheme === 'light' ? "#6a0dad" : '#C92EFF',
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 10,
            paddingLeft: 5,
        },
        settingsItem: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: currentTheme === 'light' ? "#ffffff" : '#2d0a41',
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderRadius: 10,
            marginBottom: 10,
        },
        settingsItemText: {
            flex: 1,
            color: currentTheme === 'light' ? "#333" : '#fff',
            fontSize: 16,
        },
        versionText: {
            color: currentTheme === 'light' ? "#666" : '#777',
            fontSize: 14,
        }
    });

    const dynamicStyles = getDynamicStyles(theme);

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
        <View style={dynamicStyles.container}>
            <View style={dynamicStyles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme === 'light' ? "#6a0dad" : "#C92EFF"} />
                </TouchableOpacity>
                <Text style={dynamicStyles.headerTitle}>Profile Settings</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Card */}
                <View style={dynamicStyles.profileCard}>
                    <View style={styles.profileImageContainer}>
                        {alumni.profilePic &&
                            <Image source={{ uri: alumni.profilePic }} style={{
                                width: 70,
                                height: 70,
                                borderRadius: 35,
                                resizeMode: 'cover',
                            }} />
                        }
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={dynamicStyles.profileName}>{alumni.name}</Text>
                        <Text style={dynamicStyles.profileEmail}>{alumni.email}</Text>
                        <Text style={dynamicStyles.profileEmail}>Batch - {alumni.batch}</Text>
                    </View>
                </View>

                {/* Profile Settings */}
                <View style={styles.settingsGroup}>
                    <Text style={dynamicStyles.settingsGroupTitle}>Profile</Text>

                    <TouchableOpacity
                        style={dynamicStyles.settingsItem}
                        onPress={() => router.push('/screens/Alumni Profile/ViewProfile')}
                    >
                        <View style={styles.settingsIconContainer}>
                            <FontAwesome name="user" size={20} color={theme === 'light' ? "#6a0dad" : "#fff"} />
                        </View>
                        <Text style={dynamicStyles.settingsItemText}>View Profile</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color={theme === 'light' ? "#666" : "#777"} />
                    </TouchableOpacity>
                </View>

                {/* App Settings */}
                <View style={styles.settingsGroup}>
                    <Text style={dynamicStyles.settingsGroupTitle}>App Settings</Text>

                    <View style={dynamicStyles.settingsItem}>
                        <View style={styles.settingsIconContainer}>
                            <Ionicons name="moon" size={22} color={theme === 'light' ? "#6a0dad" : "#fff"} />
                        </View>
                        <Text style={dynamicStyles.settingsItemText}>Dark Mode</Text>
                        <Switch
                            trackColor={{ false: "#3e3e3e", true: "rgba(201, 46, 255, 0.4)" }}
                            thumbColor={darkModeEnabled ? "#C92EFF" : "#f4f3f4"}
                            ios_backgroundColor="#3e3e3e"
                            onValueChange={handleToggleDarkMode}
                            value={darkModeEnabled}
                        />
                    </View>

                </View>

                {/* Additional Options */}
                <View style={styles.settingsGroup}>
                    <Text style={dynamicStyles.settingsGroupTitle}>Additional Options</Text>

                    <TouchableOpacity
                        style={dynamicStyles.settingsItem}
                        onPress={() => router.push("/screens/Profile/HelpAndSupport")}
                    >
                        <View style={styles.settingsIconContainer}>
                            <Ionicons name="help-circle" size={22} color={theme === 'light' ? "#6a0dad" : "#fff"} />
                        </View>
                        <Text style={dynamicStyles.settingsItemText}>Help & Support</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color={theme === 'light' ? "#666" : "#777"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={dynamicStyles.settingsItem}
                        onPress={() => router.push('/screens/Profile/PrivacyPolicy')}
                    >
                        <View style={styles.settingsIconContainer}>
                            <Ionicons name="shield-checkmark" size={22} color={theme === 'light' ? "#6a0dad" : "#fff"} />
                        </View>
                        <Text style={dynamicStyles.settingsItemText}>Privacy Policy</Text>
                        <MaterialIcons name="keyboard-arrow-right" size={24} color={theme === 'light' ? "#666" : "#777"} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={dynamicStyles.settingsItem}
                        onPress={confirmLogout}
                    >
                        <View style={[styles.settingsIconContainer, styles.logoutIconContainer]}>
                            <Ionicons name="log-out" size={22} color="#ff4d4d" />
                        </View>
                        <Text style={styles.logoutText}>Log Out</Text>
                    </TouchableOpacity>
                    <CustomAlert
                        visible={alertVisible}
                        header={alertConfig.header}
                        message={alertConfig.message}
                        buttons={alertConfig.buttons}
                        onClose={() => setAlertVisible(false)}
                    />
                </View>

                <View style={styles.versionContainer}>
                    <Text style={dynamicStyles.versionText}>Version 1.0.0</Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a012c",
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#390852',
        marginTop: 15
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#C92EFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d0a41',
        marginHorizontal: 15,
        marginTop: 20,
        padding: 20,
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
    profileImageContainer: {
        position: 'relative',
        marginRight: 15,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: '#C92EFF',
    },
    editAvatarButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#C92EFF',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    profileEmail: {
        color: '#b388e9',
        fontSize: 14,
        marginBottom: 5,
    },
    profileRole: {
        color: '#C92EFF',
        fontSize: 14,
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#2d0a41',
        marginHorizontal: 15,
        marginTop: 15,
        padding: 15,
        borderRadius: 15,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
    },
    statLabel: {
        color: '#b388e9',
        fontSize: 14,
        marginTop: 5,
    },
    statDivider: {
        width: 1,
        height: '80%',
        backgroundColor: '#390852',
    },
    settingsGroup: {
        marginTop: 25,
        marginHorizontal: 15,
    },
    settingsGroupTitle: {
        color: '#C92EFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingLeft: 5,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d0a41',
        paddingVertical: 15,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    settingsIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(201, 46, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingsItemText: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    logoutIconContainer: {
        backgroundColor: 'rgba(255, 77, 77, 0.1)',
    },
    logoutText: {
        flex: 1,
        color: '#ff4d4d',
        fontSize: 16,
        fontWeight: '500',
    },
    languageIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    languageText: {
        color: '#b388e9',
        fontSize: 14,
        marginRight: 5,
    },
    versionContainer: {
        alignItems: 'center',
        marginVertical: 30,
    },
    versionText: {
        color: '#777',
        fontSize: 14,
    },
    backButton: {
        padding: 5,
    },
    profileImageContainer: {
        position: 'relative',
        marginRight: 15,
    },
});

export default ProfileSettings;