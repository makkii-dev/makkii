import { keystoreClient } from 'react-native-makkii-core';
import Config from 'react-native-config';

const isTestNet = Config.is_testnet === 'true';

const client = keystoreClient(['AION', 'ETH', 'BTC', 'LTC', 'TRX'], isTestNet);

export default {
    ...client,
};
