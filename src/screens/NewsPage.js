import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';

const coins = [
  'BTCUSDT',
  'ETHUSDT',
  'FETUSDT',
  'INJUSDT',
  'AVAXUSDT',
  'BNBUSDT',
  'WLDUSDT',
];

const languages = [
  'en', // English
  'ru', // Russian
  'fr', // French
  'de', // German
  'ar', // Arabic
  'zh', // Chinese
  'tr', // Turkish
];

const languageLabels = {
  en: 'English',
  ru: 'Russian',
  fr: 'French',
  de: 'German',
  ar: 'Arabic',
  zh: 'Chinese',
  tr: 'Turkish',
};

const App = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCoin, setSelectedCoin] = useState(coins[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_NEWS_API_URL}&q=${selectedCoin}&language=${selectedLanguage}`);
        const sortedNews = response.data.articles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        setNews(sortedNews);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [selectedCoin, selectedLanguage]);

  const renderItem = ({ item }) => (
    <View style={styles.newsItem}>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
      <Text style={styles.date}>{new Date(item.publishedAt).toLocaleDateString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={selectedCoin}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedCoin(itemValue)}
      >
        {coins.map((coin) => (
          <Picker.Item key={coin} label={coin} value={coin} />
        ))}
      </Picker>

      <Picker
        selectedValue={selectedLanguage}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
      >
        {languages.map((lang) => (
          <Picker.Item key={lang} label={languageLabels[lang]} value={lang} />
        ))}
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={news}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  newsItem: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
});

export default App;
