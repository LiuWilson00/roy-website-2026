import axios from "axios";
// import router from '../router/index'
import { tip, toLogin, to403Page } from "./utils";
// import router from '../router';
// import store from '../store';
// import React, { useContext } from 'react';
// import { ThemeContext } from './../contexts/ThemeContext';

// const SwitchThemeButton = () => {
//   const context = useContext(ThemeContext);
//   const { theme, toggleTheme } = context;
//   return (
//     <button
//       style={{
//         color: theme.foreground,
//         backgroundColor: theme.background,
//       }}
//       onClick={toggleTheme}
//     >
//       Change Theme
//     </button>
//   );
// };

// export default SwitchThemeButton;

const errorHandle = (status, msg) => {
  switch (status) {
    //400: 登入失敗，可能是帳號或是密碼錯誤
    case 400:
      tip(msg);
      break;
    //401: backend session過期
    case 401:
      //
      if (
        window.location.pathname === "/login" ||
        window.location.pathname === "/home" ||
        window.location.pathname === "/register"
      ) {
        // if (nuxt.$router.currentRoute.name === "/login") {
        //不用tip, 會由Login去導向首頁
      } else {
        //清除token
        // JSON.parse(window.localStorage.user).userInfo.Token;
        let userInfo = { userInfo: { Token: "", user: {} } };
        window.localStorage.setItem("user", JSON.stringify(userInfo));
        // nuxt.$store.dispatch("modules/auth/setAuth", {
        //   token: "",
        //   isLogin: false,
        // });

        tip(msg);
        setTimeout(() => {
          toLogin();
        }, 1000);
      }
      break;

    //403: 權限不足
    case 403:
      to403Page();
      break;

    //404: 請求失敗
    case 404:
      tip(msg);
      break;

    //其他錯誤，直接拋出提示錯誤
    default:
      console.log("resp沒有攔截到的錯誤:" + msg);
  }
};

//axios的實例
var instance = axios.create({
  baseURL: "/api/",
});

//request攔截器
instance.interceptors.request.use(
  (config) => {
    //發送request前 判斷vuex中是否存在token
    //若存在則統一在http請求的header都加上token
    if (
      (config.params && config.params.needAuth) ||
      (config.data !== undefined && config.data.needAuth)
    ) {
      let token = "";
      if (!!window.localStorage.token) {
        token = JSON.parse(window.localStorage.token);
      }

      token && (config.headers.Authorization = "Bearer " + token);
      return config;
    } else {
      return config;
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

//response攔截器
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    if (response) {
      let str = "",
        obj = undefined;
      if (response.data.result === undefined) {
        errorHandle(response.status, response.data.message);
        // obj = undefined;
      } else {
        errorHandle(response.status, response.data.result.message);
        obj =
          response.data.result.validationErrors === undefined
            ? undefined
            : response.data.result.validationErrors;
      }
      if (obj !== undefined) {
        Object.keys(obj).forEach((key) => {
          str = str + obj[key][0].message + "\n";
        });
        return Promise.reject(str);
      } else {
        str =
          response.data.result === undefined
            ? response.data.message
            : response.data.result.message;
        return Promise.reject(str);
      }
    } else {
      if (!window.navigator.onLine) {
        tip("網路出了點問題，請重新連線後刷新網頁");
      } else {
        return Promise.reject(error);
      }
    }
  }
);

export default function (method, url, data = null, needAuth = false) {
  method = method.toLowerCase();
  const processData =
    data instanceof FormData
      ? data
      : {
          ...data,
          lang: window.localStorage.getItem("lang") || 1,
        };

  if (method === "post") {
    processData.needAuth = needAuth;
    return instance.post(url, processData);
  } else if (method === "get") {
    processData.needAuth = needAuth;
    return instance.get(url, { params: processData });
  } else if (method === "delete") {
    processData.needAuth = needAuth;
    return instance.delete(url, { params: processData });
  } else if (method === "put") {
    processData.needAuth = needAuth;
    return instance.put(url, processData, needAuth);
  } else {
    console.error("未知的method" + method);
    return false;
  }
}
