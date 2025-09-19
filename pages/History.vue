<template>
  <section>
    <h1>Lịch sử bán hàng</h1>

    <h2>Doanh thu theo ngày</h2>
    <table class="history-table">
      <thead>
        <tr>
          <th>Ngày</th>
          <th>Tổng đơn</th>
          <th>Doanh thu</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(day, index) in dailyRevenue" :key="index">
          <tr class="clickable" @click="toggleDay(day.date)">
            <td>{{ day.date }}</td>
            <td>{{ day.count }}</td>
            <td>{{ formatPrice(day.total) }}</td>
          </tr>
          <tr v-if="expandedDay === day.date" class="details-row">
            <td colspan="3">
              <ul>
                <li v-for="(o, idx) in orders.filter(order => order.date.slice(0,10) === day.date)" :key="o.id">
                  Đơn #{{ idx+1 }} - Tổng: {{ formatPrice(o.total) }} - Thời gian: {{ o.date.slice(11,19) }}
                  <router-link :to="`/order/${o.id}`" class="view-bth">Xem</router-link>
                </li>
              </ul>
            </td>
          </tr>
        </template>
      </tbody>
    </table>

    <h2>Doanh thu theo tháng</h2>
    <table class="history-table">
      <thead>
        <tr>
          <th>Tháng</th>
          <th>Tổng đơn</th>
          <th>Doanh thu</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(month, index) in monthlyRevenue" :key="index">
          <tr class="clickable" @click="toggleMonth(month.month)">
            <td>{{ month.month }}</td>
            <td>{{ month.count }}</td>
            <td>{{ formatPrice(month.total) }}</td>
          </tr>
          <tr v-if="expandedMonth === month.month" class="details-row">
            <td colspan="3">
              <ul>
                <li v-for="o in orders.filter(order => order.date.slice(0,7) === month.month)" :key="o.id">
                  Đơn #{{ o.id }} - Tổng: {{ formatPrice(o.total) }} - Ngày: {{ o.date.slice(0,10) }}
                </li>
              </ul>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const orders = ref([]);
const dailyRevenue = ref([]);
const monthlyRevenue = ref([]);
const expandedDay = ref(null);
const expandedMonth = ref(null);

const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v) + '₫';

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/orders');
    orders.value = res.data;
    

    // Doanh thu theo ngày
    const dailyMap = {};
    orders.value.forEach(o => {
      o.date = new Date(o.date).toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' })
      console.log(o.date);
      const day = o.date.slice(0,10);
      console.log(day);
      
      if (!dailyMap[day]) dailyMap[day] = { count:0, total:0 };
      dailyMap[day].count += 1;
      dailyMap[day].total += parseFloat(o.total);
    });
    dailyRevenue.value = Object.entries(dailyMap).map(([date,val])=>({date,...val}))
      .sort((a,b)=> a.date.localeCompare(b.date));

    // Doanh thu theo tháng
    const monthMap = {};
    orders.value.forEach(o => {
      const month = o.date.slice(0,7);
      if (!monthMap[month]) monthMap[month] = { count:0, total:0 };
      monthMap[month].count += 1;
      monthMap[month].total += parseFloat(o.total);
    });
    monthlyRevenue.value = Object.entries(monthMap).map(([month,val])=>({month,...val}))
      .sort((a,b)=> a.month.localeCompare(b.month));

  } catch(err) {
    console.error('Lỗi lấy dữ liệu đơn hàng:', err);
  }
});

const toggleDay = (date) => {
  expandedDay.value = expandedDay.value === date ? null : date;
}
const toggleMonth = (month) => {
  expandedMonth.value = expandedMonth.value === month ? null : month;
}
</script>

<style>
section { padding:20px; font-family:Arial,sans-serif; }
h1 { font-size:24px; margin-bottom:16px; }
h2 { font-size:18px; margin-top:24px; margin-bottom:8px; }
.history-table { width:100%; border-collapse:collapse; margin-bottom:16px; }
.history-table th, .history-table td { border:1px solid #ccc; padding:8px; text-align:left; }
.history-table th { background-color:#f0f0f0; font-weight:bold; }
.history-table tr:nth-child(even) { background-color:#fafafa; }
.details-row td { background:#f9f9f9; padding:8px; }
.clickable { cursor:pointer; }
</style>
