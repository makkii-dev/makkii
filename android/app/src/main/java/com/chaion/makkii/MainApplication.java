package com.chaion.makkii;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.ledgerwallet.hid.ReactHIDPackage;
import com.crypho.scrypt.RNScryptPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import me.listenzz.modal.TranslucentModalReactPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.dieam.reactnativepushnotification.ReactNativePushNotificationPackage;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.rnfingerprint.FingerprintAuthPackage;
import cn.jystudio.local.barcode.recognizer.LocalBarcodeRecognizerPackage;
import com.imagepicker.ImagePickerPackage;
import com.heyao216.react_native_installapk.InstallApkPackager;
import com.chaion.rn.screenshot.RNScreenshotHelperPackage;
import com.chaion.rn.hwwallet.RNAionHwWalletPackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
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
            new ReactHIDPackage(),
            new RNScryptPackage(),
            new ReanimatedPackage(),
            new TranslucentModalReactPackage(),
            new BackgroundTimerPackage(),
            new ReactNativePushNotificationPackage(),
            new RNSensitiveInfoPackage(),
            new ReactNativeConfigPackage(),
            new RNCWebViewPackage(),
            new FingerprintAuthPackage(),
            new LocalBarcodeRecognizerPackage(),
            new ImagePickerPackage(),
            new InstallApkPackager(),
            new RNScreenshotHelperPackage(),
            new RNAionHwWalletPackage(),
            new RandomBytesPackage(),
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
