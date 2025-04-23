const express = require('express');
const bcrypt = require('bcrypt')

const db = require('../db.js');
const session = require('express-session');
const router = express.Router();


router.post('/', async (req, res) => {

    //res.body
    let { userId, pwd } = req.body;

     try {
         

         const [list] = await db.query("SELECT * FROM TBL_USER WHERE userId = ?  " , [userId]);

        let result = {};


         if (list.length > 0) {
            let loginChk = await bcrypt.compare(pwd,list[0].pwd);
            
            if (loginChk) {
                req.session.user = {
                    sessionId : list[0].userId,
                    sessionName : list[0].userName,
                    sessionPhome : list[0].phone,
                    sessionStatus : list[0].status,
                }
                
                result = {
                    //
                    message: "success",
                    result: list[0].userName  //
                }
            } else {
                result = {
                    message: "fail",
                    result: ""  //
                }
            }
            

         } else {
            result = {
                message: "fail",
                result: ""  //
            }
         }

        res.json(result);

    } catch(err) {
        console.log('fail');
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

router.post("/join", async (req,res) => {
    let {userId, pwd, name, addr, phone} = req.body
    
    try {
        let hashPwd = await bcrypt.hash(pwd,10);

        const result = await db.query("INSERT INTO TBL_USER VALUES (?,?,?,?,?,NOW(),NOW(),'C')", [userId, hashPwd, name, addr, phone]);

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