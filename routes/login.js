const express = require('express');
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken');
const secretKey = 'secretmoonriver'; // secretKey는 보안을 위해 일반적으로 .env 파일에 작성한다.

const db = require('../db.js');
const router = express.Router();

const cookieParser = require('cookie-parser');
router.use(cookieParser());

const authMiddleware = require('./auth.js');


router.get("/info", authMiddleware, (req, res) => {
    res.json({
        isLogin: true,
        user: req.user
    });
});

function parseJwt(token) {
    try {
        const base64Payload = token.split('.')[1];
        const payload = atob(base64Payload); // base64 디코딩
        return JSON.parse(payload); // JSON으로 파싱
    } catch (e) {
        return null;
    }
};

const generateToken = (payload) => {
    const token = jwt.sign(payload, secretKey, { expiresIn: '1h' });
  
      return token;
}; // jwt.sign() 메서드를 통해 jwt 토큰 발행. expiresIn : '1h' 설정으로 1시간 후 토큰이 만료되게 설정.

// 기존 토큰을 사용하여 새로운 토큰을 생성하는 함수
const refreshToken = (token) => {
    try {
      // 기존 토큰의 유효성 검사 및 디코딩
      const decoded = jwt.verify(token, secretKey);
      
      // 새로운 페이로드 생성
      const payload = {
        userId: decoded.userId,
        isAdmin: decoded.isAdmin,
      };
      
      // 새로운 토큰 생성
      const newToken = generateToken(payload);
      return newToken;
    } catch (error) {
      // 토큰 새로 고침 중 오류 발생 시 출력
      console.error('Error refreshing token:', error);
      return null;
    }
};

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
                
                // 유저 id, 관리자 여부 객체로 토큰 페이로드 정보 생성
                const payload = {
                    userId: list[0].userId,
                    userName : list[0].userName,
                    userPhone : list[0].phone,
                    isAdmin: list[0].status,
                };

                //console.log('test',payload);
                // jwt.js에서 작성된 토큰 생성 코드 실행
                const token = generateToken(payload);
                //console.log('test',token);

                // 'token' 이라는 쿠키 이름으로 토큰 저장, 'httpOnly' 옵션으로 접근 보호
                // 'maxAge' 옵션을 3600000(1시간, 밀리초) 설정
                res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });
                res.json({ message: 'success', result : list[0].userName, token });

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

module.exports = router;
