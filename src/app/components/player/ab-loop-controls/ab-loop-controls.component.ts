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
    }
    .loop-buttons, .loop-actions {
      display: flex;
      gap: 0.5rem;
    }
    button {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: #f5f5f5;
      cursor: pointer;
    }
    button.active {
      background: #1db954;
      color: white;
      border-color: #1db954;
    }
    button.looping {
      background: #e74c3c;
      color: white;
      border-color: #e74c3c;
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
