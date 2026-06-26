import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('token')
const user = JSON.parse(localStorage.getItem('user') || 'null')

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: token || null,
    user: user || null,
  },
  reducers: {
    setCredentials(state, action) {
      state.token = action.payload.token
      state.user = action.payload.user
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    },
    clearCredentials(state) {
      state.token = null
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer

export const selectCurrentUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => !!state.auth.token
export const selectToken = (state) => state.auth.token
