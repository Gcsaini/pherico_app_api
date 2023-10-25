import multer from "multer";
import {
  promiseSingleQuery,
  getRedisResponse,
  setRedisResponse,
  response_obj,
} from "../helper/facades.js";
const redis_key = "user";
const redis_key_expire = 4000;
export async function UploadCateogry(req, res, next) {
  console.log("here");
  let storage = multer.diskStorage({
    destination: function (request, file, callback) {
      callback(null, "./upload/category");
    },
    filename: function (request, file, callback) {
      let temp_file_arr = file.originalname.split(".");

      let temp_file_name = temp_file_arr[0];

      let temp_file_extension = temp_file_arr[1];

      callback(
        null,
        temp_file_name + "-" + Date.now() + "." + temp_file_extension
      );
    },
  });

  let upload = multer({ storage: storage }).single("category");

  upload(req, res, function (error) {
    if (error) {
      return res.end(`Error Uploading File-${error}`);
    } else {
      return res.end("File is uploaded successfully");
    }
  });
}
