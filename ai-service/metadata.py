from PIL import Image
import exifread


def extract_metadata(image_path):
    result = {}

    try:
        # Lecture EXIF
        with open(image_path, "rb") as f:
            tags = exifread.process_file(f)

        result["camera"] = str(tags.get("Image Model", "Unknown"))
        result["software"] = str(tags.get("Image Software", "Unknown"))
        result["datetime"] = str(tags.get("EXIF DateTimeOriginal", "Unknown"))

    except Exception:
        result["camera"] = "Unknown"
        result["software"] = "Unknown"
        result["datetime"] = "Unknown"

    try:
        img = Image.open(image_path)

        result["width"] = img.width
        result["height"] = img.height
        result["format"] = img.format

    except Exception:
        result["width"] = 0
        result["height"] = 0
        result["format"] = "Unknown"

    return result