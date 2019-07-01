import {Component} from 'react';
import {BackHandler} from 'react-native';
import {AppToast} from '../../utils/AppToast';
import {strings} from '../../locales/i18n';
import {StackActions,NavigationActions} from "react-navigation";
import {connect} from "react-redux";

export class HomeComponent extends Component {

    constructor(props) {
        super(props);
        this.backClickCount = 0;
    }

    componentWillMount() {
        // BackHandler.addEventListener('hardwareBackPress', this.handleBackButton);
    }

    componentWillUnmount() {
        // BackHandler.removeEventListener('hardwareBackPress', this.handleBackButton);
    }

    handleBackButton=() => {
        if (this.props.navigation.isFocused()) {
                console.log("count: " + this.backClickCount);
                if(this.backClickCount === 1){
                    listenApp.stop(()=> BackHandler.exitApp());
                    this.props.dispatch(StackActions.reset({
                        index:0,
                        actions:[
                            NavigationActions.navigate({routeName:'unsigned_login'})
                        ]
                    }));
                }else{
                    this.prepare();
                }
                return true;
        }
        return false;
    };

    prepare() {
        this.backClickCount = 1;
        AppToast.show(strings('toast_double_press_exit'), {
            onHidden:()=>this.backClickCount&&(this.backClickCount = 0),
        });
    }
}
connect()(HomeComponent);
