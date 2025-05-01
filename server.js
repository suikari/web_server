const express = require('express')
const productRouter = require('./routes/product.js')
const userRouter = require('./routes/user.js')
const loginRouter = require('./routes/login.js')
const feedRouter = require('./routes/feed.js')
const memberRouter = require('./routes/sns/member.js')

const cors = require('cors')

const app = express()
app.use(express.json());
app.use(cors({
    origin : [ "http://localhost:3000" , "http://localhost:3001" ],
    credentials : true,
}));

const session = require('express-session')


app.use(session({
    secret: 'test1234',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly : true,
        secure: false,
        maxAge : 1000 * 60 * 30
    }
}));

app.use("/product",productRouter);
app.use("/user",userRouter);
app.use('/uploads', express.static('uploads'));
app.use("/login",loginRouter);
app.use("/feed",feedRouter);
app.use("/member",memberRouter);


app.listen(3003, ()=>{
    console.log('서버 실행 중!');
});