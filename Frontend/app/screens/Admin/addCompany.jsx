import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StatusBar
} from "react-native";
import { router } from "expo-router";
import { Feather, FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { MultiSelect } from 'react-native-element-dropdown';
import { LinearGradient } from "expo-linear-gradient";
import { getAccessToken, getRefreshToken } from "../../../utils/tokenStorage.js";
import CustomAlert from "../../../components/CustomAlert.jsx";

const InputField = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    secureTextEntry,
    multiline = false,
    required = false,
    error = null,
    onBlur = () => { }
}) => (
    <View style={styles.fieldContainer}>
        <View style={[
            styles.inputContainer,
            error ? styles.inputError : null,
            multiline && { height: 100 }
        ]}>
            <FontAwesome name={icon} size={20} color="#999" style={styles.inputIcon} />
            <TextInput
                style={[styles.input, multiline && { height: 90, textAlignVertical: 'top' }]}
                placeholder={required ? `${placeholder} *` : placeholder}
                placeholderTextColor="#aaa"
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
                onBlur={onBlur}
            />
            {required && !error && value && (
                <MaterialIcons name="check-circle" size={20} color="#4CAF50" style={styles.validIcon} />
            )}
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

// Custom Dropdown Component
const CustomDropdown = ({ options, selectedValue, onSelect, placeholder, style, zIndex }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View style={[{ zIndex }, style]}>
            <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => setIsOpen(!isOpen)}
            >
                <Text style={{ color: 'white' }}>
                    {selectedValue || placeholder}
                </Text>
                <FontAwesome name={isOpen ? "chevron-up" : "chevron-down"} size={16} color="white" />
            </TouchableOpacity>

            {isOpen && (
                <View style={styles.dropdownList}>
                    {options.map((option) => (
                        <TouchableOpacity
                            key={option.key}
                            style={styles.dropdownItem}
                            onPress={() => {
                                onSelect(option.value);
                                setIsOpen(false);
                            }}
                        >
                            <Text style={{ color: 'white' }}>{option.value}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}
        </View>
    );
};

const CompanyRegistrationScreen = () => {
    const scrollViewRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [alertVisible, setAlertVisible] = useState(false)
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    })

    const [formData, setFormData] = useState({
        companyName: "",
        eligibleBranches: [],
        eligibleBatches: [],
        stipend: "",
        CTC: "",
        role: "",
        hiringProcess: "",
        minCGPA: "",
        location: "",
        schedule: "",
        scheduleMode: "On-Site",
        opportunityType: "Full Time",
        extraDetails: "",
        pocName: "",
        pocContact: "",
    });

    const [errors, setErrors] = useState({});

    const [activeDropdown, setActiveDropdown] = useState(null);

    // Determine which fields to show based on opportunity type
    const shouldShowStipend = formData.opportunityType === "Internship" || formData.opportunityType === "Internship + Full Time";
    const shouldShowCTC = formData.opportunityType === "Full Time" || formData.opportunityType === "Internship + Full Time";

    // Clear irrelevant compensation fields when opportunity type changes
    useEffect(() => {
        if (!shouldShowStipend) {
            handleChange("stipend", "");
        }
        if (!shouldShowCTC) {
            handleChange("CTC", "");
        }
    }, [formData.opportunityType]);

    const branches = [
        { label: "Computer Science", value: "CSE" },
        { label: "Mechanical", value: "ME" },
        { label: "Civil", value: "CE" },
        { label: "Electrical", value: "EE" },
        { label: "Electronics & Communication", value: "ECE" },
        { label: "AI & Data Science", value: "AI-DS" },
        { label: "VLSI", value: "VLSI" },
    ];

    const batches = [];
    for (let i = 0; i < 4; i++) {
        const year = new Date().getFullYear() + i;
        batches.push({
            label: `${year}`,
            value: `${year}`
        });
    }

    const scheduleModes = [
        { key: "On-Site", value: "On-Site" },
        { key: "Off-Site", value: "Off-Site" },
        { key: "Hybrid", value: "Hybrid" },
    ];

    const opportunityTypes = [
        { key: "Internship", value: "Internship" },
        { key: "Full Time", value: "Full Time" },
        { key: "Internship + Full Time", value: "Internship + Full Time" },
    ];

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const validateField = (field) => {
        let newErrors = { ...errors };

        switch (field) {
            case "companyName":
                if (!formData.companyName.trim()) {
                    newErrors.companyName = "Company name is required";
                } else {
                    delete newErrors.companyName;
                }
                break;
            case "eligibleBranches":
                if (formData.eligibleBranches.length === 0) {
                    newErrors.eligibleBranches = "Select at least one branch";
                } else {
                    delete newErrors.eligibleBranches;
                }
                break;
            case "eligibleBatches":
                if (formData.eligibleBatches.length === 0) {
                    newErrors.eligibleBatches = "Select at least one batch";
                } else {
                    delete newErrors.eligibleBatches;
                }
                break;
            case "stipend":
            case "CTC":
                if (shouldShowStipend && shouldShowCTC) {
                    if (!formData.stipend.trim() && !formData.CTC.trim()) {
                        newErrors.stipend = "Either Stipend or CTC is required";
                        newErrors.CTC = "Either Stipend or CTC is required";
                    } else {
                        delete newErrors.stipend;
                        delete newErrors.CTC;
                    }
                } else if (shouldShowStipend && !formData.stipend.trim()) {
                    newErrors.stipend = "Stipend is required";
                } else if (shouldShowCTC && !formData.CTC.trim()) {
                    newErrors.CTC = "CTC is required";
                } else {
                    delete newErrors.stipend;
                    delete newErrors.CTC;
                }
                break;
            case "role":
                if (!formData.role.trim()) {
                    newErrors.role = "Role is required";
                } else {
                    delete newErrors.role;
                }
                break;
            case "hiringProcess":
                if (!formData.hiringProcess.trim()) {
                    newErrors.hiringProcess = "Hiring process details are required";
                } else {
                    delete newErrors.hiringProcess;
                }
                break;
            case "schedule":
                if (!formData.schedule.trim()) {
                    newErrors.schedule = "Schedule details are required";
                } else {
                    delete newErrors.schedule;
                }
                break;
            case "location":
                if (!formData.location.trim()) {
                    newErrors.location = "Location is required";
                } else {
                    delete newErrors.location;
                }
                break;
            case "pocName":
                if (!formData.pocName.trim()) {
                    newErrors.pocName = "POC name is required";
                } else {
                    delete newErrors.pocName;
                }
                break;
            case "pocContact":
                if (!formData.pocContact.trim()) {
                    newErrors.pocContact = "Contact number is required";
                } else if (!/^\d{10}$/.test(formData.pocContact.replace(/\D/g, ''))) {
                    newErrors.pocContact = "Please enter a valid 10-digit number";
                } else {
                    delete newErrors.pocContact;
                }
                break;
            case "minCGPA":
                if (formData.minCGPA && (isNaN(formData.minCGPA) || parseFloat(formData.minCGPA) > 10)) {
                    newErrors.minCGPA = "Please enter a valid CGPA (0-10)";
                } else {
                    delete newErrors.minCGPA;
                }
                break;
            default:
                break;
        }

        setErrors(newErrors);
        return !newErrors[field];
    };

    const validateStep = (step) => {
        let isValid = true;
        let newErrors = { ...errors };

        if (step === 1) {
            if (!formData.companyName.trim()) {
                newErrors.companyName = "Company name is required";
                isValid = false;
            }

            if (formData.eligibleBranches.length === 0) {
                newErrors.eligibleBranches = "Select at least one branch";
                isValid = false;
            }

            if (formData.eligibleBatches.length === 0) {
                newErrors.eligibleBatches = "Select at least one batch";
                isValid = false;
            }

            if (shouldShowStipend && shouldShowCTC) {
                if (!formData.stipend.trim() && !formData.CTC.trim()) {
                    newErrors.stipend = "Either Stipend or CTC is required";
                    newErrors.CTC = "Either Stipend or CTC is required";
                    isValid = false;
                } else {
                    delete newErrors.stipend;
                    delete newErrors.CTC;
                }
            } else if (shouldShowStipend && !formData.stipend.trim()) {
                newErrors.stipend = "Stipend is required";
                isValid = false;
            } else if (shouldShowCTC && !formData.CTC.trim()) {
                newErrors.CTC = "CTC is required";
                isValid = false;
            } else {
                delete newErrors.stipend;
                delete newErrors.CTC;
            }

            if (!formData.role.trim()) {
                newErrors.role = "Role is required";
                isValid = false;
            }
        } else if (step === 2) {
            if (!formData.hiringProcess.trim()) {
                newErrors.hiringProcess = "Hiring process details are required";
                isValid = false;
            }

            if (!formData.schedule.trim()) {
                newErrors.schedule = "Schedule details are required";
                isValid = false;
            }

            if (!formData.location.trim()) {
                newErrors.location = "Location is required";
                isValid = false;
            }

            if (formData.minCGPA && (isNaN(formData.minCGPA) || parseFloat(formData.minCGPA) > 10)) {
                newErrors.minCGPA = "Please enter a valid CGPA (0-10)";
                isValid = false;
            }
        } else if (step === 3) {
            if (!formData.pocName.trim()) {
                newErrors.pocName = "POC name is required";
                isValid = false;
            }

            if (!formData.pocContact.trim()) {
                newErrors.pocContact = "Contact number is required";
                isValid = false;
            } else if (!/^\d{10}$/.test(formData.pocContact.replace(/\D/g, ''))) {
                newErrors.pocContact = "Please enter a valid 10-digit number";
                isValid = false;
            }
        }

        setErrors(newErrors);
        return isValid;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        }
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    const handleSubmit = async () => {
        if (!validateStep(currentStep)) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submissionData = {
                companyName: formData.companyName,
                eligibleBranches: formData.eligibleBranches,
                eligibleBatch: formData.eligibleBatches,
                role: formData.role,
                hiringProcess: formData.hiringProcess,
                cgpaCriteria: formData.minCGPA,
                jobLocation: formData.location,
                schedule: formData.schedule,
                mode: formData.scheduleMode,
                opportunityType: formData.opportunityType,
                pocName: formData.pocName,
                pocContactNo: formData.pocContact
            };

            if (shouldShowStipend)
                submissionData.stipend = formData.stipend
            if (shouldShowCTC)
                submissionData.CTC = formData.CTC
            if (formData.extraDetails.trim() !== "")
                submissionData.extraDetails = formData.extraDetails

            console.log("Company Data:", submissionData);

            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken()
            if (!accessToken || !refreshToken) {
                Alert.alert("Error", "Tokens are required. Please login again")
                return
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/companies/add-company`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData)
            })

            const result = await response.json()
            // console.log(result);

            if (result.statusCode === 200) {
                setAlertConfig({
                    header: "Success",
                    message: "Uploaded successfully",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default"
                        }
                    ]
                });
                setAlertVisible(true)
                setFormData({
                    companyName: "",
                    eligibleBranches: [],
                    eligibleBatches: [],
                    stipend: "",
                    CTC: "",
                    role: "",
                    hiringProcess: "",
                    minCGPA: "",
                    location: "",
                    schedule: "",
                    scheduleMode: "On-Site",
                    opportunityType: "Full Time",
                    extraDetails: "",
                    pocName: "",
                    pocContact: "",
                })
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
                setAlertVisible(true)
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
            setAlertVisible(true)
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return (
                    <LinearGradient
                        colors={["#3a1c71", "#d76d77"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientCard}
                    >
                        <Text style={styles.stepTitle}>Step 1: Basic Information</Text>

                        <InputField
                            icon="building"
                            placeholder="Company Name"
                            value={formData.companyName}
                            onChangeText={(text) => handleChange("companyName", text)}
                            error={errors.companyName}
                            onBlur={() => validateField("companyName")}
                            required
                        />

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Eligible Branches *</Text>
                            <MultiSelect
                                style={[
                                    styles.multiSelect,
                                    errors.eligibleBranches ? styles.inputError : null
                                ]}
                                placeholderStyle={styles.placeholderStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={branches}
                                labelField="label"
                                valueField="value"
                                placeholder="Select branches"
                                value={formData.eligibleBranches}
                                onChange={(items) => handleChange("eligibleBranches", items)}
                                onFocus={() => setActiveDropdown("branches")}
                                onBlur={() => {
                                    setActiveDropdown(null);
                                    validateField("eligibleBranches");
                                }}
                                selectedStyle={{
                                    backgroundColor: "white",
                                    borderRadius: 10,
                                }}
                                selectedTextStyle={{
                                    color: "#1C1235",
                                    fontWeight: "bold"
                                }}
                                containerStyle={{ backgroundColor: "#1C1235" }}
                                itemContainerStyle={{ backgroundColor: "#1C1235" }}
                                itemTextStyle={{ color: "white" }}
                                activeColor="white"
                                activeItemTextStyle={{ color: "#1C1235", fontWeight: "bold" }}
                                searchContainerStyle={{
                                    backgroundColor: "#1C1235",
                                    borderBottomColor: "#2A1B4A"
                                }}
                                renderItem={(item) => {
                                    const isSelected = formData.eligibleBranches.includes(item.value);
                                    const backgroundColor = isSelected ? 'white' : '#1C1235';
                                    const textColor = isSelected ? '#1C1235' : 'white';

                                    return (
                                        <View
                                            style={{
                                                backgroundColor,
                                                paddingVertical: 10,
                                                paddingHorizontal: 15,
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#2A1B4A',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: textColor,
                                                    fontWeight: isSelected ? 'bold' : 'normal',
                                                }}
                                            >
                                                {item.label}
                                            </Text>
                                        </View>
                                    );
                                }}
                            />
                            {errors.eligibleBranches && (
                                <Text style={styles.errorText}>{errors.eligibleBranches}</Text>
                            )}
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={styles.label}>Eligible Batches *</Text>
                            <MultiSelect
                                style={[
                                    styles.multiSelect,
                                    errors.eligibleBatches ? styles.inputError : null
                                ]}
                                placeholderStyle={styles.placeholderStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                data={batches}
                                labelField="label"
                                valueField="value"
                                placeholder="Select bathches"
                                value={formData.eligibleBatches}
                                onChange={(items) => handleChange("eligibleBatches", items)}
                                onFocus={() => setActiveDropdown("batches")}
                                onBlur={() => {
                                    setActiveDropdown(null);
                                    validateField("eligibleBatches");
                                }}
                                selectedStyle={{
                                    backgroundColor: "white",
                                    borderRadius: 10,
                                }}
                                selectedTextStyle={{
                                    color: "#1C1235",
                                    fontWeight: "bold"
                                }}
                                containerStyle={{ backgroundColor: "#1C1235" }}
                                itemContainerStyle={{ backgroundColor: "#1C1235" }}
                                itemTextStyle={{ color: "white" }}
                                activeColor="white"
                                activeItemTextStyle={{ color: "#1C1235", fontWeight: "bold" }}
                                searchContainerStyle={{
                                    backgroundColor: "#1C1235",
                                    borderBottomColor: "#2A1B4A"
                                }}
                                renderItem={(item) => {
                                    const isSelected = formData.eligibleBatches.includes(item.value);
                                    const backgroundColor = isSelected ? 'white' : '#1C1235';
                                    const textColor = isSelected ? '#1C1235' : 'white';

                                    return (
                                        <View
                                            style={{
                                                backgroundColor,
                                                paddingVertical: 10,
                                                paddingHorizontal: 15,
                                                borderBottomWidth: 1,
                                                borderBottomColor: '#2A1B4A',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: textColor,
                                                    fontWeight: isSelected ? 'bold' : 'normal',
                                                }}
                                            >
                                                {item.label}
                                            </Text>
                                        </View>
                                    );
                                }}
                            />
                            {errors.eligibleBatches && (
                                <Text style={styles.errorText}>{errors.eligibleBatches}</Text>
                            )}
                        </View>

                        <View style={[styles.fieldContainer, { zIndex: 25, marginBottom: 15 }]}>
                            <Text style={styles.label}>Opportunity Type *</Text>
                            <CustomDropdown
                                options={opportunityTypes}
                                selectedValue={formData.opportunityType}
                                onSelect={(value) => handleChange("opportunityType", value)}
                                placeholder="Select Opportunity Type"
                                zIndex={25}
                            />
                        </View>

                        {shouldShowStipend && (
                            <InputField
                                icon="money"
                                placeholder="Stipend"
                                value={formData.stipend}
                                onChangeText={(text) => handleChange("stipend", text)}
                                keyboardType="numeric"
                                error={errors.stipend}
                                onBlur={() => validateField("stipend")}
                                required
                            />
                        )}

                        {shouldShowCTC && (
                            <InputField
                                icon="money"
                                placeholder="CTC (LPA)"
                                value={formData.CTC}
                                onChangeText={(text) => handleChange("CTC", text)}
                                keyboardType="numeric"
                                error={errors.CTC}
                                onBlur={() => validateField("CTC")}
                                required
                            />
                        )}

                        <InputField
                            icon="briefcase"
                            placeholder="Role/Position"
                            value={formData.role}
                            onChangeText={(text) => handleChange("role", text)}
                            error={errors.role}
                            onBlur={() => validateField("role")}
                            required
                        />
                    </LinearGradient>
                );
            case 2:
                return (
                    <LinearGradient
                        colors={["#3a1c71", "#d76d77"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientCard}
                    >
                        <Text style={styles.stepTitle}>Step 2: Job Details</Text>

                        <InputField
                            icon="list-alt"
                            placeholder="Hiring Process (Rounds, Tests, etc.)"
                            value={formData.hiringProcess}
                            onChangeText={(text) => handleChange("hiringProcess", text)}
                            multiline
                            error={errors.hiringProcess}
                            onBlur={() => validateField("hiringProcess")}
                            required
                        />

                        <InputField
                            icon="calendar"
                            placeholder="Schedule (Date, Time, etc.)"
                            value={formData.schedule}
                            onChangeText={(text) => handleChange("schedule", text)}
                            multiline
                            error={errors.schedule}
                            onBlur={() => validateField("schedule")}
                            required
                        />

                        <InputField
                            icon="star"
                            placeholder="Minimum CGPA Required"
                            value={formData.minCGPA}
                            onChangeText={(text) => handleChange("minCGPA", text)}
                            keyboardType="decimal-pad"
                            error={errors.minCGPA}
                            onBlur={() => validateField("minCGPA")}
                        />

                        <InputField
                            icon="map-marker"
                            placeholder="Job Location"
                            value={formData.location}
                            onChangeText={(text) => handleChange("location", text)}
                            error={errors.location}
                            onBlur={() => validateField("location")}
                            required
                        />

                        <View style={[styles.fieldContainer, { zIndex: 30 }]}>
                            <Text style={styles.label}>Schedule Mode *</Text>
                            <CustomDropdown
                                options={scheduleModes}
                                selectedValue={formData.scheduleMode}
                                onSelect={(value) => handleChange("scheduleMode", value)}
                                placeholder="Select Schedule Mode"
                                zIndex={30}
                            />
                        </View>
                    </LinearGradient>
                );
            case 3:
                return (
                    <LinearGradient
                        colors={["#3a1c71", "#d76d77"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientCard}
                    >
                        <Text style={styles.stepTitle}>Step 3: Contact & Additional Info</Text>

                        <InputField
                            icon="info-circle"
                            placeholder="Extra Details (if any)"
                            value={formData.extraDetails}
                            onChangeText={(text) => handleChange("extraDetails", text)}
                            multiline
                        />

                        <Text style={styles.sectionTitle}>Point of Contact</Text>

                        <InputField
                            icon="user"
                            placeholder="POC Name"
                            value={formData.pocName}
                            onChangeText={(text) => handleChange("pocName", text)}
                            error={errors.pocName}
                            onBlur={() => validateField("pocName")}
                            required
                        />

                        <InputField
                            icon="phone"
                            placeholder="POC Contact Number"
                            value={formData.pocContact}
                            onChangeText={(text) => handleChange("pocContact", text)}
                            keyboardType="phone-pad"
                            error={errors.pocContact}
                            onBlur={() => validateField("pocContact")}
                            required
                        />
                    </LinearGradient>
                );
            default:
                return null;
        }
    };

    const renderProgressBar = () => {
        return (
            <View style={styles.progressContainer}>
                {[1, 2, 3].map((step) => (
                    <React.Fragment key={step}>
                        <View
                            style={[
                                styles.progressCircle,
                                currentStep >= step ? styles.progressActive : {}
                            ]}
                        >
                            {currentStep > step ? (
                                <MaterialIcons name="check" size={16} color="white" />
                            ) : (
                                <Text style={styles.progressText}>{step}</Text>
                            )}
                        </View>
                        {step < 3 && (
                            <View
                                style={[
                                    styles.progressLine,
                                    currentStep > step ? styles.progressActive : {}
                                ]}
                            />
                        )}
                    </React.Fragment>
                ))}
            </View>
        );
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
            <StatusBar
                barStyle="light-content"
                backgroundColor="#1a012c"
            />

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
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <Feather name="arrow-left" size={24} color="white" />
                        </TouchableOpacity>
                        <Text style={styles.welcomeTitle}>Register <Text style={styles.purpleText}>Your Company</Text></Text>
                    </View>
                    <Text style={styles.subtitle}>
                        Fill in the details to register your company for campus hiring
                    </Text>
                </View>

                {renderProgressBar()}

                <View style={styles.formContainer}>
                    {renderStepContent()}
                </View>

                <View style={styles.buttonContainer}>
                    {currentStep > 1 && (
                        <TouchableOpacity
                            style={[styles.button, styles.secondaryButton]}
                            onPress={prevStep}
                            disabled={isSubmitting}
                        >
                            <Text style={styles.secondaryButtonText}>PREVIOUS</Text>
                        </TouchableOpacity>
                    )}

                    {currentStep < 3 ? (
                        <TouchableOpacity
                            style={[styles.button, styles.primaryButton, currentStep > 1 ? styles.nextButton : {}]}
                            onPress={nextStep}
                        >
                            <Text style={styles.buttonText}>NEXT</Text>
                            <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 5 }} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>SUBMIT</Text>
                                    <MaterialIcons name="check-circle" size={16} color="white" style={{ marginLeft: 5 }} />
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a012c",
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        marginTop: 10
    },
    header: {
        width: "100%",
        marginBottom: 25,
        paddingTop: 10,
    },
    headerContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    backButton: {
        marginRight: 15,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "white",
    },
    subtitle: {
        fontSize: 16,
        color: "rgba(255, 255, 255, 0.7)",
        marginTop: 15,
        marginLeft: 40,
    },
    purpleText: {
        color: "#C92EFF",
    },
    gradientCard: {
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    stepTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "white",
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "white",
        marginVertical: 15,
        alignSelf: "flex-start",
    },
    formContainer: {
        width: "100%",
    },
    fieldContainer: {
        width: "100%",
        marginBottom: 15,
    },
    label: {
        color: "white",
        marginBottom: 8,
        fontSize: 14,
        fontWeight: "500",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        width: "100%",
    },
    inputError: {
        borderWidth: 1,
        borderColor: "#FF4D4F",
    },
    validIcon: {
        marginLeft: 10,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        color: "white",
    },
    errorText: {
        color: "#FF4D4F",
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    dropdownWrapper: {
        position: "relative",
        zIndex: 100,
    },
    dropdownBox: {
        padding: 10,
        borderRadius: 5,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownList: {
        backgroundColor: "#1C1235",
        borderWidth: 0,
        marginTop: 5,
        borderRadius: 10,
        paddingVertical: 8,
    },
    dropdownInput: {
        color: "white",
    },
    dropdownText: {
        color: "white",
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#2A1B4A',
    },
    multiSelect: {
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        borderRadius: 10,
        padding: 12,
    },
    placeholderStyle: {
        color: "#aaa",
    },
    selectedTextStyle: {
        color: "white",
    },
    inputSearchStyle: {
        color: "white",
        backgroundColor: "#1C1235",
    },
    iconStyle: {
        tintColor: "white",
    },
    selectedStyle: {
        backgroundColor: "#C92EFF",
        borderRadius: 8,
    },
    datePickerButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        width: "100%",
    },
    dateText: {
        color: "white",
        flex: 1,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 20,
        marginBottom: 30,
    },
    button: {
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        flexDirection: "row",
    },
    primaryButton: {
        backgroundColor: "#9B30F9",
    },
    nextButton: {
        marginLeft: 10,
    },
    secondaryButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#C92EFF",
        marginRight: 10,
    },
    submitButton: {
        backgroundColor: "#6A0DAD",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 14,
    },
    secondaryButtonText: {
        color: "#C92EFF",
        fontWeight: "bold",
        fontSize: 14,
    },
    progressContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 30,
        marginTop: 10,
    },
    progressCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#C92EFF",
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        marginHorizontal: 5,
        maxWidth: 50,
    },
    progressActive: {
        backgroundColor: "#C92EFF",
    },
    progressText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default CompanyRegistrationScreen;