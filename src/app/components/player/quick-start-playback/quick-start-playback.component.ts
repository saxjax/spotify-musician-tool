import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PlayerStore } from '../../../services/player.store';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';

@Component({
  selector: 'app-quick-start-playback',
  template: `
    <div class="quick-start">
      @if (store.currentTrack(); as track) {
        <div class="now-playing">
          <span class="label">Now Playing:</span>
          <span class="track-name">{{ track.name }}</span>
          <span class="artist">{{ track.artists?.[0]?.name }}</span>
        </div>
        <div class="playback-controls">
          <button type="button" (click)="togglePlay()">
            {{ store.isPlaying() ? '⏸ Pause' : '▶ Play' }}
          </button>
        </div>
      } @else {
        <div class="no-track">
          <p>No track currently playing.</p>
          <p>Open Spotify and start playing a song, then come back here.</p>
          <button type="button" (click)="refreshState()">Refresh Playback State</button>
        </div>
      }
    </div>
  `,
  styles: `
    .quick-start {
      padding: 1rem;
      border: 1px solid #eee;
      border-radius: 8px;
      background: #fafafa;
    }
    .now-playing {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }
    .label {
      font-size: 0.8rem;
      color: #888;
      text-transform: uppercase;
    }
    .track-name {
      font-weight: 600;
      font-size: 1.1rem;
    }
    .artist {
      color: #666;
    }
    button {
      padding: 0.5rem 1.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f5f5f5;
      cursor: pointer;
    }
    .no-track {
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickStartPlaybackComponent {
  store = inject(PlayerStore);
  private playerService = inject(SpotifyPlayerService);

  togglePlay(): void {
    if (this.store.isPlaying()) {
      this.playerService.pausePlayback().subscribe();
    } else {
      this.playerService.resumePlayback().subscribe();
    }
  }

  refreshState(): void {
    this.playerService.getCurrentPlaybackState().subscribe();
  }
}
