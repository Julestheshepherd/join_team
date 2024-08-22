// script.js

document.addEventListener('DOMContentLoaded', () => {
    const draggables = document.querySelectorAll('.draggable');
    const columns = document.querySelectorAll('.column');

    let draggingElement = null;

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
        });
    });

    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(column, e.clientY);
            const dragging = document.querySelector('.dragging');
            const placeholder = document.createElement('div');
            placeholder.classList.add('placeholder');

            if (afterElement == null) {
                column.appendChild(placeholder);
            } else {
                column.insertBefore(placeholder, afterElement);
            }
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const afterElement = getDragAfterElement(column, e.clientY);
            const dragging = document.querySelector('.dragging');
            const placeholder = document.querySelector('.placeholder');

            if (afterElement == null) {
                column.appendChild(draggingElement);
            } else {
                column.insertBefore(draggingElement, afterElement);
            }

            placeholder.remove();
        });
    });

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