import req from "./https.js";
import { apiUrl } from "../config";

export const queryLogin = (params) =>
  req("post", `${apiUrl}/login`, params, false);
