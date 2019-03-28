import React from 'react';
import {Text} from 'react-native';
import PropTypes from 'prop-types';
import {strings} from "../../../locales/i18n";

class PendingComponent extends React.Component {
    static propTypes ={
        status: PropTypes.string.isRequired,
    };
    state={
      waiting:0,
    };

    constructor(props){
        super(props);
    }

    componentWillMount() {
        this.mount = true;
        if(this.props.status === 'PENDING') {
            this.interval = setInterval(() => {
                const {waiting} = this.state;
                this.mount && this.setState({waiting: (waiting + 1) % 5})
            }, 500)
        }
    }
    componentWillUnmount() {
        this.mount = false;
        this.interval&&clearInterval(this.interval);
    }
    
    componentWillUpdate(nextProps){
        if(this.props.status !== nextProps.status) {
            if (nextProps.status === 'PENDING') {
                this.interval = setInterval(() => {
                    const {waiting} = this.state;
                    this.mount && this.setState({waiting: (waiting + 1) % 5})
                }, 500)
            }
        }
    }

    render(){
        if(this.props.status === 'FAILED' || this.props.status === 'CONFIRMED'){
            return <Text style={{textAlign: 'left'}}>{strings(`transaction_detail.${this.props.status}`)}</Text>
        }else{
            const tail = '.'.repeat(this.state.waiting);
            return <Text style={{textAlign: 'left'}}>{strings(`transaction_detail.${this.props.status}`)+tail}</Text>
        }
    }
}
export default PendingComponent;
