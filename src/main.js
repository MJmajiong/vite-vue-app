import 'element-plus/packages/theme-chalk/src/index.scss';
import { createApp } from 'vue'
import App from './App.vue'
import ElementUI from 'element-plus'
//vue2 
//const app = nwe Vue(option)
//app.mount("#app")

//vue3
// 不存在构造函数vue
// const app = createApp(App)
// app.mount("#app")

createApp(App).use(ElementUI).mount('#app')



