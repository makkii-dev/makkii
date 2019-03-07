// @flow

import { createMessager } from './messager/index'

const isBrowser = typeof window !== 'undefined'

const { bind, define, listener, ready, fn, addEventListener, removeEventListener, isConnect } = createMessager(
    (data: any) => { isBrowser && window.postMessageToNative && window.postMessageToNative(JSON.stringify(data)) }
);

if (isBrowser) {

    let originalPostMessage = window['originalPostMessage']

    if (originalPostMessage) {
        ready()
    } else {
        const descriptor: any = {
            get: function () {
                return originalPostMessage
            },
            set: function (value) {
                originalPostMessage = value
                if (originalPostMessage) {
                    setTimeout(ready, 50)
                }
            }
        };
        Object.defineProperty(window, 'originalPostMessage', descriptor)
    }
    document.addEventListener('message', e => {
        let data = JSON.parse(e.data);a
        if( typeof data === 'string')
            data = JSON.parse(data);
        listener(data);
    })

}

export {
    bind, define, fn, addEventListener, removeEventListener, isConnect
}
