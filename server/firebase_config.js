import firebase from "firebase";

const config = {
  apiKey: "AIzaSyDicxD1yGAy46fJkyACRiIMGBAGo4tz1HM",
  authDomain: "yaynaynay-ext.firebaseapp.com",
  databaseURL: "wss://yaynaynay-ext.firebaseio.com",
  projectId: "yaynaynay-ext",
  storageBucket: "yaynaynay-ext.appspot.com",
  messagingSenderId: "932935894880"
};
firebase.initializeApp(config);

export default firebase;

export const database = firebase.database();
export const auth = firebase.auth();
