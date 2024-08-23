document.addEventListener('DOMContentLoaded', () => {
    // Wähle alle Buttons mit den spezifischen Klassen aus
    const priorityButtons = document.querySelectorAll('.priority-left, .priority-middle, .priority-right');

    priorityButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Entfernt die Klasse 'active' von allen Buttons
            priorityButtons.forEach(btn => btn.classList.remove('active'));
            
            // Fügt die Klasse 'active' zum geklickten Button hinzu
            this.classList.add('active');
        });
    });
});






document.addEventListener('DOMContentLoaded', () => {
    const subtaskInput = document.getElementById('subtask');
    const addSubtaskIcon = document.getElementById('add-subtask-icon');
    const confirmSubtaskIcon = document.getElementById('confirm-subtask-icon');
    const cancelSubtaskIcon = document.getElementById('cancel-subtask-icon');
    const subtaskList = document.getElementById('subtask-list');

    let editingSubtask = null; // Variable zur Verfolgung des zu bearbeitenden Subtasks

    // Zeige die Bestätigungs- und Abbrechen-Icons beim Klicken in das Input-Feld oder auf das Plus-Icon
    subtaskInput.addEventListener('focus', () => {
        addSubtaskIcon.style.display = 'none';
        confirmSubtaskIcon.style.display = 'block';
        cancelSubtaskIcon.style.display = 'block';
    });

    // Füge Subtask zur Liste hinzu, wenn auf das Bestätigungs-Icon geklickt wird
    confirmSubtaskIcon.addEventListener('click', () => {
        const subtaskText = subtaskInput.value.trim();
        if (subtaskText !== '') {
            if (editingSubtask) {
                // Wenn wir einen Subtask bearbeiten, aktualisieren wir den Text und beenden die Bearbeitung
                editingSubtask.querySelector('.subtask-text').textContent = subtaskText;
                editingSubtask = null;
            } else {
                // Andernfalls fügen wir einen neuen Subtask hinzu
                const listItemHTML = `
                    <li class="subtask-list-item">
                        <span class="subtask-text">${subtaskText}</span>
                        <div class="subtask-icons">
                            <img src="assets/img/icons/edit_icon.png" alt="Edit" class="edit-icon">
                            <img src="assets/img/icons/delete_icon.png" alt="Delete" class="delete-icon">
                        </div>
                    </li>
                `;

                subtaskList.innerHTML += listItemHTML;
            }

            subtaskInput.value = ''; // Leere das Input-Feld
            addEventListenersToIcons(); // Füge Event Listener für die neuen Icons hinzu
        }
        resetIcons();
    });

    // Abbrechen der Eingabe, wenn auf das Abbrechen-Icon geklickt wird
    cancelSubtaskIcon.addEventListener('click', () => {
        subtaskInput.value = ''; // Leere das Input-Feld
        resetIcons();
        editingSubtask = null; // Beende ggf. den Bearbeitungsmodus
    });

    // Funktion, um Event Listener zu den Bearbeitungs- und Lösch-Icons hinzuzufügen
    function addEventListenersToIcons() {
        const editIcons = document.querySelectorAll('.edit-icon');
        const deleteIcons = document.querySelectorAll('.delete-icon');

        editIcons.forEach(editIcon => {
            editIcon.removeEventListener('click', editSubtask);
            editIcon.addEventListener('click', editSubtask);
        });

        deleteIcons.forEach(deleteIcon => {
            deleteIcon.removeEventListener('click', deleteSubtask);
            deleteIcon.addEventListener('click', deleteSubtask);
        });
    }

    // Bearbeiten-Funktion für Subtasks
    function editSubtask(event) {
        const listItem = event.target.closest('.subtask-list-item'); // Suche den Listeneintrag
        const subtaskText = listItem.querySelector('.subtask-text').textContent.trim();
        subtaskInput.value = subtaskText;
        editingSubtask = listItem; // Setze den zu bearbeitenden Listeneintrag
        subtaskInput.focus();

        addSubtaskIcon.style.display = 'none';
        confirmSubtaskIcon.style.display = 'block';
        cancelSubtaskIcon.style.display = 'block';
    }

    // Löschen-Funktion für Subtasks
    function deleteSubtask(event) {
        const listItem = event.target.closest('.subtask-list-item'); // Suche den Listeneintrag
        subtaskList.removeChild(listItem);
    }

    // Funktion, um das Icon-Layout zurückzusetzen
    function resetIcons() {
        confirmSubtaskIcon.style.display = 'none';
        cancelSubtaskIcon.style.display = 'none';
        addSubtaskIcon.style.display = 'block';
        subtaskInput.blur(); // Entferne den Fokus vom Input-Feld
    }

    // Initiale Event Listener-Zuweisung
    addEventListenersToIcons();
});