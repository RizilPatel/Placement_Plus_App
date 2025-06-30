import AsyncStorage from '@react-native-async-storage/async-storage';

const setUserType = async (userType) => {
    try {
        await AsyncStorage.setItem('userType', userType)
    } catch (error) {
        console.error("Error storing user type:", error);
    }
}

const removeUserType = async () => {
    try {
        await AsyncStorage.removeItem('userType')
    } catch (error) {
        console.error("Error removing user type:", error);
    }
}

const getUserType = async () => {
    try {
        await AsyncStorage.getItem('userType')
    } catch (error) {
        console.error("Error getting user type:", error);
    }
}

export { setUserType, removeUserType, getUserType }