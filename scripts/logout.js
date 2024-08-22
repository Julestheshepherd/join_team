// Import the functions you need from the SDKs you need
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Firebase Authentication initialisieren
const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    // Event-Delegation: Wir fangen den Klick auf das gesamte Dokument ab
    document.addEventListener('click', (event) => {
        // Prüfen, ob das geklickte Element der Logout-Button ist
        if (event.target && event.target.id === 'signout-btn') {
            event.preventDefault();

            signOut(auth).then(() => {
                // Erfolgreiches Ausloggen
                alert('Erfolgreich ausgeloggt!');
                // Weiterleitung zur Login-Seite oder einer anderen Seite
                window.location.href = 'login.html'; // Passe dies an die gewünschte Zielseite an
            }).catch((error) => {
                // Fehler beim Ausloggen
                console.error('Fehler beim Ausloggen:', error);
                alert('Fehler beim Ausloggen: ' + error.message);
            });
        }
    });
});