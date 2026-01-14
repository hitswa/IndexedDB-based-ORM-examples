// IndexedDB Database Module for TODO App
let db = null

// Initialize the database
export async function initDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TodoAppDB', 1)
    
    request.onerror = () => reject(request.error)
    
    request.onsuccess = () => {
      db = request.result
      console.log('Database initialized successfully')
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      db = event.target.result
      
      // Create object store
      if (!db.objectStoreNames.contains('todos')) {
        const store = db.createObjectStore('todos', { keyPath: 'id' })
        store.createIndex('done', 'done', { unique: false })
        store.createIndex('deadline', 'deadline', { unique: false })
        store.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

export function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000)
}

export async function addTodo(description, deadline) {
  if (!db) throw new Error('Database not initialized')
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['todos'], 'readwrite')
    const store = transaction.objectStore('todos')
    
    const todo = {
      id: generateId(),
      description: description,
      deadline: deadline ? new Date(deadline).getTime() : null,
      done: 0,
      createdAt: Date.now()
    }
    
    const request = store.add(todo)
    
    request.onsuccess = () => resolve(todo.id)
    request.onerror = () => reject(request.error)
  })
}

export async function getTodos(filter = 'all') {
  if (!db) throw new Error('Database not initialized')
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['todos'], 'readonly')
    const store = transaction.objectStore('todos')
    const request = store.getAll()
    
    request.onsuccess = () => {
      let todos = request.result
      const now = Date.now()
      
      // Apply filter
      switch (filter) {
        case 'pending':
          todos = todos.filter(todo => todo.done === 0)
          break
        case 'completed':
          todos = todos.filter(todo => todo.done === 1)
          break
        case 'overdue':
          todos = todos.filter(todo => 
            todo.done === 0 && todo.deadline && todo.deadline < now
          )
          break
      }
      
      // Sort by createdAt DESC
      todos.sort((a, b) => b.createdAt - a.createdAt)
      
      resolve(todos)
    }
    
    request.onerror = () => reject(request.error)
  })
}

export async function toggleTodo(id, currentStatus) {
  if (!db) throw new Error('Database not initialized')
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['todos'], 'readwrite')
    const store = transaction.objectStore('todos')
    
    const getRequest = store.get(id)
    
    getRequest.onsuccess = () => {
      const todo = getRequest.result
      if (todo) {
        todo.done = currentStatus ? 0 : 1
        
        const putRequest = store.put(todo)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      } else {
        reject(new Error('Todo not found'))
      }
    }
    
    getRequest.onerror = () => reject(getRequest.error)
  })
}

export async function updateTodo(id, description, deadline) {
  if (!db) throw new Error('Database not initialized')
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['todos'], 'readwrite')
    const store = transaction.objectStore('todos')
    
    const getRequest = store.get(id)
    
    getRequest.onsuccess = () => {
      const todo = getRequest.result
      if (todo) {
        todo.description = description
        todo.deadline = deadline ? new Date(deadline).getTime() : null
        
        const putRequest = store.put(todo)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      } else {
        reject(new Error('Todo not found'))
      }
    }
    
    getRequest.onerror = () => reject(getRequest.error)
  })
}

export async function deleteTodo(id) {
  if (!db) throw new Error('Database not initialized')
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['todos'], 'readwrite')
    const store = transaction.objectStore('todos')
    
    const request = store.delete(id)
    
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getTodoById(id) {
  if (!db) throw new Error('Database not initialized')
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['todos'], 'readonly')
    const store = transaction.objectStore('todos')
    
    const request = store.get(id)
    
    request.onsuccess = () => resolve(request.result || null)
    request.onerror = () => reject(request.error)
  })
}

export async function getStats() {
  if (!db) throw new Error('Database not initialized')
  
  try {
    const allTodos = await getTodos('all')
    const now = Date.now()
    
    return {
      total: allTodos.length,
      pending: allTodos.filter(t => t.done === 0).length,
      completed: allTodos.filter(t => t.done === 1).length,
      overdue: allTodos.filter(t => t.done === 0 && t.deadline && t.deadline < now).length
    }
  } catch (error) {
    console.error('Error getting stats:', error)
    return { total: 0, pending: 0, completed: 0, overdue: 0 }
  }
}
