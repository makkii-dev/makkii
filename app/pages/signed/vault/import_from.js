import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Platform, Image, Text, TouchableOpacity, FlatList, View, Dimensions, StyleSheet, PixelRatio } from 'react-native';
import { strings } from '../../../../locales/i18n';
import { mainBgColor } from '../../../style_util';
import { IMPORT_SOURCE } from './constants';
import Loading from '../../../components/Loading';
import { getLedgerMessage } from '../../../../utils';
import { alertOk } from '../../../components/common';
import { createAction, navigate } from '../../../../utils/dva';

const { width } = Dimensions.get('window');

class ImportFrom extends Component {
    static navigationOptions = () => {
        return {
            title: strings('vault_import_source.title'),
        };
    };

    importFromMasterKey = () => {
        const { dispatch } = this.props;
        this.refs.refLoading.show();
        dispatch(createAction('accountImportModel/fromMasterKey')()).then(() => {
            this.refs.refLoading.hide();
            navigate('signed_vault_set_account_name')({ dispatch });
        });
    };

    importFromPrivateKey = () => {
        navigate('signed_vault_import_private_key')(this.props);
    };

    importFromLedger = () => {
        const { dispatch, symbol } = this.props;
        console.log(`import ${symbol} from ledger`);
        this.refs.refLoading.show(strings('ledger.toast_connecting'));
        dispatch(createAction('accountImportModel/getLedgerStatus')()).then(ret => {
            this.refs.refLoading.hide();
            if (ret.status) {
                navigate('signed_vault_import_list')({ dispatch });
            } else {
                alertOk(strings('alert_title_error'), getLedgerMessage(ret.code));
            }
        });
    };

    renderItem = ({ item }) => {
        const cellHeight = 60;
        return (
            <TouchableOpacity
                activeOpaicty={1}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    backgroundColor: '#fff',
                    justifyContent: 'space-between',
                    height: cellHeight,
                }}
                onPress={() => {
                    item.callback();
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                        source={item.icon}
                        style={{
                            width: 30,
                            height: 30,
                        }}
                        resizeMode="contain"
                    />
                    <Text numberOfLines={1} style={{ paddingLeft: 10 }}>
                        {strings(item.title)}
                    </Text>
                </View>
                <Image style={{ width: 24, height: 24 }} source={require('../../../../assets/arrow_right.png')} resizeMode="contain" />
            </TouchableOpacity>
        );
    };

    render() {
        IMPORT_SOURCE[0].callback = this.importFromMasterKey;
        IMPORT_SOURCE[1].callback = this.importFromPrivateKey;
        IMPORT_SOURCE[3].callback = this.importFromLedger;
        const data = [IMPORT_SOURCE[0], IMPORT_SOURCE[1]];
        const { symbol } = this.props;
        if (symbol === 'AION' && Platform.OS === 'android') {
            data.push(IMPORT_SOURCE[3]);
        }
        return (
            <View
                style={{
                    backgroundColor: mainBgColor,
                    alignItems: 'center',
                    flex: 1,
                    paddingTop: 20,
                }}
            >
                <FlatList style={{ width }} data={data} renderItem={this.renderItem} ItemSeparatorComponent={() => <View style={styles.divider} />} keyExtractor={item => item.title} />
                <Loading ref="refLoading" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    divider: {
        height: 1 / PixelRatio.get(),
        backgroundColor: '#dfdfdf',
    },
});

const mapToState = ({ accountImportModel }) => ({
    symbol: accountImportModel.symbol,
});

export default connect(mapToState)(ImportFrom);
