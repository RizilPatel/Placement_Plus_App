import React from 'react';
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '../../../context/userContext.js';
import { getAccessToken, getRefreshToken } from '../../../utils/tokenStorage.js'
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { encode } from 'base64-arraybuffer';
import * as IntentLauncher from 'expo-intent-launcher';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function ExportPage() {
    const { theme, admin } = useUser()

    const handleExportPDF = async () => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();
            if (!accessToken || !refreshToken) {
                Alert.alert('Error', "Tokens are required. Please login again");
                return;
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/admins/export-to-pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const arrayBuffer = await response.arrayBuffer();
            const base64Data = encode(arrayBuffer);
            const fileUri = FileSystem.documentDirectory + 'exported_data.pdf';

            await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 })

            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                Alert.alert('Error', "File saving failed");
                return;
            }

            if (Platform.OS === 'android') {
                const contentUri = await FileSystem.getContentUriAsync(fileUri);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    type: 'application/pdf',
                    flags: 1
                });
            } else {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/pdf',
                    dialogTitle: 'Open Excel File With...'
                });
            }

        } catch (error) {
            Alert.alert('Error', error?.message || "Something went wrong. Please try again later");
            console.log("error: ", error?.message);
        }
    };

    const handleExportExcel = async () => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();
            if (!accessToken || !refreshToken) {
                Alert.alert('Error', "Tokens are required. Please login again");
                return;
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/admins/export-to-excel`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const arrayBuffer = await response.arrayBuffer();
            const base64Data = encode(arrayBuffer);
            const fileUri = FileSystem.documentDirectory + 'exported_data.xlsx';

            await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 })

            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                Alert.alert('Error', "File saving failed");
                return;
            }

            if (Platform.OS === 'android') {
                const contentUri = await FileSystem.getContentUriAsync(fileUri);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    flags: 1
                });
            } else {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: 'Open Excel File With...'
                });
            }

        } catch (error) {
            Alert.alert('Error', error?.message || "Something went wrong. Please try again later");
            console.log("error: ", error?.message);
        }
    };

    const getDynamicStyles = (currentTheme) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme === 'light' ? "#F5F5F5" : "#14011F",
        },
        backgroundGradient: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
        headerContainer: {
            paddingHorizontal: 16,
            paddingTop: Platform.OS === 'android' ? 33 : 10,
            paddingBottom: 16,
            borderBottomWidth: currentTheme === 'light' ? 1 : 0,
            borderBottomColor: currentTheme === 'light' ? "#E0E0E0" : "transparent",
        },
        headerText: {
            color: currentTheme === 'light' ? "#6A0DAD" : "white",
            fontSize: 24,
            fontWeight: "bold",
            marginTop: 30
        },
        subtitle: {
            color: currentTheme === 'light' ? "#666666" : "#BBB",
            fontSize: 16,
            marginTop: 4,
        },
        contentContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
        },
        buttonContainer: {
            width: '100%',
            marginBottom: 20,
        },
        exportButton: {
            borderRadius: 16,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: currentTheme === 'light' ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.1)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        buttonGradient: {
            paddingVertical: 16,
            paddingHorizontal: 20,
        },
        buttonContent: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
        },
        buttonIcon: {
            marginRight: 12,
        },
        buttonText: {
            fontSize: 18,
            fontWeight: '600',
            color: 'white',
        },
    });

    const dynamicStyles = getDynamicStyles(theme);

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <LinearGradient
                colors={theme === 'dark'
                    ? ['#1D0A3F', '#14011F']
                    : ['#FFFFFF', '#F5F5F5']
                }
                style={dynamicStyles.backgroundGradient}
            />

            <View style={dynamicStyles.headerContainer}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={dynamicStyles.headerText}>Export Placement Data</Text>
                <Text style={dynamicStyles.subtitle}>Choose your export format</Text>
            </View>

            <View style={dynamicStyles.contentContainer}>
                <View style={dynamicStyles.buttonContainer}>
                    <Pressable
                        style={dynamicStyles.exportButton}
                        onPress={handleExportPDF}
                        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
                    >
                        <LinearGradient
                            colors={['#C92EFF', '#9332FF']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={dynamicStyles.buttonGradient}
                        >
                            <View style={dynamicStyles.buttonContent}>
                                <MaterialCommunityIcons
                                    name="file-pdf-box"
                                    size={28}
                                    color="white"
                                    style={dynamicStyles.buttonIcon}
                                />
                                <Text style={dynamicStyles.buttonText}>Export to PDF</Text>
                            </View>
                        </LinearGradient>
                    </Pressable>
                </View>

                <View style={dynamicStyles.buttonContainer}>
                    <Pressable
                        style={dynamicStyles.exportButton}
                        onPress={handleExportExcel}
                        android_ripple={{ color: 'rgba(255, 255, 255, 0.2)' }}
                    >
                        <LinearGradient
                            colors={['#1DA565', '#0D8951']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={dynamicStyles.buttonGradient}
                        >
                            <View style={dynamicStyles.buttonContent}>
                                <MaterialCommunityIcons
                                    name="file-excel-box"
                                    size={28}
                                    color="white"
                                    style={dynamicStyles.buttonIcon}
                                />
                                <Text style={dynamicStyles.buttonText}>Export to Excel</Text>
                            </View>
                        </LinearGradient>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}