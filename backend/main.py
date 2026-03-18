from fastapi import FastAPI, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import sqlite3
from datetime import datetime
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

app = FastAPI()

# ------------------ CORS ------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------ DATABASE ------------------
def get_db():
    conn = sqlite3.connect("predictions.db")
    conn.row_factory = sqlite3.Row
    return conn

conn = get_db()
conn.execute("""
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    probability REAL,
    risk TEXT,
    timestamp TEXT
)
""")
conn.commit()
conn.close()

model = None
feature_names = []
feature_importance = []

# ------------------ DATA MODEL ------------------
class WaterData(BaseModel):
    ph: float
    Hardness: float
    Solids: float
    Chloramines: float
    Sulfate: float
    Conductivity: float
    Organic_carbon: float
    Trihalomethanes: float
    Turbidity: float

# ------------------ TRAIN MODEL ------------------
@app.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    global model, feature_names, feature_importance

    df = pd.read_csv(file.file)
    df.fillna(df.mean(), inplace=True)

    df["Bloom"] = np.where(
        (df["Turbidity"] > df["Turbidity"].mean()) &
        (df["Organic_carbon"] > df["Organic_carbon"].mean()),
        1, 0
    )

    X = df.drop(["Potability", "Bloom"], axis=1)
    y = df["Bloom"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(n_estimators=200)
    model.fit(X_train, y_train)

    accuracy = model.score(X_test, y_test)

    feature_names = X.columns.tolist()
    feature_importance = model.feature_importances_.tolist()

    return {
        "accuracy": round(accuracy, 3),
        "features": feature_names,
        "importance": feature_importance
    }

# ------------------ PREDICTION ------------------
@app.post("/predict")
def predict(data: WaterData):
    global model

    if model is None:
        return {"error": "Train model first"}

    features = pd.DataFrame([data.dict()])
    prob = model.predict_proba(features)[0][1]

    if prob > 0.7:
        level = "High Bloom Risk"
        days = 2
        suggestion = "Reduce nutrient runoff, improve aeration, restrict agricultural discharge."
    elif prob > 0.4:
        level = "Moderate Bloom Risk"
        days = 5
        suggestion = "Monitor turbidity and organic carbon. Increase filtration."
    else:
        level = "Low Bloom Risk"
        days = 15
        suggestion = "Maintain water quality and periodic monitoring."

    process = """
1. Excess nutrients accumulate.
2. Rapid algae reproduction.
3. Oxygen depletion.
4. Ecosystem imbalance.
"""

    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = get_db()
    conn.execute(
        "INSERT INTO history (probability, risk, timestamp) VALUES (?, ?, ?)",
        (prob, level, timestamp)
    )
    conn.commit()
    conn.close()

    return {
        "probability": prob,
        "risk_level": level,
        "estimated_days": days,
        "suggestion": suggestion,
        "process": process
    }

# ------------------ HISTORY ------------------
@app.get("/history")
def get_history(risk: str = Query(None), search: str = Query(None)):
    conn = get_db()
    query = "SELECT * FROM history WHERE 1=1"
    params = []

    if risk:
        query += " AND risk = ?"
        params.append(risk)

    if search:
        query += " AND timestamp LIKE ?"
        params.append(f"%{search}%")

    query += " ORDER BY id DESC LIMIT 20"

    rows = conn.execute(query, params).fetchall()
    conn.close()

    return {"data": [dict(row) for row in rows]}

# ------------------ FORECAST ------------------
@app.get("/forecast")
def forecast():
    conn = get_db()
    rows = conn.execute("SELECT probability FROM history ORDER BY id ASC").fetchall()
    conn.close()

    probs = [r[0] for r in rows]

    if len(probs) < 3:
        return {"forecast": []}

    forecast_vals = []
    for i in range(len(probs) - 2):
        forecast_vals.append(sum(probs[i:i+3]) / 3)

    return {"forecast": forecast_vals}

# ------------------ EXPORT PDF ------------------
@app.get("/export")
def export_pdf():
    file_path = "report.pdf"
    doc = SimpleDocTemplate(file_path)
    styles = getSampleStyleSheet()
    elements = []

    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM history ORDER BY id DESC LIMIT 20"
    ).fetchall()
    conn.close()

    elements.append(Paragraph("Algal Bloom Prediction Report", styles["Heading1"]))
    elements.append(Spacer(1, 12))

    for row in rows:
        text = f"{row['timestamp']} | {row['risk']} | {round(row['probability'],2)}"
        elements.append(Paragraph(text, styles["Normal"]))
        elements.append(Spacer(1, 8))

    doc.build(elements)

    return FileResponse(file_path, media_type="application/pdf", filename="report.pdf")

# -------- RUN SERVER --------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
