import {PixelRatio,Dimensions, Platform} from 'react-native';
const dp2px = dp=>PixelRatio.getPixelSizeForLayoutSize(dp);
const px2dp = px=>PixelRatio.roundToNearestPixel(px);
const designSize = {width:1080,height:1920}; //假设设计尺寸为：1080*1920
let pxRatio = PixelRatio.get();
let win_width = Dimensions.get("window").width;
let win_height = Dimensions.get("window").height;
const width = dp2px(win_width);
const height = dp2px(win_height);
const width_scale = 1/pxRatio/(designSize.width/width);
const height_scale =  1/pxRatio/(designSize.height/height)

const fixedWidth = value=>{
    value = px2dp(value);
    return value*width_scale
};

const fixedHeight = value => {
    value = px2dp(value);
    return value*height_scale
};


const LINK_BUTTON_COLOR = '#4278eb';
const BLUE_BLOCK_COLOR = '#4a87fa';
const MAIN_COLOR = '#246ffa';
const MAIN_COLOR_ALPHA = '#246ffa55';
const FONT_COLOR = '#777676';
const MAIN_BG_COLOR = '#eeeeee';
const RIGHT_BUTTON_COLOR_ENABLED = 'rgba(255, 255, 255, 1.0)';
const RIGHT_BUTTON_COLOR_DISABLED = 'rgba(255, 255, 255, 0.3)';
const fixedWidthFont = Platform.OS === 'ios'? 'Courier': 'monospace';

module.exports = {
    fixedWidth,
    fixedHeight,
    linkButtonColor: LINK_BUTTON_COLOR,
    blueBlockColor: BLUE_BLOCK_COLOR,
    mainColor: MAIN_COLOR,
    mainColorAlpha: MAIN_COLOR_ALPHA,
    fontColor: FONT_COLOR,
    mainBgColor: MAIN_BG_COLOR,
    rightBtnColorEnable: RIGHT_BUTTON_COLOR_ENABLED,
    rightBtnColorDisable: RIGHT_BUTTON_COLOR_DISABLED,
    fixedWidthFont,
};
