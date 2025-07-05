import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';

export default function YooKassaCheckoutScreen() {
  const { amount, confirmationToken, token, paymentId } = useLocalSearchParams<{
    amount?: string;
    confirmationToken?: string;
    token?: string;
    paymentId?: string;
  }>();

  const returnUrl = 'https://return.cyberpark';

  const [isLoaded, setIsLoaded] = useState(false);

  // Use either confirmationToken or token (legacy param)
  const confToken = confirmationToken || token;

  const htmlContent = useMemo(() => {
    if (!confToken) return '<h3>Invalid payment token</h3>';
    return `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
          <style>
            html,body{margin:0;padding:0;height:100%;width:100%;background:#fff;}
            #container{display:flex;align-items:center;justify-content:center;height:100%;width:100%;}
            #payment-form{width:100%;max-width:500px;}
          </style>
          <script src="https://yookassa.ru/checkout-widget/v1/checkout-widget.js"></script>
        </head>
        <body>
          <div id="container"><div id="payment-form"></div></div>
          <script>
            (function(){
              const checkout=new window.YooMoneyCheckoutWidget({
                confirmation_token:'${confToken}',
                return_url:'${returnUrl}',
                error_callback:function(e){window.ReactNativeWebView.postMessage(JSON.stringify({type:'error',error:e}))}
              });
              checkout.render('payment-form');
            })();
          </script>
        </body>
      </html>`;
  }, [confToken]);

  const handleNavigation = (navState: any) => {
    if (navState.url.startsWith(returnUrl)) {
      // Payment finished; navigate to success screen
      router.replace(`/payment/success?payment_id=${encodeURIComponent(paymentId || '')}` as any);
    }
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'error') {
        router.replace(`/payment/success?payment_id=${encodeURIComponent(paymentId || '')}&error=1` as any);
      }
    } catch {}
  };

  if (!confToken) {
    return (
      <View style={styles.center} pointerEvents="none">
        <ActivityIndicator size="large" color="#00FFAA" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        onNavigationStateChange={handleNavigation}
        onMessage={handleMessage}
        style={{ flex: 1 }}
        onLoadEnd={() => setIsLoaded(true)}
      />
      {!isLoaded && (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator size="large" color="#00FFAA" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
}); 