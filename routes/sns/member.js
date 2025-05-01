const express = require('express');
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const db = require('../../db.js');
const session = require('express-session');
const router = express.Router();
const secretKey = 'secretmoonriver'; // secretKey는 보안을 위해 일반적으로 .env 파일에 작성한다.


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




const generateToken = (payload) => {
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
  
      return token;
}; 


router.post('/', async (req, res) => {

    //res.body
    let { userId, pwd } = req.body;

     try {
         

         const [list] = await db.query("SELECT * FROM TBL_MEMBER WHERE email = ?  " , [userId]);
         
         //console.log(list);

        let result = {};


         if (list.length > 0) {
            let loginChk = await bcrypt.compare(pwd,list[0].pwd);
            //console.log(loginChk);

            if (loginChk) {
                // 유저 id, 관리자 여부 객체로 토큰 페이로드 정보 생성
                const payload = {
                    userId    : list[0].email,
                    userName  : list[0].userName,
                    userPhone : list[0].phone,
                    userIntro : list[0].intro,
                };

                //console.log(payload);
                //console.log('test',payload);
                // jwt.js에서 작성된 토큰 생성 코드 실행
                const token = generateToken(payload);
                //console.log('test',token);
                //console.log(token);

                // 'token' 이라는 쿠키 이름으로 토큰 저장, 'httpOnly' 옵션으로 접근 보호
                // 'maxAge' 옵션을 3600000(1시간, 밀리초) 설정
                res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
                res.json({ message: 'success', result : list[0].userName, token });

            } else {
                result = {
                    message: "fail1",
                    result: ""  //
                }
                res.json(result);

            }
            

         } else {
            result = {
                message: "fail2",
                result: ""  //
            }
            res.json(result);

         }


    } catch(err) {
        console.log('fail3');
        res.status(500).send('Server Error');
    }
}) 

router.get("/info",(req,res) => {
    
    //console.log(req.session.user);
    
    if (req.session.user){ 
        res.json({
            isLogin : true,
            user : req.session.user
        })
    } else {
        res.json({
            isLogin : false
        })
    }
}) 

router.get("/logout",(req,res) => {
    
    
    //req.session.user = null;
    req.session.destroy(err=>{
        if(err){
            console.log("세션 삭제 안됨");
            res.status(500).send("로그아웃 실패!");
        } else {
            res.clearCookie('connect.sid');
            res.json({
                message : "로그아웃 되었습니다."
            })
        }
    });

}) 



router.get('/:email', async (req, res) => {

    //res.body
    let { email } = req.params;

     try {
         

         const [list] = await db.query("SELECT * FROM TBL_MEMBER WHERE email = ?  " , [email]);
         
         //console.log(list);

        let result = {};


        if (list.length > 0) {

            res.json({ message: 'success', result : list[0] });

        } else {
            result = {
                message: "fail1",
                result: ""  //
            }
            res.json(result);

        }

    } catch(err) {
        console.log('fail3');
        res.status(500).send('Server Error');
    }
}) 

router.put('/', async (req, res) => {
    //res.body

    let { email , imgUrl } = req.body;
    console.log(email , imgUrl);
     try {
        const [result] = await db.query(
            "UPDATE tbl_member SET profileImg = ? WHERE email = ?",
            [ imgUrl, email]
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

router.post("/join", async (req,res) => {
    let { email, pwd, userName, addr, phone , birth , intro } = req.body
    
    try {
        let hashPwd = await bcrypt.hash(pwd,10);

        const [result] = await db.query("INSERT INTO TBL_MEMBER VALUES (?,?,?,?,?,?,?,null,NOW(),NOW())", [ email, hashPwd, userName, addr, phone , birth , intro]);

       res.json({
           message: "success",
           result: result  //
       });

   } catch(err) {
       console.log('fail');
       res.status(500).send('Server Error');
   }

}) 

router.post('/upload/:email', upload.array('images'), async (req, res) => {
    const { email } = req.params;
    const files = req.files;
    
    console.log(email,files);

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "파일이 없습니다." });
    }
  
    try {
      const insertResults = [];
  
      for (const file of files) {
        const fileName = file.originalname;
        const filePath = file.path;
  
        const [result] = await db.query(
            "UPDATE tbl_member SET profileImg = ? WHERE email = ?",
            [ filePath, email]
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
})

module.exports = router;