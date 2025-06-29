import React, { useState } from 'react';
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
    Alert,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import * as DocumentPicker from 'expo-document-picker';
import { getAccessToken, getRefreshToken } from "../../../utils/tokenStorage.js";
import * as FileSystem from "expo-file-system";
import { useUser } from '../../../context/userContext.js';
import CustomAlert from '../../../components/CustomAlert.jsx';

const CustomDropdown = ({ options, selectedValue, onSelect, placeholder, style, zIndex, theme }) => {
    const [isOpen, setIsOpen] = useState(false);

    const textColor = theme === 'light' ? '#333333' : '#fff';
    const backgroundColor = theme === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 30, 50, 0.8)';
    const borderColor = theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const highlightColor = theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(201, 46, 255, 0.2)';

    return (
        <View style={[{ zIndex }, style]}>
            <TouchableOpacity
                style={[styles.dropdownBox, {
                    backgroundColor: backgroundColor,
                    borderColor: borderColor
                }]}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={{ color: textColor }}>
                    {selectedValue || placeholder}
                </Text>
                <FontAwesome name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={textColor} />
            </TouchableOpacity>

            {isOpen && (
                <View style={[styles.dropdownList, {
                    backgroundColor: backgroundColor,
                    borderColor: borderColor,
                    position: 'relative', // Changed from absolute to relative
                    marginTop: 4, // Add some space between the dropdown and the list
                }]}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[styles.dropdownItem, {
                                backgroundColor: selectedValue === option.value ? highlightColor : 'transparent'
                            }]}
                            onPress={() => {
                                onSelect(option.value);
                                setIsOpen(false);
                            }}
                        >
                            <Text style={{ color: textColor }}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const StudyMaterialUploadScreen = () => {
    const { width, height } = useWindowDimensions();
    const [pdfFile, setPdfFile] = useState(null);
    const { theme } = useUser();
    const [description, setDescription] = useState("");
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [fileName, setFileName] = useState("")
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const subjects = [
        { label: 'Operating System', value: 'Operating System' },
        { label: 'DBMS', value: 'DBMS' },
        { label: 'OOPS', value: 'OOPS' },
        { label: 'Computer Networks', value: 'Computer Networks' }
    ];

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

    const selectPdf = async () => {
        setPdfFile(null);
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true
            });

            if (result.canceled) {
                return;
            }

            if (result.canceled || !result.assets?.length) {
                Alert.alert('Error', "No files selected. Please try again");
                return;
            }

            const { uri, name, mimeType } = result?.assets[0];

            const pdf = {
                uri,
                name,
                type: mimeType || 'application/pdf',
                size: result?.assets[0]?.size || 0,
            };

            setPdfFile(pdf);

        } catch (error) {
            console.error("Error picking document:", error);
        }
    };

    const uploadStudyMaterial = async () => {
        // Validation checks
        if (!selectedSubject) {
            Alert.alert('Error', 'Please select a subject');
            return;
        }

        if (!pdfFile) {
            Alert.alert('Error', 'Please select a PDF file');
            return;
        }

        const accessToken = await getAccessToken();
        const refreshToken = await getRefreshToken();

        let pdf = pdfFile;
        if (pdfFile.uri.startsWith("data:application/pdf;base64,")) {
            const fileUri = `${FileSystem.cacheDirectory}${pdfFile.name}`;

            await FileSystem.writeAsStringAsync(fileUri, pdfFile.uri.split(",")[1], {
                encoding: FileSystem.EncodingType.Base64,
            });

            pdf = {
                uri: fileUri,
                name: pdfFile.name,
                type: "application/pdf",
            };
        }

        try {
            const response = await FileSystem.uploadAsync(
                `http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/cs-fundamentals/add-pdf`,
                pdf.uri,
                {
                    fieldName: "pdf",
                    httpMethod: "POST",
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                    parameters: {
                        subjectName: selectedSubject,
                        fileName: fileName,
                        description: description || "No description available"
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "x-refresh-token": refreshToken,
                    },
                }
            );

            const result = JSON.parse(response.body);

            if (result.statusCode === 201 || result.statusCode === 200) {
                setAlertConfig({
                    header: "Success",
                    message: "Uploaded successfully",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default"
                        }
                    ]
                });
                setAlertVisible(true)
                setPdfFile(null);
                setSelectedSubject(null);
                setDescription("");
                setFileName("")
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
            console.error('Error:', error.message);
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
    const inputBackgroundColor = theme === 'light'
        ? 'rgba(255, 255, 255, 0.8)'
        : 'rgba(30, 30, 50, 0.8)';

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
                <Text style={[styles.headerText, { color: textColor }]}>Upload Study Material</Text>
                <View style={{ width: 40 }} />
            </View>

            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Content Section */}
                <View style={[styles.contentSection, { marginHorizontal: dynamicPadding.horizontal }]}>

                    {/* Subject Selection */}
                    <Text style={[styles.sectionTitle, { color: textColor }]}>Subject</Text>
                    <CustomDropdown
                        options={subjects}
                        selectedValue={selectedSubject}
                        onSelect={(value) => setSelectedSubject(value)}
                        placeholder="Select a subject"
                        style={styles.dropdownContainer}
                        zIndex={1000}
                        theme={theme}
                    />

                    {/* Description */}
                    <Text style={[styles.sectionTitle, { color: textColor, marginTop: 16 }]}>Description</Text>
                    <TextInput
                        style={[styles.textInput, {
                            color: textColor,
                            backgroundColor: inputBackgroundColor,
                            borderColor: containerBorderColor,
                            minHeight: 120
                        }]}
                        placeholder="Write a brief description about this study material"
                        placeholderTextColor={secondaryTextColor}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                    />

                    {/* file name */}
                    <Text style={[styles.sectionTitle, { color: textColor, marginTop: 16 }]}>File Name</Text>
                    <TextInput
                        style={[styles.textInput, {
                            color: textColor,
                            backgroundColor: inputBackgroundColor,
                            borderColor: containerBorderColor,
                            height: 50
                        }]}
                        placeholder="Write file name"
                        placeholderTextColor={secondaryTextColor}
                        numberOfLines={1}
                        textAlignVertical="top"
                        value={fileName}
                        onChangeText={setFileName}
                    />

                    {/* Upload PDF Section */}
                    <Text style={[styles.sectionTitle, { color: textColor, marginTop: 16 }]}>Study Material PDF</Text>

                    {!pdfFile ? (
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
                                <FontAwesome5 name="file-pdf" size={28} color={themeColor} />
                            </View>
                            <Text style={[styles.uploadTitle, { color: textColor }]}>Upload Study Material</Text>
                            <Text style={[styles.uploadText, { color: secondaryTextColor }]}>
                                Upload a PDF file containing lecture notes, practice questions or study guides.
                            </Text>
                            <TouchableOpacity style={styles.uploadButton} onPress={selectPdf}>
                                <LinearGradient
                                    colors={buttonGradientColors}
                                    style={styles.uploadButtonGradient}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                >
                                    <Ionicons name="cloud-upload-outline" size={20} color="#fff" style={styles.uploadButtonIcon} />
                                    <Text style={styles.uploadButtonText}>Select PDF</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                            <Text style={[styles.supportedText, {
                                color: theme === 'light' ? 'rgba(106, 13, 173, 0.5)' : 'rgba(255, 255, 255, 0.5)'
                            }]}>Supported format: PDF only</Text>
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
                                        name="document-text"
                                        size={28}
                                        color={themeColor}
                                    />
                                </View>
                                <View style={styles.fileInfo}>
                                    <Text style={[styles.fileName, { color: textColor }]} numberOfLines={1} ellipsizeMode="middle">
                                        {pdfFile.name}
                                    </Text>
                                    <Text style={[styles.fileSize, { color: secondaryTextColor }]}>
                                        {(pdfFile.size / 1024).toFixed(1)} KB
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.replaceButton, {
                                        backgroundColor: theme === 'light'
                                            ? 'rgba(106, 13, 173, 0.1)'
                                            : 'rgba(255, 255, 255, 0.1)'
                                    }]}
                                    onPress={selectPdf}
                                >
                                    <Text style={[styles.replaceButtonText, { color: textColor }]}>Replace</Text>
                                </TouchableOpacity>
                            </View>
                        </LinearGradient>
                    )}

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={[styles.submitButton, { marginTop: 24 }]}
                        onPress={uploadStudyMaterial}
                        disabled={!pdfFile || !selectedSubject}
                    >
                        <LinearGradient
                            colors={buttonGradientColors}
                            style={[styles.submitButtonGradient, {
                                opacity: (!pdfFile || !selectedSubject) ? 0.6 : 1
                            }]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={styles.submitButtonText}>Upload Study Material</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
    contentSection: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
    },
    dropdownContainer: {
        marginBottom: 16,
    },
    dropdownBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 14,
        borderWidth: 1,
        borderRadius: 12,
        height: 50,
    },
    dropdownList: {
        borderWidth: 1,
        borderRadius: 12,
        maxHeight: 200,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    dropdownItem: {
        padding: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        // minHeight: 120,
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
    },
    submitButton: {
        borderRadius: 30,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    submitButtonGradient: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    }
});

export default StudyMaterialUploadScreen;