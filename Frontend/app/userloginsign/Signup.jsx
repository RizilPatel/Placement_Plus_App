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
} from "react-native";
import { router } from "expo-router";
import { Feather, FontAwesome } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { SelectList } from "react-native-dropdown-select-list";
import * as Yup from 'yup';
import * as FileSystem from "expo-file-system";
import { storeAccessToken, storeRefreshToken } from "../../utils/tokenStorage.js";
import { useUser } from "../../context/userContext.js"
import CustomAlert from "../../components/CustomAlert.jsx";

const SignupSchema = Yup.object().shape({
	name: Yup.string().required('Name is required'),
	email: Yup.string().email('Invalid email').required('Email is required'),
	password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
	rollNo: Yup.string().required('Roll number is required'),
	mobileNo: Yup.string().matches(/^\d{10}$/, 'Mobile number must be 10 digits').required('Mobile number is required'),
	CGPA: Yup.number().min(0, 'CGPA must be positive').max(10, 'CGPA cannot exceed 10').required('CGPA is required'),
	batch: Yup.string().matches(/^\d{4}$/, 'Enter a valid year').required('Batch year is required'),
	branch: Yup.string().required("Branch is required"),
	semester: Yup.string().required("Semester is required"),
	course: Yup.string().required("Course is required"),
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

const SignupScreen = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		rollNo: "",
		mobileNo: "",
		CGPA: "",
		batch: "",
		branch: "",
		semester: "",
		course: "",
	});
	const [alertVisible, setAlertVisible] = useState(false)
	const [alertConfig, setAlertConfig] = useState({
		header: "",
		message: "",
		buttons: []
	})

	const [resume, setResume] = useState(null);
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [activeDropdown, setActiveDropdown] = useState(null);

	const scrollViewRef = useRef(null);

	const { login } = useUser()

	const branches = [
		"CSE",
		"ME",
		"CE",
		"EE",
		"ECE",
		"VLSI",
		"CAD/CAM"
	];
	const semesters = Array.from({ length: 8 }, (_, i) => `${i + 1}`);
	const courses = ["B.Tech", "M.Tech"];

	const handleChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: null }));
		}
	};

	const validateField = async (field) => {
		try {
			await SignupSchema.validateAt(field, formData);
			setErrors(prev => ({ ...prev, [field]: null }));
		} catch (error) {
			setErrors(prev => ({ ...prev, [field]: error.message }));
		}
	};

	const handleResumeUpload = async () => {
		try {
			const result = await DocumentPicker.getDocumentAsync({
				type: 'application/pdf',
				copyToCacheDirectory: true,
			});
			console.log(result);

			if (result.type === 'cancel') {
				console.log("User cancelled file picking");
				return;
			}

			const { uri, name, mimeType } = result?.assets[0];

			const resume = {
				uri,
				name,
				type: mimeType || 'application/pdf',
			};
			setErrors(prev => ({ ...prev, resume: null }));
			console.log("resume:", resume);


			setResume(resume);
		} catch (error) {
			console.error("Error picking document:", error.message);
			setErrors(prev => ({ ...prev, resume: "Failed to upload resume" }));
		} finally {
			console.log("Resume added successfully");
		}
	};

	const handleRegister = async () => {
		setLoading(true);

		try {

			await SignupSchema.validate(formData, { abortEarly: false });

			if (!resume) {
				setErrors(prev => ({ ...prev, resume: "Resume is required" }));
				scrollViewRef.current?.scrollToEnd();
				setLoading(false);
				return;
			}

			const userData = new FormData();

			Object.entries(formData).forEach(([key, value]) => {
				userData.append(key, value);
			});

			let resumeFile = resume;
			if (resume.uri.startsWith("data:application/pdf;base64,")) {
				const fileUri = `${FileSystem.cacheDirectory}${resume.name}`;

				await FileSystem.writeAsStringAsync(fileUri, resume.uri.split(",")[1], {
					encoding: FileSystem.EncodingType.Base64,
				});

				resumeFile = {
					uri: fileUri,
					name: resume.name,
					type: "application/pdf",
				};
			}

			userData.append("resume", resumeFile);

			const response = await FileSystem.uploadAsync(
				`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/users/register`,
				resumeFile.uri,
				{
					fieldName: "resume",
					httpMethod: "POST",
					uploadType: FileSystem.FileSystemUploadType.MULTIPART,
					parameters: formData,
				}
			);

			const result = JSON.parse(response.body);
			console.log(result);

			// if (!response.ok) {
			// 	throw new Error(result.message || 'Registration failed');
			// }

			if (result.statusCode === 200) {
				await storeAccessToken(result?.data?.accessToken)
				await storeRefreshToken(result?.data?.refreshToken)
				await login(result?.data?.createdUser)

				router.replace("/HomePage/Home")
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
			if (error instanceof Yup.ValidationError) {
				const validationErrors = {};
				error.inner.forEach(err => {
					validationErrors[err.path] = err.message;
				});
				setErrors(validationErrors);

				scrollViewRef.current?.scrollTo({ y: 0, animated: true });
			} else {
				console.error("Registration Error:", error);
				setAlertConfig({
					header: "Registration Error",
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
		} finally {
			setLoading(false);
		}
	};


	return (
		<KeyboardAvoidingView
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			style={{ flex: 1 }}
		>

			<CustomAlert
				visible={alertVisible}
				header={alertConfig.header}
				message={alertConfig.message}
				buttons={alertConfig.buttons}
				onClose={() => setAlertVisible(false)}
			/>

			<ScrollView
				ref={scrollViewRef}
				contentContainerStyle={styles.scrollContainer}
				keyboardShouldPersistTaps="handled"
			>
				<TouchableOpacity
					onPress={() => router.back()}
					style={styles.backButton}
				>
					<Feather name="arrow-left" size={24} color="white"/>
				</TouchableOpacity>

				<Text style={styles.welcomeTitle}>
					Create an <Text style={styles.purpleText}>Account!</Text>
				</Text>

				<InputField
					icon="user"
					placeholder="Full Name"
					value={formData.name}
					onChangeText={(value) => handleChange("name", value)}
					onBlur={() => validateField("name")}
					error={errors.name}
				/>

				<InputField
					icon="envelope"
					placeholder="Email Address"
					value={formData.email}
					onChangeText={(value) => handleChange("email", value)}
					keyboardType="email-address"
					onBlur={() => validateField("email")}
					error={errors.email}
				/>

				<InputField
					icon="lock"
					placeholder="Password"
					value={formData.password}
					onChangeText={(value) => handleChange("password", value)}
					secureTextEntry={true}
					onBlur={() => validateField("password")}
					error={errors.password}
				/>

				<InputField
					icon="id-card"
					placeholder="Roll Number"
					value={formData.rollNo}
					onChangeText={(value) => handleChange("rollNo", value)}
					onBlur={() => validateField("rollNo")}
					error={errors.rollNo}
				/>

				<InputField
					icon="mobile"
					placeholder="Mobile Number"
					value={formData.mobileNo}
					onChangeText={(value) => handleChange("mobileNo", value)}
					keyboardType="numeric"
					onBlur={() => validateField("mobileNo")}
					error={errors.mobileNo}
				/>

				<InputField
					icon="book"
					placeholder="CGPA"
					value={formData.CGPA}
					onChangeText={(value) => handleChange("CGPA", value)}
					keyboardType="decimal-pad"
					onBlur={() => validateField("CGPA")}
					error={errors.CGPA}
				/>

				<InputField
					icon="calendar"
					placeholder="Batch Year"
					value={formData.batch}
					onChangeText={(value) => handleChange("batch", value)}
					keyboardType="numeric"
					onBlur={() => validateField("batch")}
					error={errors.batch}
				/>

				<View style={[styles.dropdownContainer, { zIndex: 30 }]}>
					<Text style={styles.dropdownLabel}>Branch</Text>
					<SelectList
						setSelected={(value) => handleChange("branch", value)}
						data={branches.map((b) => ({ key: b, value: b }))}
						defaultOption={{ key: formData.branch, value: formData.branch }}
						boxStyles={styles.dropdownBox}
						dropdownStyles={styles.dropdownList}
						dropdownTextStyles={styles.dropdownText}
						inputStyles={styles.dropdownInputText}
						search={false}
						onFocus={() => setActiveDropdown("branch")}
						onBlur={() => setActiveDropdown(null)}
					/>
				</View>

				<View style={[styles.dropdownContainer, { zIndex: 20 }]}>
					<Text style={styles.dropdownLabel}>Semester</Text>
					<SelectList
						setSelected={(value) => handleChange("semester", value)}
						data={semesters.map((s) => ({ key: s, value: s }))}
						defaultOption={{ key: formData.semester, value: formData.semester }}
						boxStyles={styles.dropdownBox}
						dropdownStyles={styles.dropdownList}
						dropdownTextStyles={styles.dropdownText}
						inputStyles={styles.dropdownInputText}
						search={false}
						onFocus={() => setActiveDropdown("semester")}
						onBlur={() => setActiveDropdown(null)}
					/>
				</View>

				<View style={[styles.dropdownContainer, { zIndex: 10 }]}>
					<Text style={styles.dropdownLabel}>Course</Text>
					<SelectList
						setSelected={(value) => handleChange("course", value)}
						data={courses.map((c) => ({ key: c, value: c }))}
						defaultOption={{ key: formData.course, value: formData.course }}
						boxStyles={styles.dropdownBox}
						dropdownStyles={styles.dropdownList}
						dropdownTextStyles={styles.dropdownText}
						inputStyles={styles.dropdownInputText}
						search={false}
						onFocus={() => setActiveDropdown("course")}
						onBlur={() => setActiveDropdown(null)}
					/>
				</View>

				<View style={styles.resumeContainer}>
					<TouchableOpacity
						style={[styles.button, styles.uploadButton]}
						onPress={handleResumeUpload}
					>
						<FontAwesome name="file-pdf-o" size={20} color="white" style={styles.buttonIcon} />
						<Text style={styles.buttonText}>
							{resume ? "Change Resume" : "Upload Resume"}
						</Text>
					</TouchableOpacity>

					{resume && (
						<View style={styles.resumeInfo}>
							<FontAwesome name="check-circle" size={20} color="#4CAF50" />
							<Text style={styles.resumeName} numberOfLines={1} ellipsizeMode="middle">
								{resume.name}
							</Text>
						</View>
					)}

					{errors.resume && <Text style={styles.errorText}>{errors.resume}</Text>}
				</View>

				<TouchableOpacity
					style={[styles.button, styles.submitButton, loading ? styles.disabledButton : null]}
					onPress={handleRegister}
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="white" size="small" />
					) : (
						<Text style={styles.buttonText}>CREATE ACCOUNT</Text>
					)}
				</TouchableOpacity>

				<TouchableOpacity onPress={() => router.push("userloginsign/login")}>
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
	backButton: {
		alignSelf: "flex-start",
		marginTop: 20,
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
	inputError: {
		borderColor: "#FF4D4F",
		borderWidth: 1,
	},
	inputIcon: {
		marginRight: 12,
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
	resumeContainer: {
		width: "100%",
		marginBottom: 16,
	},
	resumeInfo: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 8,
		paddingHorizontal: 8,
	},
	resumeName: {
		color: "white",
		marginLeft: 8,
		maxWidth: '90%',
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
	submitButton: {
		backgroundColor: "#C92EFF",
		marginTop: 8,
	},
	disabledButton: {
		opacity: 0.7,
	},
	buttonIcon: {
		marginRight: 10,
	},
	buttonText: {
		color: "white",
		fontSize: 16,
		fontWeight: "600",
	},
	bottomText: {
		color: "white",
		marginTop: 16,
		fontSize: 15,
	},
});

export default SignupScreen;