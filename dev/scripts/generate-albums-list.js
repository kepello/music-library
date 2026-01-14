#!/usr/bin/env node

/**
 * Automatically discover album folders and generate albums-list.json
 * This script scans the albums/ directory and finds all folders containing album.json
 */

const fs = require('fs');
const path = require('path');

const ALBUMS_DIR = path.join(__dirname, '..', 'albums');
const OUTPUT_FILE = path.join(__dirname, '..', 'albums-list.json');

function discoverAlbums() {
    const albums = [];
    
    try {
        // Read the albums directory
        const entries = fs.readdirSync(ALBUMS_DIR, { withFileTypes: true });
        
        // Find all directories that contain an album.json file
        for (const entry of entries) {
            if (entry.isDirectory()) {
                const albumJsonPath = path.join(ALBUMS_DIR, entry.name, 'album.json');
                
                // Check if album.json exists in this directory
                if (fs.existsSync(albumJsonPath)) {
                    // Validate the JSON is parseable
                    try {
                        const albumData = JSON.parse(fs.readFileSync(albumJsonPath, 'utf8'));
                        if (albumData.id && albumData.title && albumData.tracks) {
                            albums.push(entry.name);
                            console.log(`✓ Found album: ${entry.name} (${albumData.title})`);
                        } else {
                            console.warn(`⚠ Skipping ${entry.name}: album.json missing required fields (id, title, tracks)`);
                        }
                    } catch (error) {
                        console.error(`✗ Error parsing ${entry.name}/album.json:`, error.message);
                    }
                } else {
                    console.log(`⊘ Skipping ${entry.name}: no album.json found`);
                }
            }
        }
        
        // Sort albums alphabetically
        albums.sort();
        
        return albums;
    } catch (error) {
        console.error('Error reading albums directory:', error);
        return [];
    }
}

function writeAlbumsList(albums) {
    try {
        const json = JSON.stringify(albums, null, 4);
        fs.writeFileSync(OUTPUT_FILE, json + '\n', 'utf8');
        console.log(`\n✓ Generated albums-list.json with ${albums.length} album(s)`);
        return true;
    } catch (error) {
        console.error('Error writing albums-list.json:', error);
        return false;
    }
}

// Main execution
console.log('Discovering albums...\n');
const albums = discoverAlbums();

if (albums.length > 0) {
    writeAlbumsList(albums);
    console.log('\nAlbums list:');
    albums.forEach((album, index) => {
        console.log(`  ${index + 1}. ${album}`);
    });
} else {
    console.log('\n⚠ No albums found! Make sure your album folders contain valid album.json files.');
    process.exit(1);
}
