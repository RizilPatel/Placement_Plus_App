import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    ScrollView,
    TextInput,
    Pressable,
    FlatList,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { useUser } from '../../../context/userContext.js';
import { getAccessToken, getRefreshToken } from '../../../utils/tokenStorage.js';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { encode } from 'base64-arraybuffer';
import * as IntentLauncher from 'expo-intent-launcher';
import { router } from 'expo-router';

const getAllBranches = (companyData) => {
    const branchesSet = new Set();
    companyData.forEach(company => {
        company.eligibleBranches.forEach(branch => {
            branchesSet.add(branch);
        });
    });
    return Array.from(branchesSet);
};

const getAllRoles = (companyData) => {
    const rolesSet = new Set();
    companyData.forEach(company => {
        rolesSet.add(company.role);
    });
    return Array.from(rolesSet);
};

export default function CompanyDataPage() {
    const { theme } = useUser()
    const [searchQuery, setSearchQuery] = useState('');
    const [companies, setCompanies] = useState([]);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);

    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        filterCompanies();
    }, [searchQuery, selectedCompany, selectedBranch, selectedRole]);

    useEffect(() => {
        fetchAllCompanies()
    }, []);


    const fetchAllCompanies = async () => {
        try {

            const accessToken = await getAccessToken()
            const refreshToken = await getRefreshToken()

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/companies/list-all-company-for-admin`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': `${refreshToken}`
                }
            });

            const result = await response.json();
            console.log(result);


            if (!response.ok) {
                Alert.alert('Error', result.message || 'Failed to fetch companies');
                return;
            }

            if (result.statusCode === 200) {
                setCompanies(result.data);
                return result.data
            } else {
                Alert.alert('Error', result?.message || "Something went wrong. Please try again later")
                return;
            }
        } catch (error) {
            Alert.alert(
                "Error",
                error.message || "Something went wrong. Please try again.",
                [{ text: "OK" }]
            );
            console.error('Error:', error.message);
        }
    };

    const getStudentData = async (companyId) => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();
            if (!accessToken || !refreshToken) {
                Alert.alert('Error', "Tokens are required. Please login again");
                return;
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/admins/export-student-data-to-excel/c/${companyId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok) {
                throw new Error("Failed to download file");
            }

            const arrayBuffer = await response.arrayBuffer();
            const base64Data = encode(arrayBuffer);
            const fileUri = FileSystem.documentDirectory + 'exported_data.xlsx';

            await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 })

            const fileInfo = await FileSystem.getInfoAsync(fileUri);
            if (!fileInfo.exists) {
                Alert.alert('Error', "File saving failed");
                return;
            }

            if (Platform.OS === 'android') {
                const contentUri = await FileSystem.getContentUriAsync(fileUri);
                await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                    data: contentUri,
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    flags: 1
                });
            } else {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: 'Open Excel File With...'
                });
            }

        } catch (error) {
            Alert.alert('Error', error?.message || "Something went wrong. Please try again later");
            console.log("error: ", error?.message);
        }
    }

    const filterCompanies = () => {
        let filteredData = [...companies];

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredData = filteredData.filter(company =>
                company.companyName.toLowerCase().includes(query) ||
                company.role.toLowerCase().includes(query) ||
                company.eligibleBranches.some(branch => branch.toLowerCase().includes(query)) ||
                company.schedule.toLowerCase().includes(query)
            );
        }

        if (selectedCompany) {
            filteredData = filteredData.filter(company =>
                company.companyName === selectedCompany
            );
        }

        if (selectedBranch) {
            filteredData = filteredData.filter(company =>
                company.eligibleBranches.includes(selectedBranch)
            );
        }

        if (selectedRole) {
            filteredData = filteredData.filter(company =>
                company.role === selectedRole
            );
        }

        setCompanies(filteredData);
    };

    const resetFilters = () => {
        setSelectedCompany('');
        setSelectedBranch('');
        setSelectedRole('');
        setFilterModalVisible(false);
    };

    const applyFilters = () => {
        setFilterModalVisible(false);
    };

    const getDynamicStyles = (currentTheme) => StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: currentTheme === 'light' ? "#F5F5F5" : "#14011F",
        },
        backgroundGradient: {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
        },
        header: {
            flexDirection: "row",
            justifyContent: "flex-start",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: Platform.OS === 'android' ? 10 : 10,
            paddingBottom: 16,
            borderBottomWidth: currentTheme === 'light' ? 1 : 0,
            borderBottomColor: currentTheme === 'light' ? "#E0E0E0" : "transparent",
        },
        headerText: {
            color: currentTheme === 'light' ? "#6A0DAD" : "white",
            fontSize: 24,
            fontWeight: "bold",
            marginLeft: 20
        },
        subtitle: {
            color: currentTheme === 'light' ? "#666666" : "#BBB",
            fontSize: 16,
            marginTop: 4,
            paddingHorizontal: 16,
            marginBottom: 16,
        },
        searchContainer: {
            paddingHorizontal: 16,
            marginBottom: 16,
        },
        searchBar: {
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: currentTheme === 'light' ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.08)",
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderWidth: 1,
            borderColor: currentTheme === 'light' ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.05)",
        },
        searchIcon: {
            marginRight: 12,
            color: currentTheme === 'light' ? "#666666" : "#9D9DB5",
        },
        searchInput: {
            flex: 1,
            color: currentTheme === 'light' ? "#333333" : "white",
            fontSize: 16,
            padding: 0,
        },
        filterButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: currentTheme === 'light' ? "#6A0DAD20" : "rgba(201, 46, 255, 0.2)",
            borderRadius: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginLeft: 8,
            borderWidth: 1,
            borderColor: currentTheme === 'light' ? "#6A0DAD40" : "rgba(201, 46, 255, 0.3)",
        },
        filterText: {
            color: currentTheme === 'light' ? "#6A0DAD" : "#C92EFF",
            marginLeft: 4,
            fontWeight: '500',
        },
        activeFiltersText: {
            color: currentTheme === 'light' ? "#6A0DAD" : "#C92EFF",
            fontStyle: 'italic',
            fontSize: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
        },
        cardsContainer: {
            paddingHorizontal: 16,
            paddingBottom: 20,
        },
        card: {
            backgroundColor: currentTheme === 'light' ? "white" : "rgba(29, 10, 63, 0.6)",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            borderWidth: 1,
            borderColor: currentTheme === 'light' ? "rgba(0, 0, 0, 0.1)" : "rgba(255, 255, 255, 0.05)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: currentTheme === 'light' ? 0.1 : 0.3,
            shadowRadius: 4,
            elevation: 3,
        },
        companyName: {
            color: currentTheme === 'light' ? "#6A0DAD" : "#C92EFF",
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 8,
        },
        role: {
            color: currentTheme === 'light' ? "#333333" : "white",
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 8,
        },
        infoRow: {
            flexDirection: "row",
            marginBottom: 6,
            alignItems: 'flex-start',
        },
        infoLabel: {
            color: currentTheme === 'light' ? "#666666" : "#9D9DB5",
            fontSize: 14,
            fontWeight: "500",
            marginRight: 4,
            width: 110,
        },
        infoText: {
            color: currentTheme === 'light' ? "#333333" : "white",
            fontSize: 14,
            flex: 1,
        },
        noResults: {
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 60,
        },
        noResultsText: {
            color: currentTheme === 'light' ? "#333333" : "white",
            fontSize: 18,
            fontWeight: "600",
            marginTop: 16,
        },
        noResultsSubText: {
            color: currentTheme === 'light' ? "#666666" : "#9D9DB5",
            fontSize: 14,
            marginTop: 8,
        },
        modalContainer: {
            backgroundColor: currentTheme === 'light' ? "#FFFFFF" : "#1D0A3F",
            borderRadius: 20,
            padding: 16,
            maxHeight: '80%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: currentTheme === 'light' ? "#E0E0E0" : "rgba(255, 255, 255, 0.1)",
            paddingBottom: 8,
        },
        modalTitle: {
            color: currentTheme === 'light' ? "#6A0DAD" : "white",
            fontSize: 20,
            fontWeight: 'bold',
        },
        filterSection: {
            marginBottom: 16,
        },
        filterSectionTitle: {
            color: currentTheme === 'light' ? "#333333" : "#9D9DB5",
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 12,
        },
        optionsList: {
            marginBottom: 8,
        },
        optionItem: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 10,
            paddingHorizontal: 8,
            borderRadius: 8,
            backgroundColor: currentTheme === 'light' ? "#F5F5F5" : "rgba(255, 255, 255, 0.05)",
            marginBottom: 8,
        },
        optionItemSelected: {
            backgroundColor: currentTheme === 'light' ? "#6A0DAD20" : "rgba(201, 46, 255, 0.2)",
            borderWidth: 1,
            borderColor: currentTheme === 'light' ? "#6A0DAD" : "#C92EFF",
        },
        optionText: {
            color: currentTheme === 'light' ? "#333333" : "white",
            fontSize: 16,
            marginLeft: 8,
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 16,
        },
        modalButton: {
            flex: 1,
            marginHorizontal: 8,
            borderRadius: 12,
            overflow: 'hidden',
        },
        resetButton: {
            backgroundColor: currentTheme === 'light' ? "#E0E0E0" : "rgba(255, 255, 255, 0.1)",
            paddingVertical: 12,
            alignItems: 'center',
        },
        resetButtonText: {
            color: currentTheme === 'light' ? "#333333" : "white",
            fontSize: 16,
            fontWeight: '600',
        },
        applyButtonGradient: {
            paddingVertical: 12,
            alignItems: 'center',
        },
        applyButtonText: {
            color: "white",
            fontSize: 16,
            fontWeight: '600',
        },
        chipContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 4,
        },
        chip: {
            backgroundColor: currentTheme === 'light' ? "#6A0DAD20" : "rgba(147, 50, 255, 0.2)",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginRight: 6,
            marginBottom: 6,
        },
        chipText: {
            color: currentTheme === 'light' ? "#6A0DAD" : "#9332FF",
            fontSize: 12,
            fontWeight: '500',
        },
        downloadButton: {
            backgroundColor: currentTheme === 'light' ? "#6A0DAD20" : "rgba(147, 50, 255, 0.2)",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 8,
            marginTop: 8
        },
        downloadText: {
            color: currentTheme === 'light' ? "#6A0DAD" : "white",
            fontSize: 16,
            textAlign: 'center',
            fontWeight: '700'
        }
    });
    const dynamicStyles = getDynamicStyles(theme);

    const renderCompanyCard = ({ item }) => (
        <View style={dynamicStyles.card}>
            <Text style={dynamicStyles.companyName}>{item.companyName}</Text>
            <Text style={dynamicStyles.role}>{item.role}</Text>

            <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Branches:</Text>
                <View style={dynamicStyles.chipContainer}>
                    {item.eligibleBranches.map((branch, index) => (
                        <View key={index} style={dynamicStyles.chip}>
                            <Text style={dynamicStyles.chipText}>{branch}</Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Batch:</Text>
                <Text style={dynamicStyles.infoText}>{item.eligibleBatch.join(', ')}</Text>
            </View>

            <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Schedule:</Text>
                <Text style={dynamicStyles.infoText}>{item.schedule}</Text>
            </View>

            <Pressable style={dynamicStyles.downloadButton} onPress={() => getStudentData(item._id)}>
                <Text style={dynamicStyles.downloadText}>Download Applied Students Data</Text>
            </Pressable>
        </View>
    );

    const uniqueCompanies = Array.from(new Set(companies.map(company => company.companyName)));
    const uniqueBranches = getAllBranches(companies);
    const uniqueRoles = getAllRoles(companies);

    const activeFiltersCount = [selectedCompany, selectedBranch, selectedRole].filter(Boolean).length;

    return (
        <SafeAreaView style={dynamicStyles.container}>
            <LinearGradient
                colors={theme === 'dark'
                    ? ['#1D0A3F', '#14011F']
                    : ['#FFFFFF', '#F5F5F5']
                }
                style={dynamicStyles.backgroundGradient}
            />

            <View style={dynamicStyles.header}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={dynamicStyles.headerText}>Company Opportunities</Text>
            </View>

            <Text style={dynamicStyles.subtitle}>Explore available placement opportunities</Text>

            <View style={[dynamicStyles.searchContainer, { flexDirection: 'row' }]}>
                <View style={[dynamicStyles.searchBar, { flex: 1 }]}>
                    <Ionicons
                        name="search"
                        size={20}
                        style={dynamicStyles.searchIcon}
                    />
                    <TextInput
                        placeholder="Search companies, roles..."
                        style={dynamicStyles.searchInput}
                        placeholderTextColor={theme === 'light' ? "#666666" : "#9D9DB5"}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <Pressable onPress={() => setSearchQuery("")}>
                            <Ionicons
                                name="close-circle"
                                size={20}
                                color={theme === 'light' ? "#666666" : "#9D9DB5"}
                            />
                        </Pressable>
                    )}
                </View>

                <Pressable
                    style={dynamicStyles.filterButton}
                    onPress={() => setFilterModalVisible(true)}
                >
                    <Ionicons
                        name="filter"
                        size={18}
                        color={theme === 'light' ? "#6A0DAD" : "#C92EFF"}
                    />
                    <Text style={dynamicStyles.filterText}>
                        {activeFiltersCount > 0 ? `Filters (${activeFiltersCount})` : 'Filter'}
                    </Text>
                </Pressable>
            </View>

            {activeFiltersCount > 0 && (
                <Text style={dynamicStyles.activeFiltersText}>
                    Filters applied: {[
                        selectedCompany && `Company: ${selectedCompany}`,
                        selectedBranch && `Branch: ${selectedBranch}`,
                        selectedRole && `Role: ${selectedRole}`
                    ].filter(Boolean).join(', ')}
                </Text>
            )}

            {companies.length > 0 ? (
                <FlatList
                    data={companies}
                    renderItem={renderCompanyCard}
                    keyExtractor={item => item._id}
                    contentContainerStyle={dynamicStyles.cardsContainer}
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View style={dynamicStyles.noResults}>
                    <Ionicons
                        name="search-outline"
                        size={50}
                        color={theme === 'light' ? "#666666" : "#3A3A5A"}
                    />
                    <Text style={dynamicStyles.noResultsText}>No matching companies found</Text>
                    <Text style={dynamicStyles.noResultsSubText}>Try different search terms or filters</Text>
                </View>
            )}

            {/* Filter Modal */}
            <Modal
                isVisible={isFilterModalVisible}
                onBackdropPress={() => setFilterModalVisible(false)}
                backdropOpacity={0.5}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                style={{ margin: 20 }}
            >
                <View style={dynamicStyles.modalContainer}>
                    <View style={dynamicStyles.modalHeader}>
                        <Text style={dynamicStyles.modalTitle}>Filter Companies</Text>
                        <Pressable onPress={() => setFilterModalVisible(false)}>
                            <Ionicons
                                name="close"
                                size={24}
                                color={theme === 'light' ? "#333333" : "white"}
                            />
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Company Filter */}
                        <View style={dynamicStyles.filterSection}>
                            <Text style={dynamicStyles.filterSectionTitle}>Company</Text>
                            <ScrollView
                                style={dynamicStyles.optionsList}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                            >
                                {uniqueCompanies.map((company, index) => (
                                    <Pressable
                                        key={index}
                                        style={[
                                            dynamicStyles.optionItem,
                                            selectedCompany === company ? dynamicStyles.optionItemSelected : null,
                                            { marginRight: 8, paddingHorizontal: 12 }
                                        ]}
                                        onPress={() => setSelectedCompany(selectedCompany === company ? '' : company)}
                                    >
                                        <Text style={dynamicStyles.optionText}>{company}</Text>
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>

                        {/* Branch Filter */}
                        <View style={dynamicStyles.filterSection}>
                            <Text style={dynamicStyles.filterSectionTitle}>Branch</Text>
                            <View style={dynamicStyles.optionsList}>
                                {uniqueBranches.map((branch, index) => (
                                    <Pressable
                                        key={index}
                                        style={[
                                            dynamicStyles.optionItem,
                                            selectedBranch === branch ? dynamicStyles.optionItemSelected : null
                                        ]}
                                        onPress={() => setSelectedBranch(selectedBranch === branch ? '' : branch)}
                                    >
                                        <MaterialIcons
                                            name={selectedBranch === branch ? "check-circle" : "circle"}
                                            size={20}
                                            color={theme === 'light' ? "#6A0DAD" : "#C92EFF"}
                                        />
                                        <Text style={dynamicStyles.optionText}>{branch}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        {/* Role Filter */}
                        <View style={dynamicStyles.filterSection}>
                            <Text style={dynamicStyles.filterSectionTitle}>Role</Text>
                            <View style={dynamicStyles.optionsList}>
                                {uniqueRoles.map((role, index) => (
                                    <Pressable
                                        key={index}
                                        style={[
                                            dynamicStyles.optionItem,
                                            selectedRole === role ? dynamicStyles.optionItemSelected : null
                                        ]}
                                        onPress={() => setSelectedRole(selectedRole === role ? '' : role)}
                                    >
                                        <MaterialIcons
                                            name={selectedRole === role ? "check-circle" : "circle"}
                                            size={20}
                                            color={theme === 'light' ? "#6A0DAD" : "#C92EFF"}
                                        />
                                        <Text style={dynamicStyles.optionText}>{role}</Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>
                    </ScrollView>

                    <View style={dynamicStyles.buttonRow}>
                        <Pressable
                            style={[dynamicStyles.modalButton, dynamicStyles.resetButton]}
                            onPress={resetFilters}
                        >
                            <Text style={dynamicStyles.resetButtonText}>Reset All</Text>
                        </Pressable>
                        <Pressable
                            style={dynamicStyles.modalButton}
                            onPress={applyFilters}
                        >
                            <LinearGradient
                                colors={['#C92EFF', '#9332FF']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={dynamicStyles.applyButtonGradient}
                            >
                                <Text style={dynamicStyles.applyButtonText}>Apply Filters</Text>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}