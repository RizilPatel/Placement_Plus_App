import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [theme, setTheme] = useState("dark");
    const [admin, setAdmin] = useState(null);
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [alumni, setAlumni] = useState(null);
    const [isAlumniLoggedIn, setIsAlumniLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    const restoreLoginState = async () => {
        try {
            const userType = await AsyncStorage.getItem("userType");

            if (userType === "student") {
                const savedUser = await AsyncStorage.getItem("userData");
                setUser(JSON.parse(savedUser));
                setIsLoggedIn(true);
            } else if (userType === "admin") {
                const savedAdmin = await AsyncStorage.getItem("adminData");
                setAdmin(JSON.parse(savedAdmin));
                setIsAdminLoggedIn(true);
            } else if (userType === "alumni") {
                const savedAlumni = await AsyncStorage.getItem("alumniData");
                setAlumni(JSON.parse(savedAlumni));
                setIsAlumniLoggedIn(true);
            }
        } catch (error) {
            console.error("Error loading login state from AsyncStorage:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        restoreLoginState();
    }, []);

    const login = async (userData) => {
        setUser(userData);
        setIsLoggedIn(true);
        setIsAdminLoggedIn(false)
        setIsAlumniLoggedIn(false)
        await AsyncStorage.setItem("userType", "student");
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
    };

    const logout = async () => {
        setUser(null);
        setIsLoggedIn(false);
        setIsAdminLoggedIn(false);
        setIsAlumniLoggedIn(false);
        await AsyncStorage.multiRemove(["userType", "userData", "adminData", "alumniData"]);
    };

    const adminLogin = async (adminData) => {
        setAdmin(adminData);
        setIsLoggedIn(false);
        setIsAdminLoggedIn(true)
        setIsAlumniLoggedIn(false)
        await AsyncStorage.setItem("userType", "admin");
        await AsyncStorage.setItem("adminData", JSON.stringify(adminData));
    };

    const adminLogout = async () => {
        setAdmin(null);
        setIsAdminLoggedIn(false);
        setIsLoggedIn(false);
        setIsAlumniLoggedIn(false);
        await AsyncStorage.multiRemove(["userType", "adminData", "userData", "alumniData"]);
    };

    const alumniLogin = async (alumniData) => {
        setAlumni(alumniData);
        setIsLoggedIn(false);
        setIsAdminLoggedIn(false)
        setIsAlumniLoggedIn(true)
        await AsyncStorage.setItem("userType", "alumni");
        await AsyncStorage.setItem("alumniData", JSON.stringify(alumniData));
    };

    const alumniLogout = async () => {
        setAlumni(null);
        setIsAlumniLoggedIn(false);
        setIsAdminLoggedIn(false);
        setIsLoggedIn(false);
        await AsyncStorage.multiRemove(["userType", "alumniData", "userData", "adminData"]);
    };

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <UserContext.Provider
            value={{
                user,
                isLoggedIn,
                admin,
                isAdminLoggedIn,
                login,
                logout,
                adminLogin,
                adminLogout,
                alumni,
                alumniLogin,
                alumniLogout,
                isAlumniLoggedIn,
                theme,
                toggleTheme,
                loading,
                setLoading
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
