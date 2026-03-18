import { describe, it, expect, beforeEach } from 'vitest';
import authReducer, {
  fetchStart,
  fetchFail,
  loginSuccess,
  registerSuccess,
  logoutSuccess,
  userUpdateSuccess,
  clearAuth,
  selectIsAdmin,
  selectIsOwner,
  selectIsUser,
} from '../../features/authSlice';

describe('Auth Slice', () => {
  const initialState = {
    currentUser: null,
    loading: false,
    error: false,
    token: null,
  };

  beforeEach(() => {
    localStorage.clear();
  });

  // ==================== Reducers ====================
  describe('fetchStart', () => {
    it('should set loading to true and error to false', () => {
      const state = authReducer({ ...initialState, error: true }, fetchStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(false);
    });
  });

  describe('fetchFail', () => {
    it('should set loading to false and error to true', () => {
      const state = authReducer({ ...initialState, loading: true }, fetchFail());
      expect(state.loading).toBe(false);
      expect(state.error).toBe(true);
    });
  });

  describe('loginSuccess', () => {
    it('should set user and token', () => {
      const payload = {
        user: {
          _id: '123',
          username: 'testuser',
          email: 'test@example.com',
          role: 'user',
          isActive: true,
          firstName: 'Test',
          lastName: 'User',
        },
        bearer: { accessToken: 'jwt-token-123' },
      };

      const state = authReducer(initialState, loginSuccess(payload));
      expect(state.currentUser._id).toBe('123');
      expect(state.currentUser.username).toBe('testuser');
      expect(state.currentUser.role).toBe('user');
      expect(state.token).toBe('jwt-token-123');
      expect(state.loading).toBe(false);
    });

    it('should not store password', () => {
      const payload = {
        user: {
          _id: '123',
          username: 'test',
          password: 'secret',
          role: 'user',
        },
        bearer: { accessToken: 'token' },
      };

      const state = authReducer(initialState, loginSuccess(payload));
      expect(state.currentUser.password).toBeUndefined();
    });

    it('should store token in localStorage', () => {
      const payload = {
        user: { _id: '123', username: 'test', role: 'user' },
        bearer: { accessToken: 'my-token' },
      };

      authReducer(initialState, loginSuccess(payload));
      expect(localStorage.getItem('token')).toBe('my-token');
    });
  });

  describe('registerSuccess', () => {
    it('should set user and token', () => {
      const payload = {
        user: {
          _id: '456',
          username: 'newuser',
          role: 'user',
          isActive: true,
        },
        bearer: { accessToken: 'reg-token' },
      };

      const state = authReducer(initialState, registerSuccess(payload));
      expect(state.currentUser._id).toBe('456');
      expect(state.token).toBe('reg-token');
    });
  });

  describe('logoutSuccess', () => {
    it('should clear user, token and localStorage', () => {
      const loggedInState = {
        currentUser: { _id: '123', username: 'test', role: 'user' },
        loading: false,
        error: false,
        token: 'token-123',
      };
      localStorage.setItem('token', 'token-123');

      const state = authReducer(loggedInState, logoutSuccess());
      expect(state.currentUser).toBe(null);
      expect(state.token).toBe(null);
      expect(localStorage.getItem('token')).toBe(null);
    });
  });

  describe('userUpdateSuccess', () => {
    it('should update user data', () => {
      const loggedInState = {
        currentUser: { _id: '123', username: 'old', role: 'user' },
        loading: false,
        error: false,
        token: 'token',
      };

      const state = authReducer(
        loggedInState,
        userUpdateSuccess({
          user: { _id: '123', username: 'updated', role: 'user', email: 'new@example.com' },
        })
      );

      expect(state.currentUser.username).toBe('updated');
      expect(state.currentUser.email).toBe('new@example.com');
    });
  });

  describe('clearAuth', () => {
    it('should clear all auth state', () => {
      const state = authReducer(
        { currentUser: { _id: '1' }, loading: true, error: true, token: 'tk' },
        clearAuth()
      );

      expect(state.currentUser).toBe(null);
      expect(state.token).toBe(null);
      expect(state.loading).toBe(false);
    });
  });

  // ==================== Selectors ====================
  describe('Selectors', () => {
    it('selectIsAdmin should return true for admin', () => {
      const state = { auth: { currentUser: { role: 'admin' } } };
      expect(selectIsAdmin(state)).toBe(true);
    });

    it('selectIsAdmin should return false for non-admin', () => {
      const state = { auth: { currentUser: { role: 'user' } } };
      expect(selectIsAdmin(state)).toBe(false);
    });

    it('selectIsOwner should detect owner role', () => {
      expect(selectIsOwner({ auth: { currentUser: { role: 'owner' } } })).toBe(true);
      expect(selectIsOwner({ auth: { currentUser: { role: 'user' } } })).toBe(false);
    });

    it('selectIsUser should detect user role', () => {
      expect(selectIsUser({ auth: { currentUser: { role: 'user' } } })).toBe(true);
      expect(selectIsUser({ auth: { currentUser: { role: 'admin' } } })).toBe(false);
    });

    it('selectors should handle null currentUser', () => {
      const state = { auth: { currentUser: null } };
      expect(selectIsAdmin(state)).toBeFalsy();
      expect(selectIsOwner(state)).toBeFalsy();
      expect(selectIsUser(state)).toBeFalsy();
    });
  });
});
