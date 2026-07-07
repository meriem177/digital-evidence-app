import cv2
import numpy as np


def generate_heatmap(image_path, output_path):

    image = cv2.imread(image_path)

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    heat = cv2.applyColorMap(gray, cv2.COLORMAP_JET)

    cv2.imwrite(output_path, heat)

    return output_path