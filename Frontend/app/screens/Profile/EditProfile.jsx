import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../../context/userContext.js';
import * as yup from 'yup';
import { getAccessToken, getRefreshToken } from '../../../utils/tokenStorage.js';
import CustomAlert from '../../../components/CustomAlert.jsx';

const validationSchema = yup.object().shape({
    name: yup.string().required('Name is required'),
    email: yup.string()
        .email('Email must be a valid email')
        .matches(/@nitdelhi\.ac\.in$/, 'Email must be a NIT Delhi email')
        .required('Email is required'),
    rollNo: yup.string().length(9, 'Roll No must be of 9 digits').required('Roll Number is required'),
    mobileNo: yup.string()
        .matches(/^\+?[0-9]{10,15}$/, 'Mobile number must be between 10-15 digits')
        .required('Mobile Number is required'),
    semester: yup.number()
        .typeError('Semester must be a number')
        .min(1, 'Semester must be between 1-8')
        .max(8, 'Semester must be between 1-8')
        .required('Semester is required'),
    cgpa: yup.number()
        .typeError('CGPA must be a number')
        .min(0, 'CGPA must be between 0-10')
        .max(10, 'CGPA must be between 0-10')
        .required('CGPA is required'),
    branch: yup.string().required('Branch is required'),
    batch: yup.string().length(4, 'Batch must be of 4 digits').required('Batch is required')
});

const EditProfileScreen = () => {
    const navigation = useNavigation();
    const { user, login, theme } = useUser();
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const themeColors = {
        primary: theme === 'light' ? '#6A0DAD' : '#C92EFF',
        background: theme === 'light' ? '#F5F5F5' : '#1a0525',
        cardBackground: theme === 'light' ? '#FFFFFF' : '#2d0a41',
        cardBorder: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : '#390852',
        headerBackground: theme === 'light' ? '#F0E6F5' : '#2d0a41',
        inputBackground: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : '#390852',
        text: theme === 'light' ? '#333333' : '#fff',
        secondaryText: theme === 'light' ? '#666666' : '#b388e9',
        error: '#F44336',
    };

    const [profile, setProfile] = useState({
        name: '', email: '', rollNo: '', mobileNo: '', semester: '', cgpa: '', branch: '', batch: '',
    });
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    useEffect(() => {
        if (user) {
            setProfile({
                name: user.name || '',
                email: user.email || '',
                rollNo: String(user.rollNo) || '',
                mobileNo: String(user.mobileNo) || '',
                semester: user.semester ? String(user.semester) : '',
                cgpa: user.CGPA ? String(user.CGPA) : '',
                branch: user.branch || '',
                batch: String(user.batch) || '',
            });
        }
    }, [user]);

    const handleSave = async () => {
        try {
            setTouched(Object.keys(profile).reduce((acc, field) => ({ ...acc, [field]: true }), {}));
            await validationSchema.validate(profile, { abortEarly: false });
            await updateProfile(profile);
        } catch (validationError) {
            setErrors(validationError.inner.reduce((acc, err) => ({ ...acc, [err.path]: err.message }), {}));
        }
    };

    const updateProfile = async (newProfile) => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();
            if (!accessToken || !refreshToken)
                throw new Error("Tokens are required");

            const response = await fetch(`http:${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/users/update-details`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken,
                },
                body: JSON.stringify(newProfile)
            });

            if (!response.ok)
                throw new Error("Failed to update profile");

            const result = await response.json();

            if (result.statusCode === 200) {
                await login(result.data);
                setAlertConfig({
                    header: "Success",
                    message: "Profile updated successfully",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default"
                        }
                    ]
                });
                setAlertVisible(true)
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
            }
        } catch (error) {
            console.error('Error updating profile:', error?.message);
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
    };

    const handleInputChange = useCallback((field, value) => {
        setProfile(prev => ({ ...prev, [field]: value }));
        setTouched(prev => ({ ...prev, [field]: true }));
        validateField(field, value);
    }, []);

    const validateField = async (field, value) => {
        try {
            await yup.reach(validationSchema, field).validate(value);
            setErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (error) {
            setErrors(prev => ({ ...prev, [field]: error.message }));
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <View style={[styles.header, {
                    backgroundColor: themeColors.headerBackground,
                    borderBottomColor: themeColors.cardBorder
                }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color={themeColors.primary} />
                        <Text style={[styles.backButtonText, { color: themeColors.primary }]}>Back</Text>
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: themeColors.text }]}>Edit Profile</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={[styles.saveButtonText, { color: themeColors.primary }]}>Save</Text>
                    </TouchableOpacity>
                </View>

                <CustomAlert
                    visible={alertVisible}
                    header={alertConfig.header}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                    onClose={() => setAlertVisible(false)}
                />

                <ScrollView style={styles.scrollView}>
                    <View style={[styles.card, {
                        backgroundColor: themeColors.cardBackground,
                        borderColor: themeColors.cardBorder,
                        shadowColor: theme === 'light' ? "#6A0DAD" : "#000",
                        borderWidth: theme === 'light' ? 1 : 0,
                    }]}>
                        {Object.entries({
                            name: "Full Name", email: "Email Address", rollNo: "Roll Number", mobileNo: "Mobile Number",
                            semester: "Semester", cgpa: "CGPA", branch: "Branch", batch: "Batch"
                        }).map(([field, label]) => (
                            <View key={field} style={styles.fieldContainer}>
                                <Text style={[styles.fieldLabel, { color: themeColors.secondaryText }]}>
                                    {label}
                                </Text>
                                <TextInput
                                    style={[
                                        styles.textInput,
                                        {
                                            backgroundColor: themeColors.inputBackground,
                                            color: themeColors.text,
                                            borderColor: touched[field] && errors[field] ? themeColors.error : 'transparent',
                                            borderWidth: touched[field] && errors[field] ? 1 : 0,
                                        }
                                    ]}
                                    value={profile[field]}
                                    onChangeText={(text) => handleInputChange(field, text)}
                                    placeholder={`Enter ${label.toLowerCase()}`}
                                    placeholderTextColor={themeColors.secondaryText}
                                    keyboardType={field === 'email' ? 'email-address' : field === 'cgpa' || field === 'semester' ? 'numeric' : 'default'}
                                />
                                {touched[field] && errors[field] ?
                                    <Text style={[styles.errorText, { color: themeColors.error }]}>
                                        {errors[field]}
                                    </Text>
                                    : null}
                            </View>
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: themeColors.primary }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonText}>Save Changes</Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        marginTop: 25
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButtonText: {
        marginLeft: 4,
        fontSize: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
        marginTop: 10
    },
    card: {
        borderRadius: 15,
        padding: 16,
        marginHorizontal: 15,
        marginBottom: 16,
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        elevation: 6,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        marginBottom: 8,
    },
    textInput: {
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    errorText: {
        fontSize: 12,
        marginTop: 4,
    },
    button: {
        borderRadius: 15,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 15,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default EditProfileScreen;