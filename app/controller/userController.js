import {
  promiseSingleQuery,
  getRedisResponse,
  setRedisResponse,
  response_obj,
} from "../helper/facades.js";
const redis_key = "user";
const redis_key_expire = 4000;

export async function UserById(req, res, next) {
  const userId = req.query.user_id;
  getRedisResponse(
    redis_key + `_${userId}`,
    async function (redis_key, output, extra) {
      let is_data_found_in_redis = false;
      if (req.query.cache == "false") {
        is_data_found_in_redis = false;
      } else {
        output = JSON.parse(output);
        if (output) {
          is_data_found_in_redis = true;
        }
      }
      let data_param = [];
      if (is_data_found_in_redis === true) {
        data_param = output;
      } else {
        data_param = await promiseSingleQuery(
          `SELECT first_name,last_name,email,phone,profile FROM users WHERE user_id='${userId}' ORDER BY id DESC LIMIT 1`,
          []
        );
        setRedisResponse(
          JSON.stringify(response_obj(data_param, true)),
          redis_key,
          redis_key_expire
        );
        data_param = response_obj(data_param, false);
      }

      res.status(200).send(data_param);
    }
  );
}
