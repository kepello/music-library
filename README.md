# Music Player

A static music player website for hosting albums on GitHub Pages with synchronized lyrics, shuffle, repeat, and automatic track advancement.

## Features

- 🎵 Multiple album support
- 🎨 Cover art display
- 📝 Synchronized lyrics that highlight as the song plays
- 🎮 Full playback controls (play, pause, previous, next)
- 🔀 Shuffle mode
- 🔁 Repeat mode
- ⏭️ Automatic advance to next song
- 📥 Download links for full albums
- 📱 Responsive design

## Setup Instructions

### 1. Add Your Music

The app **automatically loads albums** from JSON files! Each album folder contains its own metadata file.

Create folders in the `albums/` directory (use any folder names you want):

```
albums/
├── my-first-album/
│   ├── album.json        # Album metadata
│   ├── cover.jpg         # Cover art
│   ├── 01-song-one.mp3   # Audio files
│   ├── 02-song-two.mp3
│   └── my-first-album.zip  # (optional download)
├── summer-sessions-2025/
│   ├── album.json
│   ├── cover.jpg
│   └── ...
```

**Folder names are flexible!** Use album titles, dates, or any descriptive name. The system automatically discovers any folder containing an `album.json` file.

### 2. Configure Each Album

Edit the `album.json` file in each album folder:

```json
{
    "id": "my-first-album",
    "title": "My First Album",
    "artist": "Your Name",
    "year": 2026,
    "description": "A brief description of your album (optional)",
    "cover": "cover.jpg",
    "downloadUrl": "my-first-album.zip",
    "tracks": [
        {
            "title": "Song Title",
            "description": "What this song is about (optional)",
            "audio": "01-song.mp3",
            "lyrics": [
                { "time": 0, "text": "First line of lyrics" },
                { "time": 5, "text": "Second line at 5 seconds" },
                { "time": 10, "text": "And so on..." }
            ]
        }
    ]
}
```

**Formatting Descriptions:**
You can use line breaks and basic HTML formatting:
- `\n` for line breaks
- `\n\n` for paragraphs
- `<em>text</em>` for *italics*
- `<strong>text</strong>` for **bold**

Example with formatting:
```json
"description": "First paragraph with some text.\n\nSecond paragraph here.\n\n<em>Author, 2026</em>"
```

**Lyrics Timing:**
- `time`: Timestamp in seconds when the line should appear
- `text`: The lyric text (empty string for instrumental breaks)
- Lines automatically highlight and scroll as the song plays

### 3. Auto-Discovery (GitHub Actions)

**No manual registration needed!** When you push to GitHub, a GitHub Action automatically:
- Scans the `albums/` folder
- Finds all folders with `album.json` files
- Generates `albums-list.json` automatically
- Commits the updated file

To manually regenerate locally (optional):
```bash
node scripts/generate-albums-list.js
```

### 4. Deploy to GitHub Pages

1. Create a new GitHub repository
2. Push all files to the repository:
   `5. Adding More Albums
with any name (e.g., `albums/acoustic-sessions/`)
2. Copy `album.json` from an existing album and edit it (update the `id` field!)
3. Add your audio files, cover art, and optional zip file
4. Commit and push to GitHub

**That's it!** The GitHub Action automatically discovers your new album and updates the albums list. Use meaningful folder names - they help you stay organiz

**That's it!** The GitHub Action automatically discovers your new album and updates the albums list. No manual configuration needed!
   ```

3. Enable GitHub Pages:
   - Go to repository Settings
   - Navigate to Pages section
   - Select "main" branch as source
   - Click Save

4. Your site will be available at: `https://yourusername.github.io/your-repo/`

### 4. Adding More Albums

Simply:
1. Create a new folder in `albums/`
2. Add your audio files, cover art, and optional zip file
3. Add the album configuration to `albums.js`
4. Commit and push changes

## Automatic Discovery

The project includes a GitHub Action that automatically:
- Discovers new albums when you push to GitHub
- Validates each `album.json` file
- Generates `albums-list.json` automatically
- Commits the changes back to your repository

You can also run the discovery script locally:
```bash
node scripts/generate-albums-list.js
```

## File Formats

- **Audio**: MP3 recommended (works in all browsers)
- **Cover Art**: 
  - **Album cover**: Place a `cover.jpg` in each album folder (no need to specify in JSON)
  - **Track cover**: Automatically extracted from each MP3's embedded artwork when the song plays
  - Recommended size: 800x800px or larger
- **Downloads**: ZIP files containing audio + lyrics + cover art

## Lyrics Tips

1. Listen to your song and note timestamps for each line
2. Use a tool like Audacity to see the waveform and get precise timings
3. Test the synchronization and adjust as needed
4. Leave empty lines (`{ time: X, text: '' }`) for instrumental breaks

## Customization

- **Colors**: Edit the gradient in `styles.css` (search for `#667eea` and `#764ba2`)
- **Layout**: Modify the grid layout in `styles.css` (`.main` section)
- **Controls**: Add or modify buttons in `index.html` and `player.js`

## Browser Support

Works in all modern browsers that support:
- HTML5 Audio
- ES6 JavaScript
- CSS Grid

## License

Free to use and modify for your music!
