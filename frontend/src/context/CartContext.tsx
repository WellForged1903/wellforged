import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { trackEvent } from "@/utils/analytics";
import { getSafeImageUrl } from "@/utils/urlUtils";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  stock: number; // Added stock awareness
  image: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  hasItem: (id: string) => boolean;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load local cart on mount
  useEffect(() => {
    const localCart = localStorage.getItem("wellforged_cart");
    if (localCart) {
      try {
        const parsed = JSON.parse(localCart);
        if (Array.isArray(parsed)) {
          // Sanitize every item on load and migrate legacy prices
          const sanitizedItems = parsed.map((item: CartItem) => {
            let price = item.price;
            let originalPrice = item.originalPrice;

            // Auto-heal legacy divided prices (e.g. 5.49 -> 549)
            if (price < 10) {
              price = Math.round(price * 100);
            }
            if (originalPrice && originalPrice < 10) {
              originalPrice = Math.round(originalPrice * 100);
            }

            return {
              ...item,
              price,
              originalPrice,
              image: getSafeImageUrl(item.image)
            };
          });
          setItems(sanitizedItems);
        }
      } catch (e) {
        console.error("Failed to parse local cart:", e);
      }
    }
  }, []);

  // Persist to localStorage on change: always active in Ephemeral Model
  useEffect(() => {
    localStorage.setItem("wellforged_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (newItem: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id);
      
      // Stock Validation
      const currentInCart = existingItem?.quantity || 0;
      if (currentInCart + quantity > newItem.stock) {
        toast.error(`Only ${newItem.stock} units available in stock.`);
        return prev;
      }

      let updatedItems;
      if (existingItem) {
        updatedItems = prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedItems = [...prev, { ...newItem, image: getSafeImageUrl(newItem.image), quantity }];
      }
      return updatedItems;
    });

    toast.success(`Added to cart`);
    
    trackEvent("add_to_cart", {
      item_id: newItem.id,
      item_name: newItem.name,
      price: newItem.price,
      quantity
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
          if (item.id === id) {
              if (quantity > item.stock) {
                  toast.error(`Cannot exceed available stock (${item.stock})`);
                  return item;
              }
              return { ...item, quantity };
          }
          return item;
      })
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("wellforged_cart");
  };

  const hasItem = (id: string) => items.some((item) => item.id === id);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        hasItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
