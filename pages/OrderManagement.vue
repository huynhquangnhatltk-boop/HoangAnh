<template>
    <section>
      <h1>Quản lý đơn hàng</h1>
  
      <p>
        <strong>Tìm theo tên khách hàng:</strong>
        <input type="text" v-model="search" placeholder="Nhập tên">
      </p>
  
      <table v-if="filteredOrders.length">
        <thead>
          <tr>
            <th>Khách hàng</th>
            <th>SĐT</th>
            <th>Ngày</th>
            <th>Tổng</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="o in filteredOrders" :key="o.id">
            <td>{{ o.ten }}</td>
            <td>{{ o.sdt }}</td>
            <td>{{ formatDate(o.date) }}</td>
            <td>{{ formatPrice(o.total) }}</td>
            <td>
              <button @click="editOrder(o.id)">Sửa</button>
              <button @click="deleteOrder(o.id)">Xoá</button>
            </td>
          </tr>
        </tbody>
      </table>
  
      <p v-else>Không có đơn hàng</p>
  
      <!-- Modal chỉnh sửa -->
      <div v-if="editingOrder" class="modal">
        <h2>Chỉnh sửa đơn #{{ editingOrder.id }}</h2>
  
        <p>
          Tên khách hàng: <input v-model="editingOrder.customer_name">
          SĐT: <input v-model="editingOrder.phone">
        </p>
  
        <table>
          <thead>
            <tr><th>Sản phẩm</th><th>Số lượng</th><th>Giá</th><th>Thành tiền</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="(it, idx) in editingOrder.items" :key="it.id">
              <td>{{ it.title }}</td>
              <td><input type="number" v-model.number="it.qty"></td>
              <td><input type="number" v-model.number="it.price"></td>
              <td>{{ formatPrice(it.qty * it.price) }}</td>
              <td><button @click="removeItem(idx)">Xóa</button></td>
            </tr>
          </tbody>
        </table>
  
        <p>Tổng: {{ formatPrice(orderTotal) }}</p>
  
        <button @click="saveOrder">Lưu</button>
        <button @click="cancelEdit">Hủy</button>
      </div>
    </section>
  </template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
  
const orders = ref([]);
const editingOrder = ref(null);  
const search = ref();
const formatPrice = v => new Intl.NumberFormat('vi-VN').format(v) + '₫';


/////SEARCH/////////////////////
const filteredOrders = computed(() =>{
  if (!search.value) return orders.value;
  return orders.value.filter(o =>
    (o.ten || "").toLowerCase().includes(search.value.toLowerCase())
  );
});

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN'); // dd/mm/yyyy
};

  
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/orders');
    orders.value = res.data;
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu từ database:', err);
  }
});

const editOrder = async (id) => {
    const res = await axios.get(`http://localhost:3000/orders/${id}`);
    editingOrder.value = res.data;
};

    const deleteOrder = async (id) => { 
        if (!confirm('Bạn có muốn xoá sản phẩm này')) return
        try {
            const res = await axios.delete(`http://localhost:3000/orders/${id}`);
            orders.value = orders.value.filter(order => order.id !== id);
            alert('Xoá đơn thành công!');
        } catch (error) {
        console.error("Xoá đơn thất bại:", error);
        }
    };
  
  const removeItem = (idx) => {
    editingOrder.value.items.splice(idx, 1);
  };
  
  const cancelEdit = () => {
    editingOrder.value = null;
  };
  
  const orderTotal = computed(() => {
    if (!editingOrder.value) return 0;
    return editingOrder.value.items.reduce((sum, it) => sum + it.qty * it.price, 0);
  });
  
  const saveOrder = async () => {
    const { id, customer_name, phone, items } = editingOrder.value;
    await axios.put(`http://localhost:3000/orders/${id}`, {
      customer_name, phone, items, total: orderTotal.value
    });
    alert('Đã lưu đơn hàng');
    editingOrder.value = null;
    searchOrders();
  };
  </script>
  
  <style>
  .modal { 
  background: #fff; 
  padding: 20px; 
  border: 1px solid #ccc; 
  position: fixed; 
  top: 10%; 
  left: 50%; 
  transform: translateX(-50%);
  width: 60%; 
  max-height: 80vh;       /* giới hạn chiều cao modal */
  overflow-y: auto;        /* bật scroll dọc khi nội dung vượt */
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  z-index: 1000;
}
  </style>
  