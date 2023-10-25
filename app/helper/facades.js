import { createClient } from "redis";
import axios from "axios";
axios.defaults.timeout = 10000;

const redisOptionsToWrite = {
  socket: {
    host: process.env.REDIS_URL_W,
    port: process.env.REDIS_PORT_W,
  },
};
const redisOptionsToRead = {
  socket: {
    host: process.env.REDIS_URL_R,
    port: process.env.REDIS_PORT_R,
  },
};

const client_R = createClient(redisOptionsToRead);
client_R.connect();

const client_W = createClient(redisOptionsToWrite);
client_W.connect();

client_W.on("error", (err) => onError(["Redis Client Error", err]));
client_W.on("connect", function (err) {
  console.log("connected to redis successfully");
});
client_R.on("error", (err) => onError(["Redis Client Error", err]));
client_R.on("connect", function (err) {
  console.log("connected to redis successfully");
});

function onError(err) {
  console.log(err);
}

export async function promiseQuery(query, options = []) {
  const dbcon = await connection_W.getConnection();
  try {
    const [row] = await dbcon.execute(query, options);
    dbcon.destroy();
    return row;
  } catch (err) {
    onError(["critical error", [err, query, options]]);
    await dbcon.destroy();
    return [];
  }
}

export async function promiseSingleQuery(query, options = []) {
  const dbcon = await connection_W.getConnection();
  try {
    const [row] = await dbcon.execute(query, options);
    await dbcon.destroy();
    return typeof row[0] !== "undefined" ? row[0] : false;
  } catch (err) {
    onError(["critical error", [err, query, options]]);
    await dbcon.destroy();
    return false;
  }
}

export async function getJSONAsync(API, vendorType) {
  try {
    let json = await axios.get(API).catch(function (error) {
      if (error.response) {
        onError("morningstar call");
        onError(error.response.status);
        onError(error.response.headers);
      }
    });
    return json.data;
  } catch (err) {
    onError([API, vendorType, err, json]);
    return { success: false };
  }
}

export async function setRedisResponse(itemArray, redis_key, expiretime = 120) {
  redis_key = process.env.REDIS_KEY + redis_key;
  try {
    const [, set, exp, exit] = await Promise.all([
      client_W.set(redis_key, itemArray),
      client_W.expire(redis_key, expiretime),
    ]);
  } catch (err) {
    onError(["Set redis error", err]);
  }
}

export async function getRedisResponse(redis_key_og, callback, extra = {}) {
  let get_redis_data = [];
  let redis_key = process.env.REDIS_KEY + redis_key_og;
  try {
    get_redis_data = await client_R.get(redis_key);
  } catch (err) {
    onError(err);
  }
  callback(redis_key_og, get_redis_data, extra);
}

export function objectClean(obj) {
  if (obj == undefined && obj == null) {
    return obj;
  }
  let objNewKeys = Object.keys(obj);
  let finalArray = {};
  if (objNewKeys.length > 0) {
    for (let key of objNewKeys) {
      let tmpKey = key.toLowerCase();
      finalArray[tmpKey] = obj[key];
    }
  }
  return finalArray;
}

export function response_obj(
  output = "",
  is_data_found_in_redis = true,
  extraobj = {},
  status_code = 1,
  success = true,
  message = "Successful"
) {
  return {
    status_code: status_code,
    success: success,
    data: output,
    message: message,
    fromredis: is_data_found_in_redis,
    ...extraobj,
  };
}

export function value_clean(val) {
  let res;
  if (
    val != "" &&
    val != null &&
    val != "null" &&
    typeof val != undefined &&
    val != "undefined"
  ) {
    res = val?.toString()?.trim();
  } else {
    res = "";
  }
  return res;
}
