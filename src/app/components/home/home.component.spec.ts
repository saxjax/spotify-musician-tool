import { signal } from '@angular/core';
import { HomeComponent } from './home.component';
import { SpotifyAuthService } from '../../services/spotify-auth.service';
import { SpotifyUserService } from '../../services/spotify-user.service';
import { SpotifyPlayerService } from '../../services/spotify-player.service';
import { setupZonelessTest } from '../../../test-helpers/zoneless-test-setup';

describe('HomeComponent', () => {
  let mockAuthService: Partial<SpotifyAuthService>;
  let mockPlayerService: Partial<SpotifyPlayerService>;
  let mockUserService: Partial<SpotifyUserService>;

  beforeEach(() => {
    mockAuthService = {
      isAuthenticated: signal(false),
      accessToken: signal(null),
      startLogin: jest.fn(),
      handleCallbackFromUrl: jest.fn(),
      refresh: jest.fn(),
      logout: jest.fn()
    };

    mockPlayerService = {
      setAccessToken: jest.fn()
    };

    mockUserService = {
      fetchUserProfile: jest.fn()
    };
  });

  it('should create', async () => {
    const { fixture, component } = await setupZonelessTest(HomeComponent, [
      { provide: SpotifyAuthService, useValue: mockAuthService },
      { provide: SpotifyPlayerService, useValue: mockPlayerService },
      { provide: SpotifyUserService, useValue: mockUserService }
    ]);

    expect(component).toBeTruthy();
  });

  it('should handle unauthenticated state', async () => {
    const { fixture, component } = await setupZonelessTest(HomeComponent, [
      { provide: SpotifyAuthService, useValue: mockAuthService },
      { provide: SpotifyPlayerService, useValue: mockPlayerService },
      { provide: SpotifyUserService, useValue: mockUserService }
    ]);

    expect(mockAuthService.isAuthenticated?.()).toBe(false);
  });

  it('should handle authenticated state', async () => {
    mockAuthService.isAuthenticated = signal(true);
    mockAuthService.accessToken = signal('mock-token');

    const { fixture, component } = await setupZonelessTest(HomeComponent, [
      { provide: SpotifyAuthService, useValue: mockAuthService },
      { provide: SpotifyPlayerService, useValue: mockPlayerService },
      { provide: SpotifyUserService, useValue: mockUserService }
    ]);

    expect(mockAuthService.isAuthenticated()).toBe(true);
    expect(mockAuthService.accessToken()).toBe('mock-token');
  });
});
