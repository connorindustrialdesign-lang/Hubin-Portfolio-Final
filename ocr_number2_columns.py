import easyocr
from PIL import Image, ImageEnhance, ImageOps
import numpy as np

img_path = "assets/images/project D/Number2.jpg"
img = Image.open(img_path).convert("RGB")
w, h = img.size

third = w // 3
regions = {
    "middle": (third, 0, 2 * third, h),
    "right": (2 * third, 0, w, h),
}

reader = easyocr.Reader(['en'], gpu=False)

for name, box in regions.items():
    crop = img.crop(box)
    gray = ImageOps.grayscale(crop)
    enhanced = ImageEnhance.Contrast(gray).enhance(2.2)
    upscaled = enhanced.resize((enhanced.width * 2, enhanced.height * 2), Image.Resampling.LANCZOS)

    results = reader.readtext(np.array(upscaled), detail=1, paragraph=False, low_text=0.2, text_threshold=0.4)

    print(f"REGION {name.upper()} detections={len(results)}")
    for bbox, text, conf in results:
        cleaned = " ".join(text.split())
        print(f"  {conf:.2f}\t{cleaned}")
    print("---")
