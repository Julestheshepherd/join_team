import { getDatabase, ref, onValue, update } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

// Firebase Database initialisieren
const database = getDatabase();
const auth = getAuth();

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const tasksRef = ref(database, 'tasks');

            onValue(tasksRef, (snapshot) => {
                const tasks = snapshot.val();
                if (tasks) {
                    populateBoard(tasks);
                    initializeDragAndDrop(); // Drag-and-Drop nach dem Laden der Tasks initialisieren
                } else {
                    console.log("No tasks found.");
                }
            });
        } else {
            console.log("User is not authenticated.");
        }
    });
});

function populateBoard(tasks) {
    const toDoColumn = document.querySelector('.column:nth-child(1)');
    const inProgressColumn = document.querySelector('.column:nth-child(2)');
    const awaitFeedbackColumn = document.querySelector('.column:nth-child(3)');
    const doneColumn = document.querySelector('.column:nth-child(4)');

    [toDoColumn, inProgressColumn, awaitFeedbackColumn, doneColumn].forEach(column => {
        column.querySelectorAll('.draggable').forEach(taskElement => taskElement.remove());
        column.querySelector('.no-task').style.display = 'block';
    });

    Object.keys(tasks).forEach(taskId => {
        const task = tasks[taskId];

        const taskElement = document.createElement('div');
        taskElement.classList.add('draggable');
        taskElement.setAttribute('draggable', 'true');
        taskElement.setAttribute('data-task-id', taskId);

        taskElement.innerHTML = /* HTML */ `
            <div class="task-lable"><p>${task.category}</p></div>
            <p class="task-title">${task.title}</p>
            <p class="task-description">${task.description}</p>
            <div class="subtasks">
                <div class="subtasks-processbar">
                    <div class="filler" style="width: ${calculateSubtaskProgress(task.subtasks)}%;"></div>
                </div>
                <div>
                    <p class="subtask-number">${countCompletedSubtasks(task.subtasks)} / ${task.subtasks.length}</p>
                </div>
            </div>
            <div class="task-bottom-row">
                <div class="user-badges">
                    ${generateUserBadges(task.assignedTo)}
                </div>
                <img class="priority" src="./assets/img/icons/${getPriorityIcon(task.priority)}" alt="">
            </div>
        `;

        switch (task.status) {
            case 'To Do':
                toDoColumn.appendChild(taskElement);
                toDoColumn.querySelector('.no-task').style.display = 'none';
                break;
            case 'In Progress':
                inProgressColumn.appendChild(taskElement);
                inProgressColumn.querySelector('.no-task').style.display = 'none';
                break;
            case 'Await feedback':
                awaitFeedbackColumn.appendChild(taskElement);
                awaitFeedbackColumn.querySelector('.no-task').style.display = 'none';
                break;
            case 'Done':
                doneColumn.appendChild(taskElement);
                doneColumn.querySelector('.no-task').style.display = 'none';
                break;
            default:
                toDoColumn.appendChild(taskElement);
                toDoColumn.querySelector('.no-task').style.display = 'none';
                break;
        }
    });

    initializeDragAndDrop(); // Initialisiere Drag-and-Drop nach dem Laden der Tasks
}

function calculateSubtaskProgress(subtasks) {
    if (!subtasks || subtasks.length === 0) return 0;
    const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
    return (completedSubtasks / subtasks.length) * 100;
}

function countCompletedSubtasks(subtasks) {
    if (!subtasks) return 0;
    return subtasks.filter(subtask => subtask.completed).length;
}

function generateUserBadges(assignedTo) {
    if (!assignedTo || assignedTo.length === 0) return '';
    return assignedTo.map(user => `<div class="circle">${user.name.match(/\b\w/g).join('').toUpperCase()}</div>`).join('');
}

function getPriorityIcon(priority) {
    switch (priority.toLowerCase()) {
        case 'urgent':
            return 'urgent_icon.png';
        case 'medium':
            return 'medium_icon.png';
        case 'low':
            return 'low_icon.png';
        default:
            return 'default_icon.png';
    }
}

function initializeDragAndDrop() {
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

            // Stelle sicher, dass das Element nicht mehr in seinem ursprünglichen Container ist
            if (draggingElement.parentElement) {
                draggingElement.parentElement.removeChild(draggingElement);
            }

            // Füge das Element erneut in den aktuellen Container ein
            if (placeholder.parentElement) {
                placeholder.parentElement.appendChild(draggingElement);
            }

            draggingElement = null;

            const placeholders = document.querySelectorAll('.placeholder');
            placeholders.forEach(placeholder => placeholder.remove());

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

                placeholder.remove();

                const taskId = draggingElement.getAttribute('data-task-id');
                const newStatus = getStatusFromColumn(column);

                if (taskId && newStatus) {
                    const taskRef = ref(database, `tasks/${taskId}`);
                    update(taskRef, { status: newStatus })
                        .then(() => {

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
}