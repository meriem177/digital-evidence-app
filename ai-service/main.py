from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from pathlib import Path

from metadata import extract_metadata
from forensic import analyze_image
from pscc import analyze_pscc

app = FastAPI()

# Servir les heatmaps
app.mount(
    "/heatmaps",
    StaticFiles(directory="heatmaps"),
    name="heatmaps"
)


class ImageRequest(BaseModel):
    image_path: str


@app.get("/")
def home():
    return {
        "message": "AI Service is running"
    }


@app.post("/analyze")
def analyze(request: ImageRequest):

    # Vérifier que l'image existe
    image_path = Path(request.image_path)

    if not image_path.exists():
        return {
            "error": "Image not found",
            "path": str(image_path)
        }

    # Extraction des métadonnées
    metadata = extract_metadata(str(image_path))

    # Analyse classique
    analysis = analyze_image(str(image_path))

    # Analyse IA PSCC-Net
    ai = analyze_pscc(str(image_path))

    # Nom du fichier heatmap
    heatmap_name = Path(ai["heatmap_path"]).name

    return {

        # Résultat IA
        "authenticity": ai["authenticity"],
        "manipulation": ai["manipulation"],
        "confidence": ai["confidence"],

        # URL pour le frontend
        "heatmap": f"http://127.0.0.1:8000/heatmaps/{heatmap_name}",

        # Chemin local (utilisé pour le PDF)
        "heatmap_path": ai["heatmap_path"],

        # Métadonnées
        "metadata": metadata,

        # Analyse classique
        "analysis": analysis

    }