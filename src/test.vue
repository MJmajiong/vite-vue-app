<template>
    <div>{{count}}</div>
    <button @click="increase">increase</button>
    <button @click="descrease">descrease</button>
</template>

<script>
// import { reactive } from '@vue/reactivity'
import {ref} from "vue"
import {useCount} from './index'
// composition的好处就是可以一块一块的提出来，然后进行复用

export default {
  setup() {
    console.log("所有生命周期钩子函数之前调用")
    
    return {
      ...useCount()
    }
  }
  // data() {
  //   return {
  //     count:0
  //   }
  // },
  // methods:{
  //   onAdd() {
  //     this.count++
  //   }
  // }
}
</script>


<style>


</style>
