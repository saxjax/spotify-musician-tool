import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';
import { SpotifyUserService } from '../../../services/spotify-user.service';
import { PlayerStore } from '../../../services/player.store';

@Component({
  selector: 'app-quick-start-playback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quick-start-playback.component.html',
  styleUrl: './quick-start-playback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuickStartPlaybackComponent {
  private spotifyPlayer = inject(SpotifyPlayerService);
  userService = inject(SpotifyUserService);
  playerStore = inject(PlayerStore);

  // Component state
  isLoading = signal(false);
  error = signal<string | null>(null);

  startPlayback(): void {
    if (!this.userService.isPremium()) {
      this.error.set('Spotify Premium is required to control playback');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    console.log('🎵 Starting playback of current/selected song');

    this.spotifyPlayer.resumePlayback().subscribe({
      next: () => {
        console.log('✅ Playback started successfully');
        this.isLoading.set(false);
      },
      error: (error: any) => {
        console.error('❌ Failed to start playback:', error);
        this.isLoading.set(false);

        if (error.status === 404) {
          this.error.set('No active device found. Please open Spotify on a device first.');
        } else if (error.status === 403) {
          this.error.set('Playback failed. Make sure a song is selected in Spotify.');
        } else {
          this.error.set('Failed to start playback. Please make sure Spotify is open and a song is selected.');
        }
      }
    });
  }

  pausePlayback(): void {
    this.spotifyPlayer.pausePlayback().subscribe({
      next: () => {
        console.log('✅ Playback paused');
      },
      error: (error: any) => {
        console.error('❌ Failed to pause:', error);
        this.error.set('Failed to pause playback');
      }
    });
  }

  clearError(): void {
    this.error.set(null);
  }
}
