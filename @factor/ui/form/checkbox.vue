<template>
  <label class="checkbox-wrap">
    <input type="checkbox" class="checkbox" :value="value" v-on="listeners" />
    <span v-if="label" class="checkbox-label">{{ label }}</span>
  </label>
</template>
<script lang="ts">
import Vue from "vue"

export default Vue.extend({
  props: {
    value: { type: [String, Boolean, Array], default: false },
    label: { type: String, default: "" }
  },
  computed: {
    listeners(this: any) {
      return {
        ...this.$listeners,
        input: (event: Event & { target: HTMLInputElement }) =>
          this.$emit("input", event.target.value)
      }
    }
  }
})
</script>
<style lang="less"></style>
