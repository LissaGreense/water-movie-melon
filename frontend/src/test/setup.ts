import "@testing-library/jest-dom";

// PrimeReact components use ResizeObserver internally; jsdom doesn't provide it.
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
