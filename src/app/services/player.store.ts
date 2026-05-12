import { signal, computed, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PlayerStore {
  // Core signals
  private _currentTrack = signal<any>(null);
  private _isPlaying = signal(false);
  private _positionMs = signal(0);
  private _durationMs = signal(0);
  private _volume = signal(1);
  private _speed = signal(1);
  private _pitchSemitones = signal(0);
  private _loopA = signal<number | null>(null);
  private _loopB = signal<number | null>(null);
  private _isLooping = signal(false);

  // Public getters
  currentTrack = this._currentTrack.asReadonly();
  isPlaying = this._isPlaying.asReadonly();
  positionMs = this._positionMs.asReadonly();
  durationMs = this._durationMs.asReadonly();
  volume = this._volume.asReadonly();
  speed = this._speed.asReadonly();
  pitchSemitones = this._pitchSemitones.asReadonly();
  loopA = this._loopA.asReadonly();
  loopB = this._loopB.asReadonly();
  isLooping = this._isLooping.asReadonly();

  // Computed values with clamping
  clampedSpeed = computed(() => {
    const speed = this._speed();
    return Math.max(0.5, Math.min(2, speed));
  });

  clampedPitch = computed(() => {
    const pitch = this._pitchSemitones();
    return Math.max(-6, Math.min(6, pitch));
  });

  // Actions
  togglePlay(): void {
    this._isPlaying.update(playing => !playing);
  }

  setIsPlaying(isPlaying: boolean): void {
    this._isPlaying.set(isPlaying);
  }

  setSpeed(speed: number): void {
    this._speed.set(speed);
  }

  setPitch(pitch: number): void {
    this._pitchSemitones.set(pitch);
  }

  setCurrentTrack(track: any): void {
    this._currentTrack.set(track);
  }

  setPosition(positionMs: number): void {
    this._positionMs.set(positionMs);
  }

  setDuration(durationMs: number): void {
    this._durationMs.set(durationMs);
  }

  setVolume(volume: number): void {
    this._volume.set(Math.max(0, Math.min(1, volume)));
  }

  setLoopPoints(loopA: number | null, loopB: number | null): void {
    this._loopA.set(loopA);
    this._loopB.set(loopB);
  }

  setLooping(isLooping: boolean): void {
    this._isLooping.set(isLooping);
  }
}
