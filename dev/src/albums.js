// Albums are now loaded dynamically from MP3 files in the library folder
// This file reads all MP3s and groups them by album metadata

import * as mm from 'music-metadata';

export let albums = [];

// Extract all metadata from an MP3 file
async function extractMetadataFromMP3(audioUrl) {
  try {
    const response = await fetch(audioUrl);
    const blob = await response.blob();
    const metadata = await mm.parseBlob(blob, { native: true });
    
    const data = {};
    
    // Track info
    if (metadata.common.title) {
      data.title = metadata.common.title;
    }
    
    if (metadata.common.track && metadata.common.track.no) {
      data.trackNumber = metadata.common.track.no;
    }
    
    // Album info
    if (metadata.common.album) {
      data.album = metadata.common.album;
    }
    
    if (metadata.common.albumartist) {
      data.artist = metadata.common.albumartist;
    } else if (metadata.common.artist) {
      data.artist = metadata.common.artist;
    }
    
    if (metadata.common.year) {
      data.year = metadata.common.year;
    }
    
    // Album subtitle and description from ID3 frames
    if (metadata.native && metadata.native['ID3v2.4']) {
      const tit3Frame = metadata.native['ID3v2.4'].find(frame => frame.id === 'TIT3');
      if (tit3Frame) {
        data.subtitle = tit3Frame.value;
      }
    }
    
    if (metadata.common.comment && metadata.common.comment.length > 0) {
      const comment = metadata.common.comment[0];
      data.description = typeof comment === 'string' ? comment : (comment.text || comment);
    }
    
    // Cover art
    if (metadata.common.picture && metadata.common.picture.length > 0) {
      const picture = metadata.common.picture[0];
      const blob = new Blob([picture.data], { type: picture.format });
      data.cover = URL.createObjectURL(blob);
    }
    
    return data;
  } catch (error) {
    console.error("Error extracting metadata from MP3:", error);
    return {};
  }
}

// Load albums dynamically from library
export async function loadAlbums() {
  try {
    // Fetch the list of MP3 files
    const response = await fetch("library/library.json");
    const mp3Files = await response.json();

    // Load metadata for all MP3 files
    const trackPromises = mp3Files.map(async (filename) => {
      const trackUrl = `library/${filename}`;
      const metadata = await extractMetadataFromMP3(trackUrl);
      
      return {
        audio: trackUrl,
        filename: filename,
        ...metadata
      };
    });

    const tracks = await Promise.all(trackPromises);
    
    // Group tracks by album
    const albumsMap = new Map();
    
    tracks.forEach(track => {
      const albumName = track.album || 'Unknown Album';
      
      if (!albumsMap.has(albumName)) {
        albumsMap.set(albumName, {
          id: albumName.toLowerCase().replace(/\s+/g, '-'),
          title: albumName,
          artist: track.artist,
          year: track.year,
          subtitle: track.subtitle,
          description: track.description,
          cover: track.cover,
          tracks: []
        });
      }
      
      const album = albumsMap.get(albumName);
      album.tracks.push({
        audio: track.audio,
        title: track.title,
        trackNumber: track.trackNumber
      });
    });
    
    // Convert map to array and sort tracks by track number
    albums = Array.from(albumsMap.values()).map(album => {
      album.tracks.sort((a, b) => (a.trackNumber || 0) - (b.trackNumber || 0));
      return album;
    });
    
    return albums;
  } catch (error) {
    console.error("Failed to load library:", error);
    return [];
  }
}
