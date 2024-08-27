import { doc, getDocs, updateDoc, addDoc, query, collection, where } from 'firebase/firestore';

export const sellCoin = async (db, email, selectedCoin, tradeAmount, coinData, balance, setBalance, inventory, setInventory) => {
    if (!coinData || tradeAmount === '') return;

    try {
        // Kullanıcıyı bulmak için BankUser tablosunu sorgula
        const userQuery = query(collection(db, 'BankUser'), where('kullanici', '==', email));
        const userQuerySnapshot = await getDocs(userQuery);

        if (userQuerySnapshot.empty) {
            console.error('Kullanıcı bulunamadı');
            return;
        }

        // MyCoins tablosunda coin'in var olup olmadığını kontrol et, sadece durum true olanları kontrol et
        const coinQuery = query(
            collection(db, 'MyCoins'),
            where('kullanici', '==', email),
            where('coin', '==', selectedCoin),
            where('durum', '==', true) // Only consider coins with durum set to true
        );
        const coinQuerySnapshot = await getDocs(coinQuery);

        if (coinQuerySnapshot.empty) {
            console.error('MyCoins tablosunda bu coin bulunamadı');
            alert('Bu coin envanterinizde yok veya satılamaz durumda.');
            return;
        }

        const coinDocId = coinQuerySnapshot.docs[0].id;
        const coinDataInDb = coinQuerySnapshot.docs[0].data();
        const currentAmount = coinDataInDb.adet;
        const purchasePrice = coinDataInDb.alisFiyati; // Alış fiyatını al

        console.log(`Purchase Price from DB: ${purchasePrice}`);

        // Convert purchasePrice to number if it's not already
        if (isNaN(parseFloat(purchasePrice))) {
            console.error('Purchase price is not a valid number');
            alert('Geçerli bir alış fiyatı bulunamadı.');
            return;
        }

        // Girilen miktarın yeterli olup olmadığını kontrol et
        if (parseFloat(tradeAmount) > currentAmount) {
            alert('Yeterli miktarda coin yok');
            return;
        }

        // Satış işlemlerine devam et
        const totalProceeds = parseFloat(tradeAmount) * parseFloat(coinData.lastPrice);
        const newBalance = balance + totalProceeds;
        setBalance(newBalance);

        // Kullanıcının bakiyesini güncelle
        const userDocId = userQuerySnapshot.docs[0].id;
        const userDoc = doc(db, 'BankUser', userDocId);
        await updateDoc(userDoc, {
            kasa: newBalance,
        });
        console.log(`Satış sonrası bakiye güncellendi: ${newBalance}`);

        // MyCoins tablosundaki coin miktarını güncelle
        const newAmount = currentAmount - parseFloat(tradeAmount);
        await updateDoc(doc(db, 'MyCoins', coinDocId), {
            adet: newAmount,
            durum: newAmount > 0 // Eğer miktar 0'a inerse durum false olarak ayarlanacak
        });

        // SalesCoin tablosuna satış bilgilerini ekle
        await addDoc(collection(db, 'SalesCoin'), {
            kullanici: email,
            coin: selectedCoin,
            adet: parseFloat(tradeAmount),
            alisfiyati: parseFloat(purchasePrice), // Alış fiyatı
            satisfiyati: parseFloat(coinData.lastPrice),
            tarih: new Date().toISOString(),
        });
        console.log('SalesCoin tablosuna satış bilgisi eklendi');

        // Envanteri güncelle
        setInventory((prevInventory) => {
            const updatedAmount = currentAmount - parseFloat(tradeAmount);
            if (updatedAmount > 0) {
                return { ...prevInventory, [selectedCoin]: updatedAmount };
            } else {
                const { [selectedCoin]: _, ...restInventory } = prevInventory;
                return restInventory;
            }
        });

        alert(`${tradeAmount} ${selectedCoin} satıldı, toplam kazanç: $${totalProceeds.toFixed(2)}`);
    } catch (error) {
        console.error('İşlem sırasında bir hata oluştu: ', error);
    }
};
