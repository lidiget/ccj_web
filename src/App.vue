<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <router-view/>
    </div>
  </a-config-provider>
</template>

<script>
import { domTitle, setDocumentTitle } from '@/utils/domUtil'
import { i18nRender } from '@/locales'

export default {
  data () {
    return {
    }
  },
  created() {
    const that = this;
    // enquireScreen((isMobile) => this.setDevice(isMobile));
    // 在页面加载时读取sessionStorage

    if (localStorage.getItem("store")) {
      that.$store.replaceState(
        Object.assign(
          {},
          that.$store.state,
          JSON.parse(localStorage.getItem("store"))
        )
      );
    }

    // 在页面刷新时将store保存到sessionStorage里
    window.addEventListener("beforeunload", () => {
      localStorage.setItem("store", JSON.stringify(this.$store.state));
    });
  },
  computed: {
    locale () {
      // 只是为了切换语言时，更新标题
      const { title } = this.$route.meta
      title && (setDocumentTitle(`${i18nRender(title)} - ${domTitle}`))

      return this.$i18n.getLocaleMessage(this.$store.getters.lang).antLocale
    }
  }
}
</script>
