import { ChangeDetectionStrategy, Component, inject, computed } from '@angular/core';
import { PlayerStore } from '../../../services/player.store';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';

@Component({
  selector: 'app-ab-loop-controls',
  template: `
    <div class="ab-loop-controls">
      <div class="loop-buttons">
        <button type="button" (click)="setA()" [class.active]="store.loopA() !== null">
          Set A {{ store.loopA() !== null ? '(' + formatTime(store.loopA()!) + ')' : '' }}
        </button>
        <button type="button" (click)="setB()" [class.active]="store.loopB() !== null">
          Set B {{ store.loopB() !== null ? '(' + formatTime(store.loopB()!) + ')' : '' }}
        </button>
      </div>
      <div class="loop-actions">
        <button type="button" (click)="toggleLoop()" [class.looping]="store.isLooping()">
          {{ store.isLooping() ? 'Stop Loop' : 'Start Loop' }}
        </button>
        <button type="button" (click)="clearLoop()">Clear</button>
      </div>
    </div>
  `,
  styles: `
    .ab-loop-controls {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0.6rem;
      border-radius: 0.6rem;
      background: linear-gradient(180deg, rgba(16,20,30,0.9), rgba(8,10,14,0.9));
      border: 1px solid rgba(255,255,255,0.03);
      box-shadow: 0 8px 24px rgba(2,6,23,0.55);
    }

    .loop-buttons, .loop-actions {
      display: flex;
      gap: 0.5rem;
    }

    button {
      padding: 0.45rem 1rem;
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 0.45rem;
      background: rgba(255,255,255,0.02);
      color: #d8e6f2;
      cursor: pointer;
      transition: transform 120ms ease, box-shadow 120ms ease, background 120ms ease;
      font-size: 0.95rem;
    }

    button:hover {
      transform: translateY(-2px);
    }

    button.active {
      background: linear-gradient(180deg, #00c168, #00894c);
      color: white;
      border-color: rgba(0,166,90,0.85);
      box-shadow: 0 8px 18px rgba(0,166,90,0.12);
    }

    button.looping {
      background: linear-gradient(180deg, #e74c3c, #c0392b);
      color: white;
      border-color: rgba(231,76,60,0.9);
      box-shadow: 0 8px 18px rgba(231,76,60,0.12);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbLoopControlsComponent {
  store = inject(PlayerStore);
  private playerService = inject(SpotifyPlayerService);

  setA(): void {
    this.store.setLoopPoints(this.store.positionMs(), this.store.loopB());
  }

  setB(): void {
    this.store.setLoopPoints(this.store.loopA(), this.store.positionMs());
  }

  toggleLoop(): void {
    this.store.setLooping(!this.store.isLooping());
  }

  clearLoop(): void {
    this.store.setLoopPoints(null, null);
    this.store.setLooping(false);
  }

  formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
