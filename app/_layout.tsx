import { Ionicons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as SecureStore from "expo-secure-store";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { TouchableOpacity } from "react-native";
import "react-native-reanimated";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";

const CLERK_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider
      tokenCache={tokenCache}
      publishableKey={CLERK_PUBLISHABLE_KEY!}
    >
      <RootLayoutNav />
    </ClerkProvider>
  );
}

function RootLayoutNav() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/(modals)/login");
    }
  }, [isLoaded, isSignedIn]);

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="(modals)/login"
        options={{
          title: "Log in or sign up",
          presentation: "modal",
          headerLeft: () => (
            <TouchableOpacity>
              <Ionicons
                name="close-outline"
                size={24}
                onPress={() => router.back()}
              />
            </TouchableOpacity>
          ),
        }}
      />
      <Stack.Screen
        name="listing/[id]"
        options={{ headerTitle: "", headerTransparent: true }}
      />
      <Stack.Screen
        name="(modals)/booking"
        options={{
          presentation: "transparentModal",
          headerLeft: () => (
            <TouchableOpacity>
              <Ionicons
                name="close-outline"
                size={24}
                onPress={() => router.back()}
              />
            </TouchableOpacity>
          ),
          animation: "fade",
        }}
      />
    </Stack>
  );
}
