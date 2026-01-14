#!/usr/bin/env python3
"""Update Key of D album to Digressions with new cover art"""

import os
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TALB, APIC, Encoding

# Files to update
mp3_files = ['library/key-of-d.mp3']
cover_art_path = 'library/art/digressions.jpg'

# Load cover art
with open(cover_art_path, 'rb') as f:
    cover_data = f.read()

print("Updating album metadata to 'Digressions'...\n")

for mp3_file in mp3_files:
    if not os.path.exists(mp3_file):
        print(f"  ✗ File not found: {mp3_file}")
        continue
    
    try:
        # Load MP3
        audio = MP3(mp3_file, ID3=ID3)
        
        if audio.tags is None:
            audio.add_tags()
        
        # Update album name
        audio.tags['TALB'] = TALB(encoding=Encoding.UTF8, text='Digressions')
        
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
        print(f"  ✓ Updated {mp3_file}")
        
    except Exception as e:
        print(f"  ✗ Error processing {mp3_file}: {e}")

print("\n✓ Completed!")
