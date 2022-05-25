// const express = require("express");
// const Redis = require("ioredis");

// const app = express();
// const redis = new Redis();
// const axios = require("axios");
// const cache = (req, res, next) => {
//   const { id } = req.params;
//   console.log(id);
//   redis.get(id, (error, result) => {
//     if (error) throw error;
//     if (result !== null) {
//       return res.json(JSON.parse(result));
//     } else {
//       return next();
//     }
//   });
// };
// //  [GET] /university/turkey
// //  미들웨어 추가
// app.get("/university/turkey", cache, async (req, res) => {
//   try {
//     console.log(req.url);
//     const universityInfo = await axios.get(
//       "http://universities.hipolabs.com/search?name=university&country=turkey"
//     );

//     // response에서 data 가져오기
//     const universityData = universityInfo.data;
//     await redis.set(req.url, JSON.stringify(universityData), "ex", 15);

//     return res.json(universityData);
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json(error);
//   }
// });
// const port = 3005;

// // express 서버를 3005번 포트로 실행;
// app.listen(port, () => console.log(`Server running on Port ${port}`));
////-------------------------------------------------------------------------------------------------------------------------------------------------

// const express = require("express");
// const axios = require("axios");
// const app = express();
// const PORT = 4000;
// app.get("/data", async (req, res) => {
//   try {
//     const result = await axios.get(
//       "http://universities.hipolabs.com/search?name=university&country=turkey"
//     );
//     console.log(result.data.length);
//     return res.status(200).json({ result: result.data });
//   } catch (error) {
//     console.log("asdfasdf");
//     return error;
//   }
// });
// app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));

////-------------------------------------------------------------------------------------------------------------------------------------------------

const express = require("express");
const fetch = require("node-fetch");
const redis = require("redis");
const PORT = process.env.PORT || 4000;
const PORT_REDIS = process.env.PORT || 6379;
const app = express();
const redisClient = redis.createClient(PORT_REDIS);

const set = (key, value) => {
  redisClient.set(key, JSON.stringify(value));
};

const get = (req, res, next) => {
  let key = req.route.path;
  redisClient.expire(key, 10); //10초 동안 유효한 캐시데이터 10초 후에 만료가 됨

  redisClient.get(key, (error, data) => {
    if (error) res.status(400).send(err);
    if (data !== null) {
      console.log("cache data existed");
      res.status(200).send(JSON.parse(data));
    } else {
      console.log("cache is empty");
      next();
    }
  });
};

app.get("/data", get, (req, res) => {
  fetch(
    "http://universities.hipolabs.com/search?name=university&country=turkey"
  )
    .then(res => res.json())
    .then(json => {
      set(req.route.path, json);
      res.status(200).send(json);
    })
    .catch(error => {
      console.error(error);
      res.status(400).send(error);
    });
});
app.listen(PORT, () => console.log(`Server up and running on ${PORT}`));
