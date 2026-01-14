#!/usr/bin/env python3
"""Restore track-specific artwork alongside album covers"""

import os
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC, Encoding, PictureType

# Track-specific artwork mapping
track_artwork = {
    'library/overtone/hope-even-for-a-tree.mp3': 'dev/tmp/recovered_art/hope-even-for-a-tree.jpg',
    'library/overtone/stop-being-anxious.mp3': 'dev/tmp/recovered_art/stop-being-anxious.png',
    'library/overtone/we-will-not-bow.mp3': 'dev/tmp/recovered_art/we-will-not-bow.jpg',
    'library/overtone/where-is-their-god.mp3': 'dev/tmp/recovered_art/where-is-their-god.jpg',
}

# Album covers (already embedded, but we'll preserve)
album_covers = {
    'Overtones': 'library/art/overtones.jpg',
    'Deeply': 'library/art/deeply.jpg',
    'Digressions': 'library/art/digressions.jpg',
}

print("Restoring track-specific artwork...\n")

for mp3_path, artwork_path in track_artwork.items():
    if not os.path.exists(mp3_path):
        print(f"  ✗ MP3 not found: {mp3_path}")
        continue
    
    if not os.path.exists(artwork_path):
        print(f"  ✗ Artwork not found: {artwork_path}")
        continue
    
    try:
        # Load MP3
        audio = MP3(mp3_path, ID3=ID3)
        
        if audio.tags is None:
            audio.add_tags()
        
        # Load track-specific artwork
        with open(artwork_path, 'rb') as f:
            track_art_data = f.read()
        
        mime = 'image/png' if artwork_path.endswith('.png') else 'image/jpeg'
        
        # Add or update APIC: (track-specific, no description)
        audio.tags['APIC:'] = APIC(
            encoding=Encoding.UTF8,
            mime=mime,
            type=PictureType.OTHER,  # Type 0 = OTHER (for track-specific art)
            desc='',  # Empty description
            data=track_art_data
        )
        
        # APIC:Cover should already exist (album cover), but verify
        if 'APIC:Cover' not in audio.tags:
            print(f"  ⚠ Warning: No album cover found in {os.path.basename(mp3_path)}")
        
        # Save
        audio.save(v2_version=4)
        print(f"  ✓ Restored track art: {os.path.basename(mp3_path)}")
        
    except Exception as e:
        print(f"  ✗ Error processing {mp3_path}: {e}")

print("\n✓ Track artwork restoration complete!")
