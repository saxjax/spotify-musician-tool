import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStore } from './player.store';
import { SpotifyPlayerService } from './spotify-player.service';

@Component({
  selector: 'app-ab-loop-controls',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ab-loop-controls">
      <h3>AB Loop Controls</h3>
      
      <!-- Current Track Info -->
      @if (playerStore.currentTrack(); as track) {
        <div class="track-info">
          <div class="track-name">{{ track.name }}</div>
          <div class="track-artist">{{ track.artist }}</div>
          <div class="track-time">
            {{ formatTime(playerStore.positionMs()) }} / {{ formatTime(playerStore.durationMs()) }}
          </div>
        </div>
      }

      <!-- Playback Controls -->
      <div class="playback-controls">
        <button 
          (click)="spotifyPlayer.seekRelative(-10000)"
          class="seek-btn"
          title="Skip back 10 seconds">
          ⏪ 10s
        </button>
        
        <button 
          (click)="spotifyPlayer.togglePlayback()"
          class="play-pause-btn"
          [class.playing]="playerStore.isPlaying()">
          {{ playerStore.isPlaying() ? '⏸️' : '▶️' }}
        </button>
        
        <button 
          (click)="spotifyPlayer.seekRelative(10000)"
          class="seek-btn"
          title="Skip forward 10 seconds">
          10s ⏩
        </button>
      </div>

      <!-- AB Loop Controls -->
      <div class="loop-controls">
        <div class="loop-points">
          <div class="loop-point">
            <span class="label">Point A:</span>
            <span class="time">
              {{ playerStore.loopA() !== null ? formatTime(playerStore.loopA()!) : 'Not set' }}
            </span>
            <button 
              (click)="spotifyPlayer.setLoopPointA()"
              class="set-point-btn">
              Set A
            </button>
            @if (playerStore.loopA() !== null) {
              <button 
                (click)="spotifyPlayer.jumpToLoopA()"
                class="jump-btn"
                title="Jump to point A">
                Jump
              </button>
            }
          </div>

          <div class="loop-point">
            <span class="label">Point B:</span>
            <span class="time">
              {{ playerStore.loopB() !== null ? formatTime(playerStore.loopB()!) : 'Not set' }}
            </span>
            <button 
              (click)="spotifyPlayer.setLoopPointB()"
              class="set-point-btn">
              Set B
            </button>
            @if (playerStore.loopB() !== null) {
              <button 
                (click)="spotifyPlayer.jumpToLoopB()"
                class="jump-btn"
                title="Jump to point B">
                Jump
              </button>
            }
          </div>
        </div>

        <div class="loop-actions">
          <button 
            (click)="spotifyPlayer.toggleAbLoop()"
            class="loop-toggle-btn"
            [class.active]="playerStore.isLooping()"
            [disabled]="playerStore.loopA() === null || playerStore.loopB() === null">
            {{ playerStore.isLooping() ? 'Stop Loop' : 'Start Loop' }}
          </button>
          
          <button 
            (click)="spotifyPlayer.clearLoopPoints()"
            class="clear-btn">
            Clear Points
          </button>
        </div>
      </div>

      <!-- Progress Bar with Loop Points -->
      <div class="progress-container">
        <div class="progress-bar" (click)="onProgressClick($event)">
          <div 
            class="progress-fill"
            [style.width.%]="getProgressPercentage()">
          </div>
          
          <!-- Loop Point A Marker -->
          @if (playerStore.loopA() !== null) {
            <div 
              class="loop-marker loop-a"
              [style.left.%]="getLoopAPercentage()"
              title="Loop Point A">
              A
            </div>
          }
          
          <!-- Loop Point B Marker -->
          @if (playerStore.loopB() !== null) {
            <div 
              class="loop-marker loop-b"
              [style.left.%]="getLoopBPercentage()"
              title="Loop Point B">
              B
            </div>
          }
          
          <!-- Loop Range Highlight -->
          @if (playerStore.loopA() !== null && playerStore.loopB() !== null) {
            <div 
              class="loop-range"
              [class.active]="playerStore.isLooping()"
              [style.left.%]="getLoopAPercentage()"
              [style.width.%]="getLoopRangeWidth()">
            </div>
          }
        </div>
      </div>

      <!-- Status -->
      <div class="status">
        @if (playerStore.isLooping()) {
          <span class="loop-status active">🔄 AB Loop Active</span>
        } @else if (playerStore.loopA() !== null && playerStore.loopB() !== null) {
          <span class="loop-status ready">🔄 AB Loop Ready</span>
        } @else {
          <span class="loop-status inactive">Set points A and B to enable looping</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .ab-loop-controls {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      max-width: 500px;
      margin: 0 auto;
      background: white;
    }

    .track-info {
      text-align: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .track-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .track-artist {
      color: #666;
      margin-bottom: 10px;
    }

    .track-time {
      font-family: monospace;
      color: #888;
    }

    .playback-controls {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-bottom: 25px;
    }

    .play-pause-btn {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      border: none;
      background: #1db954;
      color: white;
      font-size: 18px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .play-pause-btn:hover {
      background: #1ed760;
    }

    .seek-btn {
      padding: 10px 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .seek-btn:hover {
      background: #f5f5f5;
    }

    .loop-controls {
      margin-bottom: 25px;
    }

    .loop-points {
      display: flex;
      flex-direction: column;
      gap: 15px;
      margin-bottom: 20px;
    }

    .loop-point {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .label {
      font-weight: bold;
      min-width: 60px;
    }

    .time {
      font-family: monospace;
      min-width: 80px;
      color: #666;
    }

    .set-point-btn {
      padding: 5px 15px;
      border: 1px solid #007bff;
      border-radius: 4px;
      background: #007bff;
      color: white;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .set-point-btn:hover {
      background: #0056b3;
    }

    .jump-btn {
      padding: 5px 10px;
      border: 1px solid #28a745;
      border-radius: 4px;
      background: #28a745;
      color: white;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.2s;
    }

    .jump-btn:hover {
      background: #1e7e34;
    }

    .loop-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
    }

    .loop-toggle-btn {
      padding: 10px 20px;
      border: 2px solid #dc3545;
      border-radius: 4px;
      background: white;
      color: #dc3545;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
    }

    .loop-toggle-btn.active {
      background: #dc3545;
      color: white;
    }

    .loop-toggle-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .clear-btn {
      padding: 10px 20px;
      border: 1px solid #6c757d;
      border-radius: 4px;
      background: white;
      color: #6c757d;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clear-btn:hover {
      background: #6c757d;
      color: white;
    }

    .progress-container {
      margin-bottom: 15px;
    }

    .progress-bar {
      position: relative;
      height: 10px;
      background: #e0e0e0;
      border-radius: 5px;
      cursor: pointer;
      margin: 20px 0;
    }

    .progress-fill {
      height: 100%;
      background: #1db954;
      border-radius: 5px;
      transition: width 0.2s;
    }

    .loop-marker {
      position: absolute;
      top: -15px;
      transform: translateX(-50%);
      background: #007bff;
      color: white;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 10px;
      font-weight: bold;
      pointer-events: none;
    }

    .loop-marker.loop-a {
      background: #28a745;
    }

    .loop-marker.loop-b {
      background: #dc3545;
    }

    .loop-range {
      position: absolute;
      top: 0;
      height: 100%;
      background: rgba(220, 53, 69, 0.2);
      border-radius: 5px;
      pointer-events: none;
    }

    .loop-range.active {
      background: rgba(220, 53, 69, 0.4);
    }

    .status {
      text-align: center;
      padding: 10px;
      border-radius: 4px;
      font-weight: bold;
    }

    .loop-status.active {
      background: #d4edda;
      color: #155724;
    }

    .loop-status.ready {
      background: #fff3cd;
      color: #856404;
    }

    .loop-status.inactive {
      background: #f8d7da;
      color: #721c24;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AbLoopControlsComponent implements OnInit, OnDestroy {
  playerStore = inject(PlayerStore);
  spotifyPlayer = inject(SpotifyPlayerService);

  ngOnInit(): void {
    // Initialize with access token if available
    // You would get this from your auth service
    // this.spotifyPlayer.setAccessToken('your-access-token');
  }

  ngOnDestroy(): void {
    this.spotifyPlayer.destroy();
  }

  formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getProgressPercentage(): number {
    const duration = this.playerStore.durationMs();
    const position = this.playerStore.positionMs();
    return duration > 0 ? (position / duration) * 100 : 0;
  }

  getLoopAPercentage(): number {
    const duration = this.playerStore.durationMs();
    const loopA = this.playerStore.loopA();
    return duration > 0 && loopA !== null ? (loopA / duration) * 100 : 0;
  }

  getLoopBPercentage(): number {
    const duration = this.playerStore.durationMs();
    const loopB = this.playerStore.loopB();
    return duration > 0 && loopB !== null ? (loopB / duration) * 100 : 0;
  }

  getLoopRangeWidth(): number {
    const loopA = this.playerStore.loopA();
    const loopB = this.playerStore.loopB();
    const duration = this.playerStore.durationMs();
    
    if (loopA !== null && loopB !== null && duration > 0) {
      return ((loopB - loopA) / duration) * 100;
    }
    return 0;
  }

  onProgressClick(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const duration = this.playerStore.durationMs();
    const newPosition = Math.floor(duration * percentage);
    
    this.spotifyPlayer.seekToPosition(newPosition).subscribe();
  }
}
