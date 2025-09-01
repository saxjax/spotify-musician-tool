import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyUserService } from './spotify-user.service';
import { SpotifyAuthService } from '../auth/spotify-auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-profile">
      @if (userService.isLoading()) {
        <div class="loading">
          <div class="spinner"></div>
          <span>Loading profile...</span>
        </div>
      } @else if (userService.error()) {
        <div class="error">
          <span class="error-icon">⚠️</span>
          <span>{{ userService.error() }}</span>
          <button (click)="retry()" class="retry-btn">Retry</button>
        </div>
      } @else if (userService.userProfile(); as profile) {
        <div class="profile-content">
          <div class="profile-header">
            @if (userService.avatarUrl(); as avatarUrl) {
              <img [src]="avatarUrl" [alt]="profile.display_name + ' avatar'" class="avatar">
            } @else {
              <div class="avatar-placeholder">
                {{ getInitials(profile.display_name) }}
              </div>
            }
            
            <div class="profile-info">
              <h3 class="display-name">{{ profile.display_name }}</h3>
              <div class="profile-details">
                <span class="account-type" [class.premium]="userService.isPremium()">
                  {{ userService.isPremium() ? '👑 Premium' : '🆓 Free' }}
                </span>
                @if (userService.followerCount() > 0) {
                  <span class="followers">{{ userService.followerCount() }} followers</span>
                }
                <span class="country">{{ profile.country }}</span>
              </div>
            </div>
          </div>

          <div class="profile-stats">
            <div class="stat-item">
              <span class="stat-label">User ID</span>
              <span class="stat-value">{{ profile.id }}</span>
            </div>
            
            <div class="stat-item">
              <span class="stat-label">Email</span>
              <span class="stat-value">{{ profile.email }}</span>
            </div>
            
            <div class="stat-item">
              <span class="stat-label">Account Type</span>
              <span class="stat-value">{{ profile.product }}</span>
            </div>
            
            <div class="stat-item">
              <span class="stat-label">Spotify URI</span>
              <a [href]="profile.external_urls.spotify" target="_blank" class="stat-link">
                {{ profile.uri }}
              </a>
            </div>
          </div>

          @if (!userService.isPremium()) {
            <div class="premium-notice">
              <h4>🎵 Upgrade to Premium</h4>
              <p>
                To use playback control features like AB looping, you need a Spotify Premium account.
                Free accounts can only view playback information.
              </p>
              <a href="https://www.spotify.com/premium/" target="_blank" class="upgrade-btn">
                Upgrade to Premium
              </a>
            </div>
          } @else {
            <div class="premium-features">
              <h4>🎉 Premium Features Available</h4>
              <p>
                Your Premium account gives you access to all playback control features:
              </p>
              <ul>
                <li>✅ AB Loop control</li>
                <li>✅ Seek to any position</li>
                <li>✅ Play/pause control</li>
                <li>✅ Skip tracks</li>
                <li>✅ Volume control</li>
              </ul>
            </div>
          }

          <div class="actions">
            <button (click)="refreshProfile()" class="refresh-btn">
              🔄 Refresh Profile
            </button>
            <button (click)="logout()" class="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
      } @else {
        <div class="no-profile">
          <span>No profile data available</span>
          <button (click)="loadProfile()" class="load-btn">Load Profile</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .user-profile {
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 2rem;
      justify-content: center;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #1db954;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 1rem;
      background: #fee;
      border: 1px solid #fcc;
      border-radius: 8px;
      color: #c33;
    }

    .retry-btn {
      padding: 0.25rem 0.75rem;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
    }

    .retry-btn:hover {
      background: #c82333;
    }

    .profile-content {
      background: white;
      border: 1px solid #ddd;
      border-radius: 12px;
      overflow: hidden;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #1db954, #1ed760);
      color: white;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .avatar-placeholder {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      color: white;
      border: 3px solid white;
    }

    .profile-info {
      flex: 1;
    }

    .display-name {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: bold;
    }

    .profile-details {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 0.875rem;
      opacity: 0.9;
    }

    .account-type.premium {
      color: #ffd700;
      font-weight: bold;
    }

    .profile-stats {
      padding: 1.5rem;
      display: grid;
      gap: 1rem;
    }

    .stat-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }

    .stat-item:last-child {
      border-bottom: none;
    }

    .stat-label {
      font-weight: 600;
      color: #666;
    }

    .stat-value {
      font-family: monospace;
      color: #333;
    }

    .stat-link {
      color: #1db954;
      text-decoration: none;
      font-family: monospace;
    }

    .stat-link:hover {
      text-decoration: underline;
    }

    .premium-notice {
      margin: 1rem 1.5rem;
      padding: 1rem;
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 8px;
    }

    .premium-notice h4 {
      margin: 0 0 0.5rem 0;
      color: #856404;
    }

    .premium-notice p {
      margin: 0 0 1rem 0;
      color: #856404;
    }

    .upgrade-btn {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: #1db954;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      transition: background-color 0.2s;
    }

    .upgrade-btn:hover {
      background: #1ed760;
    }

    .premium-features {
      margin: 1rem 1.5rem;
      padding: 1rem;
      background: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 8px;
    }

    .premium-features h4 {
      margin: 0 0 0.5rem 0;
      color: #155724;
    }

    .premium-features p {
      margin: 0 0 0.5rem 0;
      color: #155724;
    }

    .premium-features ul {
      margin: 0;
      padding-left: 1rem;
      color: #155724;
    }

    .premium-features li {
      margin-bottom: 0.25rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: #f8f9fa;
      border-top: 1px solid #ddd;
    }

    .refresh-btn, .logout-btn, .load-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .refresh-btn {
      background: #007bff;
      color: white;
    }

    .refresh-btn:hover {
      background: #0056b3;
    }

    .logout-btn {
      background: #6c757d;
      color: white;
    }

    .logout-btn:hover {
      background: #545b62;
    }

    .load-btn {
      background: #1db954;
      color: white;
    }

    .load-btn:hover {
      background: #1ed760;
    }

    .no-profile {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserProfileComponent implements OnInit {
  userService = inject(SpotifyUserService);
  private auth = inject(SpotifyAuthService);

  ngOnInit(): void {
    // Auto-load profile if authenticated
    if (this.auth.isAuthenticated() && !this.userService.userProfile()) {
      this.loadProfile();
    }
  }

  loadProfile(): void {
    this.userService.fetchUserProfile().subscribe();
  }

  refreshProfile(): void {
    this.userService.fetchUserProfile().subscribe();
  }

  retry(): void {
    this.loadProfile();
  }

  logout(): void {
    this.userService.clearProfile();
    this.auth.logout();
    // Optionally redirect to login page
    window.location.href = '/';
  }

  getInitials(displayName: string): string {
    return displayName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
