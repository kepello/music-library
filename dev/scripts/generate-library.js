#!/usr/bin/env node

/**
 * Automatically generate library.json from MP3 files in the library folder
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LIBRARY_DIR = path.join(__dirname, '..', '..', 'library');
const OUTPUT_FILE = path.join(LIBRARY_DIR, 'library.json');

function generateLibrary() {
    try {
        // Read the library directory
        const files = fs.readdirSync(LIBRARY_DIR);
        
        // Filter for MP3 files only, exclude library.json and other files
        const mp3Files = files
            .filter(file => file.toLowerCase().endsWith('.mp3'))
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
