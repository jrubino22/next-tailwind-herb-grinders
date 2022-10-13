import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
    cart: {
        cartItems: []
    }
};
