import firebase from 'firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyC24bDVVH1-sKnmLMbvZ7QIlsLSpkCoPKI',
  authDomain: 'jungle-speed-4f194.firebaseapp.com',
  databaseURL: 'https://jungle-speed-4f194.firebaseio.com',
  projectId: 'jungle-speed-4f194',
  storageBucket: 'jungle-speed-4f194.appspot.com',
  messagingSenderId: '474571442570',
  appId: '1:474571442570:web:7d39d238acb5e05555e073',
  measurementId: 'G-RX1N5DNM4W',
};
const firebaseApp = firebase.initializeApp (firebaseConfig);

const db = firebaseApp.firestore ();

export {db};

export const auth = firebase.auth ();
const googleProvider = new firebase.auth.GoogleAuthProvider ();
export const signInWithGoogle = async () => {
  try {
    const res = await auth.signInWithPopup (googleProvider);
    console.log ('oklm', res.user);
    return res.user;
  } catch (error) {
    console.log (error.message);
  }
};
