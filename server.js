const express = require('express')
const db = require('./db.js')
const cors = require('cors')

const app = express()
app.use(express.json());
app.use(cors());

app.get('/test', (req, res) => {
    res.send('Hello World');
})

app.get('/board/list', async (req, res) => {
    try {
        // let list = await db.query("SELECT * FROM BOARD");
        
        // //console.log(list);
        // res.json({
        //     message : "호출 성공",
        //     list : list
        // });

        const [rows, fields] = await db.query("SELECT * FROM BOARD");

        res.json({
            message: "호출 성공",
            list: rows  //
        });

    } catch(err) {
        console.log('에러 발생!');
        res.status(500).send('Server Error');
    }
}) 

app.listen(3000, ()=>{
    console.log('서버 실행 중!');
});