import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, computed } from '@angular/core';
import { PlayerStore } from '../player.store';
import { SpotifyPlayerService } from '../spotify-player.service';

@Component({
  selector: 'app-ab-loop-controls',
  standalone: true,
  imports: [],
  templateUrl: './ab-loop-controls.component.html',
  styleUrl: './ab-loop-controls.component.scss',
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
