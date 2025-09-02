import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { UserProfileComponent } from './user-profile.component';
import { SpotifyUserService } from '../../../services/spotify-user.service';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';

describe('UserProfileComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SpotifyUserService, useValue: jasmine.createSpyObj('SpotifyUserService', ['fetchUserProfile', 'clearProfile'], { isLoading: () => false, error: () => null, userProfile: () => null, followerCount: () => 0, isPremium: () => false, avatarUrl: () => null }) },
        { provide: SpotifyAuthService, useValue: jasmine.createSpyObj('SpotifyAuthService', ['isAuthenticated', 'logout'], { isAuthenticated: () => false }) }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(UserProfileComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
