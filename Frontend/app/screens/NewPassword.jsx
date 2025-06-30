import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SimpleLineIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import CustomAlert from "../../components/CustomAlert.jsx";

const ResetPasswordScreen = () => {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const handleBlur = (field) => {
        setTouchedFields({
            ...touchedFields,
            [field]: true,
        });
    };

    const handleResetPassword = async () => {
        if (!newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Both Passwords do not match');
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

        Keyboard.dismiss();

        setIsLoading(true);
        console.log(newPassword);


        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/users/reset-password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email,
                    password: newPassword
                })
            });

            const result = await response.json();

            if (result.statusCode === 200) {
                setIsSuccess(true);
                setAlertConfig({
                    header: "Success",
                    message: "Resume uploaded successfully!",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => {
                                setAlertVisible(false)
                            },
                            style: "default"
                        }
                    ]
                });
                setAlertVisible(true);
                // router.replace("userloginsign/login")
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
                header: "Upload Error",
                message: error?.message || "Something went wrong. Please try again later",
                buttons: [
                    {
                        text: "OK",
                        onPress: () => setAlertVisible(false),
                        style: "default"
                    }
                ]
            });
            setAlertVisible(true);
            console.error('Error:', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
                colors={['#0D021F', '#1E0442']}
                style={styles.container}
            >
                <CustomAlert
                    visible={alertVisible}
                    header={alertConfig.header}
                    message={alertConfig.message}
                    buttons={alertConfig.buttons}
                    onClose={() => setAlertVisible(false)}
                />
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardView}
                >
                    <Pressable
                        style={styles.backButton}
                        onPress={() => router.back()}
                        hitSlop={20}
                    >
                        <Feather name="arrow-left" size={24} color="white" />
                    </Pressable>

                    <View style={styles.contentContainer}>
                        {!isSuccess ? (
                            <>
                                <Text style={styles.title}>
                                    Reset <Text style={styles.highlight}>Password</Text>
                                </Text>

                                <Text style={styles.subtitle}>
                                    Create a new password for your account
                                </Text>

                                {/* Password Field */}
                                <View style={[
                                    styles.inputContainer,
                                    touchedFields.password && errors.password ? styles.inputError : null
                                ]}>
                                    <SimpleLineIcons name="lock" size={20} color={touchedFields.password && errors.password ? "#FF6B6B" : "#9D8ACE"} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="New Password"
                                        placeholderTextColor="#9D8ACE"
                                        secureTextEntry={!showPassword}
                                        value={newPassword}
                                        onChangeText={(text) => setNewPassword(text)}
                                        onBlur={() => handleBlur("password")}
                                        autoCapitalize="none"
                                    />
                                    <Pressable
                                        onPress={() => setShowPassword(!showPassword)}
                                        hitSlop={10}
                                    >
                                        <Feather
                                            name={showPassword ? "eye-off" : "eye"}
                                            size={20}
                                            color="#9D8ACE"
                                        />
                                    </Pressable>
                                </View>
                                {touchedFields.password && errors.password && (
                                    <Text style={styles.errorText}>{errors.password}</Text>
                                )}

                                {/* Confirm Password Field */}
                                <View style={[
                                    styles.inputContainer,
                                    touchedFields.confirmPassword && errors.confirmPassword ? styles.inputError : null
                                ]}>
                                    <SimpleLineIcons name="lock" size={20} color={touchedFields.confirmPassword && errors.confirmPassword ? "#FF6B6B" : "#9D8ACE"} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Confirm Password"
                                        placeholderTextColor="#9D8ACE"
                                        secureTextEntry={!showConfirmPassword}
                                        value={confirmPassword}
                                        onChangeText={(text) => setConfirmPassword(text)}
                                        onBlur={() => handleBlur("confirmPassword")}
                                        autoCapitalize="none"
                                    />
                                    <Pressable
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                        hitSlop={10}
                                    >
                                        <Feather
                                            name={showConfirmPassword ? "eye-off" : "eye"}
                                            size={20}
                                            color="#9D8ACE"
                                        />
                                    </Pressable>
                                </View>
                                {touchedFields.confirmPassword && errors.confirmPassword && (
                                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                                )}

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.buttonContainer,
                                        pressed && styles.buttonPressed
                                    ]}
                                    onPress={handleResetPassword}
                                    disabled={isLoading}
                                >
                                    <LinearGradient
                                        colors={['#C92EFF', '#8E24F8']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.button}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text style={styles.buttonText}>RESET PASSWORD</Text>
                                        )}
                                    </LinearGradient>
                                </Pressable>
                            </>
                        ) : (
                            <View style={styles.successContainer}>
                                <MaterialIcons name="check-circle" size={80} color="#4CD964" style={styles.successIcon} />
                                <Text style={styles.successText}>Password Reset Successful!</Text>
                                <Text style={styles.successSubtext}>
                                    Your password has been successfully updated. You can now login with your new password.
                                </Text>
                                <Pressable
                                    style={({ pressed }) => [
                                        styles.buttonContainer,
                                        pressed && styles.buttonPressed,
                                        { marginTop: 30 }
                                    ]}
                                    onPress={() => router.replace("userloginsign/login")}
                                >
                                    <LinearGradient
                                        colors={['#C92EFF', '#8E24F8']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.button}
                                    >
                                        <Text style={styles.buttonText}>LOGIN</Text>
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    backButton: {
        position: "absolute",
        top: 50,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(28, 18, 53, 0.7)",
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 42,
        fontWeight: "bold",
        color: "white",
        textAlign: "center",
        marginBottom: 20,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    subtitle: {
        fontSize: 16,
        color: "#9D8ACE",
        textAlign: "center",
        marginBottom: 30,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
        paddingHorizontal: 20,
    },
    highlight: {
        color: "#C92EFF",
        fontWeight: "bold",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(28, 18, 53, 0.7)",
        paddingHorizontal: 15,
        paddingVertical: 16,
        borderRadius: 12,
        width: "100%",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "rgba(201, 46, 255, 0.1)",
    },
    inputError: {
        borderColor: "#FF6B6B",
        borderWidth: 1,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        color: "white",
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    errorText: {
        color: "#FF6B6B",
        fontSize: 12,
        marginBottom: 12,
        marginTop: -8,
        alignSelf: "flex-start",
        marginLeft: 4,
    },
    passwordStrengthContainer: {
        width: "100%",
        marginBottom: 15,
    },
    passwordStrengthLabel: {
        color: "#9D8ACE",
        fontSize: 12,
        marginBottom: 4,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    passwordStrengthValue: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 6,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    passwordStrengthBar: {
        width: "100%",
        height: 4,
        backgroundColor: "rgba(28, 18, 53, 0.7)",
        borderRadius: 2,
        overflow: "hidden",
    },
    passwordStrengthFill: {
        height: "100%",
        borderRadius: 2,
    },
    passwordRequirements: {
        width: "100%",
        marginBottom: 20,
    },
    requirementsTitle: {
        color: "#9D8ACE",
        fontSize: 14,
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    requirementItem: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
    },
    requirementIcon: {
        marginRight: 8,
    },
    requirementText: {
        color: "white",
        fontSize: 13,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    buttonContainer: {
        width: "100%",
        marginTop: 10,
        borderRadius: 12,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#C92EFF",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
        letterSpacing: 1,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
        paddingHorizontal: 12
    },
    successContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    successIcon: {
        marginBottom: 20,
    },
    successText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "white",
        marginBottom: 10,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    successSubtext: {
        fontSize: 16,
        color: "#9D8ACE",
        textAlign: "center",
        lineHeight: 24,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
});