const express = require('express');
const db = require('../db.js');
const router = express.Router();

const multer = require('multer');
const path = require('path');
const cookieParser = require('cookie-parser');

router.use(cookieParser());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // 저장할 폴더
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);    
    const basename = path.basename(file.originalname, ext); 
    cb(null, `${basename}-${Date.now()}${ext}`);      
  }
});

const upload = multer({ storage: storage });

const authMiddleware = require('./auth.js');

router.get('/', async (req, res) => {

    const { offset , limit , keyword } = req.query;
    
    let query = '';

    if (offset == null && limit == null ) {
        query = "SELECT * FROM TBL_PRODUCT";
    } else {
        query = "SELECT * FROM TBL_PRODUCT WHERE productName like '%" + keyword +"%' limit " + limit + " offset " + offset;
    }

    //console.log(query);

    try {


        const [list] = await db.query(query);
        const [cnt]  = await db.query("select count(*) as cnt from tbl_product where  productName like '%" + keyword +"%' ");

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


router.post('/', async (req, res) => {


    //res.body

    let { productName, description , price , stock , category} = req.body;
    //console.log( productName, description , price , stock , category);
     try {
         const result = await db.query("INSERT INTO TBL_PRODUCT(productName, description , price , stock , category) VALUES (?,?,?,?,?)", [productName,description,price,stock,category]);

            // console.log(result);
        res.json({
            message: "success",
            result: result  //
        });

    } catch(err) {
        console.log('fail');
        res.status(500).send('Server Error');
    }
}) 

router.put('/', async (req, res) => {
    //res.body

    let { productName, description , price , stock , category , productId} = req.body;
    //console.log( productName, description , price , stock , category,productId);
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

router.delete('/', authMiddleware , async (req, res) => {
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

router.get('/:productId', async (req, res) => {
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

router.get('/profile/:productId', async (req, res) => {

    const  { productId } = req.params;

    // console.log("test",productId);
    try {
        const [list] = await db.query("SELECT * FROM TBL_PRODUCT_FILE WHERE productID=?", [productId]);

           // console.log(result);
       res.json({
           message: "success",
           list : list  //
       });

   } catch(err) {
       console.log('fail');
       res.status(500).send('Server Error');
   }


})


router.post('/profile', upload.single('avatar'), async function (req, res, next) {
    //console.log('파일 정보:', req.file);
    //console.log('폼 정보:', req.body);
    const  { productId } = req.body;
    
    const file = req.file;

    if (!file) {
        return res.status(400).json({ message: "파일이 없습니다." });
    }
    // console.log("test",productId);

    const fileName = file.originalname;    // 실제 업로드된 파일명
    const filePath = file.path;            // 저장된 경로 (또는 저장 방식에 따라 filename과 destination 조합 가능)


    try {
        const result = await db.query("INSERT INTO TBL_PRODUCT_FILE (fileNo, productId , fileName , filePath ) VALUES (null,?,?,?)", [productId,fileName,filePath]);

           // console.log(result);
       res.json({
           message: "success",
           result: result  //
       });

   } catch(err) {
       console.log('fail');
       res.status(500).send('Server Error');
   }


})

module.exports = router;