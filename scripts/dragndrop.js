document.addEventListener('DOMContentLoaded', () => {
    const columns = document.querySelectorAll('.column');
    let draggingElement = null;
    let placeholder = document.createElement('div');
    placeholder.classList.add('placeholder');

    document.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('draggable')) {
            draggingElement = e.target;
            draggingElement.classList.add('dragging');
            setTimeout(() => {
                draggingElement.style.display = 'none';
            }, 0);
        }
    });

    document.addEventListener('dragend', (e) => {
        if (draggingElement) {
            draggingElement.classList.remove('dragging');
            draggingElement.style.display = 'block';
            draggingElement = null;

            const placeholders = document.querySelectorAll('.placeholder');
            placeholders.forEach(placeholder => placeholder.remove());

            // Überprüfe nach dem Ziehen, ob eine Spalte leer ist
            updateNoTaskPlaceholders();
        }
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(column, e.clientY);
            if (afterElement == null) {
                column.appendChild(placeholder);
            } else {
                column.insertBefore(placeholder, afterElement);
            }
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            if (draggingElement) {
                const afterElement = getDragAfterElement(column, e.clientY);
                if (afterElement == null) {
                    column.appendChild(draggingElement);
                } else {
                    column.insertBefore(draggingElement, afterElement);
                }

                placeholder.remove(); // Entferne den Platzhalter nach dem Loslassen

                // Aktualisiere den Task-Status in der Firebase-Datenbank
                const taskId = draggingElement.getAttribute('data-task-id');
                const newStatus = getStatusFromColumn(column);

                if (taskId && newStatus) {
                    const database = firebase.database();  // Verwendung der globalen Firebase-Instanz
                    const taskRef = database.ref(`tasks/${taskId}`);
                    taskRef.update({ status: newStatus })
                        .then(() => {
                            console.log(`Task ${taskId} status updated to ${newStatus}`);
                        })
                        .catch((error) => {
                            console.error(`Error updating task ${taskId} status:`, error);
                        });
                }
            }
        });
    });

    function updateNoTaskPlaceholders() {
        columns.forEach(column => {
            const hasTasks = column.querySelector('.draggable');
            const noTaskPlaceholder = column.querySelector('.no-task');

            if (!hasTasks) {
                noTaskPlaceholder.style.display = 'block';
            } else {
                noTaskPlaceholder.style.display = 'none';
            }
        });
    }

    updateNoTaskPlaceholders();

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function getStatusFromColumn(column) {
        const columnTitle = column.querySelector('h2').textContent.trim();
        switch (columnTitle) {
            case 'To Do':
                return 'To Do';
            case 'In Progress':
                return 'In Progress';
            case 'Await feedback':
                return 'Await feedback';
            case 'Done':
                return 'Done';
            default:
                return null;
        }
    }
});