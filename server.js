const express = require('express')
const db = require('./db.js')
const cors = require('cors')

const app = express()
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World');
})

app.get('/product', async (req, res) => {

    const { offset , limit , keyword } = req.query;
    
    let query = '';

    if (offset == null && limit == null ) {
        query = "SELECT * FROM TBL_PRODUCT";
    } else {
        query = "SELECT * FROM TBL_PRODUCT WHERE productName like '%" + keyword +"%' limit " + limit + " offset " + offset;
    }

    console.log(query);

    try {


        const [list] = await db.query(query);
        const [cnt]    = await db.query("select count(*) as cnt from tbl_product where  productName like '%" + keyword +"%' ");

        res.json({
            message: "호출 성공",
            list: list,
            cnt : cnt[0].cnt
        });

    } catch(err) {
        console.log('에러 발생!');
        res.status(500).send('Server Error');
    }
}) 

app.post('/product', async (req, res) => {


    //res.body

    let { productName, description , price , stock , category} = req.body;
    console.log( productName, description , price , stock , category);
     try {
         const result = await db.query("INSERT INTO TBL_PRODUCT(productName, description , price , stock , category) VALUES (?,?,?,?,?)", [productName,description,price,stock,category]);

        res.json({
            message: "success",
            result: result  //
        });

    } catch(err) {
        console.log('fail');
        res.status(500).send('Server Error');
    }
}) 

app.put('/product', async (req, res) => {
    //res.body

    let { productName, description , price , stock , category , productId} = req.body;
    console.log( productName, description , price , stock , category,productId);
     try {
        const [result] = await db.query(
            "UPDATE TBL_PRODUCT SET productName = ?, description = ?, price = ?, stock = ?, category = ? WHERE productId = ?",
            [productName, description, price, stock, category, productId]
        );

        res.json({
            message: "success",
            result: result  //
        });

    } catch(err) {
        console.log('fail');
        res.status(500).send('Server Error');
    }
}) 

app.delete('/product', async (req, res) => {
    //res.body
    let {productId} = req.body;

     try {
         const result = await db.query("DELETE FROM TBL_PRODUCT WHERE productId  = ?", [productId]);

        res.json({
            message: "success",
            result: result  //
        });

    } catch(err) {
        console.log('fail');
        res.status(500).send('Server Error');
    }
}) 

app.get('/product/:productId', async (req, res) => {
    let {productId} = req.params;

    try {
        const [list] = await db.query("SELECT * FROM TBL_PRODUCT WHERE PRODUCTID  = ?", [productId]);

        res.json({
            message: "호출 성공",
            list: list[0] ,
        });

    } catch(err) {
        console.log('에러 발생!');
        res.status(500).send('Server Error');
    }
}) 

app.listen(3000, ()=>{
    console.log('서버 실행 중!');
});