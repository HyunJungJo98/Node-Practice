const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
// 10자리인 salt 생성 -> salt를 이용해서 비밀번호를 암호화
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    maxlength: 50,
  },
  email: {
    type: String,
    trim: true, // 스페이스 없애주기
    unique: 1,
  },
  password: {
    type: String,
    minlength: 5,
  },
  lastname: {
    type: String,
    maxlength: 50,
  },
  role: {
    type: Number,
    default: 0,
  },
  image: String,
  token: {
    type: String,
  },
  // 토큰 유효기간
  tokenExp: {
    type: Number,
  },
});

// save전에 하기
// next : save
// pre 함수 안에서 화살표 함수 쓰지 말기(bind가 다름)
userSchema.pre("save", function (next) {
  let user = this;

  // password가 변할 때만 암호화하기
  if (user.isModified("password")) {
    // 비밀번호 암호화 시키기
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return next(err);

      // user.password : 사용자가 입력한 비밀번호
      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return next(err);
        // hash : 암호화 된 비밀번호
        user.password = hash;
        // 원래 save 함수로 돌아가기
        next();
      });
    });
  } else {
    next();
  }
});

// comparePassword : index.js에 있는 이름이랑 같아야 함
// 메소드를 생성한 것
userSchema.methods.comparePassword = function (
  plainPassword,
  callbackfunction
) {
  // 암호화 한 비밀번호와 비교
  bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
    // 비밀번호가 같지 않을 때
    if (err) return callbackfunction(err);
    callbackfunction(null, isMatch);
  });
};

userSchema.methods.generateToken = function (cb) {
  let user = this;
  // jsonwebtoken을 이용해서 토큰 생성
  let token = jwt.sign(user._id.toHexString(), "secretToken");
  user.token = token;
  // 데베에 저장
  user.save(function (err, user) {
    if (err) return cb(err);
    cb(null, user);
  });
};

// 모델 만들기 : (모델 이름, 스키마 이름)
const User = mongoose.model("User", userSchema);

module.exports = { User };
