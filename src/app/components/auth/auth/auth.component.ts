import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthComponent {
  private auth = inject(SpotifyAuthService);

  async login(): Promise<void> {
    await this.auth.startLogin();
  }
}
