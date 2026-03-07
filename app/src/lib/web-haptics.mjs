/*
MIT License

Copyright (c) 2025 Lochie Axon

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Vendored and simplified from web-haptics@0.0.6:
https://github.com/lochie/web-haptics
*/

export const version = "0.0.6";

export const defaultPatterns = {
  success: {
    pattern: [
      { duration: 30, intensity: 0.5 },
      { delay: 60, duration: 40, intensity: 1 },
    ],
  },
  warning: {
    pattern: [
      { duration: 40, intensity: 0.8 },
      { delay: 100, duration: 40, intensity: 0.6 },
    ],
  },
  error: {
    pattern: [
      { duration: 40, intensity: 0.9 },
      { delay: 40, duration: 40, intensity: 0.9 },
      { delay: 40, duration: 40, intensity: 0.9 },
    ],
  },
  light: { pattern: [{ duration: 15, intensity: 0.4 }] },
  medium: { pattern: [{ duration: 25, intensity: 0.7 }] },
  heavy: { pattern: [{ duration: 35, intensity: 1 }] },
  soft: { pattern: [{ duration: 40, intensity: 0.5 }] },
  rigid: { pattern: [{ duration: 10, intensity: 1 }] },
  selection: { pattern: [{ duration: 8, intensity: 0.3 }] },
  nudge: {
    pattern: [
      { duration: 80, intensity: 0.8 },
      { delay: 80, duration: 50, intensity: 0.3 },
    ],
  },
  buzz: { pattern: [{ duration: 1000, intensity: 1 }] },
};

const MAX_DURATION = 1000;
const INTENSITY_SLICE_MS = 20;

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function normalizeInput(input) {
  if (typeof input === "number") {
    return { vibrations: [{ duration: input }] };
  }

  if (typeof input === "string") {
    const preset = defaultPatterns[input];
    if (!preset) {
      console.warn(`[web-haptics] Unknown preset: "${input}"`);
      return null;
    }

    return {
      vibrations: preset.pattern.map((entry) => ({ ...entry })),
    };
  }

  if (Array.isArray(input)) {
    if (input.length === 0) {
      return { vibrations: [] };
    }

    if (typeof input[0] === "number") {
      const pattern = input;
      const vibrations = [];

      for (let index = 0; index < pattern.length; index += 2) {
        const previousDelay = index > 0 ? pattern[index - 1] : 0;
        vibrations.push({
          ...(previousDelay > 0 ? { delay: previousDelay } : {}),
          duration: pattern[index],
        });
      }

      return { vibrations };
    }

    return {
      vibrations: input.map((entry) => ({ ...entry })),
    };
  }

  if (input?.pattern) {
    return {
      vibrations: input.pattern.map((entry) => ({ ...entry })),
    };
  }

  return null;
}

function splitDurationByIntensity(duration, intensity) {
  if (intensity >= 1) {
    return [duration];
  }

  if (intensity <= 0) {
    return [];
  }

  const onSlice = Math.max(1, Math.round(INTENSITY_SLICE_MS * intensity));
  const offSlice = INTENSITY_SLICE_MS - onSlice;
  const slices = [];
  let remaining = duration;

  while (remaining >= INTENSITY_SLICE_MS) {
    slices.push(onSlice);
    slices.push(offSlice);
    remaining -= INTENSITY_SLICE_MS;
  }

  if (remaining > 0) {
    const partialOn = Math.max(1, Math.round(remaining * intensity));
    slices.push(partialOn);

    const partialOff = remaining - partialOn;
    if (partialOff > 0) {
      slices.push(partialOff);
    }
  }

  return slices;
}

function toVibrationPattern(vibrations, defaultIntensity) {
  const pattern = [];

  for (const vibration of vibrations) {
    const intensity = clamp(vibration.intensity ?? defaultIntensity);
    const delay = vibration.delay ?? 0;

    if (delay > 0) {
      if (pattern.length > 0 && pattern.length % 2 === 0) {
        pattern[pattern.length - 1] += delay;
      } else {
        if (pattern.length === 0) {
          pattern.push(0);
        }
        pattern.push(delay);
      }
    }

    const slices = splitDurationByIntensity(vibration.duration, intensity);
    if (slices.length === 0) {
      if (pattern.length > 0 && pattern.length % 2 === 0) {
        pattern[pattern.length - 1] += vibration.duration;
      } else if (vibration.duration > 0) {
        pattern.push(0);
        pattern.push(vibration.duration);
      }
      continue;
    }

    for (const slice of slices) {
      pattern.push(slice);
    }
  }

  return pattern;
}

function sanitizeVibrations(vibrations, fallbackIntensity) {
  return vibrations.map((entry) => {
    const duration = Math.min(entry.duration, MAX_DURATION);
    const delay = entry.delay ?? 0;

    if (
      !Number.isFinite(duration) ||
      duration < 0 ||
      !Number.isFinite(delay) ||
      delay < 0
    ) {
      throw new Error(
        "[web-haptics] Invalid vibration values. Durations and delays must be finite non-negative numbers.",
      );
    }

    return {
      duration,
      ...(delay > 0 ? { delay } : {}),
      intensity: clamp(entry.intensity ?? fallbackIntensity),
    };
  });
}

export class WebHaptics {
  static isSupported =
    typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

  async trigger(input = [{ duration: 25, intensity: 0.7 }], options = {}) {
    const normalized = normalizeInput(input);

    if (!normalized || normalized.vibrations.length === 0) {
      return;
    }

    const intensity = clamp(options.intensity ?? 0.5);
    const vibrations = sanitizeVibrations(normalized.vibrations, intensity);

    if (WebHaptics.isSupported) {
      navigator.vibrate(toVibrationPattern(vibrations, intensity));
    }
  }

  cancel() {
    if (WebHaptics.isSupported) {
      navigator.vibrate(0);
    }
  }

  destroy() {
    this.cancel();
  }

  setDebug() {}

  setShowSwitch() {}
}
