import * as SecureStore from 'expo-secure-store';
// code for tokens to access and remove is written 
const storeAccessToken = async (accessToken) => {
    try {
        await SecureStore.setItemAsync("access_token", accessToken, { secure: true });
    } catch (error) {
        console.error("Error storing access token:", error);
    }
}

const getAccessToken = async () => {
    try {
        return await SecureStore.getItemAsync("access_token");
    } catch (error) {
        console.error("Error retrieving access token:", error);
        return null;
    }
}

const removeAccessToken = async () => {
    try {
        await SecureStore.deleteItemAsync("access_token");
    } catch (error) {
        console.error("Error removing access token:", error);
    }
}

const storeRefreshToken = async (refreshToken) => {
    try {
        await SecureStore.setItemAsync("refresh_token", refreshToken, { secure: true });
    } catch (error) {
        console.error("Error storing refresh token:", error);
    }
}

const getRefreshToken = async () => {
    try {
        return await SecureStore.getItemAsync("refresh_token");
    } catch (error) {
        console.error("Error retrieving refresh token:", error);
        return null;
    }
}
    
const removeRefreshToken = async () => {
    try {
        await SecureStore.deleteItemAsync("refresh_token");
    } catch (error) {
        console.error("Error removing refresh token:", error);
    }
}

export { getAccessToken, getRefreshToken, removeAccessToken, removeRefreshToken, storeAccessToken, storeRefreshToken }