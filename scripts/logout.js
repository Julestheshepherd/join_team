// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDZgheu3b61xo6km1f3RDr_Fx04BwHxIS0",
    authDomain: "join-7694d.firebaseapp.com",
    databaseURL: "https://join-7694d-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "join-7694d",
    storageBucket: "join-7694d.appspot.com",
    messagingSenderId: "209652435521",
    appId: "1:209652435521:web:b5d73edc8d0972a76d94c0"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const signoutBtn = document.getElementById('signout-btn');
let id = "No user found"

signoutBtn.addEventListener('click', (e) =>{
    signOut(auth).then(() => {
        // Sign-out successful.
        window.location.href = '../login.html';
        save();
      }).catch((error) => {
        // An error happened.
        alert(error)
      });
});


function save(){
    let JsonAsText = JSON.stringify(id);
    localStorage.setItem('userID', JsonAsText);
}