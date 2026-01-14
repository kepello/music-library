#!/usr/bin/env python3
"""Update In an Overtone album to Overtones"""

import os
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TALB, Encoding

# All tracks in the overtone folder
mp3_files = [
    'library/overtone/hope-even-for-a-tree.mp3',
    'library/overtone/ordinary-ways.mp3',
    'library/overtone/planted.mp3',
    'library/overtone/still-in-the-valley.mp3',
    'library/overtone/stop-being-anxious.mp3',
    'library/overtone/we-will-not-bow.mp3',
    'library/overtone/where-is-their-god.mp3'
]

print("Updating album metadata to 'Overtones'...\n")

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
        audio.tags['TALB'] = TALB(encoding=Encoding.UTF8, text='Overtones')
        
        # Save
        audio.save(v2_version=4)
        print(f"  ✓ Updated {mp3_file}")
        
    except Exception as e:
        print(f"  ✗ Error processing {mp3_file}: {e}")

print("\n✓ Completed!")
