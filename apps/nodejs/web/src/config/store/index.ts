import { AnyAction, configureStore, ThunkDispatch } from '@reduxjs/toolkit'
import workspaceReducer from '@/features/workspace/slice'
import accountReducer from '@/features/account/slice'
import contactReducer from '@/features/contact/slice'
import connectionReducer from '@/features/connection/slice'
import purposeReducer from '@/features/purpose/slice'
import { cryptoPricesSlice } from '@/features/cryptoPrice/slice'

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    account: accountReducer,
    contact: contactReducer,
    connection: connectionReducer,
    purpose: purposeReducer,
    [cryptoPricesSlice.reducerPath]: cryptoPricesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(cryptoPricesSlice.middleware),
})

export type RootState = ReturnType<typeof store.getState>

export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>

export type AppDispatch = AppThunkDispatch
