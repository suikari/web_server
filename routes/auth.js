const secretKey = 'secretmoonriver'; // secretKey는 보안을 위해 일반적으로 .env 파일에 작성한다.
var jwt = require('jsonwebtoken');

const jwtAuthentication = (req, res, next) => {
    const token = req.cookies.token; // 
    
    console.log(token);
    
    if (!token) {
        return res.status(401).json({ message: '인증 토큰 없음', isLogin: false });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || secretKey);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: '유효하지 않은 토큰', isLogin: false });
    }
};

module.exports = jwtAuthentication;
