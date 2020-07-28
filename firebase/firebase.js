import * as firebase from "firebase";
import "firebase/firestore";
import "firebase/database";

//Initializing firebase firestore
firebase.initializeApp({
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: "",
});

export default firebase;
