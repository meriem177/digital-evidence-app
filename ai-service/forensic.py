import cv2
import numpy as np


def preprocess(image_path):
    img = cv2.imread(image_path)

    if img is None:
        raise Exception("Impossible de lire l'image")

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    rgb = cv2.resize(rgb, (512, 512))
    rgb = rgb.astype(np.float32) / 255.0

    return rgb


def analyze_image(image_path):

    image = cv2.imread(image_path)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    # Netteté (variance du Laplacien)
    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()

    # Bruit estimé
    noise = np.std(gray)

    # Histogramme
    hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
    hist = hist / hist.sum()

    entropy = -np.sum(hist * np.log2(hist + 1e-10))

    return {
        "sharpness": float(sharpness),
        "noise": float(noise),
        "entropy": float(entropy)
    }