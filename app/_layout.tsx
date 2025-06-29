import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { UserProvider } from "../context/userContext.js";
import * as Notifications from "expo-notifications";

SplashScreen.preventAutoHideAsync();

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: false,
	}),
});

export default function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	useEffect(() => {
		if (loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	if (!loaded) {
		return null;
	}

	return (
		<UserProvider>
			<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
				<Stack>
					<Stack.Screen name="index" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Roles/Student" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Roles/Alumni" options={{ headerShown: false }} />
					<Stack.Screen name="Admin/login" options={{ headerShown: false }} />
					<Stack.Screen name="userloginsign/login" options={{ headerShown: false }} />
					<Stack.Screen name="userloginsign/Signup" options={{ headerShown: false }} />
					<Stack.Screen name="HomePage/Home" options={{ headerShown: false }} />
					<Stack.Screen name="HomePage/AdminHome" options={{ headerShown: false }} />
					<Stack.Screen name="HomePage/AlumniHome" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Profile/Profile" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Admin profile/Profile" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Alumni Profile/Profile" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Alumni Profile/ViewProfile" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Profile/ViewProfile" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Profile/EditProfile" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Profile/AppliedCompanies" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Profile/ChangePassword" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Profile/HelpAndSupport" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Profile/PrivacyPolicy" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Profile/ApplicationStatus" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Admin profile/ChangePassword" options={{ headerShown: false }} />
					<Stack.Screen name="screens/PastYearCompanies" options={{ headerShown: false }} />
					<Stack.Screen name="screens/CurrentYearPlacement" options={{ headerShown: false }} />
					<Stack.Screen name="screens/ConnectWithAlumni" options={{ headerShown: false }} />
					<Stack.Screen name="screens/ForgotPassword" options={{ headerShown: false }} />
					<Stack.Screen name="screens/QuestionAskByCompanies" options={{ headerShown: false }} />
					<Stack.Screen name="screens/NewPassword" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Notifications" options={{ headerShown: false }} />
					<Stack.Screen name="screens/InterviewPrep" options={{ headerShown: false }} />
					<Stack.Screen name="screens/FundamentalSubject" options={{ headerShown: false }} />
					<Stack.Screen name="screens/hrQuestions" options={{ headerShown: false }} />
					<Stack.Screen name="screens/UpcomingCompanies" options={{ headerShown: false }} />
					<Stack.Screen name="screens/RecruiterDetail" options={{ headerShown: false }} />
					<Stack.Screen name="screens/BranchWisePlacement" options={{ headerShown: false }} />
					<Stack.Screen name="screens/StudentPlacements" options={{ headerShown: false }} />
					<Stack.Screen name="screens/PlacementPolicies" options={{ headerShown: false }} />
					<Stack.Screen name="screens/UploadResume" options={{ headerShown: false }} />
					<Stack.Screen name="screens/[company]" options={{ headerShown: false }} />
					<Stack.Screen name="screens/ChatBot" options={{ headerShown: false }} />
					<Stack.Screen name="screens/AlumniDetail" options={{ headerShown: false }} />
					<Stack.Screen name="screens/CompanyDetail" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Admin/DownloadPlacementData" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Admin/DownloadStudentData" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Admin/addQuestion" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Admin/addCompany" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Admin/addPastRecruiter" options={{ headerShown: false }} />
					<Stack.Screen name="screens/Admin/addStudyMaterial" options={{ headerShown: false }} />
					<Stack.Screen name="Alumni/signup" options={{ headerShown: false }} />
					<Stack.Screen name="Alumni/login" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
				<StatusBar style="auto" />
			</ThemeProvider>
		</UserProvider>
	);
}