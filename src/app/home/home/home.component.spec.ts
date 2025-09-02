import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HomeComponent } from './home.component';
import { SpotifyAuthService } from '../../auth/spotify-auth.service';
import { SpotifyPlayerService } from '../../player/spotify-player.service';
import { SpotifyUserService } from '../../user/spotify-user.service';

describe('HomeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SpotifyAuthService, useValue: jasmine.createSpyObj('SpotifyAuthService', ['accessToken', 'isAuthenticated'], { isAuthenticated: () => false }) },
        { provide: SpotifyPlayerService, useValue: jasmine.createSpyObj('SpotifyPlayerService', ['setAccessToken']) },
        { provide: SpotifyUserService, useValue: jasmine.createSpyObj('SpotifyUserService', ['fetchUserProfile']) }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
