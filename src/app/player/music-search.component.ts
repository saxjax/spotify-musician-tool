import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyPlayerService, SpotifyTrack } from './spotify-player.service';
import { SpotifyUserService } from '../user/spotify-user.service';

@Component({
  selector: 'app-music-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="music-search">
      <h3>🎵 Search & Play Music</h3>

      @if (!userService.isPremium()) {
        <div class="premium-warning">
          <span class="warning-icon">⚠️</span>
          <span>Spotify Premium required to start playback from this app</span>
        </div>
      }

      <!-- Search Section -->
      <div class="search-section">
        <div class="search-input-group">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (keyup.enter)="searchTracks()"
            placeholder="Search for songs, artists, or albums..."
            class="search-input"
            [disabled]="isSearching()">
          <button
            (click)="searchTracks()"
            [disabled]="!searchQuery || isSearching()"
            class="search-btn">
            @if (isSearching()) {
              <span class="spinner"></span>
            } @else {
              🔍
            }
          </button>
        </div>
      </div>

      <!-- Device Selection -->
      @if (availableDevices().length > 0) {
        <div class="device-section">
          <label for="device-select">Play on device:</label>
          <select
            id="device-select"
            [(ngModel)]="selectedDeviceId"
            class="device-select">
            <option value="">Current active device</option>
            @for (device of availableDevices(); track device.id) {
              <option [value]="device.id">
                {{ device.name }} ({{ device.type }})
                @if (device.is_active) {
                  - Active
                }
              </option>
            }
          </select>
          <button (click)="refreshDevices()" class="refresh-devices-btn">🔄</button>
        </div>
      }

      <!-- Search Results -->
      @if (searchResults().length > 0) {
        <div class="results-section">
          <h4>Search Results ({{ searchResults().length }})</h4>
          <div class="track-list">
            @for (track of searchResults(); track track.id) {
              <div class="track-item" [class.playing]="isTrackPlaying(track)">
                <div class="track-info">
                  @if (track.album.images[0]; as image) {
                    <img [src]="image.url" [alt]="track.name" class="track-image">
                  } @else {
                    <div class="track-image-placeholder">🎵</div>
                  }

                  <div class="track-details">
                    <div class="track-name">{{ track.name }}</div>
                    <div class="track-artist">{{ getArtistNames(track) }}</div>
                    <div class="track-album">{{ track.album.name }}</div>
                    <div class="track-duration">{{ formatDuration(track.duration_ms) }}</div>
                  </div>
                </div>

                <div class="track-actions">
                  <button
                    (click)="playTrack(track)"
                    [disabled]="!userService.isPremium() || isLoading()"
                    class="play-btn"
                    [class.loading]="isLoading() && selectedTrack()?.id === track.id">
                    @if (isLoading() && selectedTrack()?.id === track.id) {
                      <span class="spinner"></span>
                    } @else if (isTrackPlaying(track)) {
                      ⏸️
                    } @else {
                      ▶️
                    }
                  </button>

                  <a [href]="track.external_urls.spotify"
                     target="_blank"
                     class="spotify-link"
                     title="Open in Spotify">
                    🔗
                  </a>
                </div>
              </div>
            }
          </div>
        </div>
      }

      @if (searchError()) {
        <div class="error-message">
          <span class="error-icon">❌</span>
          <span>{{ searchError() }}</span>
          <button (click)="clearError()" class="clear-error-btn">✕</button>
        </div>
      }

      @if (searchQuery && searchResults().length === 0 && !isSearching() && !searchError()) {
        <div class="no-results">
          <span>No tracks found for "{{ searchQuery }}"</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .music-search {
      padding: 1rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #ddd;
    }

    .music-search h3 {
      margin: 0 0 1rem 0;
      color: #1db954;
    }

    .premium-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0.75rem;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      margin-bottom: 1rem;
      color: #856404;
    }

    .search-section {
      margin-bottom: 1rem;
    }

    .search-input-group {
      display: flex;
      gap: 8px;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    .search-input:focus {
      outline: none;
      border-color: #1db954;
      box-shadow: 0 0 0 2px rgba(29, 185, 84, 0.1);
    }

    .search-btn {
      padding: 0.75rem 1rem;
      background: #1db954;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      min-width: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .search-btn:hover:not(:disabled) {
      background: #1ed760;
    }

    .search-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .device-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .device-select {
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
    }

    .refresh-devices-btn {
      padding: 0.5rem;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .results-section h4 {
      margin: 0 0 1rem 0;
      color: #333;
    }

    .track-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 400px;
      overflow-y: auto;
    }

    .track-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      border: 1px solid #eee;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .track-item:hover {
      background: #f5f5f5;
      border-color: #ddd;
    }

    .track-item.playing {
      background: #e8f5e8;
      border-color: #1db954;
    }

    .track-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }

    .track-image {
      width: 50px;
      height: 50px;
      border-radius: 4px;
      object-fit: cover;
    }

    .track-image-placeholder {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0f0f0;
      border-radius: 4px;
      font-size: 1.5rem;
    }

    .track-details {
      flex: 1;
    }

    .track-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 2px;
    }

    .track-artist {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 2px;
    }

    .track-album {
      color: #888;
      font-size: 0.85rem;
      margin-bottom: 2px;
    }

    .track-duration {
      color: #999;
      font-size: 0.8rem;
      font-family: monospace;
    }

    .track-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .play-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: #1db954;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: background-color 0.2s;
    }

    .play-btn:hover:not(:disabled) {
      background: #1ed760;
    }

    .play-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spotify-link {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #191414;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    .spotify-link:hover {
      background: #333;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid currentColor;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0.75rem;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      color: #721c24;
      margin-top: 1rem;
    }

    .clear-error-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #721c24;
      font-weight: bold;
      margin-left: auto;
    }

    .no-results {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-style: italic;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MusicSearchComponent {
  private spotifyPlayer = inject(SpotifyPlayerService);
  userService = inject(SpotifyUserService);

  // Component state
  searchQuery = '';
  selectedDeviceId = '';

  // Signals
  searchResults = signal<SpotifyTrack[]>([]);
  availableDevices = signal<Array<{ id: string; name: string; type: string; is_active: boolean; }>>([]);
  isSearching = signal(false);
  isLoading = signal(false);
  searchError = signal<string | null>(null);
  selectedTrack = signal<SpotifyTrack | null>(null);

  constructor() {
    // Load available devices on component init
    this.refreshDevices();
  }

  searchTracks(): void {
    if (!this.searchQuery.trim()) return;

    this.isSearching.set(true);
    this.searchError.set(null);

    this.spotifyPlayer.searchTracks(this.searchQuery.trim(), 20).subscribe({
      next: (result) => {
        this.searchResults.set(result.tracks.items);
        this.isSearching.set(false);
        console.log(`Found ${result.tracks.items.length} tracks for "${this.searchQuery}"`);
      },
      error: (error) => {
        console.error('Search error:', error);
        this.searchError.set('Failed to search tracks. Please try again.');
        this.isSearching.set(false);
        this.searchResults.set([]);
      }
    });
  }

  playTrack(track: SpotifyTrack): void {
    if (!this.userService.isPremium()) {
      alert('Spotify Premium is required to start playback from this app.');
      return;
    }

    this.isLoading.set(true);
    this.selectedTrack.set(track);
    this.searchError.set(null);

    const deviceId = this.selectedDeviceId || undefined;

    this.spotifyPlayer.playTrack(track.uri, deviceId).subscribe({
      next: () => {
        console.log(`Started playing: ${track.name} by ${this.getArtistNames(track)}`);
        this.isLoading.set(false);
        this.selectedTrack.set(null);
      },
      error: (error) => {
        console.error('Playback error:', error);
        this.searchError.set(`Failed to play "${track.name}". Make sure Spotify is open on a device.`);
        this.isLoading.set(false);
        this.selectedTrack.set(null);
      }
    });
  }

  refreshDevices(): void {
    this.spotifyPlayer.getAvailableDevices().subscribe({
      next: (result) => {
        this.availableDevices.set(result.devices);
        console.log(`Found ${result.devices.length} available devices`);
      },
      error: (error) => {
        console.error('Error getting devices:', error);
      }
    });
  }

  getArtistNames(track: SpotifyTrack): string {
    return track.artists.map(artist => artist.name).join(', ');
  }

  formatDuration(durationMs: number): string {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  isTrackPlaying(track: SpotifyTrack): boolean {
    // This would need to be connected to the current playback state
    // For now, we'll return false as a placeholder
    return false;
  }

  clearError(): void {
    this.searchError.set(null);
  }
}
