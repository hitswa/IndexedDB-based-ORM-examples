# Lovefield TODO App Example

A comprehensive example demonstrating Lovefield ORM capabilities with a fully functional, offline-ready TODO application built with pure JavaScript and IndexedDB.

## 🚀 Overview

This example showcases Lovefield's powerful features through a real-world TODO application that works completely offline and provides a native app-like experience through PWA (Progressive Web App) capabilities.

## ✨ Features

### Core Functionality
- **Create, Read, Update, Delete** (CRUD) operations for TODO items
- **Deadline management** with visual indicators for overdue tasks
- **Task filtering** (All, Active, Completed)
- **Task search** functionality
- **Real-time statistics** showing total, active, and completed tasks
- **Bulk operations** (mark all as done, clear completed)

### Offline & PWA Features
- **Offline-first architecture** - works without internet connection
- **Service Worker** integration for caching
- **PWA manifest** for installable app experience
- **Responsive design** for mobile and desktop
- **Connection status indicator**

### Lovefield-Specific Features
- **Schema definition** with proper data types
- **SQL-like queries** with Lovefield's query builder
- **Transaction support** for data consistency
- **Index management** for optimized queries
- **Data persistence** in IndexedDB

## 🛠️ Technologies Used

- **Lovefield** - SQL-like relational database for web browsers
- **IndexedDB** - Browser's object database (via Lovefield)
- **Service Workers** - For offline functionality and caching
- **Web App Manifest** - For PWA capabilities
- **Vanilla JavaScript** - No additional frameworks
- **CSS Grid & Flexbox** - Modern responsive layout

## 📁 File Structure

```
lovefield/
├── index.html          # Main application file
├── lovefield.min.js    # Lovefield library
├── manifest.json       # PWA manifest
└── sw.js              # Service Worker for offline functionality
```

## 🏃‍♂️ Getting Started

1. **Start a local web server** in the project root:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

2. **Navigate to the Lovefield example**:
   ```
   http://localhost:8000/lovefield/
   ```

3. **Start using the app**:
   - Add new tasks with optional deadlines
   - Mark tasks as complete/incomplete
   - Filter tasks by status
   - Search through your tasks
   - Try going offline - the app continues to work!

## 💾 Database Schema

The app uses a simple but effective schema:

```javascript
const schemaBuilder = lf.schema.create('todoApp', 1);
schemaBuilder.createTable('Item')
    .addColumn('id', lf.Type.INTEGER)
    .addColumn('description', lf.Type.STRING)
    .addColumn('deadline', lf.Type.DATE_TIME)
    .addColumn('done', lf.Type.BOOLEAN)
    .addColumn('createdAt', lf.Type.DATE_TIME)
    .addPrimaryKey(['id'], true);
```

### Table: Item
- **id**: Primary key (auto-increment)
- **description**: Task description (string)
- **deadline**: Optional due date (datetime)
- **done**: Completion status (boolean)
- **createdAt**: Creation timestamp (datetime)

## 🔍 Key Lovefield Concepts Demonstrated

### 1. Schema Creation
```javascript
const schemaBuilder = lf.schema.create('todoApp', 1);
const itemTable = schemaBuilder.createTable('Item');
```

### 2. Database Connection
```javascript
const db = await schemaBuilder.connect();
```

### 3. CRUD Operations

**Insert:**
```javascript
const item = itemTable.createRow({
    description: 'New task',
    deadline: new Date(),
    done: false,
    createdAt: new Date()
});
await db.insert().into(itemTable).values([item]).exec();
```

**Select with Filtering:**
```javascript
const results = await db
    .select()
    .from(itemTable)
    .where(itemTable.done.eq(false))
    .exec();
```

**Update:**
```javascript
await db
    .update(itemTable)
    .set(itemTable.done, true)
    .where(itemTable.id.eq(taskId))
    .exec();
```

**Delete:**
```javascript
await db
    .delete()
    .from(itemTable)
    .where(itemTable.id.eq(taskId))
    .exec();
```

## 🎯 Learning Objectives

This example helps you understand:

1. **Lovefield Basics**
   - Schema definition and table creation
   - Database connection and initialization
   - Basic CRUD operations

2. **Advanced Queries**
   - Filtering with WHERE clauses
   - Sorting with ORDER BY
   - Combining conditions

3. **Transaction Management**
   - Atomic operations
   - Error handling
   - Data consistency

4. **Real-world Integration**
   - UI synchronization with database changes
   - Error handling and user feedback
   - Performance optimization

## 🔧 Key Implementation Details

### Offline Functionality
- Service Worker caches all app resources
- Database operations work entirely offline
- Connection status monitoring and user feedback

### Performance Optimizations
- Efficient query patterns
- Minimal DOM manipulations
- Event delegation for dynamic content

### User Experience
- Responsive design for all screen sizes
- Intuitive keyboard shortcuts
- Visual feedback for all operations
- Accessibility considerations

## 📊 Performance Characteristics

- **Bundle Size**: ~180KB (including Lovefield library)
- **Initial Load**: Fast (cached after first visit)
- **Query Performance**: Excellent for typical TODO app usage
- **Memory Usage**: Minimal
- **Browser Support**: All modern browsers with IndexedDB

## 🐛 Error Handling

The app includes comprehensive error handling:
- Database connection failures
- Query execution errors
- Service Worker registration issues
- Network connectivity problems

## 🚀 Next Steps

To extend this example:
1. Add task categories or tags
2. Implement task priorities
3. Add due date notifications
4. Create data export/import functionality
5. Implement data synchronization with a server

## 📚 Resources

- [Lovefield Documentation](https://github.com/google/lovefield/blob/master/docs/README.md)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)

## 🤝 Contributing

Feel free to enhance this example by:
- Adding new features
- Improving the UI/UX
- Optimizing performance
- Adding more comprehensive tests
- Improving accessibility

---

This example demonstrates Lovefield's capabilities in a practical, real-world scenario while showcasing best practices for offline-first web applications.