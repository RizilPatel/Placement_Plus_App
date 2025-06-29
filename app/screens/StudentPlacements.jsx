import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    Pressable,
    StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useUser } from '../../context/userContext.js';
import CustomAlert from '../../components/CustomAlert.jsx';
import { router } from 'expo-router';

const PlacementDashboard = () => {

    const [placementData, setPlacementData] = useState([])
    const [loading, setLoading] = useState(false)
    const { theme } = useUser()
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    // State for filters
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Derive unique filter options
    const branchOptions = ['', ...new Set(placementData?.map(item => item?.studentData?.branch))];
    const typeOptions = ['', 'Internship', 'Full Time', 'Internship + Full Time'];

    // Theme colors
    const themeColor = theme === 'light' ? '#6A0DAD' : '#C92EFF';
    const backgroundColor = theme === 'light' ? '#F5F5F5' : '#0D021F';
    const cardBackgroundColor = theme === 'light' ? '#FFFFFF' : '#1C1235';
    const cardBorderColor = theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : '#2A1E43';
    const textColor = theme === 'light' ? '#333333' : 'white';
    const secondaryTextColor = theme === 'light' ? '#666666' : '#BA68C8';
    const inputBackgroundColor = theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : '#1C1235';
    const emptyTextColor = theme === 'light' ? '#666666' : '#BA68C8';

    useEffect(() => {
        getStudentPlacementData()
    }, [])

    const getStudentPlacementData = async () => {
        setLoading(true)
        try {
            const accessToken = await getAccessToken()
            const refreshToken = await getRefreshToken()
            if (!accessToken || !refreshToken) {
                Alert.alert("Error", "Tokens are required, Please login again")
                return
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/placements/get-all-student-placement`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            })

            if (!response.ok) {
                const errorText = await response.text();
                console.log("Server response:", errorText);
                throw new Error(`HTTP Error ${response.status}: ${errorText}`);
            }

            const result = await response.json()
            // console.log(result);

            if (result?.statusCode === 200) {
                setPlacementData(result?.data)
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
            console.log(error.message)
            setAlertConfig({
                header: "Fetch error",
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
        } finally {
            setLoading(false)
        }
    }

    // Filtered and searched data
    const filteredData = useMemo(() => {
        return placementData.filter(item =>
            (selectedBranch === '' || item.studentData.branch === selectedBranch) &&
            (selectedType === '' || item.placementType === selectedType) &&
            (searchQuery === '' ||
                item.studentData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.studentData.rollNo.toString().includes(searchQuery) ||
                item.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [selectedBranch, selectedType, searchQuery, placementData]);

    // Render individual placement item
    const renderPlacementItem = ({ item }) => (
        <View style={[styles.placementCard, {
            backgroundColor: cardBackgroundColor,
            borderColor: cardBorderColor,
        }]}>
            {/* Student Details */}
            <View style={[styles.studentHeader, { borderBottomColor: cardBorderColor }]}>
                <Text style={[styles.studentName, { color: textColor }]}>{item?.studentData?.name || "N/A"}</Text>
                <Text style={[styles.studentRollNo, { color: secondaryTextColor }]}>Roll No: {item?.studentData?.rollNo || "-"}</Text>
            </View>

            {/* Student Additional Details */}
            <View style={styles.studentDetails}>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Branch:</Text>
                    <Text style={[styles.detailValue, { color: textColor }]}>{item?.studentData?.branch || "-"}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Semester:</Text>
                    <Text style={[styles.detailValue, { color: textColor }]}>{item?.studentData?.semester || "-"}</Text>
                </View>
            </View>

            {/* Placement Details */}
            <View style={[styles.placementDetails, { borderTopColor: cardBorderColor }]}>
                <Text style={[styles.placementTitle, { color: themeColor }]}>Placement Details</Text>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Company:</Text>
                    <Text style={[styles.companyName, { color: themeColor }]}>{item?.companyName}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Role:</Text>
                    <Text style={[styles.detailValue, { color: textColor }]}>{item?.role}</Text>
                </View>
                {item?.ctc && (
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>CTC:</Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>{item?.ctc}</Text>
                    </View>
                )}
                {item.stipend && (
                    <View style={styles.detailRow}>
                        <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Stipend:</Text>
                        <Text style={[styles.detailValue, { color: textColor }]}>{item?.stipend}</Text>
                    </View>
                )}
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Location:</Text>
                    <Text style={[styles.detailValue, { color: textColor }]}>{item?.jobLocation}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: secondaryTextColor }]}>Type:</Text>
                    <Text style={[styles.detailValue, { color: textColor }]}>{item?.placementType}</Text>
                </View>
            </View>
        </View>
    );

    // Reset filters
    const resetFilters = () => {
        setSelectedBranch('');
        setSelectedType('');
        setSearchQuery('');
    };

    if (loading) {
        return (
            <View style={{
                flex: 1,
                backgroundColor: theme === 'light' ? '#F5F5F5' : '#120023',
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
                <ActivityIndicator size="large" color="#6A0DAD" />
                <Text style={{ color: theme === 'light' ? '#333' : '#fff', marginTop: 12 }}>
                    Loading Placement Data...
                </Text>
            </View>
        )
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: backgroundColor }]}>
            {/* <Text style={[styles.title, { color: textColor }]}>Student Placement Dashboard</Text> */}

            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />

            {/* Filters Container */}
            <View style={[styles.filtersContainer, { backgroundColor: cardBackgroundColor }]}>
                {/* Search Input */}
                {/* <Pressable onPress={() => router.back()} >
                    <Ionicons name="arrow-back" size={30} color="white" />
                </Pressable>
                <View style={[styles.searchContainer, {
                    backgroundColor: inputBackgroundColor,
                    borderColor: cardBorderColor
                }]}>
                    <FontAwesome name="search" size={18} color={themeColor} style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search by Name, Roll No, or Company"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={[styles.searchInput, { color: textColor }]}
                        placeholderTextColor={secondaryTextColor}
                    />
                </View> */}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable onPress={() => router.back()} style={{ marginRight: 10, marginBottom: 10 }}>
                        <Ionicons name="arrow-back" size={30} color="white" />
                    </Pressable>

                    <View style={[styles.searchContainer, {
                        backgroundColor: inputBackgroundColor,
                        borderColor: cardBorderColor,
                        flex: 1
                    }]}>
                        <FontAwesome name="search" size={18} color={themeColor} style={styles.searchIcon} />
                        <TextInput
                            placeholder="Search by Name, Roll No, or Company"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={[styles.searchInput, { color: textColor }]}
                            placeholderTextColor={secondaryTextColor}
                        />
                    </View>
                </View>

                {/* Branch Picker */}
                <View style={styles.pickerContainer}>
                    <Text style={[styles.pickerLabel, { color: secondaryTextColor }]}>Branch:</Text>
                    <View style={[styles.pickerWrapper, {
                        backgroundColor: inputBackgroundColor,
                        borderColor: cardBorderColor
                    }]}>
                        <Picker
                            selectedValue={selectedBranch}
                            onValueChange={(itemValue) => setSelectedBranch(itemValue)}
                            style={[styles.picker, { color: textColor }]}
                            dropdownIconColor={themeColor}
                            mode="dropdown"
                        >
                            <Picker.Item
                                label="All Branches"
                                value=""
                                color={theme === 'light' ? '#333333' : '#000000'}
                            />
                            {branchOptions.filter(branch => branch !== '').map((branch, index) => (
                                <Picker.Item
                                    key={index}
                                    label={branch}
                                    value={branch}
                                    color={theme === 'light' ? '#333333' : '#000000'}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={[styles.pickerLabel, { color: secondaryTextColor }]}>Type:</Text>
                    <View style={[styles.pickerWrapper, {
                        backgroundColor: inputBackgroundColor,
                        borderColor: cardBorderColor
                    }]}>
                        <Picker
                            selectedValue={selectedType}
                            onValueChange={(itemValue) => setSelectedType(itemValue)}
                            style={[styles.picker, { color: textColor }]}
                            dropdownIconColor={themeColor}
                            mode="dropdown"
                        >
                            <Picker.Item
                                label="All Types"
                                value=""
                                color={theme === 'light' ? '#333333' : '#000000'}
                            />
                            {typeOptions.filter(type => type !== '').map((type, index) => (
                                <Picker.Item
                                    key={index}
                                    label={type}
                                    value={type}
                                    color={theme === 'light' ? '#333333' : '#000000'}
                                />
                            ))}
                        </Picker>
                    </View>
                </View>

                {/* Reset Filters Button */}
                <TouchableOpacity
                    style={[styles.resetButton, { backgroundColor: themeColor }]}
                    onPress={resetFilters}
                >
                    <Text style={styles.resetButtonText}>Reset Filters</Text>
                </TouchableOpacity>
            </View>

            {/* Placement List */}
            <FlatList
                data={filteredData}
                renderItem={renderPlacementItem}
                keyExtractor={(item) => item._id}
                ListEmptyComponent={
                    <View style={[styles.emptyContainer, { backgroundColor: inputBackgroundColor }]}>
                        <FontAwesome
                            name="search"
                            size={50}
                            color={themeColor}
                            style={styles.emptyIcon}
                        />
                        <Text style={[styles.emptyTitle, { color: textColor }]}>No Placements Found</Text>
                        <Text style={[styles.emptyText, { color: emptyTextColor }]}>
                            We couldn't find any placements that match your search criteria.
                            Try adjusting your filters or search query.
                        </Text>
                    </View>
                }
                contentContainerStyle={styles.listContainer}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 20
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginVertical: 15,
    },
    filtersContainer: {
        padding: 15,
        borderRadius: 10,
        marginHorizontal: 10,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 5,
        marginVertical: 10
    },
    pickerContainer: {
        marginBottom: 15,
    },
    pickerLabel: {
        marginBottom: 5,
        fontSize: 14,
        fontWeight: '500',
    },
    pickerWrapper: {
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 5,
        overflow: 'hidden',
    },
    picker: {
        height: 50,
        width: '100%',
        marginHorizontal: -8,
    },
    resetButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 5,
    },
    resetButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContainer: {
        paddingHorizontal: 10,
        paddingBottom: 20,
    },
    placementCard: {
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    studentHeader: {
        borderBottomWidth: 1,
        paddingBottom: 10,
        marginBottom: 10,
    },
    studentName: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    studentRollNo: {
        fontSize: 14,
        marginTop: 5,
    },
    studentDetails: {
        marginBottom: 10,
    },
    placementDetails: {
        borderTopWidth: 1,
        paddingTop: 10,
    },
    placementTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    detailLabel: {
        fontWeight: 'bold',
        marginRight: 5,
        width: 100,
    },
    detailValue: {
        flex: 1,
    },
    companyName: {
        fontWeight: 'bold',
        flex: 1,
    },
    emptyContainer: {
        padding: 30,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
        marginHorizontal: 10,
    },
    emptyIcon: {
        marginBottom: 15,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    emptyText: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 15,
    },
});

export default PlacementDashboard;