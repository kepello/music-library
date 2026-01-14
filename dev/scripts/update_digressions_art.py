#!/usr/bin/env python3
"""Update all Digressions album tracks with cover art"""

import os
import glob
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC, Encoding

# Cover art path
cover_art_path = 'library/art/digressions.jpg'

# Find all MP3 files in the digressions folder
mp3_files = glob.glob('library/digressions/*.mp3')

# Load cover art
with open(cover_art_path, 'rb') as f:
    cover_data = f.read()

print(f"Updating cover art for {len(mp3_files)} track(s) in Digressions album...\n")

for mp3_file in sorted(mp3_files):
    if not os.path.exists(mp3_file):
        print(f"  ✗ File not found: {mp3_file}")
        continue
    
    try:
        # Load MP3
        audio = MP3(mp3_file, ID3=ID3)
        
        if audio.tags is None:
            audio.add_tags()
        
        # Update cover art
        audio.tags['APIC'] = APIC(
            encoding=Encoding.UTF8,
            mime='image/jpeg',
            type=3,  # Cover (front)
            desc='Cover',
            data=cover_data
        )
        
        # Save
        audio.save(v2_version=4)
        print(f"  ✓ Updated {os.path.basename(mp3_file)}")
        
    except Exception as e:
        print(f"  ✗ Error processing {mp3_file}: {e}")

print("\n✓ Completed!")
