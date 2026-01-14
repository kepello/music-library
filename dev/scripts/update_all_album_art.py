#!/usr/bin/env python3
"""Update all album tracks with their respective cover art"""

import os
import glob
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, APIC, Encoding

# Album configurations
albums = [
    {
        'name': 'Overtones',
        'folder': 'library/overtone',
        'cover': 'library/art/overtones.jpg'
    },
    {
        'name': 'Deeply',
        'folder': 'library/deeply',
        'cover': 'library/art/deeply.jpg'
    }
]

for album in albums:
    print(f"\nProcessing {album['name']} album...")
    
    # Find all MP3 files
    mp3_files = glob.glob(f"{album['folder']}/*.mp3")
    
    if not os.path.exists(album['cover']):
        print(f"  ✗ Cover art not found: {album['cover']}")
        continue
    
    # Load cover art
    with open(album['cover'], 'rb') as f:
        cover_data = f.read()
    
    print(f"  Found {len(mp3_files)} track(s)")
    
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

print("\n✓ All albums processed!")
