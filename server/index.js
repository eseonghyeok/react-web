const express = require('express'); //다운받은 express모듈 가져옴
const app = express(); // 새로운 express app을 만듬
const port = 5000; //5000번 포트를 백서버로
//바디파서로 client에서 정보 받아올수있음
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./server/config/key');
const { auth } = require("./server/middleware/auth");
const { User } = require("./server/models/User");

//application/x-www-form-urlencoded 데이터를 분석해서 가져옴.
app.use(bodyParser.urlencoded({extended: true}));
//application/json 데이터 분석해서 가져옴
app.use(bodyParser.json());
app.use(cookieParser());

const mongoose = require('mongoose');
mongoose.connect(config.mongoURI, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

app.get('/', (req, res) => res.send('hello world')); // '/'디렉토리에 오면 출력


app.post('/api/users/register', (req, res) => {//회원가입을 위한 register router
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

app.post('/api/users/login', (req, res) => {
    //데이터베이스에서 요청된 이메일이 있는지 찾는다.
    User.findOne({ email: req.body.email }, (err, user) => {
        if(!user){//요청된 이메일이 없다면,
            return res.json({
                loginSuccess: false,
                message: "제공된 이메일에 해당하는 유저가 없습니다."
            })
        }
        //요청된 이메일이 있다면, 이메일과 짝이 맞는 비밀번호가 맞는지 확인.
        user.comparePassword(req.body.password, (err, isMatch) => {
            if(!isMatch)                  //비밀번호 일치시, isMatch에 여부전달
            return res.json({
                loginSuccess: false, message: "비밀번호가 틀렸습니다."
            })
            //비밀번호까지 맞다면, 토큰을 생성함.
            user.generateToken((err, user) => {//받아온 user에 토큰도 저장되어있음.
                if(err) return res.status(400).send(err); //status(400)은 에러가 있다는 뜻.
                
                //토큰을 저장한다. 어디에? 쿠키, 로컬 스토리지 등-여기서는 쿠키에 저장.
                res.cookie("x_auth", user.token).status(200) //status(200)은 성공을 의미
                .json({ loginSuccess: true, userId: user._id });


            })
        })
    }) 
})

//role 0 -> 일반유저, role not0 -> 관리자
app.get('/api/users/auth', auth, (req, res) => { //auth는 미들웨어
    //여기까지 미들웨어를 통과해 왔다? -> Authentication이 True라는 말.
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image
    })
})

app.get('/api/users/logout', auth, (req, res) => {
    //유저를 찾아서 업데이트해줌. -> 로그아웃으로 
    //유저아이디는 미들웨어에서 가져온 유저에서 찾음.
    //토큰은 "" 이러한 공백으로 지워줌.
    User.findOneAndUpdate({ _id: req.user._id }, { token: "" }, (err, user) => {
        if(err) return res.json({ success: false, err});

        return res.status(200).send({
            success: true
        })
    })
})

app.listen(port, () => {
console.log(`Example app listening on port ${port}!`)
});//포트할당 번호에서 앱을 실행


