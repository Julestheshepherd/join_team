document.addEventListener('DOMContentLoaded', () => {

    // Überprüfen, ob die Seite das Signup-Formular enthält
    const signupForm = document.getElementById('signup-form');
    if (!signupForm) {
        console.log("Signup-Formular nicht gefunden. Dieses Skript läuft möglicherweise auf der falschen Seite.");
        return;
    }

    const signupBtn = document.getElementById('signup-form-button');
    const checkbox = document.getElementById('login-checkbox');
    const passwordField = document.getElementById('signup-password');
    const confirmPasswordField = document.getElementById('signup-confirm');
    const signupErrorDiv = document.getElementById('signup-error');

    if (signupBtn && checkbox && passwordField && confirmPasswordField) {
        // Button standardmäßig deaktiviert
        signupBtn.disabled = true;

        // Checkbox Event Listener
        checkbox.addEventListener('change', updateButtonState);

        // Passwortfelder Event Listener
        passwordField.addEventListener('input', updateButtonState);
        confirmPasswordField.addEventListener('input', updateButtonState);

        // Funktion, um den Zustand des Buttons zu aktualisieren
        function updateButtonState() {
            const password = passwordField.value.trim();
            const confirmPassword = confirmPasswordField.value.trim();

            if (checkbox.checked && password && confirmPassword && password === confirmPassword) {
                signupBtn.disabled = false;
                signupErrorDiv.style.display = 'none';
            } else {
                signupBtn.disabled = true;

                if (password && confirmPassword && password !== confirmPassword) {
                    signupErrorDiv.style.display = 'block';
                    signupErrorDiv.textContent = 'Die Passwörter stimmen nicht überein.';
                } else {
                    signupErrorDiv.style.display = 'none';
                }
            }
        }

        // Event Listener für das Formular
        signupForm.addEventListener('submit', (e) => {
            const password = passwordField.value.trim();
            const confirmPassword = confirmPasswordField.value.trim();

            if (!checkbox.checked || !password || !confirmPassword || password !== confirmPassword) {
                e.preventDefault();  // Verhindert das Absenden des Formulars
            }
        });
    }
});