import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { AuthCallbackComponent } from './login-error.component';
import { SpotifyAuthService } from '../spotify-auth.service';
import { SpotifyPlayerService } from '../../player/spotify-player.service';
import { SpotifyUserService } from '../../user/spotify-user.service';

describe('AuthCallbackComponent (login-error)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthCallbackComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigateByUrl']) },
        { provide: SpotifyAuthService, useValue: jasmine.createSpyObj('SpotifyAuthService', ['handleCallbackFromUrl', 'accessToken']) },
        { provide: SpotifyPlayerService, useValue: jasmine.createSpyObj('SpotifyPlayerService', ['setAccessToken']) },
        { provide: SpotifyUserService, useValue: jasmine.createSpyObj('SpotifyUserService', ['fetchUserProfile']) }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthCallbackComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
