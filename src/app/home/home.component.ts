import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  template: `
    <section class="home">
      <p>Welcome! Use the button above to connect Spotify.</p>
    </section>
  `,
  styles: [`.home{padding:1rem}`],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}

