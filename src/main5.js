import {reactive, watchEffect, watch} from 'vue'
//每次准备取出第一个宏任务执行前, 都要将所有的微任务一个一个取出来执行，也就是优先级比宏任务高，且与微任务所处的代码位置无关
const state = reactive({
    count:0
})

watchEffect(() => {
    console.log("wtchEffect", state.count)
})
watch(
    () => state.count,
    (count, oldCount) => {
        console.log("watch", count, oldCount)
    }
)

console.log("start")
setTimeout(() => {
    console.log("time out")
    state.count++
    state.count++
})

state.count++
state.count++

console.log("end")

// 主线程（笔记，执行顺序看字母部分）

// watchEffct 0
// start
// end

// 分线程（宏队列：dom事件回调，ajax回调，定时器回调   微队列：promise回调 mutationObservable回调）
// 每次准备取出第一个宏任务执行前, 都要将所有的微任务一个一个取出来执行，也就是优先级比宏任务高，且与微任务所处的代码位置无关

// watchEffect 2（微任务）
// watch 2 0（微任务）

// time out （宏任务）
// watchEffect 4 （宏任务）
// watch 4 2 （宏任务）

