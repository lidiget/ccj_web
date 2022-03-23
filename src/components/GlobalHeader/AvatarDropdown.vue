<template>
  <a-dropdown v-if="currentUser && currentUser.name" placement="bottomRight">
    <span class="ant-pro-account-avatar">
      <a-avatar
        size="small"
        src="https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png"
        class="antd-pro-global-header-index-avatar"
      />
      <span>{{ username }}</span>
    </span>
    <template v-slot:overlay>
      <a-menu class="ant-pro-drop-down menu" :selected-keys="[]">
        <!-- <a-menu-item v-if="menu" key="center" @click="handleToCenter">
          <a-icon type="user" />
          个人中心
        </a-menu-item> -->
        <!-- <a-menu-item v-if="menu" key="settings" @click="handleToSettings">
          <a-icon type="setting" />
          个人设置
        </a-menu-item> -->
        <!-- <a-menu-divider v-if="menu" /> -->
        <a-menu-item key="logout" @click="handleLogout">
          <a-icon type="logout" />
          退出登录
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
  <span v-else>
    <a-spin size="small" :style="{ marginLeft: 8, marginRight: 8 }" />
  </span>
</template>

<script>
export default {
  data() {
    return {
      username: '',
    }
  },
  name: 'AvatarDropdown',
  props: {
    currentUser: {
      type: Object,
      default: () => null,
    },
    menu: {
      type: Boolean,
      default: true,
    },
  },
  created() {
    const that = this
    var store = window.localStorage.getItem('store')
    if (store) {
      store = JSON.parse(store)
      that.$store.state.admin = store.admin
    }
    this.username = this.$store.state.admin.user_name=null?"":this.$store.state.admin.user_name
  },
  methods: {
    handleToCenter() {
      this.$router.push({ path: '/account/center' })
    },
    handleToSettings() {
      this.$router.push({ path: '/account/settings' })
    },
    handleLogout(e) {
      this.$confirm({
        title: '是否确定退出?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          window.localStorage.clear();
          return this.$store.dispatch('Logout').then(() => {
            this.$router.push({ name: 'login' })
          })
        },
        onCancel() {},
      })
    },
  },
}
</script>

<style lang="less" scoped>
.ant-pro-drop-down {
  /deep/ .action {
    margin-right: 8px;
  }
  /deep/ .ant-dropdown-menu-item {
    min-width: 160px;
  }
}
</style>
