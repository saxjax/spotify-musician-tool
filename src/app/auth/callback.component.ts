import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SpotifyAuthService } from './spotify-auth.service';

@Component({
  selector: 'app-auth-callback',
  template: `
    <section class="auth-callback">
      <h2>Finishing sign-in, not quite there yet…</h2>
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
    console.log('🔄 AuthCallbackComponent ngOnInit started');
    console.log('📍 Current URL:', window.location.href);

    try {
      const result = await this.auth.handleCallbackFromUrl(window.location.href);
      console.log('🔍 Auth result:', result);

      if (result.ok) {
        console.log('✅ Auth successful, navigating to home');
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
