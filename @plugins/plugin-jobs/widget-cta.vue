<template>
  <div v-if="post.jobApplyEmail" class="job-entry-cta">
    <a :href="`mailto:${post.jobApplyEmail}`">
      <factor-btn btn="primary" size="large">
        Apply Now
        <factor-icon icon="arrow-right" />
      </factor-btn>
    </a>
  </div>
</template>
<script lang="ts">
import { factorBtn, factorIcon } from "@factor/ui"
import { stored } from "@factor/api"
import Vue from "vue"

export default Vue.extend({
  components: { factorBtn, factorIcon },
  props: {
    postId: { type: String, default: "" }
  },
  computed: {
    post(this: any) {
      return stored(this.postId) || {}
    }
  }
})
</script>

<style lang="less"></style>