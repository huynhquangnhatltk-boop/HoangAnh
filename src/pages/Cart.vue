  <template>
    <section>
      <h1>Giỏ hàng</h1>
      <p> <strong> Tên khách hàng: </strong> <input type="text" v-model="customName" placeholder="Nhập tên" class="hidden-input"> </p>
      <p> <strong> Số điện thoại: </strong> <input type="text" v-model="customPhone" placeholder="Nhập số điện thoại" class="hidden-input"> </p>

      <div v-if="items.length">
        <table>
          <thead><tr>
            <th style="width: 50mm;"> Sản phẩm</th>
            <th style="width: 10mm;"> Đvt</th>
            <th style="width: 20mm;">Số lượng</th>
            <th style="width: 40mm;">Đơn giá</th>
            <th style="width: 40mm;">Thành tiền</th>
            <th style="width: 10mm;'"></th>
          </tr></thead>
          <tbody>
            <tr v-for="(it) in items" :key="it.id">
              <td>
                <input type="text" v-model="it.title" 
                      placeholder="Nhập sản phẩm"
                      ref="titleInputs"
                      list="productList"
                      class="hidden-input"
                      @change="selectProduct(it)"/>
              </td>

              <td>
                <input type="text" v-model.text="it.description"
                ref="desInputs"
                class="hidden-input">
              </td> 

              <td>
                <input type="number" v-model.number="it.qty" 
                ref="qtyInputs"
                class="hidden-input" style="width:70px"/>
              </td>

              <td> <input type="text" v-model="it.priceStr"
                @blur= updatePrice(it)
                class="hidden-input"/>
              </td>
              

              <td>{{ formatPrice(it.price * it.qty * 1000) }}</td>
              <td><button @click="remove(it.id)">Xóa</button></td>
            </tr>
          </tbody>
        </table>
        <p><strong>Tổng: {{ formatPrice(total) }}</strong></p>
        <div style="display:flex; gap:8px;">
          <button @click="clear">Xóa hết</button>
          <button @click="checkout">Thanh toán</button>
        </div>
      </div>
      <p v-else>Giỏ hàng trống. <router-link to="/shop">Mua sắm ngay</router-link></p>

      <button @click="addItem()">➕ Thêm sản phẩm</button>

      <button @click="printCart">🖨 In giỏ hàng</button>

    </section>
  </template>

  <script setup>
  import { useCart } from '../store/cart';
  import { useRouter } from 'vue-router';
  import { ref, nextTick, onMounted, onUnmounted } from 'vue';
  import axios from 'axios';
  import XlsxPopulate from "xlsx-populate/browser/xlsx-populate";

  const { state, remove, updateQty, clear, total, add } = useCart();
  const items = state.items;
  const router = useRouter();

  const titleInputs = ref([]);
  const qtyInputs = ref([]);
  const desInputs= ref([]);
  

  const addingRow = ref(false);
  const products = ref([]);
  const customName = ref('');
  const customPhone = ref('');

  onMounted(async () => {
    const res = await axios.get('http://localhost:3000/products'); // backend bạn
    products.value = res.data;
    window.addEventListener('keydown', onKey);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', onKey);
  });

  const onKey = (e) => {
    if (e.key === '`') {
      e.preventDefault();
      addItem();
    }
  };

  const selectProduct = (it) => {
    const p = products.value.find(pr => pr.title.toLowerCase() === it.title.toLowerCase());
    if (p) {
      it.id =  Date.now();
      it.price = p.price;
      it.description = p.description
      it.priceStr = p.price;
      nextTick(() => {
         qtyInputs.value[titleInputs.value.length - 1]?.focus();
      });
    }
    else {
      it.id= null;
      nextTick(() => {
        desInputs.value[titleInputs.value.length - 1]?.focus();
      });
    }
  };


  // Thêm sản phẩm mới
  const addItem = () => {
    const newProduct = { id: Date.now(), title: '', price: 0, qty: 1 };
    add(newProduct, 0); 
    nextTick(() => {
      // focus ô tên sản phẩm của row mới
      titleInputs.value[titleInputs.value.length - 1]?.focus();
    });
  };


const formatPrice = (v) => new Intl.NumberFormat('vi-VN').format(v);




function updatePrice(it) {
  // parse string thành số, nhân 1000 nếu muốn
  const value = parseFloat(it.priceStr);
  it.price = value;                // lưu number để tính toán
  it.priceStr = formatPrice(value * 1000); // hiển thị string
}


  const checkout = async () => {
    try{
      const orderData = {
        ten: customName.value,
        sdt: customPhone.value,  
        total: total.value,
        date: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' }),
        items: items.map(it =>({
         // product_id: it.id,   Trừ hàng kho
          title: it.title,
          qty: Number(it.qty) || 0,
          price: Number(it.price) || 0 
        }))
    };
    console.log(orderData);
    const res = await axios.post('http://localhost:3000/orders', orderData);

    alert('Cảm ơn bạn! (demo) Tổng: ' + formatPrice(total.value));
    clear();
    router.push('/');
    } catch (err) {
      console.error(err);
      alert('Thanh toán thất bại!');
    }
  }
  const printCart = async () => {
  try {
    // Load file mẫu từ public/form.xlsx
    const res = await fetch(`${import.meta.env.BASE_URL}form.xlsx`);
    const arrayBuffer = await res.arrayBuffer();

    // Mở workbook từ ArrayBuffer (không dùng Buffer)
    const wb = await XlsxPopulate.fromDataAsync(arrayBuffer);

    const sheet = wb.sheet(0); // sheet đầu tiên
    const startRow = 8;

    sheet.cell('C6').value(customName.value);
    sheet.cell('D6').value(customPhone.value);
  
    items.forEach((it, idx) => {
      const row = startRow + idx;
      
      ["B","C","D","E","F","G"].forEach(col => {
      const src = sheet.cell(`${col}${startRow}`);
      const dst = sheet.cell(`${col}${row}`);
   
      dst.style("bold", src.style("bold"));
      dst.style("italic", src.style("italic"));
      dst.style("underline", src.style("underline"));
      dst.style("fontColor", src.style("fontColor"));
      dst.style("fill", src.style("fill"));
      dst.style("horizontalAlignment", src.style("horizontalAlignment"));
      dst.style("verticalAlignment", src.style("verticalAlignment"));
      dst.style("border", src.style("border"));
      
      if (col === "F" || col=== "G") {
        dst.style("numberFormat", "#,##0.000 ");
      
      }
    });

      sheet.cell(`C${row}`).value(it.title);
      sheet.cell(`D${row}`).value(it.description);
      sheet.cell(`E${row}`).value(it.qty);
      sheet.cell(`F${row}`).value(Number(it.price));
      sheet.cell(`G${row}`).formula(`=F${row}*E${row}`);
      //sheet.cell(`F${row}`).value((Number(it.price) || 0) * (Number(it.qty) || 0));
    });

    const totalRow = startRow + items.length;
    sheet.cell(`F${totalRow}`).value("Tổng cộng")
        .style("bold", true)
        .style("horizontalAlignment", "center");

    sheet.cell(`G${totalRow}`).formula(`=SUM(G${startRow}:G${totalRow - 1})`);
    sheet.cell(`G${totalRow}`).style("numberFormat", "#,##0.000 ")
                              .style("bold", true);

    

    
    // Xuất file về client
    const blob = await wb.outputAsync();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "don_hang.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Xuất Excel thất bại!");
  }
};


  </script>

  <style>
  table { width:100%; border-collapse:collapse; margin-top:12px; table-layout: fixed;}
  th,td { border:1px solid #eee; padding:8px; text-align:left;}

  .hidden-input {
  border: none;      /* Xoá khung viền */
  background: none;  /* Trong suốt */
  outline: none;     /* Xoá đường viền focus */
  padding: 0;        /* Xoá padding */
  width: auto;       /* Tùy chỉnh độ dài */
  font-size: 16px;   /* Hoặc theo thiết kế */
  }



  </style>
