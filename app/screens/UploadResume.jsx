import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Pressable,
    Platform,
    useWindowDimensions,
    Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import { getAccessToken, getRefreshToken } from "../../utils/tokenStorage.js";
import * as FileSystem from "expo-file-system";
import { useUser } from '../../context/userContext.js';
import CustomAlert from '../../components/CustomAlert.jsx';

const ResumeUploadScreen = () => {
    const { width, height } = useWindowDimensions();
    const [resumeFile, setResumeFile] = useState(null);
    const { theme } = useUser()
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    // Responsive sizing helper
    const getResponsiveSize = (size, dimension) => {
        const baseWidth = 375;
        return dimension === 'width'
            ? (size / baseWidth) * width
            : size;
    };

    const handleBackPress = () => {
        router.back();
    };

    const selectResume = async () => {
        setResumeFile(null)
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                return;
            }

            if (result.canceled || !result.assets?.length) {
                Alert.alert('Error', "No files selected. Please try again")
                return
            }

            const { uri, name, mimeType } = result?.assets[0];

            const resume = {
                uri,
                name,
                type: mimeType || 'application/pdf',
                size: result?.assets[0]?.size || 0,
            };

            setResumeFile(resume)

        } catch (error) {
            console.error("Error picking document:", error);
        }
    };

    const uploadResume = async (resumeFile) => {
        const accessToken = await getAccessToken()
        const refreshToken = await getRefreshToken()

        let resume = resumeFile
        if (resumeFile.uri.startsWith("data:application/pdf;base64,")) {
            const fileUri = `${FileSystem.cacheDirectory}${resumeFile.name}`;

            await FileSystem.writeAsStringAsync(fileUri, resumeFile.uri.split(",")[1], {
                encoding: FileSystem.EncodingType.Base64,
            });

            resume = {
                uri: fileUri,
                name: resumeFile.name,
                type: "application/pdf",
            };
        }

        const formData = new FormData()
        formData.append("resume", {
            uri: resume.uri,
            name: resume.name,
            type: 'application/pdf',
        });

        console.log([...formData.entries()]);


        try {

            const response = await FileSystem.uploadAsync(
                `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/users/upload-resume`,
                resume.uri,
                {
                    fieldName: "resume",
                    httpMethod: "PATCH",
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "x-refresh-token": refreshToken,
                    },
                }
            );

            const result = JSON.parse(response.body);
            console.log(result);

            if (result.statusCode === 200) {
                setAlertConfig({
                    header: "Success",
                    message: "Resume uploaded successfully!",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default"
                        }
                    ]
                });
                setAlertVisible(true);
            } else {
                setAlertConfig({
                    header: "Error",
                    message: result?.message || "Something went wrong. Please try again later",
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
            setAlertConfig({
                header: "Upload error",
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
            console.error('Error:', error?.message);
        }
    };

    const dynamicPadding = {
        horizontal: getResponsiveSize(16, 'width'),
        vertical: Math.min(getResponsiveSize(16, 'height'), 20)
    };

    const themeColor = theme === 'light' ? '#6A0DAD' : '#C92EFF';
    const backgroundColor = theme === 'light' ? '#F5F5F5' : '#14011F';
    const textColor = theme === 'light' ? '#333333' : '#fff';
    const secondaryTextColor = theme === 'light' ? '#666666' : 'rgba(255, 255, 255, 0.7)';
    const containerBgColor = theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(255, 255, 255, 0.08)';
    const containerBorderColor = theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const buttonGradientColors = theme === 'light'
        ? ['#6A0DAD', '#8324D4']
        : ['#C92EFF', '#9332FF'];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor }]}>
            <StatusBar barStyle={theme === 'light' ? "dark-content" : "light-content"} backgroundColor={backgroundColor} />

            {/* Background gradient */}
            <LinearGradient
                colors={theme === 'light' ? ['#F5F5F5', '#F0E8F8'] : ['#1D0A3F', '#14011F']}
                style={styles.backgroundGradient}
            />

            {/* Header */}
            <View style={[styles.header, { paddingHorizontal: dynamicPadding.horizontal }]}>
                <Pressable onPress={handleBackPress} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={textColor} />
                </Pressable>
                <Text style={[styles.headerText, { color: textColor }]}>Resume Analysis</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                {/* Upload Section */}
                <View style={[styles.uploadSection, { marginHorizontal: dynamicPadding.horizontal }]}>
                    {!resumeFile ? (
                        <LinearGradient
                            colors={theme === 'light'
                                ? ['rgba(106, 13, 173, 0.08)', 'rgba(106, 13, 173, 0.03)']
                                : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
                            style={[styles.uploadArea, { borderColor: containerBorderColor }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={[styles.uploadIconContainer, {
                                backgroundColor: theme === 'light'
                                    ? 'rgba(106, 13, 173, 0.2)'
                                    : 'rgba(201, 46, 255, 0.2)'
                            }]}>
                                <FontAwesome5 name="file-upload" size={28} color={themeColor} />
                            </View>
                            <Text style={[styles.uploadTitle, { color: textColor }]}>Upload Your Resume</Text>
                            <Text style={[styles.uploadText, { color: secondaryTextColor }]}>
                                Upload your resume to analyze its effectiveness with Applicant Tracking Systems (ATS).
                            </Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={selectResume}>
                                <LinearGradient
                                    colors={buttonGradientColors}
                                    style={styles.uploadButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={styles.uploadButtonIcon} />
                                    <Text style={styles.uploadButtonText}>Select File</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={[styles.supportedText, {
                                color: theme === 'light' ? 'rgba(106, 13, 173, 0.5)' : 'rgba(255, 255, 255, 0.5)'
                            }]}>Supported formats: PDF</Text>
                        </LinearGradient>
                    ) : (
                        <LinearGradient
                            colors={theme === 'light'
                                ? ['rgba(106, 13, 173, 0.08)', 'rgba(106, 13, 173, 0.03)']
                                : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)']}
                            style={[styles.filePreview, { borderColor: containerBorderColor }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <View style={styles.fileHeader}>
                                <View style={[styles.fileIconContainer, {
                                    backgroundColor: theme === 'light'
                                        ? 'rgba(106, 13, 173, 0.2)'
                                        : 'rgba(201, 46, 255, 0.2)'
                                }]}>
                                    <Ionicons
                                        name={resumeFile.name.endsWith('.pdf') ? "document-text" : "document"}
                                        size={28}
                                        color={themeColor}
                                    />
                                </View>
                                <View style={styles.fileInfo}>
                                    <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1} ellipsizeMode="middle">
                                        {resumeFile.name}
                                    </Text>
                                    <Text style={[styles.fileSize, { color: secondaryTextColor }]}>
                                        {(resumeFile.size / 1024).toFixed(1)} KB
                                    </Text>
                                </View>
                                <View style={styles.buttonContainer}>
                                    <TouchableOpacity
                                        style={[styles.replaceButton, {
                                            backgroundColor: theme === 'light'
                                                ? 'rgba(106, 13, 173, 0.1)'
                                                : 'rgba(255, 255, 255, 0.1)'
                                        }]}
                                        onPress={selectResume}
                                    >
                                        <Text style={[styles.replaceButtonText, { color: textColor }]}>Replace</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.replaceButton, {
                                            backgroundColor: theme === 'light'
                                                ? 'rgba(106, 13, 173, 0.1)'
                                                : 'rgba(255, 255, 255, 0.1)'
                                        }]}
                                        onPress={uploadResume.bind(null, resumeFile)}
                                    >
                                        <Text style={[styles.replaceButtonText, { color: textColor }]}>Upload</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </LinearGradient>
                    )}
                </View>

                <CustomAlert
                    visible={alertVisible}
                    header={alertConfig.header}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                    onClose={() => setAlertVisible(false)}
                />

            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backgroundGradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 50 : 10,
        paddingBottom: 16,
        marginTop: 15,
    },
    backButton: {
        padding: 8,
        marginTop: 30
    },
    headerText: {
        fontSize: 30,
        fontWeight: 'bold',
        marginTop: 30,
    },
    scrollView: {
        flex: 1,
    },
    uploadSection: {
        marginVertical: 16,
    },
    uploadArea: {
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    uploadTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    uploadText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    uploadButton: {
        borderRadius: 30,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        marginBottom: 16,
    },
    uploadButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 25,
    },
    uploadButtonIcon: {
        marginRight: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    supportedText: {
        fontSize: 14,
    },
    filePreview: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
    },
    fileHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    fileSize: {
        fontSize: 14,
    },
    replaceButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    replaceButtonText: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'center'
    },
    buttonContainer: {
        flex: 0.5,
        flexDirection: 'column',
        rowGap: 10,
        justifyContent: 'flex-end',
        alignContent: 'center'
    }
});

export default ResumeUploadScreen;