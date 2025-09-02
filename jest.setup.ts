import '@testing-library/jest-dom';
import { TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

// Initialize Angular testing environment for zoneless
TestBed.initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
);

// Mock Spotify Web Playback SDK globally
Object.defineProperty(window, 'Spotify', {
  value: {
    Player: jest.fn().mockImplementation(() => ({
      addListener: jest.fn(),
      connect: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn(),
      getVolume: jest.fn().mockResolvedValue(0.5),
      setVolume: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn().mockResolvedValue(undefined),
      resume: jest.fn().mockResolvedValue(undefined),
      seek: jest.fn().mockResolvedValue(undefined),
      getCurrentState: jest.fn().mockResolvedValue(null),
      setName: jest.fn().mockResolvedValue(undefined),
      activateElement: jest.fn().mockResolvedValue(undefined)
    }))
  },
  writable: true
});
