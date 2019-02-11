
import React from 'react';
import {
    Animated,
    PanResponder,
    View,
    StyleSheet,
    Text
} from 'react-native';


import PropTypes from  'prop-types';



const emptyFunction = ()=>{};


// NOTE: Eventually convert these consts to an input object of configurations

// Position of the left of the swipable item when closed
const CLOSED_LEFT_POSITION = 0;
// Minimum swipe distance before we recognize it as such
const HORIZONTAL_SWIPE_DISTANCE_THRESHOLD = 10;
// Minimum swipe speed before we fully animate the user's action (open/close)
const HORIZONTAL_FULL_SWIPE_SPEED_THRESHOLD = 0.3;
// Factor to divide by to get slow speed; i.e. 4 means 1/4 of full speed
const SLOW_SPEED_SWIPE_FACTOR = 4;
// Time, in milliseconds, of how long the animated swipe should be
const SWIPE_DURATION = 300;

/**
 * On SwipeableListView mount, the 1st item will bounce to show users it's
 * possible to swipe
 */
const ON_MOUNT_BOUNCE_DELAY = 700;
const ON_MOUNT_BOUNCE_DURATION = 400;

// Distance left of closed position to bounce back when right-swiping from closed
const RIGHT_SWIPE_BOUNCE_BACK_DISTANCE = 0;
const RIGHT_SWIPE_BOUNCE_BACK_DURATION = 300;
/**
 * Max distance of right swipe to allow (right swipes do functionally nothing).
 * Must be multiplied by SLOW_SPEED_SWIPE_FACTOR because gestureState.dx tracks
 * how far the finger swipes, and not the actual animation distance.
 */
const RIGHT_SWIPE_THRESHOLD = 30 * SLOW_SPEED_SWIPE_FACTOR;


/**
 * Creates a swipable row that allows taps on the main item and a custom View
 * on the item hidden behind the row. Typically this should be used in
 * conjunction with SwipeableListView for additional functionality, but can be
 * used in a normal ListView. See the renderRow for SwipeableListView to see how
 * to use this component separately.
 */
export default  class SwipeableRow extends React.PureComponent{

    constructor(props){
        super(props);
        this._previousLeft = CLOSED_LEFT_POSITION;
        this.state={
            currentLeft: new Animated.Value(this._previousLeft),
            isSwipeableViewRendered: false,
            rowHeight: (null: ?number),
        };
        this._panResponder = {};

    }

    static propTypes = {
        children: PropTypes.any,
        isOpen: PropTypes.bool,
        swipeEnabled: PropTypes.bool,
        preventSwipeRight: PropTypes.bool,
        maxSwipeDistance: PropTypes.number.isRequired,
        onOpen: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
        onSwipeEnd: PropTypes.func.isRequired,
        onSwipeStart: PropTypes.func.isRequired,
        // Should bounce the row on mount
        shouldBounceOnMount: PropTypes.bool,
        /**
         * A ReactElement that is unveiled when the user swipes
         */
        slideoutView: PropTypes.node.isRequired,
        /**
         * The minimum swipe distance required before fully animating the swipe. If
         * the user swipes less than this distance, the item will return to its
         * previous (open/close) position.
         */
        swipeThreshold: PropTypes.number.isRequired,
    };


    static defaultProps  = {
        isOpen: false,
        preventSwipeRight: false,
        swipeEnabled: true,
        maxSwipeDistance: 0,
        onOpen: emptyFunction,
        onClose: emptyFunction,
        onSwipeEnd: emptyFunction,
        onSwipeStart: emptyFunction,
        swipeThreshold: 30,
    };

    componentWillMount() {
        this._panResponder = PanResponder.create({
            onMoveShouldSetPanResponderCapture: this
                ._handleMoveShouldSetPanResponderCapture.bind(this),
            onPanResponderGrant: this._handlePanResponderGrant.bind(this),
            onPanResponderMove: this._handlePanResponderMove.bind(this),
            onPanResponderRelease: this._handlePanResponderEnd.bind(this),
            onPanResponderTerminationRequest: this._onPanResponderTerminationRequest.bind(this),
            onPanResponderTerminate: this._handlePanResponderEnd.bind(this),
        });
    }

    componentDidMount() {
        if (this.props.shouldBounceOnMount) {
            /**
             * Do the on mount bounce after a delay because if we animate when other
             * components are loading, the animation will be laggy
             */
            let that = this;
            setTimeout(() => {
                that._animateBounceBack(ON_MOUNT_BOUNCE_DURATION);
            }, ON_MOUNT_BOUNCE_DELAY);
        }
    }

    componentWillReceiveProps(nextProps) {
        /**
         * We do not need an "animateOpen(noCallback)" because this animation is
         * handled internally by this component.
         */
        if (this.props.isOpen && !nextProps.isOpen) {
            this.close();
        }
    }
    

    close() {
        this.props.onClose();
        this._animateToClosedPosition();
    }

    _handleMoveShouldSetPanResponderCapture(evt, gestureState) {
        // Decides whether a swipe is responded to by this component or its child
        if(!this.props.swipeEnabled && !this.props.isOpen){
            return false;
        }
        return this._isValidSwipe(gestureState);
    }

    _handlePanResponderGrant(evt, gestureState) {}

    _handlePanResponderMove(evt, gestureState) {
        if (this._isSwipingExcessivelyRightFromClosedPosition(gestureState)) {
            return;
        }

        this.props.onSwipeStart();

        if (this._isSwipingRightFromClosed(gestureState)) {
            this._swipeSlowSpeed(gestureState);
        } else {
            this._swipeFullSpeed(gestureState);
        }
    }

    _isSwipingRightFromClosed(gestureState) {
        const gestureStateDx = gestureState.dx;
        return this._previousLeft === CLOSED_LEFT_POSITION && gestureStateDx > 0;
    }

    _swipeFullSpeed(gestureState) {
        let newLeft = this._previousLeft + gestureState.dx;
        const leftBorder = - this.props.maxSwipeDistance;
        const rightBorder = this.props.preventSwipeRight? CLOSED_LEFT_POSITION : CLOSED_LEFT_POSITION + RIGHT_SWIPE_THRESHOLD;
        newLeft = newLeft > rightBorder? rightBorder : newLeft;
        newLeft = newLeft < leftBorder? leftBorder : newLeft;
        this.state.currentLeft.setValue(newLeft);
    }

    _swipeSlowSpeed(gestureState) {
        let newLeft = this._previousLeft + gestureState.dx / SLOW_SPEED_SWIPE_FACTOR;
        const leftBorder = - this.props.maxSwipeDistance;
        const rightBorder = this.props.preventSwipeRight? CLOSED_LEFT_POSITION : CLOSED_LEFT_POSITION + RIGHT_SWIPE_THRESHOLD;
        newLeft = newLeft > rightBorder? rightBorder : newLeft;
        newLeft = newLeft < leftBorder? leftBorder : newLeft;
        this.state.currentLeft.setValue(newLeft);
    }

    _isSwipingExcessivelyRightFromClosedPosition(gestureState) {
        /**
         * We want to allow a BIT of right swipe, to allow users to know that
         * swiping is available, but swiping right does not do anything
         * functionally.
         */
        const gestureStateDx = gestureState.dx;
        return (
            this._isSwipingRightFromClosed(gestureState) &&
            gestureStateDx > RIGHT_SWIPE_THRESHOLD
        );
    }

    _onPanResponderTerminationRequest(evt, gestureState) {
        return false;
    }

    _animateTo(toValue, duration = SWIPE_DURATION, callback = emptyFunction) {
        Animated.timing(this.state.currentLeft, {
            duration,
            toValue,
            useNativeDriver: true,
        }).start(() => {
            this._previousLeft = toValue;
            callback();
        });
    }

    _animateToOpenPosition() {
        const maxSwipeDistance =  this.props.maxSwipeDistance;
        this._animateTo(-maxSwipeDistance);
    }

    _animateToOpenPositionWith(speed, distMoved) {
        /**
         * Ensure the speed is at least the set speed threshold to prevent a slow
         * swiping animation
         */
        speed =
            speed > HORIZONTAL_FULL_SWIPE_SPEED_THRESHOLD
                ? speed
                : HORIZONTAL_FULL_SWIPE_SPEED_THRESHOLD;
        /**
         * Calculate the duration the row should take to swipe the remaining distance
         * at the same speed the user swiped (or the speed threshold)
         */
        const duration = Math.abs(
            (this.props.maxSwipeDistance - Math.abs(distMoved)) / speed,
        );
        const maxSwipeDistance = this.props.maxSwipeDistance;
        this._animateTo(-maxSwipeDistance, duration);
    }

    _animateToClosedPosition(duration = SWIPE_DURATION) {
        this._animateTo(CLOSED_LEFT_POSITION, duration);
    }

    _animateToClosedPositionDuringBounce() {
        this._animateToClosedPosition(RIGHT_SWIPE_BOUNCE_BACK_DURATION);
    }

    _animateBounceBack(duration) {
        /**
         * When swiping right, we want to bounce back past closed position on release
         * so users know they should swipe right to get content.
         */
        const swipeBounceBackDistance = RIGHT_SWIPE_BOUNCE_BACK_DISTANCE;
        this._animateTo(
            -swipeBounceBackDistance,
            duration,
            this._animateToClosedPositionDuringBounce(),
        );
    }

    // Ignore swipes due to user's finger moving slightly when tapping
    _isValidSwipe(gestureState) {
        if (
            this.props.preventSwipeRight &&
            this._previousLeft === CLOSED_LEFT_POSITION &&
            gestureState.dx > 0
        ) {
            return false;
        }

        return Math.abs(gestureState.dx) > HORIZONTAL_SWIPE_DISTANCE_THRESHOLD;
    }

    _shouldAnimateRemainder(gestureState) {
        /**
         * If user has swiped past a certain distance, animate the rest of the way
         * if they let go
         */
        return (
            Math.abs(gestureState.dx) > this.props.swipeThreshold ||
            gestureState.vx > HORIZONTAL_FULL_SWIPE_SPEED_THRESHOLD
        );
    }

    _handlePanResponderEnd(evt, gestureState) {
        const horizontalDistance = gestureState.dx;
        if (this._shouldAnimateRemainder(gestureState)) {
            if (horizontalDistance < 0) {
                // Swiped left
                this.props.onOpen();
                this._animateToOpenPositionWith(gestureState.vx, horizontalDistance);
            } else {
                // Swiped right
                this._animateToClosedPosition();
                this.props.onClose();

            }
        } else {
            if (this._previousLeft === CLOSED_LEFT_POSITION) {
                this._animateToClosedPosition();
            } else {
                this._animateToOpenPosition();
            }
        }

        this.props.onSwipeEnd();
    }

    _onSwipeableViewLayout(evt) {
        this.setState({
            isSwipeableViewRendered: true,
            rowHeight: evt.nativeEvent.layout.height,
        });
    }
    render(){
        let slideOutView;
        if (this.state.isSwipeableViewRendered && this.state.rowHeight) {
            slideOutView = (
                <View
                    style={{...styles.slideOutContainer, ...this.props.style}}>
                    {this.props.slideoutView}
                </View>
            );
        }

        // The swipeable item
        const swipeableView = (
            <Animated.View
                onLayout={this._onSwipeableViewLayout.bind(this)}
                style={{transform: [{translateX: this.state.currentLeft}]}}>
                {this.props.children}
            </Animated.View>
        );

        return (
            <View style={this.props.style} {...this._panResponder.panHandlers}>
                {slideOutView}
                {swipeableView}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    slideOutContainer: {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
    },
});