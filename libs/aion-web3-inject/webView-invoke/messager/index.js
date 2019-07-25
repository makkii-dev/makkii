// @flow

import { createEventBus } from './event_bus'

class Deferred {
    promise: Promise<any>;
    resolve: (data: any) => void;
    reject: (reason: any) => void;
    constructor() {
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject
        })
    }
}

interface IPayload<T> {
    id: number,
    command: string,
    data: T,
    reply: boolean
}

let count = 0

function getUID() {
    return count++
}

type TCallback = (...data: any) => any

const getTransactionKey = (data: IPayload<any>) => `${data.command}(${data.id})`

const SYNC_COMMAND = 'RNWV:sync';
const SUCCESS = 'success';
const FAIL = 'fail';

export function createMessager(sendHandler) {
    let needWait =[];
    const eventBus = createEventBus();
    const transactions = {};
    const callbacks = {}; //
    const fn = {}; // all other side functions

    function isConnect() { return needWait.length===0 }

    function bind(name: string) {
        return (...args: any): Promise<any> => send(name, args)
    }

    function define(name: string, func: TCallback) {
        callbacks[name] = (args: any) => func(...args);
        isConnect() && sync();
        return { define, bind }
    }

    /** sender parts */
    function sender(data: IPayload<any>) {
        const force = data.command === SYNC_COMMAND; // force send the message when the message is the sync message
        if (!force && !isConnect()) {
            needWait.push(data)
        } else {
            sendHandler(data)
        }
        eventBus.emitEvent('send', data)
    }
    function initialize() {
        if (needWait) {
            const waiting = needWait;
            needWait = [];
            waiting.forEach(payload => {
                sender(payload)
            });
            eventBus.emitEvent('ready')
        }
    }

    function send(command: string, data: any) {
        const payload: IPayload<any> = {
            command, data, id: getUID(), reply: false
        };
        const defer = new Deferred();
        transactions[getTransactionKey(payload)] = defer;
        sender(payload);
        return defer.promise
    }

    function reply(data: IPayload<any>, result: any, status: string) {
        data.reply = true;
        data.data = result;
        data.status = status;
        sender(data)
    }

    /** listener parts */
    function listener(data: IPayload<any>) {
        if (data.reply) {
            const key = getTransactionKey(data);
            transactions[key] && (data.status === SUCCESS ? transactions[key].resolve(data.data) : transactions[key].reject(data.data))
        } else {
            if (callbacks[data.command]) {
                const result = callbacks[data.command](data.data);
                if (result && result.then) {
                    result.then(
                        d => {
                            reply(data, d, SUCCESS)
                        },
                        e => {
                            reply(data, e, FAIL)
                        })
                } else {
                    reply(data, result, SUCCESS)
                }
            } else {
                reply(data, null, FAIL)
            }
        }
        eventBus.emitEvent('receive', data)
    }



    const __sync = bind(SYNC_COMMAND);

    function _sync(defines: string[] = []) {
        defines.filter(d => !(d in fn))
            .map(d => {
                fn[d] = bind(d)
            });
        initialize();
        return Object.keys(callbacks)
    }

    define(SYNC_COMMAND, _sync);

    function sync() {
        __sync(Object.keys(callbacks)).then(_sync)
    }


    return { bind, define, listener, ready: sync, fn, addEventListener: eventBus.addEventListener, removeEventListener: eventBus.removeEventListener, isConnect }
}
