// server.js
import express from 'express';
import cors from 'cors';
import pkg from 'pg';       // Vì pg chưa có export default
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'shop',
  password: 'root',
  port: 5432,
});

/////////////////////////BE KHO SẢN PHẨM //////////////////
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query error' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { title, description, price } = req.body;
    if (!title || !price) {
      return res.status(400).json({ error: 'Thiếu tên hoặc giá sản phẩm' });
    }
    const result = await pool.query(
      'INSERT INTO products (title, description, price) VALUES ($1, $2, $3) RETURNING *',
      [title, description, price]
    );

    res.status(201).json(result.rows[0]); // trả về sản phẩm vừa thêm
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database insert error' });
  }
});

//Sửa
app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const { title, price, description, stock } = req.body;
  
  try {
    const result = await pool.query(
      "UPDATE products SET title=$1, description=$2, stock=$3, price=$4 WHERE id=$5 RETURNING *",
      [title, description, stock, price, id]
    );
    res.json(result.rows[0]); // trả về sản phẩm đã update
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE sản phẩm
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id])
    res.json({ message: 'Xoá thành công', product: result.rows[0] });
    } catch {
      res.status(500).json({ error: 'Lỗi database' });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////


/////////////////////BE CHI TIẾT ĐƠN HÀNG//////////////////////////////////////////////
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY date ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Lấy chi tiết 1 đơn hàng + các sản phẩm trong đơn
app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy thông tin đơn hàng
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    }

    // Lấy các sản phẩm trong đơn
    const itemsResult = await pool.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );

    res.json({
      ...orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.post('/orders', async (req,res) => {
  try {
    const { ten, sdt, total, date, items } = req.body;
    const result = await pool.query(
      'INSERT INTO orders(ten, sdt, total, date) VALUES($1, $2, $3, $4) RETURNING *',
      [ten, sdt, total, date]
    );

    const orderId = result.rows[0].id;
    for (let it of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, title, qty, price) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, it.title, it.qty, it.price]
      );
    }


    res.json({ orderId: result.rows[0].id });
  } catch(err) {
    console.error(err);
    res.status(500).json({ error: 'Lưu đơn hàng thất bại!' });
  }
});
///////////////////////////////////////////////////////////////////////////////////



///////////////////////////////////BE QUẢN LÝ//////////////////////////////////
// Lấy danh sách đơn hàng theo tên khách hàng
app.get('/orders', async (req, res) => {
  try {
    const { name } = req.query; // ?name=Nguyen
    const result = await pool.query(
      `SELECT * FROM orders
       WHERE customer_name ILIKE $1
       ORDER BY date DESC`,
      [`%${name || ''}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

app.delete('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [id])
    res.json({ message: 'Xoá thành công', product: result.rows[0] });
    } catch {
      res.status(500).json({ error: 'Lỗi database' });
  }
});

// Lấy chi tiết đơn hàng
app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1', [id]
    );
    if (orderResult.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    const itemsResult = await pool.query(
      `SELECT * FROM order_items
       WHERE order_id = $1`,
      [id]
    );

    res.json({ ...orderResult.rows[0], items: itemsResult.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Cập nhật đơn hàng
app.put('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customer_name, phone, items, total } = req.body;

    await pool.query(
      'UPDATE orders SET customer_name=$1, phone=$2, total=$3 WHERE id=$4',
      [customer_name, phone, total, id]
    );

    // Xóa các item cũ
    await pool.query('DELETE FROM order_items WHERE order_id=$1', [id]);

    // Thêm item mới
    for (const it of items) {
      await pool.query(
        'INSERT INTO order_items(order_id, product_id, qty, price) VALUES($1,$2,$3,$4)',
        [id, it.product_id, it.qty, it.price]
      );
    }

    res.json({ message: 'Cập nhật thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});



app.listen(3000, '0.0.0.0', () => console.log('Server running on port 3000'));
