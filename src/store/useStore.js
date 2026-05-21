import { create } from 'zustand';

export const useStore = create((set) => ({
  user: null,
  authInitialized: false,
  inventory: [],
  salesData: [],
  moneyTransactions: [],
  isDarkMode: localStorage.getItem('theme') === 'dark',
  isInitialized: false,
  
  setUser: (user) => set({ user, authInitialized: true }),
  setAuthInitialized: (status) => set({ authInitialized: status }),
  
  toggleDarkMode: () => set((state) => {
    const newMode = !state.isDarkMode;
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    return { isDarkMode: newMode };
  }),
  
  setInventory: (inventory) => set({ inventory }),
  setSalesData: (salesData) => set({ salesData }),
  setMoneyTransactions: (moneyTransactions) => set({ moneyTransactions }),
  setInitialized: (status) => set({ isInitialized: status })
}));
