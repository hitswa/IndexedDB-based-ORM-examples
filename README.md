# IndexedDB-based ORM Examples

A collection of examples demonstrating different Object-Relational Mapping (ORM) solutions for IndexedDB in web browsers. This repository serves as a testing ground and comparison platform for various client-side database libraries and ORMs.

## 🎯 Purpose

This repository aims to:
- Compare different IndexedDB-based ORMs and database libraries
- Provide working examples of each solution
- Document performance characteristics and use cases
- Serve as a reference for developers choosing client-side database solutions

## 📚 Currently Included ORMs

### LoveField
Lovefield is a relational database written in pure JavaScript. It provides SQL-like APIs to access IndexedDB.

**Features:**
- SQL-like query syntax
- Schema definition and validation
- Cross-browser compatibility
- Transaction support

**Location:** `lovefield/`

### ElectricSQL
ElectricSQL is a local-first sync layer for web and mobile apps, providing real-time sync with PostgreSQL.

**Features:**
- Real-time synchronization
- Offline-first architecture
- Type-safe queries
- Conflict resolution

**Location:** `ElectricSQL/`

## 🚀 Getting Started

### Prerequisites
- Modern web browser with IndexedDB support
- Local web server (for testing)

### Running Examples

1. Clone the repository:
```bash
git clone https://github.com/yourusername/IndexedDB-based-ORM-examples.git
cd IndexedDB-based-ORM-examples
```

2. Start a local web server in the project directory:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server

# Using PHP
php -S localhost:8000
```

3. Navigate to the specific ORM example:
   - LoveField: `http://localhost:8000/lovefield/`
   - ElectricSQL: `http://localhost:8000/ElectricSQL/`

## 📁 Project Structure

```
├── README.md
├── .gitignore
├── lovefield/              # LoveField examples
│   ├── index.html
│   ├── lovefield.min.js
│   ├── manifest.json
│   └── sw.js
└── ElectricSQL/            # ElectricSQL examples
    ├── index.html
    ├── main.js
    ├── db.js
    ├── package.json
    ├── vite.config.js
    └── README.md
```

## 🔧 Technologies Used

- **IndexedDB**: Browser's built-in object database
- **Service Workers**: For offline functionality
- **Web App Manifests**: For PWA capabilities
- **Modern JavaScript (ES6+)**

## 🗺️ Roadmap

Future ORMs and libraries to be added:
- [ ] Dexie.js
- [ ] RxDB
- [ ] Absurd-SQL
- [ ] PGlite
- [ ] LocalForage

## 🤝 Contributing

Contributions are welcome! If you'd like to add another ORM or improve existing examples:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-orm`)
3. Add your ORM example in a new directory
4. Update this README with information about the new ORM
5. Commit your changes (`git commit -am 'Add [ORM Name] example'`)
6. Push to the branch (`git push origin feature/new-orm`)
7. Create a Pull Request

## 📊 Comparison Criteria

When evaluating ORMs, consider:
- **Bundle size**: JavaScript bundle size impact
- **API complexity**: Learning curve and ease of use
- **Performance**: Query speed and memory usage
- **Features**: Available functionality and capabilities
- **Browser support**: Compatibility across different browsers
- **Community**: Documentation, examples, and community support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all ORM library maintainers for their excellent work
- Inspired by the need for better client-side data persistence solutions

## 📞 Contact

For questions or suggestions, please open an issue in this repository.

---

⭐ If you find this repository helpful, please consider giving it a star!