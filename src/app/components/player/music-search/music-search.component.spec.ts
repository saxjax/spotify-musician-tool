import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MusicSearchComponent } from './music-search.component';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';
import { SpotifyUserService } from '../../../services/spotify-user.service';

describe('MusicSearchComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MusicSearchComponent, FormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SpotifyPlayerService, useValue: jasmine.createSpyObj('SpotifyPlayerService', ['searchTracks', 'playTrack', 'getAvailableDevices']) },
        { provide: SpotifyUserService, useValue: jasmine.createSpyObj('SpotifyUserService', ['isPremium'], { isPremium: () => false }) }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(MusicSearchComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
