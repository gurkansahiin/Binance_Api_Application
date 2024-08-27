import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker'; // İçe aktarım
import { useNavigation } from '@react-navigation/native'; // Navigasyon

const API_KEY = process.env.OPENAI_API_KEY; // Veya uygun ortam değişkeni
const BINANCE_API_URL = process.env.REACT_APP_BINANCE_API_URL; // Veya uygun ortam değişkeni

const coins = [
  'BTCUSDT',
  'ETHUSDT',
  'FETUSDT',
  'INJUSDT',
  'AVAXUSDT',
  'BNBUSDT',
  'WLDUSDT',
];

const AIPage = () => {
  const [output, setOutput] = useState('');
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // useNavigation hook'u

  const handleInput = async () => {
    setLoading(true);
    try {
      // Seçilen coin için fiyat bilgisi alınıyor
      const response = await axios.get(`${BINANCE_API_URL}?symbol=${selectedCoin}`);
      const lastPrice = response.data.lastPrice;

      // Geçmiş fiyat bilgilerini almak için bir API çağrısı yapabilirsiniz
      // Örnek: const historyResponse = await axios.get(`YOUR_HISTORY_API_URL?symbol=${selectedCoin}`);
      // Örnek geçmiş fiyat bilgisi (bu gerçek verileri yansıtmayabilir)
      const pastPrices = [/* Geçmiş fiyat verilerini buraya ekleyin */];
      const pastPricesText = pastPrices.length > 0 ? `Geçmiş fiyatlar: ${pastPrices.join(', ')}` : 'Geçmiş fiyat bilgisi mevcut değil.';

      // Yapay zekadan finansal tahmin alınıyor
      const aiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: `Profesyonel bir finans koçu olarak ${selectedCoin} için kısa vadeli bir tahminde bulunun. Güncel fiyat ${lastPrice}. ${pastPricesText} Destek ve direnç seviyeleri ile birlikte tahmini fiyat aralığını belirtin.` }
        ],
        temperature: 0.7,
        max_tokens: 300, // Daha fazla yanıt alabilmek için
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
      });

      // Yanıtı ekrana yazdır
      setOutput(aiResponse.data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error.response ? error.response.data : error.message);
      setOutput('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Finans Koçu</Text>
      <Picker
        selectedValue={selectedCoin}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCoin(itemValue)}
      >
        {coins.map((coin) => (
          <Picker.Item key={coin} label={coin} value={coin} />
        ))}
      </Picker>
      <TouchableOpacity style={styles.sendButton} onPress={handleInput}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.sendButtonText}>Finansal Tahmin Al</Text>}
      </TouchableOpacity>
      
      <View style={styles.outputContainer}>
        <Text style={styles.output}>{output}</Text>
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
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '80%',
  },
  sendButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  outputContainer: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginTop: 10,
    width: '80%',
  },
  output: {
    fontSize: 16,
  },
});

export default AIPage;
