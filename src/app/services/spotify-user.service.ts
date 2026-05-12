import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { SpotifyAuthService } from './spotify-auth.service';

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  country: string;
  product: string; // 'free' or 'premium'
  followers: {
    href: string | null;
    total: number;
  };
  images: Array<{
    url: string;
    height: number | null;
    width: number | null;
  }>;
  external_urls: {
    spotify: string;
  };
  href: string;
  type: string;
  uri: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyUserService {
  private http = inject(HttpClient);
  private auth = inject(SpotifyAuthService);

  private readonly SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

  // User profile state
  private _userProfile = signal<SpotifyUser | null>(null);
  private _isLoading = signal(false);
  private _error = signal<string | null>(null);

  // Public getters
  userProfile = this._userProfile.asReadonly();
  isLoading = this._isLoading.asReadonly();
  error = this._error.asReadonly();

  // Computed properties
  displayName = computed(() => this._userProfile()?.display_name || 'Unknown User');
  avatarUrl = computed(() => this._userProfile()?.images?.[0]?.url || null);
  isPremium = computed(() => this._userProfile()?.product === 'premium');
  followerCount = computed(() => this._userProfile()?.followers?.total || 0);

  /**
   * Fetch current user's profile from Spotify API
   */
  fetchUserProfile(): Observable<SpotifyUser> {
    const token = this.auth.accessToken();
    if (!token) {
      console.error('No access token available for user profile fetch');
      this._error.set('Not authenticated');
      return EMPTY;
    }

    this._isLoading.set(true);
    this._error.set(null);

    return this.http.get<SpotifyUser>(`${this.SPOTIFY_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }).pipe(
      tap(profile => {
        this._userProfile.set(profile);
        this._isLoading.set(false);
        console.log('✅ User profile loaded:', profile);
      }),
      catchError(error => {
        console.error('❌ Error fetching user profile:', error);
        this._error.set(`Failed to load profile: ${error.status} ${error.statusText}`);
        this._isLoading.set(false);
        return EMPTY;
      })
    );
  }

  /**
   * Clear user profile data (for logout)
   */
  clearProfile(): void {
    this._userProfile.set(null);
    this._error.set(null);
    this._isLoading.set(false);
  }

  /**
   * Check if user has Premium (required for playback control)
   */
  checkPremiumStatus(): boolean {
    const profile = this._userProfile();
    if (!profile) {
      console.warn('No user profile loaded');
      return false;
    }

    const isPremium = profile.product === 'premium';
    if (!isPremium) {
      console.warn('User does not have Spotify Premium - playback control will not work');
    }

    return isPremium;
  }

  /**
   * Get user's country for market-specific content
   */
  getUserMarket(): string | null {
    return this._userProfile()?.country || null;
  }

  /**
   * Format user's profile data for display
   */
  getProfileSummary(): string {
    const profile = this._userProfile();
    if (!profile) return 'No profile data';

    const premium = profile.product === 'premium' ? '👑 Premium' : '🆓 Free';
    const followers = profile.followers.total > 0 ? `${profile.followers.total} followers` : 'No followers';

    return `${profile.display_name} (${premium}) • ${followers} • ${profile.country}`;
  }
}
