import easyocr
from PIL import Image, ImageEnhance, ImageOps
import tempfile
import os

img_path = "assets/images/project D/Number2.jpg"
base = Image.open(img_path).convert("RGB")
reader = easyocr.Reader(['en'], gpu=False)

variants = []
variants.append(("original", base))
variants.append(("up2x", base.resize((base.width * 2, base.height * 2), Image.Resampling.LANCZOS)))

gray = ImageOps.grayscale(base)
variants.append(("gray", gray.convert("RGB")))
variants.append(("gray_up2x", gray.resize((gray.width * 2, gray.height * 2), Image.Resampling.LANCZOS).convert("RGB")))

hi_contrast = ImageEnhance.Contrast(gray).enhance(2.5)
variants.append(("contrast2.5", hi_contrast.convert("RGB")))
variants.append(("contrast2.5_up2x", hi_contrast.resize((hi_contrast.width * 2, hi_contrast.height * 2), Image.Resampling.LANCZOS).convert("RGB")))

sharp = ImageEnhance.Sharpness(hi_contrast).enhance(2.0)
variants.append(("contrast_sharp", sharp.convert("RGB")))

best = None
for name, img in variants:
    with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
        tmp_path = tmp.name
    img.save(tmp_path)
    try:
        results = reader.readtext(tmp_path, detail=1, paragraph=False, text_threshold=0.5, low_text=0.2)
        print(f"VARIANT {name}: {len(results)} detections")
        for bbox, text, conf in results[:12]:
            print(f"  {conf:.2f}\t{text}")
        if best is None or len(results) > len(best[1]):
            best = (name, results, img.size)
    finally:
        os.unlink(tmp_path)

print("---")
if best:
    name, results, size = best
    print(f"BEST_VARIANT {name} size={size} detections={len(results)}")
