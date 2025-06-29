import React, { useState, useEffect } from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	StatusBar,
	ScrollView,
	SafeAreaView,
	TextInput,
	ActivityIndicator,
	Pressable
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import { useUser } from '../../context/userContext.js';
import { router } from 'expo-router';
import CustomAlert from '../../components/CustomAlert.jsx';

const imageMap = {
	'Google.png': require('@/assets/companyImages/Google-new.png'),
	'Microsoft.png': require('@/assets/companyImages/Microsoft.png'),
	'Amazon.png': require('@/assets/companyImages/amazon2.png'),
	// 'Adobe.png': require('@/assets/companyImages/adobe.png'),
	// 'Samsung R&D.png': require('@/assets/companyImages/samsung.png'),
	// 'Default.png': require('@/assets/companyImages/company-default.png')
	'Meta.png': require('@/assets/companyImages/meta-new.webp'),
};

const PastRecruiters = () => {
	const [recruiters, setRecruiters] = useState([]);
	const [filteredRecruiters, setFilteredRecruiters] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState('');
	const { theme } = useUser();
	const [alertVisible, setAlertVisible] = useState(false)
	const [alertConfig, setAlertConfig] = useState({
		header: "",
		message: "",
		buttons: []
	})

	useEffect(() => {
		fetchPastRecruiters();
	}, []);

	useEffect(() => {
		if (recruiters.length > 0) {
			applyFilters();
		}
	}, [recruiters, searchQuery]);

	const fetchPastRecruiters = async () => {
		setIsLoading(true);
		try {
			const accessToken = await getAccessToken();
			const refreshToken = await getRefreshToken();

			const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/past-recruiter/get-all-recruiter`, {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${accessToken}`,
					'x-refresh-token': `${refreshToken}`
				}
			});

			if (!response.ok) {
				const error = await response.text()
				console.log(error);

				throw new Error(result?.message || 'Failed to fetch past recruiters');
			}

			const result = await response.json();

			if (result.statusCode === 200) {
				setRecruiters(result.data);
				setFilteredRecruiters(result.data);
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
			console.error('Error:', error.message);
		} finally {
			setIsLoading(false);
		}
	};

	const applyFilters = () => {
		if (!searchQuery) {
			setFilteredRecruiters(recruiters);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = recruiters.filter(recruiter => {
			const companyNameMatch = recruiter.companyName.toLowerCase().includes(query);

			// Check if any role name matches the query
			const roleMatch = recruiter.roles.some(role =>
				role.roleName.toLowerCase().includes(query)
			);

			return companyNameMatch || roleMatch;
		});

		setFilteredRecruiters(filtered);
	};

	const handleRecruiterPress = (recruiter) => {
		router.push({
			pathname: 'screens/RecruiterDetail',
			params: { recruiterId: recruiter._id }
		});
	};

	const getCompanyImage = (companyName) => {
		const imageName = `${companyName}.png`;
		return imageMap[imageName] || imageMap['Default.png'];
	};

	// Theme-based colors
	const backgroundGradientColors = theme === 'light'
		? ['#F5F5F5', '#E0E0E0']
		: ['#2d0e3e', '#1a012c'];

	const statusBarStyle = theme === 'light' ? 'dark-content' : 'light-content';
	const statusBarBackgroundColor = theme === 'light' ? '#F5F5F5' : '#2d0e3e';
	const searchBgColor = theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(50, 8, 74, 0.9)';
	const searchTextColor = theme === 'light' ? '#333' : 'white';
	const searchPlaceholderColor = theme === 'light' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)';

	const renderRecruiterCard = (recruiter) => {
		const cardBackgroundColors = theme === 'light'
			? ['#FFFFFF', '#F0F0F0']
			: ['rgba(138, 35, 135, 0.8)', 'rgba(26, 1, 44, 0.9)'];

		const companyNameColor = theme === 'light' ? "#6A0DAD" : 'white';
		const textColor = theme === 'light' ? '#333333' : 'white';
		const subtextColor = theme === 'light' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)';

		return (
			<TouchableOpacity
				key={recruiter._id}
				style={styles.cardWrapper}
				onPress={() => handleRecruiterPress(recruiter)}
			>
				<LinearGradient
					colors={cardBackgroundColors}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 1 }}
					style={[
						styles.recruiterCard,
						{
							backgroundColor: theme === 'light'
								? 'rgba(106, 13, 173, 0.05)'
								: 'transparent'
						}
					]}
				>
					<View style={styles.cardHeader}>
						<Image
							source={getCompanyImage(recruiter.companyName)}
							style={styles.companyLogo}
						/>
						<View style={styles.cardHeaderText}>
							<Text style={[styles.companyCardName, { color: companyNameColor }]}>
								{recruiter.companyName}
							</Text>
							<Text style={[styles.roleCount, { color: subtextColor }]}>
								{recruiter.roles.length} {recruiter.roles.length === 1 ? 'Role' : 'Roles'}
							</Text>
						</View>
					</View>

					<View style={[
						styles.cardDivider,
						{
							backgroundColor: theme === 'light'
								? 'rgba(106, 13, 173, 0.2)'
								: 'rgba(255, 255, 255, 0.15)'
						}
					]} />

					<View style={styles.cardDetails}>
						<View style={styles.detailRow}>
							<View style={styles.detailItem}>
								<FontAwesome
									name="graduation-cap"
									size={14}
									color={theme === 'light' ? '#6A0DAD' : '#fff'}
									style={styles.detailIcon}
								/>
								<Text style={[styles.detailText, { color: textColor }]}>
									{recruiter.eligibleBranches ?
										(recruiter.eligibleBranches.length > 2 ?
											`${recruiter.eligibleBranches.slice(0, 2).join(', ')}...` :
											recruiter.eligibleBranches.join(', ')
										) :
										"All Branches"
									}
								</Text>
							</View>
						</View>

						<View style={styles.rolesContainer}>
							{recruiter.roles.slice(0, 2).map((role, index) => (
								<View key={role._id} style={styles.roleItem}>
									<FontAwesome
										name="briefcase"
										size={14}
										color={theme === 'light' ? '#6A0DAD' : '#fff'}
										style={styles.detailIcon}
									/>
									<Text style={[styles.roleText, { color: textColor }]}>
										{role.roleName} ({role.opportunityType})
									</Text>
								</View>
							))}
							{recruiter.roles.length > 2 && (
								<Text style={[styles.moreRoles, { color: subtextColor }]}>
									+ {recruiter.roles.length - 2} more roles
								</Text>
							)}
						</View>
					</View>

					<View style={styles.cardFooter}>
						<TouchableOpacity
							style={[
								styles.viewDetailsButton,
								{
									backgroundColor: theme === 'light'
										? 'rgba(106, 13, 173, 0.7)'
										: 'rgba(187, 57, 191, 0.8)'
								}
							]}
							onPress={() => handleRecruiterPress(recruiter)}
						>
							<Text style={styles.viewDetailsText}>View Details</Text>
						</TouchableOpacity>
					</View>
				</LinearGradient>
			</TouchableOpacity>
		);
	};

	const renderContent = () => {
		if (isLoading) {
			return (
				<View style={styles.loadingContainer}>
					<ActivityIndicator size="large" color="#6A0DAD" />
					<Text style={[styles.loadingText, { color: theme === 'light' ? '#6A0DAD' : '#ffffff' }]}>
						Loading recruiters...
					</Text>
				</View>
			);
		}

		if (recruiters.length === 0) {
			return (
				<View style={styles.emptyContainer}>
					<FontAwesome
						name="building"
						size={50}
						color={theme === 'light' ? 'rgba(106, 13, 173, 0.5)' : 'rgba(187, 57, 191, 0.5)'}
					/>
					<Text style={[styles.emptyText, { color: theme === 'light' ? '#6A0DAD' : '#ffffff' }]}>
						No past recruiters found
					</Text>
				</View>
			);
		}

		if (filteredRecruiters.length === 0) {
			return (
				<View style={styles.noResultsContainer}>
					<FontAwesome
						name="search"
						size={50}
						color={theme === 'light' ? 'rgba(106, 13, 173, 0.5)' : 'rgba(187, 57, 191, 0.5)'}
					/>
					<Text style={[styles.noResultsText, { color: theme === 'light' ? '#6A0DAD' : '#ffffff' }]}>
						No recruiters match your search
					</Text>
					<TouchableOpacity
						style={[
							styles.resetButton,
							{
								backgroundColor: theme === 'light'
									? 'rgba(106, 13, 173, 0.7)'
									: 'rgba(187, 57, 191, 0.8)'
							}
						]}
						onPress={() => setSearchQuery('')}
					>
						<Text style={styles.resetButtonText}>Clear Search</Text>
					</TouchableOpacity>
				</View>
			);
		}

		return (
			<ScrollView
				style={styles.recruiterListContainer}
				contentContainerStyle={styles.recruiterListContent}
				showsVerticalScrollIndicator={false}
			>
				{filteredRecruiters.map(recruiter => renderRecruiterCard(recruiter))}
				<View style={styles.scrollPadding} />
			</ScrollView>
		);
	};

	return (
		<SafeAreaView
			style={[
				styles.safeArea,
				{
					backgroundColor: theme === 'light' ? '#F5F5F5' : '#2d0e3e'
				}
			]}
		>

			<CustomAlert
				visible={alertVisible}
				header={alertConfig.header}
				message={alertConfig.message}
				buttons={alertConfig.buttons}
				onClose={() => setAlertVisible(false)}
			/>

			<LinearGradient
				colors={backgroundGradientColors}
				style={styles.container}
			>
				<StatusBar
					barStyle={statusBarStyle}
					backgroundColor={statusBarBackgroundColor}
				/>
				{/* Header with Logo */}
				<BlurView
					intensity={theme === 'light' ? 10 : 30}
					tint={theme === 'light' ? 'light' : 'dark'}
					style={[
						styles.headerBlur,
						{
							borderBottomColor: theme === 'light'
								? 'rgba(0,0,0,0.1)'
								: 'rgba(255, 255, 255, 0.1)'
						}
					]}
				>
				</BlurView>

				{/* Search Bar */}
				<View style={styles.searchContainer}>
					<Pressable onPress={() => router.back()}>
						<Ionicons name="arrow-back" size={24} color="#fff" />
					</Pressable>
					<View style={[styles.searchBar, { backgroundColor: searchBgColor }]}>
						<FontAwesome name="search" size={16} color={theme === 'light' ? '#6A0DAD' : '#bb39bf'} />
						<TextInput
							style={[styles.searchInput, { color: searchTextColor }]}
							placeholder="Search by company or role..."
							placeholderTextColor={searchPlaceholderColor}
							value={searchQuery}
							onChangeText={setSearchQuery}
						/>
						{searchQuery !== '' && (
							<TouchableOpacity onPress={() => setSearchQuery('')}>
								<FontAwesome name="times-circle" size={16} color={theme === 'light' ? '#6A0DAD' : '#bb39bf'} />
							</TouchableOpacity>
						)}
					</View>
				</View>

				{/* Results Count */}
				{!isLoading && recruiters.length > 0 && (
					<View style={styles.resultsCountContainer}>
						<Text style={[
							styles.resultsCount,
							{ color: theme === 'light' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)' }
						]}>
							Showing {filteredRecruiters.length} of {recruiters.length} recruiters
						</Text>
					</View>
				)}

				{/* Main Content */}
				{renderContent()}

				{/* Footer */}
				<BlurView
					intensity={theme === 'light' ? 10 : 20}
					tint={theme === 'light' ? 'light' : 'dark'}
					style={[
						styles.footerBlur,
						{
							borderTopColor: theme === 'light'
								? 'rgba(0,0,0,0.1)'
								: 'rgba(255, 255, 255, 0.1)'
						}
					]}
				>
					<View style={styles.footer}>
						<Text style={[
							styles.footerText,
							{ color: theme === 'light' ? '#6A0DAD' : 'rgba(255, 255, 255, 0.7)' }
						]}>
							© 2025 Placement Plus
						</Text>
					</View>
				</BlurView>
			</LinearGradient>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		flex: 1,
		paddingHorizontal: 15,
	},
	headerBlur: {
		borderBottomWidth: 1,
		marginBottom: 15,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		paddingTop: 15,
		paddingBottom: 15,
		paddingHorizontal: 5,
		marginTop: 15
	},
	logoContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	logo: {
		width: 30,
		height: 30,
		resizeMode: 'contain',
		marginRight: 10,
	},
	logoText: {
		fontSize: 22,
		fontWeight: 'bold',
		fontFamily: 'System',
	},
	backButton: {
		padding: 5,
	},
	searchContainer: {
		flexDirection: 'row',
		marginBottom: 15,
		alignItems: 'center',
		marginTop: 15
	},
	searchBar: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15,
		paddingVertical: 10,
		borderRadius: 12,
		marginLeft: 10
	},
	searchInput: {
		flex: 1,
		marginLeft: 10,
		fontSize: 16,
	},
	resultsCountContainer: {
		marginBottom: 15,
	},
	resultsCount: {
		fontSize: 14,
		fontWeight: '500',
	},
	loadingContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		marginTop: 15,
		fontSize: 16,
		fontWeight: '500',
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	emptyText: {
		marginTop: 15,
		fontSize: 18,
		fontWeight: '600',
		textAlign: 'center',
	},
	noResultsContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	noResultsText: {
		marginTop: 15,
		marginBottom: 20,
		fontSize: 16,
		fontWeight: '500',
		textAlign: 'center',
	},
	resetButton: {
		paddingHorizontal: 20,
		paddingVertical: 12,
		borderRadius: 8,
	},
	resetButtonText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
	recruiterListContainer: {
		flex: 1,
	},
	recruiterListContent: {
		paddingTop: 5,
	},
	cardWrapper: {
		marginBottom: 15,
	},
	recruiterCard: {
		borderRadius: 16,
		padding: 16,
		shadowColor: '#bb39bf',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 6,
		elevation: 5,
	},
	cardHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	companyLogo: {
		width: 50,
		height: 50,
		marginRight: 12,
		borderRadius: 8,
	},
	cardHeaderText: {
		flex: 1,
	},
	companyCardName: {
		fontSize: 18,
		fontWeight: 'bold',
		marginBottom: 4,
	},
	roleCount: {
		fontSize: 14,
	},
	cardDivider: {
		height: 1,
		marginVertical: 12,
	},
	cardDetails: {
		marginBottom: 12,
	},
	detailRow: {
		flexDirection: 'row',
		marginBottom: 8,
	},
	detailItem: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1,
	},
	detailIcon: {
		marginRight: 8,
	},
	detailText: {
		fontSize: 14,
	},
	rolesContainer: {
		marginTop: 8,
	},
	roleItem: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 6,
	},
	roleText: {
		fontSize: 14,
	},
	moreRoles: {
		fontSize: 12,
		marginTop: 4,
		marginLeft: 22,
	},
	cardFooter: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		alignItems: 'center',
	},
	viewDetailsButton: {
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	viewDetailsText: {
		color: 'white',
		fontSize: 14,
		fontWeight: '600',
	},
	footerBlur: {
		borderTopWidth: 1,
		marginTop: 10,
	},
	footer: {
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 15,
	},
	footerText: {
		fontSize: 14,
		fontWeight: '500',
	},
	scrollPadding: {
		height: 20,
	},
});

export default PastRecruiters;