import * as Vue from 'vue'

export * from 'vue'
export default Vue

export const isVue2 = false
export const isVue3 = true
export const Vue2 = undefined

// Provide Vue2-compatible helpers expected by vueuse via vue-demi
export const set = <T extends Record<string, unknown>, K extends keyof T>(target: T, key: K, value: T[K]) => {
  target[key] = value
}

export const del = <T extends Record<string, unknown>, K extends keyof T>(target: T, key: K) => {
  delete target[key]
}
