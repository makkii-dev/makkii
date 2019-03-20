import React from 'react';
import {
    Animated,
    View,
    Easing,
    Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
const {width} = Dimensions.get('window');
class ProgressBar extends React.Component{
    static propTypes={
        width:  PropTypes.number.isRequired,
        progress: PropTypes.number.isRequired,
        color: PropTypes.string.isRequired,
        onComplete: PropTypes.func.isRequired,
    };

    static defaultProps={
        color:'red',
        width: width,
        progress: 0,
        onComplete: ()=>{},
    };
    state = {
        progress:this.props.progress,
    };
    constructor(props){
        super(props);
        this.widthAnimation=new Animated.Value(0);


    }
    componentDidMount() {
        if (this.state.progress > 0) {
            this.animateWidth();
        }
    }

    componentWillReceiveProps(props){
        if(props.progress !== this.state.progress){
            if(props.progress>=this.state.progress&&props.progress<=1){
                this.setState({progress:props.progress},()=>{
                    if(this.state.progress ===1){
                        setTimeout(()=>this.props.onComplete(),500);
                    }
                });
            }
        }
    }

    componentWillUpdate(nextProps){
        return nextProps.progress !==nextProps.progress
    }

    componentDidUpdate(prevProps) {
        if (this.props.progress !== prevProps.progress) {
            this.animateWidth();
        }
    }

    animateWidth() {
        const toValue = (this.props.width * this.state.progress);
        Animated.timing(this.widthAnimation, {
            easing: Easing['linear'],
            toValue: toValue > 0 ? toValue : 0,
            duration: 300,
        }).start();
    }


    render(){
        return(
            <View style={{...this.props.style,width:this.props.width, backgroundColor:'transparent'}}>
             <Animated.View style={{flex:1, width:this.widthAnimation, backgroundColor:this.props.color}}/>
            </View>
        )
    }
}

export {
    ProgressBar
};
