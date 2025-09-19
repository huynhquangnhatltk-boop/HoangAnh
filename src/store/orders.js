// src/store/orders.js
import { reactive, computed, watch } from 'vue';

const saved = JSON.parse(localStorage.getItem('orders') || '[]');

const state = reactive({
  orders: saved
});

// Thêm đơn hàng mới
const addOrder = (items) => {
  const newOrder = {
    id: Date.now(),
    date: new Date(),
    items: items.map(i => ({ ...i })), // copy sản phẩm
    total: items.reduce((sum, i) => sum + i.price * i.qty, 0)
  };
  state.orders.push(newOrder);
};

// Watch để lưu localStorage
watch(
  () => state.orders,
  (newVal) => {
    localStorage.setItem('orders', JSON.stringify(newVal));
  },
  { deep: true }
);

// Doanh thu theo ngày
const revenueByDay = computed(() => {
  const result = {};
  state.orders.forEach(o => {
    const day = new Date(o.date).toISOString().slice(0,10);
    result[day] = (result[day] || 0) + o.total;
  });
  return result;
});

// Doanh thu theo tháng
const revenueByMonth = computed(() => {
  const result = {};
  state.orders.forEach(o => {
    const month = new Date(o.date).toISOString().slice(0,7);
    result[month] = (result[month] || 0) + o.total;
  });
  return result;
});

export function useOrders() {
  return { state, addOrder, revenueByDay, revenueByMonth };
}
