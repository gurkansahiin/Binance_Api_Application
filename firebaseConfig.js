import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";


const firebaseConfig = {
    apiKey: "AIzaSyC4KTvIcd-zjDKnGPkf_DVgDVP8wcG9nqA",
    authDomain: "binance-30d4f.firebaseapp.com",
    projectId: "binance-30d4f",
    storageBucket: "binance-30d4f.appspot.com",
    messagingSenderId: "640235255546",
    appId: "1:640235255546:web:74433c222df4faa235bb43",
    measurementId: "G-Y9DTM43N61"
  };

const app = initializeApp(firebaseConfig);

export  const db = getFirestore(app);

export default app;

