<template>
    <section>
      <h1>Danh sách sản phẩm</h1>
      <div class="grid">
        <div v-for="p in products" :key="p.id" class="card">
          <h3>{{ p.title }}</h3>
          <p>{{ p.description }}</p>
          <p><strong>{{ formatPrice(p.price) }}</strong></p>
          <div style="display:flex; gap:8px; margin-top:8px;">
            <button @click="addToCart(p)">Thêm vào giỏ</button>
            <router-link :to="`/product/${p.id}`">Chi tiết</router-link>
          </div>
        </div>
      </div>
    </section>

    <div class="p-4 space-y-4">
    <div v-for="(form, index) in forms" :key="index" class="flex items-center space-x-2">
      <!-- Nút toggle -->
      <button @click="form.open = !form.open">
        {{ form.open ? "➖" : "➕" }}
      </button>

      <!-- Form nhập sản phẩm (cùng hàng với nút) -->
      <template v-if="form.open">
        <input v-model="form.name" placeholder="Tên sản phẩm" />
        <input v-model.number="form.price" placeholder="Giá" type="number" />
        <button @click="saveForm(form)">Lưu</button>
      </template>

        <div>
        <button
          v-if="index === forms.length - 1"
          @click="addForm"
        >
          ➕
        </button>
        </div>
      </div>
      
    
  </div>

  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useCart } from '../store/cart';

  const forms = ref([
  { name: "", price: null, open: false } // form khởi tạo đầu tiên
]);

function addForm() {
  forms.value.push({ name: "", price: null, open: true });
}

  const showForm = ref(false);
  const newProduct = ref({ name: "", price: 0 });


  const products = ref([]);
  const { add } = useCart();
  
  const addToCart = (p) => add(p, 1);
  const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v) + '₫';
  
  onMounted(async () => {
    try {
      const res = await axios.get('http://localhost:3000/products');
      products.value = res.data;
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu từ database:', err);
    }
  });
  </script>
  
  <style>
  .grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(220px,1fr)); gap:14px; margin-top:12px; }
  .card { padding:12px; border:1px solid #ddd; border-radius:8px; background:#fff; }
  button { cursor:pointer; }
  </style>
  