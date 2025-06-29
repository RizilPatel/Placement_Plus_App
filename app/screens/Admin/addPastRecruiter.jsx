import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    TextInput,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DropDownPicker from "react-native-dropdown-picker";
import { useUser } from "../../../context/userContext.js";
import { getAccessToken, getRefreshToken } from "../../../utils/tokenStorage.js";
import CustomAlert from "../../../components/CustomAlert.jsx";
import { router } from "expo-router";

const InputField = ({
    icon,
    placeholder,
    value,
    onChangeText,
    keyboardType,
    secureTextEntry,
    multiline = false,
    hasError = false,
    errorMessage = "",
    required = false,
    theme = "dark",
}) => (
    <View style={styles.fieldContainer}>
        <LinearGradient
            colors={
                theme === "light"
                    ? ["#f0f0ff", "#e0e0ff"]
                    : ["#1C1235", "#2A1F3D"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.inputContainer,
                hasError && styles.inputError,
                multiline && styles.multilineContainer,
            ]}
        >
            <FontAwesome
                name={icon}
                size={20}
                color={theme === "light" ? "#6A0DAD" : "#999"}
                style={styles.inputIcon}
            />
            <TextInput
                style={[
                    styles.input,
                    multiline && styles.multilineInput,
                    { color: theme === "light" ? "#333333" : "white" },
                ]}
                placeholder={required ? `${placeholder} *` : placeholder}
                placeholderTextColor={theme === "light" ? "#888" : "#aaa"}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
            />
        </LinearGradient>
        {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
);

const AddPastRecruiterScreen = () => {
    const { theme } = useUser();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: [],
    });

    const [formData, setFormData] = useState({
        name: "",
        eligibleBranches: [],
        roles: [
            {
                roleName: "",
                opportunityType: "Internship",
                stipend: "",
                CTC: "",
                year: "",
            },
        ],
        recruitedStudents: "",
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [openBranches, setOpenBranches] = useState(false);
    const [openOpportunityTypes, setOpenOpportunityTypes] = useState([false]);

    const branchOptions = [
        { label: "Computer Science", value: "CSE" },
        { label: "Electronics", value: "ECE" },
        { label: "Electrical", value: "EE" },
        { label: "Mechanical", value: "ME" },
        { label: "Civil", value: "CE" },
    ];

    const opportunityTypeOptions = [
        { label: "Internship", value: "Internship" },
        { label: "Full Time", value: "Full Time" },
        { label: "Internship + Full Time", value: "Internship + Full Time" },
    ];

    const handleChange = (field, value) => {
        if (errors[field]) {
            setErrors((prev) => ({
                ...prev,
                [field]: null,
            }));
        }

        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleRoleChange = (index, field, value) => {
        const updatedRoles = [...formData.roles];
        updatedRoles[index][field] = value;

        // Clear errors for this field if any
        if (errors[`roles[${index}].${field}`]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[`roles[${index}].${field}`];
                return newErrors;
            });
        }

        setFormData((prev) => ({
            ...prev,
            roles: updatedRoles,
        }));
    };

    const addRole = () => {
        setFormData((prev) => ({
            ...prev,
            roles: [
                ...prev.roles,
                {
                    roleName: "",
                    opportunityType: "Internship",
                    stipend: "",
                    CTC: "",
                    year: "",
                },
            ],
        }));

        // Add a new dropdown state
        setOpenOpportunityTypes((prev) => [...prev, false]);
    };

    const removeRole = (index) => {
        if (formData.roles.length === 1) {
            // Don't remove the last role
            return;
        }

        const updatedRoles = [...formData.roles];
        updatedRoles.splice(index, 1);

        setFormData((prev) => ({
            ...prev,
            roles: updatedRoles,
        }));

        // Update dropdown states
        const updatedOpportunityTypes = [...openOpportunityTypes];
        updatedOpportunityTypes.splice(index, 1);
        setOpenOpportunityTypes(updatedOpportunityTypes);
    };

    const validateForm = () => {
        let newErrors = {};

        // Company name validation
        if (!formData.name.trim()) {
            newErrors.name = "Company name is required";
        }

        // Eligible branches validation
        if (!formData.eligibleBranches.length) {
            newErrors.eligibleBranches = "At least one branch must be selected";
        }

        // Roles validation
        formData.roles.forEach((role, index) => {
            if (!role.roleName.trim()) {
                newErrors[`roles[${index}].roleName`] = "Role name is required";
            }

            if (!role.year.trim()) {
                newErrors[`roles[${index}].year`] = "Year is required";
            }

            // Validate stipend for Internship and Internship + Full Time
            if ((role.opportunityType === "Internship" ||
                role.opportunityType === "Internship + Full Time") &&
                !role.stipend.trim()) {
                newErrors[`roles[${index}].stipend`] = "Stipend is required for internships";
            }

            // Validate CTC for Full Time and Internship + Full Time
            if ((role.opportunityType === "Full Time" ||
                role.opportunityType === "Internship + Full Time") &&
                !role.CTC.trim()) {
                newErrors[`roles[${index}].CTC`] = "CTC is required for full time positions";
            }
        });

        // Recruited students validation
        if (!formData.recruitedStudents.trim()) {
            newErrors.recruitedStudents = "Number of recruited students is required";
        } else if (isNaN(Number(formData.recruitedStudents)) || Number(formData.recruitedStudents) < 0) {
            newErrors.recruitedStudents = "Please enter a valid number";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            setAlertConfig({
                header: "Error",
                message: "Please correct the errors in the form",
                buttons: [
                    {
                        text: "OK",
                        onPress: () => setAlertVisible(false),
                        style: "default",
                    },
                ],
            });
            setAlertVisible(true);
            return;
        }

        setIsSubmitting(true);

        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            if (!accessToken || !refreshToken) {
                setAlertConfig({
                    header: "Error",
                    message: "Tokens are required. Please login again",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default",
                        },
                    ],
                });
                setAlertVisible(true);
                return;
            }

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/past-recruiter/add-past-recruiter`, {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const responseError = response.text()
                console.log("Network Error:", responseError);
                return
            }

            const result = await response.json();

            if (result.statusCode === 200) {
                setAlertConfig({
                    header: "Success",
                    message: "Past recruiter added successfully",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => {
                                setAlertVisible(false);
                                setFormData({
                                    name: "",
                                    eligibleBranches: [],
                                    roles: [
                                        {
                                            roleName: "",
                                            opportunityType: "Internship",
                                            stipend: "",
                                            CTC: "",
                                            year: "",
                                        },
                                    ],
                                    recruitedStudents: "",
                                });
                            },
                            style: "default",
                        },
                    ],
                });
                setAlertVisible(true);
            } else {
                setAlertConfig({
                    header: "Error",
                    message: result?.message || "Something went wrong. Please try again.",
                    buttons: [
                        {
                            text: "OK",
                            onPress: () => setAlertVisible(false),
                            style: "default",
                        },
                    ],
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
                        style: "default",
                    },
                ],
            });
            setAlertVisible(true);
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleOpportunityType = (index, value) => {
        const newOpenOpportunityTypes = [...openOpportunityTypes];
        newOpenOpportunityTypes[index] = value;
        setOpenOpportunityTypes(newOpenOpportunityTypes);
    };

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: theme === "light" ? "#F5F5F5" : "#0D021F" },
            ]}
        >
            <StatusBar
                barStyle={theme === "light" ? "dark-content" : "light-content"}
                backgroundColor={theme === "light" ? "#F5F5F5" : "#0D021F"}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardContainer}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            style={styles.backButton}
                        >
                            <Ionicons
                                name="arrow-back"
                                size={24}
                                color={theme === "light" ? "#6A0DAD" : "white"}
                            />
                        </TouchableOpacity>
                        <Text
                            style={[
                                styles.welcomeTitle,
                                { color: theme === "light" ? "#333333" : "white" },
                            ]}
                        >
                            Add{" "}
                            <Text
                                style={[
                                    styles.accentText,
                                    { color: theme === "light" ? "#6A0DAD" : "#C92EFF" },
                                ]}
                            >
                                Past Recruiter
                            </Text>
                        </Text>
                    </View>

                    <CustomAlert
                        visible={alertVisible}
                        header={alertConfig.header}
                        message={alertConfig.message}
                        buttons={alertConfig.buttons}
                        onClose={() => setAlertVisible(false)}
                    />

                    {/* Description Card */}
                    <LinearGradient
                        colors={
                            theme === "light"
                                ? ["#e6f7ff", "#c2e0ff"]
                                : ["#1C1235", "#2A1F3D"]
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.descriptionCard}
                    >
                        <View style={styles.cardContent}>
                            <View
                                style={[
                                    styles.iconContainer,
                                    {
                                        backgroundColor: theme === "light"
                                            ? "rgba(106, 13, 173, 0.1)"
                                            : "rgba(255, 255, 255, 0.15)",
                                    },
                                ]}
                            >
                                <FontAwesome5
                                    name="building"
                                    size={24}
                                    color={theme === "light" ? "#6A0DAD" : "white"}
                                />
                            </View>
                            <View style={styles.cardTextContent}>
                                <Text
                                    style={[
                                        styles.cardTitle,
                                        { color: theme === "light" ? "#333333" : "white" },
                                    ]}
                                >
                                    Add Past Recruiter
                                </Text>
                                <Text
                                    style={[
                                        styles.formDescription,
                                        { color: theme === "light" ? "#666" : "#ccc" },
                                    ]}
                                >
                                    Record information about past campus recruiters including roles and hired students
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>

                    {/* Form Fields */}
                    <View style={styles.formContainer}>
                        {/* Company Name */}
                        <InputField
                            icon="building-o"
                            placeholder="Company Name"
                            value={formData.name}
                            onChangeText={(text) => handleChange("name", text)}
                            hasError={!!errors.name}
                            errorMessage={errors.name}
                            required
                            theme={theme}
                        />

                        {/* Eligible Branches */}
                        <View style={styles.fieldContainer}>
                            <Text
                                style={[
                                    styles.label,
                                    { color: theme === "light" ? "#333333" : "white" },
                                ]}
                            >
                                Eligible Branches *
                            </Text>
                            <DropDownPicker
                                multiple={true}
                                min={1}
                                listMode="SCROLLVIEW"
                                open={openBranches}
                                value={formData.eligibleBranches}
                                items={branchOptions}
                                setOpen={setOpenBranches}
                                setValue={(callback) => {
                                    const value = callback(formData.eligibleBranches);
                                    handleChange("eligibleBranches", value);
                                }}
                                style={[
                                    styles.dropdown,
                                    {
                                        backgroundColor: theme === "light" ? "#f0f0ff" : "#1C1235",
                                        borderColor: theme === "light" ? "#d0d0ff" : "#2A1F3D",
                                        borderWidth: errors.eligibleBranches ? 1 : 0,
                                        borderColor: errors.eligibleBranches
                                            ? "#FF375F"
                                            : "transparent",
                                    },
                                ]}
                                dropDownContainerStyle={{
                                    backgroundColor: theme === "light" ? "#f0f0ff" : "#1C1235",
                                    borderColor: theme === "light" ? "#d0d0ff" : "#2A1F3D",
                                }}
                                textStyle={{
                                    color: theme === "light" ? "#333333" : "white",
                                    fontSize: 16,
                                }}
                                labelStyle={{
                                    color: theme === "light" ? "#333333" : "white",
                                }}
                                placeholder="Select eligible branches"
                                placeholderStyle={{
                                    color: theme === "light" ? "#888" : "#aaa",
                                }}
                                zIndex={3000}
                            />
                            {errors.eligibleBranches && (
                                <Text style={styles.errorText}>{errors.eligibleBranches}</Text>
                            )}

                            {formData.eligibleBranches.length > 0 && (
                                <View style={styles.selectedBranchesContainer}>
                                    {formData.eligibleBranches.map((branch) => {
                                        const branchLabel = branchOptions.find(option => option.value === branch)?.label || branch;
                                        return (
                                            <View key={branch} style={styles.selectedBranchTag}>
                                                <Text style={[
                                                    styles.selectedBranchText,
                                                    { color: theme === "light" ? "#333333" : "white" }
                                                ]}>
                                                    {branchLabel}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        const updatedBranches = formData.eligibleBranches.filter(b => b !== branch);
                                                        handleChange("eligibleBranches", updatedBranches);
                                                    }}
                                                    style={styles.removeBranchButton}
                                                >
                                                    <Ionicons
                                                        name="close"
                                                        size={16}
                                                        color={theme === "light" ? "#6A0DAD" : "#C92EFF"}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            )}

                        </View>

                        {/* Roles Section */}
                        <View style={styles.sectionContainer}>
                            <Text
                                style={[
                                    styles.sectionTitle,
                                    { color: theme === "light" ? "#333333" : "white" },
                                ]}
                            >
                                Roles
                            </Text>

                            {formData.roles.map((role, index) => (
                                <View key={index} style={styles.roleContainer}>
                                    <View style={styles.roleHeader}>
                                        <Text
                                            style={[
                                                styles.roleTitle,
                                                { color: theme === "light" ? "#333333" : "white" },
                                            ]}
                                        >
                                            Role {index + 1}
                                        </Text>
                                        {formData.roles.length > 1 && (
                                            <TouchableOpacity
                                                onPress={() => removeRole(index)}
                                                style={styles.removeButton}
                                            >
                                                <Ionicons
                                                    name="trash-outline"
                                                    size={20}
                                                    color={theme === "light" ? "#6A0DAD" : "#C92EFF"}
                                                />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Role Name */}
                                    <InputField
                                        icon="briefcase"
                                        placeholder="Role Name"
                                        value={role.roleName}
                                        onChangeText={(text) =>
                                            handleRoleChange(index, "roleName", text)
                                        }
                                        hasError={!!errors[`roles[${index}].roleName`]}
                                        errorMessage={errors[`roles[${index}].roleName`]}
                                        required
                                        theme={theme}
                                    />

                                    {/* Opportunity Type */}
                                    <View style={styles.fieldContainer}>
                                        <Text
                                            style={[
                                                styles.label,
                                                { color: theme === "light" ? "#333333" : "white" },
                                            ]}
                                        >
                                            Opportunity Type *
                                        </Text>
                                        <DropDownPicker
                                            listMode="SCROLLVIEW"
                                            open={openOpportunityTypes[index]}
                                            value={role.opportunityType}
                                            items={opportunityTypeOptions}
                                            setOpen={(value) => toggleOpportunityType(index, value)}
                                            setValue={(callback) => {
                                                const value = callback(role.opportunityType);
                                                handleRoleChange(index, "opportunityType", value);
                                            }}
                                            style={[
                                                styles.dropdown,
                                                {
                                                    backgroundColor: theme === "light" ? "#f0f0ff" : "#1C1235",
                                                    borderColor: theme === "light" ? "#d0d0ff" : "#2A1F3D",
                                                },
                                            ]}
                                            dropDownContainerStyle={{
                                                backgroundColor: theme === "light" ? "#f0f0ff" : "#1C1235",
                                                borderColor: theme === "light" ? "#d0d0ff" : "#2A1F3D",
                                            }}
                                            textStyle={{
                                                color: theme === "light" ? "#333333" : "white",
                                                fontSize: 16,
                                            }}
                                            labelStyle={{
                                                color: theme === "light" ? "#333333" : "white",
                                            }}
                                            zIndex={2500 - index * 10}
                                        />
                                    </View>

                                    {/* Conditional Fields based on Opportunity Type */}
                                    {(role.opportunityType === "Internship" ||
                                        role.opportunityType === "Internship + Full Time") && (
                                            <InputField
                                                icon="money"
                                                placeholder="Stipend"
                                                value={role.stipend}
                                                onChangeText={(text) =>
                                                    handleRoleChange(index, "stipend", text)
                                                }
                                                keyboardType="numeric"
                                                hasError={!!errors[`roles[${index}].stipend`]}
                                                errorMessage={errors[`roles[${index}].stipend`]}
                                                required
                                                theme={theme}
                                            />
                                        )}

                                    {(role.opportunityType === "Full Time" ||
                                        role.opportunityType === "Internship + Full Time") && (
                                            <InputField
                                                icon="money"
                                                placeholder="CTC"
                                                value={role.CTC}
                                                onChangeText={(text) =>
                                                    handleRoleChange(index, "CTC", text)
                                                }
                                                keyboardType="numeric"
                                                hasError={!!errors[`roles[${index}].CTC`]}
                                                errorMessage={errors[`roles[${index}].CTC`]}
                                                required
                                                theme={theme}
                                            />
                                        )}

                                    {/* Year */}
                                    <InputField
                                        icon="calendar"
                                        placeholder="Year"
                                        value={role.year}
                                        onChangeText={(text) =>
                                            handleRoleChange(index, "year", text)
                                        }
                                        keyboardType="numeric"
                                        hasError={!!errors[`roles[${index}].year`]}
                                        errorMessage={errors[`roles[${index}].year`]}
                                        required
                                        theme={theme}
                                    />
                                </View>
                            ))}

                            {/* Add Role Button */}
                            <TouchableOpacity
                                style={[
                                    styles.addButton,
                                    {
                                        backgroundColor: theme === "light" ? "#f0f0ff" : "#1C1235",
                                        borderColor: theme === "light" ? "#6A0DAD" : "#C92EFF",
                                    },
                                ]}
                                onPress={addRole}
                            >
                                <Ionicons
                                    name="add"
                                    size={20}
                                    color={theme === "light" ? "#6A0DAD" : "#C92EFF"}
                                />
                                <Text
                                    style={[
                                        styles.addButtonText,
                                        { color: theme === "light" ? "#6A0DAD" : "#C92EFF" },
                                    ]}
                                >
                                    Add Another Role
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Recruited Students */}
                        <InputField
                            icon="users"
                            placeholder="Number of Recruited Students"
                            value={formData.recruitedStudents}
                            onChangeText={(text) => handleChange("recruitedStudents", text)}
                            keyboardType="numeric"
                            hasError={!!errors.recruitedStudents}
                            errorMessage={errors.recruitedStudents}
                            required
                            theme={theme}
                        />

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                isSubmitting && styles.disabledButton,
                                {
                                    backgroundColor: theme === "light" ? "#6A0DAD" : "#C92EFF",
                                },
                            ]}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" size="small" />
                            ) : (
                                <>
                                    <Text style={styles.buttonText}>ADD RECRUITER</Text>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardContainer: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        marginTop: 20,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: "bold",
        marginLeft: 10,
    },
    accentText: {
        fontWeight: "bold",
    },
    descriptionCard: {
        borderRadius: 16,
        overflow: "hidden",
        marginBottom: 20,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    cardContent: {
        padding: 20,
        flexDirection: "row",
        alignItems: "center",
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    cardTextContent: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    formDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginTop: 4,
    },
    formContainer: {
        marginTop: 10,
    },
    fieldContainer: {
        width: "100%",
        marginBottom: 15,
        position: "relative",
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 10,
        width: "100%",
    },
    multilineContainer: {
        alignItems: "flex-start",
    },
    inputIcon: {
        marginRight: 10,
        marginTop: Platform.OS === "ios" ? 0 : 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    multilineInput: {
        height: 100,
        textAlignVertical: "top",
    },
    label: {
        marginBottom: 8,
        fontSize: 16,
    },
    dropdown: {
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    selectedBranchesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 10,
        gap: 8,
    },
    selectedBranchTag: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(201, 46, 255, 0.1)',
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        marginBottom: 5,
    },
    selectedBranchText: {
        fontSize: 14,
        marginRight: 5,
    },
    removeBranchButton: {
        padding: 2,
    },
    inputError: {
        borderWidth: 1,
        borderColor: "#FF375F",
    },
    errorText: {
        color: "#FF375F",
        fontSize: 12,
        marginTop: 5,
        marginLeft: 5,
    },
    sectionContainer: {
        marginVertical: 10,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    roleContainer: {
        marginBottom: 20,
        padding: 15,
        borderRadius: 10,
        backgroundColor: "rgba(201, 46, 255, 0.05)",
    },
    roleHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    roleTitle: {
        fontSize: 16,
        fontWeight: "bold",
    },
    removeButton: {
        padding: 5,
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 15,
    },
    addButtonText: {
        fontWeight: "500",
        marginLeft: 8,
    },
    submitButton: {
        paddingVertical: 15,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 30,
        elevation: 3,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    disabledButton: {
        opacity: 0.7,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        marginRight: 8,
    },
});

export default AddPastRecruiterScreen;