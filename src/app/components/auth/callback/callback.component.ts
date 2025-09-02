import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';
import { SpotifyUserService } from '../../../services/spotify-user.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  templateUrl: './callback.component.html',
  styleUrl: './callback.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCallbackComponent implements OnInit {
  private auth = inject(SpotifyAuthService);
  private router = inject(Router);
  private spotifyPlayer = inject(SpotifyPlayerService);
  private userService = inject(SpotifyUserService);
  error: string | null = null;

  async ngOnInit(): Promise<void> {
    console.log('🔄 AuthCallbackComponent ngOnInit started');
    console.log('📍 Current URL:', window.location.href);

    try {
      const result = await this.auth.handleCallbackFromUrl(window.location.href);
      console.log('🔍 Auth result:', result);

      if (result.ok) {
        console.log('✅ Auth successful, setting up services');

        // Set the access token in both services
        const token = this.auth.accessToken();
        if (token) {
          this.spotifyPlayer.setAccessToken(token);
          console.log('🎵 Access token set in SpotifyPlayerService');

          // Fetch user profile
          this.userService.fetchUserProfile().subscribe({
            next: (profile: any) => {
              console.log('👤 User profile loaded:', profile.display_name);
            },
            error: (error: any) => {
              console.log('❌ Failed to load user profile:', error);
            }
          });
        }

        console.log('🏠 Navigating to home');
        this.router.navigateByUrl('/');
      } else {
        console.log('❌ Auth failed:', result.error);
        this.error = result.error ?? 'Unknown error';
      }
    } catch (error) {
      console.log('💥 Exception in ngOnInit:', error);
      this.error = 'Authentication failed with exception';
    }
  }
}
