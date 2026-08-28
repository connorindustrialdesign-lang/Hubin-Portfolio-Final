#!/usr/bin/env python3
"""
Project D Image Analysis Script
Analyzes each image and documents content for text extraction/removal workflow
"""

from PIL import Image
import os
from pathlib import Path

project_d_dir = Path("assets/images/project D")

# Image categorization
categories = {
    "Problem": ["Number1.jpg", "Number2.jpg", "Number2.10 2.jpg"],
    "Research": ["2.jpg", "topview.jpg", "Number3.11.jpg"],
    "Concepts": ["concept sketch #1.jpg", "concept sketch #2.jpg"],
    "Iterations": ["Number4.12 2.jpg", "Number5.13.jpg", "Number6.14.jpg", "Number7.15.jpg", "Number8.16.jpg"],
    "Final": ["Number11.19.jpg", "Number12.20.jpg", "Number13.21.jpg"]
}

print("\n" + "="*80)
print("PROJECT D IMAGE ANALYSIS REPORT")
print("="*80 + "\n")

for category, images in categories.items():
    print(f"\n{'▶ ' + category.upper()}")
    print("-" * 80)
    
    for img_name in images:
        img_path = project_d_dir / img_name
        if not img_path.exists():
            print(f"  ⚠ {img_name} - NOT FOUND")
            continue
        
        try:
            img = Image.open(img_path)
            width, height = img.size
            size_mb = os.path.getsize(img_path) / 1024 / 1024
            
            # Get image mode/format info
            mode = img.mode
            format_info = img.format if hasattr(img, 'format') else "JPEG"
            
            print(f"\n  📄 {img_name}")
            print(f"     Dimensions: {width} × {height}px")
            print(f"     File size: {size_mb:.2f} MB")
            print(f"     Format: {format_info} ({mode})")
            
            # Visual inspection notes
            # (In a real scenario, we'd do pixel analysis here)
            print(f"     Status: Ready for text extraction")
            
        except Exception as e:
            print(f"  ❌ {img_name} - Error: {e}")

print("\n" + "="*80)
print("NEXT STEPS:")
print("="*80)
print("""
1. Review each image visually in file explorer
2. Note any:
   - Project names/titles
   - Section labels
   - Process notes or annotations
   - Numbering or sequencing
   - Dates or other metadata

3. Once documented, use PIL-based image editing to:
   - Identify text regions
   - Remove/cover overlaid text
   - Save cleaned versions

4. Upload cleaned images and add captions to webpage
""")
print("="*80 + "\n")
