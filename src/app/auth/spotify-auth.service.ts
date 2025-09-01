import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';

// Read non-secret configuration from Angular environment files
const SPOTIFY_CLIENT_ID = environment.spotify.clientId;
const SPOTIFY_REDIRECT_URI = environment.spotify.redirectUri; // Must match Spotify dashboard
const SPOTIFY_SCOPES = environment.spotify.scopes.join(' ');

const AUTH_STORAGE_KEY = 'spotify_auth';
const STATE_STORAGE_KEY = 'spotify_auth_state';
const VERIFIER_STORAGE_KEY = 'spotify_pkce_verifier';

type TokenSet = {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number; // seconds
  scope: string;
  refresh_token?: string;
  // computed
  expires_at?: number; // epoch ms
};

@Injectable({ providedIn: 'root' })
export class SpotifyAuthService {
  private _token = signal<TokenSet | null>(this.loadFromStorage());

  isAuthenticated = computed(() => !!this._token());
  accessToken = computed(() => this._token()?.access_token ?? null);

  // Public API
  async startLogin(): Promise<void> {
    const verifier = this.generateCodeVerifier();
    const challenge = await this.generateCodeChallenge(verifier);
    const state = this.randomState();

    sessionStorage.setItem(VERIFIER_STORAGE_KEY, verifier);
    sessionStorage.setItem(STATE_STORAGE_KEY, state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: SPOTIFY_CLIENT_ID,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      scope: SPOTIFY_SCOPES,
      state,
      code_challenge_method: 'S256',
      code_challenge: challenge,
    });
    const authorizeUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    window.location.assign(authorizeUrl);
  }

  async handleCallbackFromUrl(url: string): Promise<{ ok: boolean; error?: string }> {
    const u = new URL(url, window.location.origin);
    const code = u.searchParams.get('code');
    const state = u.searchParams.get('state');
    const storedState = sessionStorage.getItem(STATE_STORAGE_KEY);
    const verifier = sessionStorage.getItem(VERIFIER_STORAGE_KEY);

    if (!code) return { ok: false, error: 'Missing authorization code' };
    if (!state || !storedState || state !== storedState) return { ok: false, error: 'Invalid state' };
    if (!verifier) return { ok: false, error: 'Missing PKCE verifier' };

    try {
      const token = await this.exchangeCodeForToken({ code, verifier });
      this.setToken(token);
      // Clear one-time values
      sessionStorage.removeItem(STATE_STORAGE_KEY);
      sessionStorage.removeItem(VERIFIER_STORAGE_KEY);
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? 'Token exchange failed' };
    }
  }

  async refresh(): Promise<boolean> {
    const current = this._token();
    if (!current?.refresh_token) return false;
    try {
      const res = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: current.refresh_token,
          client_id: SPOTIFY_CLIENT_ID,
        }),
      });
      if (!res.ok) throw new Error(`Refresh failed (${res.status})`);
      const data = (await res.json()) as Partial<TokenSet> & { access_token: string; expires_in: number };
      const next: TokenSet = {
        access_token: data.access_token,
        token_type: 'Bearer',
        expires_in: data.expires_in,
        scope: data.scope ?? current.scope,
        refresh_token: data.refresh_token ?? current.refresh_token,
      };
      this.setToken(next);
      return true;
    } catch {
      return false;
    }
  }

  logout(): void {
    this._token.set(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }

  // Helpers
  private async exchangeCodeForToken(params: { code: string; verifier: string }): Promise<TokenSet> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: params.code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      code_verifier: params.verifier,
    });
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Token endpoint error (${res.status}): ${text}`);
    }
    const token = (await res.json()) as TokenSet;
    return token;
  }

  private setToken(token: TokenSet): void {
    const expiresAt = Date.now() + token.expires_in * 1000 - 5_000; // small skew buffer
    const withExp = { ...token, expires_at: expiresAt };
    this._token.set(withExp);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(withExp));
  }

  private loadFromStorage(): TokenSet | null {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as TokenSet;
      if (parsed.expires_at && parsed.expires_at > Date.now()) return parsed;
      return null;
    } catch {
      return null;
    }
  }

  private randomState(): string {
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateCodeVerifier(): string {
    const arr = new Uint8Array(64);
    crypto.getRandomValues(arr);
    return this.base64UrlEncode(arr);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const data = new TextEncoder().encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    let str = btoa(String.fromCharCode(...bytes));
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
}
