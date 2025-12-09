# 🚀 Hızlı Başlangıç: React Native + Expo Kurulumu

## 1. Expo Projesi Oluşturma

```bash
# Proje kök dizininde
npx create-expo-app mobile --template blank

cd mobile

# Gerekli paketleri kur
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @reduxjs/toolkit react-redux
npm install axios
npm install react-native-paper
npm install @react-native-async-storage/async-storage
npm install react-native-maps
npx expo install expo-location expo-camera
```

## 2. Temel Dosya Yapısı

```
mobile/
├── src/
│   ├── navigation/
│   │   └── AppNavigator.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   └── BusinessDetailScreen.js
│   ├── services/
│   │   └── api.js
│   ├── store/
│   │   ├── store.js
│   │   └── slices/
│   │       └── authSlice.js
│   └── components/
│       └── MapView.js
├── App.js
└── package.json
```

## 3. Örnek Dosyalar

### App.js
```javascript
import React from 'react';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </Provider>
  );
}
```

### src/navigation/AppNavigator.js
```javascript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import BusinessDetailScreen from '../screens/BusinessDetailScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'WCFinder' }}
        />
        <Stack.Screen 
          name="BusinessDetail" 
          component={BusinessDetailScreen}
          options={{ title: 'Business Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### src/services/api.js
```javascript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend URL'inizi buraya ekleyin
const BASE_URL = 'YOUR_API_URL/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token interceptor
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - logout
      await AsyncStorage.removeItem('token');
      // Navigate to login (navigation hook kullanarak)
    }
    return Promise.reject(error);
  }
);

export default api;
```

### src/screens/LoginScreen.js
```javascript
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';
import { loginSuccess } from '../store/slices/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      
      // Token'ı sakla
      await AsyncStorage.setItem('token', token);
      
      // Redux store'a kaydet
      dispatch(loginSuccess({ token, user }));
      
      // Home'a yönlendir
      navigation.replace('Home');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        WCFinder
      </Text>
      
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      
      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      >
        Login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
```

### src/store/store.js
```javascript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});
```

### src/store/slices/authSlice.js
```javascript
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: null,
    user: null,
    loading: false,
  },
  reducers: {
    loginStart: (state) => {
      state.loading = true;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    loginFail: (state) => {
      state.loading = false;
      state.token = null;
      state.user = null;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFail, logout } = authSlice.actions;
export default authSlice.reducer;
```

## 4. Çalıştırma

```bash
# Development server başlat
npx expo start

# iOS simulator'da aç (Mac gerekli)
# i tuşuna bas

# Android emulator'da aç
# a tuşuna bas

# Fiziksel cihazda aç
# Expo Go uygulamasını indir ve QR kodu tara
```

## 5. Build ve Yayınlama

```bash
# Expo EAS Build kurulumu
npm install -g eas-cli
eas login
eas build:configure

# iOS build
eas build --platform ios

# Android build
eas build --platform android

# App Store'a yayınlama
eas submit --platform ios

# Play Store'a yayınlama
eas submit --platform android
```

---

## 🔄 Web Kodundan Mobil'e Dönüşüm Örnekleri

### Material-UI Button → React Native Paper Button

**Web:**
```jsx
<Button variant="contained" onClick={handleClick}>
  Login
</Button>
```

**Mobile:**
```jsx
<Button mode="contained" onPress={handleClick}>
  Login
</Button>
```

### Material-UI TextField → React Native Paper TextInput

**Web:**
```jsx
<TextField
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**Mobile:**
```jsx
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
/>
```

### React Router → React Navigation

**Web:**
```jsx
import { useNavigate } from 'react-router-dom';
const navigate = useNavigate();
navigate('/home');
```

**Mobile:**
```jsx
import { useNavigation } from '@react-navigation/native';
const navigation = useNavigation();
navigation.navigate('Home');
```

### localStorage → AsyncStorage

**Web:**
```jsx
localStorage.setItem('token', token);
const token = localStorage.getItem('token');
```

**Mobile:**
```jsx
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.setItem('token', token);
const token = await AsyncStorage.getItem('token');
```

---

## 📱 Native Özellikler Örnekleri

### GPS Konum Alma

```javascript
import * as Location from 'expo-location';

const getLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    alert('Permission denied');
    return;
  }
  
  const location = await Location.getCurrentPositionAsync({});
  console.log(location.coords.latitude, location.coords.longitude);
};
```

### Harita Gösterimi

```javascript
import MapView, { Marker } from 'react-native-maps';

<MapView
  style={{ flex: 1 }}
  initialRegion={{
    latitude: 52.5200,
    longitude: 13.4050,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  }}
>
  <Marker
    coordinate={{ latitude: 52.5200, longitude: 13.4050 }}
    title="Business Name"
  />
</MapView>
```

---

## ✅ Checklist

- [ ] Expo projesi oluşturuldu
- [ ] Gerekli paketler kuruldu
- [ ] Navigation yapısı kuruldu
- [ ] API servisleri entegre edildi
- [ ] Redux store kuruldu
- [ ] Login ekranı dönüştürüldü
- [ ] Home ekranı dönüştürüldü
- [ ] Harita entegrasyonu yapıldı
- [ ] iOS'ta test edildi
- [ ] Android'de test edildi
- [ ] Build alındı
- [ ] App Store'a yüklendi
- [ ] Play Store'a yüklendi

---

## 🆘 Sorun Giderme

### "Unable to resolve module" hatası
```bash
npm install
npx expo start --clear
```

### Metro bundler hatası
```bash
watchman watch-del-all
rm -rf node_modules
npm install
```

### iOS build hatası
```bash
cd ios
pod install
cd ..
```

---

Bu örneklerle başlayabilirsiniz! Herhangi bir adımda yardıma ihtiyacınız olursa sorun.

