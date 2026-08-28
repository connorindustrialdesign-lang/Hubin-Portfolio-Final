#!/usr/bin/env python3
import easyocr
from PIL import Image

# Initialize reader
reader = easyocr.Reader(['en'])

# Read Number2.jpg
img_path = "assets/images/project D/Number2.jpg"
print("Reading image and extracting text...")
results = reader.readtext(img_path)

print("\n" + "=" * 60)
print("TEXT EXTRACTION FROM Number2.jpg")
print("=" * 60)

# Display all detected text with position info
for (bbox, text, confidence) in results:
    # bbox gives us the coordinates
    x_coords = [point[0] for point in bbox]
    y_coords = [point[1] for point in bbox]
    x_pos = sum(x_coords) / len(x_coords)
    y_pos = sum(y_coords) / len(y_coords)
    
    print(f"\nText: '{text}'")
    print(f"  Position: x={x_pos:.0f}, y={y_pos:.0f}")
    print(f"  Confidence: {confidence:.2f}")

# Get image dimensions for reference
img = Image.open(img_path)
print(f"\nImage dimensions: {img.width} x {img.height}")
print("=" * 60)
