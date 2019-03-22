// @flow

import { createMessager } from './messager/index'

export default (getWebview) => {
    const { bind, define, listener, fn, addEventListener, removeEventListener, isConnect } = createMessager(
        (data: any) => {
            const injectCode = `{ let evt = document.createEvent('events');\n`+
                `evt.initEvent('FROM_RN',true,false);\n` +
                `evt.data = ${JSON.stringify(data)};\n` +
                `document.dispatchEvent(evt);\n`+
                `}`;
            getWebview&&getWebview().injectJavaScript(injectCode)
        }
    );
    return {
        bind, define, fn,
        listener: (e: any) => {
            let data: any;
            try {
                // FIX: webpack hotloader will triger this
                data = JSON.parse(e.nativeEvent.data);
                if( typeof data === 'string')
                    data = JSON.parse(data);
            } catch (e) { }
            data && listener(data)
        },
        addEventListener, removeEventListener, isConnect
    }
}
