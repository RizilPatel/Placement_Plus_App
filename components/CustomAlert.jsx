import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * CustomAlert component for displaying modal alerts
 * @param {boolean} visible - Controls the visibility of the alert
 * @param {string} header - Alert title/header text
 * @param {string} message - Alert message content
 * @param {Array} buttons - Array of button objects with text, onPress, and style properties
 * @param {function} onClose - Function to call when closing the alert
 */
const CustomAlert = ({
    visible,
    header,
    message,
    buttons = [
        { text: "OK", onPress: () => { }, style: "default" }
    ],
    onClose
}) => {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.alertContainer}>
                    <LinearGradient
                        colors={['#0D021F', '#1E0442']}
                        style={styles.alertBackground}
                    >
                        {header && <Text style={styles.header}>{header}</Text>}
                        {message && <Text style={styles.message}>{message}</Text>}

                        <View style={styles.buttonContainer}>
                            {buttons.map((button, index) => (
                                <Pressable
                                    key={index}
                                    style={({ pressed }) => [
                                        styles.button,
                                        button.style === "destructive" && styles.destructiveButton,
                                        button.style === "cancel" && styles.cancelButton,
                                        pressed && styles.buttonPressed,
                                        index > 0 && styles.marginLeft
                                    ]}
                                    onPress={() => {
                                        if (button.onPress) button.onPress();
                                        if (onClose) onClose();
                                    }}
                                >
                                    {button.style === "destructive" ? (
                                        <LinearGradient
                                            colors={['#FF6B6B', '#FF4141']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.buttonGradient}
                                        >
                                            <Text style={[styles.buttonText, styles.destructiveText]}>{button.text}</Text>
                                        </LinearGradient>
                                    ) : button.style === "cancel" ? (
                                        <View style={styles.cancelButtonInner}>
                                            <Text style={[styles.buttonText, styles.cancelText]}>{button.text}</Text>
                                        </View>
                                    ) : (
                                        <LinearGradient
                                            colors={['#C92EFF', '#8E24F8']}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.buttonGradient}
                                        >
                                            <Text style={styles.buttonText}>{button.text}</Text>
                                        </LinearGradient>
                                    )}
                                </Pressable>
                            ))}
                        </View>
                    </LinearGradient>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertContainer: {
        width: '85%',
        maxWidth: 400,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        backgroundColor: '#070112', 

    },
    alertBackground: {
        padding: 24,
        backgroundColor: '#070112', 
    },
    header: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        color: '#D9D9D9',
        fontSize: 16,
        marginBottom: 24,
        textAlign: 'center',
        lineHeight: 22,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    button: {
        flex: 1,
        height: 46,
        borderRadius: 8,
        overflow: 'hidden',
    },
    buttonGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButtonInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#9D8ACE',
        borderRadius: 8,
    },
    buttonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
        textTransform: 'uppercase',
    },
    destructiveText: {
        color: 'white',
    },
    cancelText: {
        color: '#9D8ACE',
    },
    marginLeft: {
        marginLeft: 12,
    },
    buttonPressed: {
        opacity: 0.8,
    },
});

export default CustomAlert;