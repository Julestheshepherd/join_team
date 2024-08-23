import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// Firebase Auth und Database initialisieren
const auth = getAuth();
const database = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
    // Überprüfen, ob ein Benutzer eingeloggt ist
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const userId = user.uid;

            // Daten des Benutzers aus der Realtime Database abrufen
            const userRef = ref(database, 'users/' + userId);
            get(userRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    const name = userData.name;

                    // Initialien berechnen
                    const initials = name.match(/\b\w/g).join('').substring(0, 2).toUpperCase();

                    // Initialien im Header anzeigen
                    const headerIcon = document.getElementById('user-icon-button');
                    if (headerIcon) {
                        headerIcon.innerHTML = `<span>${initials}</span>`;
                    }

                    // Aktuelle Uhrzeit abfragen
                    const now = new Date();
                    const hour = now.getHours();
                    let greetingText;

                    // Begrüßung basierend auf der Uhrzeit festlegen
                    if (hour >= 6 && hour < 12) {
                        greetingText = "Good Morning";
                    } else if (hour >= 12 && hour < 18) {
                        greetingText = "Good Day";
                    } else {
                        greetingText = "Good Evening";
                    }

                    // Begrüßung und Name im HTML anzeigen
                    const greetingElement = document.getElementById('greeting');
                    const greetingNameElement = document.getElementById('greeting-name');
                    if (greetingElement) {
                        greetingElement.textContent = greetingText;
                    }
                    if (greetingNameElement) {
                        greetingNameElement.textContent = name;
                    }
                } else {
                    console.log("Keine Benutzerdaten verfügbar.");
                }
            }).catch((error) => {
                console.error("Fehler beim Abrufen der Benutzerdaten:", error);
            });
        } else {
            console.log("Kein Benutzer eingeloggt.");
        }
    });
});