//跳轉、錯誤處理、提示等方法放在這裡
// import {Message} from 'element-ui';
// import router from '../router/index';

export const tip = msg =>{
    // Message.error(msg);
    // alert(msg);
}

export const toLogin = (nuxt) => {
    // this.$router.push('/');
    // $router.replace({
    //     name: 'Login',
    //     query: {
    //         redirect: router.currentRoute.fullPath
    //     }
    // });
    // debugger;
    // nuxt.$router.push('/login');
    window.location.pathname = '/login';
    // window.history.pushState("123","title","/Login");
}

export const to403Page = (nuxt) => {
    // nuxt.$router.push('/403');
    window.location.pathname = '/403';
    // this.$router.push('/');
    // $router.replace({
    //    name: '403' 
    // });
}