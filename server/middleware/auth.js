const req = require("express/lib/request");
const { User } = require("../models/User");

let auth = (req, res, next) => {//인증처리를 하는 곳.
    //클라이언트 쿠키에서 토큰을 가져옴.
    let token = req.cookies.x_auth;

    //토큰을 복호화해서 유저아이디를 찾는다.
    User.findByToken(token, (err, user) => {
        if(err) throw err;
        if(!user)  return res.json({ isAuth: false, error: true })

        req.token = token;
        req.user = user;
        next(); //next가 없으면 미들웨어에 갇힘.
    })
}

module.exports = { auth };