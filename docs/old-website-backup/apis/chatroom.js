import req from "./https.js";
import { apiUrl } from "../config";

export const queryUserInfo = (params) =>
  req("get", `${apiUrl}/user/info`, params, true);

export const queryChatroomGroups = (params) =>
  req("get", `${apiUrl}/room`, params, true);

export const queryChatroomDetail = (params) =>
  req("get", `${apiUrl}/room/${params.id}/info`, params, true);

export const queryChatroomMembers = (params) =>
  req("get", `${apiUrl}/room/${params.id}/info/members`, params, true);

export const queryChatroomMessages = (params) =>
  req("get", `${apiUrl}/chat/${params.id}`, params, true);

// export const queryChatroomMessages = (roomId) =>
//   req("get", `${apiUrl}/api/chat/${roomId}/messages`, {}, true);

export const querySendMessages = (params) =>
  req("post", `${apiUrl}/chat/${params?.roomId}/send`, params, true);
