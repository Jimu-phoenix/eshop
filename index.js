require('dotenv').config();
const express = require("express");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const helmet = require('helmet');
const cors = require("cors")
const multer = require('multer')
const path = require('path')
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
app.use(helmet()); 
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

app.use(cors());
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));


app.use(session({
  key: 'session_id',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,          // prevents JS access
    secure: false,            // only send over HTTPS
    sameSite: 'lax',         // helps prevent CSRF
    maxAge: 1000 * 60 * 60   // 1 hour
  }
}));


app.get('/home', (req, res)=>{
    res.render("home");
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
app.get('/shop', requireCustomer, (req, res)=>{
    res.render('shop', {user: "Customer"})
})

function requireAuth(req, res, next) {
  if (req.session.userId) return next();
  res.render('nonAuth', { message: 'Unauthorized, Please Login!'});
}

function requireAdmin(req, res, next) {
  if (req.session.role === 'admin') return next();
  res.status(403).send('Access denied: admins only');
}

function requireCustomer(req, res, next) {
  if (req.session.role == 'customer') {
    console.log(req.session.role)
    return next()};
  res.status(403).send('Access denied: Customers only');
}

// login route
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  // 1. Validate input
  if (!username || !password) return res.status(400).send('Username and password required');

  try {
    // 2. Fetch user from DB
    const [rows] = await pool.execute('SELECT id, password, role FROM users WHERE username = ?', [username]);
    if (!rows.length) return res.status(401).send('Invalid credentials');

    const user = rows[0];

    // 3. Compare password using bcrypt
    const match = await bcrypt.compare(password, user.password);
    console.log(await bcrypt.hash(password, SALT_ROUNDS))
    if (!match) return res.status(401).send('Invalid credentials');

    // 4. Regenerate session to prevent fixation
    req.session.regenerate(err => {
      if (err) return res.status(500).send('Server error');

      // 5. Store minimal user info in session
      req.session.userId = user.id;
      req.session.username = username;
      req.session.role = user.role

      console.log(req.session.role)

      // 6. Save session explicitly (optional)
      req.session.save(err => {
        if (err) return res.status(500).send('Server error');
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
    res.status(500).send('Server error');
  }
});
//---------------------------------------------------------------------

// Sign Up
app.post('/register', async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;

  // 1. Validate input
  if (!username || !password) {
    return res.status(400).send('Username and password required');
  }

  try {
    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Save user to DB (use parameterized queries to prevent SQL injection)
    await pool.execute(
      'INSERT INTO users (firstname, lastname, username, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [firstname, lastname, username, email, hashedPassword, 'admin']
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
    // console.log(id)
    
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
        // conn.query(sql, [id], (err, result) => {
        // if(err || !id || id === undefined){
        //     res.render('404', { return : '/products', 
        //     error: "The product you searched for was not found"})
        // }
        // else if(result.length === 0){
        //          res.render('404', { backPage : '/products', 
        //          error: "The product you searched for was not found"})
        //     }
        //     else{
                
        //     }
            
        // })
    }
})

//delete products
app.delete('/deleteProduct/:id', (req, res) => {
    const { id } = req.params;

    if(id === undefined){
        res.render('404', { return : '/products', 
        error: "The product you searched for was not found"})
    }

    const sql = 'DELETE FROM products WHERE id = (?);'
   try {
    
     conn.query(sql, [id], (err, result)=>{
        if(err){
            res.render('404', {
                backPage: '/products',
                error: 'Database Error'
            })
        }
        else{
            console.log("rows:", result.affectedRows)
            console.log("Result: ", result)
            res.status(200).send({ result })
        }
     })

   } catch (error) {
    console.log(error)
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
app.post('/addProduct', upload.single('image'), (req, res) => {
    let { id, name, desc, price, filename } = req.body;
    
    // Check if file was uploaded
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }
    
    const imageFilename = req.file.filename;
    
    console.log("Id:", id, "name: ", name, "desc: ", desc, "price: ", price, "Filename: ", imageFilename);
    const sql = "INSERT INTO products (id, name, des, price, image) VALUES (?, ?, ?, ?, ?)"

    conn.query(sql, [id, name, desc, price, imageFilename], (err, result) => {
         if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Error adding product to database' });
        }
        else{
            return res.status(201).json({ message: "Added!" });
        }
    });
})
// Edit product
app.get('/editProduct/:id', (req, res)=>{
    const { id } = req.params;
    let sql = "SELECT * FROM products WHERE id = (?);";
    conn.query(sql, [id], (err, result) => {
        if(err){
            console.log("Query Error: ", err);
            res.render('edit', { product: {}, message: "Error Getting Product" });
        }
        else{
            console.log(result[0])
            res.render('edit', { product: result[0], productId: result[0].id, message: "" });
        }
    })
})

//update
app.post('/update/:id', (req, res)=>{
    const { id } = req.params;
    console.log(id)
    const { name, desc, price, img } = req.body
    if(!name || !price || !desc){
        console.log("Id:", pId, "name:", name, "des:", desc, "price:", price, img)
        res.status(400).send({ message: "All fields are required"})
    }
    else{
        const sql = "UPDATE products SET name = (?), price = (?), des = (?) WHERE id = (?);"
        conn.query(sql, [name, price, desc, id], (err, result)=>{
            if(err){
                 res.status(500).send({ message: "Query Error"})
            }
            else{
                res.status(200).send({ message: "Product Updated" })
            }
        })
    }
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


let test = "30"
test.toLowerCase()
Number.parseInt(test)
console.log(test)