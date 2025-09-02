import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';

it('shows Connect Spotify', async () => {
  await TestBed.configureTestingModule({
    imports: [RouterTestingModule, AppComponent],
    providers: [provideZonelessChangeDetection()]
  }).compileComponents();

  const fixture = TestBed.createComponent(AppComponent);
  fixture.detectChanges();

  expect(fixture.nativeElement.textContent).toContain('Connect Spotify');
});
