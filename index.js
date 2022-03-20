const express = require('express'); //다운받은 express모듈 가져옴
const app = express(); // 새로운 express app을 만듬
const port = 5000; //5000번 포트를 백서버로
//바디파서로 client에서 정보 받아올수있음
const bodyParser = require('body-parser');

const config = require('./config/key');

const { User } = require("./models/User");

//application/x-www-form-urlencoded 데이터를 분석해서 가져옴.
app.use(bodyParser.urlencoded({extended: true}));
//application/json 데이터 분석해서 가져옴
app.use(bodyParser.json());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

app.get('/', (req, res) => res.send('hello world')); // '/'디렉토리에 오면 출력


app.post('/register', (req, res) => {//회원가입을 위한 router
    //회원가입 할때 필요한 정보들을 client에서 가져오면
    //그것들을 DB에 넣어줌

    const user = new User(req.body);

    user.save((err, userInfo) => {
        if(err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })

})
app.listen(port, () => {
console.log(`Example app listening on port ${port}!`)
});//포트할당 번호에서 앱을 실행


