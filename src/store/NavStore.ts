import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NavState {
  path: string;
  setPath: (path: string) => void;
}

const useNavStore = create<NavState>()(
  persist(
    (set) => ({
      path: "/",
      setPath: (path) => set({ path }),
    }),
    {
      name: "nav-storage",
    }
  )
);

export default useNavStore;
