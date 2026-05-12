import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpotifyUserService } from '../../../services/spotify-user.service';

@Component({
  selector: 'app-user-profile',
  template: `
    @if (userService.isLoading()) {
      <p>Loading profile...</p>
    } @else if (userService.error()) {
      <p class="error">{{ userService.error() }}</p>
    } @else if (userService.userProfile()) {
      <div class="user-profile">
        @if (userService.avatarUrl(); as avatarUrl) {
          <img [src]="avatarUrl" [alt]="userService.displayName()" class="avatar" />
        }
        <div class="profile-info">
          <span class="name">{{ userService.displayName() }}</span>
          <span class="account-type">{{ userService.isPremium() ? 'Premium' : 'Free' }}</span>
        </div>
      </div>
    }
  `,
  styles: `
    .user-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
    }
    .profile-info {
      display: flex;
      flex-direction: column;
    }
    .name {
      font-weight: 600;
    }
    .account-type {
      font-size: 0.85rem;
      color: #888;
    }
    .error {
      color: #e74c3c;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent {
  userService = inject(SpotifyUserService);
}
