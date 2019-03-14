import {PixelRatio,Dimensions} from 'react-native';
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



module.exports = {
    fixedWidth,
    fixedHeight,
};
