// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const tasksList = document.getElementById('tasks-list');
const taskCount = document.getElementById('task-count');
const emptyState = document.getElementById('empty-state');
const deleteAllBtn = document.getElementById('delete-all-btn');

// Task Management
let tasks = [];

// Initialize app
function init() {
    loadTasksFromStorage();
    renderTasks();
    updateTaskCount();
    // Initially hide delete all button if no tasks
    if (tasks.length === 0) {
        deleteAllBtn.style.display = 'none';
    }
}

// Load tasks from Local Storage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        try {
            tasks = JSON.parse(storedTasks);
            // Ensure backward compatibility - add completed property if missing
            tasks = tasks.map(task => ({
                ...task,
                completed: task.completed !== undefined ? task.completed : false
            }));
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
            tasks = [];
        }
    }
}

// Save tasks to Local Storage
function saveTasksToStorage() {
    try {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
        console.error('Error saving tasks to storage:', error);
    }
}

// Add new task
function addTask(taskText) {
    if (taskText.trim() === '') {
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        text: taskText.trim(),
        createdAt: new Date().toISOString(),
        completed: false
    };

    tasks.push(newTask);
    saveTasksToStorage();
    renderTasks();
    updateTaskCount();
}

// Delete task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage();
    renderTasks();
    updateTaskCount();
}

// Toggle task completion
function toggleTaskCompletion(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveTasksToStorage();
        renderTasks();
    }
}

// Delete all tasks
function deleteAllTasks() {
    if (tasks.length === 0) {
        return;
    }
    
    // Add fade out animation to all tasks
    const taskItems = tasksList.querySelectorAll('.task-item');
    taskItems.forEach((item, index) => {
        setTimeout(() => {
            item.style.animation = 'slideOut 0.3s ease';
            item.style.opacity = '0';
        }, index * 50);
    });
    
    // Clear tasks after animation
    setTimeout(() => {
        tasks = [];
        saveTasksToStorage();
        renderTasks();
        updateTaskCount();
    }, taskItems.length * 50 + 300);
}

// Render all tasks
function renderTasks() {
    tasksList.innerHTML = '';

    if (tasks.length === 0) {
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');

    tasks.forEach(task => {
        const taskItem = createTaskElement(task);
        tasksList.appendChild(taskItem);
    });
}

// Create task element
function createTaskElement(task) {
    const li = document.createElement('li');
    li.className = 'task-item';
    if (task.completed) {
        li.classList.add('completed');
    }
    li.setAttribute('data-id', task.id);

    // Checkbox for completion
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'Mark task as complete');
    checkbox.addEventListener('change', () => {
        toggleTaskCompletion(task.id);
    });

    const taskText = document.createElement('span');
    taskText.className = 'task-text';
    taskText.textContent = task.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.setAttribute('aria-label', 'Delete task');
    deleteBtn.addEventListener('click', () => {
        // Add animation effect
        li.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            deleteTask(task.id);
        }, 200);
    });

    li.appendChild(checkbox);
    li.appendChild(taskText);
    li.appendChild(deleteBtn);

    return li;
}

// Update task count
function updateTaskCount() {
    const count = tasks.length;
    taskCount.textContent = `${count} ${count === 1 ? 'task' : 'tasks'}`;
    
    // Show/hide delete all button based on task count
    if (count === 0) {
        deleteAllBtn.style.display = 'none';
    } else {
        deleteAllBtn.style.display = 'inline-block';
    }
}

// Handle form submission
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskText = taskInput.value;
    addTask(taskText);
    taskInput.value = '';
    taskInput.focus();
});

// Handle delete all button click
deleteAllBtn.addEventListener('click', () => {
    if (tasks.length > 0) {
        if (confirm('Are you sure you want to delete all tasks?')) {
            deleteAllTasks();
        }
    }
});

// Add slideOut animation for delete
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
