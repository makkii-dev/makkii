package com.chaion.makkii;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.chaion.rn.screenshot.RNScreenshotHelperPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.chaion.rn.hwwallet.RNAionHwWalletPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.horcrux.svg.SvgPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import org.reactnative.camera.RNCameraPackage;

import android.webkit.WebView;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new RNScreenshotHelperPackage(),
            new RNCWebViewPackage(),
            new RNAionHwWalletPackage(),
            new RandomBytesPackage(),
            new RNFetchBlobPackage(),
            new SvgPackage(),
            new RNI18nPackage(),
            new RNGestureHandlerPackage(),
            new RNFSPackage(),
            new RNDeviceInfo(),
            new RNCameraPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    WebView.setWebContentsDebuggingEnabled(true);
    SoLoader.init(this, /* native exopackage */ false);
  }
}
