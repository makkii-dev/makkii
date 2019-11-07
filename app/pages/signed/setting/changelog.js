import React from 'react';
import { FlatList, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import { connect } from 'react-redux';
import DeviceInfo from 'react-native-device-info';
import { strings } from '../../../../locales/i18n';
import { getAppChangeLog } from '../../../../services/setting.service';
import { mainBgColor } from '../../../style_util';
import { ImportListFooter } from '../../../components/common';
import defaultStyles from '../../../styles';

const { width } = Dimensions.get('window');

const useChangeLog = ({ beforeFetch, afterFetch }) => {
    const [state, setState] = React.useState({
        logs: {},
        nextPage: 0,
        isFetching: true,
        hasMore: true,
    });
    const getNextPage = () => {
        beforeFetch && beforeFetch();
        setState({
            ...state,
            isFetching: true,
        });
        getAppChangeLog(state.nextPage).then(res => {
            console.log('getAppChangeLog=>', res);
            if (res.result) {
                const newLogs = { ...state.logs, ...res.data };
                setState({
                    logs: newLogs,
                    nextPage: res.nextPage,
                    isFetching: false,
                    hasMore: Object.keys(res.data).length === 10,
                });
            } else {
                setState({
                    ...state,
                    isFetching: false,
                });
            }
            afterFetch && afterFetch(res);
        });
    };

    return { logs: state.logs, hasMore: state.hasMore, isFetching: state.isFetching, getNextPage };
};

const process_log = logs => {
    return Object.values(logs).sort((a, b) => {
        if (b.releaseDate === undefined && a.releaseDate !== undefined) return 1;
        if (b.releaseDate === undefined && a.releaseDate === undefined) return 0;
        if (b.releaseDate !== undefined && a.releaseDate === undefined) return -1;
        return b.releaseDate - a.releaseDate;
    });
};

const renderLog = (log, lang) => {
    const { version, updatesMap, releaseDate } = log;
    const content = lang.indexOf('en') >= 0 ? updatesMap.en : updatesMap.zh;
    const releaseDate_ = releaseDate && releaseDate.replace(/(.{0,4})(.{0,2})(.{0,2})/, '$1-$2-$3');
    return (
        <View style={styles.log_container}>
            <View style={styles.log_header}>
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{`V${version}`}</Text>
                <Text>{releaseDate_}</Text>
            </View>
            <View style={styles.log_body}>
                <Text style={{ paddingVertical: 10 }}>{content}</Text>
            </View>
        </View>
    );
};

const changelog = props => {
    const { lang } = props;
    const [state, setState] = React.useState({
        footerState: 0,
        isLoading: true,
    });

    const { logs, hasMore, isFetching, getNextPage } = useChangeLog({});
    React.useEffect(() => {
        let newState = { ...state };
        let shouldUpdate = false;
        if (isFetching === false && state.isLoading) {
            newState.isLoading = false;
            shouldUpdate = true;
        }
        if (isFetching === false && state.footerState === 2) {
            newState.footerState = hasMore ? 0 : 1;
            shouldUpdate = true;
        }
        if (shouldUpdate) {
            setState(newState);
        }
    }, [isFetching, hasMore]);
    React.useEffect(() => {
        getNextPage();
    }, []);

    const onEndReached = () => {
        if (state.footerState !== 0) return;
        setState({
            ...state,
            footerState: 2,
        });
        getNextPage();
    };
    if (state.isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: mainBgColor,
                }}
            >
                <ActivityIndicator animating color="red" size="large" />
            </View>
        );
    }
    return (
        <View style={{ flex: 1, backgroundColor: mainBgColor, alignItems: 'center' }}>
            <FlatList
                data={process_log(logs)}
                keyExtractor={(item, index) => `${index}`}
                renderItem={({ item }) => renderLog(item, lang)}
                onEndReached={() => onEndReached()}
                ListFooterComponent={() => <ImportListFooter hasSeparator={false} footerState={state.footerState} />}
            />
        </View>
    );
};

changelog.navigationOptions = () => {
    return {
        title: strings('changelog.title'),
    };
};

const mapToState = ({ settingsModel }) => {
    const { lang } = settingsModel;
    return {
        lang: lang === 'auto' ? DeviceInfo.getDeviceLocale() : lang,
    };
};

export default connect(mapToState)(changelog);

const styles = {
    log_container: {
        ...defaultStyles.shadow,
        backgroundColor: '#fff',
        width: width - 20,
        margin: 10,
        padding: 20,
        borderRadius: 5,
    },
    log_header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    log_body: {},
};
