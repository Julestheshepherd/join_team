document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable');
    const columns = document.querySelectorAll('.column');

    let draggingElement = null;
    let placeholder = document.createElement('div');
    placeholder.classList.add('placeholder');

    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', (e) => {
            draggingElement = e.target;
            draggingElement.classList.add('dragging');
            setTimeout(() => {
                draggingElement.style.display = 'none';
            }, 0);
        });

        draggable.addEventListener('dragend', (e) => {
            draggingElement.classList.remove('dragging');
            draggingElement.style.display = 'block';
            draggingElement = null;

            const placeholders = document.querySelectorAll('.placeholder');
            placeholders.forEach(placeholder => placeholder.remove());

            // Überprüfe nach dem Ziehen, ob eine Spalte leer ist
            updateNoTaskPlaceholders();
        });
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
            const afterElement = getDragAfterElement(column, e.clientY);

            if (afterElement == null) {
                column.appendChild(draggingElement);
            } else {
                column.insertBefore(draggingElement, afterElement);
            }

            placeholder.remove(); // Entferne den Platzhalter nach dem Loslassen
        });
    });

    // Überprüfe, ob eine Spalte leer ist und zeige den "No Task"-Platzhalter an, falls ja
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

    // Initiale Überprüfung bei Laden der Seite
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
});