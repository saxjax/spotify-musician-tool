import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AuthComponent } from './auth.component';
import { SpotifyAuthService } from '../../../services/spotify-auth.service';

describe('AuthComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: SpotifyAuthService, useValue: jasmine.createSpyObj('SpotifyAuthService', ['startLogin']) }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AuthComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });
});
