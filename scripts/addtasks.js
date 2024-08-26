import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// Firebase Auth und Database initialisieren
const auth = getAuth();
const database = getDatabase();

document.addEventListener('DOMContentLoaded', () => {
    // Überprüfen, ob ein Benutzer eingeloggt ist
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // Referenz zu den Kontakten in der Realtime Database
            const contactsRef = ref(database, 'contacts');

            // Abrufen der Kontakte aus der Datenbank
            get(contactsRef).then((snapshot) => {
                if (snapshot.exists()) {
                    const contacts = snapshot.val();
                    const dropdownContent = document.getElementById('dropdownContent');
                    const selectedContacts = document.getElementById('selectedContacts');

                    // Erstellen des HTML-Inhalts mit innerHTML
                    let htmlContent = '';
                    Object.keys(contacts).forEach(contactId => {
                        const contact = contacts[contactId];
                        const initials = contact.name.match(/\b\w/g).join('').substring(0, 2).toUpperCase();

                        htmlContent += `
                            <div class="dropdown-item" data-contact-id="${contactId}" data-contact-name="${contact.name}" data-contact-initials="${initials}">
                                <div class="contact-icon">${initials}</div>
                                <span class="contact-name">${contact.name}</span>
                            </div>
                        `;
                    });

                    // HTML-Inhalt in das Dropdown-Menü einfügen
                    dropdownContent.innerHTML = htmlContent;

                    // Event-Listener für das Auswählen und Markieren von Namen
                    const dropdownItems = dropdownContent.getElementsByClassName('dropdown-item');
                    for (let item of dropdownItems) {
                        item.addEventListener('click', function() {
                            this.classList.toggle('selected');
                            const contactId = this.getAttribute('data-contact-id');
                            const contactName = this.getAttribute('data-contact-name');  // Name auch erfassen
                            const contactInitials = this.getAttribute('data-contact-initials');

                            if (this.classList.contains('selected')) {
                                // Icon für den ausgewählten Kontakt hinzufügen
                                const contactIcon = document.createElement('div');
                                contactIcon.classList.add('selected-contact-icon');
                                contactIcon.setAttribute('data-contact-id', contactId);
                                contactIcon.setAttribute('data-contact-name', contactName); // Setze den Namen im Icon
                                contactIcon.textContent = contactInitials;

                                // Icon zum Container hinzufügen
                                selectedContacts.appendChild(contactIcon);
                            } else {
                                // Icon für den abgewählten Kontakt entfernen
                                const contactIcon = selectedContacts.querySelector(`[data-contact-id="${contactId}"]`);
                                if (contactIcon) {
                                    selectedContacts.removeChild(contactIcon);
                                }
                            }
                        });
                    }
                } else {
                    console.log("No contacts available.");
                }
            }).catch((error) => {
                console.error("Error fetching contacts:", error);
            });

            // Event-Listener für das Dropdown-Menü für Kontakte
            const dropdownBtn = document.getElementById('dropdownBtn');
            dropdownBtn.addEventListener('click', () => {
                document.getElementById('dropdownContent').classList.toggle('show');
            });

            // Event-Listener zum Schließen des Dropdowns für Kontakte, wenn außerhalb geklickt wird
            window.addEventListener('click', function(event) {
                if (!event.target.matches('#dropdownBtn')) {
                    const dropdowns = document.getElementsByClassName('dropdown-content');
                    for (let i = 0; i < dropdowns.length; i++) {
                        const openDropdown = dropdowns[i];
                        if (openDropdown.classList.contains('show') && openDropdown.id === 'dropdownContent') {
                            openDropdown.classList.remove('show');
                        }
                    }
                }
            });

            // Event-Listener für die Prioritäts-Buttons
            const priorityButtons = document.querySelectorAll('.priority-left, .priority-middle, .priority-right');
            let selectedPriority = null;

            priorityButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Entfernt die Klasse 'active' von allen Buttons
                    priorityButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // Fügt die Klasse 'active' zum geklickten Button hinzu
                    this.classList.add('active');
                    selectedPriority = this.textContent.trim(); // Setze die ausgewählte Priorität
                });
            });

            // Event-Listener für das benutzerdefinierte Kategorie-Dropdown
            const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
            const categoryDropdownContent = document.getElementById('categoryDropdownContent');
            const categoryDropdownItems = categoryDropdownContent.querySelectorAll('.dropdown-item');

            // Öffnen/Schließen des Kategorie-Dropdowns
            categoryDropdownBtn.addEventListener('click', () => {
                categoryDropdownContent.classList.toggle('show');
            });

            // Auswahl eines Kategorie-Elements
            categoryDropdownItems.forEach(item => {
                item.addEventListener('click', function() {
                    // Entfernt die 'selected'-Klasse von allen Items
                    categoryDropdownItems.forEach(i => i.classList.remove('selected'));
                    
                    // Markiert das geklickte Item als 'selected'
                    this.classList.add('selected');
                    
                    // Setzt den Text des Buttons auf die gewählte Kategorie
                    categoryDropdownBtn.textContent = this.textContent;
                    categoryDropdownBtn.dataset.value = this.dataset.value;

                    // Schließt das Dropdown
                    categoryDropdownContent.classList.remove('show');
                });
            });

            // Schließen des Kategorie-Dropdowns bei einem Klick außerhalb
            window.addEventListener('click', function(event) {
                if (!event.target.matches('#categoryDropdownBtn')) {
                    if (categoryDropdownContent.classList.contains('show')) {
                        categoryDropdownContent.classList.remove('show');
                    }
                }
            });

            // Event-Listener für das Speichern des Tasks, wenn der Benutzer auf "Create Task" klickt
            const createTaskBtn = document.querySelector('.add-task-create-btn');

            createTaskBtn.addEventListener('click', (event) => {
                event.preventDefault();

                const title = document.getElementById('title').value.trim();
                const description = document.getElementById('description').value.trim();
                const assignedTo = Array.from(document.querySelectorAll('#selectedContacts .selected-contact-icon'))
                                        .map(contactIcon => ({
                                            id: contactIcon.getAttribute('data-contact-id'),
                                            name: contactIcon.getAttribute('data-contact-name')
                                        }));
                const dueDate = document.getElementById('dueDate').value;
                const category = document.getElementById('categoryDropdownBtn').textContent.trim();
                const subtasks = Array.from(document.querySelectorAll('#subtask-list li')).map(li => li.textContent.trim());

                if (!title || !dueDate || !selectedPriority || category === "Select task category") {
                    alert("Please fill out all required fields.");
                    return;
                }

                // Task-Objekt erstellen und Status "To Do" setzen
                const newTask = {
                    title,
                    description,
                    assignedTo, // Hier wird eine Liste von Objekten mit ID und Name gespeichert
                    dueDate,
                    priority: selectedPriority,
                    category,
                    subtasks,
                    status: "To Do", // Standardstatus hinzufügen
                    createdAt: new Date().toISOString(),
                    userId: auth.currentUser ? auth.currentUser.uid : null
                };

                // Task in der Firebase Realtime Database speichern
                push(ref(database, 'tasks'), newTask)
                    .then(() => {
                        alert('Task saved successfully!');
                        // Formular zurücksetzen
                        document.getElementById('title').value = '';
                        document.getElementById('description').value = '';
                        document.getElementById('dueDate').value = '';
                        categoryDropdownBtn.textContent = 'Select task category';
                        categoryDropdownItems.forEach(i => i.classList.remove('selected'));
                        priorityButtons.forEach(btn => btn.classList.remove('active'));
                        selectedPriority = null;
                        document.getElementById('subtask-list').innerHTML = '';
                        document.getElementById('selectedContacts').innerHTML = ''; // Ausgewählte Kontakte zurücksetzen
                    })
                    .catch((error) => {
                        console.error('Error saving task:', error);
                        alert('Failed to save task.');
                    });
            });

        } else {
            console.log("User is not authenticated.");
        }
    });
});


// Event Listener für den Cancel-Button
document.querySelector('.add-task-cancel-btn').addEventListener('click', (event) => {
    event.preventDefault(); 
    clearTaskForm();  
});

// Funktion zum Leeren der Formularfelder
function clearTaskForm() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('dueDate').value = '';
    document.getElementById('dropdownBtn').textContent = 'Select contacts to assign';
    document.getElementById('categoryDropdownBtn').textContent = 'Select task category';
    document.getElementById('subtask-list').innerHTML = '';
    document.getElementById('selectedContacts').innerHTML = '';
}