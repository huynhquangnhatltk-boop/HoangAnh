import { createRouter, createWebHistory } from 'vue-router';
import Home from '../pages/Home.vue';
import Shop from '../pages/Shop.vue';
import ProductDetail from '../pages/ProductDetail.vue';
import Cart from '../pages/Cart.vue';
import About from '../pages/About.vue';
import History from '../pages/History.vue';
import OrderDetail from '../pages/OrderDetail.vue';
import OrderManagement from '../pages/OrderManagement.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/shop', name: 'Shop', component: Shop },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail, props: true },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/about', name: 'About', component: About },
  { path: '/history', name: 'History', component: History },
  { path: '/order/:id', name: 'OrderDetail', component: OrderDetail, props: true },
  { path: '/management', name: 'OrderManagement', component: OrderManagement },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
