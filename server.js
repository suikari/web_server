const express = require('express')
const bcrypt = require('bcrypt')
const productRouter = require('./routes/product.js')
const userRouter = require('./routes/user.js')

const cors = require('cors')

const app = express()
app.use(express.json());
app.use(cors({
    origin : "http://localhost:5501",
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


app.listen(3000, ()=>{
    console.log('서버 실행 중!');
});