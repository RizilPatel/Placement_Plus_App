import React, { useState, useEffect, useRef } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { SimpleLineIcons, Feather, MaterialIcons } from "@expo/vector-icons";
import * as Yup from "yup";
import { LinearGradient } from "expo-linear-gradient";
import CustomAlert from "../../components/CustomAlert.jsx";

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
        .email("Please enter a valid email")
        .required("Email is required"),
});

const OTPSchema = Yup.object().shape({
    otp: Yup.string()
        .matches(/^\d{6}$/, "OTP must be a 6-digit number")
        .required("OTP is required"),
});

const ForgotPasswordScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState(null);
    const [otpError, setOtpError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isTouched, setIsTouched] = useState(false);
    const [isOtpTouched, setIsOtpTouched] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(600);
    const [verificationFailed, setVerificationFailed] = useState(false);
    const timerRef = useRef(null);
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })


    useEffect(() => {
        if (emailSent && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [emailSent, timeLeft]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleChange = (value) => {
        setEmail(value);
        if (error) {
            setError(null);
        }
    };

    const handleOtpChange = (value) => {
        const numericValue = value.replace(/[^0-9]/g, '').slice(0, 6);
        setOtp(numericValue);
        if (otpError) {
            setOtpError(null);
        }
    };

    const handleBlur = () => {
        setIsTouched(true);
        validateEmail();
    };

    const handleOtpBlur = () => {
        setIsOtpTouched(true);
        validateOtp();
    };

    const validateEmail = async () => {
        try {
            await ForgotPasswordSchema.validate({ email });
            setError(null);
            return true;
        } catch (error) {
            setError(error.message);
            return false;
        }
    };

    const validateOtp = async () => {
        try {
            await OTPSchema.validate({ otp });
            setOtpError(null);
            return true;
        } catch (error) {
            setOtpError(error.message);
            return false;
        }
    };

    const handleSubmit = async () => {
        Keyboard.dismiss();

        const isValid = await validateEmail();
        if (!isValid) return;

        setIsLoading(true);

        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.statusCode === 200) {
                setEmailSent(true);
                setTimeLeft(600);
                setVerificationFailed(false);
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

    const verifyOtp = async () => {
        Keyboard.dismiss();

        const isValid = await validateOtp();
        if (!isValid) return;

        setIsVerifying(true);
        setVerificationFailed(false);

        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/users/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, otp })
            });

            const result = await response.json();

            if (result.statusCode === 200) {
                setIsSuccess(true);
                if (timerRef.current) clearInterval(timerRef.current);
                router.replace(`/screens/NewPassword?email=${email}`);
            } else {
                setVerificationFailed(true);
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
            setVerificationFailed(true);
            setAlertConfig({
                header: "Fetch Error",
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
            setIsVerifying(false);
        }
    };

    const resendOtp = async () => {
        setIsLoading(true);
        setVerificationFailed(false);

        try {
            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/users/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const result = await response.json();

            if (result.statusCode === 200) {
                setTimeLeft(600);
                setOtp("");
                setAlertConfig({
                    header: "Success",
                    message: "OTP resend to your mail",
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
                header: "Error",
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

                    <CustomAlert
                        visible={alertVisible}
                        header={alertConfig.header}
                        message={alertConfig.message}
                        buttons={alertConfig.buttons}
                        onClose={() => setAlertVisible(false)}
                    />

                    <View style={styles.contentContainer}>
                        <Text style={styles.title}>
                            Forgot <Text style={styles.highlight}>Password?</Text>
                        </Text>

                        {!emailSent && !isSuccess ? (
                            <>
                                <Text style={styles.subtitle}>
                                    Enter your email address and we'll send you a verification code to reset your password.
                                </Text>

                                <View style={[
                                    styles.inputContainer,
                                    isTouched && error ? styles.inputError : null
                                ]}>
                                    <SimpleLineIcons name="envelope" size={20} color={isTouched && error ? "#FF6B6B" : "#9D8ACE"} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Email Address"
                                        placeholderTextColor="#9D8ACE"
                                        value={email}
                                        onChangeText={handleChange}
                                        onBlur={handleBlur}
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    {isTouched && !error && (
                                        <MaterialIcons name="check-circle" size={20} color="#4CD964" />
                                    )}
                                </View>
                                {isTouched && error && (
                                    <Text style={styles.errorText}>{error}</Text>
                                )}

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.buttonContainer,
                                        pressed && styles.buttonPressed
                                    ]}
                                    onPress={handleSubmit}
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
                                            <Text style={styles.buttonText}>SEND OTP</Text>
                                        )}
                                    </LinearGradient>
                                </Pressable>
                            </>
                        ) : emailSent && !isSuccess && (
                            <>
                                <Text style={styles.subtitle}>
                                    Enter the 6-digit verification code sent to {email}
                                </Text>

                                <View style={styles.timerContainer}>
                                    <Text style={styles.timerText}>Time Remaining: </Text>
                                    <Text style={[styles.timerValue, timeLeft < 60 && styles.timerWarning]}>
                                        {formatTime(timeLeft)}
                                    </Text>
                                </View>

                                <View style={[
                                    styles.inputContainer,
                                    isOtpTouched && otpError ? styles.inputError : null
                                ]}>
                                    <SimpleLineIcons name="lock" size={20} color={isOtpTouched && otpError ? "#FF6B6B" : "#9D8ACE"} style={styles.inputIcon} />
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter 6-digit OTP"
                                        placeholderTextColor="#9D8ACE"
                                        value={otp}
                                        onChangeText={handleOtpChange}
                                        onBlur={handleOtpBlur}
                                        keyboardType="number-pad"
                                        autoCapitalize="none"
                                        maxLength={6}
                                    />
                                    {isOtpTouched && !otpError && otp.length === 6 && (
                                        <MaterialIcons name="check-circle" size={20} color="#4CD964" />
                                    )}
                                </View>
                                {isOtpTouched && otpError && (
                                    <Text style={styles.errorText}>{otpError}</Text>
                                )}

                                <Pressable
                                    style={({ pressed }) => [
                                        styles.buttonContainer,
                                        pressed && styles.buttonPressed
                                    ]}
                                    onPress={verifyOtp}
                                    disabled={isVerifying || timeLeft === 0}
                                >
                                    <LinearGradient
                                        colors={timeLeft === 0 ? ['#666', '#888'] : ['#C92EFF', '#8E24F8']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.button}
                                    >
                                        {isVerifying ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text style={styles.buttonText}>
                                                {timeLeft === 0 ? "OTP EXPIRED" : "VERIFY OTP"}
                                            </Text>
                                        )}
                                    </LinearGradient>
                                </Pressable>

                                {/* Show Resend OTP button if timer is zero OR verification failed */}
                                {(timeLeft === 0 || verificationFailed) ? (
                                    <Pressable
                                        style={styles.resendContainer}
                                        onPress={resendOtp}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <ActivityIndicator color="#C92EFF" size="small" />
                                        ) : (
                                            <Text style={styles.resendText}>Resend OTP</Text>
                                        )}
                                    </Pressable>
                                ) : (
                                    <Pressable
                                        style={styles.editEmailContainer}
                                        onPress={() => {
                                            setEmailSent(false);
                                            if (timerRef.current) clearInterval(timerRef.current);
                                        }}
                                    >
                                        <Text style={styles.editEmailText}>Change Email</Text>
                                    </Pressable>
                                )}
                            </>
                        )}

                        {!isSuccess && (
                            <Pressable style={styles.loginContainer} onPress={() => router.replace("userloginsign/login")}>
                                <Text style={styles.loginText}>
                                    Remember your password? <Text style={styles.highlight}>Log In</Text>
                                </Text>
                            </Pressable>
                        )}
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
};

export default ForgotPasswordScreen;

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
    timerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    timerText: {
        color: "#9D8ACE",
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    timerValue: {
        color: "#4CD964",
        fontSize: 16,
        fontWeight: "bold",
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    timerWarning: {
        color: "#FF6B6B",
    },
    buttonContainer: {
        width: "100%",
        marginTop: 20,
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
    resendContainer: {
        marginTop: 20,
        paddingVertical: 10,
    },
    resendText: {
        color: "#C92EFF",
        fontSize: 16,
        fontWeight: "500",
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    editEmailContainer: {
        marginTop: 20,
        paddingVertical: 10,
    },
    editEmailText: {
        color: "#9D8ACE",
        fontSize: 16,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
    },
    loginContainer: {
        marginTop: 30,
    },
    loginText: {
        color: "white",
        textAlign: "center",
        fontSize: 14,
        fontFamily: Platform.OS === 'ios' ? 'Avenir' : 'sans-serif',
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