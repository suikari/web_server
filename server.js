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

app.get('/board/view', async (req, res) => {
    try {
        const boardno = req.query.boardno;  // 쿼리 파라미터 받기

        if (!boardno) {
            return res.status(400).json({ message: "boardno가 필요합니다." });
        }
        
        const [list] = await db.query("SELECT * FROM BOARD WHERE BOARDNO  = ?", [boardno]);

        res.json({
            message: "호출 성공",
            list: list[0]  //
        });

    } catch(err) {
        console.log('에러 발생!');
        res.status(500).send( 'Server Error');
    }
}) 

app.get('/board/delete', async (req, res) => {
    try {
        const boardno = req.query.boardno;  // 쿼리 파라미터 받기

        if (!boardno) {
            return res.status(400).json({ message: "boardno가 필요합니다." });
        }
        
        const result = await db.query("DELETE FROM BOARD WHERE BOARDNO  = ?", [boardno]);

        res.json({
            message: "삭제 성공"
        });

    } catch(err) {
        console.log('에러 발생!');
        res.status(500).send( 'Server Error');
    }
}) 

app.listen(3000, ()=>{
    console.log('서버 실행 중!');
});