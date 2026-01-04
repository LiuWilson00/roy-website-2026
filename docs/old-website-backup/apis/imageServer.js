import req from "./https.js";
import { imageServer } from "../config";

export const apiPostImage = (params) =>
  req("post", `${imageServer}/api/image/upload`, params, true);
