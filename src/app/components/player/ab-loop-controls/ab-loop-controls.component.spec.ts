import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbLoopControlsComponent } from './ab-loop-controls.component';
import { PlayerStore } from '../../../services/player.store';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { SpotifyPlayerService } from '../../../services/spotify-player.service';

describe('AbLoopControlsComponent', () => {
  let component: AbLoopControlsComponent;
  let fixture: ComponentFixture<AbLoopControlsComponent>;
  let mockPlayerStore: jasmine.SpyObj<PlayerStore>;
  let mockSpotifyPlayerService: jasmine.SpyObj<SpotifyPlayerService>;

  beforeEach(async () => {
    const playerStoreSpy = jasmine.createSpyObj('PlayerStore', [], {
      currentTrack: signal({ name: 'Test Song', artist: 'Test Artist' }),
      positionMs: signal(30000),
      durationMs: signal(180000),
      isPlaying: signal(false),
      loopA: signal(null),
      loopB: signal(null),
      isLooping: signal(false)
    });

    const spotifyPlayerServiceSpy = jasmine.createSpyObj('SpotifyPlayerService', [
      'seekRelative',
      'togglePlayback',
      'resumePlayback',
      'setLoopPointA',
      'setLoopPointB',
      'jumpToLoopA',
      'jumpToLoopB',
      'toggleAbLoop',
      'clearLoopPoints',
      'seekToPosition',
      'destroy'
    ]);

    spotifyPlayerServiceSpy.resumePlayback.and.returnValue(of({}));
    spotifyPlayerServiceSpy.seekToPosition.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [AbLoopControlsComponent],
      providers: [
        { provide: PlayerStore, useValue: playerStoreSpy },
        { provide: SpotifyPlayerService, useValue: spotifyPlayerServiceSpy }
      ]
    }).compileComponents();

    mockPlayerStore = TestBed.inject(PlayerStore) as jasmine.SpyObj<PlayerStore>;
    mockSpotifyPlayerService = TestBed.inject(SpotifyPlayerService) as jasmine.SpyObj<SpotifyPlayerService>;

    fixture = TestBed.createComponent(AbLoopControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should format time correctly', () => {
    expect(component.currentTime()).toBe('0:30');
    expect(component.totalTime()).toBe('3:00');
  });

  it('should call seekRelative when seek buttons are clicked', () => {
    component.seekRelative(-5000);
    expect(mockSpotifyPlayerService.seekRelative).toHaveBeenCalledWith(-5000);

    component.seekRelative(5000);
    expect(mockSpotifyPlayerService.seekRelative).toHaveBeenCalledWith(5000);
  });

  it('should call togglePlayback when play/pause button is clicked', () => {
    component.togglePlayback();
    expect(mockSpotifyPlayerService.togglePlayback).toHaveBeenCalled();
  });

  it('should call resumePlayback when start button is clicked', () => {
    component.startPlayback();
    expect(mockSpotifyPlayerService.resumePlayback).toHaveBeenCalled();
  });

  it('should set loop points correctly', () => {
    component.setLoopPoint('A');
    expect(mockSpotifyPlayerService.setLoopPointA).toHaveBeenCalled();

    component.setLoopPoint('B');
    expect(mockSpotifyPlayerService.setLoopPointB).toHaveBeenCalled();
  });

  it('should adjust loop points correctly', () => {
    component.adjustLoopPoint('A', 500);
    expect(mockSpotifyPlayerService.setLoopPointA).toHaveBeenCalledWith(500);
    expect(mockSpotifyPlayerService.jumpToLoopA).toHaveBeenCalled();

    component.adjustLoopPoint('B', -500);
    expect(mockSpotifyPlayerService.setLoopPointB).toHaveBeenCalledWith(-500);
    expect(mockSpotifyPlayerService.jumpToLoopB).toHaveBeenCalled();
  });

  it('should jump to loop points correctly', () => {
    component.jumpToLoopPoint('A');
    expect(mockSpotifyPlayerService.jumpToLoopA).toHaveBeenCalled();

    component.jumpToLoopPoint('B');
    expect(mockSpotifyPlayerService.jumpToLoopB).toHaveBeenCalled();
  });

  it('should toggle loop correctly', () => {
    component.toggleLoop();
    expect(mockSpotifyPlayerService.toggleAbLoop).toHaveBeenCalled();
  });

  it('should clear loop points correctly', () => {
    component.clearLoopPoints();
    expect(mockSpotifyPlayerService.clearLoopPoints).toHaveBeenCalled();
  });

  it('should calculate progress percentage correctly', () => {
    expect(component.progressPercentage()).toBe((30000 / 180000) * 100);
  });

  it('should determine if loop can be enabled', () => {
    expect(component.canLoop()).toBe(false);
  });

  it('should provide correct loop status', () => {
    expect(component.loopStatusClass()).toBe('inactive');
    expect(component.loopStatusText()).toBe('Set points A and B to enable looping');
  });

  it('should handle progress bar clicks', () => {
    const mockEvent = {
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 0,
          width: 100
        })
      },
      clientX: 50
    } as unknown as MouseEvent;

    component.onProgressClick(mockEvent);
    expect(mockSpotifyPlayerService.seekToPosition).toHaveBeenCalledWith(90000); // 50% of 180000ms
  });

  it('should destroy spotify player on component destroy', () => {
    component.ngOnDestroy();
    expect(mockSpotifyPlayerService.destroy).toHaveBeenCalled();
  });
});
