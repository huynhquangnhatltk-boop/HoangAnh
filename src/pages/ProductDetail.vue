<template>
    <section v-if="product">
      <h1>{{ product.title }}</h1>
      <p>{{ product.description }}</p>
      <p><strong>{{ formatPrice(product.price) }}</strong></p>
      <div style="margin-top:12px">
        Số lượng:
        <input type="number" v-model.number="qty" min="1" style="width:70px" />
        <button @click="addToCart">Thêm vào giỏ</button>
      </div>
    </section>
    <p v-else>Không tìm thấy sản phẩm.</p>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  //import { products } from '../data/products';
  import axios from 'axios';
  import { useCart } from '../store/cart';
  
  const route = useRoute();
  const router = useRouter();
  const id = Number(route.params.id);
  const product = ref(null);
  const qty = ref(1);
  const { add } = useCart();

  //goi api để lấy chi tiết sản phẩm
  onMounted(async () => {
    try{
    const res = await axios.get(`http://localhost:3000/products/${id}`);
    product.value = res.data;
    } catch (err) {
    console.error("Lỗi tải sản phẩm:", err);
    }
  });
  
  const addToCart = () => {
    add(product.value, qty.value);
    router.push('/cart');
  };
  
  const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v) + '₫';
  </script>
  