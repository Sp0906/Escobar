import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/cart';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await getCart();
    return data.cart;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addItemToCart = createAsyncThunk('cart/addItem', async (itemData, { rejectWithValue, dispatch }) => {
  try {
    await addToCart(itemData);
    dispatch(fetchCart());
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const updateItem = createAsyncThunk('cart/updateItem', async ({ itemId, data }, { rejectWithValue, dispatch }) => {
  try {
    await updateCartItem(itemId, data);
    dispatch(fetchCart());
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update cart');
  }
});

export const removeItem = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue, dispatch }) => {
  try {
    await removeFromCart(itemId);
    dispatch(fetchCart());
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove item');
  }
});

export const emptyCart = createAsyncThunk('cart/emptyCart', async (_, { rejectWithValue, dispatch }) => {
  try {
    await clearCart();
    dispatch(fetchCart());
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear cart');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { cart: null, loading: false, error: null },
  reducers: {
    clearCartError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.loading = false; state.cart = action.payload; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { clearCartError } = cartSlice.actions;
export default cartSlice.reducer;
