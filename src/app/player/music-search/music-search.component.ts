import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SpotifyPlayerService, SpotifyTrack } from '../spotify-player.service';
import { SpotifyUserService } from '../../user/spotify-user.service';

@Component({
  selector: 'app-music-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './music-search.component.html',
  styleUrl: './music-search.component.scss',
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
