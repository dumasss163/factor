<template>
  <div class="edit-post-seo">
    <div class="search-preview">
      <div class="sup">Search Preview</div>
      <div class="headline">{{ post.titleTag || post.title || "Untitled" }}</div>
      <div class="plink">{{ link }}</div>
      <div class="desc">
        {{
          post.descriptionTag ||
            post.subTitle ||
            excerpt(post.content) ||
            "No Description"
        }}
      </div>
    </div>
    <dashboard-input v-model="post.titleTag" input="factor-input-text" label="Title Meta Tag" />
    <dashboard-input
      v-model="post.descriptionTag"
      input="factor-input-textarea"
      label="Description Meta Tag"
    />
    <dashboard-input
      v-model="post.shareImage"
      input="factor-input-image-upload"
      label="Sharing Image"
      :max="1"
    />
  </div>
</template>
<script lang="ts">
import { excerpt } from "@factor/api/excerpt"
import { dashboardInput } from "@factor/dashboard"
import { postLink, stored } from "@factor/api"
import Vue from "vue"
export default Vue.extend({
  components: { dashboardInput },
  props: {
    postId: { type: String, required: true }
  },
  computed: {
    post() {
      return stored(this.postId) || {}
    },
    link() {
      return postLink(this.postId, { root: true })
    }
  },
  methods: { excerpt }
})
</script>
<style lang="less">
.edit-post-seo {
  .search-preview {
    line-height: 1.5;
    padding: 0em 0 2em;
    .sup {
      opacity: 0.3;
      margin-bottom: 1em;
    }
    .headline {
      line-height: 1.3;
      color: #1b1ba8;
      font-size: 1.3em;
    }
    .desc {
      opacity: 0.7;
    }
    .plink {
      color: #0a6524;
    }
  }
}
</style>
