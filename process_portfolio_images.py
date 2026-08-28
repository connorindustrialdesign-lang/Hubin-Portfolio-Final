import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

import cv2
import easyocr
import numpy as np

ROOT = Path("assets/images")
OUTPUT_ROOT = ROOT / "processed"
MANIFEST_PATH = Path("project_image_manifest.json")
TARGETS = {
    "project D": "project-d",
    "project F": "project-f",
    "project - G": "project-g",
}
VALID_EXTENSIONS = {".jpg", ".jpeg", ".png"}


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def infer_section(file_name: str, ocr_text: List[str], project_key: str) -> str:
    lower_name = file_name.lower()
    joined = " ".join(ocr_text).lower()

    if "menu" in lower_name or "interface" in joined or "main" in joined:
        return "interface"

    if any(word in joined for word in ["problem", "challenge", "senior", "pain", "issue"]):
        return "problem"

    if any(word in joined for word in ["research", "insight", "study", "survey"]):
        return "research"

    if any(word in lower_name for word in ["concept", "sketch", "spread", "controls", "topview", "plateform"]):
        return "iterations"

    if any(word in lower_name for word in ["number11", "number12", "number13", "openlid", "light", "render", "project-"]):
        return "final"

    if project_key == "project-d" and any(word in lower_name for word in ["number1", "number2"]):
        return "final"

    return "iterations"


def infer_rank(file_name: str, section: str, project_key: str) -> int:
    lower_name = file_name.lower()

    if project_key == "project-d" and "number1" in lower_name:
        return 0
    if project_key == "project-f" and "project-f" in lower_name:
        return 0
    if project_key == "project-g" and "project-g" in lower_name:
        return 0

    section_rank = {
        "problem": 10,
        "research": 20,
        "iterations": 30,
        "interface": 40,
        "final": 50,
    }.get(section, 30)

    number_match = re.search(r"(\d+)", lower_name)
    number_rank = int(number_match.group(1)) if number_match else 999
    return section_rank * 1000 + number_rank


def clean_image_with_ocr(reader: easyocr.Reader, source_path: Path, destination_path: Path) -> Dict:
    image = cv2.imread(str(source_path))
    if image is None:
        return {
            "ocr_text": [],
            "boxes": [],
            "error": "unable_to_read_image",
        }

    rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    detections = reader.readtext(rgb, detail=1, paragraph=False)

    mask = np.zeros(image.shape[:2], dtype=np.uint8)
    text_entries = []
    boxes = []

    for bbox, text, confidence in detections:
        cleaned = normalize_text(text)
        if not cleaned:
            continue

        if confidence < 0.2:
            continue

        points = np.array([[int(point[0]), int(point[1])] for point in bbox], dtype=np.int32)
        x, y, width, height = cv2.boundingRect(points)

        if width < 18 or height < 10:
            continue

        pad_x = max(2, int(width * 0.08))
        pad_y = max(2, int(height * 0.12))

        x1 = max(0, x - pad_x)
        y1 = max(0, y - pad_y)
        x2 = min(image.shape[1] - 1, x + width + pad_x)
        y2 = min(image.shape[0] - 1, y + height + pad_y)

        cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)

        text_entries.append(cleaned)
        boxes.append({
            "x1": x1,
            "y1": y1,
            "x2": x2,
            "y2": y2,
            "confidence": round(float(confidence), 3),
            "text": cleaned,
        })

    cleaned_image = cv2.inpaint(image, mask, 3, cv2.INPAINT_TELEA)
    destination_path.parent.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(destination_path), cleaned_image)

    unique_text = []
    for text in text_entries:
        if text not in unique_text:
            unique_text.append(text)

    return {
        "ocr_text": unique_text,
        "boxes": boxes,
        "removed_regions": len(boxes),
    }


def main() -> None:
    reader = easyocr.Reader(["en"], gpu=False)
    manifest = {
        "projects": {},
        "summary": {
            "files": 0,
            "ocr_text_detected": 0,
            "regions_removed": 0,
        },
    }

    for folder_name, project_key in TARGETS.items():
        source_folder = ROOT / folder_name
        files = sorted(path for path in source_folder.iterdir() if path.suffix.lower() in VALID_EXTENSIONS)

        entries = []
        for source_path in files:
            processed_path = OUTPUT_ROOT / project_key / source_path.name
            result = clean_image_with_ocr(reader, source_path, processed_path)

            section = infer_section(source_path.name, result.get("ocr_text", []), project_key)
            rank = infer_rank(source_path.name, section, project_key)

            entry = {
                "original": str(source_path).replace("\\", "/"),
                "processed": str(processed_path).replace("\\", "/"),
                "filename": source_path.name,
                "section": section,
                "rank": rank,
                "ocr_text": result.get("ocr_text", [])[:10],
                "removed_regions": result.get("removed_regions", 0),
            }
            entries.append(entry)

            manifest["summary"]["files"] += 1
            if entry["ocr_text"]:
                manifest["summary"]["ocr_text_detected"] += 1
            manifest["summary"]["regions_removed"] += entry["removed_regions"]

        entries.sort(key=lambda item: (item["rank"], item["filename"].lower()))
        manifest["projects"][project_key] = entries

    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2), encoding="utf-8")

    print(f"Saved manifest: {MANIFEST_PATH}")
    print(f"Files processed: {manifest['summary']['files']}")
    print(f"Files with OCR text: {manifest['summary']['ocr_text_detected']}")
    print(f"Total removed text regions: {manifest['summary']['regions_removed']}")


if __name__ == "__main__":
    main()
