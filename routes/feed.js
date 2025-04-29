const express = require('express');

const db = require('../db.js');
const router = express.Router();

const cookieParser = require('cookie-parser');
router.use(cookieParser());


router.get('/', async (req, res) => {

    //res.body
    //let { userId, pwd } = req.body;
    let result ;
     try {
         

         const [list] = await db.query("SELECT * FROM tbl_feed");


        result = {
            message: "success",
            list : list  //
        }

        res.json(result);

    } catch(err) {
        console.log('fail');
        res.status(500).send('Server Error');
    }
}) 


router.get('/:id', async (req, res) => {

    //res.body
    let { id } = req.params;
    let result ;
     try {
         

        const [list] = await db.query("SELECT * FROM TBL_FEED WHERE ID = ?",[id]);


        result = {
            message: "success",
            list : list  //
        }

        res.json(result);

    } catch(err) {
        console.log('fail');
        res.status(500).send('Server Error');
    }
}) 

router.put('/', async (req, res) => {
    //res.body

    let { id , userId, content } = req.body;
    //console.log( productName, description , price , stock , category,productId);
     try {
        const [result] = await db.query(
            "UPDATE tbl_feed SET userId = ?, content = ? WHERE id = ?",
            [ userId, content,id]
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

router.delete('/', async (req, res) => {

    //res.body
    let { id } = req.body;
    let result ;
     try {
         

        const result1 = await db.query("DELETE FROM TBL_FEED WHERE ID = ?",[id]);


        result = {
            message: "success",
            result : result1  //
        }

        res.json(result);

    } catch(err) {
        console.log('fail');
        res.status(500).send('Server Error');
    }
}) 


router.post('/', async (req, res) => {

    let { userId , content  } = req.body;
    console.log( userId , content );
     try {
         const result = await db.query("INSERT INTO tbl_feed(userId, content, cdatetime) VALUES (?,?,NOW())", [ userId , content ]);

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
