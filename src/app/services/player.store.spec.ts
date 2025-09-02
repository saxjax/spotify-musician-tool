import { PlayerStore } from './player.store';

it('initial + clamp', () => {
  const s = new PlayerStore();
  expect(s.isPlaying()).toBe(false);
  s.togglePlay();
  expect(s.isPlaying()).toBe(true);
  s.setSpeed(3);
  expect(s.clampedSpeed()).toBe(2);
  s.setPitch(-99);
  expect(s.clampedPitch()).toBe(-12);
});
