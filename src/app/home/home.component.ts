import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { SpotifyAuthService } from '../auth/spotify-auth.service';
import { SpotifyPlayerService } from '../player/spotify-player.service';
import { SpotifyUserService } from '../user/spotify-user.service';
import { AbLoopControlsComponent } from '../player/ab-loop-controls.component';
import { UserProfileComponent } from '../user/user-profile.component';

@Component({
  selector: 'app-home',
  imports: [AbLoopControlsComponent, UserProfileComponent],
  template: `
    <section class="home">
      @if (auth.isAuthenticated()) {
        <div class="authenticated-content">
          <h2>🎵 Spotify Musician Tool</h2>
          <p>Connected to Spotify! Your profile and AB looping controls are ready.</p>
          
          <!-- User Profile Section -->
          <div class="profile-section">
            <h3>Your Spotify Profile</h3>
            <app-user-profile></app-user-profile>
          </div>
          
          <!-- AB Loop Controls Section -->
          <div class="controls-section">
            <h3>Playback & AB Loop Controls</h3>
            <p>Start playing a track in Spotify and use the controls below to practice with AB looping.</p>
            <app-ab-loop-controls></app-ab-loop-controls>
          </div>
          
          <div class="instructions">
            <h3>How to use AB Looping:</h3>
            <ol>
              <li>Start playing a track in Spotify</li>
              <li>Click "Set A" at the beginning of the section you want to practice</li>
              <li>Click "Set B" at the end of the section</li>
              <li>Click "Start Loop" to begin continuous looping</li>
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
    
    .profile-section,
    .controls-section {
      margin-bottom: 3rem;
    }
    
    .profile-section h3,
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

