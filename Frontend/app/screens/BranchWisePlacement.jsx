import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  StatusBar,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Feather, Ionicons } from '@expo/vector-icons';
import { getAccessToken, getRefreshToken } from '../../utils/tokenStorage.js'
import { useUser } from '../../context/userContext.js';
import CustomAlert from '../../components/CustomAlert.jsx';
import { router } from 'expo-router';

const PlacementDashboard = () => {
  const [selectedBranch, setSelectedBranch] = useState('All Branches');
  const [branchModalVisible, setBranchModalVisible] = useState(false);
  const [placementData, setPlacementData] = useState([])
  const { theme } = useUser()
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertConfig, setAlertConfig] = useState({
    header: "",
    message: "",
    buttons: []
  })
  const [isLoading, setIsLoading] = useState(false)

  const themeColors = {
    primary: theme === 'light' ? '#6A0DAD' : '#C92EFF',
    background: theme === 'light' ? '#F5F5F5' : '#0D021F',
    cardBackground: theme === 'light' ? '#FFFFFF' : '#1C1235',
    text: theme === 'light' ? '#333333' : '#FFFFFF',
    textSecondary: theme === 'light' ? '#6A0DAD' : '#BA68C8',
    border: theme === 'light' ? 'rgba(106, 13, 173, 0.1)' : '#2A1E43',
    positive: theme === 'light' ? '#388E3C' : '#4CAF50',
    negative: theme === 'light' ? '#D32F2F' : '#F44336',
  };

  const branches = [
    'All Branches',
    ...new Set(placementData.map(item => item.branch))
  ];

  useEffect(() => {
    getPlacementData()
  }, [])

  const getPlacementData = async () => {
    setIsLoading(true)
    try {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (!accessToken || !refreshToken) {
        Alert.alert("Error", "Please login again to view this page");
        return;
      }

      const response = await fetch(`http://${process.env.EXPO_PUBLIC_IP_ADDRESS}:5000/api/v1/placement-statistics/get-placement-statistics`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'x-refresh-token': refreshToken
        }
      });

      if (!response.ok) {
        const errorText = await response.text(); // Get raw response if error occurs
        console.error(`HTTP Error: ${response.status} - ${response.statusText}`, errorText);
        Alert.alert("Error", `Server Error: ${response.status}`);
        return;
      }

      const result = await response.json();

      if (result?.statusCode === 200 && result?.data) {
        setPlacementData(result.data);
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
        header: "Failed to fetch data",
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
      console.log(error.message);
    } finally {
      setIsLoading(false)
    }
  };


  // Get data for selected branch
  const getCurrentBranchData = () => {

    const monthOrder = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const getMonthlyData = () => {
      const monthlyCounts = {};
      const currentMonthIndex = new Date().getMonth();
      const filteredMonths = monthOrder.slice(0, currentMonthIndex + 1);

      // Initialize monthlyCounts with 0 for each month
      filteredMonths.forEach(month => {
        monthlyCounts[month] = 0;
      });

      // Filter data based on selectedBranch
      const relevantData = selectedBranch === "All Branches"
        ? placementData
        : placementData.filter(branch => branch.branch === selectedBranch);

      // Accumulate placement counts per month
      relevantData.forEach(branch => {
        if (branch.ctcValues) {
          branch.ctcValues.forEach(({ month }) => {
            if (filteredMonths.includes(month)) {
              monthlyCounts[month] += 1;
            }
          });
        }
      });

      return {
        labels: filteredMonths,
        datasets: [{
          data: filteredMonths.map(month => monthlyCounts[month])
        }]
      };
    };
    const rangeCounts = [0, 0, 0, 0, 0];

    placementData.forEach(branch => {
      if (!branch.ctcValues || branch.ctcValues.length === 0) return;

      branch?.ctcValues.forEach(({ ctc }) => {
        if (ctc < 25) rangeCounts[0]++;
        else if (ctc >= 25 && ctc < 30) rangeCounts[1]++;
        else if (ctc >= 30 && ctc < 35) rangeCounts[2]++;
        else if (ctc >= 35 && ctc < 40) rangeCounts[3]++;
        else rangeCounts[4]++;
      })
    });

    const totalCount = rangeCounts.reduce((sum, count) => sum + count, 0);
    const rangePercentages = rangeCounts.map(count => Number(((count / totalCount) * 100).toFixed(2)));

    if (selectedBranch === 'All Branches') {
      const totalPlaced = placementData.reduce((sum, item) => sum + item.placedStudents, 0);
      const totalStudents = placementData.reduce((sum, item) => sum + item.totalStudents, 0);
      const avgCTC = placementData.length
        ? Number((placementData.reduce((sum, item) => sum + item.avgPackage, 0) / placementData.length).toFixed(2))
        : 0;
      const highestPackage = Math.max(...placementData.map(item => item.maxPackage));
      const placementRate = totalStudents ? Number(((totalPlaced / totalStudents) * 100).toFixed(2)) : 0;

      return {
        totalPlacements: totalPlaced,
        averageCTC: avgCTC,
        highestPackage: highestPackage.toFixed(2),
        placementRate,
        monthlyData: getMonthlyData(placementData),
        ctcRanges: {
          labels: ['<25', '25-30', '30-35', '35-40', '40+'],
          data: rangePercentages
        }
      };
    }

    const branchData = placementData.find(item => item.branch === selectedBranch);
    if (!branchData) return null;

    return {
      totalPlacements: branchData.placedStudents,
      averageCTC: Number(branchData.avgPackage).toFixed(2),
      highestPackage: Number(branchData.maxPackage).toFixed(2),
      placementRate: Number(((branchData.placedStudents / branchData.totalStudents) * 100).toFixed(2)),
      monthlyData: getMonthlyData([branchData]),
      ctcRanges: {
        labels: ['<25', '25-30', '30-35', '35-40', '40+'],
        data: [
          branchData.ctcValues.filter(v => v.ctc < 25).length,
          branchData.ctcValues.filter(v => v.ctc >= 25 && v.ctc < 30).length,
          branchData.ctcValues.filter(v => v.ctc >= 30 && v.ctc < 35).length,
          branchData.ctcValues.filter(v => v.ctc >= 35 && v.ctc < 40).length,
          branchData.ctcValues.filter(v => v.ctc >= 40).length
        ].map(count => Number(((count / branchData.ctcValues.length) * 100).toFixed(2)))
      }
    };
  };

  const currentBranchData = getCurrentBranchData();

  // StatCard component (unchanged from previous version)
  const StatCard = ({ title, value, unit, change }) => (
    <View style={[styles.statCard, { backgroundColor: themeColors.cardBackground, shadowColor: theme === 'light' ? '#000' : 'transparent' }]}>
      <Text style={[styles.statTitle, { color: themeColors.textSecondary }]}>{title}</Text>
      <View style={styles.statValueContainer}>
        <Text style={[styles.statValue, { color: themeColors.text }]}>{value}</Text>
        {unit && <Text style={[styles.statUnit, { color: theme === 'light' ? '#8A5EC2' : '#E1BEE7' }]}> {unit}</Text>}
      </View>
      {change && (
        <Text style={[
          styles.statChange,
          { color: change > 0 ? themeColors.positive : themeColors.negative }
        ]}>
          {change > 0 ? '+' : ''}{change}% vs 2024
        </Text>
      )}
    </View>
  );


  // BranchModal component (unchanged from previous version)
  const BranchModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={branchModalVisible}
      onRequestClose={() => setBranchModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Select Branch</Text>
            <TouchableOpacity onPress={() => setBranchModalVisible(false)}>
              <Feather name="x" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            {branches.map((branch, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.branchOption,
                  { borderBottomColor: themeColors.border },
                  selectedBranch === branch && {
                    backgroundColor: theme === 'light'
                      ? 'rgba(106, 13, 173, 0.1)'
                      : 'rgba(201, 46, 255, 0.1)'
                  }
                ]}
                onPress={() => {
                  setSelectedBranch(branch);
                  setBranchModalVisible(false);
                }}
              >
                <Text
                  style={[
                    styles.branchOptionText,
                    { color: themeColors.text },
                    selectedBranch === branch && {
                      color: themeColors.primary,
                      fontWeight: 'bold'
                    }
                  ]}
                >
                  {branch}
                </Text>
                {selectedBranch === branch && (
                  <Feather name="check" size={20} color={themeColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  if (!currentBranchData) return null;

  if (isLoading) {
    return (
      // <View style={[styles.container, styles.loaderContainer]}>
      <View style={{
        flex: 1,
        backgroundColor: theme === 'light' ? '#F5F5F5' : '#120023',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
        <ActivityIndicator size="large" color="#6A0DAD" />
        <Text style={{ color: theme === 'light' ? '#333' : '#fff', marginTop: 12 }}>
          Loading Placement Statistics...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </Pressable>
          <View>
            <Text style={[styles.title, { color: themeColors.text }]}>Placement Dashboard</Text>
            <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Academic Year 2024-2025</Text>
          </View>
        </View>

        <CustomAlert
          visible={alertVisible}
          header={alertConfig.header}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={() => setAlertVisible(false)}
        />

        {/* Branch Selector */}
        <TouchableOpacity
          style={[styles.branchSelector, { backgroundColor: themeColors.cardBackground }]}
          onPress={() => setBranchModalVisible(true)}
        >
          <View style={styles.branchDisplay}>
            <Text style={[styles.branchText, { color: themeColors.text }]}>{selectedBranch}</Text>
            <Feather name="chevron-down" size={20} color={themeColors.primary} />
          </View>
          <Text style={[styles.branchLabel, { color: themeColors.textSecondary }]}>Branch</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <StatCard
            title="Total Placements"
            value={currentBranchData.totalPlacements}
            change={8.2}
          />
          <StatCard
            title="Average CTC"
            value={currentBranchData.averageCTC}
            unit="LPA"
            change={12.3}
          />
          <StatCard
            title="Highest Package"
            value={currentBranchData.highestPackage}
            unit="LPA"
            change={15.4}
          />
          <StatCard
            title="Placement Rate"
            value={currentBranchData.placementRate}
            unit="%"
            change={5.9}
          />
        </View>

        <View style={[styles.chartCard, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.chartTitle, { color: themeColors.text }]}>Monthly Placements (2025) - {selectedBranch}</Text>
          <LineChart
            data={currentBranchData.monthlyData}
            width={Dimensions.get('window').width - 40}
            height={220}
            yAxisInterval={Math.max(...currentBranchData.monthlyData.datasets[0].data) > 10 ? 2 : 1}
            fromZero={true}
            chartConfig={{
              backgroundColor: themeColors.cardBackground,
              backgroundGradientFrom: themeColors.cardBackground,
              backgroundGradientTo: themeColors.cardBackground,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(${theme === 'light' ? '106, 13, 173' : '186, 104, 200'}, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(${theme === 'light' ? '51, 51, 51' : '255, 255, 255'}, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: themeColors.primary,
              },
            }}
            bezier
            style={styles.chart}
            segments={4}
          />
        </View>

        <View style={[styles.chartCard, { backgroundColor: themeColors.cardBackground }]}>
          <Text style={[styles.chartTitle, { color: themeColors.text }]}>CTC Distribution (%) - {selectedBranch}</Text>
          <View style={styles.ctcDistribution}>
            {currentBranchData.ctcRanges.labels.map((label, index) => (
              <View key={index} style={styles.ctcItem}>
                <View
                  style={styles.ctcBarContainer}
                  onLayout={(event) => {
                    const { height } = event.nativeEvent.layout;
                  }}
                >
                  <View
                    style={[
                      styles.ctcBar,
                      {
                        height: currentBranchData.ctcRanges.data[index],
                        backgroundColor: themeColors.primary
                      }
                    ]}
                  />
                </View>
                <Text style={[styles.ctcLabel, { color: themeColors.textSecondary }]}>{label}</Text>
                <Text style={[styles.ctcValue, { color: themeColors.text }]}>{currentBranchData.ctcRanges.data[index]}%</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: themeColors.textSecondary }]}>
            Last updated: March 31, 2025
          </Text>
        </View>
      </ScrollView>

      <BranchModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    marginTop: 10
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 15
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 15
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeIcon: {
    marginRight: 8,
  },
  yearSelector: {
    flexDirection: 'row',
    borderRadius: 8,
  },
  yearButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedYear: {
    backgroundColor: '#C92EFF',
  },
  yearText: {
    fontWeight: '600',
  },
  selectedYearText: {
    color: 'white',
  },
  branchSelector: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  branchDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branchText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  branchLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  branchOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    paddingHorizontal: 10
  },
  branchOptionText: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 14,
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statUnit: {
    fontSize: 14,
  },
  statChange: {
    fontSize: 12,
    marginTop: 8,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  ctcDistribution: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 150,
    paddingTop: 20,
  },
  ctcItem: {
    alignItems: 'center',
    width: '18%',
  },
  ctcBarContainer: {
    height: 100,
    width: 20,
    justifyContent: 'flex-end',
  },
  ctcBar: {
    width: 20,
    borderRadius: 4,
  },
  ctcLabel: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'center',
  },
  ctcValue: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
export default PlacementDashboard;