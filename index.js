const express = require('express'); //다운받은 express모듈 가져옴
const app = express(); // 새로운 express app을 만듬
const port = 5000; //5000번 포트를 백서버로


const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lsh:dltjdgur123@cluster0.5jaze.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected...'))
.catch(err => console.log(err));

app.get('/', (req, res) => res.send('hello world')); // '/'디렉토리에 오면 출력

app.listen(port, () => {
console.log(`Example app listening on port ${port}!`)
});//포트할당 번호에서 앱을 실행


