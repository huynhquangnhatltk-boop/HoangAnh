<template>
    <section v-if="order">
      <h1>Chi tiết đơn hàng #{{ order.id }}</h1>
      <p><strong>Ngày:</strong> {{ order.date }}</p>
      <p><strong>Tổng tiền:</strong> {{ formatPrice(order.total) }}</p>
  
      <h2>Sản phẩm trong đơn</h2>
      <table class="order-table">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Số lượng</th>
            <th>Giá</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in order.items" :key="item.id">
            <td>{{ item.title }}</td>
            <td>{{ item.qty }}</td>
            <td>{{ formatPrice(item.price) }}</td>
          </tr>
        </tbody>
      </table>
  
      <router-link to="/history" class="back-btn">← Quay lại</router-link>
    </section>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import { API_URL } from '../config'
  import axios from 'axios'
  
  const route = useRoute()
  const order = ref(null)
  
  const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v) + '₫'
  
  onMounted(async () => {
    try {
      const res = await axios.get(`${API_URL}/orders/${route.params.id}`)
      order.value = res.data
    } catch (err) {
      console.error('Không lấy được đơn hàng:', err)  
    }
  })
  </script>
  
  <style>
  .order-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
  }
  .order-table th, .order-table td {
    border: 1px solid #ccc;
    padding: 8px;
  }
  .back-btn {
    display: inline-block;
    margin-top: 16px;
    padding: 6px 12px;
    background: #eee;
    border-radius: 4px;
    text-decoration: none;
  }
  </style>
  