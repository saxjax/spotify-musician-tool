import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerStore } from './player.store';
import { SpotifyPlayerService } from './spotify-player.service';

@Component({
  selector: 'app-ab-loop-controls',
  standalone: true,
  imports: [],
  template: `
    <div class="ab-loop-controls">
      <!-- Current Track Info -->
      @if (playerStore.currentTrack(); as track) {
        <div class="track-info">
          <div class="track-name">{{ track.name }}</div>
          <div class="track-artist">{{ track.artist }}</div>
          <div class="track-time">{{ currentTime() }} / {{ totalTime() }}</div>
        </div>
      }

      <!-- Playback Controls -->
      <div class="playback-controls">
        <button (click)="seekRelative(-5000)" class="seek-btn" title="Skip back 5 seconds">
          ⏪ 5s
        </button>

        <button
          (click)="togglePlayback()"
          class="play-pause-btn"
          [class.playing]="playerStore.isPlaying()">
          {{ playerStore.isPlaying() ? '⏸️' : '▶️' }}
        </button>

        <button
          (click)="startPlayback()"
          class="start-playing-btn"
          [disabled]="playerStore.isPlaying()"
          title="Start playing the currently selected song">
          🎵 Start Playing
        </button>

        <button (click)="seekRelative(5000)" class="seek-btn" title="Skip forward 5 seconds">
          5s ⏩
        </button>
      </div>

      <!-- AB Loop Controls -->
      <div class="loop-controls">
        <div class="loop-points">
          <div class="loop-point">
            <span class="label">Point A:</span>
            <span class="time">{{ loopATime() }}</span>

            <button (click)="adjustLoopPoint('A', -500)" class="micro-seek-btn" title="Adjust point A back 0.5 seconds">
              ⏪ 0.5s
            </button>

            <button (click)="setLoopPoint('A')" class="set-point-btn">
              Set A
            </button>

            <button (click)="adjustLoopPoint('A', 500)" class="micro-seek-btn" title="Adjust point A forward 0.5 seconds">
              0.5s ⏩
            </button>

            @if (playerStore.loopA() !== null) {
              <button (click)="jumpToLoopPoint('A')" class="jump-btn" title="Jump to point A">
                Jump
              </button>
            }
          </div>

          <div class="loop-point">
            <span class="label">Point B:</span>
            <span class="time">{{ loopBTime() }}</span>

            <button (click)="adjustLoopPoint('B', -500)" class="micro-seek-btn" title="Adjust point B back 0.5 seconds">
              ⏪ 0.5s
            </button>

            <button (click)="setLoopPoint('B')" class="set-point-btn">
              Set B
            </button>

            <button (click)="adjustLoopPoint('B', 500)" class="micro-seek-btn" title="Adjust point B forward 0.5 seconds">
              0.5s ⏩
            </button>

            @if (playerStore.loopB() !== null) {
              <button (click)="jumpToLoopPoint('B')" class="jump-btn" title="Jump to point B">
                Jump
              </button>
            }
          </div>
        </div>

        <div class="loop-actions">
          <button
            (click)="toggleLoop()"
            class="loop-toggle-btn"
            [class.active]="playerStore.isLooping()"
            [disabled]="!canLoop()">
            {{ playerStore.isLooping() ? 'Stop Loop' : 'Start Loop' }}
          </button>

          <button (click)="clearLoopPoints()" class="clear-btn">
            Clear Points
          </button>
        </div>
      </div>

      <!-- Progress Bar with Loop Points -->
      <div class="progress-container">
        <div class="progress-bar" (click)="onProgressClick($event)">
          <div class="progress-fill" [style.width.%]="progressPercentage()"></div>

          @if (playerStore.loopA() !== null) {
            <div class="loop-marker loop-a" [style.left.%]="loopAPercentage()" title="Loop Point A">A</div>
          }

          @if (playerStore.loopB() !== null) {
            <div class="loop-marker loop-b" [style.left.%]="loopBPercentage()" title="Loop Point B">B</div>
          }

          @if (canLoop()) {
            <div
              class="loop-range"
              [class.active]="playerStore.isLooping()"
              [style.left.%]="loopAPercentage()"
              [style.width.%]="loopRangeWidth()">
            </div>
          }
        </div>
      </div>

      <!-- Status -->
      <div class="status">
        <span class="loop-status" [class]="loopStatusClass()">
          {{ loopStatusText() }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    /* Container */
    .ab-loop-controls {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      max-width: 500px;
      margin: 0 auto;
      background: white;
    }

    /* Track Info */
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

    /* Button Base Styles */
    button {
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 14px;
    }

    button:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Playback Controls */
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
      background: #1db954;
      color: white;
      font-size: 18px;
    }

    .play-pause-btn:hover {
      background: #1ed760;
    }

    .start-playing-btn {
      padding: 10px 15px;
      border: 1px solid #1db954;
      background: #1db954;
      color: white;
      white-space: nowrap;
    }

    .start-playing-btn:hover:not(:disabled) {
      background: #1ed760;
    }

    .start-playing-btn:disabled {
      background: #6c757d;
      border-color: #6c757d;
    }

    .seek-btn {
      padding: 10px 15px;
      border: 1px solid #ddd;
      background: white;
    }

    .seek-btn:hover {
      background: #f5f5f5;
    }

    /* Loop Controls */
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

    .micro-seek-btn {
      padding: 5px 10px;
      border: 1px solid #ddd;
      background: white;
      font-size: 12px;
    }

    .micro-seek-btn:hover {
      background: #f5f5f5;
    }

    .set-point-btn {
      padding: 5px 15px;
      border: 1px solid #007bff;
      background: #007bff;
      color: white;
    }

    .set-point-btn:hover {
      background: #0056b3;
    }

    .jump-btn {
      padding: 5px 10px;
      border: 1px solid #28a745;
      background: #28a745;
      color: white;
      font-size: 12px;
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
      background: white;
      color: #dc3545;
      font-weight: bold;
    }

    .loop-toggle-btn.active {
      background: #dc3545;
      color: white;
    }

    .clear-btn {
      padding: 10px 20px;
      border: 1px solid #6c757d;
      background: white;
      color: #6c757d;
    }

    .clear-btn:hover {
      background: #6c757d;
      color: white;
    }

    /* Progress Bar */
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

    /* Status */
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

  // Computed signals for derived state
  currentTime = computed(() => this.formatTime(this.playerStore.positionMs()));
  totalTime = computed(() => this.formatTime(this.playerStore.durationMs()));

  loopATime = computed(() => {
    const loopA = this.playerStore.loopA();
    return loopA !== null ? this.formatTime(loopA) : 'Not set';
  });

  loopBTime = computed(() => {
    const loopB = this.playerStore.loopB();
    return loopB !== null ? this.formatTime(loopB) : 'Not set';
  });

  progressPercentage = computed(() => {
    const duration = this.playerStore.durationMs();
    const position = this.playerStore.positionMs();
    return duration > 0 ? (position / duration) * 100 : 0;
  });

  loopAPercentage = computed(() => {
    const duration = this.playerStore.durationMs();
    const loopA = this.playerStore.loopA();
    return duration > 0 && loopA !== null ? (loopA / duration) * 100 : 0;
  });

  loopBPercentage = computed(() => {
    const duration = this.playerStore.durationMs();
    const loopB = this.playerStore.loopB();
    return duration > 0 && loopB !== null ? (loopB / duration) * 100 : 0;
  });

  loopRangeWidth = computed(() => {
    const loopA = this.playerStore.loopA();
    const loopB = this.playerStore.loopB();
    const duration = this.playerStore.durationMs();

    if (loopA !== null && loopB !== null && duration > 0) {
      return ((loopB - loopA) / duration) * 100;
    }
    return 0;
  });

  canLoop = computed(() => {
    return this.playerStore.loopA() !== null && this.playerStore.loopB() !== null;
  });

  loopStatusClass = computed(() => {
    if (this.playerStore.isLooping()) return 'active';
    if (this.canLoop()) return 'ready';
    return 'inactive';
  });

  loopStatusText = computed(() => {
    if (this.playerStore.isLooping()) return '🔄 AB Loop Active';
    if (this.canLoop()) return '🔄 AB Loop Ready';
    return 'Set points A and B to enable looping';
  });

  ngOnInit(): void {
    // Component initialization
  }

  ngOnDestroy(): void {
    this.spotifyPlayer.destroy();
  }

  // Playback control methods
  seekRelative(ms: number): void {
    this.spotifyPlayer.seekRelative(ms);
  }

  togglePlayback(): void {
    this.spotifyPlayer.togglePlayback();
  }

  startPlayback(): void {
    console.log('🎵 Starting playback of current song');
    this.spotifyPlayer.resumePlayback().subscribe({
      next: () => console.log('✅ Playback started successfully'),
      error: (error) => {
        console.error('❌ Failed to start playback:', error);
        alert('Failed to start playback. Make sure Spotify is open and a song is selected.');
      }
    });
  }

  // Loop control methods
  setLoopPoint(point: 'A' | 'B'): void {
    if (point === 'A') {
      this.spotifyPlayer.setLoopPointA();
    } else {
      this.spotifyPlayer.setLoopPointB();
    }
  }

  adjustLoopPoint(point: 'A' | 'B', offsetMs: number): void {
    if (point === 'A') {
      this.spotifyPlayer.setLoopPointA(offsetMs);
      this.spotifyPlayer.jumpToLoopA();
    } else {
      this.spotifyPlayer.setLoopPointB(offsetMs);
      this.spotifyPlayer.jumpToLoopB();
    }
  }

  jumpToLoopPoint(point: 'A' | 'B'): void {
    if (point === 'A') {
      this.spotifyPlayer.jumpToLoopA();
    } else {
      this.spotifyPlayer.jumpToLoopB();
    }
  }

  toggleLoop(): void {
    this.spotifyPlayer.toggleAbLoop();
  }

  clearLoopPoints(): void {
    this.spotifyPlayer.clearLoopPoints();
  }

  // Progress bar interaction
  onProgressClick(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const duration = this.playerStore.durationMs();
    const newPosition = Math.floor(duration * percentage);

    this.spotifyPlayer.seekToPosition(newPosition).subscribe();
  }

  // Utility method
  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
