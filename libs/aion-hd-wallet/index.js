import {AionAccount} from "./src/AionAccount";
import {AionTransaction} from "../../coins/aion/AionTransaction";
import bip39 from 'bip39';

const generateMnemonic = () => {
    return bip39.generateMnemonic();
};

const validateMnemonic = (mnemonic) => {
    return bip39.validateMnemonic(mnemonic)
};

export  {
    AionTransaction,
    AionAccount,
    generateMnemonic,
    validateMnemonic,
};
