import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { PlayerStore } from '../../../services/player.store';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';

@Component({
  selector: 'app-playhead-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="playhead-slider">
      <span class="time">{{ formatTime(displayPosition()) }}</span>
      <input
        type="range"
        min="0"
        [max]="store.durationMs()"
        [value]="displayPosition()"
        (input)="onScrub($event)"
        (change)="onScrubEnd($event)"
        [disabled]="!store.currentTrack()"
      />
      <span class="time">{{ formatTime(store.durationMs()) }}</span>
    </div>
  `,
  styles: `
    .playhead-slider {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .time {
      font-size: 0.75rem;
      font-variant-numeric: tabular-nums;
      min-width: 3rem;
      color: #666;
    }
    .time:last-child {
      text-align: right;
    }
    input[type="range"] {
      flex: 1;
      cursor: pointer;
      accent-color: #1db954;
    }
    input[type="range"]:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  `,
})
export class PlayheadSliderComponent {
  store = inject(PlayerStore);
  private playerService = inject(SpotifyPlayerService);

  private scrubbing = signal(false);
  private scrubPosition = signal(0);

  displayPosition = computed(() =>
    this.scrubbing() ? this.scrubPosition() : this.store.positionMs()
  );

  onScrub(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.scrubbing.set(true);
    this.scrubPosition.set(value);
  }

  onScrubEnd(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.scrubbing.set(false);
    this.store.setPosition(value);
    this.playerService.seekToPosition(value).subscribe();
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
