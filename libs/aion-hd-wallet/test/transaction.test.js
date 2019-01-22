import {AionTransaction} from "..";
import {Ed25519Key} from "../src/key/Ed25519Key";
import {expect} from 'chai';
import {Crypto} from "../src/utils/crypto";

describe('Aion Transaction test', function () {
    it('Transaction sign test ', function () {
        const params = {
            nonce: 0,
            to: '0xa00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c',
            value: '0x0',
            data: '',
            gas: 2000000,
            gasPrice: '0x2540be400',
            timestamp: 1548138095384915,
            type:'0x01',
        };
        let transaction = new AionTransaction(params);
        let keypair = Ed25519Key.fromSecretKey('0x7dfb08eb4f34fb588f9d48d8f02e617a5f07b80701dd93beb9ff466b1dc80fa73e7012bfc929a0c31b09b6d3e50128e1a3e3350ea9e407a929f7aa967c954102');
        transaction.sign(keypair);
        const signedtx = '0xf89c00a0a00a2d0d10ce8a2ea47a76fbb935405df2a12b0e2bc932f188f84b5f16da9c2c008087058005fd3d1953831e84808800000002540be40001b8603e7012bfc929a0c31b09b6d3e50128e1a3e3350ea9e407a929f7aa967c954102eadff6d4c9dfc1d0841f9764a6bef26d23c027909d86a6d7290621f666f7d2c1c09f1d8c82d0b9f1b9bc5aac41c906ef5852472c7d9b59182a164d68198ed408';
        expect(Crypto.toHex(transaction.getEncoded())).to.equal(signedtx);
    });
});