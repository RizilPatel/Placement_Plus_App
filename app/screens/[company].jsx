import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Linking, TextInput, ScrollView } from "react-native";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getAccessToken, getRefreshToken } from "../../utils/tokenStorage.js";
import { useUser } from "../../context/userContext.js";
import { router, useLocalSearchParams } from 'expo-router'
import CustomAlert from "../../components/CustomAlert.jsx";

import microsoftLogo from "@/assets/companyImages/Microsoft_Logo_512px.png";
import appleLogo from "@/assets/companyImages/apple-white.png";
import appleLogoBlack from "@/assets/companyImages/apple.png";
import googleLogo from "@/assets/companyImages/Google-new.png";
import amazonLogo from "@/assets/companyImages/amazon2.png";
import netflixLogo from "@/assets/companyImages/Netflix_Symbol_RGB.png";
import metaLogo from "@/assets/companyImages/meta-new.webp";
import uberLogo from "@/assets/companyImages/uber-white-without-back.png";
import uberLogoBlack from "@/assets/companyImages/uber.png";
import nvidiaLogo from "@/assets/companyImages/Nvidia-white.jpg";
import nvidiaLogoBlack from "@/assets/companyImages/Nvidia-new.png";
import flipkartLogo from "@/assets/companyImages/flipkart-bg.png";
import gameskraftLogo from "@/assets/companyImages/gameskraft-bg.png";
import morganStanleyLogo from "@/assets/companyImages/morganStanley.jpg"
import techMahindraLogo from "@/assets/companyImages/tech-mahindra-new.png"

const companies = [
    {
        name: "Microsoft",
        dark: { logo: microsoftLogo },
        light: { logo: microsoftLogo }
    },
    {
        name: "Apple",
        dark: { logo: appleLogo },
        light: { logo: appleLogoBlack }
    },
    {
        name: "Google",
        dark: { logo: googleLogo },
        light: { logo: googleLogo }
    },
    {
        name: "Amazon",
        dark: { logo: amazonLogo },
        light: { logo: amazonLogo }
    },
    {
        name: "Flipkart",
        dark: { logo: flipkartLogo },
        light: { logo: flipkartLogo }
    },
    {
        name: "Netflix",
        dark: { logo: netflixLogo },
        light: { logo: netflixLogo }
    },
    {
        name: "Meta",
        dark: { logo: metaLogo },
        light: { logo: metaLogo }
    },
    {
        name: "Uber",
        dark: { logo: uberLogo },
        light: { logo: uberLogoBlack }
    },
    {
        name: "Nvidia",
        dark: { logo: nvidiaLogo },
        light: { logo: nvidiaLogoBlack }
    },
    {
        name: "Gameskraft",
        dark: { logo: gameskraftLogo },
        light: { logo: gameskraftLogo }
    },
    {
        name: "Morgan Stanley",
        dark: { logo: morganStanleyLogo },
        light: { logo: morganStanleyLogo }
    },
    {
        name: "Tech Mahindra",
        dark: { logo: techMahindraLogo },
        light: { logo: techMahindraLogo }
    }
];

const CodingProblems = () => {
    const [problems, setProblems] = useState([]);
    const [filteredProblems, setFilteredProblems] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [difficultyFilter, setDifficultyFilter] = useState("All");
    const { theme } = useUser();
    const { company } = useLocalSearchParams();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    });

    useEffect(() => {
        if (company)
            getProblem(company);
    }, []);

    useEffect(() => {
        filterProblems();
    }, [searchQuery, problems, difficultyFilter]);

    const filterProblems = () => {
        let filtered = [...problems];

        // Filter by search query
        if (searchQuery.trim() !== "") {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(
                problem => problem.name.toLowerCase().includes(lowercasedQuery)
            );
        }

        // Filter by difficulty
        if (difficultyFilter !== "All") {
            filtered = filtered.filter(
                problem => problem.difficulty === difficultyFilter
            );
        }

        setFilteredProblems(filtered);
    };

    const getProblem = async (companyName) => {
        if (companyName === 'Tech Mahindra')
            companyName = "TechMahindra";

        setIsLoading(true);
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/questions/get-company-questions/c/${companyName}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': `${refreshToken}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch companies');
            }

            if (result.statusCode === 200) {
                setProblems(result.data);
                setFilteredProblems(result.data);
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
                setAlertVisible(true);
            }

        } catch (error) {
            setAlertConfig({
                header: "Failed to fetch questions",
                message: error?.message || "Something went wrong. Please try again.",
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

    const handleClearSearch = () => {
        setSearchQuery("");
    };

    const handleFilterChange = (difficulty) => {
        setDifficultyFilter(difficulty);
    };

    const resetFilters = () => {
        setSearchQuery("");
        setDifficultyFilter("All");
    };

    const handleOpenLink = (url) => {
        Linking.openURL(url).catch((err) => console.error("Error opening link:", err));
    };

    const getDifficultyStyles = (difficulty) => {
        const baseStyles = {
            Easy: {
                dark: {
                    text: "#d1e7dd",
                    background: "rgba(15, 81, 50, 0.8)",
                    icon: "check-circle"
                },
                light: {
                    text: "#0f5132",
                    background: "#d1e7dd",
                    icon: "check-circle"
                }
            },
            Medium: {
                dark: {
                    text: "#f8d775",
                    background: "rgba(102, 77, 3, 0.8)",
                    icon: "dot-circle-o"
                },
                light: {
                    text: "#664d03",
                    background: "#fff3cd",
                    icon: "dot-circle-o"
                }
            },
            Hard: {
                dark: {
                    text: "#f5c2c7",
                    background: "rgba(88, 21, 28, 0.8)",
                    icon: "exclamation-circle"
                },
                light: {
                    text: "#58151c",
                    background: "#f8d7da",
                    icon: "exclamation-circle"
                }
            }
        };

        return baseStyles[difficulty] ? baseStyles[difficulty][theme] : null;
    };

    // Dynamic styles based on theme
    const getDynamicStyles = () => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme === 'light' ? "#f0f0f0" : "#1a012c",
            paddingBottom: 20
        },
        headerContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingVertical: 15,
            paddingHorizontal: 15,
            borderBottomWidth: 1,
            borderBottomColor: theme === 'light' ? "#e0e0e0" : '#390852',
            marginTop: 15
        },
        header: {
            color: theme === 'light' ? "#6a0dad" : '#C92EFF',
            fontSize: 20,
            fontWeight: 'bold',
        },
        searchContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme === 'light' ? "#ffffff" : '#2d0a41',
            marginHorizontal: 15,
            marginTop: 15,
            padding: 10,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        searchInput: {
            flex: 1,
            height: 40,
            fontSize: 16,
            color: theme === 'light' ? "#333" : '#fff',
            paddingLeft: 5
        },
        filterContainer: {
            marginHorizontal: 15,
            marginTop: 15,
        },
        filterLabel: {
            fontSize: 16,
            fontWeight: "bold",
            marginBottom: 8,
            color: theme === 'light' ? "#6a0dad" : '#C92EFF',
            paddingLeft: 5,
        },
        activeFiltersContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginHorizontal: 15,
            marginTop: 10,
            padding: 10,
            borderRadius: 8,
            backgroundColor: theme === 'light' ? "rgba(106, 13, 173, 0.1)" : "rgba(201, 46, 255, 0.1)",
        },
        activeFiltersText: {
            fontSize: 14,
            color: theme === 'light' ? "#666" : '#b388e9',
        },
        resetFiltersButton: {
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 5,
            backgroundColor: theme === 'light' ? "rgba(106, 13, 173, 0.3)" : "rgba(201, 46, 255, 0.3)",
        },
        resetFiltersText: {
            fontSize: 12,
            color: theme === 'light' ? "#333" : '#fff',
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            borderRadius: 15,
            marginTop: 20,
            backgroundColor: theme === 'light' ? "#ffffff" : '#2d0a41',
            marginHorizontal: 15,
        },
        emptyTitle: {
            fontSize: 24,
            fontWeight: 'bold',
            marginBottom: 10,
            textAlign: 'center',
            color: theme === 'light' ? "#333" : '#fff',
        },
        emptyMessage: {
            fontSize: 16,
            textAlign: 'center',
            lineHeight: 24,
            marginBottom: 30,
            paddingHorizontal: 20,
            color: theme === 'light' ? "#666" : '#b388e9',
        },
        refreshButton: {
            paddingVertical: 12,
            paddingHorizontal: 30,
            borderRadius: 25,
            backgroundColor: theme === 'light' ? "#6a0dad" : '#C92EFF',
            elevation: 5,
        },
        refreshButtonText: {
            color: '#fff',
            fontSize: 16,
            fontWeight: 'bold',
        },
        problemCard: {
            backgroundColor: theme === 'light' ? "#ffffff" : '#2d0a41',
            marginHorizontal: 15,
            marginTop: 10,
            padding: 15,
            borderRadius: 10,
            shadowColor: "#000",
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3,
            elevation: 3,
        },
        problemNumber: {
            fontSize: 14,
            fontWeight: 'bold',
            marginBottom: 8,
            paddingBottom: 8,
            borderBottomWidth: 1,
            borderBottomColor: theme === 'light' ? "rgba(106, 13, 173, 0.2)" : "rgba(201, 46, 255, 0.2)",
            color: theme === 'light' ? "#6a0dad" : '#C92EFF',
        },
        problemName: {
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
            color: theme === 'light' ? "#333" : '#fff',
        },
        problemFooter: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 10,
        },
        difficultyTag: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 20,
        },
        difficultyText: {
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 5,
        },
        practiceButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme === 'light' ? "rgba(106, 13, 173, 0.1)" : "rgba(201, 46, 255, 0.1)",
            paddingVertical: 8,
            paddingHorizontal: 15,
            borderRadius: 20,
        },
        practiceButtonText: {
            fontSize: 14,
            fontWeight: 'bold',
            marginLeft: 5,
            color: theme === 'light' ? "#6a0dad" : '#C92EFF',
        },
        filterButton: {
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 20,
            marginRight: 10,
            borderWidth: 1,
        },
        filterText: {
            fontWeight: 'bold',
        },
        filterRow: {
            flexDirection: 'row',
        }
    });

    const dynamicStyles = getDynamicStyles();

    return (
        <View style={dynamicStyles.container}>
            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />
            <View style={dynamicStyles.headerContainer}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme === 'light' ? "#6a0dad" : "#C92EFF"} />
                </TouchableOpacity>
                <Text style={dynamicStyles.header}>Coding Problems</Text>
                <View style={{ width: 50, height: 50 }}>
                    {company && companies.some(c => c.name === company) && (
                        <Image
                            source={companies.find(c => c.name === company)[theme].logo}
                            style={styles.logo}
                        />
                    )}
                </View>
            </View>

            <View style={dynamicStyles.searchContainer}>
                <FontAwesome
                    name="search"
                    size={20}
                    color={theme === 'light' ? "#6a0dad" : '#C92EFF'}
                    style={styles.searchIcon}
                />
                <TextInput
                    style={dynamicStyles.searchInput}
                    placeholder="Search problems..."
                    placeholderTextColor={theme === 'light' ? "#999" : "#8a8a8a"}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
                        <FontAwesome
                            name="times-circle"
                            size={20}
                            color={theme === 'light' ? "#6a0dad" : '#C92EFF'}
                        />
                    </TouchableOpacity>
                )}
            </View>

            <View style={dynamicStyles.filterContainer}>
                <Text style={dynamicStyles.filterLabel}>Difficulty</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={dynamicStyles.filterRow}
                >
                    {["All", "Easy", "Medium", "Hard"].map((difficulty) => {
                        const isActive = difficultyFilter === difficulty;
                        let buttonStyle, textStyle;
                        
                        if (difficulty === "All") {
                            buttonStyle = {
                                backgroundColor: isActive 
                                    ? (theme === 'light' ? "#6a0dad" : '#C92EFF') 
                                    : (theme === 'light' ? "rgba(106, 13, 173, 0.1)" : "rgba(201, 46, 255, 0.1)"),
                                borderColor: isActive 
                                    ? (theme === 'light' ? "#6a0dad" : '#C92EFF') 
                                    : (theme === 'light' ? "rgba(106, 13, 173, 0.3)" : "rgba(201, 46, 255, 0.3)")
                            };
                            textStyle = {
                                color: isActive 
                                    ? "#fff" 
                                    : (theme === 'light' ? "#6a0dad" : '#C92EFF')
                            };
                        } else {
                            const diffStyles = getDifficultyStyles(difficulty);
                            buttonStyle = {
                                backgroundColor: isActive 
                                    ? diffStyles.background
                                    : theme === 'light' 
                                        ? "rgba(106, 13, 173, 0.05)" 
                                        : "rgba(201, 46, 255, 0.05)",
                                borderColor: diffStyles.text
                            };
                            textStyle = {
                                color: isActive ? (theme === 'light' ? "#fff" : diffStyles.text) : diffStyles.text
                            };
                        }
                        
                        return (
                            <TouchableOpacity
                                key={difficulty}
                                style={[dynamicStyles.filterButton, buttonStyle]}
                                onPress={() => handleFilterChange(difficulty)}
                            >
                                <Text style={[dynamicStyles.filterText, textStyle]}>
                                    {difficulty}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {(searchQuery.length > 0 || difficultyFilter !== "All") && (
                <View style={dynamicStyles.activeFiltersContainer}>
                    <Text style={dynamicStyles.activeFiltersText}>
                        Active filters: {difficultyFilter !== "All" ? difficultyFilter : ""}
                        {searchQuery.length > 0 ? (difficultyFilter !== "All" ? ", " : "") + `"${searchQuery}"` : ""}
                    </Text>
                    <TouchableOpacity
                        style={dynamicStyles.resetFiltersButton}
                        onPress={resetFilters}
                    >
                        <Text style={dynamicStyles.resetFiltersText}>Reset Filters</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isLoading ? (
                <View style={dynamicStyles.emptyContainer}>
                    <Text style={dynamicStyles.emptyTitle}>Loading...</Text>
                </View>
            ) : filteredProblems && filteredProblems.length > 0 ? (
                <FlatList
                    data={filteredProblems}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item, index }) => {
                        const difficultyStyle = getDifficultyStyles(item.difficulty);
                        
                        return (
                            <View style={dynamicStyles.problemCard}>
                                <Text style={dynamicStyles.problemNumber}>Problem #{index + 1}</Text>
                                <Text style={dynamicStyles.problemName}>{item.name}</Text>
                                
                                <View style={dynamicStyles.problemFooter}>
                                    <View 
                                        style={[
                                            dynamicStyles.difficultyTag, 
                                            { backgroundColor: difficultyStyle.background }
                                        ]}
                                    >
                                        <FontAwesome 
                                            name={difficultyStyle.icon} 
                                            size={14} 
                                            color={difficultyStyle.text} 
                                        />
                                        <Text 
                                            style={[
                                                dynamicStyles.difficultyText, 
                                                { color: difficultyStyle.text }
                                            ]}
                                        >
                                            {item.difficulty}
                                        </Text>
                                    </View>
                                    
                                    <TouchableOpacity 
                                        style={dynamicStyles.practiceButton}
                                        onPress={() => handleOpenLink(item?.link)}
                                    >
                                        <FontAwesome 
                                            name="code" 
                                            size={18} 
                                            color={theme === 'light' ? "#6a0dad" : '#C92EFF'} 
                                        />
                                        <Text style={dynamicStyles.practiceButtonText}>Practice</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                />
            ) : (
                <View style={dynamicStyles.emptyContainer}>
                    <FontAwesome
                        name="search"
                        size={60}
                        color={theme === 'light' ? "#6a0dad" : '#C92EFF'}
                        style={styles.emptyIcon}
                    />
                    <Text style={dynamicStyles.emptyTitle}>No Matching Problems</Text>
                    <Text style={dynamicStyles.emptyMessage}>
                        We couldn't find any problems matching your filters.
                        Try different search terms or filter settings.
                    </Text>
                    <TouchableOpacity
                        style={dynamicStyles.refreshButton}
                        onPress={resetFilters}
                    >
                        <Text style={dynamicStyles.refreshButtonText}>Reset Filters</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    backButton: {
        padding: 5,
    },
    logo: {
        width: 50,
        height: 50,
        resizeMode: "contain",
    },
    searchIcon: {
        marginRight: 10,
        paddingLeft: 5,
    },
    clearButton: {
        padding: 8,
    },
    emptyIcon: {
        marginBottom: 20,
        opacity: 0.8,
    },
});

export default CodingProblems;