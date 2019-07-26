// @flow

import { createMessager } from './messager/index';

const isBrowser = typeof window !== 'undefined';

const {
  bind,
  define,
  listener,
  ready,
  fn,
  addEventListener,
  removeEventListener,
  isConnect,
} = createMessager((data: any) => {
  isBrowser &&
    window.ReactNativeWebView &&
    window.ReactNativeWebView.postMessage(JSON.stringify(data));
});

if (isBrowser) {
  let originalPostMessage = window.originalPostMessage;

  if (originalPostMessage) {
    ready();
  } else {
    const descriptor: any = {
      get() {
        return originalPostMessage;
      },
      set(value) {
        originalPostMessage = value;
        if (originalPostMessage) {
          setTimeout(ready, 50);
        }
      },
    };
    Object.defineProperty(window, 'originalPostMessage', descriptor);
  }
  document.addEventListener('FROM_RN', e => {
    listener(e.data);
  });
}

export { bind, define, fn, addEventListener, removeEventListener, isConnect };
