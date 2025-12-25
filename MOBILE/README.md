# WCFinder Mobile App

React Native mobile application for WCFinder using Expo Router and TypeScript.

## 🔒 Security Features

- **Encrypted Token Storage**: Uses `expo-secure-store` for hardware-backed encryption
- **Secure API Communication**: Automatic token injection with request/response interceptors
- **Error Boundaries**: Graceful error handling to prevent app crashes
- **Offline Support**: Network status monitoring with offline indicators
- **Auto-logout on 401**: Automatic session cleanup on authentication failures

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac only) or Android Emulator

## 🚀 Getting Started

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure API URL

Edit `app.json` and set your API URL in the `extra.apiUrl` field:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://your-api-url.com"
    }
  }
}
```

Or create a `.env` file:

```
EXPO_PUBLIC_API_URL=http://your-api-url.com
```

### 3. Start Development Server

```bash
npm start
```

Then:
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your physical device

## 📁 Project Structure

```
mobile/
├── app/                          # Expo Router pages
│   ├── _layout.tsx              # Root layout with ErrorBoundary & OfflineBanner
│   ├── index.tsx                # Entry point (redirects to login/home)
│   ├── (auth)/                  # Auth screens
│   │   └── login.tsx            # Login screen
│   ├── (tabs)/                  # Tab navigation (protected)
│   │   ├── _layout.tsx          # Tab layout
│   │   ├── index.tsx            # Home screen
│   │   ├── profile.tsx          # Profile screen
│   │   └── bookings.tsx         # Bookings screen
│   └── (modals)/                # Modal screens
│       ├── business-detail.tsx  # Business details
│       ├── payment.tsx          # Payment screen
│       └── scan-qr.tsx          # QR scanner
├── src/
│   ├── components/              # Reusable components
│   │   ├── common/              # Common components
│   │   │   ├── ErrorBoundary.tsx  # Error boundary wrapper
│   │   │   └── OfflineBanner.tsx  # Offline indicator
│   │   ├── business/            # Business components
│   │   │   └── BookingPanel.tsx   # Booking form
│   │   └── ...
│   ├── hooks/                   # Custom hooks
│   │   ├── useApiCall.ts        # Generic API call hook
│   │   ├── useAuthCall.ts       # Auth-specific API calls
│   │   └── useNetworkStatus.ts  # Network connectivity hook
│   ├── store/                   # Redux store
│   │   ├── store.ts             # Store configuration
│   │   └── slices/
│   │       └── authSlice.ts     # Auth state management
│   ├── services/                # API services
│   │   └── api.ts               # Axios instance with interceptors
│   ├── utils/                   # Utility functions
│   │   ├── secureStorage.ts     # SecureStore token management
│   │   └── userStorage.ts       # User data helpers
│   ├── config/                  # Configuration
│   │   └── api.ts               # API configuration
│   └── helper/                  # Helper functions
│       └── toastNotify.ts       # Toast notifications
└── package.json
```

## 🔑 Key Features

- **Redux State Management**: Centralized state with Redux Toolkit
- **SecureStore**: Hardware-backed encrypted storage for tokens (iOS Keychain / Android Keystore)
- **AsyncStorage**: Persistent storage for non-sensitive user data
- **TypeScript**: Full type safety throughout the app
- **Expo Router**: File-based routing with type-safe navigation
- **React Native Paper**: Material Design UI components
- **Formik + Yup**: Form validation
- **Axios**: HTTP client with request/response interceptors
- **Error Boundaries**: Crash prevention and graceful error handling
- **Offline Support**: Network status monitoring with visual indicators
- **Stripe Integration**: Secure payment processing

## 🔐 Authentication Flow

1. User enters credentials on login screen
2. `useAuthCall` hook calls `/auth/login` endpoint
3. **Access token stored in SecureStore** (encrypted)
4. User data stored in AsyncStorage (sanitized, no sensitive data)
5. Redux store updated with auth state
6. User redirected to home screen
7. Token automatically injected into all API requests via interceptor
8. On 401 error: auto-logout, clear all storage, redirect to login

## 🛡️ Security Best Practices

### Token Storage
```typescript
// ✅ CORRECT - Use SecureStore for tokens
import { tokenStorage } from '../utils/secureStorage';

await tokenStorage.saveAccessToken(token);
const token = await tokenStorage.getAccessToken();
```

```typescript
// ❌ WRONG - Don't use AsyncStorage for tokens
await AsyncStorage.setItem('token', token); // Not encrypted!
```

### API Calls
```typescript
// Tokens are automatically added by interceptor
const response = await api.get('/protected-endpoint');
// No need to manually add Authorization header
```

### Error Handling
```typescript
// Wrap components in ErrorBoundary
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### Network Status
```typescript
import { useIsOnline } from '../hooks/useNetworkStatus';

const isOnline = useIsOnline();
if (!isOnline) {
  // Show cached data or offline message
}
```

## 📱 Available Screens

- `/` - Index (redirects based on auth state)
- `/login` - Login screen
- `/(tabs)` - Tab navigation (protected)
  - `/(tabs)/` - Home screen

## 🛠️ Development

### Adding New Screens

1. Create a new file in `app/` directory
2. Export a default React component
3. Add route to `_layout.tsx` if needed

### Adding API Calls

1. Use `useApiCall` hook for generic API calls
2. Use `useAuthCall` hook for auth-related calls
3. Create custom hooks in `src/hooks/` for specific features

### State Management

- Redux store: `src/store/store.ts`
- Auth slice: `src/store/slices/authSlice.ts`
- Access state: `useSelector((state) => state.auth)`
- Dispatch actions: `useDispatch()`

## 🐛 Troubleshooting

### Token not persisting
- ✅ Tokens are now stored in SecureStore (hardware-encrypted)
- Check console logs: `[SecureStorage] Access token saved successfully`
- Verify `expo-secure-store` is installed
- On iOS: Check Keychain permissions
- On Android: Check KeyStore availability

### API calls failing with 401
- Token might be expired or invalid
- Check console: `[API] Request interceptor` logs show token status
- App will auto-logout and clear storage on 401 errors
- Verify backend accepts the Bearer token format

### Offline errors
- Check network status with `useIsOnline()` hook
- OfflineBanner automatically shows when disconnected
- Implement offline data caching for better UX

### App crashes
- Check ErrorBoundary logs in console
- Error details shown in development mode
- Production builds should report to error tracking service (Sentry, Bugsnag)

### Navigation issues
- Ensure routes are defined in `_layout.tsx`
- Check Expo Router version compatibility
- Clear Metro bundler cache: `npx expo start -c`

## 📦 Build for Production

### iOS

```bash
eas build --platform ios
```

### Android

```bash
eas build --platform android
```

## 🔗 Related Documentation

- [Expo Router Docs](https://docs.expo.dev/router/introduction/)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) - Encrypted token storage
- [React Native NetInfo](https://github.com/react-native-netinfo/react-native-netinfo) - Network status
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Stripe React Native](https://stripe.com/docs/mobile/react-native)

## 📝 Security Notes

- ✅ **Tokens encrypted**: Access tokens stored in SecureStore with hardware-backed encryption
- ✅ **No sensitive data**: User passwords never stored locally
- ✅ **Auto-logout**: 401 errors trigger automatic session cleanup
- ✅ **HTTPS only**: All API calls use secure connections
- ✅ **Token injection**: Automatic Authorization header via interceptors
- ⚠️ **Production checklist**:
  - Enable SSL pinning for API calls
  - Implement token refresh mechanism
  - Add biometric authentication (Face ID / Touch ID)
  - Set up error reporting (Sentry, Bugsnag)
  - Configure app transport security (iOS)

## 🚀 Production Deployment

### Pre-deployment Checklist

1. **Security**
   - [ ] Change Stripe keys to production keys
   - [ ] Update API URL to production backend
   - [ ] Enable SSL certificate pinning
   - [ ] Configure token expiration handling
   - [ ] Set up error tracking service

2. **Performance**
   - [ ] Enable Hermes engine (faster startup)
   - [ ] Optimize images and assets
   - [ ] Implement lazy loading for heavy components
   - [ ] Add proper loading states

3. **User Experience**
   - [ ] Test offline functionality
   - [ ] Verify error boundaries catch all errors
   - [ ] Test on real devices (iOS and Android)
   - [ ] Ensure proper keyboard handling

### Environment Variables

Create `.env.production`:
```bash
EXPO_PUBLIC_API_URL=https://your-production-api.com
EXPO_PUBLIC_STRIPE_KEY=pk_live_your_stripe_key
EXPO_PUBLIC_ENV=production
```
