// 환경변수 process.env.NODE_ENV가 개발모드일 땐 development,
// 배포 후일 땐 production
if (process.env.NODE_ENV === "production") {
  module.exports = require("./prod");
} else {
  module.exports = require("./dev");
}
