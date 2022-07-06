// express 모드 다운
const express = require('express');
// express 앱 만들기
const app = express();
const port = 5000;

const mongoose = require('mongoose');
mongoose
  .connect(
    'mongodb+srv://hyunjung:ad2384wf@bolierplate.ex4ti.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(() => console.log('MongoDB Connected...'))
  .catch((e) => console.log(e));

// 루트 디렉토리에 hello world를 출력
app.get('/', (req, res) => res.send('Hello World! 안녕하세요'));
// 3000번 포트로 이 앱을 실행
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
