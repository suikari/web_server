const express = require('express');
const authMiddleware = require('./auth.js');
const multer = require('multer');
const path = require('path');

const db = require('../db.js');
const router = express.Router();

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


router.get('/', async (req, res) => {
    let { userId } = req.query;
    let result, query, params = [];
  
    try {
      if (userId) {
        query = `
          SELECT f.*, i.imgNo, i.imgName, i.imgPath 
          FROM tbl_feed f 
          LEFT JOIN tbl_feed_img i ON f.id = i.feedId 
          WHERE f.userId = ?
        `;
        params = [userId];
      } else {
        query = `
          SELECT f.*, i.imgNo, i.imgName, i.imgPath 
          FROM tbl_feed f 
          LEFT JOIN tbl_feed_img i ON f.id = i.feedId
        `;
      }
  
      const [rows] = await db.query(query, params);
  
      // feedId 기준으로 결과 그룹핑 (이미지 여러 개 처리)
      const feedMap = {};
  
      rows.forEach(row => {
        const feedId = row.id;
        if (!feedMap[feedId]) {
          feedMap[feedId] = {
            feedId: row.id,
            userId: row.userId,
            content: row.content,
            imageUrl : row.imageUrl,
            cdatetime: row.cdatetime,
            title : row.title,
            images: []
          };
        }
  
        if (row.imgNo) {
          feedMap[feedId].images.push({
            imgNo: row.imgNo,
            imgName: row.imgName,
            imgPath: row.imgPath
          });
        }
      });
  
      const feedList = Object.values(feedMap);
      console.log("map",feedMap);
      console.log("list",feedList);

      result = {
        message: "success",
        list: feedList
      };
  
      res.json(result);
    } catch (err) {
      console.error("fail", err);
      res.status(500).send("Server Error");
    }
  });


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

router.delete('/', authMiddleware ,async (req, res) => {

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


router.post('/upload', upload.array('images'), async (req, res) => {
    const { feedId } = req.body;
    const files = req.files;
  
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "파일이 없습니다." });
    }
  
    try {
      const insertResults = [];
  
      for (const file of files) {
        const fileName = file.originalname;
        const filePath = file.path;
  
        const result = await db.query(
          "INSERT INTO TBL_FEED_IMG (imgNo, feedId, imgName, imgPath) VALUES (null, ?, ?, ?)",
          [feedId, fileName, filePath]
        );
  
        insertResults.push(result);
      }
  
      res.json({
        message: "success",
        result: insertResults,
      });
    } catch (err) {
      console.error("업로드 실패:", err);
      res.status(500).send("Server Error");
    }
  });

module.exports = router;
