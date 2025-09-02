import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, interval, BehaviorSubject, EMPTY } from 'rxjs';
import { switchMap, filter, tap, catchError } from 'rxjs/operators';
import { PlayerStore } from './player.store';

export interface SpotifyPlaybackState {
  device?: {
    id: string;
    is_active: boolean;
    name: string;
    type: string;
    volume_percent: number;
  };
  progress_ms: number;
  is_playing: boolean;
  item?: {
    id: string;
    name: string;
    duration_ms: number;
    artists: Array<{ name: string }>;
    album: { name: string; images: Array<{ url: string }> };
  };
  timestamp: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  explicit: boolean;
  external_urls: {
    spotify: string;
  };
  artists: Array<{
    id: string;
    name: string;
    uri: string;
  }>;
  album: {
    id: string;
    name: string;
    uri: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
}

export interface SpotifySearchResult {
  tracks: {
    href: string;
    limit: number;
    next: string | null;
    offset: number;
    previous: string | null;
    total: number;
    items: SpotifyTrack[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class SpotifyPlayerService {
  private http = inject(HttpClient);
  private playerStore = inject(PlayerStore);

  private readonly SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
  private accessToken$ = new BehaviorSubject<string | null>(null);
  private monitoringSubscription: any = null;
  private abLoopCheckSubscription: any = null;

  constructor() {
    // Start monitoring when we have a token
    this.accessToken$.pipe(
      filter(token => !!token),
      switchMap(() => this.startPlaybackMonitoring())
    ).subscribe();
  }

  setAccessToken(token: string): void {
    this.accessToken$.next(token);
  }

  private getHeaders(): HttpHeaders {
    const token = this.accessToken$.value;
    if (!token) {
      throw new Error('No access token available');
    }

    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Get current playback state from Spotify
   */
  getCurrentPlaybackState(): Observable<SpotifyPlaybackState> {
    return this.http.get<SpotifyPlaybackState>(
      `${this.SPOTIFY_API_BASE}/me/player`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error getting playback state:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Seek to a specific position in the current track
   */
  seekToPosition(positionMs: number): Observable<void> {
    const params = new URLSearchParams({ position_ms: positionMs.toString() });

    return this.http.put<void>(
      `${this.SPOTIFY_API_BASE}/me/player/seek?${params}`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error seeking to position:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Pause playback
   */
  pausePlayback(): Observable<void> {
    return this.http.put<void>(
      `${this.SPOTIFY_API_BASE}/me/player/pause`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error pausing playback:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Resume playback
   */
  resumePlayback(): Observable<void> {
    return this.http.put<void>(
      `${this.SPOTIFY_API_BASE}/me/player/play`,
      {},
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error resuming playback:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Search for tracks
   */
  searchTracks(query: string, limit: number = 20): Observable<SpotifySearchResult> {
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: limit.toString(),
      market: 'from_token' // Use user's market
    });

    return this.http.get<SpotifySearchResult>(
      `${this.SPOTIFY_API_BASE}/search?${params}`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error searching tracks:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Play a specific track
   */
  playTrack(trackUri: string, deviceId?: string): Observable<void> {
    const body: any = {
      uris: [trackUri]
    };

    if (deviceId) {
      body.device_id = deviceId;
    }

    return this.http.put<void>(
      `${this.SPOTIFY_API_BASE}/me/player/play`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error playing track:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Play multiple tracks
   */
  playTracks(trackUris: string[], deviceId?: string): Observable<void> {
    const body: any = {
      uris: trackUris
    };

    if (deviceId) {
      body.device_id = deviceId;
    }

    return this.http.put<void>(
      `${this.SPOTIFY_API_BASE}/me/player/play`,
      body,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error playing tracks:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Get available devices
   */
  getAvailableDevices(): Observable<{ devices: Array<{ id: string; name: string; type: string; is_active: boolean; }> }> {
    return this.http.get<{ devices: Array<{ id: string; name: string; type: string; is_active: boolean; }> }>(
      `${this.SPOTIFY_API_BASE}/me/player/devices`,
      { headers: this.getHeaders() }
    ).pipe(
      catchError(error => {
        console.error('Error getting devices:', error);
        return EMPTY;
      })
    );
  }

  /**
   * Toggle play/pause
   */
  togglePlayback(): void {
    if (this.playerStore.isPlaying()) {
      this.pausePlayback().subscribe();
    } else {
      this.resumePlayback().subscribe();
    }
  }

  /**
   * Start monitoring playback state and sync with store
   */
  private startPlaybackMonitoring(): Observable<SpotifyPlaybackState> {
    // Poll every 1000ms for playback state
    return interval(1000).pipe(
      switchMap(() => this.getCurrentPlaybackState()),
      tap(state => this.updateStoreFromSpotifyState(state)),
      tap(() => this.checkAbLoop())
    );
  }

  /**
   * Update player store with Spotify playback state
   */
  private updateStoreFromSpotifyState(state: SpotifyPlaybackState): void {
    if (!state) return;

    // Update position and playing state
    this.playerStore.setPosition(state.progress_ms);
    this.playerStore.setIsPlaying(state.is_playing);

    // Update track info if available
    if (state.item) {
      this.playerStore.setCurrentTrack({
        id: state.item.id,
        name: state.item.name,
        artist: state.item.artists?.[0]?.name || 'Unknown Artist',
        album: state.item.album?.name || 'Unknown Album',
        imageUrl: state.item.album?.images?.[0]?.url || null
      });
      this.playerStore.setDuration(state.item.duration_ms);
    }

    // Update volume if available
    if (state.device?.volume_percent !== undefined) {
      this.playerStore.setVolume(state.device.volume_percent / 100);
    }
  }

  /**
   * Check if we need to loop back to point A
   */
  private checkAbLoop(): void {
    const isLooping = this.playerStore.isLooping();
    const loopA = this.playerStore.loopA();
    const loopB = this.playerStore.loopB();
    const currentPosition = this.playerStore.positionMs();
    const isPlaying = this.playerStore.isPlaying();

    if (isLooping && isPlaying && loopA !== null && loopB !== null) {
      // If we've passed loop point B, seek back to point A
      if (currentPosition >= loopB) {
        this.seekToPosition(loopA).subscribe(() => {
          console.log(`AB Loop: Jumping from ${loopB}ms back to ${loopA}ms`);
        });
      }
    }
  }

  /**
   * Set loop point A at current position
   */
  setLoopPointA(adjustmentInMs: number = 0): void {
    const currentPosition = this.playerStore.positionMs();
    const loopB = this.playerStore.loopB();
    const loopA = this.playerStore.loopA() && adjustmentInMs? this.playerStore.loopA()! + adjustmentInMs : currentPosition;

    this.playerStore.setLoopPoints(loopA, loopB);
    console.log(`Loop point A set at ${currentPosition}ms`);
  }

  /**
   * Set loop point B at current position
   */
  setLoopPointB(adjustmentInMs: number = 0): void {
    const currentPosition = this.playerStore.positionMs();
    const loopA = this.playerStore.loopA();

    this.playerStore.setLoopPoints(loopA, currentPosition);
    console.log(`Loop point B set at ${currentPosition}ms`);
  }

  /**
   * Clear both loop points
   */
  clearLoopPoints(): void {
    this.playerStore.setLoopPoints(null, null);
    this.playerStore.setLooping(false);
    console.log('Loop points cleared');
  }

  /**
   * Toggle AB looping on/off
   */
  toggleAbLoop(): void {
    const loopA = this.playerStore.loopA();
    const loopB = this.playerStore.loopB();

    if (loopA !== null && loopB !== null) {
      this.playerStore.setLooping(!this.playerStore.isLooping());
      console.log(`AB Loop ${this.playerStore.isLooping() ? 'enabled' : 'disabled'}`);
    } else {
      console.warn('Cannot enable AB loop: Both loop points must be set');
    }
  }

  /**
   * Jump to loop point A
   */
  jumpToLoopA(): void {
    const loopA = this.playerStore.loopA();
    if (loopA !== null) {
      this.seekToPosition(loopA).subscribe();
    }
  }

  /**
   * Jump to loop point B
   */
  jumpToLoopB(): void {
    const loopB = this.playerStore.loopB();
    if (loopB !== null) {
      this.seekToPosition(loopB).subscribe();
    }
  }

  /**
   * Seek relative to current position
   */
  seekRelative(deltaMs: number): void {
    const currentPosition = this.playerStore.positionMs();
    const duration = this.playerStore.durationMs();
    const newPosition = Math.max(0, Math.min(duration, currentPosition + deltaMs));

    this.seekToPosition(newPosition).subscribe();
  }

  /**
   * Clean up subscriptions
   */
  destroy(): void {
    if (this.monitoringSubscription) {
      this.monitoringSubscription.unsubscribe();
    }
    if (this.abLoopCheckSubscription) {
      this.abLoopCheckSubscription.unsubscribe();
    }
  }
}
