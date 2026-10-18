# BioViral v2.0 - Advanced Antiviral Synthesis Platform

Advanced biological antiviral synthesis platform with 40+ pathogens, ensemble structure prediction, and molecular docking.

## Quick Start

### Frontend Setup
```bash
npm install
npm run dev
```

The frontend will run on http://localhost:3000

### Backend Setup (Python)
```bash
pip install fastapi uvicorn scipy numpy httpx pydantic
python bioviral_v2_engine.py
```

The backend will run on http://localhost:8000

## Project Structure

```
BioViral2/
├── src/
│   ├── App.jsx              # Main React dashboard component
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind CSS imports
├── bioviral_v2_engine.py    # FastAPI backend with analysis engine
├── bioviral_v2_dashboard.jsx # Original dashboard component (moved to src/App.jsx)
├── BIOVIRAL_V2_DOCS.md      # Comprehensive documentation
├── package.json             # NPM dependencies
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
└── index.html               # HTML entry point
```

## Features

- **40+ Pathogens**: Complete database of major human pathogens
- **Threat Stratification**: CRITICAL/HIGH/MEDIUM/LOW classification
- **Ensemble Structure Prediction**: Multi-model consensus predictions
- **Molecular Docking**: Multi-pose binding affinity calculations
- **Cross-Reactivity Analysis**: Predict broad-spectrum antiviral potential
- **Interactive Dashboard**: Real-time pathogen selection and analysis

## Technology Stack

**Frontend:**
- React 18.2.0
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)

**Backend:**
- Python 3.7+
- FastAPI (API framework)
- NumPy & SciPy (scientific computing)

## Development

### Install dependencies
```bash
npm install
```

### Run development server
```bash
npm run dev
```

### Build for production
```bash
npm run build
```

## Configuration

The frontend is configured to proxy API requests from `/api/*` to `http://localhost:8000`. Update `vite.config.js` if your backend runs on a different port.

## Documentation

See `BIOVIRAL_V2_DOCS.md` for comprehensive documentation on:
- Pathogen database schema
- Algorithm explanations
- API reference
- Use cases
- Deployment guides

## License

For research and educational purposes.
