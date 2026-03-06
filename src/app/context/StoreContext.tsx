import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';

// ─── localStorage keys ─────────────────────────────────────────────────────
// We persist auth across page refreshes using localStorage.
// 'pb_' prefix = Premier Beauty, avoids conflicts with other sites.
const TOKEN_KEY   = 'pb_token';
const USER_KEY    = 'pb_user';
const SESSION_KEY = 'pb_session_id';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

// User now matches what the backend actually returns after login/signup.
// 'role' drives what the user can see: customer → shop, employee/admin → dashboard.
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'customer';
  permissions?: string[];           // only for employee/admin
  requiresPasswordReset?: boolean;  // true on first employee login with temp password
  phone?: string;
  marketingEmails?: boolean;
  savedAddress?: {
    county: string;
    city: string;
    streetAddress: string;
    building?: string;
    additionalInfo?: string;
  };
}

export interface ShippingRegion {
  id: string;
  country: string;
  county: string;
  region: string;
  fee: number;
}

export const DEFAULT_SHIPPING_REGIONS: ShippingRegion[] = [
  // Kenya
  { id: '1',  country: 'Kenya',    county: 'Nairobi',       region: 'Nairobi',     fee: 300  },
  { id: '2',  country: 'Kenya',    county: 'Kiambu',        region: 'Central',     fee: 400  },
  { id: '3',  country: 'Kenya',    county: 'Mombasa',       region: 'Coast',       fee: 800  },
  { id: '4',  country: 'Kenya',    county: 'Kisumu',        region: 'Nyanza',      fee: 700  },
  { id: '5',  country: 'Kenya',    county: 'Nakuru',        region: 'Rift Valley', fee: 500  },
  { id: '6',  country: 'Kenya',    county: 'Eldoret',       region: 'Rift Valley', fee: 600  },
  { id: '7',  country: 'Kenya',    county: 'Machakos',      region: 'Eastern',     fee: 450  },
  { id: '8',  country: 'Kenya',    county: 'Thika',         region: 'Central',     fee: 350  },
  // Tanzania
  { id: '9',  country: 'Tanzania', county: 'Dar es Salaam', region: 'Coastal',     fee: 1200 },
  { id: '10', country: 'Tanzania', county: 'Arusha',        region: 'Northern',    fee: 1500 },
  { id: '11', country: 'Tanzania', county: 'Mwanza',        region: 'Lake',        fee: 1600 },
  { id: '12', country: 'Tanzania', county: 'Dodoma',        region: 'Central',     fee: 1400 },
  // Uganda
  { id: '13', country: 'Uganda',   county: 'Kampala',       region: 'Central',     fee: 1100 },
  { id: '14', country: 'Uganda',   county: 'Entebbe',       region: 'Central',     fee: 1200 },
  { id: '15', country: 'Uganda',   county: 'Jinja',         region: 'Eastern',     fee: 1300 },
  // Rwanda
  { id: '16', country: 'Rwanda',   county: 'Kigali',        region: 'Kigali',      fee: 1400 },
  { id: '17', country: 'Rwanda',   county: 'Butare',        region: 'Southern',    fee: 1500 },
];

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'KES', name: 'Kenyan Shilling',    symbol: 'KSh', rate: 1      },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 3.2    },
  { code: 'UGX', name: 'Ugandan Shilling',   symbol: 'USh', rate: 38     },
  { code: 'RWF', name: 'Rwandan Franc',      symbol: 'FRw', rate: 13.5   },
  { code: 'BIF', name: 'Burundian Franc',    symbol: 'FBu', rate: 29     },
  { code: 'ETB', name: 'Ethiopian Birr',     symbol: 'Br',  rate: 5.5    },
  { code: 'SOS', name: 'Somali Shilling',    symbol: 'Sh',  rate: 75     },
  { code: 'SDG', name: 'Sudanese Pound',     symbol: '£',   rate: 7.5    },
  { code: 'SSP', name: 'S. Sudanese Pound',  symbol: '£',   rate: 17     },
  { code: 'USD', name: 'US Dollar',          symbol: '$',   rate: 0.0077 },
];

// ─── Context shape ──────────────────────────────────────────────────────────

interface StoreContextType {
  // Auth
  user: User | null;
  token: string | null;     // JWT from backend — sent with every authenticated request
  sessionId: string;        // UUID for guest cart — stays even when logged out
  authLoading: boolean;     // true while restoring auth from localStorage on first load
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isFirstTimeUser: boolean;
  setIsFirstTimeUser: (value: boolean) => void;

  // Cart (local state with backend sync via optimistic updates)
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // UI
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;

  // Currency
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  convertPrice: (priceInKES: number) => number;
  formatPrice: (priceInKES: number) => string;

  // Shipping
  shippingRegions: ShippingRegion[];
  getShippingFee: (county: string) => number;
  updateShippingRegion: (id: string, fee: number) => void;
  addShippingRegion: (region: ShippingRegion) => void;
  deleteShippingRegion: (id: string) => void;
}

// ─── Context + Provider ─────────────────────────────────────────────────────

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                         = useState<User | null>(null);
  const [token, setToken]                       = useState<string | null>(null);
  const [authLoading, setAuthLoading]           = useState(true);
  const [cart, setCart]                         = useState<CartItem[]>([]);
  const [isSearchOpen, setIsSearchOpen]         = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]);
  const [shippingRegions, setShippingRegions]   = useState<ShippingRegion[]>(DEFAULT_SHIPPING_REGIONS);
  const [isFirstTimeUser, setIsFirstTimeUser]   = useState(true);

  // ── Guest session ID ──
  // Generated once per browser and saved to localStorage permanently.
  // The backend uses this string to find/create the guest's cart row.
  // When the user logs in, the backend merges their guest cart into their account cart.
  const [sessionId] = useState<string>(() => {
    const existing = localStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const newId = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, newId);
    return newId;
  });

  // ── Restore auth on app load ──
  // React state resets on every page refresh. This useEffect runs once on
  // mount, reads the saved token + user from localStorage, and puts them
  // back into state — so the user stays logged in after refreshing the page.
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser  = localStorage.getItem(USER_KEY);
      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);

        // Refresh saved address from DB in background so it stays in sync
        // across devices and sessions (localStorage is device-local).
        apiFetch('/profile', {}, savedToken, null)
          .then((profile: any) => {
            if (profile?.shipping_address) {
              setUser(prev => {
                if (!prev) return null;
                const updated = { ...prev, savedAddress: profile.shipping_address };
                localStorage.setItem(USER_KEY, JSON.stringify(updated));
                return updated;
              });
            }
          })
          .catch(() => {}); // silently ignore — localStorage value still used as fallback
      }
    } catch {
      // Corrupted localStorage — clear it and start fresh
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      // Always mark loading as done so the app can render
      setAuthLoading(false);
    }
  }, []);

  // ── Cart loader ──
  // Fetches GET /cart from the backend and converts the response into our
  // local CartItem[] format. Called on startup (after auth restores) and
  // after login (so guest cart gets merged into the user's account cart).
  //
  // Backend returns:
  //   { cart_id: "...", items: [{ quantity: 2, products: { id, name, price, images } }] }
  //
  // We map each item to a CartItem with the shape our UI expects.
  const loadCart = async (tok: string | null, sid: string) => {
    try {
      const data = await apiFetch('/cart', {}, tok, sid);
      const items: CartItem[] = (data.items || [])
        .filter((item: any) => item.products)
        .map((item: any) => ({
          id:          String(item.products.id),
          name:        item.products.name,
          price:       Number(item.products.price),
          image:       item.products.images?.[0] ?? '',
          category:    '',   // GET /cart doesn't join categories — that's fine
          description: '',   // same
          quantity:    item.quantity,
        }));
      setCart(items);
    } catch {
      // silently fail — cart stays as-is (usually empty on first load)
    }
  };

  // ── Load cart from backend once auth has finished restoring ──
  // authLoading starts as true, flips to false after the restore effect above.
  // At that point, token is already set (if user was logged in) so we load
  // the right cart (user's or guest's).
  useEffect(() => {
    if (authLoading) return;
    loadCart(token, sessionId);
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── login ──
  // Called from Login.tsx after a successful API response.
  // Saves the real user object + JWT token to state AND localStorage.
  // Then reloads the cart — this is what triggers the backend to merge
  // any items the guest added (using sessionId) into the user's account cart.
  const login = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem(TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    loadCart(authToken, sessionId); // merge guest cart + load user cart

    // Fetch saved address from DB and merge into user state
    apiFetch('/profile', {}, authToken, null)
      .then((profile: any) => {
        if (profile?.shipping_address) {
          setUser(prev => {
            if (!prev) return null;
            const updated = { ...prev, savedAddress: profile.shipping_address };
            localStorage.setItem(USER_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      })
      .catch(() => {});
  };

  // ── logout ──
  // Wipes everything. Session ID is intentionally kept so that
  // items added to cart after logout are still tracked.
  const logout = () => {
    setUser(null);
    setToken(null);
    setCart([]);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // ── Cart helpers (optimistic update pattern) ──
  //
  // Each function does two things:
  //   1. Update local state immediately so the UI responds without waiting.
  //   2. Fire an API call in the background to keep the backend in sync.
  //
  // If the API call fails we log it but don't revert — the next page load
  // or login will re-sync from the backend anyway.

  const addToCart = (product: Product) => {
    // Calculate new quantity from current cart state BEFORE the setter runs.
    const existing = cart.find(item => item.id === product.id);
    const newQuantity = (existing?.quantity ?? 0) + 1;

    // 1. Optimistic update
    setCart(prev => {
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });

    // 2. Background API sync
    // POST /cart/add uses upsert — sending the full new quantity overwrites the old one.
    apiFetch('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ product_id: Number(product.id), quantity: newQuantity }),
    }, token, sessionId).catch(err => console.error('[cart] add failed:', err));
  };

  const removeFromCart = (productId: string) => {
    // 1. Optimistic update
    setCart(prev => prev.filter(item => item.id !== productId));

    // 2. Background API sync
    apiFetch('/cart/remove', {
      method: 'POST',
      body: JSON.stringify({ product_id: Number(productId) }),
    }, token, sessionId).catch(err => console.error('[cart] remove failed:', err));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const newQty = Math.max(0, quantity);

    // 1. Optimistic update — if quantity hits 0, remove the item entirely
    setCart(prev =>
      prev
        .map(item => item.id === productId ? { ...item, quantity: newQty } : item)
        .filter(item => item.quantity > 0)
    );

    // 2. Background API sync
    if (newQty === 0) {
      apiFetch('/cart/remove', {
        method: 'POST',
        body: JSON.stringify({ product_id: Number(productId) }),
      }, token, sessionId).catch(err => console.error('[cart] remove failed:', err));
    } else {
      apiFetch('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ product_id: Number(productId), quantity: newQty }),
      }, token, sessionId).catch(err => console.error('[cart] update failed:', err));
    }
  };

  const clearCart = () => {
    // 1. Optimistic update
    setCart([]);

    // 2. Background API sync
    apiFetch('/cart/clear', { method: 'POST' }, token, sessionId)
      .catch(err => console.error('[cart] clear failed:', err));
  };

  // ── Currency helpers ──
  const convertPrice = (priceInKES: number): number => priceInKES * selectedCurrency.rate;

  const formatPrice = (priceInKES: number): string => {
    const converted = convertPrice(priceInKES);
    return `${selectedCurrency.symbol} ${converted.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // ── Shipping helpers ──
  const getShippingFee = (county: string) => {
    const region = shippingRegions.find(r => r.county === county);
    return region ? region.fee : 0;
  };

  const updateShippingRegion = (id: string, fee: number) => {
    setShippingRegions(prev => prev.map(r => r.id === id ? { ...r, fee } : r));
  };

  const addShippingRegion = (region: ShippingRegion) => {
    setShippingRegions(prev => [...prev, region]);
  };

  const deleteShippingRegion = (id: string) => {
    setShippingRegions(prev => prev.filter(r => r.id !== id));
  };

  return (
    <StoreContext.Provider value={{
      user,
      token,
      sessionId,
      authLoading,
      login,
      logout,
      updateUser,
      isFirstTimeUser,
      setIsFirstTimeUser,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isSearchOpen,
      setIsSearchOpen,
      selectedCurrency,
      setSelectedCurrency,
      convertPrice,
      formatPrice,
      shippingRegions,
      getShippingFee,
      updateShippingRegion,
      addShippingRegion,
      deleteShippingRegion,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
