# BioViral v2.0 Setup Guide

## ✅ What Was Added

The following files have been created to make BioViral v2.0 fully functional:

### Frontend Configuration
- **package.json** - NPM dependencies and scripts
- **vite.config.js** - Vite build tool configuration
- **tailwind.config.js** - Tailwind CSS configuration  
- **postcss.config.js** - PostCSS configuration for Tailwind
- **index.html** - HTML entry point for the React app
- **.gitignore** - Git ignore file for node_modules and build artifacts

### React Application
- **src/main.jsx** - React entry point
- **src/App.jsx** - Main dashboard component (moved from bioviral_v2_dashboard.jsx)
- **src/index.css** - Tailwind CSS imports

### Documentation
- **README.md** - Quick start and project overview
- **SETUP_GUIDE.md** - This file

## 🚀 Running the Application

### 1. Frontend (React + Vite)
```bash
cd "C:\Users\marco\Downloads\BioViral2"
npm install    # Already done!
npm run dev
```
- Runs on **http://localhost:3000**
- Hot reloading enabled
- Configured to proxy `/api/*` requests to backend on port 8000

### 2. Backend (FastAPI + Python)
In a separate terminal:
```bash
cd "C:\Users\marco\Downloads\BioViral2"
pip install fastapi uvicorn scipy numpy httpx pydantic
python bioviral_v2_engine.py
```
- Runs on **http://localhost:8000**
- REST API for pathogen analysis

## 📦 Dependencies

### Frontend
- React 18.2.0
- Vite 5.0.0
- Tailwind CSS 3.3.0
- Lucide React 0.263.1 (icons)
- Axios 1.6.0 (HTTP client)

### Backend
- FastAPI (Python web framework)
- Uvicorn (ASGI server)
- NumPy & SciPy (scientific computing)
- Pydantic (data validation)

## 📁 Project Structure

```
BioViral2/
├── src/
│   ├── App.jsx              # Main React component
│   ├── main.jsx             # React entry point
│   └── index.css            # CSS imports
├── index.html               # HTML shell
├── package.json             # NPM config
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
├── postcss.config.js        # PostCSS config
├── bioviral_v2_engine.py    # Python FastAPI backend
├── bioviral_v2_dashboard.jsx # Original component (can be archived)
├── BIOVIRAL_V2_DOCS.md      # Detailed documentation
├── README.md                # Quick start guide
└── node_modules/            # NPM packages (git ignored)
```

## ✨ Features Available

- ✅ 40+ pathogen database with search and filtering
- ✅ Threat level stratification (CRITICAL/HIGH/MEDIUM/LOW)
- ✅ Interactive pathogen selection with metrics
- ✅ Cross-reactivity analysis
- ✅ Therapeutic approach selection (5 modalities)
- ✅ Analysis configuration and execution
- ✅ Results display with binding affinity metrics
- ✅ PDB structure links for reference

## 🔧 Troubleshooting

### npm doesn't work
Ensure Node.js is installed:
```bash
node --version
npm --version
```

### Port 3000 already in use
Change the port in `vite.config.js`:
```javascript
server: {
    port: 3001,  // Change to 3001 or any available port
    ...
}
```

### Backend API not connecting
Make sure the Python backend is running on port 8000. Update the proxy in `vite.config.js` if needed:
```javascript
proxy: {
    '/api': {
        target: 'http://localhost:8000',  // Update if backend is on different port
        ...
    }
}
```

## 🎯 Next Steps

1. Start the frontend: `npm run dev`
2. Start the backend in another terminal: `python bioviral_v2_engine.py`
3. Open **http://localhost:3000** in your browser
4. Select a pathogen and run an analysis!

## 📖 Documentation

For detailed information about the algorithms, pathogen database, and API endpoints, see **BIOVIRAL_V2_DOCS.md**.
