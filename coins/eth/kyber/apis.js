const getKyberUrl = (network) => 'mainnet' === network?
    'https//api.kyber.network':`https://${network}-api.kyber.network`;


