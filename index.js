const express = require("express");
const cors = require("cors")
const mysql = require("mysql")

const conn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "eshop"
})

conn.connect((err)=>{
    if(err){
        console.log("Database Error:", err)
    } 
    else{
        console.log("Connected Successfully")
    }

})

const app = express();
app.use(express.json());
app.use(cors());
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/home', (req, res)=>{
    res.render("home");
})


//all products
app.get('/products', (req, res) => {
    const sql = "SELECT * FROM products";
    conn.query(sql, (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error fetching data from the database');
        }
        else{
            
        const data = { 
            title: 'Catalog',
            products: result     
        };
        data.products.forEach(element => {
            console.log(element.id)
        });
        res.render('products', data);
        }
    });
});

// add product
app.post('/addProduct', (req, res) => {
    const { id, name, desc, price, img } = req.body;
    const sql = "INSERT INTO products (id, name, des, price, image) VALUES (?, ?, ?, ?, ?)"

    conn.query(sql, [id, name, desc, price, img], (err, result) => {
         if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Error fetching data from the database');
        }
        else{
            return res.status(201).json({message: "Added!"})
        }
    })

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

app.listen(7000, ()=>{
    console.log("Server Running...")
})


let test = "30"
Number.parseInt(test)
console.log(test)