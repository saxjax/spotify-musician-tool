import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Type, signal } from '@angular/core';

declare global {
  var jest: any;
}

/**
 * Sets up TestBed for zoneless testing according to Rainer Hahnekamp's best practices
 * https://www.rainerhahnekamp.com/en/how-do-i-test-signals-signal-computed-effect/
 */
export async function setupZonelessTest<T>(
  component: Type<T>,
  providers: any[] = []
): Promise<{ fixture: ComponentFixture<T>; component: T }> {
  TestBed.resetTestingModule();

  await TestBed.configureTestingModule({
    imports: [component],
    providers: [
      provideZonelessChangeDetection(),
      ...providers
    ]
  }).compileComponents();

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return { fixture, component: fixture.componentInstance };
}

/**
 * Creates a mock signal for testing - Rainer's approach
 */
export function createMockSignal<T>(initialValue: T) {
  return signal(initialValue);
}

/**
 * Helper to run effects in tests when not using change detection
 * According to Rainer: https://www.rainerhahnekamp.com/en/how-do-i-test-signals-signal-computed-effect/
 */
export function runEffects() {
  TestBed.flushEffects();
}

/**
 * Helper to create Jest spies for services with proper typing
 */
export function createServiceSpy<T extends Record<string, any>>(
  methods: (keyof T)[],
  properties: Partial<T> = {}
): Partial<T> {
  const spy = {} as any;

  // Add method spies
  methods.forEach(method => {
    spy[method] = jest.fn();
  });

  // Add property values
  Object.assign(spy, properties);

  return spy as Partial<T>;
}
