<template>
  <div class="content-layout">
    <header-primary class="show-desktop" />
    <header-mobile class="show-mobile" />
    <div class="content-main">
      <div class="content-main-content">
        <router-view />
      </div>
      <footer-primary />
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  name: "ContentWrap",
  components: {
    "header-primary": () => import("./header.vue"),
    "footer-primary": () => import("./footer.vue"),
    "header-mobile": () => import("./header-mobile.vue")
  },
  metaInfo() {
    return {
      titleTemplate: "%s - Factor JS"
    }
  }
})
</script>

<style lang="less">
.content-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  .show-mobile {
    display: none;
    @media (max-width: 900px) {
      display: block;
    }
  }

  .show-desktop {
    display: block;
    @media (max-width: 900px) {
      display: none;
    }
  }

  .content-content {
    display: flex;
    flex-grow: 1;
    .content-nav,
    .content-main {
      overflow-y: scroll;
    }
    .content-nav {
      flex: 0 0 250px;
      padding: 1em 1.5em;
      background: rgba(38, 67, 89, 0.08);
    }
    .content-main {
      min-height: 100vh;
      flex: 1 1 100%;
      display: flex;
      flex-direction: column;
      .content-main-content {
        padding: 1.5em;
        flex-grow: 1;
      }
      .content-footer {
        padding: 1em 1.5em;
        font-size: 0.85em;
        color: rgba(38, 67, 89, 0.2);
        text-align: center;
      }
    }
  }
}
</style>
