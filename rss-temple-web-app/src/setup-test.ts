global.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
};

global.IntersectionObserver = class IntersectionObserver {
  get root() {
    return null;
  }

  get rootMargin() {
    return '';
  }

  get thresholds() {
    return [];
  }

  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
  takeRecords() {
    return [];
  }
};
