require('dotenv').config();
const express = require("express");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cors = require("cors")
const multer = require('multer')
const path = require('path');
const { title } = require('process');
const SALT_ROUNDS = 12;


const PORT = process.env.PORT || 7000;


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images/');
    },
    filename: function (req, file, cb) {
        // Get filename from form data (sent as a field in the form)
        const customFilename = req.body.filename || 'default-profile';
        const fileExtension = path.extname(file.originalname);
        
        // Use the custom filename from the form
        cb(null, customFilename + fileExtension);
    }
});

const upload = multer({ storage: storage });


const dbOptions = {
    host: "localhost",
    user: "root",
    password: "",
    database: "eshop"
}
const conn = mysql.createConnection(dbOptions)
const pool = mysql.createPool(dbOptions)

console.log("Connected Successfully")


const sessionStore = new MySQLStore(dbOptions);

const app = express();
app.use(express.static('public'));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "'unsafe-inline'"], 
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false // May be needed for some external resources
})); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

app.use(cors());
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));



app.use(session({
  key: 'session_id',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,          
    secure: false,           
    sameSite: 'lax',         
    maxAge: 1000 * 60 * 60   
  }
}));

// Render Routes
app.get('/home', (req, res)=>{
    if (req.session.userId){
      res.render('home', {
        title: 'eShop',
        user: {
          id: req.session.userId,
          name: req.session.username
        }
      })
    }
    else{
      res.render("home", {
        title: 'eShop',
        user: ''
      });
    }
})
app.get('/test', (req, res) => {
    res.render('test')
})
app.get('/preview/:img', (req, res)=>{
    const { img } = req.params;
    res.render('preview', { image : img });
})
app.get('/auth', (req, res) => {
    res.render('auth')
})

app.get('/shop', requireCustomer, async (req, res)=>{
    const sql = "SELECT * FROM PRODUCTS;"
    try {
      const [rows] = await pool.execute(sql);
      try {
         const [cartRows] = await pool.execute("SELECT id FROM cart WHERE owner = (?)", [req.session.userId]);
          console.log("Cartrows:", cartRows)
          let cartId = 0;
          if (cartRows.length > 0 && cartRows[0] && cartRows[0].id != null) {
            cartId = cartRows[0].id;
            console.log("Cartrows:", cartId);
          } else {
            cartId = 0;
            console.log("No cart found for user, using cartId = 0");
          }
          const  sentNec = {
              products: rows,
              cart: cartId
            }

            console.log("Nec:", sentNec)
          res.render('shop', {
            user: {
              name: req.session.username,
              id: req.session.userId
            },
            nec: sentNec
          });
      }
       catch (error) {
        res.render('404', { return : '/shop', 
        error: "The term you searched for was not found"})
      }
      // res.render('shop', {
      //   user: req.session.username,
      //   userID: req.session.userId,
      //   products: rows
      // })
    } catch (error) {
      res.render('404', { return : '/shop', 
      error: "The term you searched for was not found"})
    }
})

app.post('/buy', async (req, res) => {
    const { theUser, theCart } = req.body;
    
    if (!theUser || !theCart) {
        return res.status(400).send({ message: "User ID and Cart ID are required" });
    }

    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // Verify cart ownership
        const [cartCheck] = await connection.execute(
            'SELECT * FROM cart WHERE id = ? AND owner = ?',
            [theCart, theUser]
        );
        
        if (cartCheck.length === 0) {
            await connection.rollback();
            return res.status(403).send({ message: "Cart does not belong to user" });
        }

        // Get cart products
        const [prods] = await connection.execute('SELECT product_Id FROM cart_product WHERE cart_Id = (?)', [theCart]);

        if (prods.length === 0) {
            await connection.rollback();
            return res.status(400).send({ message: "Cart is empty" });
        }

        // Process each product
        for (const el of prods) {
            const [result] = await connection.execute('SELECT quantity FROM products WHERE id = (?)', [el.product_Id]);
            
            if (result.length === 0) {
                await connection.rollback();
                return res.status(404).send({ message: `Product ${el.product_Id} not found` });
            }
            
            const currentQuantity = result[0].quantity;
            const newQ = currentQuantity - 1;
            
            if (newQ < 0) {
                await connection.rollback();
                return res.status(400).send({ 
                    message: `Insufficient quantity for product ${el.product_Id}` 
                });
            }
            
            await connection.execute('UPDATE products SET quantity = (?) WHERE id = (?)', [newQ, el.product_Id]);
        }

        // Clear cart
        await connection.execute('DELETE FROM cart_product WHERE cart_Id = (?)', [theCart]);

        await connection.commit();

        res.status(200).send({ 
            success: true,
            message: "Purchase successful!",
            itemsPurchased: prods.length
        });

    } catch (error) {
        await connection.rollback();
        console.error('Purchase error:', error);
        res.status(500).send({ 
            success: false,
            message: "Purchase failed: " + error.message 
        });
    } finally {
        connection.release();
    }
});


// Get Cart
// Add this route to your index.js file
app.get('/cart/products/:cartId', requireCustomer, async (req, res) => {
    const { cartId } = req.params;
    
    try {
        // First verify the cart belongs to the logged-in user
        const [cartCheck] = await pool.execute(
            'SELECT * FROM cart WHERE id = ? AND owner = ?',
            [cartId, req.session.userId]
        );
        
        if (cartCheck.length === 0) {
            return res.status(403).json({ 
                error: 'Access denied: Cart does not belong to user' 
            });
        }

        // Get all products in the cart with their details
        const [cartProducts] = await pool.execute(`
            SELECT 
                p.id,
                p.name, 
                p.price, 
                p.quantity as product_quantity,
                p.image,
                p.des,
                cp.cart_Id,
                cp.product_Id
            FROM cart_product cp
            INNER JOIN products p ON cp.product_Id = p.id
            WHERE cp.cart_Id = ?
        `, [cartId]);

        res.send({
            success: true,
            cartId: cartId,
            products: cartProducts
        });

    } catch (error) {
        console.error('Error fetching cart products:', error);
        res.status(500).json({ 
            error: 'Server error while fetching cart products' 
        });
    }
});

// Add product to cart
app.post('/cart/add', requireCustomer, async (req, res) => {
    const { productId, userId, cartId } = req.body;

    // Validate input
    if (!productId || !userId) {
        return res.status(400).json({ 
            success: false, 
            error: 'Product ID and User ID are required' 
        });
    }

    try {
        let actualCartId = cartId;
        
        // If no cartId provided, check if user has an existing cart
        if (!actualCartId || actualCartId === 0) {
            const [existingCart] = await pool.execute(
                'SELECT id FROM cart WHERE owner = ?',
                [userId]
            );
            
            if (existingCart.length > 0) {
                // Use existing cart
                actualCartId = existingCart[0].id;
            } else {
                // Create new cart for user
                const [newCart] = await pool.execute(
                    'INSERT INTO cart (owner) VALUES (?)',
                    [userId]
                );
                actualCartId = newCart.insertId;
                console.log('Created new cart with ID:', actualCartId);
            }
        }

        // Check if product already exists in cart
        const [existingProduct] = await pool.execute(
            'SELECT * FROM cart_product WHERE cart_Id = ? AND product_Id = ?',
            [actualCartId, productId]
        );

        if (existingProduct.length > 0) {
            return res.json({
                success: true,
                message: 'Product already in cart',
                cartId: actualCartId,
                action: 'exists'
            });
        }

        // Add product to cart
        const [result] = await pool.execute(
            'INSERT INTO cart_product (cart_Id, product_Id) VALUES (?, ?)',
            [actualCartId, productId]
        );

        res.json({
            success: true,
            message: 'Product added to cart successfully',
            cartId: actualCartId,
            action: 'added',
            insertId: result.insertId
        });

    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Server error while adding to cart' 
        });
    }
});

// Session Roles
function requireAuth(req, res, next) {
  if (req.session.userId) return next();
  res.render('nonAuth', { message: 'Unauthorized, Please Login!'});
}

function requireAdmin(req, res, next) {
  if (req.session.role === 'admin') return next();
  res.redirect('/auth')
}

function requireCustomer(req, res, next) {
  if (req.session.role == 'customer') {
    console.log(req.session.role)
    return next()
  };
  res.redirect('/auth')
}
// ====================================================================
// login route
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) return res.status(400).send({ message: 'Username and password required'});

  try {
    const [rows] = await pool.execute('SELECT id, password, role FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).send({message: 'Invalid credentials'});

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);
    console.log(await bcrypt.hash(password, SALT_ROUNDS))
    if (!match) return res.status(401).send({message: 'Invalid credentials'});

    req.session.regenerate(err => {
      if (err) return res.status(500).send({message: 'Server error'});

      req.session.userId = user.id;
      req.session.username = username;
      req.session.role = user.role

      console.log(req)
      console.log(req.session.role)

      req.session.save(err => {
        if (err) return res.status(500).send({message: 'Server error'});
        if(req.session.role === 'admin'){
            res.send({dest: 'products'})
        }
        else if (req.session.role === 'customer'){
            res.send({dest: 'shop'})
        }
      });
    });

  } catch (err) {
    console.error(err);
    res.status(500).send({message: 'Server error'});
  }
});
//---------------------------------------------------------------------

// Sign Up
app.post('/register', async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password required');
  }

  try {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await pool.execute(
      'INSERT INTO users (firstname, lastname, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, username, email, hashedPassword, 'customer']
    );

    res.send('Registration successful! You can now log in.');
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).send('Username or email already exists');
    }
    res.status(500).send('Server error');
  }
});



app.get('/dashboard', requireAuth, (req, res) => {
  res.send(`Hello ${req.session.username}, welcome to your dashboard!`);
});



app.get('/delete/:id', async (req, res)=>{
    const { id } = req.params;
    
    if (!id || id === undefined){
        res.render('404', { return : '/products', 
        error: "The product you searched for was not found"})
    }
    else{
        const sql = "SELECT * FROM products WHERE id = (?);";
        const [results] = await pool.execute(sql, [id])
        if(!results || !id || typeof id === undefined || results.length === 0){
            res.render('404', { backPage: '/products', 
            error: "The product you searched for was not found"})
        }
        else{
                const data = results[0];
                // console.log(data);
                res.render('delete', data);
        }
    }
})

//delete products
app.delete('/deleteProduct/:id', async (req, res) => {
    const { id } = req.params;

    if(id === undefined){
        res.render('404', { return : '/products', 
        error: "The product you searched for was not found"})
    }

    const sql = 'DELETE FROM products WHERE id = (?);'
   try {
    
    const {result} = await pool.execute(sql, [id]);

    res.status(200).send({ result })

   } catch (error) {
    console.log(error)
    res.status(500).send({error})
   }
    
})

//all products
app.get('/products', requireAdmin, async (req, res) => {
    const sql = "SELECT * FROM products";

   try {
     const [rows] = await pool.execute("SELECT * FROM products");
     const data = { 
            title: 'Catalog',
            products: rows     
        };
        res.render('products', data);
   } catch (err) {
        console.error('Database error:', err);
        return res.status(500).send('Error fetching data from the database');
   }
    // conn.query(sql, (err, result) => {
    //     if (err) {
    //         console.error('Database error:', err);
    //         return res.status(500).send('Error fetching data from the database');
    //     }
    //     else{
            
    //     const data = { 
    //         title: 'Catalog',
    //         products: result     
    //     };
    //     data.products.forEach(element => {
    //         console.log(element.id, " : ", element.image)
    //     });
    //     res.render('products', data);
    //     }
    // });
});

app.get('/customerProducts', requireCustomer, async (req, res) => {
    const sql = "SELECT * FROM products";

   try {
     const [rows] = await pool.execute("SELECT * FROM products");
     const data = { 
            title: 'Shop',
            products: rows     
        };
        res.render('shop', data);
   } catch (err) {
        console.error('Database error:', err);
        return res.status(500).send('Error fetching data from the database');
   }
});

// add product
// add product
app.post('/addProduct', upload.single('image'), async (req, res) => {
    let { id, name, desc, price, quantity, filename } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }
    
    const imageFilename = req.file.filename;
    
    try {
          console.log("Id:", id, "name: ", name, "desc: ", desc, "price: ", price, "Q: ", quantity, "Filename: ", imageFilename);
          const sql = "INSERT INTO products (id, name, des, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)"
          const {result} = await pool.execute(sql, [id, name, desc, price, quantity, imageFilename]);
          return res.status(201).json({ message: "Added!" });
    } catch (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Error adding product to database' });
    }

    });

// Edit product
app.get('/editProduct/:id', async (req, res)=>{
    const { id } = req.params;
    const fixedId = Number.parseInt(id);

    console.log(fixedId, typeof fixedId)
    let sql = "SELECT * FROM products WHERE id = (?);";
    const [result] = await pool.execute(sql, [fixedId]);
    if(result.length > 0){
       res.render('edit', { product: result[0], productId: result[0].id, message: "" });
    }
    else{
      console.log("Query Error: ", result);
      res.render('edit', { product: {}, productId: 0, message: "Error Getting Product" });
    }
    
})

//update
app.post('/update', async (req, res)=>{
    const { id, name, desc, price,} = req.body
    console.log(id)
    if(!name || !price || !desc){
        console.log("Id:", pId, "name:", name, "des:", desc, "price:", price)
        res.status(400).send({ message: "All fields are required"})
    }
    

    try {
      const sql = "UPDATE products SET name = (?), price = (?), des = (?) WHERE id = (?);"
      const {result} = await pool.execute(sql,[name, price, desc, id]);
      console.log("Result: ",result)
      res.status(200).send({ message: "Product Updated" })
    } catch (error) {
        res.status(500).send({ message: `Query Error${error}`})
    }

        
        // if(result){
        //   console.log(result)
        //   res.status(200).send({ message: "Product Updated" })
        // }
        // else{
        // }
       
    
})


//UPLOAD IMAGE

app.post('/profile', upload.single('avatar'), (req, res) => {
    console.log("Image Received", req.file);
    console.log("Custom filename received:", req.body.filename);
    
    res.json({ 
        message: 'Profile image uploaded successfully!',
        filename: req.file.filename,
        customName: req.body.filename
    });
});

app.post('/addView', async (req, res) =>{
    const {view} = req.body;
    if(view){
        try {
            const [rows] = await pool.execute('SELECT shop FROM views')
            let newViews = rows[0].shop + 1;
            await pool.execute('UPDATE views SET shop = (?) WHERE id = 1', [newViews]);

            res.send({message: 'added'})
        } catch (error) {
            res.send({error})
        }
    }
})

app.post('/addView/home', async (req, res) =>{
    const {view} = req.body;
    if(view){
        try {
            const [rows] = await pool.execute('SELECT home FROM views')
            let newViews = rows[0].home + 1;
            await pool.execute('UPDATE views SET home = (?) WHERE id = 1', [newViews]);

            res.send({message: 'added'})
        } catch (error) {
            res.send({error})
        }
    }
})

app.get('/getViews', async (req, res)=>{
  try {
    
    const [results] = await pool.execute('SELECT * FROM views WHERE id = 1');
    if(results){
      res.status(200).send({views: results})
    }
    else{
    res.status(500).send({message: "No results Found"})
    }

  } catch (error) {
    res.status(500).send({message: error})
  }
})



app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    res.clearCookie('session_id'); 
    if (err) return res.status(500).send('Could not log out');
    res.send('Logged out successfully');
  });
});


app.listen(PORT, ()=>{
    console.log(`Server Running ${PORT}...`)
})


// let test = "30"
// test.toLowerCase()
// Number.parseInt(test)
// console.log(test)