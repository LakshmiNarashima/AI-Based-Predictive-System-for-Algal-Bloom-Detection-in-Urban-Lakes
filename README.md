# AI-Based Predictive System for Algal Bloom Detection in Urban Lakes

This repository contains a full-stack project for predicting algal bloom risk in urban lakes using water quality parameters. It combines a FastAPI backend, a React frontend dashboard, and a simple local SQLite history store.

## Overview

The system allows a user to:

- Upload a dataset and train the prediction model
- Enter water quality values manually for bloom-risk prediction
- View prediction history and a simple forecast
- Export recent prediction history as a PDF report
- Use a dashboard with validation, charts, dark mode, and risk indicators

## Tech Stack

- Frontend: React, Recharts, Axios
- Backend: FastAPI, scikit-learn, pandas, NumPy
- Database: SQLite
- Report generation: ReportLab

## Repository Structure

```text
backend/
  main.py
  requirements.txt
  test_forecast.py

frontend/
  src/
  public/
  package.json
  FEATURES.md
  QUICKSTART.md
```

## Features

- Dataset upload and model training
- Bloom risk prediction from water quality input
- Prediction history stored in SQLite
- Forecast endpoint based on recent history
- PDF export of recent predictions
- Frontend validation for water quality inputs
- Interactive charts and risk visualization
- Dark mode support

## Backend Setup

From the repository root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

Backend runs at:

```text
http://127.0.0.1:8000
```

## Frontend Setup

Open a second terminal from the repository root:

```powershell
cd frontend
npm install
npm.cmd start
```

Frontend runs at:

```text
http://localhost:3000
```

Note: use `npm.cmd` in PowerShell if script execution blocks `npm`.

## API Endpoints

- `POST /upload`  
  Upload a CSV dataset and train the model

- `POST /predict`  
  Predict bloom risk using water quality values

- `GET /history`  
  Return the latest prediction history, with optional filtering

- `GET /forecast`  
  Return a simple forecast based on stored probabilities

- `GET /export`  
  Generate and download a PDF report

## Input Parameters

The prediction endpoint expects these fields:

- `ph`
- `Hardness`
- `Solids`
- `Chloramines`
- `Sulfate`
- `Conductivity`
- `Organic_carbon`
- `Trihalomethanes`
- `Turbidity`

## Notes

- The backend creates a local `predictions.db` SQLite database.
- Generated PDF reports are written to `backend/report.pdf`.
- Large local artifacts and dependency folders are ignored in the root [`.gitignore`](/c:/Users/LUCKY/OneDrive/Desktop/nsb/.gitignore).

## Project Documentation

- Frontend feature details: [frontend/FEATURES.md](/c:/Users/LUCKY/OneDrive/Desktop/nsb/frontend/FEATURES.md)
- Frontend quick start: [frontend/QUICKSTART.md](/c:/Users/LUCKY/OneDrive/Desktop/nsb/frontend/QUICKSTART.md)

## GitHub

Remote repository:

`https://github.com/LakshmiNarashima/AI-Based-Predictive-System-for-Algal-Bloom-Detection-in-Urban-Lakes`
