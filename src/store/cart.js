import { reactive, computed } from 'vue';

const state = reactive({
  items: [] // { id, title, price, qty }
});

export function useCart() {
  const add = (product, qty = 1) => {
    const found = state.items.find(i => i.id === product.id);
    if (found) found.qty += qty;
    else state.items.push({ id: product.id, title: product.title, price: product.price, qty });
  };

  const remove = (id) => {
    const idx = state.items.findIndex(i => i.id === id);
    if (idx !== -1) state.items.splice(idx, 1);
  };

  const updateQty = (id, qty) => {
    const item = state.items.find(i => i.id === id);
    if (item) item.qty = Math.max(0, qty);
    // optionally remove if qty === 0
    if (item && item.qty === 0) remove(id);
  };

  const clear = () => state.items.splice(0);
  const total = computed(() => state.items.reduce((s, i) => s + i.price * i.qty * 1000, 0));
  return { state, add, remove, updateQty, clear, total };
}
