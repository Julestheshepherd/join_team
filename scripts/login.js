// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, update, ref} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

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
const database = getDatabase(app);
let id;
const loginBtn = document.getElementById('login-form-button');

loginBtn.addEventListener('click', (e) =>{
    e.preventDefault();
    let email = document.getElementById('login-email').value;
    let password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;        
        // ...

        id = user.uid;
        save()
        let loginDate = new Date();
        update(ref(database, 'users/' + user.uid), {
            last_login: loginDate
          }) 
          .then(() => {
            // Data saved successfully!
            window.location.href = '../summary.html';

          })
          .catch((error) => {
            // The write failed...
            alert(error);
          });
    })
    .catch((error) => {
        const errorMessage = error.message;
        alert(errorMessage);
    });
    
});

function save(){
    let JsonAsText = JSON.stringify(id);
    localStorage.setItem('userID', JsonAsText);
}
