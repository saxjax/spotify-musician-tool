import { AuthComponent } from './auth.component';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';
import { setupZonelessTest } from '../../../../test-helpers/zoneless-test-setup';

describe('AuthComponent', () => {
  let mockAuthService: Partial<SpotifyAuthService>;

  beforeEach(() => {
    mockAuthService = {
      startLogin: jest.fn()
    };
  });

  it('should create', async () => {
    const { fixture, component } = await setupZonelessTest(AuthComponent, [
      { provide: SpotifyAuthService, useValue: mockAuthService }
    ]);

    expect(component).toBeTruthy();
  });
});
