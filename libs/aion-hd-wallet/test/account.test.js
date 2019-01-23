import {AionAccount} from "..";
import { expect } from 'chai';
//TODO add more ut
describe('Aion Account test', () => {
    it('Recover account0 test ', function () {
        const mnemonic = 'vague arm motion tackle health try illness stock employ visa witness farm';
        const expected_address = '0xa001f9aca9633728ac3a75c3fccbf7db3c79bfda3ed7ec07045d76286d022a3d';
        return AionAccount.recoverAccount(mnemonic).then(function(masterKey){
            masterKey.deriveHardened(0).then(function (data) {
                expect(data.address).to.equal(expected_address);
            });
        });
    });

    it('Recover account1 test ', function () {
        const mnemonic = 'vague arm motion tackle health try illness stock employ visa witness farm';
        const expected_address = '0xa07db213a2bfa556955b2990b48035f90567a8b021935eba5b368bd6c553adc4';
        return AionAccount.recoverAccount(mnemonic).then(function(masterKey){
            masterKey.deriveHardened(1).then(function (data) {
                expect(data.address).to.equal(expected_address);
            });
        });
    });

    it('import account test ', function () {
        const secretKey = '0xfa685c9368098fe4313c73193fd5c2072c5aed4ae8d75d99185ecdc8a677be5803ea58c243f6dde976fed0fce36bfcc61e428ce1c7697e5560ab5122b6de5d6d';
        const address = '0xa05ed4fcb3fd1c2b8d65f7a9cbff0e280e53b40e6399f9887c3e28b37b5d09bf';
        return AionAccount.importAccount(secretKey).then(function (data) {
            expect(data.address).to.equal(address);

        });
    });

});