// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, ref, set, update } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

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

document.addEventListener('DOMContentLoaded', () => {
    // Login-Funktion
    const loginBtn = document.getElementById('login-form-button');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();

            signInWithEmailAndPassword(auth, email, password)
                .then((userCredential) => {
                    const user = userCredential.user;

                    // Update in der Realtime Database (optional)
                    const userRef = ref(database, 'users/' + user.uid);
                    update(userRef, {
                        last_login: new Date().toISOString(),
                    });

                    alert('Erfolgreich eingeloggt!');
                    window.location.href = 'summary.html'; // Weiterleitung nach dem Login
                })
                .catch((error) => {
                    alert('Fehler beim Einloggen: ' + error.message);
                });
        });
    }

// Signup-Funktion
const signupBtn = document.getElementById('signup-form-button');
if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const name = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        const confirmPassword = document.getElementById('signup-confirm').value.trim();

        if (password !== confirmPassword) {
            alert('Die Passwörter stimmen nicht überein.');
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
    
            // Benutzerinformationen in der Realtime Database speichern
            set(ref(database, 'users/' + user.uid), {
                uid: user.uid,  // Benutzer-ID hinzufügen
                name: name,
                email: email,
                signup_date: new Date().toISOString(),
            })
            .then(() => {
                alert('Benutzerdaten erfolgreich gespeichert!');
                window.location.href = 'summary.html'; // Weiterleitung nach der Registrierung
            })
            .catch((error) => {
                console.error('Fehler beim Speichern der Benutzerdaten:', error);
                alert('Fehler beim Speichern der Benutzerdaten: ' + error.message);
            });
        })
        .catch((error) => {
            console.error('Fehler bei der Registrierung:', error);
            alert('Fehler bei der Registrierung: ' + error.message);
        });
    });
}

    // Guest Login-Funktion
    const guestLoginBtn = document.getElementById('guest-login-button'); // Wähle den Guest-Login-Button
    if (guestLoginBtn) {
        guestLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const guestEmail = "guest@mail.de";  // Feste Gast-Email
            const guestPassword = "mypassword";   // Feste Gast-Passwort

            signInWithEmailAndPassword(auth, guestEmail, guestPassword)
                .then((userCredential) => {
                    window.location.href = 'summary.html'; // Weiterleitung nach dem Gast-Login
                })
                .catch((error) => {
                    console.error('Fehler beim Gast-Login:', error);
                    alert('Fehler beim Gast-Login: ' + error.message);
                });
        });
    } else {
        console.error('Guest-Login-Button nicht gefunden.');
    }
});
