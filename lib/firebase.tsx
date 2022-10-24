import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBA149r5azCbWlDB9Rn_OBTYHj9FZSQqpw",
  authDomain: "hnefatafl-d4e7a.firebaseapp.com",
  projectId: "hnefatafl-d4e7a",
  storageBucket: "hnefatafl-d4e7a.appspot.com",
  messagingSenderId: "405258248204",
  appId: "1:405258248204:web:c7fd1975f5c149bb408e29"
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();

export default firebaseConfig;