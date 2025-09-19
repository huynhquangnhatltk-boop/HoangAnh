<template>
  <section class="p-6">
    <h1 class="text-2xl font-bold mb-2">Chào mừng đến cửa hàng demo</h1>
    <p class="mb-4">Ở đây có mục bán hàng mẫu — bạn có thể duyệt sản phẩm, xem chi tiết và thêm vào giỏ.</p>
      
    <p> <strong>Tìm kiếm sản phẩm:</strong>
      <input type="text" v-model="search" placeholder="Nhập tên sản phẩm">
    </p>

    <h2 style="display: flex; justify-content: space-between;"> 
      SẢN PHẨM
      <button @click="Them ()" class="add-btn"> ➕ Thêm sản phẩm </button> 
    </h2>
    
    <div class="grid">
      <div v-for="p in filteredProducts" :key="p.id" class="card">
        <h3 class="font-bold">{{ p.title }}</h3>
      
        <p>Tồn kho: {{p.stock}} </p>
        <p><strong>{{ formatPrice(p.price) }}</strong></p>

        <div class="card-row">
          <router-link :to="`/product/${p.id}`" class="view-btn">Xem</router-link>

          <div class="actions">
            <button @click="Sua(p)" class="edit-btn">Sửa</button>
            <button @click="Xoa(p.id)" class="delete-btn">Xoá</button>
          </div>
        </div>

      </div>
    </div>


    <!-- Modal -->
    <div v-if="showPopup" class="modal-overlay">
      <div class="modal">
        <h2>Sửa sản phẩm</h2>
        <div class="form">
          <label> Tên: <input v-model="newProduct.title" />  </label>
          <label> Mô tả: <input v-model="newProduct.description" />   </label>
          <label> Tồn kho <input type="number" v-model.number="newProduct.stock" />   </label>
          <label> Giá: <input type="number" v-model.number="newProduct.price" /> </label>
        </div>
      
        <div v-if="kt" class="actions">
          <button @click="saveEdit">💾 Sửa</button>
          <button @click="showPopup = false, kt = false">❌ Đóng</button>
        </div>
        <div v-else class="actions">
          <button @click="addProduct">💾 Thêm </button>
          <button @click="showPopup = false">❌ Đóng </button>
        </div>
        
      </div>
    </div>

  </section>
 
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';



const showPopup = ref(null);
const newProduct = ref({});

const products = ref([]);
const editingProduct = ref({});
const kt = ref(false);

/////////////Tìm kiếm sản phẩm/////////////////
const search = ref();
const filteredProducts = computed(() => {
  if (!search.value) return products.value; // không nhập => hiển thị tất cả
  return products.value.filter(p => 
    p.title.toLowerCase().includes(search.value.toLowerCase())
  );
});


const Them = () =>{
  newProduct.value = {};
  showPopup.value = true;
}

const Sua = (product) => {
  // tạo bản sao, tránh sửa trực tiếp
  newProduct.value = { ...product };
  showPopup.value = true;
  kt.value = true;
}

//Sửa sản phẩm
const saveEdit = async () => {
  if (!confirm('Bạn có muốn sua sản phẩm này')) return
  try {
    await axios.put(`http://localhost:3000/products/${newProduct.value.id}`,newProduct.value);
    const idx = products.value.findIndex(p => p.id === newProduct.value.id);
    if (idx > -1) {
      // Thay thế sản phẩm cũ trong mảng bằng bản mới (editingProduct)
      products.value[idx] = newProduct.value;
    }
    showPopup.value = false;
    alert("Sửa thành công!");
  } catch (err) {
    console.error(err)
    alert('Lưu thất bại!')
  }
};

// Format giá tiền
const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v*1000) + '₫';

// Lấy danh sách sản phẩm từ server khi component mount
onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:3000/products');
    products.value = res.data;
  } catch (err) {
    console.error('Lỗi khi lấy dữ liệu từ database:', err);
  }
});


// Thêm sản phẩm mới
const addProduct = async () => {
  if (!newProduct.value.title || !newProduct.value.price) {
    alert('Vui lòng nhập tên và giá sản phẩm!');
    return;
  }
  try {
    // Gửi POST lên server
    const res = await axios.post('http://localhost:3000/products', newProduct.value);
    // Cập nhật danh sách local
    products.value.push(res.data);
    // Reset form và đóng popup
    newProduct.value = { title: '', description: '', price: 0 };
    showPopup.value = false;
    alert("Thêm thành công!");
  } catch (err) {
    console.error('Lỗi khi thêm sản phẩm:', err);
  }
};

//Xoá sản phẩm
const Xoa = async (id) => {
  console.log(id);
  if (!confirm('Bạn có muốn xoá sản phẩm này')) return
  try {
    await axios.delete(`http://localhost:3000/products/${id}`)
    products.value = products.value.filter(p => p.id !== id)
  } catch (err) {
    console.error(err)
    alert('Xoá thất bại!')
  }
};



</script>

<style>
.grid { display:grid; 
  grid-template-columns: 
  repeat(auto-fit,minmax(200px,1fr)); 
  gap:12px; 
  margin-top:12px;
 }
  
.card { 
  display: flex;                  /* sắp xếp theo cột */
  max-width: 270px;
  flex-direction: column;
  justify-content: space-between; /* đẩy card-row xuống cuối */
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  height: 200;                  /* chiều cao cố định */
  overflow: hidden; 
  
}

.card p {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
/*  -webkit-line-clamp: 1;    giới hạn 1 dòng */
  -webkit-box-orient: vertical;
  margin-bottom: 8px;      /* khoảng cách tới nút */
}

.card-row {
  display: flex;
  justify-content: space-between; /* Xem trái, Xoá phải */
  align-items: center;
  margin-top: 8px;  
}


/*gach chan xuat hien*/
.view-btn:hover {
  text-decoration: underline;
}

.delete-btn {
  background-color: #f87171; /* đỏ nhạt */
  color: rgb(0, 0, 0);
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.delete-btn:hover {
  background-color: #dc2626; /* đỏ đậm khi hover */
}

.edit-btn {
  background-color: #7fe396; /* xanh nhạt */
  color: rgb(0, 0, 0);
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
}

.edit-btn:hover {
  background-color: #3fb325; /* xanh đậm khi hover */
}

.add-btn:hover {
  background-color: #dee1de; 
}

/* Modal style */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  padding: 20px 25px;
  border-radius: 12px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 6px 20px rgba(0,0,0,0.25);
  animation: fadeIn 0.3s ease;
}

.modal h2 {
  margin-bottom: 15px;
  font-size: 20px;
  text-align: center;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.form label {
  display: block;
  margin-bottom: 12px;
  font-size: 14px;
  color: #333;
}

.form input {
  width: 95%;
  padding: 8px 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

</style>
