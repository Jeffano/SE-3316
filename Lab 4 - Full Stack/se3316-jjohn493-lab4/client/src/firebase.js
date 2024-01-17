// Import the functions you need from the SDKs you need
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAshxla_B3okV1RDAdmwODLs_D1J2KJQuw",
  authDomain: "lab4-accountauth.firebaseapp.com",
  projectId: "lab4-accountauth",
  storageBucket: "lab4-accountauth.appspot.com",
  messagingSenderId: "704588412179",
  appId: "1:704588412179:web:1794853d8aaaf4fedf96e6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);
export { auth };