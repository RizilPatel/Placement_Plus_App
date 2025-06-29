import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, BackHandler } from "react-native";
import { Link, useRouter } from "expo-router";
import { SimpleLineIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import * as Yup from "yup";
import { LinearGradient } from "expo-linear-gradient";
import { storeAccessToken, storeRefreshToken } from "../../utils/tokenStorage.js";
import { useUser } from "../../context/userContext.js"
import CustomAlert from "../../components/CustomAlert.jsx";

const LoginSchema = Yup.object().shape({
    username: Yup.string()
        .matches(/^[a-zA-Z0-9\s]+$/, "Only letters, numbers, and spaces are allowed") // Allows letters, numbers, and spaces
        .required("Username is required"),
    password: Yup.string()
        .required("Password is required"),
});


const LoginScreen = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [touchedFields, setTouchedFields] = useState({});
    const { adminLogin } = useUser()
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })
    const [alertVisible, setAlertVisible] = useState(false)

    const handleChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value,
        });

        if (errors[field]) {
            setErrors({
                ...errors,
                [field]: null,
            });
        }
    };

    const handleBlur = (field) => {
        setTouchedFields({
            ...touchedFields,
            [field]: true,
        });

        validateField(field);
    };

    const validateField = async (field) => {
        try {
            const fieldSchema = Yup.reach(LoginSchema, field);
            await fieldSchema.validate(formData[field]);
            setErrors({
                ...errors,
                [field]: null,
            });
        } catch (error) {
            setErrors({
                ...errors,
                [field]: error.message,
            });
        }
    };

    const validateForm = async () => {
        try {
            await LoginSchema.validate(formData, { abortEarly: false });
            return true;
        } catch (error) {
            const validationErrors = {};
            if (error.inner) {
                error.inner.forEach((err) => {
                    validationErrors[err.path] = err.message;
                });
            }
            setErrors(validationErrors);
            return false;
        }
    };

    const handleLogin = async () => {
        Keyboard.dismiss();

        const isValid = await validateForm();
        if (!isValid) return;

        setIsLoading(true);


        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/admins/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            console.log(result);

            if (result.statusCode === 200) {

                await storeAccessToken(result?.data?.accessToken)
                await storeRefreshToken(result?.data?.refreshToken)
                await adminLogin(result?.data?.admin)

                router.replace("/HomePage/AdminHome")
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
                header: "Login Error",
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
                        onPress={() => router.push("/")}
                        hitSlop={20}
                    >
                        <Feather name="arrow-left" size={24} color="white" />
                    </Pressable>

                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>
                            Welcome <Text style={styles.highlight}>Back!</Text>
                        </Text>

                        <View style={[
                            styles.inputContainer,
                            touchedFields.username && errors.username ? styles.inputError : null
                        ]}>
                            <SimpleLineIcons name="envelope" size={20} color={touchedFields.username && errors.username ? "#FF6B6B" : "#9D8ACE"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Username"
                                placeholderTextColor="#9D8ACE"
                                value={formData.username}
                                onChangeText={(text) => handleChange("username", text)}
                                onBlur={() => handleBlur("username")}
                                keyboardType="username-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            {touchedFields.username && !errors.username && (
                                <MaterialIcons name="check-circle" size={20} color="#4CD964" />
                            )}
                        </View>
                        {touchedFields.username && errors.username && (
                            <Text style={styles.errorText}>{errors.username}</Text>
                        )}

                        <View style={[
                            styles.inputContainer,
                            touchedFields.password && errors.password ? styles.inputError : null
                        ]}>
                            <SimpleLineIcons name="lock" size={20} color={touchedFields.password && errors.password ? "#FF6B6B" : "#9D8ACE"} style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                placeholderTextColor="#9D8ACE"
                                secureTextEntry={!showPassword}
                                value={formData.password}
                                onChangeText={(text) => handleChange("password", text)}
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

                        <Pressable
                            style={({ pressed }) => [
                                styles.buttonContainer,
                                pressed && styles.buttonPressed
                            ]}
                            onPress={handleLogin}
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
                                    <Text style={styles.buttonText}>LOG IN</Text>
                                )}
                            </LinearGradient>
                        </Pressable>

                        {/* <Link href="/forgot-password" asChild>
                            <Pressable style={styles.forgotContainer}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </Pressable>
                        </Link> */}

                        {/* <Text style={styles.signupText}>
                            Don't have an account?
                            <Link href="userloginsign/Signup">
                                <Text style={styles.highlight}> Sign up</Text>
                            </Link>
                        </Text> */}
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
};

export default LoginScreen;

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
        marginBottom: 50,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
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
    rememberContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 30,
        marginTop: 8,
        alignSelf: "flex-start",
    },
    checkbox: {
        width: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    uncheckedBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: "#9D8ACE",
    },
    checkedBox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rememberText: {
        color: "#FFFFFF",
        marginLeft: 10,
        fontSize: 14,
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
    },
    forgotContainer: {
        marginVertical: 20,
    },
    forgotText: {
        color: "#C92EFF",
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    signupText: {
        color: "white",
        marginTop: 10,
        textAlign: "center",
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
});