import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAccessToken, getRefreshToken } from '../../../utils/tokenStorage.js';
import { router } from 'expo-router';
import CustomAlert from '../../../components/CustomAlert.jsx';

const ChangePasswordPage = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState({
        new: false,
        confirm: false
    });
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const togglePasswordVisibility = (field) => {
        setIsPasswordVisible(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password should be atleast 6 characters long')
            return;
        }

        if (confirmPassword.length < 6) {
            Alert.alert('Error', 'Password should be atleast 6 characters long')
            return;
        }

        try {
            const accessToken = await getAccessToken()
            const refreshToken = await getRefreshToken()
            if (!accessToken || !refreshToken) {
                Alert.alert('Error', "Tokens not found, Please login again")
                return
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/admins/change-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                },
                body: JSON.stringify({ newPassword })
            })

            const result = await response.json()
            if (result.statusCode === 200) {
                setAlertConfig({
                    header: "Success",
                    message: "Password changed successfully",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default"
                        }
                    ]
                });
                setAlertVisible(true)
                setNewPassword("")
                setConfirmPassword("")
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
            console.error(error)
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
    }


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#C92EFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 24 }}>{/* Placeholder for symmetry */}</View>
            </View>

            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />

            {/* Password Form */}
            <View style={styles.formContainer}>
                {/* New Password Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>New Password</Text>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                            <Ionicons name="key-outline" size={20} color="#C92EFF" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter new password"
                            placeholderTextColor="#b388e9"
                            secureTextEntry={!isPasswordVisible.new}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TouchableOpacity
                            onPress={() => togglePasswordVisibility('new')}
                            style={styles.eyeIconContainer}
                        >
                            <Ionicons
                                name={isPasswordVisible.new ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#C92EFF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Confirm New Password Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Confirm New Password</Text>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                            <Ionicons name="checkmark-done-outline" size={20} color="#C92EFF" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm new password"
                            placeholderTextColor="#b388e9"
                            secureTextEntry={!isPasswordVisible.confirm}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        <TouchableOpacity
                            onPress={() => togglePasswordVisibility('confirm')}
                            style={styles.eyeIconContainer}
                        >
                            <Ionicons
                                name={isPasswordVisible.confirm ? "eye-off-outline" : "eye-outline"}
                                size={20}
                                color="#C92EFF"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Change Password Button */}
                <TouchableOpacity
                    style={styles.changePasswordButton}
                    onPress={handleChangePassword}
                >
                    <Text style={styles.changePasswordButtonText}>Change Password</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
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
        marginTop: 20,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        color: '#C92EFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    formContainer: {
        paddingHorizontal: 15,
        marginTop: 30,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#C92EFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        paddingLeft: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d0a41',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    inputIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(201, 46, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    input: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
    },
    eyeIconContainer: {
        padding: 5,
    },
    changePasswordButton: {
        backgroundColor: '#C92EFF',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
        marginTop: 20,
    },
    changePasswordButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ChangePasswordPage;