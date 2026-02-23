import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee' | 'customer';
  location?: string;
  phone?: string;
  marketingEmails?: boolean;
}

export interface ShippingRegion {
  id: string;
  country: string;
  county: string;
  region: string;
  fee: number;
}

// Default shipping regions (employee can update these)
export const DEFAULT_SHIPPING_REGIONS: ShippingRegion[] = [
  // Kenya
  { id: '1', country: 'Kenya', county: 'Nairobi', region: 'Nairobi', fee: 300 },
  { id: '2', country: 'Kenya', county: 'Kiambu', region: 'Central', fee: 400 },
  { id: '3', country: 'Kenya', county: 'Mombasa', region: 'Coast', fee: 800 },
  { id: '4', country: 'Kenya', county: 'Kisumu', region: 'Nyanza', fee: 700 },
  { id: '5', country: 'Kenya', county: 'Nakuru', region: 'Rift Valley', fee: 500 },
  { id: '6', country: 'Kenya', county: 'Eldoret', region: 'Rift Valley', fee: 600 },
  { id: '7', country: 'Kenya', county: 'Machakos', region: 'Eastern', fee: 450 },
  { id: '8', country: 'Kenya', county: 'Thika', region: 'Central', fee: 350 },
  
  // Tanzania
  { id: '9', country: 'Tanzania', county: 'Dar es Salaam', region: 'Coastal', fee: 1200 },
  { id: '10', country: 'Tanzania', county: 'Arusha', region: 'Northern', fee: 1500 },
  { id: '11', country: 'Tanzania', county: 'Mwanza', region: 'Lake', fee: 1600 },
  { id: '12', country: 'Tanzania', county: 'Dodoma', region: 'Central', fee: 1400 },
  
  // Uganda
  { id: '13', country: 'Uganda', county: 'Kampala', region: 'Central', fee: 1100 },
  { id: '14', country: 'Uganda', county: 'Entebbe', region: 'Central', fee: 1200 },
  { id: '15', country: 'Uganda', county: 'Jinja', region: 'Eastern', fee: 1300 },
  
  // Rwanda
  { id: '16', country: 'Rwanda', county: 'Kigali', region: 'Kigali', fee: 1400 },
  { id: '17', country: 'Rwanda', county: 'Butare', region: 'Southern', fee: 1500 },
];

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export const CURRENCIES: Currency[] = [
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 1 },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', rate: 3.2 },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', rate: 38 },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', rate: 13.5 },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', rate: 29 },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', rate: 5.5 },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh', rate: 75 },
  { code: 'SDG', name: 'Sudanese Pound', symbol: '£', rate: 7.5 },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: '£', rate: 17 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.0077 }
];

interface StoreContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  user: User | null;
  login: (email: string, role: User['role']) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  selectedCurrency: Currency;
  setSelectedCurrency: (currency: Currency) => void;
  convertPrice: (priceInKES: number) => number;
  formatPrice: (priceInKES: number) => string;
  shippingRegions: ShippingRegion[];
  getShippingFee: (county: string) => number;
  updateShippingRegion: (id: string, fee: number) => void;
  addShippingRegion: (region: ShippingRegion) => void;
  deleteShippingRegion: (id: string) => void;
  isFirstTimeUser: boolean;
  setIsFirstTimeUser: (value: boolean) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[0]); // Default to KES
  const [shippingRegions, setShippingRegions] = useState<ShippingRegion[]>(DEFAULT_SHIPPING_REGIONS);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(true);

  const convertPrice = (priceInKES: number): number => {
    return priceInKES * selectedCurrency.rate;
  };

  const formatPrice = (priceInKES: number): string => {
    const convertedPrice = convertPrice(priceInKES);
    const formattedNumber = convertedPrice.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    return `${selectedCurrency.symbol} ${formattedNumber}`;
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item).filter(item => item.quantity > 0));
  };

  const clearCart = () => {
    setCart([]);
  };

  const login = (email: string, role: User['role']) => {
    setUser({ id: '1', name: email.split('@')[0], email, role });
  };

  const logout = () => setUser(null);

  const updateUser = (updates: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  };

  const getShippingFee = (county: string) => {
    const region = shippingRegions.find(r => r.county === county);
    return region ? region.fee : 0;
  };

  const updateShippingRegion = (id: string, fee: number) => {
    setShippingRegions(prev => prev.map(r => r.id === id ? {...r, fee} : r));
  };

  const addShippingRegion = (region: ShippingRegion) => {
    setShippingRegions(prev => [...prev, region]);
  };

  const deleteShippingRegion = (id: string) => {
    setShippingRegions(prev => prev.filter(r => r.id !== id));
  };

  return (
    <StoreContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      user, 
      login, 
      logout, 
      updateUser,
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
      isFirstTimeUser,
      setIsFirstTimeUser
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