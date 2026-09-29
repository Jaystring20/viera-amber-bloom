#!/usr/bin/env python3
"""
Extract illustrations from PDF sequentially
Starting from page 2 (index 1), extract all images and number them sequentially
"""

import pdfplumber
import os
from pathlib import Path
from PIL import Image
import io

# Paths
pdf_path = r"C:\Users\DELL\Downloads\Illustrations pack.pdf"
output_folder = r"C:\Users\DELL\projects\viera-amber\public\artworks"
mapping_file = r"C:\Users\DELL\projects\viera-amber\EXTRACTION_MAPPING.txt"

# Ensure output folder exists
os.makedirs(output_folder, exist_ok=True)

# Open the PDF
with pdfplumber.open(pdf_path) as pdf:
    total_pages = len(pdf.pages)
    print(f"Total pages in PDF: {total_pages}")
    print(f"Starting extraction from page 2 (index 1)")
    print("")

    image_counter = 1
    page_mapping = []

    # Start from page 2 (index 1)
    for page_num in range(1, total_pages):
        page = pdf.pages[page_num]
        images = page.images

        print(f"Page {page_num + 1}: Found {len(images)} image(s)")

        for img_index, image in enumerate(images):
            # Extract image
            try:
                img_data = page.crop((image["x0"], image["top"], image["x1"], image["bottom"])).to_image()

                # Save as WebP
                filename = f"artwork_{image_counter:04d}.webp"
                filepath = os.path.join(output_folder, filename)

                img_data.save(filepath, "WEBP", quality=95)

                # Log mapping
                mapping_entry = f"artwork_{image_counter:04d}.webp (seq {image_counter}) ← Page {page_num + 1}, Image {img_index + 1}"
                page_mapping.append(mapping_entry)

                print(f"  ✓ Saved: {filename}")
                image_counter += 1

            except Exception as e:
                print(f"  ✗ Error extracting image from page {page_num + 1}: {e}")

    print("")
    print(f"✓ Extraction complete!")
    print(f"Total images extracted: {image_counter - 1}")

    # Save mapping file
    with open(mapping_file, 'w') as f:
        f.write("EXTRACTION MAPPING - Illustrations Pack\n")
        f.write("=" * 80 + "\n")
        f.write(f"Total images extracted: {image_counter - 1}\n")
        f.write(f"Source: {pdf_path}\n")
        f.write(f"Output folder: {output_folder}\n")
        f.write("=" * 80 + "\n\n")
        for entry in page_mapping:
            f.write(entry + "\n")

    print(f"✓ Mapping file saved: {mapping_file}")
