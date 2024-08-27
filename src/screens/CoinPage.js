import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { sellCoin } from '../components/sellCoin';
import { handleCoin } from '../components/handleCoin';

import { LineChart } from 'react-native-chart-kit';

async function getBalanceByEmail(email) {
  try {
    const q = query(collection(db, "BankUser"), where("kullanici", "==", email));
    const querySnapshot = await getDocs(q);

    let balance = null;
    querySnapshot.forEach((doc) => {
      if (doc.exists()) {
        balance = doc.data().kasa; // Assuming "kasa" is the balance field
        console.log(`Balance for ${email}: ${balance}`);
      }
    });

    if (balance !== null) {
      return balance;
    } else {
      console.log('User not found');
      return null;
    }
  } catch (error) {
    console.error("Error fetching balance: ", error);
  }
}

const CoinPage = ({ route, navigation }) => {
  const { email } = route.params; // Get the email passed from the login screen
  const [selectedCoin, setSelectedCoin] = useState('BTCUSDT');
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCoinData, setShowCoinData] = useState(false);
  const [balance, setBalance] = useState(0); // Initial balance set to 0
  const [tradeAmount, setTradeAmount] = useState('');
  const [inventory, setInventory] = useState({});
  
  const binance = process.env.REACT_APP_BINANCE_API_URL;

  useEffect(() => {
    const fetchBalance = async () => {
      const userBalance = await getBalanceByEmail(email);
      if (userBalance !== null) {
        setBalance(userBalance);
      }
    };

    fetchBalance();
  }, [email]);

  const coins = [
    'BTCUSDT',
    'ETHUSDT',
    'FETUSDT',
    'INJUSDT',
    'AVAXUSDT',
    'BNBUSDT',
    'WLDUSDT',
  ];

  const fetchCoinData = async () => {
    setLoading(true);
    setShowCoinData(false); // Hide the container while fetching data
    try {
      const response = await axios.get(`${binance}?symbol=${selectedCoin}`);
      setCoinData(response.data);
      setShowCoinData(true); // Show the container after data is fetched
    } catch (error) {
      console.error('Error fetching data!', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    if (coinData && tradeAmount !== '') {
      await handleCoin(selectedCoin, tradeAmount, coinData.lastPrice, email, balance, setBalance, setInventory);
    }
  };

  const handleSell = async () => {
    await sellCoin(db, email, selectedCoin, tradeAmount, coinData, balance, setBalance, inventory, setInventory);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.balanceText}>Balance: ${balance.toFixed(2)}</Text>

      <View style={styles.dropdownContainer}>
        <Picker
          selectedValue={selectedCoin}
          onValueChange={(itemValue) => setSelectedCoin(itemValue)}
          style={styles.dropdown}
        >
          {coins.map((coin) => (
            <Picker.Item key={coin} label={coin} value={coin} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={fetchCoinData}>
        <Text style={styles.buttonText}>Get Last Price</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        showCoinData && coinData && (
          <View style={styles.coinDataContainer}>
            <Text style={styles.coinDataTitle}>{coinData.symbol}</Text>
            <View style={styles.coinDataRow}>
              <Text style={styles.coinDataLabel}>Mark</Text>
              <Text style={styles.coinDataValue}>{coinData.lastPrice}</Text>
            </View>
            <View style={styles.coinDataRow}>
              <Text style={styles.coinDataLabel}>24h High</Text>
              <Text style={styles.coinDataValue}>{coinData.highPrice}</Text>
            </View>
            <View style={styles.coinDataRow}>
              <Text style={styles.coinDataLabel}>24h Low</Text>
              <Text style={styles.coinDataValue}>{coinData.lowPrice}</Text>
            </View>
          </View>
        )
      )}

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={tradeAmount}
        onChangeText={setTradeAmount}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.tradeButton} onPress={handleBuy}>
          <Text style={styles.buttonText}>Buy</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tradeButton, { backgroundColor: '#dc3545' }]} onPress={handleSell}>
          <Text style={styles.buttonText}>Sell</Text>
        </TouchableOpacity>
      </View>

      
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 300,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dropdownContainer: {
    width: '80%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  dropdown: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: '#f0c040',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  coinDataContainer: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    backgroundColor: '#fff',
    width: '80%',
  },
  coinDataTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  coinDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  coinDataLabel: {
    fontSize: 14,
    color: '#555',
  },
  coinDataValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 20,
    width: '80%',
    paddingHorizontal: 10,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '80%',
  },
  tradeButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    width: '45%',
  },
});

export default CoinPage;
