<template>
  <div>
    <div>
      <el-checkbox
        :indeterminate="isIndeterminate"
        v-model="checkAll"
        @change="handleCheckAllChange"
      ></el-checkbox>
      <el-input v-model="inputValue" style="width: 400px" @keyup.enter="onAdd(value)"></el-input>
    </div>
    <el-checkbox-group
      v-model="cityOptions.checkedCities"
      @change="handleCheckedCitiesChange"
    >
      <ul>
        <li
          v-for="item in cityOptions.cities"
          :key="item"
          style="padding: 10px; font-size: 20px; list-style-type: none"
        >
          <el-checkbox :label="item" :key="item">{{ item }}</el-checkbox>
        </li>
      </ul>
    </el-checkbox-group>
    <div>
      <el-button>{{ cityOptions.cities.length }}</el-button>
      <!-- <span>{{}}</span> -->
      <el-button>all</el-button>
      <el-button>active</el-button>
      <el-button>completed</el-button>
    </div>
  </div>
</template>

<script>
// import { reactive } from '@vue/reactivity'
import { reactive, ref } from "vue";
const arr = ["上海", "北京", "广州", "深圳"];
export default {
  setup() {
    const cityOptions = reactive({
      cities: arr,
      checkedCities:['上海', '北京']
    })
    const inputValue = ref('')
    // const cities = reactive(cityOptions);
    const checkAll = ref(false);
    // let checkedCities = reactive(["上海", "北京"]);
    const isIndeterminate = ref(true);
    const handleCheckAllChange = (val) => {
      cityOptions.checkedCities = val ? cityOptions : [];
      isIndeterminate.value = false;
    };
    const handleCheckedCitiesChange = (value) => {
      // console.log(checkedCities.value)
      // console.log(value)
      // console.log(checkedCities.value)
      // checkedCities = reactive(value)
      // checkedCities[3] = '广州'
      // console.log(checkedCities)

      let checkedCount = value.length;
      checkAll.value = checkedCount === cityOptions.cities.length;
      isIndeterminate.value = checkedCount > 0 && checkedCount < cityOptions.cities.length;
    };
    const onAdd = (value) => {
      // console.log(value)
      console.log(inputValue.value)
      cityOptions.cities.push(inputValue.value)
    } 
    return {
      checkAll: false,
      isIndeterminate,
      handleCheckAllChange,
      handleCheckedCitiesChange,
      onAdd,
      inputValue,
      cityOptions
    };
  },
};
</script>

<style>
</style>
