import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SpotifyPlayerService, SpotifyTrack } from '../../../services/spotify-player.service';

@Component({
  selector: 'app-music-search',
  imports: [FormsModule],
  template: `
    <div class="music-search">
      <div class="search-bar">
        <input
          type="text"
          [(ngModel)]="query"
          placeholder="Search for a song..."
          (keyup.enter)="search()"
        />
        <button type="button" (click)="search()">Search</button>
      </div>
      @if (results().length > 0) {
        <ul class="results">
          @for (track of results(); track track.id) {
            <li class="track-item">
              @if (track.album.images.length > 0) {
                <img [src]="track.album.images[track.album.images.length - 1].url" [alt]="track.album.name" class="album-art" />
              }
              <div class="track-info">
                <span class="track-name">{{ track.name }}</span>
                <span class="artist-name">{{ track.artists[0]?.name }}</span>
              </div>
              <button type="button" (click)="play(track)" class="play-btn">Play</button>
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .music-search {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .search-bar {
      display: flex;
      gap: 0.5rem;
    }
    input {
      flex: 1;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .results {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .track-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }
    .album-art {
      width: 40px;
      height: 40px;
      border-radius: 4px;
    }
    .track-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .track-name {
      font-weight: 500;
    }
    .artist-name {
      font-size: 0.85rem;
      color: #888;
    }
    .play-btn {
      background: #1db954;
      color: white;
      border: none;
      padding: 0.4rem 1rem;
      border-radius: 2rem;
      cursor: pointer;
    }
    button {
      padding: 0.5rem 1rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicSearchComponent {
  private playerService = inject(SpotifyPlayerService);

  query = '';
  results = signal<SpotifyTrack[]>([]);

  search(): void {
    if (!this.query.trim()) return;
    this.playerService.searchTracks(this.query).subscribe((res) => {
      this.results.set(res.tracks.items);
    });
  }

  play(track: SpotifyTrack): void {
    this.playerService.playTrack(track.uri).subscribe();
  }
}
