import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { LineChart } from 'react-native-chart-kit';
import Icon from 'react-native-vector-icons/Ionicons'; // Yenileme ikonu için

function Sales({ route }) {
    const [sales, setSales] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { email } = route.params;

    const fetchSales = useCallback(async () => {
        try {
            // Fetch sales records
            const salesQuery = query(collection(db, 'SalesCoin'), where('kullanici', '==', email));
            const salesSnapshot = await getDocs(salesQuery);
            const salesList = salesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            if (salesList.length === 0) {
                setError('No sales records found.');
                setLoading(false);
                return;
            }

            setSales(salesList);

            // Aggregate data for the chart
            const chartDataFormatted = salesList.map(sale => {
                const profitOrLoss = (sale.satisfiyati - sale.alisfiyati) * sale.adet;
                return {
                    name: sale.coin,
                    profitOrLoss: profitOrLoss,
                    color: profitOrLoss >= 0 ? 'green' : 'red'
                };
            });

            // Prepare data for LineChart
            const labels = chartDataFormatted.map(data => data.name);
            const dataPoints = chartDataFormatted.map(data => data.profitOrLoss);

            setChartData({
                labels: labels,
                datasets: [
                    {
                        data: dataPoints,
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
                    }
                ]
            });

        } catch (error) {
            console.error('Error fetching sales: ', error);
            setError('Failed to load sales. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [email]);

    useEffect(() => {
        fetchSales();
    }, [fetchSales]);

    const handleRefresh = () => {
        setLoading(true);
        fetchSales();
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
                <Icon name="refresh-circle" size={24} color="#0000ff" />
            </TouchableOpacity>
            {chartData.datasets && (
                <LineChart
                    data={chartData}
                    width={Dimensions.get('window').width - 40}
                    height={220}
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: {
                            borderRadius: 16
                        }
                    }}
                    bezier
                    style={styles.chart}
                />
            )}
            <FlatList
                data={sales}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const profitOrLoss = (item.satisfiyati - item.alisfiyati) * item.adet;
                    const profitOrLossPercentage = ((profitOrLoss / (item.alisfiyati * item.adet)) * 100).toFixed(2);
                    const profitOrLossColor = profitOrLoss >= 0 ? 'green' : 'red';

                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.coinName}>{item.coin}</Text>
                                <Text style={styles.amount}>x {item.adet}</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.text}>Buy Price: ${item.alisfiyati.toFixed(2)}</Text>
                                <Text style={styles.text}>Selling Price: ${item.satisfiyati.toFixed(2)}</Text>
                                <Text style={styles.text}>Date: {new Date(item.tarih).toLocaleString()}</Text>
                                <Text style={[styles.text, { color: profitOrLossColor }]}>
                                    {profitOrLoss >= 0 ? 'Profit' : 'Loss'}: ${profitOrLoss.toFixed(2)} ({profitOrLossPercentage}%)
                                </Text>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    position: 'relative',
  },
  refreshButton: {
    position: 'absolute',
    top: 1,
    right: 5,
    backgroundColor: '#ffffff',
    borderRadius: 50,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  coinName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 10,
  },
  amount: {
    fontSize: 16,
    color: '#888',
  },
  cardContent: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Sales;
