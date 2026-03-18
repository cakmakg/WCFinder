/**
 * AuthSlice Tests
 * Tests Redux auth state management
 */

import reducer, {
  fetchStart,
  fetchFail,
  loginSuccess,
  registerSuccess,
  logoutSuccess,
  userUpdateSuccess,
  clearAuth,
  setInitialAuth,
  selectIsAdmin,
  selectIsOwner,
  selectIsUser,
} from '../../store/slices/authSlice';

const mockUser = {
  _id: 'user123',
  username: 'testuser',
  role: 'user',
  isActive: true,
  email: 'test@test.com',
  firstName: 'Test',
  lastName: 'User',
};

const mockLoginPayload = {
  user: mockUser,
  bearer: { accessToken: 'test-token-123' },
};

const initialState = {
  currentUser: null,
  loading: false,
  error: false,
  token: null,
};

describe('authSlice', () => {
  describe('fetchStart', () => {
    it('should set loading true and error false', () => {
      const state = reducer({ ...initialState, error: true }, fetchStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(false);
    });
  });

  describe('fetchFail', () => {
    it('should set loading false and error true', () => {
      const state = reducer({ ...initialState, loading: true }, fetchFail());
      expect(state.loading).toBe(false);
      expect(state.error).toBe(true);
    });
  });

  describe('loginSuccess', () => {
    it('should set user and token from bearer.accessToken', () => {
      const state = reducer(initialState, loginSuccess(mockLoginPayload));
      expect(state.currentUser).toEqual(mockUser);
      expect(state.token).toBe('test-token-123');
      expect(state.loading).toBe(false);
    });

    it('should set user and token from payload.token', () => {
      const payload = { user: mockUser, token: 'alt-token' };
      const state = reducer(initialState, loginSuccess(payload));
      expect(state.token).toBe('alt-token');
    });

    it('should sanitize user data - no password stored', () => {
      const payloadWithPassword = {
        user: { ...mockUser, password: 'secret123' },
        bearer: { accessToken: 'token' },
      };
      const state = reducer(initialState, loginSuccess(payloadWithPassword));
      expect((state.currentUser as any)?.password).toBeUndefined();
    });

    it('should handle missing user data', () => {
      const state = reducer(initialState, loginSuccess({ bearer: { accessToken: 'token' } }));
      expect(state.currentUser).toBeNull();
      expect(state.token).toBe('token');
    });

    it('should read user from data.user path', () => {
      const payload = { data: { user: mockUser }, bearer: { accessToken: 'token' } };
      const state = reducer(initialState, loginSuccess(payload));
      expect(state.currentUser?.username).toBe('testuser');
    });
  });

  describe('registerSuccess', () => {
    it('should set user and token', () => {
      const state = reducer(initialState, registerSuccess(mockLoginPayload));
      expect(state.currentUser).toEqual(mockUser);
      expect(state.token).toBe('test-token-123');
      expect(state.loading).toBe(false);
    });
  });

  describe('logoutSuccess', () => {
    it('should clear user and token', () => {
      const loggedInState = {
        currentUser: mockUser,
        loading: false,
        error: false,
        token: 'test-token',
      };
      const state = reducer(loggedInState, logoutSuccess());
      expect(state.currentUser).toBeNull();
      expect(state.token).toBeNull();
      expect(state.loading).toBe(false);
    });
  });

  describe('userUpdateSuccess', () => {
    it('should update user data', () => {
      const loggedInState = {
        currentUser: mockUser,
        loading: true,
        error: false,
        token: 'token',
      };
      const updatedUser = { ...mockUser, firstName: 'Updated' };
      const state = reducer(loggedInState, userUpdateSuccess({ user: updatedUser }));
      expect(state.currentUser?.firstName).toBe('Updated');
      expect(state.loading).toBe(false);
    });
  });

  describe('clearAuth', () => {
    it('should clear all auth state', () => {
      const loggedInState = {
        currentUser: mockUser,
        loading: true,
        error: true,
        token: 'token',
      };
      const state = reducer(loggedInState, clearAuth());
      expect(state.currentUser).toBeNull();
      expect(state.token).toBeNull();
      expect(state.loading).toBe(false);
    });
  });

  describe('setInitialAuth', () => {
    it('should set token and user', () => {
      const state = reducer(initialState, setInitialAuth({ token: 'init-token', user: mockUser }));
      expect(state.token).toBe('init-token');
      expect(state.currentUser).toEqual(mockUser);
    });
  });

  describe('selectors', () => {
    it('selectIsAdmin returns true for admin', () => {
      const state = { auth: { ...initialState, currentUser: { ...mockUser, role: 'admin' } } };
      expect(selectIsAdmin(state)).toBe(true);
    });

    it('selectIsOwner returns true for owner', () => {
      const state = { auth: { ...initialState, currentUser: { ...mockUser, role: 'owner' } } };
      expect(selectIsOwner(state)).toBe(true);
    });

    it('selectIsUser returns true for user', () => {
      const state = { auth: { ...initialState, currentUser: mockUser } };
      expect(selectIsUser(state)).toBe(true);
    });

    it('selectors return falsy when no user', () => {
      const state = { auth: initialState };
      expect(selectIsAdmin(state)).toBeFalsy();
      expect(selectIsOwner(state)).toBeFalsy();
      expect(selectIsUser(state)).toBeFalsy();
    });
  });
});
