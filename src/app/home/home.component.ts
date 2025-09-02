import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SpotifyAuthService } from '../auth/spotify-auth.service';
import { SpotifyPlayerService } from '../player/spotify-player.service';
import { SpotifyUserService } from '../user/spotify-user.service';
import { AbLoopControlsComponent } from '../player/ab-loop-controls.component';
import { UserProfileComponent } from '../user/user-profile.component';
import { MusicSearchComponent } from '../player/music-search.component';
import { QuickStartPlaybackComponent } from '../player/quick-start-playback.component';

@Component({
  selector: 'app-home',
  imports: [AbLoopControlsComponent, UserProfileComponent, MusicSearchComponent, QuickStartPlaybackComponent],
  template: `
    <section class="home">
      @if (auth.isAuthenticated()) {
        <div class="authenticated-content">
          <h2>🎵 Spotify Musician Tool</h2>
          <p>Connected to Spotify! Control playback and practice with AB looping.</p>

          <!-- Quick Start Section - Most Prominent -->
          <div class="quick-start-section">
            <app-quick-start-playback></app-quick-start-playback>
          </div>
                    <!-- AB Loop Controls Section -->
          <div class="controls-section">
            <h3>AB Loop Controls</h3>
            <p>Once music is playing, use these controls to practice specific sections.</p>
            <app-ab-loop-controls></app-ab-loop-controls>
          </div>

          <!-- User Profile Section -->
          <div class="profile-section">
            <h3>Your Spotify Profile</h3>
            <app-user-profile></app-user-profile>
          </div>

          <!-- Music Search & Play Section -->
          <div class="search-section">
            <h3>Search & Play Different Songs</h3>
            <details>
              <summary>Click to expand music search</summary>
              <app-music-search></app-music-search>
            </details>
          </div>

          <div class="instructions">
            <h3>How to use this tool:</h3>
            <ol>
              <li><strong>Quick Start:</strong> Select any song in Spotify, then click "Start Playing" above</li>
              <li><strong>Set Loop Points:</strong> While playing, click "Set A" and "Set B" to mark the section you want to practice</li>
              <li><strong>Loop:</strong> Click "Start Loop" to continuously repeat the selected section</li>
              <li><strong>Practice:</strong> Use the controls to jump to loop points, skip around, or adjust playback</li>
            </ol>
            <p><strong>Note:</strong> You need Spotify Premium for playback control to work.</p>
          </div>
        </div>
      } @else {
        <div class="unauthenticated-content">
          <h2>Welcome to Spotify Musician Tool</h2>
          <p>Connect your Spotify account to start practicing with AB looping!</p>
          <p>Use the "Connect Spotify" button above to get started.</p>
        </div>
      }
    </section>
  `,
  styles: [`
    .home {
      padding: 1rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .authenticated-content h2 {
      color: #1db954;
      margin-bottom: 1rem;
      text-align: center;
    }

    .authenticated-content > p {
      text-align: center;
      margin-bottom: 2rem;
      color: #666;
    }

    .quick-start-section {
      margin-bottom: 3rem;
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 1rem;
      border-radius: 12px;
      border: 2px solid #1db954;
    }

    .profile-section,
    .search-section,
    .controls-section {
      margin-bottom: 3rem;
    }

    .profile-section h3,
    .search-section h3,
    .controls-section h3 {
      color: #333;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #1db954;
    }

    .controls-section > p {
      color: #666;
      margin-bottom: 1rem;
    }

    .search-section details {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      background: white;
    }

    .search-section summary {
      cursor: pointer;
      font-weight: bold;
      color: #1db954;
      margin-bottom: 1rem;
    }

    .search-section details[open] summary {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #eee;
    }

    .instructions {
      margin-top: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 8px;
      border-left: 4px solid #1db954;
    }

    .instructions h3 {
      margin-top: 0;
      color: #333;
    }

    .instructions ol {
      margin: 1rem 0;
    }

    .instructions li {
      margin-bottom: 0.5rem;
    }

    .instructions strong {
      color: #1db954;
    }

    .unauthenticated-content {
      text-align: center;
      padding: 2rem;
    }

    .unauthenticated-content h2 {
      color: #333;
      margin-bottom: 1rem;
    }
  `],
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

