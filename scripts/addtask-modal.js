import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase, ref, get, push } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

// Firebase Auth und Database initialisieren
const auth = getAuth();
const database = getDatabase();

// Initialisiert die Event Listener für das Modal, nachdem das DOM geladen wurde
document.addEventListener('DOMContentLoaded', () => {
    // Event Listener zum Öffnen des Modals
    const addTaskButton = document.getElementById('add-task-btn');
    const addTaskIcons = document.querySelectorAll('.add-task-icon');

    addTaskButton.addEventListener('click', openAddTaskModal);
    addTaskIcons.forEach(icon => {
        icon.addEventListener('click', openAddTaskModal);
    });

    // Event Listener zum Schließen des Modals
    document.querySelector('.add-task-cancel-btn').addEventListener('click', (event) => {
        event.preventDefault();
        closeAddTaskModal();
    });

    // Event Listener zum Erstellen eines neuen Tasks
    document.querySelector('.add-task-create-btn').addEventListener('click', (event) => {
        event.preventDefault();
        createTask();
    });

    // Überprüfen, ob ein Benutzer eingeloggt ist und die Kontakte laden
    onAuthStateChanged(auth, (user) => {
        if (user) {
            loadContacts();
            initializePriorityButtons();
            initializeCategoryDropdown();
        } else {
            console.log("User is not authenticated.");
        }
    });

    // Event Listener für die Subtask-Funktionalität
    initializeSubtaskFunctionality();
});

// Funktion zum Öffnen des Add Task Modals
function openAddTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'flex';
    clearTaskForm();
}

// Funktion zum Schließen des Add Task Modals
function closeAddTaskModal() {
    const modal = document.getElementById('taskModal');
    modal.style.display = 'none';
    clearTaskForm();
}

// Funktion zum Leeren der Formularfelder
function clearTaskForm() {
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('dueDate').value = '';
    document.getElementById('dropdownBtn').textContent = 'Select contacts to assign';
    document.getElementById('categoryDropdownBtn').textContent = 'Select task category';
    document.getElementById('subtask-list').innerHTML = '';
    document.getElementById('selectedContacts').innerHTML = '';
    const priorityButtons = document.querySelectorAll('.priority-left, .priority-middle, .priority-right');
    priorityButtons.forEach(button => button.classList.remove('active'));
}

// Funktion zum Laden der Kontakte aus der Firebase Realtime Database
function loadContacts() {
    const contactsRef = ref(database, 'contacts');

    get(contactsRef).then((snapshot) => {
        if (snapshot.exists()) {
            const contacts = snapshot.val();
            const dropdownContent = document.getElementById('dropdownContent');
            const selectedContacts = document.getElementById('selectedContacts');

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

            dropdownContent.innerHTML = htmlContent;

            // Event-Listener für das Auswählen und Markieren von Namen
            const dropdownItems = dropdownContent.getElementsByClassName('dropdown-item');
            for (let item of dropdownItems) {
                item.addEventListener('click', function() {
                    this.classList.toggle('selected');
                    const contactId = this.getAttribute('data-contact-id');
                    const contactName = this.getAttribute('data-contact-name');
                    const contactInitials = this.getAttribute('data-contact-initials');

                    if (this.classList.contains('selected')) {
                        const contactIcon = document.createElement('div');
                        contactIcon.classList.add('selected-contact-icon');
                        contactIcon.setAttribute('data-contact-id', contactId);
                        contactIcon.setAttribute('data-contact-name', contactName);
                        contactIcon.textContent = contactInitials;
                        selectedContacts.appendChild(contactIcon);
                    } else {
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

    const dropdownBtn = document.getElementById('dropdownBtn');
    dropdownBtn.addEventListener('click', () => {
        document.getElementById('dropdownContent').classList.toggle('show');
    });

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
}

// Funktion zur Initialisierung der Prioritäts-Buttons
function initializePriorityButtons() {
    const priorityButtons = document.querySelectorAll('.priority-left, .priority-middle, .priority-right');
    let selectedPriority = null;

    priorityButtons.forEach(button => {
        button.addEventListener('click', function() {
            priorityButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedPriority = this.textContent.trim();
        });
    });
}

// Funktion zur Initialisierung des Kategorie-Dropdowns
function initializeCategoryDropdown() {
    const categoryDropdownBtn = document.getElementById('categoryDropdownBtn');
    const categoryDropdownContent = document.getElementById('categoryDropdownContent');
    const categoryDropdownItems = categoryDropdownContent.querySelectorAll('.dropdown-item');

    categoryDropdownBtn.addEventListener('click', () => {
        categoryDropdownContent.classList.toggle('show');
    });

    categoryDropdownItems.forEach(item => {
        item.addEventListener('click', function() {
            categoryDropdownItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            categoryDropdownBtn.textContent = this.textContent;
            categoryDropdownBtn.dataset.value = this.dataset.value;
            categoryDropdownContent.classList.remove('show');
        });
    });

    window.addEventListener('click', function(event) {
        if (!event.target.matches('#categoryDropdownBtn')) {
            if (categoryDropdownContent.classList.contains('show')) {
                categoryDropdownContent.classList.remove('show');
            }
        }
    });
}

// Funktion zur Initialisierung der Subtask-Funktionalität
function initializeSubtaskFunctionality() {
    const subtaskInput = document.getElementById('subtask');
    const addSubtaskIcon = document.getElementById('add-subtask-icon');
    const confirmSubtaskIcon = document.getElementById('confirm-subtask-icon');
    const cancelSubtaskIcon = document.getElementById('cancel-subtask-icon');
    const subtaskList = document.getElementById('subtask-list');

    addSubtaskIcon.addEventListener('click', () => {
        subtaskInput.style.display = 'block';
        confirmSubtaskIcon.style.display = 'block';
        cancelSubtaskIcon.style.display = 'block';
        addSubtaskIcon.style.display = 'none';
        subtaskInput.focus();
    });

    confirmSubtaskIcon.addEventListener('click', () => {
        const subtaskText = subtaskInput.value.trim();
        if (subtaskText !== '') {
            const subtaskItem = document.createElement('li');
            subtaskItem.textContent = subtaskText;
            subtaskList.appendChild(subtaskItem);
            subtaskInput.value = '';
            addSubtaskIcon.style.display = 'block';
            confirmSubtaskIcon.style.display = 'none';
            cancelSubtaskIcon.style.display = 'none';
        }
    });

    cancelSubtaskIcon.addEventListener('click', () => {
        subtaskInput.value = '';
        subtaskInput.style.display = 'none';
        confirmSubtaskIcon.style.display = 'none';
        cancelSubtaskIcon.style.display = 'none';
        addSubtaskIcon.style.display = 'block';
    });
}

// Funktion zum Erstellen eines neuen Tasks und Speichern in Firebase
function createTask() {
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

const priorityButtons = document.querySelectorAll('.priority-left, .priority-middle, .priority-right');
let selectedPriority = null;

priorityButtons.forEach(button => {
    if (button.classList.contains('active')) {
        selectedPriority = button.textContent.trim();
    }
});

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
        // Modal schließen und Formular zurücksetzen
        closeAddTaskModal();
    })
    .catch((error) => {
        console.error('Error saving task:', error);
        alert('Failed to save task.');
    });
}