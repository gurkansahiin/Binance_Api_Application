// src/components/handleCoin.js
import { collection, getDocs, query, where, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

export const handleCoin = async (coinSymbol, amount, price, email, balance, setBalance, setInventory) => {
  const totalCost = parseFloat(amount) * parseFloat(price);
  if (totalCost <= balance) {
    const newBalance = balance - totalCost;
    setBalance(newBalance);

    try {
      const q = query(collection(db, 'BankUser'), where('kullanici', '==', email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userDocId = querySnapshot.docs[0].id;
        const userDoc = doc(db, 'BankUser', userDocId);
        await updateDoc(userDoc, {
          kasa: newBalance,
        });
        console.log(`Updated balance after buying: ${newBalance}`);
        
        // Add the purchase to MyCoins collection
        await addDoc(collection(db, 'MyCoins'), {
          kullanici: email,
          coin: coinSymbol,
          adet: parseFloat(amount),
          alisFiyati: parseFloat(price),
          tarih: new Date().toISOString(),
          durum: true,
        });
        console.log("Document written to MyCoins collection");

      } else {
        console.error('User not found');
      }
    } catch (error) {
      console.error('Error updating balance or adding document: ', error);
    }

    setInventory((prevInventory) => {
      const currentAmount = prevInventory[coinSymbol] || 0;
      return { ...prevInventory, [coinSymbol]: currentAmount + parseFloat(amount) };
    });

    alert(`Bought ${amount} ${coinSymbol} for $${totalCost.toFixed(2)}`);
  } else {
    alert('Insufficient funds');
  }
};
