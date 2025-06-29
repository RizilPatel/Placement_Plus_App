import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
	Dimensions,
	FlatList,
	SafeAreaView,
	TextInput,
	ActivityIndicator,
	Modal,
	ScrollView,
	Pressable
} from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import { useUser } from '../../context/userContext.js';
import { useRouter } from 'expo-router';
import { getFileFromAppwrite } from '../../utils/appwrite.js';
import CustomAlert from '../../components/CustomAlert.jsx';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85; // Bigger cards, 1 per row

const AlumniPage = () => {
	const [alumniData, setAlumniData] = useState([]);
	const [filteredAlumni, setFilteredAlumni] = useState([]);
	const { theme } = useUser();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [searchText, setSearchText] = useState('');
	const [filterYear, setFilterYear] = useState('');
	const [filterCompany, setFilterCompany] = useState('');
	const [showFilters, setShowFilters] = useState(false);
	const [showYearOptions, setShowYearOptions] = useState(false);
	const [showCompanyOptions, setShowCompanyOptions] = useState(false);
	const [alertVisible, setAlertVisible] = useState(false)
	const [alertConfig, setAlertConfig] = useState({
		header: "",
		message: "",
		buttons: []
	})


	// For filter options
	const [uniqueBatchYears, setUniqueBatchYears] = useState([]);
	const [uniqueCompanies, setUniqueCompanies] = useState([]);

	useEffect(() => {
		fetchAlumniData();
	}, []);

	useEffect(() => {
		applyFilters();
	}, [searchText, filterYear, filterCompany, alumniData]);

	useEffect(() => {
		if (alumniData.length > 0) {
			// Extract unique batch years
			const years = [...new Set(alumniData.map(alum => alum.batch))].sort((a, b) => b - a);
			setUniqueBatchYears(years);

			// Extract unique company names
			const companies = new Set();
			alumniData.forEach(alum => {
				// Add current company
				if (alum.currentCompany && alum.currentCompany.name) {
					companies.add(alum.currentCompany.name);
				}

				// Add previous companies
				if (alum.previousCompany && alum.previousCompany.length > 0) {
					alum.previousCompany.forEach(company => {
						if (company.name) {
							companies.add(company.name);
						}
					});
				}
			});

			setUniqueCompanies([...companies].sort());
		}
	}, [alumniData]);

	const fetchAlumniData = async () => {
		setIsLoading(true);
		try {
			const accessToken = await getAccessToken();
			const refreshToken = await getRefreshToken();

			const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/alumnis/get-details`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'x-refresh-token': refreshToken
				}
			});

			const result = await response.json();
			if (result.statusCode === 200) {
				const alumniWithImages = await Promise.all(
					result.data.map(async (alum) => {
						if (alum?.profilePicId) {
							const url = await getFileFromAppwrite(alum?.profilePicId);
							return { ...alum, profilePicUrl: url };
						} else
							return alum;
					})
				);
				setAlumniData(alumniWithImages);
				setFilteredAlumni(alumniWithImages);
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
			console.error('Failed to fetch alumni data:', error);
			setAlertConfig({
				header: "Error",
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
		} finally {
			setIsLoading(false);
		}
	};

	const applyFilters = () => {
		let filtered = [...alumniData];

		// Filter by search text (name)
		if (searchText) {
			filtered = filtered.filter(alum =>
				alum.name.toLowerCase().includes(searchText.toLowerCase())
			);
		}

		// Filter by batch year
		if (filterYear) {
			filtered = filtered.filter(alum =>
				alum.batch.toString() === filterYear.toString()
			);
		}

		// Filter by company (current or previous)
		if (filterCompany) {
			filtered = filtered.filter(alum => {
				// Check current company
				if (alum.currentCompany &&
					alum.currentCompany.name.toLowerCase() === filterCompany.toLowerCase()) {
					return true;
				}

				// Check previous companies
				if (alum.previousCompany && alum.previousCompany.length > 0) {
					return alum.previousCompany.some(company =>
						company.name.toLowerCase() === filterCompany.toLowerCase()
					);
				}

				return false;
			});
		}

		setFilteredAlumni(filtered);
	};

	const navigateToAlumniDetail = (alumniId) => {
		router.push({
			pathname: 'screens/AlumniDetail',
			params: { id: alumniId }
		});
	};

	const renderAlumniCard = ({ item }) => {
		return (
			<TouchableOpacity
				style={styles.cardContainer}
				onPress={() => navigateToAlumniDetail(item._id)}
				activeOpacity={0.8}
			>
				<View style={styles.card}>
					<View style={styles.cardHeader}>
						<Image
							source={item.profilePicUrl && { uri: item.profilePicUrl }}
							style={styles.profileImage}
						/>
						<View style={styles.headerInfo}>
							<Text style={styles.alumniName} numberOfLines={1}>{item.name}</Text>
							<View style={styles.companyBadge}>
								<MaterialIcons name="work" size={12} color="#fff" />
								<Text style={styles.companyText} numberOfLines={1}>
									{item.currentCompany?.name || 'Not specified'}
								</Text>
							</View>
							<View style={styles.positionContainer}>
								<Text style={styles.positionText} numberOfLines={1}>
									{item.currentCompany?.position || 'Position not specified'}
								</Text>
							</View>
						</View>
					</View>

					<View style={styles.cardFooter}>
						<View style={styles.batchContainer}>
							<MaterialIcons name="school" size={16} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
							<Text style={styles.batchText}>Batch of {item.batch}</Text>
						</View>
						<TouchableOpacity style={styles.viewProfileButton} onPress={() => navigateToAlumniDetail(item._id)}>
							<Text style={styles.viewProfileText}>View Profile</Text>
						</TouchableOpacity>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	const toggleFilters = () => {
		setShowFilters(!showFilters);
	};

	const clearFilters = () => {
		setSearchText('');
		setFilterYear('');
		setFilterCompany('');
	};

	const selectBatchYear = (year) => {
		setFilterYear(year.toString());
		setShowYearOptions(false);
	};

	const selectCompany = (company) => {
		setFilterCompany(company);
		setShowCompanyOptions(false);
	};

	const getStyles = (currentTheme) => StyleSheet.create({
		container: {
			flex: 1,
			backgroundColor: currentTheme === 'light' ? '#F5F5F5' : '#120023',
		},
		header: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			width: '100%',
			paddingTop: 10,
			paddingBottom: 8,
			paddingHorizontal: 16,
			borderBottomWidth: 1,
			borderBottomColor: currentTheme === 'light' ? '#E0E0E0' : 'rgba(255, 255, 255, 0.05)',
			marginTop: 20,
		},
		logoContainer: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		logo: {
			width: 28,
			height: 28,
			resizeMode: 'contain',
			marginRight: 8,
		},
		logoText: {
			color: currentTheme === 'light' ? '#6A0DAD' : 'white',
			fontSize: 18,
			fontWeight: '700',
			marginLeft: 10
		},
		profileButton: {
			padding: 4,
		},
		searchContainer: {
			marginTop: 10,
			paddingHorizontal: 16,
			paddingBottom: 10,
		},
		searchInputContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: currentTheme === 'light' ? 'white' : '#2c0847',
			borderRadius: 16,
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderWidth: 1,
			borderColor: currentTheme === 'light' ? '#E0E0E0' : 'rgba(255, 255, 255, 0.1)',
		},
		searchInput: {
			flex: 1,
			fontSize: 16,
			color: currentTheme === 'light' ? '#333' : 'white',
			paddingVertical: 8,
			marginLeft: 8,
		},
		filtersToggleContainer: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginTop: 8,
			paddingHorizontal: 16,
		},
		filtersToggleButton: {
			flexDirection: 'row',
			alignItems: 'center',
			padding: 6,
		},
		filtersToggleText: {
			color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
			marginLeft: 4,
			fontWeight: '500',
		},
		clearFiltersButton: {
			padding: 6,
		},
		clearFiltersText: {
			color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
			fontWeight: '500',
		},
		filtersContainer: {
			paddingHorizontal: 16,
			paddingVertical: 10,
			backgroundColor: currentTheme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(139, 8, 144, 0.15)',
			borderRadius: 16,
			marginHorizontal: 16,
			marginBottom: 10,
		},
		filterInputContainer: {
			marginBottom: 12,
		},
		filterLabel: {
			color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
			fontSize: 14,
			marginBottom: 4,
			fontWeight: '500',
		},
		filterSelectContainer: {
			backgroundColor: currentTheme === 'light' ? 'white' : '#2c0847',
			borderRadius: 12,
			paddingHorizontal: 12,
			paddingVertical: 12,
			fontSize: 14,
			color: currentTheme === 'light' ? '#333' : 'white',
			borderWidth: 1,
			borderColor: currentTheme === 'light' ? '#E0E0E0' : 'rgba(255, 255, 255, 0.1)',
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		filterSelectText: {
			color: currentTheme === 'light' ? '#333' : 'white',
			fontSize: 15,
		},
		filterPlaceholderText: {
			color: currentTheme === 'light' ? '#999' : '#777',
			fontSize: 15,
		},
		modalOverlay: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			backgroundColor: 'rgba(0, 0, 0, 0.5)',
		},
		modalContent: {
			width: '80%',
			maxHeight: '70%',
			backgroundColor: currentTheme === 'light' ? 'white' : '#2c0847',
			borderRadius: 16,
			padding: 16,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.25,
			shadowRadius: 3.84,
			elevation: 5,
		},
		modalTitle: {
			fontSize: 18,
			fontWeight: '600',
			color: currentTheme === 'light' ? '#333' : 'white',
			marginBottom: 16,
			textAlign: 'center',
		},
		optionItem: {
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: currentTheme === 'light' ? '#eee' : 'rgba(255, 255, 255, 0.1)',
		},
		optionText: {
			fontSize: 16,
			color: currentTheme === 'light' ? '#333' : 'white',
		},
		modalCloseButton: {
			marginTop: 16,
			alignSelf: 'center',
			paddingVertical: 8,
			paddingHorizontal: 24,
			backgroundColor: currentTheme === 'light' ? '#6A0DAD' : '#8b0890',
			borderRadius: 8,
		},
		modalCloseButtonText: {
			color: 'white',
			fontWeight: '600',
			fontSize: 16,
		},
		resultsInfo: {
			paddingHorizontal: 16,
			marginTop: 4,
			marginBottom: 8,
		},
		resultsText: {
			color: currentTheme === 'light' ? '#666' : '#ccc',
			fontSize: 14,
		},
		cardsContainer: {
			paddingHorizontal: 16,
			paddingBottom: 20,
			alignItems: 'center',
		},
		cardContainer: {
			width: CARD_WIDTH,
			marginVertical: 10,
		},
		card: {
			backgroundColor: currentTheme === 'light' ? '#FFFFFF' : '#2c0847',
			borderRadius: 16,
			padding: 16,
			shadowColor: currentTheme === 'light' ? '#6A0DAD' : '#e535f7',
			shadowOffset: { width: 0, height: 4 },
			shadowOpacity: currentTheme === 'light' ? 0.1 : 0.3,
			shadowRadius: 8,
			elevation: 5,
			borderWidth: currentTheme === 'light' ? 1 : 0,
			borderColor: currentTheme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'transparent',
		},
		cardHeader: {
			flexDirection: 'row',
			alignItems: 'center',
			marginBottom: 12,
		},
		profileImage: {
			width: 70,
			height: 70,
			borderRadius: 35,
			marginRight: 16,
			borderWidth: 2,
			borderColor: currentTheme === 'light' ? 'rgba(136, 19, 220, 0.8)' : 'rgba(255, 255, 255, 0.2)',
		},
		headerInfo: {
			flex: 1,
		},
		alumniName: {
			fontSize: 18,
			fontWeight: '700',
			color: currentTheme === 'light' ? '#222' : '#fff',
			marginBottom: 6,
		},
		companyBadge: {
			flexDirection: 'row',
			alignItems: 'center',
			backgroundColor: currentTheme === 'light' ? '#6A0DAD' : '#8b0890',
			borderRadius: 10,
			paddingHorizontal: 8,
			paddingVertical: 3,
			alignSelf: 'flex-start',
			marginBottom: 6,
		},
		companyText: {
			color: 'white',
			fontSize: 12,
			fontWeight: '600',
			marginLeft: 4,
		},
		positionContainer: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		positionText: {
			fontSize: 14,
			color: currentTheme === 'light' ? '#666' : '#ddd',
			flex: 1,
		},
		cardFooter: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			marginTop: 12,
			paddingTop: 12,
			borderTopWidth: 1,
			borderTopColor: currentTheme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.1)',
		},
		batchContainer: {
			flexDirection: 'row',
			alignItems: 'center',
		},
		batchText: {
			fontSize: 14,
			color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
			marginLeft: 6,
			fontWeight: '500',
		},
		viewProfileButton: {
			backgroundColor: currentTheme === 'light' ? 'rgba(106, 13, 173, 0.1)' : 'rgba(139, 8, 144, 0.3)',
			paddingHorizontal: 12,
			paddingVertical: 6,
			borderRadius: 12,
		},
		viewProfileText: {
			color: currentTheme === 'light' ? '#6A0DAD' : '#f0c5f1',
			fontSize: 13,
			fontWeight: '600',
		},
		footer: {
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			marginTop: 'auto',
			marginBottom: 12,
			paddingTop: 12,
			borderTopWidth: 1,
			borderTopColor: currentTheme === 'light' ? '#E0E0E0' : 'rgba(255, 255, 255, 0.08)',
		},
		socialButton: {
			width: 32,
			height: 32,
			borderRadius: 16,
			backgroundColor: currentTheme === 'light' ? 'rgba(106, 13, 173, 0.7)' : 'rgba(139, 8, 144, 0.7)',
			justifyContent: 'center',
			alignItems: 'center',
			marginHorizontal: 8,
		},
		loaderContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
		},
		emptyStateContainer: {
			flex: 1,
			justifyContent: 'center',
			alignItems: 'center',
			paddingHorizontal: 24,
		},
		emptyStateText: {
			fontSize: 16,
			color: currentTheme === 'light' ? '#666' : '#ccc',
			textAlign: 'center',
			marginTop: 8,
		},
	});

	const styles = useMemo(() => getStyles(theme), [theme]);

	if (isLoading) {
		return (
			<View style={[styles.container, styles.loaderContainer]}>
				<StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
				<ActivityIndicator size="large" color="#6A0DAD" />
				<Text style={{ color: theme === 'light' ? '#333' : '#fff', marginTop: 12 }}>
					Loading alumni data...
				</Text>
			</View>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

			<CustomAlert
				visible={alertVisible}
				header={alertConfig.header}
				message={alertConfig.message}
				buttons={alertConfig.buttons}
				onClose={() => setAlertVisible(false)}
			/>

			{/* Header with Logo */}
			<View style={styles.header}>
				<View style={styles.logoContainer}>
					<Pressable onPress={() => router.back()} style={styles.backButton}>
						<Ionicons name="arrow-back" size={24} color="#fff" />
					</Pressable>
					<Text style={styles.logoText}>Connect with Alumni</Text>
				</View>
				<TouchableOpacity
					style={styles.profileButton}
					onPress={() => router.push('screens/Profile/Profile')}
				>
					<Ionicons name="person-circle" size={32} color="#6A0DAD" />
				</TouchableOpacity>
			</View>

			{/* Search Bar */}
			<View style={styles.searchContainer}>
				<View style={styles.searchInputContainer}>
					<Ionicons name="search" size={20} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
					<TextInput
						style={styles.searchInput}
						placeholder="Search alumni by name..."
						placeholderTextColor={theme === 'light' ? '#999' : '#777'}
						value={searchText}
						onChangeText={setSearchText}
					/>
				</View>

				<View style={styles.filtersToggleContainer}>
					<TouchableOpacity style={styles.filtersToggleButton} onPress={toggleFilters}>
						<Ionicons
							name={showFilters ? "chevron-up-circle" : "options"}
							size={20}
							color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'}
						/>
						<Text style={styles.filtersToggleText}>
							{showFilters ? "Hide Filters" : "Show Filters"}
						</Text>
					</TouchableOpacity>

					{(searchText || filterYear || filterCompany) && (
						<TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
							<Text style={styles.clearFiltersText}>Clear All</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Filter Controls */}
			{showFilters && (
				<View style={styles.filtersContainer}>
					<View style={styles.filterInputContainer}>
						<Text style={styles.filterLabel}>Batch Year</Text>
						<TouchableOpacity
							style={styles.filterSelectContainer}
							onPress={() => setShowYearOptions(true)}
						>
							<Text style={filterYear ? styles.filterSelectText : styles.filterPlaceholderText}>
								{filterYear || "Select batch year..."}
							</Text>
							<Ionicons name="chevron-down" size={18} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
						</TouchableOpacity>
					</View>
					<View style={styles.filterInputContainer}>
						<Text style={styles.filterLabel}>Company</Text>
						<TouchableOpacity
							style={styles.filterSelectContainer}
							onPress={() => setShowCompanyOptions(true)}
						>
							<Text style={filterCompany ? styles.filterSelectText : styles.filterPlaceholderText}>
								{filterCompany || "Select company..."}
							</Text>
							<Ionicons name="chevron-down" size={18} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
						</TouchableOpacity>
					</View>
				</View>
			)}

			{/* Results Count */}
			<View style={styles.resultsInfo}>
				<Text style={styles.resultsText}>
					{filteredAlumni.length} {filteredAlumni.length === 1 ? 'alumnus' : 'alumni'} found
				</Text>
			</View>

			{filteredAlumni.length > 0 ? (
				<FlatList
					data={filteredAlumni}
					renderItem={renderAlumniCard}
					keyExtractor={(item) => item._id}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={styles.cardsContainer}
				/>
			) : (
				<View style={styles.emptyStateContainer}>
					<Ionicons name="search-outline" size={48} color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
					<Text style={styles.emptyStateText}>No alumni match your search criteria. Try adjusting your filters.</Text>
				</View>
			)}

			{/* Footer with Social Media Icons */}
			{/* <View style={styles.footer}>
				<TouchableOpacity style={styles.socialButton}>
					<FontAwesome name="facebook" size={20} color="#fff" />
				</TouchableOpacity>
				<TouchableOpacity style={styles.socialButton}>
					<FontAwesome name="twitter" size={20} color="#fff" />
				</TouchableOpacity>
				<TouchableOpacity style={styles.socialButton}>
					<FontAwesome name="instagram" size={20} color="#fff" />
				</TouchableOpacity>
				<TouchableOpacity style={styles.socialButton}>
					<FontAwesome name="linkedin" size={20} color="#fff" />
				</TouchableOpacity>
			</View> */}

			{/* Batch Year Selection Modal */}
			<Modal
				visible={showYearOptions}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowYearOptions(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Select Batch Year</Text>
						<ScrollView>
							{uniqueBatchYears.map((year) => (
								<TouchableOpacity
									key={year}
									style={styles.optionItem}
									onPress={() => selectBatchYear(year)}
								>
									<Text style={styles.optionText}>{year}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
						<TouchableOpacity
							style={styles.modalCloseButton}
							onPress={() => setShowYearOptions(false)}
						>
							<Text style={styles.modalCloseButtonText}>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>

			{/* Company Selection Modal */}
			<Modal
				visible={showCompanyOptions}
				transparent={true}
				animationType="fade"
				onRequestClose={() => setShowCompanyOptions(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Select Company</Text>
						<ScrollView>
							{uniqueCompanies.map((company) => (
								<TouchableOpacity
									key={company}
									style={styles.optionItem}
									onPress={() => selectCompany(company)}
								>
									<Text style={styles.optionText}>{company}</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
						<TouchableOpacity
							style={styles.modalCloseButton}
							onPress={() => setShowCompanyOptions(false)}
						>
							<Text style={styles.modalCloseButtonText}>Close</Text>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
};

export default AlumniPage;