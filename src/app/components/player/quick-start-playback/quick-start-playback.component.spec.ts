import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { QuickStartPlaybackComponent } from './quick-start-playback.component';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';
import { SpotifyUserService } from '../../../services/spotify-user.service';
import { PlayerStore } from '../../../services/player.store';

describe('QuickStartPlaybackComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickStartPlaybackComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SpotifyPlayerService, useValue: jasmine.createSpyObj('SpotifyPlayerService', ['resumePlayback', 'pausePlayback']) },
        { provide: SpotifyUserService, useValue: jasmine.createSpyObj('SpotifyUserService', ['isPremium'], { isPremium: () => true }) },
        { provide: PlayerStore, useValue: jasmine.createSpyObj('PlayerStore', [], { isPlaying: () => false, currentTrack: () => null }) }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QuickStartPlaybackComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
