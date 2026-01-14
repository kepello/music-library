#!/usr/bin/env python3
"""Embed album-level metadata into all tracks' MP3 files"""

import os
import json
from mutagen.mp3 import MP3
from mutagen.id3 import ID3, TALB, TPE2, TIT3, COMM, APIC, TDRC, TRCK, Encoding

def embed_album_metadata(album_folder):
    """Embed album metadata from album.json into all MP3 files in the folder"""
    
    # Load album.json
    album_json_path = os.path.join("albums", album_folder, "album.json")
    
    if not os.path.exists(album_json_path):
        print(f"  ✗ No album.json found in {album_folder}")
        return False
    
    with open(album_json_path, 'r', encoding='utf-8') as f:
        album_data = json.load(f)
    
    print(f"\nProcessing album: {album_data.get('title', album_folder)}")
    
    # Get album metadata
    album_title = album_data.get('title')
    album_artist = album_data.get('artist', 'Unknown Artist')
    album_subtitle = album_data.get('subtitle')
    album_description = album_data.get('description')
    album_cover = album_data.get('cover')
    album_year = 2026  # Use 2026 for all albums
    
    # Load cover art if exists
    cover_data = None
    if album_cover:
        cover_path = os.path.join("albums", album_folder, album_cover)
        if os.path.exists(cover_path):
            with open(cover_path, 'rb') as f:
                cover_data = f.read()
            print(f"  ✓ Loaded cover art: {album_cover}")
    
    # Process each track
    tracks = album_data.get('tracks', [])
    processed = 0
    
    for track_num, track in enumerate(tracks, start=1):
        audio_file = track.get('audio')
        if not audio_file:
            continue
        
        mp3_path = os.path.join("albums", album_folder, audio_file)
        
        if not os.path.exists(mp3_path):
            print(f"  ✗ File not found: {audio_file}")
            continue
        
        try:
            # Load MP3
            audio = MP3(mp3_path, ID3=ID3)
            
            # Add ID3 tag if it doesn't exist
            if audio.tags is None:
                audio.add_tags()
            
            # Embed track number
            audio.tags['TRCK'] = TRCK(encoding=Encoding.UTF8, text=str(track_num))
            
            # Embed album metadata
            if album_title:
                audio.tags['TALB'] = TALB(encoding=Encoding.UTF8, text=album_title)
            
            if album_artist:
                audio.tags['TPE2'] = TPE2(encoding=Encoding.UTF8, text=album_artist)
            # Embed year
            audio.tags['TDRC'] = TDRC(encoding=Encoding.UTF8, text=str(album_year))
            
            
            if album_subtitle:
                audio.tags['TIT3'] = TIT3(encoding=Encoding.UTF8, text=album_subtitle)
            
            if album_description:
                audio.tags['COMM'] = COMM(
                    encoding=Encoding.UTF8,
                    lang='eng',
                    desc='',
                    text=album_description
                )
            
            if cover_data:
                # Determine mime type
                mime_type = 'image/jpeg'
                if album_cover.lower().endswith('.png'):
                    mime_type = 'image/png'
                
                audio.tags['APIC'] = APIC(
                    encoding=Encoding.UTF8,
                    mime=mime_type,
                    type=3,  # Cover (front)
                    desc='Cover',
                    data=cover_data
                )
            
            # Save
            audio.save(v2_version=4)
            processed += 1
            print(f"  ✓ {audio_file}")
            
        except Exception as e:
            print(f"  ✗ Error processing {audio_file}: {e}")
    
    print(f"  Processed {processed}/{len(tracks)} tracks")
    return True

def main():
    """Process all albums"""
    print("Embedding album metadata into MP3 files...\n")
    
    albums_dir = "albums"
    
    if not os.path.exists(albums_dir):
        print("Error: 'albums' directory not found")
        return
    
    # Get all album folders
    album_folders = [
        f for f in os.listdir(albums_dir)
        if os.path.isdir(os.path.join(albums_dir, f)) and not f.startswith('.')
    ]
    
    total_processed = 0
    
    for folder in sorted(album_folders):
        if embed_album_metadata(folder):
            total_processed += 1
    
    print(f"\n✓ Completed! Processed {total_processed} albums")

if __name__ == "__main__":
    main()
