<template>
    <nav class="nav">
      <router-link to="/">Kho hàng</router-link>
      <router-link to="/shop">Bán hàng</router-link>
      <router-link to="/about">Giới thiệu</router-link>
      <router-link to="/cart">Giỏ hàng ({{ totalQty }})</router-link>
      <router-link to="/history">Lịch sử </router-link>
      <router-link to="/management">Quản lý </router-link>
    </nav>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useCart } from '../store/cart';
  
  const { state } = useCart();
  const totalQty = computed(() => state.items.reduce((s, i) => s + i.qty, 0));
  </script>
  
  <style>
  .nav { display:flex; gap:16px; padding:12px 0; border-bottom:1px solid #eee; }
  .router-link-active { font-weight:600; }
  </style>
  