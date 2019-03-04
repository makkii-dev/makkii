// @flow

import { createMessager } from './messager/index'

export default (getWebview: () => any) => {
    const { bind, define, listener, fn, addEventListener, removeEventListener, isConnect } = createMessager(
        (data: any) => getWebview().postMessage(JSON.stringify(data))
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
                console.log('listener data ', typeof data, ' ', data);
            } catch (e) { }
            data && listener(data)
        },
        addEventListener, removeEventListener, isConnect
    }
}
