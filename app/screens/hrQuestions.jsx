import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    StatusBar,
    FlatList,
    TextInput,
    Pressable
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import { useUser } from '../../context/userContext.js';
import CustomAlert from '../../components/CustomAlert.jsx';
import { router } from 'expo-router';

const HRQuestionsScreen = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const { theme } = useUser()
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {

            const accessToken = await getAccessToken()
            const refreshToken = await getRefreshToken()

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/hr-questions/get-all-questions`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${accessToken}`,
                    "x-refresh-token": refreshToken
                },
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            if (result.statusCode !== 200) {
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
                return
            }
            setQuestions(result.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching questions:', error);
            setLoading(false);
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
        }
    };

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'Policies':
                return 'file-text-o';
            case 'Performance':
                return 'line-chart';
            case 'Benefits':
                return 'medkit';
            default:
                return 'question-circle-o';
        }
    };

    const filterOptions = ['All', 'Policies', 'Performance', 'Benefits'];

    const filteredQuestions = questions.filter(item =>
        (activeFilter === 'All' || item.category === activeFilter) &&
        (item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    const themeColor = theme === 'light' ? '#6A0DAD' : '#C92EFF';

    if (loading) {
        return (
            <View style={[
                styles.container,
                { backgroundColor: theme === 'light' ? '#F5F5F5' : '#1a012c' }
            ]}>
                <ActivityIndicator size="large" color={themeColor} />
                <Text style={[
                    styles.emptyText,
                    { marginTop: 15, color: theme === 'light' ? '#666666' : '#8a8a8a' }
                ]}>Loading HR Questions...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={[
            styles.container,
            { backgroundColor: theme === 'light' ? '#F5F5F5' : '#1a012c' }
        ]}>
            <StatusBar barStyle={theme === 'light' ? "dark-content" : "light-content"} backgroundColor={theme === 'light' ? '#F5F5F5' : '#1a012c'} />

            <View style={styles.headerContainer}>
                <Pressable onPress={() => router.back()} style={{ marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={30} color="#C92EFF" />
                </Pressable>
                <Text style={[
                    styles.header,
                    { color: themeColor }
                ]}>HR Knowledge Base</Text>
            </View>

            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />

            <View style={styles.searchFilterContainer}>
                <View style={[
                    styles.searchContainer,
                    { backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(255, 255, 255, 0.1)' }
                ]}>
                    <FontAwesome name="search" size={20} color={themeColor} style={styles.searchIcon} />
                    <TextInput
                        style={[
                            styles.searchInput,
                            { color: theme === 'light' ? '#333333' : '#fff' }
                        ]}
                        placeholder="Search questions..."
                        placeholderTextColor={theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContainer}
                >
                    {filterOptions.map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.filterOption,
                                {
                                    backgroundColor: theme === 'light'
                                        ? 'rgba(106, 13, 173, 0.08)'
                                        : 'rgba(255, 255, 255, 0.08)'
                                },
                                activeFilter === option && {
                                    backgroundColor: themeColor
                                }
                            ]}
                            onPress={() => setActiveFilter(option)}
                        >
                            <Text
                                style={[
                                    styles.filterText,
                                    {
                                        color: theme === 'light'
                                            ? (activeFilter === option ? '#fff' : '#333333')
                                            : '#fff'
                                    },
                                    activeFilter === option && styles.activeFilterText
                                ]}
                            >
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {filteredQuestions.length > 0 ? (
                <FlatList
                    data={filteredQuestions}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.subjectsList}
                    renderItem={({ item }) => (
                        <View style={[
                            styles.subjectContainer,
                            {
                                backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                                borderColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                            }
                        ]}>
                            <TouchableOpacity
                                style={styles.subjectHeader}
                                onPress={() => toggleExpand(item._id)}
                            >
                                <View style={styles.subjectTitleContainer}>
                                    <FontAwesome
                                        name={getCategoryIcon(item.category)}
                                        size={22}
                                        color={themeColor}
                                        style={styles.subjectIcon}
                                    />
                                    <Text style={[
                                        styles.subjectTitle,
                                        { color: theme === 'light' ? '#333333' : '#fff' }
                                    ]}>{item.question}</Text>
                                </View>
                                <FontAwesome
                                    name={expandedId === item._id ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color={theme === 'light' ? '#6A0DAD' : '#fff'}
                                />
                            </TouchableOpacity>

                            {expandedId === item._id && (
                                <View style={[
                                    styles.materialsContainer,
                                    {
                                        borderTopColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                                    }
                                ]}>
                                    <View style={styles.materialRow}>
                                        <Text style={[
                                            styles.cell,
                                            { flex: 1, color: theme === 'light' ? '#333333' : '#fff' }
                                        ]}>{item.answer}</Text>
                                    </View>
                                </View>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={() => (
                        <View style={[
                            styles.emptyContainer,
                            {
                                backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(255, 255, 255, 0.03)'
                            }
                        ]}>
                            <FontAwesome
                                name="search"
                                size={60}
                                color={theme === 'light' ? 'rgba(106, 13, 173, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
                                style={styles.emptyIcon}
                            />
                            <Text style={[
                                styles.emptyTitle,
                                { color: theme === 'light' ? '#333333' : '#fff' }
                            ]}>No Questions Found</Text>
                            <Text style={[
                                styles.emptyMessage,
                                { color: theme === 'light' ? '#6A0DAD' : '#d8b8e8' }
                            ]}>
                                Try adjusting your search or select a different category filter
                            </Text>
                            <TouchableOpacity
                                style={[
                                    styles.resetButton,
                                    { backgroundColor: themeColor }
                                ]}
                                onPress={() => {
                                    setSearchQuery('');
                                    setActiveFilter('All');
                                }}
                            >
                                <Text style={styles.resetButtonText}>Reset Filters</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            ) : (
                <View style={[
                    styles.emptyContainer,
                    {
                        backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(255, 255, 255, 0.03)'
                    }
                ]}>
                    <FontAwesome
                        name="search"
                        size={60}
                        color={theme === 'light' ? 'rgba(106, 13, 173, 0.3)' : 'rgba(255, 255, 255, 0.3)'}
                        style={styles.emptyIcon}
                    />
                    <Text style={[
                        styles.emptyTitle,
                        { color: theme === 'light' ? '#333333' : '#fff' }
                    ]}>No Questions Found</Text>
                    <Text style={[
                        styles.emptyMessage,
                        { color: theme === 'light' ? '#6A0DAD' : '#d8b8e8' }
                    ]}>
                        Try adjusting your search or select a different category filter
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.resetButton,
                            { backgroundColor: themeColor }
                        ]}
                        onPress={() => {
                            setSearchQuery('');
                            setActiveFilter('All');
                        }}
                    >
                        <Text style={styles.resetButtonText}>Reset Filters</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    headerContainer: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        width: "100%",
        marginBottom: 15,
        marginTop: 15
    },
    header: {
        fontSize: 30,
        fontWeight: "bold",
        fontFamily: "sans-serif",
    },
    searchFilterContainer: {
        marginBottom: 15,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 44,
        fontSize: 16,
    },
    filterContainer: {
        marginVertical: 10,
    },
    filterOption: {
        paddingHorizontal: 18,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '500',
    },
    activeFilterText: {
        fontWeight: 'bold',
    },
    subjectsList: {
        paddingBottom: 20,
    },
    subjectContainer: {
        marginBottom: 15,
        borderRadius: 10,
        overflow: 'hidden',
        borderWidth: 1,
    },
    subjectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    subjectTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    subjectIcon: {
        marginRight: 10,
    },
    subjectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    materialsContainer: {
        borderTopWidth: 1,
        paddingBottom: 10,
    },
    tableHeader: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    headerText: {
        fontSize: 16,
        fontWeight: "bold",
        textAlign: "left",
    },
    materialRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
    },
    cell: {
        fontSize: 15,
        lineHeight: 22,
    },
    materialIcon: {
        textAlign: "center",
    },
    materialDescriptionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginHorizontal: 15,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
    },
    materialDescriptionText: {
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '400',
    },
    openButton: {
        color: '#fff',
        fontWeight: '500',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        textAlign: 'center',
        overflow: 'hidden',
        fontSize: 14,
        alignSelf: 'flex-start',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        borderRadius: 15,
        marginTop: 20,
        minHeight: 300,
    },
    emptyIcon: {
        marginBottom: 20,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    emptyMessage: {
        fontSize: 16,
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    resetButton: {
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        elevation: 5,
    },
    resetButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default HRQuestionsScreen;