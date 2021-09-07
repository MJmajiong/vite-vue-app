import {ref} from 'vue'
export function useCount() {
  const count = ref(0)
  const increase = () => {
    return count.value++
  }
  const descrease = () => {
    return count.value --
  }
  return {
      count,
      increase,
      descrease
  }
}