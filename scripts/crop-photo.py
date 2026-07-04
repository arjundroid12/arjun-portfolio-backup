#!/usr/bin/env python3
"""
Crop the mirror selfie to a square portrait for the portfolio hero avatar.
- Subject is centered, upper body visible (head + shoulders + part of torso)
- Image is 720x1280 (portrait, phone photo)
- Goal: square crop focused on head + shoulders, subject centered
"""
from PIL import Image, ImageFilter, ImageEnhance
import os

SRC = "/home/z/my-project/upload/pasted_image_1783100997802.png"
OUT = "/home/z/my-project/public/photo.jpg"

img = Image.open(SRC)
print(f"Original size: {img.size}, mode: {img.mode}")

# Convert to RGB (in case it has alpha)
if img.mode != "RGB":
    img = img.convert("RGB")

w, h = img.size  # 720 x 1280

# Subject is centered horizontally, upper body (head + shoulders)
# From the VLM analysis: subject is in the middle-to-upper portion,
# from roughly the chest up, with part of the torso visible.
# Top of frame cuts off just above subject's head.
#
# For a head-and-shoulders square crop:
# - Horizontal: center the subject (full width is fine, subject is centered)
# - Vertical: focus on the upper portion where head + shoulders are
#
# Let's crop a square from the center-top area
# Subject head is roughly in the top 40% of the image
# We want head + shoulders, so take from ~5% to ~55% vertically

# Calculate square crop dimensions
# Use the full width (720) as the square size, but that's too tall
# Better: use a smaller square centered on the face
# Face is roughly at y = 200-600 (out of 1280) based on typical mirror selfies

# Let's do a centered square crop, 600x600, focused on upper body
square_size = 680  # slightly smaller than width to allow centering

# Center horizontally
left = (w - square_size) // 2
# Position vertically to capture head + shoulders
# Subject head starts near top, so crop from top with slight offset
top = 80  # small offset from top to include full head

right = left + square_size
bottom = top + square_size

# Make sure we don't exceed image bounds
if bottom > h:
    bottom = h
    top = bottom - square_size
if left < 0:
    left = 0
    right = square_size

cropped = img.crop((left, top, right, bottom))
print(f"Cropped size: {cropped.size}")

# Enhance the image slightly for a premium look
# 1. Slight brightness increase
enhancer = ImageEnhance.Brightness(cropped)
cropped = enhancer.enhance(1.05)

# 2. Slight contrast increase
enhancer = ImageEnhance.Contrast(cropped)
cropped = enhancer.enhance(1.08)

# 3. Slight color saturation boost
enhancer = ImageEnhance.Color(cropped)
cropped = enhancer.enhance(1.1)

# Save as JPEG (smaller, web-friendly)
cropped.save(OUT, "JPEG", quality=92, optimize=True)
print(f"Saved to: {OUT}")
print(f"File size: {os.path.getsize(OUT)} bytes")

# Also save a PNG version as backup
out_png = "/home/z/my-project/public/photo.png"
cropped.save(out_png, "PNG", optimize=True)
print(f"PNG saved to: {out_png}")
