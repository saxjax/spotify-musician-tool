import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyPlayerService } from './spotify-player.service';
import { SpotifyUserService } from '../user/spotify-user.service';
import { PlayerStore } from './player.store';

@Component({
  selector: 'app-quick-start-playback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="quick-start">
      <h3>🎵 Quick Start Playback</h3>
      
      @if (!userService.isPremium()) {
        <div class="premium-warning">
          <span class="warning-icon">⚠️</span>
          <span>Spotify Premium required to control playback</span>
        </div>
      }

      <div class="quick-actions">
        @if (playerStore.isPlaying()) {
          <div class="currently-playing">
            <span class="playing-icon">🎵</span>
            <span>Music is currently playing</span>
            <button 
              (click)="pausePlayback()"
              class="pause-btn">
              ⏸️ Pause
            </button>
          </div>
        } @else {
          <div class="start-section">
            <p class="instruction">
              Select a song in Spotify, then click below to start playing:
            </p>
            
            <button 
              (click)="startPlayback()"
              [disabled]="!userService.isPremium() || isLoading()"
              class="start-btn"
              [class.loading]="isLoading()">
              @if (isLoading()) {
                <span class="spinner"></span>
                Starting...
              } @else {
                ▶️ Start Playing Current Song
              }
            </button>

            <p class="help-text">
              💡 Tip: Open Spotify, select any song (don't need to play it), then use this button to start playback.
            </p>
          </div>
        }
      </div>

      @if (error()) {
        <div class="error-message">
          <span class="error-icon">❌</span>
          <span>{{ error() }}</span>
          <button (click)="clearError()" class="clear-error-btn">✕</button>
        </div>
      }

      <!-- Current track info if available -->
      @if (playerStore.currentTrack(); as track) {
        <div class="current-track-info">
          <h4>Now Selected:</h4>
          <div class="track-details">
            <div class="track-name">{{ track.name }}</div>
            <div class="track-artist">{{ track.artist }}</div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .quick-start {
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      border: 1px solid #ddd;
      text-align: center;
    }

    .quick-start h3 {
      margin: 0 0 1rem 0;
      color: #1db954;
    }

    .premium-warning {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 0.75rem;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 4px;
      margin-bottom: 1rem;
      color: #856404;
    }

    .quick-actions {
      margin-bottom: 1rem;
    }

    .currently-playing {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 1rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
      color: #155724;
    }

    .playing-icon {
      font-size: 1.2rem;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    .pause-btn {
      padding: 0.5rem 1rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .pause-btn:hover {
      background: #c82333;
    }

    .start-section {
      padding: 1rem 0;
    }

    .instruction {
      margin: 0 0 1rem 0;
      color: #666;
      font-size: 1rem;
    }

    .start-btn {
      padding: 1rem 2rem;
      background: #1db954;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.1rem;
      font-weight: bold;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin: 0 auto 1rem auto;
      min-width: 250px;
    }

    .start-btn:hover:not(:disabled) {
      background: #1ed760;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
    }

    .start-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .start-btn.loading {
      opacity: 0.8;
    }

    .help-text {
      margin: 0;
      color: #888;
      font-size: 0.9rem;
      font-style: italic;
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
      justify-content: center;
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
      margin-left: 8px;
    }

    .current-track-info {
      margin-top: 1rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }

    .current-track-info h4 {
      margin: 0 0 0.5rem 0;
      color: #495057;
      font-size: 0.9rem;
    }

    .track-details {
      text-align: center;
    }

    .track-name {
      font-weight: bold;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .track-artist {
      color: #666;
      font-size: 0.9rem;
    }
  `],
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
      error: (error) => {
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
      error: (error) => {
        console.error('❌ Failed to pause:', error);
        this.error.set('Failed to pause playback');
      }
    });
  }

  clearError(): void {
    this.error.set(null);
  }
}
