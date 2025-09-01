import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyAuthService } from './spotify-auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <section class="auth-callback">
      <h2>Finishing sign-in…</h2>
      @if (error) {
        <p>Error: {{ error }}</p>
      }
    </section>
  `,
  styles: [`.auth-callback{padding:1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthCallbackComponent implements OnInit {
  private auth = inject(SpotifyAuthService);
  private router = inject(Router);
  error: string | null = null;

  async ngOnInit(): Promise<void> {
    const result = await this.auth.handleCallbackFromUrl(window.location.href);
    if (result.ok) {
      // Navigate to home (or wherever makes sense)
      this.router.navigateByUrl('/');
    } else {
      this.error = result.error ?? 'Unknown error';
    }
  }
}
