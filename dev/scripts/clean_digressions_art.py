#!/usr/bin/env python3
"""Clean up duplicate APIC tags and re-embed cover art properly"""

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

print(f"Cleaning and updating cover art for {len(mp3_files)} track(s)...\n")

for mp3_file in sorted(mp3_files):
    try:
        # Load MP3
        audio = MP3(mp3_file, ID3=ID3)
        
        if audio.tags is None:
            audio.add_tags()
        
        # Remove all existing APIC tags
        apic_keys = [k for k in audio.tags.keys() if k.startswith('APIC')]
        for key in apic_keys:
            del audio.tags[key]
            print(f"  Removed old APIC tag: {key}")
        
        # Add fresh cover art
        audio.tags['APIC:Cover'] = APIC(
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
