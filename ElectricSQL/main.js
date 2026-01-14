// Main Application Logic with ElectricSQL
import { initDatabase, getTodos, addTodo as dbAddTodo, toggleTodo as dbToggleTodo, 
         deleteTodo as dbDeleteTodo, updateTodo as dbUpdateTodo, getTodoById, getStats } from './db.js'

// App state
let currentEditId = null
let currentFilter = 'all'
let deferredPrompt // For PWA install prompt

// Check online/offline status
function updateConnectionStatus() {
    const indicator = document.getElementById('offlineIndicator')
    const status = document.getElementById('connectionStatus')
    
    if (navigator.onLine) {
        indicator.classList.add('online')
        status.textContent = 'Online'
        setTimeout(() => {
            indicator.style.display = 'none'
        }, 2000)
    } else {
        indicator.classList.remove('online')
        status.textContent = 'Offline'
        indicator.style.display = 'block'
    }
}

// Service Worker Registration
function registerServiceWorker() {
    // Don't register service worker in development mode
    if (window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') {
        console.log('Service Worker disabled in development mode')
        return
    }
    
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(function(registration) {
                console.log('Service Worker registered successfully:', registration.scope)
                
                // Check for updates
                registration.addEventListener('updatefound', function() {
                    const newWorker = registration.installing
                    newWorker.addEventListener('statechange', function() {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // New update available
                            if (confirm('New version available! Reload to update?')) {
                                window.location.reload()
                            }
                        }
                    })
                })
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error)
            })
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', function(event) {
            if (event.data && event.data.type === 'CACHE_SIZE_RESPONSE') {
                console.log('Cached files count:', event.data.size)
            }
        })
    }
}

// PWA Install Prompt
function handleInstallPrompt() {
    window.addEventListener('beforeinstallprompt', function(e) {
        e.preventDefault()
        deferredPrompt = e
        
        // Show custom install prompt after a delay
        setTimeout(() => {
            if (!localStorage.getItem('installDismissed')) {
                document.getElementById('installPrompt').classList.add('show')
            }
        }, 10000) // Show after 10 seconds
    })

    // Handle app installed event
    window.addEventListener('appinstalled', function(e) {
        console.log('PWA was installed')
        document.getElementById('installPrompt').classList.remove('show')
        deferredPrompt = null
    })
}

// Install the app
window.installApp = function() {
    if (deferredPrompt) {
        deferredPrompt.prompt()
        deferredPrompt.userChoice.then(function(choiceResult) {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt')
            } else {
                console.log('User dismissed the install prompt')
            }
            deferredPrompt = null
        })
    }
    document.getElementById('installPrompt').classList.remove('show')
}

// Dismiss install prompt
window.dismissInstall = function() {
    document.getElementById('installPrompt').classList.remove('show')
    localStorage.setItem('installDismissed', 'true')
}

// Server Banner Management
function showServerBanner() {
    const banner = document.getElementById('serverBanner')
    const container = document.querySelector('.container')
    banner.classList.add('show')
    container.classList.add('with-server-banner')
}

window.hideServerBanner = function() {
    const banner = document.getElementById('serverBanner')
    const container = document.querySelector('.container')
    banner.classList.remove('show')
    container.classList.remove('with-server-banner')
    localStorage.setItem('serverBannerDismissed', Date.now().toString())
}

async function checkServerAvailability() {
    try {
        // Try to fetch a small resource to test server connectivity
        const response = await fetch('./manifest.json', { 
            method: 'HEAD',
            cache: 'no-cache',
            signal: AbortSignal.timeout(3000) // 3 second timeout
        })
        
        if (!response.ok) {
            throw new Error('Server responded with error')
        }
        
        return true // Server is available
    } catch (error) {
        console.warn('Server check failed:', error.message)
        return false // Server is unavailable
    }
}

async function monitorServerStatus() {
    const lastDismissed = localStorage.getItem('serverBannerDismissed')
    const now = Date.now()
    
    // Only show banner if it hasn't been dismissed in the last 10 minutes
    const shouldShowBanner = !lastDismissed || (now - parseInt(lastDismissed)) > 600000
    
    if (!navigator.onLine) {
        if (shouldShowBanner) {
            document.getElementById('bannerMessage').textContent = '🌐 No Internet Connection - App Running Offline'
            showServerBanner()
        }
        return
    }

    const serverAvailable = await checkServerAvailability()
    
    if (!serverAvailable && shouldShowBanner) {
        document.getElementById('bannerMessage').textContent = '⚠️ Server Unavailable - App Running from Cache'
        showServerBanner()
    } else if (serverAvailable) {
        window.hideServerBanner()
        // Clear the dismissed flag if server is back online
        localStorage.removeItem('serverBannerDismissed')
    }
}

// Add new todo
async function addTodo() {
    const description = document.getElementById('todoText').value.trim()
    const deadline = document.getElementById('todoDeadline').value

    if (!description) {
        alert('Please enter a task description')
        return
    }

    try {
        await dbAddTodo(description, deadline)
        
        // Clear form
        document.getElementById('todoText').value = ''
        document.getElementById('todoDeadline').value = ''
        
        await loadTodos()
        await updateStats()
        
        console.log('Todo added successfully')
    } catch (error) {
        console.error('Error adding todo:', error)
        alert('Error adding task. Please try again.')
    }
}

// Load todos based on current filter
async function loadTodos() {
    try {
        const results = await getTodos(currentFilter)
        displayTodos(results)
    } catch (error) {
        console.error('Error loading todos:', error)
        document.getElementById('todoList').innerHTML = '<div class="no-todos">Error loading tasks</div>'
    }
}

// Display todos in the UI
function displayTodos(todos) {
    const todoList = document.getElementById('todoList')
    
    if (todos.length === 0) {
        todoList.innerHTML = `
            <div class="no-todos">
                <span style="font-size: 3em;">📋</span>
                <p>No tasks found</p>
                <p style="font-size: 0.9em; margin-top: 10px;">Add a new task to get started!</p>
            </div>
        `
        return
    }

    const todosHtml = todos.map(todo => {
        const deadline = todo.deadline ? new Date(todo.deadline) : null
        const isOverdue = deadline && deadline < new Date() && !todo.done
        const deadlineText = deadline ? formatDate(deadline) : 'No deadline'
        
        return `
            <div class="todo-item ${todo.done ? 'completed' : ''}" id="todo-${todo.id}">
                <div class="todo-content">
                    <div class="todo-info">
                        <div class="todo-text">${escapeHtml(todo.description)}</div>
                        <div class="todo-deadline ${isOverdue ? 'overdue' : ''}">
                            📅 ${deadlineText} ${isOverdue ? '(Overdue!)' : ''}
                        </div>
                        <div class="todo-meta">
                            Created: ${formatDate(new Date(todo.createdAt))}
                        </div>
                    </div>
                    <div class="todo-actions">
                        <button class="btn ${todo.done ? 'btn-warning' : 'btn-success'}" 
                                data-action="toggle" data-id="${todo.id}" data-status="${todo.done}">
                            ${todo.done ? 'Undo' : 'Complete'}
                        </button>
                        <button class="btn btn-warning" data-action="edit" data-id="${todo.id}">
                            Edit
                        </button>
                        <button class="btn btn-danger" data-action="delete" data-id="${todo.id}">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `
    }).join('')

    todoList.innerHTML = todosHtml
}

// Toggle todo completion status
async function toggleTodo(id, currentStatus) {
    try {
        await dbToggleTodo(id, currentStatus)
        await loadTodos()
        await updateStats()
    } catch (error) {
        console.error('Error toggling todo:', error)
        alert('Error updating task. Please try again.')
    }
}

// Delete todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return
    }

    try {
        await dbDeleteTodo(id)
        await loadTodos()
        await updateStats()
    } catch (error) {
        console.error('Error deleting todo:', error)
        alert('Error deleting task. Please try again.')
    }
}

// Edit todo
async function editTodo(id) {
    try {
        const todo = await getTodoById(id)
        
        if (!todo) {
            alert('Task not found')
            return
        }

        currentEditId = id
        
        // Fill form with current values
        document.getElementById('todoText').value = todo.description
        document.getElementById('todoDeadline').value = todo.deadline ? 
            new Date(todo.deadline).toISOString().slice(0, 16) : ''
        
        // Switch button modes
        document.getElementById('addBtn').style.display = 'none'
        document.getElementById('updateBtn').style.display = 'inline-block'
        document.getElementById('cancelBtn').style.display = 'inline-block'
        
        // Scroll to form
        document.querySelector('.todo-form').scrollIntoView({ behavior: 'smooth' })
    } catch (error) {
        console.error('Error loading todo for edit:', error)
        alert('Error loading task for editing. Please try again.')
    }
}

// Update todo
async function updateTodo() {
    const description = document.getElementById('todoText').value.trim()
    const deadline = document.getElementById('todoDeadline').value

    if (!description) {
        alert('Please enter a task description')
        return
    }

    try {
        await dbUpdateTodo(currentEditId, description, deadline)
        cancelEdit()
        await loadTodos()
        await updateStats()
    } catch (error) {
        console.error('Error updating todo:', error)
        alert('Error updating task. Please try again.')
    }
}

// Cancel edit mode
function cancelEdit() {
    currentEditId = null
    
    // Clear form
    document.getElementById('todoText').value = ''
    document.getElementById('todoDeadline').value = ''
    
    // Switch button modes
    document.getElementById('addBtn').style.display = 'inline-block'
    document.getElementById('updateBtn').style.display = 'none'
    document.getElementById('cancelBtn').style.display = 'none'
}

// Filter todos
function filterTodos(filter) {
    currentFilter = filter
    loadTodos()
}

// Update statistics
async function updateStats() {
    try {
        const stats = await getStats()
        
        document.getElementById('totalTasks').textContent = stats.total
        document.getElementById('pendingTasks').textContent = stats.pending
        document.getElementById('completedTasks').textContent = stats.completed
        document.getElementById('overdueTasks').textContent = stats.overdue
    } catch (error) {
        console.error('Error updating stats:', error)
    }
}

// Utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

function escapeHtml(text) {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
}

// Event delegation for todo actions
document.addEventListener('click', function(e) {
    const target = e.target
    
    if (target.dataset.action) {
        const id = parseInt(target.dataset.id)
        
        switch(target.dataset.action) {
            case 'toggle':
                const status = target.dataset.status === 'true' || target.dataset.status === '1'
                toggleTodo(id, status)
                break
            case 'edit':
                editTodo(id)
                break
            case 'delete':
                deleteTodo(id)
                break
        }
    }
})

// Handle Enter key in text input
document.addEventListener('DOMContentLoaded', function() {
    // Initialize database
    initDatabase().then(() => {
        loadTodos()
        updateStats()
    }).catch(error => {
        console.error('Failed to initialize database:', error)
        document.getElementById('todoList').innerHTML = '<div class="no-todos">Failed to initialize database</div>'
    })
    
    // Button event listeners
    document.getElementById('addBtn').addEventListener('click', addTodo)
    document.getElementById('updateBtn').addEventListener('click', updateTodo)
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit)
    
    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
            e.target.classList.add('active')
            filterTodos(e.target.dataset.filter)
        })
    })
    
    // Enter key handler
    document.getElementById('todoText').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (currentEditId) {
                updateTodo()
            } else {
                addTodo()
            }
        }
    })

    // Initialize offline capabilities
    updateConnectionStatus()
    registerServiceWorker()
    handleInstallPrompt()
    monitorServerStatus()
    
    // Listen for online/offline events
    window.addEventListener('online', function() {
        updateConnectionStatus()
        monitorServerStatus()
    })
    window.addEventListener('offline', function() {
        updateConnectionStatus()
        monitorServerStatus()
    })

    // Check server status periodically (every 60 seconds)
    setInterval(monitorServerStatus, 60000)
})
