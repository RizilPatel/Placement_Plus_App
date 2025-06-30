import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import {
    Ionicons,
    FontAwesome,
    MaterialCommunityIcons,
    FontAwesome5
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DropDownPicker from 'react-native-dropdown-picker';
import { useUser } from "../../../context/userContext.js";
import { getAccessToken, getRefreshToken } from "../../../utils/tokenStorage.js";
import CustomAlert from "../../../components/CustomAlert.jsx";

const InputField = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    secureTextEntry,
    multiline = false,
    hasError = false,
    errorMessage = "",
    required = false,
    theme = 'dark'
}) => (
    <View style={styles.fieldContainer}>
        <LinearGradient
            colors={theme === 'light' ? ['#f0f0ff', '#e0e0ff'] : ['#1C1235', '#2A1F3D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.inputContainer,
                hasError && styles.inputError,
                multiline && styles.multilineContainer
            ]}
        >
            <FontAwesome
                name={icon}
                size={20}
                color={theme === 'light' ? '#6A0DAD' : '#999'}
                style={styles.inputIcon}
            />
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multilineInput,
                    { color: theme === 'light' ? '#333333' : 'white' }
                ]}
                placeholder={required ? `${placeholder} *` : placeholder}
                placeholderTextColor={theme === 'light' ? '#888' : '#aaa'}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
            />
        </LinearGradient>
        {hasError && (
            <Text style={styles.errorText}>{errorMessage}</Text>
        )}
    </View>
);

const AddPracticeQuestionScreen = () => {
    const { theme } = useUser()
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })
    const [formData, setFormData] = useState({
        questionName: "",
        description: "",
        difficulty: "Easy",
        questionLink: "",
        companyName: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [openDifficulty, setOpenDifficulty] = useState(false);

    const difficultyOptions = [
        { label: "Easy", value: "Easy" },
        { label: "Medium", value: "Medium" },
        { label: "Hard", value: "Hard" },
    ];

    const handleChange = (field, value) => {
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = () => {
        let newErrors = {};

        if (!formData.questionName.trim()) {
            newErrors.questionName = "Question name is required";
        }

        if (!formData.description.trim()) {
            newErrors.description = "Description is required";
        } else if (formData.description.trim().length < 10) {
            newErrors.description = "Description should be at least 10 characters";
        }

        if (!formData.difficulty) {
            newErrors.difficulty = "Please select a difficulty level";
        }

        if (!formData.questionLink.trim()) {
            newErrors.questionLink = "Question link is required";
        } else if (!/^https?:\/\/.+/.test(formData.questionLink)) {
            newErrors.questionLink = "Please enter a valid URL starting with http:// or https://";
        }

        if (!formData.companyName.trim()) {
            newErrors.companyName = "Company name is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            Alert.alert("Error", "Please correct the errors in the form");
            return;
        }

        setIsSubmitting(true);

        try {

            const form = {
                name: formData.questionName,
                description: formData.description,
                difficulty: formData.difficulty,
                link: formData.questionLink,
                companyName: formData.companyName
            }

            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken()
            if (!accessToken || !refreshToken) {
                Alert.alert("Error", "Tokens are required. Please login again")
                return
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/questions/add-question`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form)
            })

            const result = await response.json()
            // console.log(result);

            if (result.statusCode === 200) {
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
                setFormData({
                    questionName: "",
                    description: "",
                    difficulty: "Easy",
                    questionLink: "",
                    companyName: "",
                })
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
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: theme === 'light' ? '#F5F5F5' : '#0D021F' }
        ]}>
            <StatusBar
                barStyle={theme === 'light' ? "dark-content" : "light-content"}
                backgroundColor={theme === 'light' ? '#F5F5F5' : '#0D021F'}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardContainer}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={theme === 'light' ? '#6A0DAD' : 'white'}
                            />
                        </TouchableOpacity>
                        <Text style={[
                            styles.welcomeTitle,
                            { color: theme === 'light' ? '#333333' : 'white' }
                        ]}>
                            Add <Text style={[
                                styles.accentText,
                                { color: theme === 'light' ? '#6A0DAD' : '#C92EFF' }
                            ]}>Practice Question</Text>
                        </Text>
                    </View>

                    <CustomAlert
                        visible={alertVisible}
                        header={alertConfig.header}
                        message={alertConfig.message}
                        buttons={alertConfig.buttons}
                        onClose={() => setAlertVisible(false)}
                    />

                    {/* Description Card */}
                    <LinearGradient
                        colors={theme === 'light'
                            ? ['#e6f7ff', '#c2e0ff']
                            : ['#1C1235', '#2A1F3D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.descriptionCard}
                    >
                        <View style={styles.cardContent}>
                            <View style={[
                                styles.iconContainer,
                                {
                                    backgroundColor: theme === 'light'
                                        ? 'rgba(106, 13, 173, 0.1)'
                                        : 'rgba(255, 255, 255, 0.15)'
                                }
                            ]}>
                                <FontAwesome5
                                    name="code"
                                    size={24}
                                    color={theme === 'light' ? '#6A0DAD' : 'white'}
                                />
                            </View>
                            <View style={styles.cardTextContent}>
                                <Text style={[
                                    styles.cardTitle,
                                    { color: theme === 'light' ? '#333333' : 'white' }
                                ]}>
                                    Enhance Your Collection
                                </Text>
                                <Text style={[
                                    styles.formDescription,
                                    { color: theme === 'light' ? '#666' : '#ccc' }
                                ]}>
                                    Add a new coding practice question to your personal collection
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Question Name */}
                        <InputField
                            icon="question-circle"
                            placeholder="Question Name"
                            value={formData.questionName}
                            onChangeText={(text) => handleChange("questionName", text)}
                            hasError={!!errors.questionName}
                            errorMessage={errors.questionName}
                            required
                            theme={theme}
                        />

                        {/* Description */}
                        <InputField
                            icon="align-left"
                            placeholder="Description"
                            value={formData.description}
                            onChangeText={(text) => handleChange("description", text)}
                            multiline
                            hasError={!!errors.description}
                            errorMessage={errors.description}
                            required
                            theme={theme}
                        />

                        {/* Dropdowns Container */}
                        <View style={styles.dropdownsContainer}>
                            {/* Difficulty Dropdown */}
                            <View style={[styles.dropdownWrapper, { zIndex: 3000 }]}>
                                <Text style={[
                                    styles.label,
                                    { color: theme === 'light' ? '#333333' : 'white' }
                                ]}>
                                    Difficulty *
                                </Text>
                                <DropDownPicker
                                    listMode="SCROLLVIEW"
                                    open={openDifficulty}
                                    value={formData.difficulty}
                                    items={difficultyOptions}
                                    setOpen={setOpenDifficulty}
                                    setValue={(callback) => {
                                        const value = callback(formData.difficulty);
                                        handleChange("difficulty", value);
                                    }}
                                    style={[
                                        styles.dropdown,
                                        {
                                            backgroundColor: theme === 'light' ? '#f0f0ff' : '#1C1235',
                                            borderColor: theme === 'light' ? '#d0d0ff' : '#2A1F3D',
                                            borderWidth: errors.difficulty ? 1 : 0,
                                            borderColor: errors.difficulty ? '#FF375F' : 'transparent'
                                        }
                                    ]}
                                    dropDownContainerStyle={{
                                        backgroundColor: theme === 'light' ? '#f0f0ff' : '#1C1235',
                                        borderColor: theme === 'light' ? '#d0d0ff' : '#2A1F3D',
                                    }}
                                    textStyle={{
                                        color: theme === 'light' ? '#333333' : 'white',
                                        fontSize: 16
                                    }}
                                    labelStyle={{
                                        color: theme === 'light' ? '#333333' : 'white',
                                    }}
                                />
                                {errors.difficulty && (
                                    <Text style={styles.errorText}>{errors.difficulty}</Text>
                                )}
                            </View>
                        </View>

                        {/* Question Link */}
                        <InputField
                            icon="link"
                            placeholder="Question Link"
                            value={formData.questionLink}
                            onChangeText={(text) => handleChange("questionLink", text)}
                            keyboardType="url"
                            hasError={!!errors.questionLink}
                            errorMessage={errors.questionLink}
                            required
                            theme={theme}
                        />

                        {/* Company Name with Suggestions */}
                        <View style={styles.fieldContainer}>
                            <InputField
                                icon="building"
                                placeholder="Company Name"
                                value={formData.companyName}
                                onChangeText={(text) => handleChange("companyName", text)}
                                hasError={!!errors.companyName}
                                errorMessage={errors.companyName}
                                required
                                theme={theme}
                            />

                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isSubmitting && styles.disabledButton,
                                {
                                    backgroundColor: theme === 'light'
                                        ? '#6A0DAD'
                                        : '#C92EFF'
                                }
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>ADD QUESTION</Text>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginLeft: 10,
    },
    accentText: {
        fontWeight: "bold",
    },
    descriptionCard: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    cardContent: {
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    cardTextContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    formDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 4,
    },
    formContainer: {
        marginTop: 10,
    },
    fieldContainer: {
        width: "100%",
        marginBottom: 15,
        position: "relative",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        width: "100%",
    },
    multilineContainer: {
        alignItems: "flex-start",
    },
    inputIcon: {
        marginRight: 10,
        marginTop: Platform.OS === "ios" ? 0 : 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: "top",
    },
    dropdownsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },
    dropdownWrapper: {
        width: "48%",
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
    },
    dropdown: {
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    inputError: {
        borderWidth: 1,
        borderColor: "#FF375F",
    },
    errorText: {
        color: "#FF375F",
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    suggestionContainer: {
        maxHeight: 150,
        borderRadius: 10,
        marginTop: 5,
        position: "absolute",
        top: "100%",
        width: "100%",
        zIndex: 10,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    suggestionItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    suggestionText: {
        fontSize: 14,
    },
    submitButton: {
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 30,
        elevation: 3,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        marginRight: 8,
    },
});

export default AddPracticeQuestionScreen;