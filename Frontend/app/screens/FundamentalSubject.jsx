import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    TextInput,
    LayoutAnimation,
    Platform,
    UIManager,
    Linking,
    Alert,
    Pressable
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import * as IntentLauncher from 'expo-intent-launcher';
import { useUser } from '../../context/userContext.js';
import CustomAlert from '../../components/CustomAlert.jsx';
import { router } from 'expo-router';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SubjectMaterials = ({ companyLogo }) => {
    const [subjects, setSubjects] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');
    const [filteredSubjects, setFilteredSubjects] = useState([]);
    const [expandedSubjects, setExpandedSubjects] = useState({});
    const { theme } = useUser()
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const filterOptions = ['All', 'Notes', 'Video'];
    const icons = {
        'Operating System': 'laptop',
        'DBMS': 'database',
        'OOPS': 'cubes',
        'Computer Networks': 'sitemap'
    };

    useEffect(() => {
        fetchAllMaterial();
    }, []);

    useEffect(() => {
        let result = subjects;

        if (searchQuery) {
            result = result.map(subject => {
                const filteredMaterials = subject.materials.filter(material =>
                    material?.title?.toLowerCase()?.includes(searchQuery.toLowerCase())
                );

                return {
                    ...subject,
                    materials: filteredMaterials,
                    hasMatchingMaterials: filteredMaterials.length > 0
                };
            }).filter(subject => subject.hasMatchingMaterials ||
                subject.name.toLowerCase().includes(searchQuery.toLowerCase()));
        }

        // Filter by material type
        if (activeFilter !== 'All') {
            result = result.map(subject => {
                const filteredMaterials = subject.materials.filter(material =>
                    material.type === activeFilter
                );

                return {
                    ...subject,
                    materials: filteredMaterials,
                    hasMatchingMaterials: filteredMaterials.length > 0
                };
            }).filter(subject => subject.hasMatchingMaterials);
        }

        setFilteredSubjects(result);
    }, [searchQuery, activeFilter, subjects]);

    const fetchAllMaterial = async () => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/cs-fundamentals/get-all-pdf`, {
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
                return;
            }

            const subjectGroups = {};

            result.data.forEach(item => {
                const subjectName = item.subjectName;

                if (!subjectGroups[subjectName]) {
                    subjectGroups[subjectName] = {
                        id: subjectName.replace(/\s+/g, '-').toLowerCase(),
                        name: subjectName,
                        materials: []
                    };
                }

                subjectGroups[subjectName].materials.push({
                    id: item._id,
                    title: item.fileName,
                    description: item.description,
                    pdfLink: item.pdfLink,
                    type: 'Notes',
                    difficulty: 'Medium'
                });
            });

            const formattedSubjects = Object.values(subjectGroups);

            setSubjects(formattedSubjects);
            setFilteredSubjects(formattedSubjects);

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
        }
    };

    const openPdf = async (pdfLink) => {
        try {
            const accessToken = await getAccessToken()
            const refreshToken = await getRefreshToken()

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/cs-fundamentals/get-pdf/c/${pdfLink}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken} `,
                    'x-refresh-token': refreshToken
                }
            }
            )

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            const result = await response.json();

            if (result.statusCode !== 200) {
                Alert.alert("Error", result?.message || "Something wnet worng. Please try again later")
                return
            }

            if (Platform.OS === 'android') {
                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: result?.data,
                    type: 'application/pdf',
                });
            } else {
                await Linking.openURL(result?.data);
            }

        } catch (error) {
            Alert.alert(
                "Error",
                error.message || "Something went wrong. Please try again.",
                [{ text: "OK" }]
            );
        }
    }

    const toggleExpand = (subjectId) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSubjects(prev => ({
            ...prev,
            [subjectId]: !prev[subjectId]
        }));
    };

    const getMaterialTypeIcon = (type) => {
        if (!type) return 'file-o';

        switch (type.toLowerCase()) {
            case 'notes':
                return 'file-text-o';
            case 'video':
                return 'play-circle-o';
            case 'quiz':
                return 'question-circle-o';
            default:
                return 'file-o';
        }
    };

    const renderSubjectItem = ({ item }) => {
        const isExpanded = expandedSubjects[item.id] || false;
        const subjectIcon = icons[item.name] || 'folder';
        const themeColor = theme === 'light' ? '#6A0DAD' : '#C92EFF';

        return (
            <View style={[
                styles.subjectContainer,
                {
                    backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(255, 255, 255, 0.05)',
                    borderColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                }
            ]}>
                <TouchableOpacity
                    style={styles.subjectHeader}
                    onPress={() => toggleExpand(item.id)}
                >
                    <View style={styles.subjectTitleContainer}>
                        <FontAwesome name={subjectIcon} size={22} color={themeColor} style={styles.subjectIcon} />
                        <Text style={[
                            styles.subjectTitle,
                            { color: theme === 'light' ? '#333333' : '#fff' }
                        ]}>{item.name}</Text>
                    </View>
                    <FontAwesome
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color={theme === 'light' ? '#6A0DAD' : '#fff'}
                    />
                </TouchableOpacity>

                {isExpanded && (
                    <View style={[
                        styles.materialsContainer,
                        {
                            borderTopColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                        }
                    ]}>
                        {Array.isArray(item.materials) && item.materials.length > 0 ? (
                            <FlatList
                                data={item.materials}
                                keyExtractor={(material) => material.id}
                                scrollEnabled={false}
                                ListHeaderComponent={() => (
                                    <View style={[
                                        styles.tableHeader,
                                        {
                                            backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(0, 0, 0, 0.2)',
                                            borderBottomColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(255, 255, 255, 0.1)'
                                        }
                                    ]}>
                                        <Text style={[
                                            styles.headerText,
                                            styles.col1,
                                            { color: theme === 'light' ? '#333333' : '#fff' }
                                        ]}>Material</Text>
                                        <Text style={[
                                            styles.headerText,
                                            styles.col2,
                                            { color: theme === 'light' ? '#333333' : '#fff' }
                                        ]}>Type</Text>
                                        <Text style={[
                                            styles.headerText,
                                            styles.col3,
                                            { color: theme === 'light' ? '#333333' : '#fff' }
                                        ]}></Text>
                                    </View>
                                )}
                                renderItem={({ item: material }) => (
                                    <View>
                                        <View style={[
                                            styles.materialRow,
                                            {
                                                borderBottomColor: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(255, 255, 255, 0.05)'
                                            }
                                        ]}>
                                            <Text style={[
                                                styles.cell,
                                                styles.col1,
                                                { color: theme === 'light' ? '#333333' : '#fff' }
                                            ]}>{material.title || 'Untitled'}</Text>
                                            <View style={styles.col2}>
                                                <FontAwesome
                                                    name={getMaterialTypeIcon(material.type)}
                                                    size={18}
                                                    color={themeColor}
                                                    style={styles.materialIcon}
                                                />
                                            </View>
                                            <TouchableOpacity onPress={() => openPdf(material?.pdfLink)}>
                                                <Text style={[
                                                    styles.openButton,
                                                    styles.col3,
                                                    { backgroundColor: theme === 'light' ? '#6A0DAD' : '#C92EFF' }
                                                ]}>Open</Text>
                                            </TouchableOpacity>
                                        </View>
                                        {material.description && (
                                            <View style={[
                                                styles.materialDescriptionContainer,
                                                {
                                                    backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(201, 46, 255, 0.05)',
                                                    borderTopColor: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(201, 46, 255, 0.2)'
                                                }
                                            ]}>
                                                <Text style={[
                                                    styles.materialDescriptionText,
                                                    { color: theme === 'light' ? '#666666' : '#d0d0d0' }
                                                ]}>{material.description}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            />
                        ) : (
                            <View style={styles.emptyMaterials}>
                                <Text style={[
                                    styles.emptyText,
                                    { color: theme === 'light' ? '#666666' : '#8a8a8a' }
                                ]}>No materials match your filters</Text>
                            </View>
                        )}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={[
            styles.container,
            { backgroundColor: theme === 'light' ? '#F5F5F5' : '#1a012c' }
        ]}>
            <View style={styles.headerContainer}>
                <Pressable onPress={() => router.back()} style={{ marginTop: 14, marginRight: 10 }}>
                    <Ionicons name="arrow-back" size={30} color="#C92EFF" />
                </Pressable>
                <Text style={[
                    styles.header,
                    { color: theme === 'light' ? '#6A0DAD' : '#C92EFF' }
                ]}>Learning Materials</Text>
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
                    <FontAwesome
                        name="search"
                        size={18}
                        color={theme === 'light' ? '#6A0DAD' : '#C92EFF'}
                        style={styles.searchIcon}
                    />
                    <TextInput
                        style={[
                            styles.searchInput,
                            { color: theme === 'light' ? '#333333' : '#fff' }
                        ]}
                        placeholder="Search materials..."
                        placeholderTextColor={theme === 'light' ? '#666666' : '#8a8a8a'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterContainer}>
                    <FlatList
                        data={filterOptions}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.filterOption,
                                    {
                                        backgroundColor: theme === 'light'
                                            ? 'rgba(106, 13, 173, 0.08)'
                                            : 'rgba(255, 255, 255, 0.08)'
                                    },
                                    activeFilter === item && {
                                        backgroundColor: theme === 'light' ? '#6A0DAD' : '#C92EFF'
                                    }
                                ]}
                                onPress={() => setActiveFilter(item)}
                            >
                                <Text
                                    style={[
                                        styles.filterText,
                                        {
                                            color: theme === 'light'
                                                ? (activeFilter === item ? '#fff' : '#333333')
                                                : '#fff'
                                        },
                                        activeFilter === item && styles.activeFilterText
                                    ]}
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>

            {filteredSubjects.length > 0 ? (
                <FlatList
                    data={filteredSubjects}
                    keyExtractor={(item) => item.id}
                    renderItem={renderSubjectItem}
                    contentContainerStyle={styles.subjectsList}
                />
            ) : (
                <View style={[
                    styles.emptyContainer,
                    {
                        backgroundColor: theme === 'light'
                            ? 'rgba(106, 13, 173, 0.05)'
                            : 'rgba(255, 255, 255, 0.03)'
                    }
                ]}>
                    <FontAwesome
                        name="search"
                        size={60}
                        color={theme === 'light' ? '#6A0DAD' : '#C92EFF'}
                        style={styles.emptyIcon}
                    />
                    <Text style={[
                        styles.emptyTitle,
                        { color: theme === 'light' ? '#333333' : '#fff' }
                    ]}>No Subjects Found</Text>
                    <Text style={[
                        styles.emptyMessage,
                        { color: theme === 'light' ? '#6A0DAD' : '#d8b8e8' }
                    ]}>
                        We couldn't find any subjects that match your search criteria.
                        Try adjusting your filters or search query.
                    </Text>
                    <TouchableOpacity
                        style={[
                            styles.resetButton,
                            { backgroundColor: theme === 'light' ? '#6A0DAD' : '#C92EFF' }
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
        </View>
    );
};

// Styles
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
    },
    header: {
        fontSize: 30,
        fontWeight: "bold",
        fontFamily: "sans-serif",
        marginTop: 15
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
    },
    subjectIcon: {
        marginRight: 10,
    },
    subjectTitle: {
        fontSize: 18,
        fontWeight: 'bold',
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
    },
    materialIcon: {
        textAlign: "center",
    },
    difficulty: {
        fontSize: 14,
        fontWeight: "bold",
        paddingVertical: 5,
        paddingHorizontal: 10,
        borderRadius: 5,
        textAlign: "center",
    },
    easy: {
        backgroundColor: "#0f5132",
        color: "#d1e7dd",
    },
    medium: {
        backgroundColor: "#664d03",
        color: "#f8d775",
    },
    hard: {
        backgroundColor: "#58151c",
        color: "#f5c2c7",
    },
    col1: { flex: 2, paddingRight: 10 },
    col2: { flex: 0.8, alignItems: "center" },
    col3: { flex: 1, alignItems: "center" },
    emptyMaterials: {
        padding: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    materialDescriptionContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginHorizontal: 16,
        marginBottom: 8,
        borderTopWidth: 1,
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
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
        borderRadius: 15,
        marginTop: 20,
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

export default SubjectMaterials;