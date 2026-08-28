import json
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path("assets/images")
TARGET_FOLDERS = ["project D", "project F", "project - G"]
VALID_EXTS = {".jpg", ".jpeg", ".png"}
OUTPUT_JSON = Path("image_audit_dfg.json")


def load_reader():
    try:
        import easyocr
        return easyocr.Reader(["en"], gpu=False), None
    except Exception as error:
        return None, str(error)


def run_ocr(reader, image_path):
    try:
        with Image.open(image_path) as image:
            rgb = image.convert("RGB")
            max_width = 1200
            if rgb.width > max_width:
                ratio = max_width / rgb.width
                new_size = (max_width, int(rgb.height * ratio))
                rgb = rgb.resize(new_size, Image.Resampling.LANCZOS)

            detections = reader.readtext(np.array(rgb), detail=0)
            cleaned = [" ".join(text.split()) for text in detections if text and text.strip()]
            unique = []
            for item in cleaned:
                if item not in unique:
                    unique.append(item)
            return {
                "ocr_count": len(unique),
                "ocr_text": unique[:12],
            }
    except Exception as error:
        return {
            "ocr_count": -1,
            "ocr_text": [],
            "ocr_error": str(error),
        }


def main():
    reader, reader_error = load_reader()
    report = {
        "folders": {},
        "summary": {
            "images_total": 0,
            "images_with_text": 0,
            "images_without_text": 0,
            "ocr_reader_error": reader_error,
        },
    }

    for folder in TARGET_FOLDERS:
        folder_path = ROOT / folder
        files = sorted([path for path in folder_path.iterdir() if path.is_file() and path.suffix.lower() in VALID_EXTS])
        folder_entries = []

        for image_path in files:
            with Image.open(image_path) as image:
                width, height = image.size
                mode = image.mode

            size_mb = round(image_path.stat().st_size / (1024 * 1024), 3)
            entry = {
                "file": str(image_path).replace("\\", "/"),
                "width": width,
                "height": height,
                "mode": mode,
                "size_mb": size_mb,
            }

            if reader is not None:
                ocr_result = run_ocr(reader, image_path)
                entry.update(ocr_result)
            else:
                entry.update({"ocr_count": -1, "ocr_text": []})

            folder_entries.append(entry)

            report["summary"]["images_total"] += 1
            if entry.get("ocr_count", 0) > 0:
                report["summary"]["images_with_text"] += 1
            elif entry.get("ocr_count", 0) == 0:
                report["summary"]["images_without_text"] += 1

        report["folders"][folder] = folder_entries

    OUTPUT_JSON.write_text(json.dumps(report, indent=2), encoding="utf-8")

    print("Saved", OUTPUT_JSON)
    print("Total images:", report["summary"]["images_total"])
    print("With OCR text:", report["summary"]["images_with_text"])
    print("Without OCR text:", report["summary"]["images_without_text"])
    if report["summary"]["ocr_reader_error"]:
        print("OCR reader error:", report["summary"]["ocr_reader_error"])


if __name__ == "__main__":
    main()
