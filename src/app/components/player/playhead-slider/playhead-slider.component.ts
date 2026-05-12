import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { PlayerStore } from '../../../services/player.store';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';

@Component({
  selector: 'app-playhead-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="playhead-card">
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
    </div>
  `,
  styles: `
    .playhead-card {
      background: linear-gradient(180deg, rgba(8,10,14,0.98), rgba(16,20,30,0.98));
      border-radius: 0.6rem;
      padding: 0.6rem;
      box-shadow: 0 10px 30px rgba(2,6,23,0.6);
      border: 1px solid rgba(255,255,255,0.02);
    }

    .playhead-slider {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .time {
      font-size: 0.8rem;
      font-variant-numeric: tabular-nums;
      min-width: 3rem;
      color: #cfdde9;
    }

    .time:last-child {
      text-align: right;
    }

    input[type="range"] {
      -webkit-appearance: none;
      appearance: none;
      flex: 1;
      height: 6px;
      background: linear-gradient(90deg, rgba(0,128,255,0.12), rgba(0,166,90,0.08));
      border-radius: 999px;
      outline: none;
    }

    input[type="range"]::-webkit-slider-runnable-track {
      height: 6px;
      border-radius: 999px;
      background: rgba(255,255,255,0.04);
    }

    input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      margin-top: -4px;
      border-radius: 50%;
      background: #00c168;
      box-shadow: 0 6px 16px rgba(0,193,120,0.18);
      border: 2px solid rgba(255,255,255,0.06);
      cursor: pointer;
    }

    input[type="range"]:disabled {
      cursor: not-allowed;
      opacity: 0.45;
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
