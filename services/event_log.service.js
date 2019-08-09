/* eslint-disable camelcase */
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';
import { Platform } from 'react-native';
import { HttpClient } from 'lib-common-util-js';

const sendEventLog = async eventLog => {
    try {
        const url = `${Config.app_server_api}/eventlog`;
        console.log(`PUT ${url}`);
        const { data: resp } = await HttpClient.put(url, eventLog, true);
        console.log('response payload:', resp);
        return resp;
    } catch (e) {
        throw e;
    }
};

const sendLoginEventLog = () => {
    try {
        sendEventLog({
            user: DeviceInfo.getDeviceId(),
            event: 'LOGIN',
            data: {
                platform: Platform.OS,
                version: DeviceInfo.getVersion(),
                versionCode: DeviceInfo.getBuildNumber(),
            },
        });
    } catch (e) {
        console.log(`send login event log error: ${e}`);
    }
};

const sendRegisterEventLog = () => {
    try {
        sendEventLog({
            user: DeviceInfo.getDeviceId(),
            event: 'REGISTER',
            data: {
                platform: Platform.OS,
            },
        });
    } catch (e) {
        console.log(`send register event log error: ${e}`);
    }
};

const sendRecoveryEventLog = () => {
    try {
        sendEventLog({
            user: DeviceInfo.getDeviceId(),
            event: 'RECOVERY',
            data: {
                platform: Platform.OS,
            },
        });
    } catch (e) {
        console.log(`send recovery event log error: ${e}`);
    }
};

const sendTransferEventLog = (coin, token, amount) => {
    try {
        sendEventLog({
            user: DeviceInfo.getDeviceId(),
            event: 'TRANSFER',
            data: {
                coin,
                token,
                amount,
            },
        });
    } catch (e) {
        console.log(`send transfer event log error: ${e}`);
    }
};

const sendDexExchangeEventLog = (src_token, dst_token, src_qty, dst_qty, wallet_id) => {
    try {
        sendEventLog({
            user: DeviceInfo.getDeviceId(),
            event: 'DEX_EXCHANGE',
            data: {
                src_token,
                src_qty,
                dst_token,
                dst_qty,
                wallet_id,
            },
        });
    } catch (e) {
        console.log(`send dex exchange event log error: ${e}`);
    }
};

export { sendEventLog, sendLoginEventLog, sendRegisterEventLog, sendRecoveryEventLog, sendTransferEventLog, sendDexExchangeEventLog };
