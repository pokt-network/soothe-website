import { AnyAction, configureStore, Store, ThunkDispatch } from '@reduxjs/toolkit'
import workspaceReducer from '@/features/workspace/slice'
import accountReducer from '@/features/account/slice'
import contactReducer from '@/features/contact/slice'
import connectionReducer from '@/features/connection/slice'
import { cryptoPricesSlice } from '@/features/cryptoPrice/slice'

export const store = configureStore({
  reducer: {
    workspace: workspaceReducer,
    account: accountReducer,
    contact: contactReducer,
    connection: connectionReducer,
    [cryptoPricesSlice.reducerPath]: cryptoPricesSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(cryptoPricesSlice.middleware),
})

//todo: improve types

// 1. Get the root state's type from reducers
export type RootState = ReturnType<typeof store.getState>

// 2. Create a type for thunk dispatch
export type AppThunkDispatch = ThunkDispatch<RootState, any, AnyAction>

// 3. Create a type for store using RootState and Thunk enabled dispatch
export type AppStore = Omit<Store<RootState>, 'dispatch'> & {
  dispatch: AppThunkDispatch
}

export type AppDispatch = AppThunkDispatch
