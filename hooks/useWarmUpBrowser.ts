import { useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';

// This is used to speed up the opening of the browser on Android

export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};