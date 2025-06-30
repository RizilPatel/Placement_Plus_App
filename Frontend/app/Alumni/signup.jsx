import React, { useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	Alert,
	KeyboardAvoidingView,
	Platform,
	Image,
} from "react-native";
import { router } from "expo-router";
import { Feather, FontAwesome, Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { SelectList } from "react-native-dropdown-select-list";
import * as Yup from 'yup';
import * as FileSystem from "expo-file-system";
import { storeAccessToken, storeRefreshToken } from "../../utils/tokenStorage.js";
import { useUser } from "../../context/userContext.js";

// Schema validation using Yup
const PersonalInfoSchema = Yup.object().shape({
	name: Yup.string().required('Name is required'),
	email: Yup.string().email('Invalid email').required('Email is required'),
	password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
	linkedInId: Yup.string().required('LinkedIn ID is required'),
	batch: Yup.number().integer('Batch must be a year').min(1980, 'Invalid batch year')
		.max(new Date().getFullYear(), 'Batch year cannot be in the future')
		.required('Batch year is required'),
});

const CareerInfoSchema = Yup.object().shape({
	currentCompany: Yup.object().shape({
		name: Yup.string().required('Current company name is required'),
		position: Yup.string().required('Current position is required'),
	}),
	previousCompanies: Yup.array().of(
		Yup.object().shape({
			name: Yup.string().required('Company name is required'),
			position: Yup.string().required('Position is required'),
			duration: Yup.number().min(1, 'Duration must be at least 1 month').required('Duration is required'),
			experience: Yup.string().required('Experience details are required'),
		})
	),
});

const InputField = ({
	icon,
	placeholder,
	value,
	onChangeText,
	keyboardType,
	secureTextEntry,
	error,
	onBlur
}) => (
	<View style={styles.inputWrapper}>
		<View style={[styles.inputContainer, error ? styles.inputError : null]}>
			<FontAwesome name={icon} size={20} color="#999" style={styles.inputIcon} />
			<TextInput
				style={styles.input}
				placeholder={placeholder}
				placeholderTextColor="#aaa"
				secureTextEntry={secureTextEntry}
				keyboardType={keyboardType}
				value={value}
				onChangeText={onChangeText}
				onBlur={onBlur}
				autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
			/>
		</View>
		{error && <Text style={styles.errorText}>{error}</Text>}
	</View>
);

const AlumniRegistrationScreen = () => {
	// State for form switching
	const [currentForm, setCurrentForm] = useState('personal');

	// Personal info state
	const [personalInfo, setPersonalInfo] = useState({
		name: "",
		email: "",
		password: "",
		linkedInId: "",
		batch: "",
	});

	// Career info state
	const [careerInfo, setCareerInfo] = useState({
		currentCompany: {
			name: "",
			position: "",
		},
		previousCompanies: [
			{
				name: "",
				position: "",
				duration: "",
				experience: "",
			}
		],
	});

	const [profilePic, setProfilePic] = useState(null);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);

	const scrollViewRef = useRef(null);
	const { alumniLogin } = useUser();

	// Generate batch years (last 40 years)
	const currentYear = new Date().getFullYear();
	const batchYears = Array.from({ length: 15 }, (_, i) => `${currentYear - i}`);

	const handlePersonalInfoChange = (field, value) => {
		setPersonalInfo(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: null }));
		}
	};

	const handleCurrentCompanyChange = (field, value) => {
		setCareerInfo(prev => ({
			...prev,
			currentCompany: {
				...prev.currentCompany,
				[field]: value
			}
		}));
		if (errors[`currentCompany.${field}`]) {
			setErrors(prev => ({ ...prev, [`currentCompany.${field}`]: null }));
		}
	};

	const handlePreviousCompanyChange = (index, field, value) => {
		const updatedCompanies = [...careerInfo.previousCompanies];
		updatedCompanies[index] = {
			...updatedCompanies[index],
			[field]: value
		};
		setCareerInfo(prev => ({
			...prev,
			previousCompanies: updatedCompanies
		}));
		if (errors[`previousCompanies[${index}].${field}`]) {
			setErrors(prev => ({ ...prev, [`previousCompanies[${index}].${field}`]: null }));
		}
	};

	const addPreviousCompany = () => {
		setCareerInfo(prev => ({
			...prev,
			previousCompanies: [
				...prev.previousCompanies,
				{ name: "", position: "", duration: "", experience: "" }
			]
		}));
	};

	const removePreviousCompany = (index) => {
		if (careerInfo.previousCompanies.length > 1) {
			const updatedCompanies = [...careerInfo.previousCompanies];
			updatedCompanies.splice(index, 1);
			setCareerInfo(prev => ({
				...prev,
				previousCompanies: updatedCompanies
			}));
		}
	};

	const validatePersonalInfo = async () => {
		try {
			await PersonalInfoSchema.validate(personalInfo, { abortEarly: false });

			if (!profilePic) {
				setErrors(prev => ({ ...prev, profilePic: "Profile picture is required" }));
				return false;
			}

			return true;
		} catch (error) {
			const validationErrors = {};
			error.inner.forEach(err => {
				validationErrors[err.path] = err.message;
			});
			setErrors(prev => ({ ...prev, ...validationErrors }));
			return false;
		}
	};

	const validateCareerInfo = async () => {
		try {
			await CareerInfoSchema.validate(careerInfo, { abortEarly: false });
			return true;
		} catch (error) {
			const validationErrors = {};
			error.inner.forEach(err => {
				validationErrors[err.path] = err.message;
			});
			setErrors(prev => ({ ...prev, ...validationErrors }));
			return false;
		}
	};

	const handleProfilePicUpload = async () => {
		try {
			const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

			if (!permissionResult.granted) {
				Alert.alert("Permission Denied", "Please allow access to your photo library");
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (result.canceled) {
				return;
			}

			const selectedAsset = result.assets[0];

			setProfilePic({
				uri: selectedAsset.uri,
				name: selectedAsset.uri.split('/').pop(),
				type: `image/${selectedAsset.uri.split('.').pop()}`
			});

			setErrors(prev => ({ ...prev, profilePic: null }));
		} catch (error) {
			console.error("Error picking image:", error);
			setErrors(prev => ({ ...prev, profilePic: "Failed to upload profile picture" }));
		}
	};

	const handleNextForm = async () => {
		const isValid = await validatePersonalInfo();
		if (isValid) {
			setCurrentForm('career');
			scrollViewRef.current?.scrollTo({ y: 0, animated: true });
		}
	};

	const handlePreviousForm = () => {
		setCurrentForm('personal');
		scrollViewRef.current?.scrollTo({ y: 0, animated: true });
	};

	const handleRegister = async () => {
		const isPersonalValid = await validatePersonalInfo();
		const isCareerValid = await validateCareerInfo();

		if (!isPersonalValid || !isCareerValid) {
			Alert.alert("Form Error", "Please correct the errors in the form");
			return;
		}

		setLoading(true);

		try {
			const formData = new FormData();

			// Add personal info
			Object.entries(personalInfo).forEach(([key, value]) => {
				formData.append(key, value);
			});

			// Create currentCompany object
			const currentCompany = {
				name: careerInfo.currentCompany.name,
				position: careerInfo.currentCompany.position
			};

			// Create previousCompanies array of objects
			const previousCompanies = careerInfo.previousCompanies.map(company => ({
				name: company.name,
				Position: company.position,
				Duration: company.duration,
				Experience: company.experience
			}));

			// Add both objects to FormData
			formData.append("currentCompany", JSON.stringify(currentCompany));
			formData.append("previousCompany", JSON.stringify(previousCompanies));


			// Add profile picture
			formData.append("profilePic", {
				uri: profilePic.uri,
				name: profilePic.name,
				type: profilePic.type
			});

			console.log([...formData]);

			const response = await FileSystem.uploadAsync(
				`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/alumnis/register`,
				profilePic.uri,
				{
					fieldName: "profilePic",
					httpMethod: "POST",
					uploadType: FileSystem.FileSystemUploadType.MULTIPART,
					parameters: {
						...personalInfo,
						currentCompany: JSON.stringify(careerInfo.currentCompany),
						previousCompany: JSON.stringify(previousCompanies)
					}
				}
			);

			// console.log(response);

			const result = JSON.parse(response.body);
			console.log(result);
			

			if (result.statusCode === 200) {
				// console.log(result.data.newAlumni);
				
				await storeAccessToken(result?.data?.accessToken);
				await storeRefreshToken(result?.data?.refreshToken);
				await alumniLogin(result?.data?.newAlumni);

				router.replace("/HomePage/AlumniHome")
			} else {
				Alert.alert('Error', result?.message || "Registration failed");
			}
		} catch (error) {
			console.error("Registration Error:", error);
			Alert.alert("Registration Failed", error.message || "An unexpected error occurred");
		} finally {
			setLoading(false);
		}
	};

	const renderPersonalInfoForm = () => (
		<>
			<Text style={styles.formTitle}>Personal Information</Text>

			<InputField
				icon="user"
				placeholder="Full Name"
				value={personalInfo.name}
				onChangeText={(value) => handlePersonalInfoChange("name", value)}
				error={errors.name}
			/>

			<InputField
				icon="envelope"
				placeholder="Email Address"
				value={personalInfo.email}
				onChangeText={(value) => handlePersonalInfoChange("email", value)}
				keyboardType="email-address"
				error={errors.email}
			/>

			<InputField
				icon="lock"
				placeholder="Password"
				value={personalInfo.password}
				onChangeText={(value) => handlePersonalInfoChange("password", value)}
				secureTextEntry={true}
				error={errors.password}
			/>

			<InputField
				icon="linkedin"
				placeholder="LinkedIn ID"
				value={personalInfo.linkedInId}
				onChangeText={(value) => handlePersonalInfoChange("linkedInId", value)}
				error={errors.linkedInId}
			/>

			<View style={[styles.dropdownContainer, { zIndex: 10 }]}>
				<Text style={styles.dropdownLabel}>Batch Year</Text>
				<SelectList
					setSelected={(value) => handlePersonalInfoChange("batch", value)}
					data={batchYears.map((year) => ({ key: year, value: year }))}
					defaultOption={{ key: personalInfo.batch, value: personalInfo.batch }}
					boxStyles={styles.dropdownBox}
					dropdownStyles={styles.dropdownList}
					dropdownTextStyles={styles.dropdownText}
					inputStyles={styles.dropdownInputText}
					search={false}
				/>
				{errors.batch && <Text style={styles.errorText}>{errors.batch}</Text>}
			</View>

			<View style={styles.profilePicContainer}>
				<TouchableOpacity
					style={[styles.button, styles.uploadButton]}
					onPress={handleProfilePicUpload}
				>
					<FontAwesome name="image" size={20} color="white" style={styles.buttonIcon} />
					<Text style={styles.buttonText}>
						{profilePic ? "Change Profile Picture" : "Upload Profile Picture"}
					</Text>
				</TouchableOpacity>

				{profilePic && (
					<View style={styles.profilePicPreview}>
						<Image
							source={{ uri: profilePic.uri }}
							style={styles.previewImage}
						/>
					</View>
				)}

				{errors.profilePic && <Text style={styles.errorText}>{errors.profilePic}</Text>}
			</View>

			<TouchableOpacity
				style={[styles.button, styles.nextButton]}
				onPress={handleNextForm}
			>
				<Text style={styles.buttonText}>NEXT</Text>
				<Feather name="arrow-right" size={20} color="white" style={styles.buttonIconRight} />
			</TouchableOpacity>
		</>
	);

	const renderCareerInfoForm = () => (
		<>
			<Text style={styles.formTitle}>Career Information</Text>

			<Text style={styles.sectionTitle}>Current Company</Text>

			<InputField
				icon="building"
				placeholder="Company Name"
				value={careerInfo.currentCompany.name}
				onChangeText={(value) => handleCurrentCompanyChange("name", value)}
				error={errors["currentCompany.name"]}
			/>

			<InputField
				icon="briefcase"
				placeholder="Position"
				value={careerInfo.currentCompany.position}
				onChangeText={(value) => handleCurrentCompanyChange("position", value)}
				error={errors["currentCompany.position"]}
			/>

			<Text style={styles.sectionTitle}>Previous Companies</Text>

			{careerInfo.previousCompanies.map((company, index) => (
				<View key={index} style={styles.previousCompanyContainer}>
					<View style={styles.companyHeader}>
						<Text style={styles.companyIndex}>Company {index + 1}</Text>
						{index > 0 && (
							<TouchableOpacity onPress={() => removePreviousCompany(index)}>
								<Ionicons name="remove-circle" size={24} color="#FF4D4F" />
							</TouchableOpacity>
						)}
					</View>

					<InputField
						icon="building"
						placeholder="Company Name"
						value={company.name}
						onChangeText={(value) => handlePreviousCompanyChange(index, "name", value)}
						error={errors[`previousCompanies[${index}].name`]}
					/>

					<InputField
						icon="briefcase"
						placeholder="Position"
						value={company.position}
						onChangeText={(value) => handlePreviousCompanyChange(index, "position", value)}
						error={errors[`previousCompanies[${index}].position`]}
					/>

					<InputField
						icon="calendar"
						placeholder="Duration (in months)"
						value={company.duration}
						onChangeText={(value) => handlePreviousCompanyChange(index, "duration", value)}
						keyboardType="numeric"
						error={errors[`previousCompanies[${index}].duration`]}
					/>

					<View style={styles.inputWrapper}>
						<View style={[styles.textAreaContainer,
						errors[`previousCompanies[${index}].experience`] ? styles.inputError : null]}>
							<FontAwesome name="file-text" size={20} color="#999" style={styles.inputIcon} />
							<TextInput
								style={styles.textArea}
								placeholder="Experience/Description"
								placeholderTextColor="#aaa"
								multiline={true}
								numberOfLines={4}
								value={company.experience}
								onChangeText={(value) => handlePreviousCompanyChange(index, "experience", value)}
							/>
						</View>
						{errors[`previousCompanies[${index}].experience`] && (
							<Text style={styles.errorText}>{errors[`previousCompanies[${index}].experience`]}</Text>
						)}
					</View>
				</View>
			))}

			<TouchableOpacity
				style={styles.addCompanyButton}
				onPress={addPreviousCompany}
			>
				<Ionicons name="add-circle" size={20} color="#C92EFF" />
				<Text style={styles.addCompanyText}>Add Another Company</Text>
			</TouchableOpacity>

			<View style={styles.navigationButtonsContainer}>
				<TouchableOpacity
					style={[styles.button, styles.backButton, { flex: 1, marginRight: 8 }]}
					onPress={handlePreviousForm}
				>
					<Feather name="arrow-left" size={20} color="white" style={styles.buttonIcon} />
					<Text style={styles.buttonText}>BACK</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={[
						styles.button,
						styles.submitButton,
						{ flex: 1, marginLeft: 8 },
						loading ? styles.disabledButton : null
					]}
					onPress={handleRegister}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="white" size="small" />
					) : (
						<Text style={styles.buttonText}>REGISTER</Text>
					)}
				</TouchableOpacity>
			</View>
		</>
	);

	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
		>
			<ScrollView
				ref={scrollViewRef}
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButtonTop}
				>
					<Feather name="arrow-left" size={24} color="white" />
				</TouchableOpacity>

				<Text style={styles.welcomeTitle}>
					Alumni <Text style={styles.purpleText}>Registration</Text>
				</Text>

				<View style={styles.formContainer}>
					{currentForm === 'personal' ? renderPersonalInfoForm() : renderCareerInfoForm()}
				</View>

				<TouchableOpacity onPress={() => router.push("/Alumni/login")}>
					<Text style={styles.bottomText}>
						Already have an account? <Text style={styles.purpleText}>Sign in</Text>
					</Text>
				</TouchableOpacity>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
		backgroundColor: "#0D021F",
	},
	backButtonTop: {
		alignSelf: "flex-start",
		marginTop: 10,
		padding: 8,
	},
	welcomeTitle: {
		fontSize: 28,
		fontWeight: "bold",
		color: "white",
		marginBottom: 30,
		textAlign: "center",
	},
	purpleText: {
		color: "#C92EFF",
	},
	formContainer: {
		width: "100%",
	},
	formTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: "white",
		marginBottom: 20,
		textAlign: "left",
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		color: "#C92EFF",
		marginTop: 16,
		marginBottom: 16,
	},
	inputWrapper: {
		width: "100%",
		marginBottom: 16,
	},
	inputContainer: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#1C1235",
		paddingHorizontal: 15,
		paddingVertical: 14,
		borderRadius: 12,
		width: "100%",
		borderWidth: 1,
		borderColor: "#2E2257",
	},
	textAreaContainer: {
		flexDirection: "row",
		backgroundColor: "#1C1235",
		paddingHorizontal: 15,
		paddingVertical: 14,
		borderRadius: 12,
		width: "100%",
		borderWidth: 1,
		borderColor: "#2E2257",
		minHeight: 120,
		alignItems: "flex-start",
	},
	textArea: {
		flex: 1,
		color: "white",
		fontSize: 16,
		textAlignVertical: "top",
		minHeight: 92,
	},
	inputError: {
		borderColor: "#FF4D4F",
		borderWidth: 1,
	},
	inputIcon: {
		marginRight: 12,
		marginTop: Platform.OS === "android" ? 0 : 0,
	},
	input: {
		flex: 1,
		color: "white",
		fontSize: 16,
	},
	errorText: {
		color: "#FF4D4F",
		fontSize: 12,
		marginTop: 4,
		marginLeft: 4,
	},
	dropdownContainer: {
		width: "100%",
		marginBottom: 16,
	},
	dropdownLabel: {
		color: "#aaa",
		marginBottom: 6,
		fontSize: 14,
		marginLeft: 4,
	},
	dropdownBox: {
		backgroundColor: "#1C1235",
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#2E2257",
		paddingVertical: 14,
		paddingHorizontal: 15,
	},
	dropdownList: {
		backgroundColor: "#1C1235",
		borderWidth: 1,
		borderColor: "#2E2257",
		marginTop: 5,
		borderRadius: 8,
		paddingVertical: 8,
	},
	dropdownText: {
		color: "white",
		fontSize: 16,
	},
	dropdownInputText: {
		color: "white",
		fontSize: 16,
	},
	profilePicContainer: {
		width: "100%",
		marginBottom: 16,
	},
	profilePicPreview: {
		marginTop: 10,
		alignItems: "center",
	},
	previewImage: {
		width: 100,
		height: 100,
		borderRadius: 50,
		borderWidth: 2,
		borderColor: "#C92EFF",
	},
	previousCompanyContainer: {
		width: "100%",
		marginBottom: 20,
		padding: 15,
		backgroundColor: "#1A1032",
		borderRadius: 12,
		borderLeftWidth: 4,
		borderLeftColor: "#C92EFF",
	},
	companyHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 10,
	},
	companyIndex: {
		color: "white",
		fontSize: 16,
		fontWeight: "bold",
	},
	addCompanyButton: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 10,
		padding: 10,
	},
	addCompanyText: {
		color: "#C92EFF",
		marginLeft: 8,
		fontSize: 16,
	},
	button: {
		flexDirection: "row",
		justifyContent: "center",
		paddingVertical: 16,
		borderRadius: 12,
		width: "100%",
		alignItems: "center",
		marginBottom: 16,
	},
	uploadButton: {
		backgroundColor: "#2E2257",
		borderWidth: 1,
		borderColor: "#C92EFF",
	},
	nextButton: {
		backgroundColor: "#C92EFF",
		marginTop: 8,
	},
	backButton: {
		backgroundColor: "#2E2257",
		borderWidth: 1,
		borderColor: "#C92EFF",
	},
	submitButton: {
		backgroundColor: "#C92EFF",
	},
	disabledButton: {
		opacity: 0.7,
	},
	buttonIcon: {
		marginRight: 10,
	},
	buttonIconRight: {
		marginLeft: 10,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	navigationButtonsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
		marginTop: 8,
		marginBottom: 16,
	},
	bottomText: {
		color: "white",
		marginTop: 16,
		fontSize: 15,
	},
});

export default AlumniRegistrationScreen;