[TOC]

# vue2 option api
data() {
​    return{}
}
data里面的数据，就会自动变成响应式的数据，这种模式叫做注入，将数据注入到实例里面去

# vue3

## reactivity api（处理数据响应式）

### ref reactive computed readonly watchEffect

| API      | 传入    |           返回            |     备注 |
| ---------|---------|-----------------|-------------|
| reactive | plain-object | 对象代理 | 深度代理对象中的所有成员 |
| readonly | plain-object or proxy | 对象代理 | 只能读取代理对象中的成员，不可修改 |
| ref      | any| {value: ...} | 对value的访问是响应式的，如果给value的值是一个对象，则会通过reactive函数进行代理，如果已经是代理，则直接使用代理 |
| computed | function | {value:...} | 会读取value值，会**根据情况**决定是否要运行函数（computed 是会有缓存的，如果里面的值不改变，则直接读取缓存的值，不会再重新运行computed里面的函数了）|


const arr = reactive([1, 2, 3])
把arr跟v-model结合，是不可行的，arr.push(4)也是不会生效的，两种解决办法
- 换成const arr = ref([1, 2, 3])  arr.value.push(4)
- 把arr变成对象的属性，const obj = { arr：reactive([1, 2 ,3]) }  （可以看composition的源码，如果传入的数据不是平面对象（比如数组），都会被直接return掉，根本没办法变成响应式）

```
const state = reactive({
    firstName:'jiong',
    lastName:'ma'
})

const imState = readonlu(state)
console.log(imState === state)     //false

const stateRef = ref(state)
const imState2 = readonly(stateRef)
console.log(imState2.value === stateRef.value)  //false


const state = reactive({a:1, b:2})
const count = ref(0)
const stop = watchEffect(() => {
    //该函数会立即执行，然后追踪函数中用到的响应式数据，响应式数据变化后会再次执行
    console.log(state.a, count.value)
})
// 通过调用stop函数，会停止监听
stop()

state.a++
state.a++
state.a++
state.a++
state.a++
count.value++
count.value++
count.value++
count.value++
// 会输出两次，分别是1 0 和 6 4

//等效于vue2的watch
//监听单个
watch(() => state.a, (newValue, oldValue) => {   //如果是ref，则直接写count，不用函数
    console.log(newValue, oldValue)
}, {
    immediate:true
})

//监听多个数据变化
watch([() => state.a, count], ([newValue1, newValue2], [oldValue1, oldValue2]) => {
    console.log(newValue1, oldValue1)
    console.log(newValue2, oldValue2)
}, {
    immediate:true
})
```

**注意：无论是watchEffect还是watch，当依赖变化，回调函数的运行都是异步的（微队列）**
应用： 除非遇到下面的场景，否则均建议选择watchEffect
- 不希望回调函数一开始就执行
- 数据改变时，需要参考旧值
- 需要监控一些回调函数中不会用到的数据

**相应习题看main5.js**

### unRef 等同于 isRef(val) ? val.value : val

### toRef 得到一个响应式对象某个属性的ref格式

```
const state = reactive({
    foo:1,
    bar:2
})
const fooRef = toRef(state, 'foo')  // fooRef:{value:...}

fooRef.value++
console.log(state.foo)  //2

state.foo++
console.log(fooRef.value) //3
```

### toRef 把一个响应式对象的所有属性都转换成ref格式，然后包装到一个plain-object中返回

```
const state = reactive({
    foo:1,
    bar:2
})

const stateAsRefs = toRefs(state)

// stateAsRefs: not a proxy stateAsRefs就是一个普通对象
// {foo:{value:...}, bar:{value...}}
```

应用
```
setup() {
    const state1 = reactive({a:1, b:2})
    const state2 = reactive({c:3, d:4})
    return {
        ...state1,     // 这样就不是响应式了 lost reactivity
        ...state2      // 这样就不是响应式了 lost reactivity
    }
}

setup() {
    const state1 = reactive({a:1, b:2})
    const state2 = reactive({c:3, d:4})
    return {
        ...toRef(state1),     // 响应式 reactivity
        ...toRef(state2)      // 响应式 lost reactivity
    }
}

// composition function
function usePros() {
    const pos = reactive({x:0, y:0})
    return pos
}

setup() {
    const {x, y} = usePos()   //不是响应式 lost reactivity
    const {x, y} = toRefs(usePos()) //响应式 reactivity
}
```

### 降低心智负担

所有的compostion均以ref的结果返回，以保证setup函数的返回结果中不包含reactive或readonly直接产生的数据

```
function usePos() {
    const pos = reactive({x:0, y:0})
    return toRefs(pos)    // {x: refObj, y: refObj}
}

function useBooks() {
    const books = ref([])
    return {books}   // books is refObj
}

function useLoginUser() {
    const user = readonly({
        isLogin:false,
        loginId:null
    })
    return toRefs(user) // {isLogin: refObj, loginId: refObj} all ref is readonly
}

setup() {
    // 在setup函数中，尽量保证解构，展开出来的所有响应式数据均是ref
    return {
        ...usePos(),
        ...useBooks(),
        ...useLoginUser()
    }
}
```

## compositon api ##

> 面试题：composition api相比于option api有哪些优势？

不同于reactivity api，composition api提供的函数很多是与组件深度绑定的，不能脱离组件而存在

### setup

```
//component
export default {
    setup(props, context) {
        //该函数在组件属性被赋值后立即执行，遭遇所有生命周期钩子函数
        // props是一个对象，包含了所有组件属性值
        // context是一个对象，提供了组件所需的上下文信息
    }
}
```

context 对象的成员

| 成员 | 类型 | 说明 |
| ------ |
| attrs | 对象 | 同vue2的this.$attrs |
| slots | 对象  | 同vue2的this.$slots |
| emit | 方法 | 同vue2的this.$emit|

### 生命周期函数
| vue 2 option api | vu3 option api | vue3 composition api |
| ------ |
| beforeCreate | beforeCreate | 不再需要，代码可直接置于setup中 |
| create | created  | 不再需要，代码可直接置于setup中 |
| beforeMount | beforeMount | onBeforeMount|
| mounted | mounted | onMounted |
| beforeUpdate | beforeUpdate | onBeforeUpdate |
| updated | updated | onUpdated |
| beforeDestory | **改** beforeUnmount | onBeforeUnmount |
| destroyed | **改** unmounted  | onUnmounted |
| errorCaptured | errorCaptured | onErrorCaptured |
| - | **新** renderTracked | onRenderTracked |
| - | **新** renderTriggered | onRenderTriggered |

**新增钩子函数说明**
| 钩子函数 | 参数 | 执行实际 |
| ------ |
| renderTracked | DeggerEvent | 渲染vdom收集到的每一次依赖时 |
| renderTracked |  DeggerEvent | 某个依赖变化导致组件重新渲染时候 |

DebuggerEvent：
- target： 跟踪或触发渲染的对象
- key： 跟踪或触发渲染的属性
- type： 跟踪或触发渲染的方式

### 面试题参考答案
 面试题： compostition api相比于option api有哪些优势

 > 从两方面回答
    1、 为了更好的逻辑复用和代码组织
    2、 更好的类型推导

```
有了compositon api，配合reacivity api，可以在阻止内部进行更加细粒度的控制，是的组件中不同的功能高度聚合，提升了代码的可维护性。对于不同组件的相同功能，也能够更好的复用。
相比于option api， compostion api中没有了指向奇怪的this，所有的api更加函数式，这有利于和类型推断系统，比如ts深度配置
```

## vuex
```
import loginUser from './loginUser'
import {createStore, createLogger} from 'vuex
export default createStore({
​    modules:{
​        loginUser
​    },
​    plugin:[createLogger()]
})
```

## vite原理

### webpack原理（assest中的原理图）

- 更改其中一个module中的数据，热替换，其他相依赖的也需要重新打包，然后把重新打包的文件发送到相应的devServer中

### vite原理

- 直接启动一个服务器，根据不同的页面请求，给不同的模块，前提是，浏览器必须支持module，因为index.html中的script中的type值为module，开发的时候会有兼容性问题，因为devServer是属于开发阶段的

### 谈谈你对vie的理解，最好结合webpack

> webpack会先打包，然后启动开发服务器，请求服务器直接给予打包结果。
    而vite是直接启动开发服务器，请求那个模块，就对哪个模块进行实时编译。
    由于现代浏览器本身就支持ES Module，会自动像依赖的Module发出请求。vite充分利用这一点，将开发环境下的模块文件，就作为浏览器要执行的文件，而不是像webpack那样及逆行打包合并
    由于viete在启动的时候不需要打包，也就意味着不需要分析模块的依赖，不需要编译，因为启动速度非常快。
    当浏览器请求某个模块时，在根据需要对模块内容进行编译。这种按需动态编译的方式，极大的缩减了编译时间，项目越复杂、模块越多，vite的优势越明显
    在HRM(热更新)方面，当改动了一个模块后，仅需让浏览器重新请求该模块即可，不想webpack那样需要把该模块的相关依赖模块全部编译一次，效率更高。
    当需要打包到生产环境时，vite使用传统的rollup进行打包，因为vite的主要优势在开发阶段。另外，由于vite利用的是ES Module，因此在代码中不可以使用CommonJS

## 效率提升

> 客户端渲染效率比vue2提升了1.3-2倍
> ssr渲染效率比vue2提升了2-3倍
> 面试题：vue3 的效率提升主要表现在哪些方面

### 静态提升

下面的静态节点会被提升

- 元素节点
- 没有绑定动态内容

```
// vue2 的静态节点
render() {
    createVNode("h1", null, "hello world")
}

// vue的静态节点
const hoisted = createVNode = createVNode("h1", null, "hello world")
function render() {
    // 直接使用hoisted即可
}
```

静态属性会被提升

```
<div class="user">
{{user.name}}
</div>
```

```
const hoisted = {class:"user"}
function render() {
    createVNode("div", hoisted, username)
}
```
以上效果可通过本地开发环境，请求页面的network中的APP.vue进行查看

### 预字符串化

当编译器遇到大量连续(20个节点)的静态内容，会直接将其编译成一个**普通字符串节点**
vue2则是管是不是静态的内容，都全部弄成虚拟节点

vue2虚拟节点

![vue2虚拟节点](F:\vite-vue-app\src\assets\vue2虚拟节点.PNG)

vue3 虚拟节点（把节点中静态的内容编译成一个普通字符串）

![vue3虚拟节点](F:\vite-vue-app\src\assets\vue3虚拟节点.PNG)

```
<button @click="count++">plus</button>
```

```
// vue2
render(ctx) {
    return createVNode("button", {
        onClick:function ($event) {
            ctx.count++
        }
    })
}

// vue3
render(ctx, _cache) {
    return createVNode("button", {
        onClick: cache[0] || (cache[0] = $(event) => (ctx.count++))
    })
}
```

### Block Tree
vue2在对比新旧i树的时候，并不知道哪些节点是静态的，哪些是动态的，因为只能一层一层的比较，这就浪费了大部分时间在对比静态节点上
vue3会标记哪些是动态节点，哪些是静态节点，把所有的动态节点提取到跟节点中，然后在对比的时候，直接对比相应的动态节点即可，不需要一层一层来对比了

### PatchFlag
vue2在对比每一个节点时候，并不知道这个节点哪些相关信息会发生变化，因此只能将信息依次对比
在对比某一个节点的时候，通过标记，可以仅仅对比动态的内容，而不需要对比其他的东西，比如类型，属性，递归子节点，这些都不需要进行对比了


## API和数据响应式的变化

>面试题1：为什么vue3中去掉了vue构造函数
>面试题2：谈谈你对vue3数据响应式的理解

### 去掉vue构造函数
在过去，如果遇到一个页面有多个vue应用时，往往会遇到一些问题
```
<!-- vue2 --->
<div id="app1"></div>
<div id="app2"></div>
<script>
Vue.use(...)     //此代码会影响所有的vue应用
Vue.mixin(...)   //此代码会影响所有的vue应用
Vue.component(...)  //此代码会影响所有的vue应用

new Vue({
    //配置
}).$mount("#app1")

new Vue({
    //配置
}).$mount("#app2")
</script>
```

在vue3中，去掉Vue构造函数，转而用createApp创建vue应用

```
<!-- vue3 --->
<div id="app1"></div>
<div id="app2"></div>

<script>
createApp(根组件).use(...).mixin(...).component(...).mount("#app1")
createApp(根组件).mount("#app2")
</script>
```

>更多vue实例的api：https://v3.vuejs.org/api/application-api.html

### 组件实例中的API

在vue3中，组件实例是一个proxy，她仅提供了下列成员，功能和vue2一样

>属性：https://v3.vuejs.org/api/instance-properties.html
>方法：https://v3.vuejs.org/api/instance-methods.html

### 对比数据响应式
vue2和vue3均在相同的生命周期完成数据响应式，但做法不一样
vue2 Object.defineProperty 遍历每个属性值，加了一个属性没法响应式，得通过this.$set来完成相应的响应式
vue3 proxy 代理整个对象,es6的proxy效率要比上面的Object.defineProperty高


### 面试题参考答案

面试题1：为什么vue3去掉了vue构造函数

> vue2的全局构造函数带来了诸多问题：
    1. 调用构造函数的静态方法会对所有vue应用生效，不利于隔离不同应用
    2. vue2的构造函数集成了太多功能，不利于tree shaking，vue3把这些功能使用普通函数导出，能够充分利用tree shaking优化打包体积
    3. vue2没有把组件实例和vue应用两个概念区分开，在vue2中，通过new Vue创建的对象，即使一个vue应用，同事又是一个特殊的vue组件。
    vue3中，把两个概念区别开来，铜鼓偶createApp创建的对象，是一个vue应用，她内部提供的方法是针对整个应用的，而不再是一个特殊的组件

面试题2：谈谈你对vue3数据响应式的理解

>vue3不再使用Object.defineProperty的方式定义完成数据响应式，而是使用proxy
除了proxy本身效率比Object.defineProperty更高之外，由于不必递归遍历所有属性，而是直接得到一个proxy，所以在vue3中，对数据的访问是动态的
当访问某个属性的时候，再动态的获取和设置，这就极大的提升了在组件初始阶段的效率。
同时，由于proxy可以监控到成员的新增和删除，因此，vue3中新增成员，删除成员，索引访问等均可触发重新渲染，而这些在vue2中是难以做到的。

## 模板中的变化
> 地址：https://juejin.cn/post/6909346339457826830#heading-15
### v-model
vue2比较让人诟病的一点，就是提供了两种双向绑定，v-model和.sync,在vue3中，去掉了.sync修饰符，只需要使用v-model及逆行双向绑定即可

为了让v-model更好的针对多个属性进行双向绑定，vue3做出了以下修改

- 当对自定义组件使用v-model指令时，绑定的属性名由原来的value变成能了modelValue，事件名由原来的input变成update：modelValue
```
<!-- vue2 --->
<ChildComponent :value="pageTitle" @input="pageTitle = $event" />
<!-- 简写为 --->
<ChildComponent v-model="pageTitle " />

<!-- vue2 --->
<ChildComponent :modelValue="pageTitle" @update:modelValue="pageTitle = $event" />
<!-- 简写为 --->
<ChildComponent v-model:title="pageTitle" />
```


- 去掉.sync 修饰符，她原本的功能由v-model的参数替代
```
<!-- vue2 --->
<ChildComponent :title="pageTitle" @update:title="pageTitle = $event" />
<!-- 简写为 --->
<ChildComponent :title:sync="pageTitle" />

<!-- vue2 --->
<ChildComponent :title="pageTitle" @update:title="pageTitle = $event" />
<!-- 简写为 --->
<ChildComponent v-model:title="pageTitle" />
```

- model 配置被移除
- 允许自定义v-model修饰符

### v-if v-for

v-if的优先级现在高于v-for,v-if不能和v-for同时存在了，因为先判断v-if，如果v-if里面的变量由v-for的item来的话，那直接就是undefined

### key

- 当使用template进行v-for循环时，需要把key值放到template中，而不是她的子元素中
- 当使用v-if v-else-if v-else分支的时候，不再需要指定key值，因为vue3会自动给与每个分支一个唯一的key
  即便要手工给可以值，也必须给与每个分支唯一的key，不能因为要重用分支而给与相同的key

### Fragment

vue3现在允许组件出现多个根节点

## 组件变化

### defineAsyncComponent 异步组件

```
import {defineAsyncComponent, h} from 'vue'
cosnt Block = defineAsyncComponent({
    loader: async () => {
        await delay()
        if(Match.random() < 0.5>){
            throw new Error()
        }
        return import("../components/Block.vue)
    },
    loadingComponent: Loading,
    errorComponent: {
        render() {
            return h(Error, '出错了')
        }
    }
})
```

访问地址 -> 异步加载页面级组件 -> 异步加载页面中的组件

// 进度条
import 'nprogress' from nprogress

### Teleport

```
<Teleport to="body">   //body是相应的css选择器
 <div>
    <slot></slot>
 </div>
</Teleport>
```