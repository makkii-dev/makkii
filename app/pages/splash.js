import React, {Component} from 'react';
import {connect} from 'react-redux';
import {ImageBackground, Dimensions, Text} from 'react-native';
import {strings} from "../../locales/i18n";
import {ComponentLogo} from "../components/common";
import {createAction} from "../../utils/dva";
import {Storage} from "../../utils/storage";


const loadStorage=(dispatch)=> new Promise((resolve, reject) => {
	Storage.get('settings', {state_version: 2}).then(setting=>{
		const current_state_version  = setting.state_version || 0;
		let payload = {state_version: current_state_version, options: {network:setting.network||'mainnet'}};
        Promise.all([
        	new Promise(resolve1 =>
            dispatch(createAction('userModel/loadStorage')(payload)).then(() =>
                dispatch(createAction('accountsModel/loadStorage')(payload)).then(() =>
                    dispatch(createAction('settingsModel/loadStorage')(payload)).then(() =>
						dispatch(createAction('ERC20Dex/loadStorage')(payload)).then(() =>
							dispatch(createAction('txsListener/loadStorage')(payload)).then( ()=>
								resolve1()
							)))))),

            new Promise(resolve2=>setTimeout(()=>{resolve2()},3*1000))
        ]).then(r=>{
            resolve();
        });
	})
});



class Splash extends Component {
	constructor(props){
		super(props);
	}


	componentWillMount(){
		console.log('[route] ' + this.props.navigation.state.routeName);
		const {navigate} = this.props.navigation;
		const {dispatch} = this.props;
		loadStorage(dispatch).then(r=>{
			navigate('unsigned_login')
		})
	}




	render(){
		return (
			<ImageBackground
				style={{
					flex: 1,
					alignItems: 'center',
					paddingTop: 150,
				}}
				source={require('../../assets/bg_splash.png')}
			>
				<ComponentLogo/>
				<Text style={{
					fontSize: 24,
					color: 'white',
					marginTop: 20,
				}}>{strings('app_name')}</Text>
			</ImageBackground>
		);
	}
}

export default connect()(Splash);
