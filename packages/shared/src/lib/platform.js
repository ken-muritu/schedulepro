export const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';

export const safeLocalStorage = {
  getItem: (key) => {
    if (isWeb) {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  setItem: (key, value) => {
    if (isWeb) {
      try {
        localStorage.setItem(key, value);
      } catch (e) {}
    }
  },
  key: (index) => {
    if (isWeb) {
      try {
        return localStorage.key(index);
      } catch (e) {
        return null;
      }
    }
    return null;
  },
  get length() {
    if (isWeb) {
      try {
        return localStorage.length;
      } catch (e) {
        return 0;
      }
    }
    return 0;
  }
};

export const safeWindow = isWeb ? window : {
  addEventListener: () => {},
  removeEventListener: () => {},
};

export const safeDocument = isWeb ? document : {
  addEventListener: () => {},
  removeEventListener: () => {},
  visibilityState: 'visible',
  documentElement: {
    style: {
      setProperty: () => {}
    }
  }
};
