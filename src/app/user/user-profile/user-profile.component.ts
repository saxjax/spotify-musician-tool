import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpotifyUserService } from '../spotify-user.service';
import { SpotifyAuthService } from '../../auth/spotify-auth.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
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
