// express 모드 다운
const express = require('express');
// express 앱 만들기
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { User } = require('./models/User');
const { auth } = require('./middleware/auth');

const config = require('./config/key');

// body parser가 클라이언트에서 입력된 정보들을 분석해서 가져옴
// req.body로 받아줌
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookieParser());

const mongoose = require('mongoose');
const { json } = require('body-parser');
mongoose
  .connect(config.mongoURI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((e) => console.log(e));

// 루트 디렉토리에 hello world를 출력
app.get('/', (req, res) => res.send('Hello World! 안녕하세요!!'));

app.post('api/users/register', (req, res) => {
  // 회원가입할 때 필요한 정보들을 클라이언트에서 가져오면 데이터베이스에 넣어주기
  const user = new User(req.body);

  // 데베에 저장
  user.save((err, userInfo) => {
    // 에러 발생 시 에러메시지 같이 전달
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true,
    });
  });
});

app.post('/api/users/login', (req, res) => {
  // 1. 요청된 이메일을 데베에서 찾기

  // findOne : 유저 찾기
  User.findOne({ email: req.body.email }, (err, user) => {
    // 일치하는 사람이 한 명도 없을 때
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: '제공된 이메일에 해당하는 유저가 없습니다.',
      });
    }
    // 2. 요청된 이메일이 데베에 있다면 비밀번호가 맞는지 확인
    user.comparePassword(req.body.password, (err, isMatch) => {
      // isMatch : 맞는지 안 맞는지

      // 비밀번호가 틀렸을 때
      if (!isMatch)
        return res.json({
          loginSuccess: false,
          message: '비밀번호가 틀렸습니다.',
        });

      // 3. 비밀번호가 맞다면 token 생성
      user.generateToken((err, user) => {
        // user : generateToken에서 반환된 것

        // 400이면 클라이언트에 err 메시지와 같이 에러 전달
        if (err) return res.status(400).send(err);

        // 토큰을 저장(쿠키 or 로컬스토리지)
        res
          .cookie('x_auth', user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id });
      });
    });
  });
});

app.get('/api/users/auth', auth, (req, res) => {
  // 미들웨어 통과 후임 -> Authentication이 True라는 뜻
  // 클라이언트에게 정보 전달
  // 어떤 페이지에서든 유저 정보 사용 가능
  res.status(200).json({
    _id: req.user._id, // auth.js -> findByToken에서 req에 user를 넣어줬기 때문에 가능
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image,
  });
});

// 이미 로그아웃 된 상태
app.get('/api/users/logout', auth, (req, res) => {
  // 유저를 찾아서 업데이트
  User.findOneAndUpdate({ _id: req.user._id }, { token: '' }, (err, user) => {
    if (err) return res._construct.json({ success: false, err });
    return res.status(200).send({
      success: true,
    });
  });
});

// 3000번 포트로 이 앱을 실행
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
