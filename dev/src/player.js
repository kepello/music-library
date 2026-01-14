// Import music-metadata for proper SYLT support
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer;
import * as mm from 'music-metadata';
import { albums, loadAlbums } from './albums.js';

// Music Player JavaScript

class MusicPlayer {
  constructor() {
    this.albums = [];
    this.currentAlbum = null;
    this.currentTrackIndex = 0;
    this.isPlaying = false;
    this.shuffle = false;
    this.repeat = false;
    this.repeatOne = false; // New: repeat single track
    this.shuffledIndices = [];
    this.viewState = "collection"; // collection, album, track
    this.playQueue = []; // Array of {album, trackIndex}
    this.queuePosition = 0;
    this.playContext = "none"; // none, collection, album, track

    this.audio = document.getElementById("audioPlayer");
    this.mainContainer = document.getElementById("mainContainer");
    this.albumSelection = document.getElementById("albumSelection");
    this.albumsGrid = document.getElementById("albumsGrid");
    this.albumDetailView = document.getElementById("albumDetailView");
    this.albumCoverArt = document.getElementById("albumCoverArt");
    this.albumTitleInline = document.getElementById("albumTitleInline");
    this.albumSubtitleInline = document.getElementById("albumSubtitleInline");
    this.albumDescription = document.getElementById("albumDescription");
    this.trackList = document.getElementById("trackList");
    this.trackDetailView = document.getElementById("trackDetailView");
    this.trackCoverArt = document.getElementById("trackCoverArt");
    this.trackTitleInline = document.getElementById("trackTitleInline");
    this.trackSubtitleInline = document.getElementById("trackSubtitleInline");
    this.trackDescription = document.getElementById("trackDescription");
    this.trackDetailPlayBtn = document.getElementById("trackDetailPlayBtn");
    this.trackDetailDownloadBtn = document.getElementById("trackDetailDownloadBtn");
    this.trackDetailShareBtn = document.getElementById("trackDetailShareBtn");
    this.lyricsContainer = document.getElementById("lyricsContainer");
    this.lyricsPanel = document.getElementById("lyricsPanel");
    this.currentLyricLine = document.getElementById("currentLyricLine");
    this.trackLyricsContent = document.getElementById("trackLyricsContent");

    // Collapsible header elements
    this.collectionHeaderSection = document.getElementById("collectionHeaderSection");
    this.collectionCollapseBtn = document.getElementById("collectionCollapseBtn");
    this.albumHeaderSection = document.getElementById("albumHeaderSection");
    this.albumCollapseBtn = document.getElementById("albumCollapseBtn");
    this.trackHeaderSection = document.getElementById("trackHeaderSection");
    this.trackCollapseBtn = document.getElementById("trackCollapseBtn");

    // Persistent player elements
    this.persistentPlayer = document.getElementById("persistentPlayer");
    this.persistentCoverArt = document.getElementById("persistentCoverArt");
    this.persistentTrackTitle = document.getElementById("persistentTrackTitle");
    this.persistentArtist = document.getElementById("persistentArtist");
    this.persistentPlayPauseBtn = document.getElementById("persistentPlayPauseBtn");
    this.persistentPrevBtn = document.getElementById("persistentPrevBtn");
    this.persistentNextBtn = document.getElementById("persistentNextBtn");
    this.persistentStopBtn = document.getElementById("persistentStopBtn");
    this.persistentShuffleBtn = document.getElementById("persistentShuffleBtn");
    this.persistentRepeatBtn = document.getElementById("persistentRepeatBtn");
    this.persistentLyricsBtn = document.getElementById("persistentLyricsBtn");
    this.persistentProgressBar = document.getElementById("persistentProgressBar");
    this.persistentCurrentTime = document.getElementById("persistentCurrentTime");
    this.persistentDuration = document.getElementById("persistentDuration");

    // Header player controls
    this.headerPlayPauseBtn = document.getElementById("headerPlayPauseBtn");
    this.headerPrevBtn = document.getElementById("headerPrevBtn");
    this.headerNextBtn = document.getElementById("headerNextBtn");
    this.headerStopBtn = document.getElementById("headerStopBtn");
    this.headerShuffleBtn = document.getElementById("headerShuffleBtn");
    this.headerRepeatBtn = document.getElementById("headerRepeatBtn");
    this.headerProgressBar = document.getElementById("headerProgressBar");
    this.headerCurrentTime = document.getElementById("headerCurrentTime");
    this.headerDuration = document.getElementById("headerDuration");

    // Breadcrumb elements
    this.breadcrumbs = document.getElementById("breadcrumbs");
    this.breadcrumbHome = document.getElementById("breadcrumbHome");
    this.breadcrumbHomeImg = document.getElementById("breadcrumbHomeImg");
    this.breadcrumbSeparator1 = document.getElementById("breadcrumbSeparator1");
    this.breadcrumbAlbumContainer = document.getElementById("breadcrumbAlbumContainer");
    this.breadcrumbAlbum = document.getElementById("breadcrumbAlbum");
    this.breadcrumbAlbumImg = document.getElementById("breadcrumbAlbumImg");
    this.breadcrumbAlbumText = document.getElementById("breadcrumbAlbumText");
    this.albumDropdown = document.getElementById("albumDropdown");
    this.breadcrumbSeparator2 = document.getElementById("breadcrumbSeparator2");
    this.breadcrumbTrackContainer = document.getElementById("breadcrumbTrackContainer");
    this.breadcrumbTrack = document.getElementById("breadcrumbTrack");
    this.breadcrumbTrackImg = document.getElementById("breadcrumbTrackImg");
    this.breadcrumbTrackText = document.getElementById("breadcrumbTrackText");
    this.trackDropdown = document.getElementById("trackDropdown");

    this.initializePlayer();
  }

  async initializePlayer() {
    // Load albums dynamically from MP3 metadata
    this.albums = await loadAlbums();

    // Show persistent player bar
    if (this.persistentPlayer) {
      this.persistentPlayer.style.display = "flex";
    }

    // Populate album grid
    this.displayAlbumGrid();

    // Handle URL parameters for shared links or set initial state
    const params = new URLSearchParams(window.location.search);
    if (params.has('album')) {
      this.handleURLParameters();
    } else {
      // Set initial state for home page
      history.replaceState({ view: 'collection' }, '', window.location.pathname);
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', (e) => {
      if (e.state) {
        this.navigateToState(e.state, false);
      } else {
        this.showAlbumSelection();
      }
    });

    // Persistent player event listeners
    if (this.persistentPlayPauseBtn) {
      this.persistentPlayPauseBtn.addEventListener("click", () => this.togglePlayPause());
    }
    if (this.persistentPrevBtn) {
      this.persistentPrevBtn.addEventListener("click", () => this.previousTrack());
    }
    if (this.persistentNextBtn) {
      this.persistentNextBtn.addEventListener("click", () => this.nextTrack());
    }
    if (this.persistentStopBtn) {
      this.persistentStopBtn.addEventListener("click", () => this.stopPlayback());
    }
    if (this.persistentShuffleBtn) {
      this.persistentShuffleBtn.addEventListener("click", () => this.toggleShuffle());
    }
    if (this.persistentRepeatBtn) {
      this.persistentRepeatBtn.addEventListener("click", () => this.toggleRepeat());
    }
    if (this.persistentLyricsBtn) {
      this.persistentLyricsBtn.addEventListener("click", () => this.toggleLyrics());
    }
    if (this.persistentProgressBar) {
      this.persistentProgressBar.addEventListener("input", () => this.seekFromPersistent());
    }

    // Header player event listeners
    if (this.headerPlayPauseBtn) {
      this.headerPlayPauseBtn.addEventListener("click", () => this.togglePlayPause());
    }
    if (this.headerPrevBtn) {
      this.headerPrevBtn.addEventListener("click", () => this.previousTrack());
    }
    if (this.headerNextBtn) {
      this.headerNextBtn.addEventListener("click", () => this.nextTrack());
    }
    if (this.headerStopBtn) {
      this.headerStopBtn.addEventListener("click", () => this.stopPlayback());
    }
    if (this.headerShuffleBtn) {
      this.headerShuffleBtn.addEventListener("click", () => this.toggleShuffle());
    }
    if (this.headerRepeatBtn) {
      this.headerRepeatBtn.addEventListener("click", () => this.toggleRepeat());
    }
    if (this.headerProgressBar) {
      this.headerProgressBar.addEventListener("input", () => this.seekFromHeader());
    }

    // Track detail action buttons
    if (this.trackDetailPlayBtn) {
      this.trackDetailPlayBtn.addEventListener("click", () => this.toggleTrackDetailPlay());
    }
    if (this.trackDetailDownloadBtn) {
      this.trackDetailDownloadBtn.addEventListener("click", () => this.downloadAudio());
    }
    if (this.trackDetailShareBtn) {
      this.trackDetailShareBtn.addEventListener("click", () => this.shareCurrentView());
    }

    // Breadcrumb listeners
    this.breadcrumbHome.addEventListener("click", () =>
      this.showAlbumSelection()
    );
    this.breadcrumbAlbum.addEventListener("click", () => {
      if (this.viewState === "track" && this.currentAlbum) {
        // Navigate back to album view from track view
        this.showAlbumView();
      }
    });

    // Collapse button listeners
    if (this.collectionCollapseBtn) {
      this.collectionCollapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.collectionHeaderSection.classList.toggle("collapsed");
      });
    }
    if (this.albumCollapseBtn) {
      this.albumCollapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.albumHeaderSection.classList.toggle("collapsed");
      });
    }
    if (this.trackCollapseBtn) {
      this.trackCollapseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.trackHeaderSection.classList.toggle("collapsed");
      });
    }

    // Download listener
    if (this.downloadAlbumBtn) {
      this.downloadAlbumBtn.addEventListener("click", () => this.downloadAlbum());
    }

    // Audio event listeners
    this.audio.addEventListener("timeupdate", () => this.updateProgress());
    this.audio.addEventListener("loadedmetadata", () => this.updateDuration());
    this.audio.addEventListener("ended", () => this.handleTrackEnd());
    this.audio.addEventListener("play", () => this.updatePlayButton(true));
    this.audio.addEventListener("pause", () => this.updatePlayButton(false));
  }

  handleURLParameters() {
    const params = new URLSearchParams(window.location.search);
    const albumId = params.get('album');
    const trackIndex = params.get('track');

    if (albumId) {
      this.loadAlbum(albumId);
      
      // If track parameter exists, load that track
      if (trackIndex !== null) {
        // Wait a bit for album to load, then load track
        setTimeout(() => {
          const index = parseInt(trackIndex, 10);
          if (!isNaN(index) && index >= 0 && this.currentAlbum && index < this.currentAlbum.tracks.length) {
            this.loadTrack(index);
          }
        }, 100);
      }
    }
  }

  displayAlbumGrid() {
    this.albumsGrid.innerHTML = "";
    
    // Set view state for initial load
    this.viewState = "collection";
    this.updateBreadcrumbs();

    this.albums.forEach((album) => {
      const card = document.createElement("div");
      card.className = "album-card";

      // Album cover image and content wrapped in body for click handling
      const body = document.createElement("div");
      body.className = "album-card-body";
      body.addEventListener("click", () => this.loadAlbum(album.id));

      const img = document.createElement("img");
      img.className = "album-card-image";
      img.alt = album.title;

      // Use cover from MP3 metadata (already extracted and stored as blob URL)
      if (album.cover) {
        img.src = album.cover;
      } else {
        // Show a gradient placeholder if no cover art
        img.style.display = "none";
        card.style.background =
          "linear-gradient(135deg, #8b9a9d 0%, #6b7d80 100%)";
      }

      // Image container (no overlay)
      const imageContainer = document.createElement("div");
      imageContainer.className = "album-card-image-container";
      imageContainer.appendChild(img);

      // Title and subtitle below image
      const cardInfo = document.createElement("div");
      cardInfo.className = "album-card-info";

      const title = document.createElement("h3");
      title.className = "album-card-title";
      title.textContent = album.title;

      const subtitle = document.createElement("p");
      subtitle.className = "album-card-subtitle";
      subtitle.textContent = album.subtitle;

      cardInfo.appendChild(title);
      if (album.subtitle) {
        cardInfo.appendChild(subtitle);
      }

      body.appendChild(imageContainer);
      body.appendChild(cardInfo);
      card.appendChild(body);
      this.albumsGrid.appendChild(card);
    });
  }

  showAlbumSelection() {
    this.viewState = "collection";
    this.mainContainer.classList.add("album-view");
    this.albumSelection.style.display = "block";
    this.albumDetailView.style.display = "none";
    this.trackDetailView.style.display = "none";

    // Update URL without triggering popstate
    const url = window.location.pathname;
    history.pushState({ view: 'collection' }, '', url);

    // Update breadcrumbs for collection view
    this.updateBreadcrumbs();

    // Don't pause playback when navigating
    // this.audio.pause();
  }

  async updateBreadcrumbs() {
    if (this.viewState === "collection") {
      // Hide breadcrumbs on main page
      this.breadcrumbs.style.display = "none";
      return;
    }
    
    // Show breadcrumbs for other views
    this.breadcrumbs.style.display = "flex";

    if (this.viewState === "album") {
      // Show: Inside Out : Album Name
      this.breadcrumbSeparator1.style.display = "inline";
      this.breadcrumbAlbumContainer.style.display = "inline-block";
      this.breadcrumbAlbumText.textContent = this.currentAlbum.title;
      
      // Set album image
      if (this.currentAlbum.cover) {
        this.breadcrumbAlbumImg.src = this.currentAlbum.cover;
      }
      
      // Populate album dropdown
      this.populateAlbumDropdown();
      
      this.breadcrumbSeparator2.style.display = "none";
      this.breadcrumbTrackContainer.style.display = "none";
    } else if (this.viewState === "track") {
      // Show: Inside Out : Album Name : Track Name
      const track = this.currentAlbum.tracks[this.currentTrackIndex];
      
      // Load track metadata
      const absoluteUrl = new URL(track.audio, window.location.href).href;
      const metadata = await this.extractMetadataFromMP3(absoluteUrl);
      
      this.breadcrumbSeparator1.style.display = "inline";
      this.breadcrumbAlbumContainer.style.display = "inline-block";
      this.breadcrumbAlbumText.textContent = this.currentAlbum.title;
      
      // Set album image
      if (this.currentAlbum.cover) {
        this.breadcrumbAlbumImg.src = this.currentAlbum.cover;
      }
      
      this.breadcrumbSeparator2.style.display = "inline";
      this.breadcrumbTrackContainer.style.display = "inline-block";
      this.breadcrumbTrackText.textContent = metadata.title || `Track ${this.currentTrackIndex + 1}`;
      
      // Set track image
      const trackCoverUrl = await this.extractCoverArt(track.audio);
      if (trackCoverUrl) {
        this.breadcrumbTrackImg.src = trackCoverUrl;
      }
      
      // Populate dropdowns
      this.populateAlbumDropdown();
      this.populateTrackDropdown();
    }
  }

  populateAlbumDropdown() {
    if (!this.albumDropdown) return;
    
    this.albumDropdown.innerHTML = "";
    this.albums.forEach(album => {
      const item = document.createElement("div");
      item.className = "breadcrumb-dropdown-item";
      
      const img = document.createElement("img");
      img.src = album.cover || "library/library.png";
      img.alt = album.title;
      
      const text = document.createElement("span");
      text.textContent = album.title;
      
      item.appendChild(img);
      item.appendChild(text);
      
      if (album.id === this.currentAlbum?.id) {
        item.style.fontWeight = "600";
        item.style.background = "rgba(255,255,255,0.1)";
      }
      
      item.addEventListener("click", () => {
        this.loadAlbum(album.id);
      });
      
      this.albumDropdown.appendChild(item);
    });
  }

  populateTrackDropdown() {
    if (!this.trackDropdown || !this.currentAlbum) return;
    
    this.trackDropdown.innerHTML = "";
    this.currentAlbum.tracks.forEach((track, index) => {
      const item = document.createElement("div");
      item.className = "breadcrumb-dropdown-item";
      
      // Use a placeholder for track image (will be async loaded)
      const img = document.createElement("img");
      img.src = this.currentAlbum.cover || "library/library.png";
      img.alt = "";
      
      const text = document.createElement("span");
      text.textContent = track.title || `Track ${index + 1}`;
      
      // Load actual track metadata asynchronously
      this.extractMetadataFromMP3(new URL(track.audio, window.location.href).href).then(metadata => {
        text.textContent = metadata.title || track.title || `Track ${index + 1}`;
      });
      
      item.appendChild(img);
      item.appendChild(text);
      
      if (index === this.currentTrackIndex) {
        item.style.fontWeight = "600";
        item.style.background = "rgba(255,255,255,0.1)";
      }
      
      item.addEventListener("click", () => {
        this.showTrackDetail(index);
      });
      
      this.trackDropdown.appendChild(item);
    });
  }

  toggleLyrics() {
    if (!this.lyricsPanel) return;
    const isActive = this.lyricsPanel.classList.toggle("active");
    
    // Update button title and symbol
    if (this.persistentLyricsBtn) {
      this.persistentLyricsBtn.title = isActive ? "Collapse Lyrics" : "Expand Lyrics";
      this.persistentLyricsBtn.textContent = isActive ? "▼" : "▲";
    }
  }

  updateTrackListHighlight() {
    if (!this.trackList || !this.currentAlbum) return;
    
    // Remove active class from all tracks
    const trackItems = this.trackList.querySelectorAll("li");
    trackItems.forEach(item => item.classList.remove("active"));
    
    // Add active class to current track
    if (trackItems[this.currentTrackIndex]) {
      trackItems[this.currentTrackIndex].classList.add("active");
    }
  }

  toggleTrackDetailPlay() {
    const track = this.currentAlbum.tracks[this.currentTrackIndex];
    const trackUrl = new URL(track.audio, window.location.href).href;
    const isCurrentTrack = this.audio.src === trackUrl;
    
    if (isCurrentTrack && !this.audio.paused) {
      // Currently playing this track - pause it
      this.audio.pause();
      this.isPlaying = false;
      this.updatePlayButton(false);
      this.updateTrackDetailPlayButton(false);
    } else if (isCurrentTrack && this.audio.paused) {
      // This track is loaded but paused - resume it
      this.audio.play();
      this.isPlaying = true;
      this.updatePlayButton(true);
      this.updateTrackDetailPlayButton(true);
    } else {
      // Different track or nothing loaded - play this track
      this.loadTrack(this.currentTrackIndex);
      this.updateTrackDetailPlayButton(true);
    }
  }

  updateTrackDetailPlayButton(playing) {
    if (this.trackDetailPlayBtn) {
      this.trackDetailPlayBtn.textContent = playing ? "⏸" : "▶";
      this.trackDetailPlayBtn.title = playing ? "Pause" : "Play";
    }
  }

  navigateToState(state, skipHistory = true) {
    if (state.view === 'collection') {
      // Need to reset without pushing history
      this.viewState = "collection";
      this.mainContainer.classList.add("album-view");
      this.albumSelection.style.display = "block";
      this.albumDetailView.style.display = "none";
      this.trackDetailView.style.display = "none";
      this.updateBreadcrumbs();
    } else if (state.view === 'album' && state.albumId) {
      this.loadAlbum(state.albumId, skipHistory);
    } else if (state.view === 'track' && state.albumId && state.trackIndex !== undefined) {
      // Need to ensure album is loaded first
      if (!this.currentAlbum || this.currentAlbum.id !== state.albumId) {
        this.loadAlbum(state.albumId, true).then(() => {
          this.showTrackDetail(state.trackIndex, skipHistory);
        });
      } else {
        this.showTrackDetail(state.trackIndex, skipHistory);
      }
    }
  }

  async loadAlbum(albumId, skipHistory = false) {
    if (!albumId) {
      return;
    }

    // Hide album selection and header, show album detail
    this.mainContainer.classList.remove("album-view");
    this.albumSelection.style.display = "none";
    this.albumDetailView.style.display = "block";
    this.trackDetailView.style.display = "none";

    this.currentAlbum = this.albums.find((album) => album.id === albumId);
    this.currentTrackIndex = 0;
    this.shuffledIndices = [];

    // Set view state
    this.viewState = "album";

    // Update URL without triggering popstate
    if (!skipHistory) {
      const url = `?album=${albumId}`;
      history.pushState({ view: 'album', albumId }, '', url);
    }

    // Display album info - title and subtitle in both inline and content areas
    this.albumTitleInline.textContent = this.currentAlbum.title;
    this.albumSubtitleInline.textContent = this.currentAlbum.subtitle || '';
    
    if (this.currentAlbum.subtitle) {
      this.albumSubtitleInline.style.display = "block";
    } else {
      this.albumSubtitleInline.style.display = "none";
    }

    if (this.currentAlbum.description) {
      this.albumDescription.innerHTML = this.formatDescription(
        this.currentAlbum.description
      );
      this.albumDescription.style.display = "block";
    } else {
      this.albumDescription.style.display = "none";
    }

    // Use album cover from MP3 metadata
    if (this.currentAlbum.cover) {
      this.albumCoverArt.src = this.currentAlbum.cover;
      this.albumCoverArt.style.display = "block";
    } else {
      this.albumCoverArt.style.display = "none";
    }

    // Populate track list
    this.trackList.innerHTML = "";
    
    // Load all track titles from MP3 files
    const trackPromises = this.currentAlbum.tracks.map(async (track, index) => {
      const absoluteUrl = new URL(track.audio, window.location.href).href;
      const metadata = await this.extractMetadataFromMP3(absoluteUrl);
      return {
        index,
        title: metadata.title || `Track ${index + 1}`,
        trackNumber: metadata.trackNumber,
        ...track
      };
    });
    
    const tracksWithTitles = await Promise.all(trackPromises);
    
    tracksWithTitles.forEach((track, index) => {
      const li = document.createElement("li");
      
      const trackNumber = document.createElement("span");
      trackNumber.className = "track-number";
      trackNumber.textContent = track.trackNumber || (index + 1);
      
      const trackInfo = document.createElement("div");
      trackInfo.className = "track-info";
      
      const trackTitle = document.createElement("div");
      trackTitle.className = "track-title";
      trackTitle.textContent = track.title;
      trackInfo.appendChild(trackTitle);
      
      const duration = document.createElement("div");
      duration.className = "track-duration";
      duration.textContent = track.duration || "";
      
      const trackActions = document.createElement("div");
      trackActions.className = "track-actions";
      
      const playBtn = document.createElement("button");
      playBtn.className = "track-action-btn";
      playBtn.textContent = "▶";
      playBtn.title = "Play";
      playBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.loadTrack(index);
      });
      
      const downloadBtn = document.createElement("button");
      downloadBtn.className = "track-action-btn";
      downloadBtn.textContent = "⬇";
      downloadBtn.title = "Download";
      downloadBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.downloadTrackByIndex(index);
      });
      
      const shareBtn = document.createElement("button");
      shareBtn.className = "track-action-btn";
      shareBtn.textContent = "⬆";
      shareBtn.title = "Share";
      shareBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.shareTrackByIndex(index);
      });
      
      trackActions.appendChild(playBtn);
      trackActions.appendChild(downloadBtn);
      trackActions.appendChild(shareBtn);
      
      li.appendChild(trackNumber);
      li.appendChild(trackInfo);
      li.appendChild(duration);
      li.appendChild(trackActions);
      
      li.addEventListener("click", () => this.showTrackDetail(index));
      this.trackList.appendChild(li);
    });

    // Update breadcrumbs
    this.updateBreadcrumbs();
    
    // Update track list highlighting if currently playing this album
    this.updateTrackListHighlight();
  }

  showAlbumView() {
    this.viewState = "album";
    this.albumDetailView.style.display = "block";
    this.trackDetailView.style.display = "none";
    this.updateBreadcrumbs();
    
    // Update URL when going back to album view from track
    const url = `?album=${this.currentAlbum.id}`;
    history.pushState({ view: 'album', albumId: this.currentAlbum.id }, '', url);
  }

  async showTrackDetail(index, skipHistory = false) {
    this.currentTrackIndex = index;
    const track = this.currentAlbum.tracks[index];

    // Update view state and UI
    this.viewState = "track";
    this.albumDetailView.style.display = "none";
    this.trackDetailView.style.display = "block";

    // Update URL without triggering popstate
    if (!skipHistory) {
      const url = `?album=${this.currentAlbum.id}&track=${index}`;
      history.pushState({ view: 'track', albumId: this.currentAlbum.id, trackIndex: index }, '', url);
    }

    // Load metadata from MP3 file
    const absoluteUrl = new URL(track.audio, window.location.href).href;
    const metadata = await this.extractMetadataFromMP3(absoluteUrl);
    
    // Update track detail content with MP3 metadata - inline headers
    this.trackTitleInline.textContent = metadata.title || track.title || "Unknown Track";
    this.trackSubtitleInline.textContent = metadata.subtitle || '';
    
    if (metadata.subtitle) {
      this.trackSubtitleInline.style.display = "block";
    } else {
      this.trackSubtitleInline.style.display = "none";
    }

    if (metadata.description) {
      this.trackDescription.innerHTML = this.formatDescription(metadata.description);
      this.trackDescription.style.display = "block";
    } else {
      this.trackDescription.style.display = "none";
    }

    // Load track cover art from MP3
    this.extractCoverArt(track.audio).then(coverUrl => {
      if (coverUrl) {
        this.trackCoverArt.src = coverUrl;
      }
    });

    // Load and display lyrics in the track content section
    this.loadAndDisplayLyricsInTrackView(track);

    // Update breadcrumbs
    this.updateBreadcrumbs();

    // Update track list highlighting
    const trackItems = this.trackList.querySelectorAll("li");
    trackItems.forEach((item, i) => {
      item.classList.toggle("active", i === index);
    });

    // Update track detail play button state
    this.updateTrackDetailPlayButton(this.isPlaying && !this.audio.paused);

    // Load track (but don't auto-play)
    this.loadTrackWithoutPlaying(index);
  }

  loadTrackWithoutPlaying(index) {
    if (!this.currentAlbum) return;

    const track = this.currentAlbum.tracks[index];
    const wasPlaying = this.isPlaying && !this.audio.paused;
    
    // If something is already playing, don't touch the audio at all
    // Just update the current track index for navigation purposes
    if (wasPlaying) {
      // Only update the viewed track index, but keep the audio playing
      // Don't change currentTrackIndex which tracks what's actually playing
      return;
    }
    
    // Nothing is playing, so we can safely load this track
    this.currentTrackIndex = index;

    // Set audio source
    this.audio.src = track.audio;
    
    // Load lyrics from MP3 metadata
    this.loadAndDisplayLyrics(track);
    
    // Update persistent player display
    this.updatePersistentPlayer();
  }

  loadTrack(index) {
    if (!this.currentAlbum) return;

    this.currentTrackIndex = index;
    const track = this.currentAlbum.tracks[index];

    // Set audio source
    this.audio.src = track.audio;

    // Load lyrics from MP3 metadata
    this.loadAndDisplayLyrics(track);

    // Update persistent player display
    this.updatePersistentPlayer();
    
    // Update track list highlighting
    this.updateTrackListHighlight();

    // Auto play
    this.audio.play();
    this.isPlaying = true;
    this.updatePlayButton(true);
  }

  async loadAndDisplayLyrics(track) {
    // Extract lyrics from MP3 file only (no JSON fallback)
    const absoluteUrl = new URL(track.audio, window.location.href).href;
    const mp3Lyrics = await this.extractLyricsFromMP3(absoluteUrl);
    
    if (mp3Lyrics && mp3Lyrics.length > 0) {
      console.log("✓ Using lyrics from MP3 file");
      this.displayLyrics(mp3Lyrics);
    } else {
      console.log("✗ No lyrics available in MP3");
      this.displayLyrics([]);
    }
  }

  async loadAndDisplayLyricsInTrackView(track) {
    // Extract lyrics from MP3 file and display in track content section
    const absoluteUrl = new URL(track.audio, window.location.href).href;
    const mp3Lyrics = await this.extractLyricsFromMP3(absoluteUrl);
    
    if (mp3Lyrics && mp3Lyrics.length > 0) {
      this.trackLyricsContent.innerHTML = "";
      mp3Lyrics.forEach((line) => {
        const p = document.createElement("p");
        if (line.text === "---") {
          const hr = document.createElement("hr");
          p.appendChild(hr);
        } else {
          p.textContent = line.text || "♪";
        }
        this.trackLyricsContent.appendChild(p);
      });
    } else {
      this.trackLyricsContent.innerHTML = '<p class="no-lyrics">No lyrics available</p>';
    }
  }

  displayLyrics(lyrics) {
    if (!lyrics || lyrics.length === 0) {
      this.lyricsContainer.innerHTML =
        '<p class="no-lyrics">No lyrics available</p>';
      return;
    }

    this.lyricsContainer.innerHTML = "";
    lyrics.forEach((line, index) => {
      const p = document.createElement("p");
      p.className = "lyrics-line";

      // Check if line is a separator
      if (line.text === "---") {
        const hr = document.createElement("hr");
        p.appendChild(hr);
      } else {
        p.textContent = line.text || "♪";
      }

      p.dataset.time = line.time;
      p.dataset.index = index;
      this.lyricsContainer.appendChild(p);
    });
  }

  updateProgress() {
    const currentTime = this.audio.currentTime;
    const duration = this.audio.duration;

    if (duration) {
      // Update both persistent and header player progress
      const progressValue = (currentTime / duration) * 100;
      const currentTimeText = this.formatTime(currentTime);
      const durationText = this.formatTime(duration);
      
      if (this.persistentProgressBar) {
        this.persistentProgressBar.value = progressValue;
        this.persistentCurrentTime.textContent = currentTimeText;
        this.persistentDuration.textContent = durationText;
      }
      
      if (this.headerProgressBar) {
        this.headerProgressBar.value = progressValue;
        this.headerCurrentTime.textContent = currentTimeText;
        this.headerDuration.textContent = durationText;
      }

      // Update synchronized lyrics
      this.updateLyrics(currentTime);
    }
  }

  updateLyrics(currentTime) {
    const lines = this.lyricsContainer.querySelectorAll(".lyrics-line");
    let activeIndex = -1;
    let currentLyricText = "";

    lines.forEach((line, index) => {
      const lineTime = parseFloat(line.dataset.time);
      const nextLine = lines[index + 1];
      const nextTime = nextLine ? parseFloat(nextLine.dataset.time) : Infinity;

      if (currentTime >= lineTime && currentTime < nextTime) {
        activeIndex = index;
        // Get the text content for inline display (skip separators)
        if (!line.querySelector("hr")) {
          currentLyricText = line.textContent || "";
        }
      }
    });

    // Update inline current lyric line
    if (this.currentLyricLine) {
      this.currentLyricLine.textContent = currentLyricText;
    }

    lines.forEach((line, index) => {
      line.classList.remove("active", "past");
      if (index === activeIndex) {
        line.classList.add("active");
        // Scroll active line into view
        line.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (index < activeIndex) {
        line.classList.add("past");
      }
    });
  }

  updateDuration() {
    if (this.persistentDuration) {
      this.persistentDuration.textContent = this.formatTime(this.audio.duration);
    }
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  seek() {
    // This function is no longer used since we only have persistent player progress bar
    // Keeping it for compatibility but it's handled by seekFromPersistent
  }

  togglePlayPause() {
    if (this.audio.paused) {
      // If no queue exists, build one based on current context
      if (this.playQueue.length === 0) {
        this.startPlaybackFromContext();
      } else {
        this.audio.play();
        this.isPlaying = true;
      }
    } else {
      this.audio.pause();
      this.isPlaying = false;
    }
  }

  startPlaybackFromContext() {
    // Determine what to play based on current view
    if (this.viewState === "collection") {
      this.playAllAlbums();
    } else if (this.viewState === "album") {
      this.playCurrentAlbum();
    } else if (this.viewState === "track") {
      this.playCurrentTrack();
    }
  }

  updatePlayButton(playing) {
    const text = playing ? "⏸" : "▶";
    const title = playing ? "Pause" : "Play";
    if (this.persistentPlayPauseBtn) {
      this.persistentPlayPauseBtn.textContent = text;
      this.persistentPlayPauseBtn.title = title;
    }
    if (this.headerPlayPauseBtn) {
      this.headerPlayPauseBtn.textContent = text;
      this.headerPlayPauseBtn.title = title;
    }
  }

  stopPlayback() {
    // Stop audio and reset everything
    this.audio.pause();
    this.audio.currentTime = 0;
    this.audio.src = "";
    this.isPlaying = false;
    
    // Reset play button
    this.updatePlayButton(false);
    
    // Clear persistent player display
    if (this.persistentTrackTitle) {
      this.persistentTrackTitle.textContent = "Ready to play";
    }
    if (this.persistentArtist) {
      this.persistentArtist.textContent = "Press play to start";
    }
    if (this.persistentCoverArt) {
      this.persistentCoverArt.style.display = "none";
      this.persistentCoverArt.src = "";
    }
    
    // Clear lyrics
    if (this.currentLyricLine) {
      this.currentLyricLine.textContent = "";
    }
    if (this.lyricsContainer) {
      this.lyricsContainer.innerHTML = '<p class="no-lyrics">No lyrics available</p>';
    }
    
    // Reset progress bar
    if (this.persistentProgressBar) {
      this.persistentProgressBar.value = 0;
    }
    if (this.persistentCurrentTime) {
      this.persistentCurrentTime.textContent = "0:00";
    }
    if (this.persistentDuration) {
      this.persistentDuration.textContent = "0:00";
    }
    
    // Clear play queue
    this.playQueue = [];
    this.queuePosition = 0;
    
    // Update track detail play button if visible
    this.updateTrackDetailPlayButton(false);
  }

  previousTrack() {
    if (this.playQueue.length > 0) {
      // Playing from queue - go to previous in queue
      if (this.queuePosition > 0) {
        this.queuePosition--;
        this.playFromQueue();
      } else if (this.repeat) {
        // Wrap to end of queue
        this.queuePosition = this.playQueue.length - 1;
        this.playFromQueue();
      }
    } else {
      // Fallback: use old navigation if no queue
      if (!this.currentAlbum) return;

      if (this.shuffle) {
        const currentPos = this.shuffledIndices.indexOf(this.currentTrackIndex);
        if (currentPos > 0) {
          this.loadTrack(this.shuffledIndices[currentPos - 1]);
        }
      } else {
        if (this.currentTrackIndex > 0) {
          this.loadTrack(this.currentTrackIndex - 1);
        } else if (this.repeat) {
          this.loadTrack(this.currentAlbum.tracks.length - 1);
        }
      }
    }
  }

  nextTrack() {
    if (this.playQueue.length > 0) {
      // Playing from queue - go to next in queue
      if (this.queuePosition < this.playQueue.length - 1) {
        this.queuePosition++;
        this.playFromQueue();
      } else if (this.repeat) {
        // Wrap to start of queue
        this.queuePosition = 0;
        this.playFromQueue();
      }
    } else {
      // Fallback: use old navigation if no queue
      if (!this.currentAlbum) return;

      if (this.shuffle) {
        const currentPos = this.shuffledIndices.indexOf(this.currentTrackIndex);
        if (currentPos < this.shuffledIndices.length - 1) {
          this.loadTrack(this.shuffledIndices[currentPos + 1]);
        } else if (this.repeat) {
          this.generateShuffleOrder();
          this.loadTrack(this.shuffledIndices[0]);
        }
      } else {
        if (this.currentTrackIndex < this.currentAlbum.tracks.length - 1) {
          this.loadTrack(this.currentTrackIndex + 1);
        } else if (this.repeat) {
          this.loadTrack(0);
        }
      }
    }
  }

  handleTrackEnd() {
    if (this.repeatOne) {
      // Repeat the current track
      this.audio.currentTime = 0;
      this.audio.play();
    } else if (this.playQueue.length > 0) {
      // Playing from queue - advance in queue
      this.queuePosition++;
      this.playFromQueue();
    } else {
      // Legacy behavior - move to next track in current album
      this.nextTrack();
    }
  }

  toggleShuffle() {
    this.shuffle = !this.shuffle;
    if (this.persistentShuffleBtn) {
      this.persistentShuffleBtn.classList.toggle("active", this.shuffle);
    }
    if (this.headerShuffleBtn) {
      this.headerShuffleBtn.classList.toggle("active", this.shuffle);
    }

    // Rebuild queue if actively playing
    if (this.playQueue.length > 0 && this.playContext !== "none") {
      this.buildPlayQueue();
    }
  }

  toggleRepeat() {
    this.repeat = !this.repeat;
    if (this.persistentRepeatBtn) {
      this.persistentRepeatBtn.classList.toggle("active", this.repeat);
    }
    if (this.headerRepeatBtn) {
      this.headerRepeatBtn.classList.toggle("active", this.repeat);
    }
  }

  toggleRepeatOne() {
    this.repeatOne = !this.repeatOne;
  }

  generateShuffleOrder() {
    // Create array of indices
    this.shuffledIndices = Array.from(
      { length: this.currentAlbum.tracks.length },
      (_, i) => i
    );

    // Fisher-Yates shuffle
    for (let i = this.shuffledIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.shuffledIndices[i], this.shuffledIndices[j]] = [
        this.shuffledIndices[j],
        this.shuffledIndices[i],
      ];
    }

    // Make sure current track is first
    const currentPos = this.shuffledIndices.indexOf(this.currentTrackIndex);
    if (currentPos > 0) {
      [this.shuffledIndices[0], this.shuffledIndices[currentPos]] = [
        this.shuffledIndices[currentPos],
        this.shuffledIndices[0],
      ];
    }
  }

  async loadAlbumCover() {
    // Use album cover from MP3 metadata
    if (this.currentAlbum.cover) {
      this.coverArt.src = this.currentAlbum.cover;
      this.coverArt.alt = this.currentAlbum.title;
    } else {
      // Use placeholder if no cover art
      this.coverArt.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23667eea" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="24" font-family="sans-serif"%3ENo Cover Art%3C/text%3E%3C/svg%3E';
      this.coverArt.alt = "No cover art";
    }
  }

  async loadTrackCover(audioUrl) {
    // Extract cover art from the current track's MP3 file
    // Convert relative URL to absolute URL for jsmediatags
    const absoluteUrl = new URL(audioUrl, window.location.href).href;
    console.log("Loading cover from:", absoluteUrl);

    try {
      const coverUrl = await this.extractCoverArt(absoluteUrl);
      console.log("Cover URL extracted:", coverUrl ? "Success" : "None found");
      if (coverUrl) {
        this.coverArt.src = coverUrl;
        this.coverArt.alt = "Track cover art";
      } else {
        console.log("No embedded cover art, showing placeholder");
        this.coverArt.src =
          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%238b9a9d" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="18" font-family="Inter, sans-serif"%3ENo Cover Art%3C/text%3E%3C/svg%3E';
        this.coverArt.alt = "No cover art in file";
      }
    } catch (error) {
      console.error("Error extracting cover art:", error);
      this.coverArt.src =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%238b9a9d" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="rgba(255,255,255,0.8)" font-size="18" font-family="Inter, sans-serif"%3ENo Cover Art%3C/text%3E%3C/svg%3E';
      this.coverArt.alt = "No cover art in file";
    }
  }

  async extractCoverArt(audioUrl) {
    console.log("=== EXTRACTING COVER ART ===");
    console.log("Audio URL:", audioUrl);

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const metadata = await mm.parseBlob(blob, { native: true });
      
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        // Prefer track-specific artwork (APIC: with no description or type OTHER)
        // over album cover (APIC:Cover with type COVER_FRONT)
        let trackSpecificPicture = null;
        let albumCoverPicture = null;
        
        // Check all pictures to find track-specific vs album cover
        for (const picture of metadata.common.picture) {
          // Track-specific artwork typically has no description or type OTHER (0)
          if (picture.description === '' || picture.type === 'other') {
            trackSpecificPicture = picture;
          }
          // Album cover has type 'Cover (front)'
          if (picture.type === 'Cover (front)' || picture.description === 'Cover') {
            albumCoverPicture = picture;
          }
        }
        
        // Use track-specific if available, otherwise use album cover
        const picture = trackSpecificPicture || albumCoverPicture || metadata.common.picture[0];
        console.log("✓ Picture found:", picture.format, "type:", picture.type, "desc:", picture.description);
        const blobData = new Blob([picture.data], { type: picture.format });
        return URL.createObjectURL(blobData);
      }
      
      console.log("✗ No picture found");
      return null;
    } catch (error) {
      console.error("Error extracting cover art:", error);
      return null;
    }
  }

  async extractLyricsFromMP3(audioUrl) {
    console.log("=== EXTRACTING LYRICS FROM MP3 ===");
    console.log("Audio URL:", audioUrl);

    try {
      // TEST: Try MP3 SYLT directly first
      console.log("Attempting to read SYLT directly from MP3...");
      
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const metadata = await mm.parseBlob(blob, { native: true });
      
      console.log("Metadata native tags:", metadata.native);
      
      // Check for synchronized lyrics (SYLT)
      if (metadata.native && metadata.native['ID3v2.4']) {
        const id3Frames = metadata.native['ID3v2.4'];
        
        // Look for SYLT frames
        const syltFrames = id3Frames.filter(frame => frame.id === 'SYLT');
        
        if (syltFrames.length > 0) {
          console.log(`Found ${syltFrames.length} SYLT frames`);
          const firstFrame = syltFrames[0];
          console.log("First frame:", firstFrame);
          
          // Check if the frame has syncText array with timestamps
          if (firstFrame.value && firstFrame.value.syncText && Array.isArray(firstFrame.value.syncText)) {
            console.log("✓ SYLT with timestamps found in syncText!");
            const lyrics = firstFrame.value.syncText.map(item => ({
              time: item.timestamp / 1000,  // Convert ms to seconds
              text: item.text
            }));
            console.log(`✓ Loaded ${lyrics.length} lyrics from MP3 SYLT tag`);
            return lyrics;
          }
          
          console.log(`⚠ Found ${syltFrames.length} SYLT frames but timestamps not accessible`);
        }
        
        // Fallback to USLT with LRC format
        const usltFrame = id3Frames.find(frame => frame.id === 'USLT');
        if (usltFrame && usltFrame.value) {
          console.log("✓ Found USLT, parsing LRC format");
          const lyricsText = usltFrame.value.text || usltFrame.value;
          const lrcPattern = /\[(\d+):(\d+\.\d+)\](.*)/g;
          const matches = [...lyricsText.matchAll(lrcPattern)];
          
          if (matches.length > 0) {
            const lyrics = matches.map(match => {
              const minutes = parseInt(match[1]);
              const seconds = parseFloat(match[2]);
              return {
                time: minutes * 60 + seconds,
                text: match[3].trim()
              };
            });
            return lyrics;
          }
        }
      }
      
      console.log("✗ No synchronized lyrics found");
      return null;
    } catch (error) {
      console.error("Error extracting lyrics:", error);
      return null;
    }
  }

  async extractMetadataFromMP3(audioUrl) {
    console.log("=== EXTRACTING ALL METADATA FROM MP3 ===");
    console.log("Audio URL:", audioUrl);

    try {
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const metadata = await mm.parseBlob(blob);
      
      const result = {};
      
      // Extract title
      if (metadata.common.title) {
        result.title = metadata.common.title;
        console.log("✓ Title:", result.title);
      }
      
      // Extract subtitle (TIT3)
      if (metadata.native && metadata.native['ID3v2.4']) {
        const tit3Frame = metadata.native['ID3v2.4'].find(frame => frame.id === 'TIT3');
        if (tit3Frame) {
          result.subtitle = tit3Frame.value;
          console.log("✓ Subtitle:", result.subtitle);
        }
      }
      
      // Extract description from comment
      if (metadata.common.comment && metadata.common.comment.length > 0) {
        const comment = metadata.common.comment[0];
        // Handle both string and object formats
        result.description = typeof comment === 'string' ? comment : (comment.text || comment);
        if (typeof result.description === 'string') {
          console.log("✓ Description:", result.description.substring(0, 50) + '...');
        } else {
          console.log("✓ Description:", result.description);
        }
      }
      
      // Extract track number
      if (metadata.common.track && metadata.common.track.no) {
        result.trackNumber = metadata.common.track.no;
        console.log("✓ Track Number:", result.trackNumber);
      }
      
      // Extract synchronized lyrics
      const lyrics = await this.extractLyricsFromMP3(audioUrl);
      if (lyrics) {
        result.lyrics = lyrics;
        console.log(`✓ ${lyrics.length} lyric lines`);
      }
      
      return result;
    } catch (error) {
      console.error("Error extracting metadata:", error);
      return {};
    }
  }
  formatDescription(text) {
    // Convert line breaks to HTML
    return text
      .replace(/\n\n/g, "</p><p>") // Double line breaks = new paragraph
      .replace(/\n/g, "<br>") // Single line breaks = <br>
      .replace(/^/, "<p>") // Wrap in paragraph
      .replace(/$/, "</p>"); // Close paragraph
  }

  downloadLyrics() {
    if (!this.currentAlbum) return;
    const track = this.currentAlbum.tracks[this.currentTrackIndex];

    if (!track.lyrics || track.lyrics.length === 0) {
      alert("No lyrics available for this track");
      return;
    }

    // Create lyrics text file
    let lyricsText = `${track.title}\n${this.currentAlbum.title}\n\n`;
    track.lyrics.forEach((line) => {
      lyricsText += line.text + "\n";
    });

    // Create download
    const blob = new Blob([lyricsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${track.title} - Lyrics.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadAudio() {
    if (!this.currentAlbum) return;
    const track = this.currentAlbum.tracks[this.currentTrackIndex];

    // Create download link for audio file
    const a = document.createElement("a");
    a.href = track.audio;
    a.download = `${track.title}.mp3`;
    a.click();
  }

  downloadAlbum() {
    if (this.currentAlbum && this.currentAlbum.downloadUrl) {
      window.location.href = this.currentAlbum.downloadUrl;
    } else {
      this.showToast("Album download not available");
    }
  }

  downloadTrackByIndex(index) {
    if (!this.currentAlbum) return;
    const track = this.currentAlbum.tracks[index];

    // Create download link for audio file
    const a = document.createElement("a");
    a.href = track.audio;
    a.download = `${track.title}.mp3`;
    a.click();
  }

  shareTrackByIndex(index) {
    if (!this.currentAlbum) return;
    
    const url = window.location.origin + window.location.pathname + 
                `?album=${encodeURIComponent(this.currentAlbum.id)}&track=${index}`;
    
    // Copy to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.showToast("Track link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        this.showToast("Failed to copy URL to clipboard");
      });
  }

  shareCurrentView() {
    let url = window.location.origin + window.location.pathname;
    
    // Build URL based on current view state
    if (this.viewState === "album" && this.currentAlbum) {
      url += `?album=${encodeURIComponent(this.currentAlbum.id)}`;
    } else if (this.viewState === "track" && this.currentAlbum) {
      url += `?album=${encodeURIComponent(this.currentAlbum.id)}&track=${this.currentTrackIndex}`;
    }
    // For collection view, just use base URL

    // Copy to clipboard
    navigator.clipboard
      .writeText(url)
      .then(() => {
        // Show toast notification
        this.showToast("Link copied to clipboard!");

        // Show checkmark feedback on button
        if (this.persistentShareBtn) {
          const originalText = this.persistentShareBtn.textContent;
          this.persistentShareBtn.textContent = "✓";
          setTimeout(() => {
            this.persistentShareBtn.textContent = originalText;
          }, 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy URL:", err);
        this.showToast("Failed to copy URL to clipboard");
      });
  }

  showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 3000);
  }

  // === Context-Aware Playback Functions ===
  
  playAllAlbums() {
    console.log('playAllAlbums called, albums:', this.albums.length);
    this.playContext = "collection";
    this.buildPlayQueue();
    console.log('Play queue built:', this.playQueue.length, 'tracks');
    this.queuePosition = 0;
    this.playFromQueue();
  }

  playCurrentAlbum() {
    if (!this.currentAlbum) {
      console.warn('No current album');
      return;
    }
    console.log('playCurrentAlbum:', this.currentAlbum.title);
    this.playContext = "album";
    this.buildPlayQueue();
    this.queuePosition = 0;
    this.playFromQueue();
  }

  playCurrentTrack() {
    if (!this.currentAlbum) {
      console.warn('No current album');
      return;
    }
    console.log('playCurrentTrack:', this.currentAlbum.tracks[this.currentTrackIndex].title);
    this.playContext = "track";
    this.buildPlayQueue();
    this.queuePosition = 0;
    this.playFromQueue();
  }

  buildPlayQueue() {
    this.playQueue = [];

    if (this.playContext === "collection") {
      // Add all tracks from all albums
      this.albums.forEach(album => {
        album.tracks.forEach((track, trackIndex) => {
          this.playQueue.push({ album, trackIndex });
        });
      });
    } else if (this.playContext === "album") {
      // Add all tracks from current album
      this.currentAlbum.tracks.forEach((track, trackIndex) => {
        this.playQueue.push({ album: this.currentAlbum, trackIndex });
      });
    } else if (this.playContext === "track") {
      // Add only current track
      this.playQueue.push({ album: this.currentAlbum, trackIndex: this.currentTrackIndex });
    }

    // Apply shuffle if enabled
    if (this.shuffle && this.playQueue.length > 1) {
      this.shufflePlayQueue();
    }
  }

  shufflePlayQueue() {
    // Fisher-Yates shuffle
    for (let i = this.playQueue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.playQueue[i], this.playQueue[j]] = [this.playQueue[j], this.playQueue[i]];
    }
  }

  async playFromQueue() {
    if (this.queuePosition >= this.playQueue.length) {
      if (this.repeat) {
        this.queuePosition = 0;
        if (this.shuffle) {
          this.shufflePlayQueue();
        }
      } else {
        return; // End of queue
      }
    }

    const queueItem = this.playQueue[this.queuePosition];
    this.currentAlbum = queueItem.album;
    this.currentTrackIndex = queueItem.trackIndex;
    const track = this.currentAlbum.tracks[this.currentTrackIndex];

    // Update audio source - track.audio already contains full path from albums.js
    console.log('Playing from queue:', track.audio);
    this.audio.src = track.audio;
    
    // Load and display lyrics from MP3 metadata
    await this.loadAndDisplayLyrics(track);
    
    // Update persistent player display
    this.updatePersistentPlayer();
    
    // Update track list highlighting
    this.updateTrackListHighlight();

    // Play
    this.audio.play();
    this.isPlaying = true;
  }

  async updatePersistentPlayer() {
    if (!this.currentAlbum) return;

    const track = this.currentAlbum.tracks[this.currentTrackIndex];
    
    // Load track title from MP3 metadata
    const absoluteUrl = new URL(track.audio, window.location.href).href;
    const metadata = await this.extractMetadataFromMP3(absoluteUrl);
    
    this.persistentTrackTitle.textContent = metadata.title || `Track ${this.currentTrackIndex + 1}`;
    this.persistentArtist.textContent = this.currentAlbum.title;

    // Load track-specific cover art from MP3 file
    try {
      const coverUrl = await this.extractCoverArt(absoluteUrl);
      if (coverUrl) {
        this.persistentCoverArt.src = coverUrl;
        this.persistentCoverArt.style.display = "block";
      } else if (this.currentAlbum.cover) {
        // Fallback to album cover from MP3 metadata
        this.persistentCoverArt.src = this.currentAlbum.cover;
        this.persistentCoverArt.style.display = "block";
      } else {
        this.persistentCoverArt.style.display = "none";
      }
    } catch (error) {
      console.error("Error loading persistent player cover:", error);
      this.persistentCoverArt.style.display = "none";
    }
  }

  seekFromPersistent() {
    const seekTime = (this.persistentProgressBar.value / 100) * this.audio.duration;
    this.audio.currentTime = seekTime;
  }

  seekFromHeader() {
    const seekTime = (this.headerProgressBar.value / 100) * this.audio.duration;
    this.audio.currentTime = seekTime;
  }
}

// Initialize player when page loads
document.addEventListener("DOMContentLoaded", () => {
  new MusicPlayer();
});
