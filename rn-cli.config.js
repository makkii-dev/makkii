const nodeLibs = require('node-libs-react-native');

nodeLibs.vm = require.resolve('vm-browserify');
nodeLibs.fs = require.resolve('react-native-fs');
module.exports = {
    resolver: {
        extraNodeModules: nodeLibs,
    },
};
