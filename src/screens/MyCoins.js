import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator, Dimensions, TouchableOpacity } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { PieChart } from 'react-native-chart-kit';
import { MaterialIcons } from '@expo/vector-icons'; // Yenileme simgesi için ikon paketi

function CoinViewPage({ route }) {
    const [coins, setCoins] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { email } = route.params;

    const fetchCoins = useCallback(async () => {
        try {
            setLoading(true);
            const userQuery = query(collection(db, 'ReactNativeUsers'), where('email', '==', email));
            const userSnapshot = await getDocs(userQuery);

            if (userSnapshot.empty) {
                setError('User not found.');
                setLoading(false);
                return;
            }

            // MyCoins tablosunda durumun true olduğu coinleri kontrol et
            const coinsQuery = query(
                collection(db, 'MyCoins'),
                where('kullanici', '==', email),
                where('durum', '==', true) // Durumu true olanları filtrele
            );
            const coinsSnapshot = await getDocs(coinsQuery);
            const coinsList = coinsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCoins(coinsList);

            // Aggregate data for the chart
            const coinCounts = {};
            coinsList.forEach(item => {
                if (coinCounts[item.coin]) {
                    coinCounts[item.coin] += item.adet;
                } else {
                    coinCounts[item.coin] = item.adet;
                }
            });

            const chartDataFormatted = Object.keys(coinCounts).map((coin, index) => ({
                name: coin,
                adet: coinCounts[coin],
                color: `rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 1)`,
                legendFontColor: '#7F7F7F',
                legendFontSize: 15
            }));

            setChartData(chartDataFormatted);

        } catch (error) {
            console.error('Error fetching coins: ', error);
            setError('Failed to load coins. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, [email]);

    useEffect(() => {
        fetchCoins();
    }, [fetchCoins]);

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
            <TouchableOpacity style={styles.refreshButton} onPress={fetchCoins}>
                <MaterialIcons name="refresh" size={24} color="black" />
            </TouchableOpacity>

            {chartData.length > 0 && (
                <PieChart
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
                    accessor="adet"
                    backgroundColor="transparent"
                    paddingLeft="15"
                    absolute
                />
            )}
            <FlatList
                data={coins}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const coinColor = chartData.find(data => data.name === item.coin)?.color || '#000';
                    return (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={[styles.dot, { backgroundColor: coinColor }]} />
                                <Text style={styles.coinName}>{item.coin}</Text>
                                <Text style={styles.amount}>x {item.adet}</Text>
                            </View>
                            <View style={styles.cardContent}>
                                <Text style={styles.text}>Buy Price: ${item.alisFiyati ? item.alisFiyati.toFixed(2) : 'N/A'}</Text>
                                <Text style={styles.text}>Date: {item.tarih ? new Date(item.tarih).toLocaleString() : 'N/A'}</Text>
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
  },
  refreshButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
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
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default CoinViewPage;
