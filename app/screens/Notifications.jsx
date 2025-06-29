import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../context/userContext.js';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js';
import CustomAlert from '../../components/CustomAlert.jsx';

const NotificationsScreen = () => {
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'unread', 'read'
    const { user, theme } = useUser();
    const router = useRouter();
    const [alertVisible, setAlertVisible] = useState(false);
    const [alertConfig, setAlertConfig] = useState({
        header: "",
        message: "",
        buttons: []
    });

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/notifications/get-notifications`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok) {
                const error = await response.text()
                console.log("Network error: ", error);
                return;
            }

            const result = await response.json();

            if (result.statusCode === 200) {
                const sortedNotifications = result.data.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

                setNotifications(sortedNotifications);
            } else {
                showAlert("Error", result?.message || "Failed to fetch notifications");
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            showAlert("Error", "Something went wrong while fetching notifications");
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            const accessToken = await getAccessToken();
            const refreshToken = await getRefreshToken();

            const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/notifications/mark-notification/c/${notificationId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'x-refresh-token': refreshToken
                }
            });

            if (!response.ok) {
                const error = await response.text()
                console.log("Network Error: ", error);
                return
            }

            const result = await response.json();

            if (result.statusCode === 200) {
                // Update the local state after marking as read
                setNotifications(prevNotifications =>
                    prevNotifications.map(notification =>
                        notification._id === notificationId
                            ? { ...notification, readBy: [...notification.readBy, user._id] }
                            : notification
                    )
                );
            } else {
                // showAlert("Error", result?.message || "Failed to mark notification as read");
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            // showAlert("Error", "Something went wrong");
        }
    };

    const showAlert = (header, message) => {
        setAlertConfig({
            header,
            message,
            buttons: [
                {
                    text: "OK",
                    onPress: () => setAlertVisible(false),
                    style: "default"
                }
            ]
        });
        setAlertVisible(true);
    };

    const onRefresh = () => {
        setIsRefreshing(true);
        fetchNotifications();
    };

    // Filter notifications based on active tab
    const filteredNotifications = useMemo(() => {
        if (activeTab === 'all') return notifications;
        if (activeTab === 'unread') {
            return notifications.filter(notification =>
                !notification.readBy.includes(user._id)
            );
        }
        if (activeTab === 'read') {
            return notifications.filter(notification =>
                notification.readBy.includes(user._id)
            );
        }
        return notifications;
    }, [notifications, activeTab, user._id]);

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_company':
                return { icon: 'business', color: '#4CAF50' };
            case 'past_recruiter':
                return { icon: 'history', color: '#9C27B0' };
            case 'round_result':
                return { icon: 'check-circle', color: '#2196F3' };
            case 'event_update':
                return { icon: 'event', color: '#FF9800' };
            case 'announcement':
                return { icon: 'campaign', color: '#F44336' };
            case 'resume_feedback':
                return { icon: 'description', color: '#3F51B5' };
            case 'placement_stats':
                return { icon: 'bar-chart', color: '#009688' };
            case 'company_review':
                return { icon: 'rate-review', color: '#795548' };
            case 'eligibility_change':
                return { icon: 'how-to-reg', color: '#607D8B' };
            case 'interview_question':
                return { icon: 'help', color: '#00BCD4' };
            case 'admin_message':
                return { icon: 'admin-panel-settings', color: '#673AB7' };
            default:
                return { icon: 'notifications', color: '#9E9E9E' };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, '0');

        if (diffDays === 0) {
            // Today
            return `Today at ${hours}:${minutes}`;
        } else if (diffDays === 1) {
            // Yesterday
            return `Yesterday at ${hours}:${minutes}`;
        } else if (diffDays < 7) {
            // Less than a week
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return `${days[date.getDay()]} at ${hours}:${minutes}`;
        } else {
            // More than a week
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year} at ${hours}:${minutes}`;
        }
    };

    const handleNotificationPress = (notification) => {
        const notificationType = notification.type

        if (notificationType === 'new_company') {
            router.push('/screens/UpcomingCompanies')
        } else if (notificationType === 'placement_stats') {
            router.push('/screens/BranchWisePlacement')
        }
    }

    const renderNotificationItem = ({ item }) => {
        const isRead = item.readBy.includes(user._id);
        const { icon, color } = getNotificationIcon(item.type);

        return (
            <TouchableOpacity
                style={[
                    styles(theme).notificationItem,
                    !isRead && styles(theme).unreadItem
                ]}
                onPress={() => {
                    if (!isRead) {
                        markAsRead(item._id);
                    }
                    handleNotificationPress(item)
                }}
            >
                <View style={[styles(theme).iconContainer, { backgroundColor: color + '20' }]}>
                    <MaterialIcons name={icon} size={24} color={color} />
                </View>
                <View style={styles(theme).contentContainer}>
                    <View style={styles(theme).headerRow}>
                        <Text style={styles(theme).notificationType}>
                            {item.type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </Text>
                        {!isRead && (
                            <View style={styles(theme).unreadDot} />
                        )}
                    </View>
                    <Text style={styles(theme).notificationContent}>
                        {item.content}
                    </Text>
                    <Text style={styles(theme).timestamp}>
                        {formatDate(item.createdAt)}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    const renderEmptyComponent = () => (
        <View style={styles(theme).emptyContainer}>
            <MaterialIcons
                name="notifications-off"
                size={64}
                color={theme === 'light' ? '#ccc' : '#444'}
            />
            <Text style={styles(theme).emptyText}>
                {activeTab === 'all'
                    ? 'No notifications yet'
                    : activeTab === 'unread'
                        ? 'No unread notifications'
                        : 'No read notifications'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles(theme).container}>
            <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />

            <View style={styles(theme).header}>
                <TouchableOpacity
                    style={styles(theme).backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={theme === 'light' ? '#6A0DAD' : 'white'}
                    />
                </TouchableOpacity>
                <Text style={styles(theme).headerTitle}>Notifications</Text>
                <View style={styles(theme).rightHeaderPlaceholder} />
            </View>

            <CustomAlert
                visible={alertVisible}
                header={alertConfig.header}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertVisible(false)}
            />

            <View style={styles(theme).tabContainer}>
                <TouchableOpacity
                    style={[
                        styles(theme).tab,
                        activeTab === 'all' && styles(theme).activeTab
                    ]}
                    onPress={() => setActiveTab('all')}
                >
                    <Text style={[
                        styles(theme).tabText,
                        activeTab === 'all' && styles(theme).activeTabText
                    ]}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles(theme).tab,
                        activeTab === 'unread' && styles(theme).activeTab
                    ]}
                    onPress={() => setActiveTab('unread')}
                >
                    <Text style={[
                        styles(theme).tabText,
                        activeTab === 'unread' && styles(theme).activeTabText
                    ]}>Unread</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles(theme).tab,
                        activeTab === 'read' && styles(theme).activeTab
                    ]}
                    onPress={() => setActiveTab('read')}
                >
                    <Text style={[
                        styles(theme).tabText,
                        activeTab === 'read' && styles(theme).activeTabText
                    ]}>Read</Text>
                </TouchableOpacity>
            </View>

            {isLoading ? (
                <View style={styles(theme).loadingContainer}>
                    <ActivityIndicator size="large" color={theme === 'light' ? '#6A0DAD' : '#f0c5f1'} />
                    <Text style={styles(theme).loadingText}>Loading notifications...</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredNotifications}
                    renderItem={renderNotificationItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles(theme).listContainer}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={[theme === 'light' ? '#6A0DAD' : '#f0c5f1']}
                            tintColor={theme === 'light' ? '#6A0DAD' : '#f0c5f1'}
                        />
                    }
                    ListEmptyComponent={renderEmptyComponent}
                />
            )}
        </SafeAreaView>
    );
};

const styles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme === 'light' ? '#F8F9FA' : '#120023',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: theme === 'light' ? 'white' : '#1A0533',
        borderBottomWidth: 1,
        borderBottomColor: theme === 'light' ? '#EAEAEA' : 'rgba(255, 255, 255, 0.05)',
        marginTop: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: theme === 'light' ? '#6A0DAD' : 'white',
    },
    backButton: {
        padding: 4,
    },
    rightHeaderPlaceholder: {
        width: 24,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: theme === 'light' ? '#FFFFFF' : '#1A0533',
        paddingVertical: 12,
    },
    tab: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: theme === 'light' ? '#6A0DAD' : '#f0c5f1',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme === 'light' ? '#666' : '#AAA',
    },
    activeTabText: {
        color: theme === 'light' ? '#6A0DAD' : '#f0c5f1',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: theme === 'light' ? '#6A0DAD' : '#f0c5f1',
    },
    listContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    notificationItem: {
        flexDirection: 'row',
        backgroundColor: theme === 'light' ? 'white' : '#2c0847',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: theme === 'light' ? '#000' : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: theme === 'light' ? 0.1 : 0.3,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadItem: {
        backgroundColor: theme === 'light' ? 'rgba(106, 13, 173, 0.05)' : 'rgba(139, 8, 144, 0.15)',
        borderLeftWidth: 3,
        borderLeftColor: theme === 'light' ? '#6A0DAD' : '#f0c5f1',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contentContainer: {
        flex: 1,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationType: {
        fontSize: 14,
        fontWeight: '600',
        color: theme === 'light' ? '#6A0DAD' : '#f0c5f1',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: theme === 'light' ? '#6A0DAD' : '#f0c5f1',
    },
    notificationContent: {
        fontSize: 15,
        color: theme === 'light' ? '#333' : '#fff',
        marginBottom: 8,
        lineHeight: 20,
    },
    timestamp: {
        fontSize: 12,
        color: theme === 'light' ? '#888' : '#AAA',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: theme === 'light' ? '#666' : '#AAA',
        textAlign: 'center',
    }
});

export default NotificationsScreen;