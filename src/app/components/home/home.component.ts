import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SpotifyAuthService } from '../../services/spotify-auth.service';
import { SpotifyUserService } from '../../services/spotify-user.service';
import { AbLoopControlsComponent } from '../player/ab-loop-controls/ab-loop-controls.component';
import { UserProfileComponent } from '../user/user-profile/user-profile.component';
import { MusicSearchComponent } from '../player/music-search/music-search.component';
import { QuickStartPlaybackComponent } from '../player/quick-start-playback/quick-start-playback.component';
import { SpotifyPlayerService } from '../../services/spotify-player.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AbLoopControlsComponent, UserProfileComponent, MusicSearchComponent, QuickStartPlaybackComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  auth = inject(SpotifyAuthService);
  private spotifyPlayer = inject(SpotifyPlayerService);
  private userService = inject(SpotifyUserService);

  ngOnInit(): void {
    // Set up services when component initializes
    const token = this.auth.accessToken();
    if (token) {
      console.log('🎵 Setting up Spotify services');

      // Set access token for player service
      this.spotifyPlayer.setAccessToken(token);

      // Load user profile
      this.userService.fetchUserProfile().subscribe();
    }
  }
}
