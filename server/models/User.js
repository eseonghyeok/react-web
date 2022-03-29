const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
//saltRounds 는 salt가 몇글자인지.
//salt를 생성하고 그것을 이용해 비밀번호를 암호화해야함.
const jwt = require('jsonwebtoken');


const userSchema = mongoose.Schema({ //유저모델
    name: {
        type: String,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true, //문자열 공백 없애주는 역할
        unique: 1
    },
    password: {
        type: String,
        minlength : 5
    },
    lastname: {
        type: String,
        maxlength: 50
    },
    role: { //user의 역할(관리자, 일반유저)
        type: Number,
        default: 0
    },
    image: String,
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }
})
//유저 정보를 저장(save)하기전에(pre) 무언가를 작업하는 fuction
userSchema.pre('save', function (next){

    var user = this; //위의 유저모델 가리킴.
    //비밀번호를 암호화함. 
    if(user.isModified('password')){ //무엇이든간에save()할때마다 암호화하는것을 막기위해, 비번암호화에만 사용
        bcrypt.genSalt(saltRounds, function(err, salt){//salt를 만들때 saltRounds필요
            if(err) return next(err);//에러나면 save()로 에러 던져줌.
            bcrypt.hash(user.password, salt, function(err, hash){ //(비밀번호평문, ~)
                if(err) return next(err);//에러(해쉬실패)나면 save()로 에러 던져줌.
                user.password = hash; //에러x, 해쉬(암호화)성공하면 유저비번을 암호문으로 변경.
                next()//넥스트로 감 즉, 다음차례는 save()     
            })
        })
    } else { //save() 하는것이 비밀번호가 아닐시, 그냥 바로 넘어감. 암호화x
        next()
    }
})

userSchema.methods.comparePassword = function(plainPassword, cb){
    //평문 비밀번호와 전에 DB에 있는 이미 암호화된 비밀번호를 비교
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if(err) return cb(err);
        cb(null, isMatch);
    })
}

userSchema.methods.generateToken = function(cb){
    var user = this;    //es5문법?
    
    //jsonwebtoken을 이용해서 token을 생성하기
    var token = jwt.sign(user._id.toHexString(), 'secretToken') //user._id + 'secretToken' = token 생성
    //나중에 해석할때는 'secret토큰 넣으면 user._id 나옴.

    user.token = token;
    user.save(function(err, user){
        if(err) return cb(err)
        cb(null, user) //save 잘되면 err 없고 user정보만 전달.
    })
}

userSchema.statics.findByToken = function(token, cb){
    var user = this;

    //토큰을 decode 한다.
    jwt.verify(token, 'secretToken', function(err, decoded){
        //유저아이디를 이용해서 유저를 찾은 다음에
        //클라이언트에서 가져온 토큰과 DB에 보관되있는 토큰이
        //일치하는지 확인.

        user.findOne({"_id": decoded, "token": token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })

    })
}


const User = mongoose.model('User',userSchema);

module.exports = {User};

