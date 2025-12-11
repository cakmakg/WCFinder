# WCFinder Mobile App

React Native mobile application for WCFinder using Expo Router and TypeScript.

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
├── app/                    # Expo Router pages
│   ├── _layout.tsx        # Root layout with Redux Provider
│   ├── index.tsx          # Entry point (redirects to login/home)
│   ├── login.tsx          # Login screen
│   └── (tabs)/            # Tab navigation
│       ├── _layout.tsx    # Tab layout
│       └── index.tsx      # Home screen
├── src/
│   ├── hooks/             # Custom hooks
│   │   ├── useAxios.ts    # Axios instance with token
│   │   ├── useApiCall.ts  # Generic API call hook
│   │   └── useAuthCall.ts # Auth-specific API calls
│   ├── store/             # Redux store
│   │   ├── store.ts       # Store configuration
│   │   └── slices/        # Redux slices
│   │       └── authSlice.ts
│   ├── services/          # API services
│   │   └── api.ts         # Axios instance
│   ├── utils/             # Utility functions
│   │   └── userStorage.ts # AsyncStorage helpers
│   └── helper/            # Helper functions
│       └── toastNotify.ts # Toast notifications
└── package.json
```

## 🔑 Key Features

- **Redux State Management**: Centralized state with Redux Toolkit
- **AsyncStorage**: Persistent storage for tokens and user data
- **TypeScript**: Full type safety
- **Expo Router**: File-based routing
- **React Native Paper**: Material Design components
- **Formik + Yup**: Form validation
- **Axios**: HTTP client with interceptors

## 🔐 Authentication Flow

1. User enters credentials on login screen
2. `useAuthCall` hook calls `/auth/login` endpoint
3. Token and user data stored in AsyncStorage
4. Redux store updated with auth state
5. User redirected to home screen
6. Token automatically added to all API requests

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
- Check AsyncStorage permissions
- Verify token is being saved in `authSlice`

### API calls failing
- Check API URL in `app.json` or `.env`
- Verify CORS settings on backend
- Check network connectivity

### Navigation issues
- Ensure routes are defined in `_layout.tsx`
- Check Expo Router version compatibility

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
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Expo AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## 📝 Notes

- API URL should point to your backend server
- Make sure backend CORS allows requests from mobile app
- Token is stored securely in AsyncStorage
- User data is sanitized before storage (passwords never stored)
