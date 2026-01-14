#!/usr/bin/env node

/**
 * Automatically generate library.json from MP3 files in the library folder
 * Recursively searches all subdirectories
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIBRARY_DIR = path.join(__dirname, '..', '..', 'library');
const OUTPUT_FILE = path.join(LIBRARY_DIR, 'library.json');

function findMP3Files(dir, baseDir = dir) {
    let mp3Files = [];
    
    try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            
            if (entry.isDirectory()) {
                // Skip art folder and other non-music directories
                if (entry.name === 'art') continue;
                
                // Recursively search subdirectories
                mp3Files = mp3Files.concat(findMP3Files(fullPath, baseDir));
            } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.mp3')) {
                // Get relative path from library directory
                const relativePath = path.relative(baseDir, fullPath);
                mp3Files.push(relativePath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
    }
    
    return mp3Files;
}

function generateLibrary() {
    try {
        // Find all MP3 files recursively
        const mp3Files = findMP3Files(LIBRARY_DIR)
            .sort(); // Sort alphabetically for consistency
        
        console.log(`Found ${mp3Files.length} MP3 files:`);
        mp3Files.forEach(file => console.log(`  - ${file}`));
        
        // Write to library.json
        fs.writeFileSync(
            OUTPUT_FILE,
            JSON.stringify(mp3Files, null, 2) + '\n',
            'utf8'
        );
        
        console.log(`\n✓ Generated ${OUTPUT_FILE}`);
        
    } catch (error) {
        console.error('Error generating library.json:', error);
        process.exit(1);
    }
}

generateLibrary();
