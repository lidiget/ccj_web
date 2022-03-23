<template>
  <a-card bordered>
    <a-spin :spinning="spinning" size="large">
      <a-descriptions title="个人信息" bordered>
        <a-descriptions-item label="用户名"> {{ onecommonuserdata.user_name }} </a-descriptions-item>
        <a-descriptions-item label="用户昵称"> {{ onecommonuserdata.nick_name }} </a-descriptions-item>
        <a-descriptions-item label="所属部门"> {{ onecommonuserdata.dept_name }} </a-descriptions-item>
        <a-descriptions-item label="权限名称"> {{ onecommonuserdata.role_name }} </a-descriptions-item>
        <a-descriptions-item label="手机号码"> {{ onecommonuserdata.phonenumber }}</a-descriptions-item>
        <a-descriptions-item label="性别"> {{ onecommonuserdata.sex == '1' ? '男' : '女' }} </a-descriptions-item>
        <a-descriptions-item label="创建时间" :span="2"> {{ onecommonuserdata.create_time }} </a-descriptions-item>
      </a-descriptions>
    </a-spin>
    <a-card :bordered="false" title="个人信息编辑" style="margin-top: 16px">
      <div>
        <a-row>
          <a-col :span="8">
            <a-button
              type="primary"
              :loading="registerBtn"
              @click="
                () => {
                  this.updatedata = this.onecommonuserdata
                  this.ifshouedit = true
                }
              "
            >
              个人信息编辑
            </a-button>
          </a-col>
          <a-col :span="8">
            <a-button
              type="primary"
              @click="
                () => {
                  this.ifchangepassword = true
                }
              "
              :loading="registerBtn"
            >
              修改个人密码</a-button
            >
          </a-col>
          <a-col :span="8"> </a-col>
        </a-row>
      </div>
    </a-card>
    <a-modal
      title="个人信息编辑"
      :visible="ifshouedit"
      :confirm-loading="false"
      okText="保存"
      @ok="savedata"
      :centered="true"
      @cancel="
        () => {
          this.ifshouedit = false
          this.updatedata = {}
        }
      "
      cancelText="取消"
      :maskClosable="false"
      :destroyOnClose="true"
      :confirmLoading="spinning"
    >
      <a-spin :spinning="spinning">
        <p class="edit">
          <a-form-item label="用户昵称:">
            <a-input
              size="large"
              type="text"
              :maxLength="50"
              placeholder="用户昵称"
              v-model="updatedata.nick_name"
            ></a-input>
          </a-form-item>
          <a-form-item label="所属部门:" v-if="updatedata.dept_name != ''">
            <a-input
              size="large"
              type="text"
              style="width: 365px"
              placeholder="所属部门"
              allowClear
              readonly="true"
              v-model="updatedata.dept_name"
            ></a-input>
          </a-form-item>
          <a-form-item label="所属部门:" v-if="updatedata.dept_name == null || updatedata.dept_name == ''">
            <a-cascader
              size="large"
              :display-render="displayRender"
              style="width: 365px"
              :options="orgTree"
              change-on-select
              @change="onChange"
              expand-trigger="hover"
              placeholder="所属部门"
            />
          </a-form-item>
          <a-form-item label="电话:">
            <a-input
              size="large"
              type="text"
              placeholder="电话"
              :maxLength="50"
              v-model="updatedata.phonenumber"
            ></a-input>
          </a-form-item>
          <a-form-item label="邮箱:">
            <a-input size="large" type="text" placeholder="邮箱" :maxLength="50" v-model="updatedata.email"></a-input>
          </a-form-item>
          <a-form-item label="性别:">
            <a-select
              size="large"
              style="width: 365px"
              show-search
              placeholder="性别"
              option-filter-prop="children"
              v-model="updatedata.sex"
            >
              <a-select-option value="1"> 男 </a-select-option>
              <a-select-option value="2"> 女 </a-select-option>
            </a-select>
          </a-form-item>
        </p>
      </a-spin>
    </a-modal>

    <a-modal
      title="修改密码"
      :visible="ifchangepassword"
      :confirm-loading="false"
      okText="保存"
      cancelText="取消"
      @ok="handleOk"
      :centered="true"
      @cancel="
        () => {
          this.password1 = ''
          this.password = ''
          this.ifchangepassword = false
        }
      "
      :maskClosable="false"
      :destroyOnClose="true"
      :confirmLoading="spinning"
    >
      <div>
        <a-spin :spinning="spinning">
          <p class="password">
            <a-form-item>
              <a-input-password
                size="large"
                :maxLength="50"
                placeholder="至少6位新密码，区分大小写"
                v-model="password"
              ></a-input-password>
            </a-form-item>
            <a-form-item>
              <a-input-password
                size="large"
                :maxLength="50"
                placeholder="确认新密码"
                v-model="password1"
              ></a-input-password>
            </a-form-item>
          </p>
        </a-spin>
      </div>
    </a-modal>
  </a-card>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      spinning: false,
      password1: '',
      password: '',
      orgTree: [],
      alldeptdata: [],
      onecommonuserdata: {},
      updatedata: {},
      registerBtn: false,
      ifchangepassword: false,
      ifshouedit: false,
    }
  },
  computed: {},
  created() {
    const that = this
    var store = window.localStorage.getItem('store')
    var rights = JSON.parse(window.localStorage.getItem('rights'))

    if (rights) {
      that.$store.state.rights = rights
    } else {
      this.$message.warning('登录信息过期,请重新登录!')
      return this.$store.dispatch('Logout').then(() => {
        this.$router.push({ name: 'login' })
      })
    }

    if (store) {
      store = JSON.parse(store)
      that.$store.state.admin = store.admin
    } else {
      this.$message.warning('登录信息过期,请重新登录!')
      return this.$store.dispatch('Logout').then(() => {
        this.$router.push({ name: 'login' })
      })
    }
    this.getOrgTreeData()
  },
  mounted() {},
  methods: {
    onChange(value, selectedOptions) {
      console.log(value)
      console.log(selectedOptions)
      // this.onecommonuserdata.dept_id = selectedOptions[value.length - 1].value
      this.onecommonuserdata.dept_name = selectedOptions[value.length - 1].value
    },
    getOrgTreeData() {
      //查询树形列表的全部数据
      const that = this
      that.orgTree = []
      that.alldeptdata = []
      var dataoptions = []
      var formdate = {}
      this.$request({
        url: '/user/getAllDeptClass',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.alldeptdata = res.data
            res.data.forEach((item) => {
              item.ancestors = item.ancestors.split(',')
            })
            res.data.forEach((industry) => {
              var thefastindustrys = {}
              if (industry.ancestors.length == 1) {
                thefastindustrys = {
                  title: industry.title,
                  key: industry.id,
                  label: industry.title,
                  value: industry.title,
                  classtype: 1,
                  ancestors: industry.ancestors,
                }
                var children = getChildrenindustry(industry.id)
                if (children.length > 0) {
                  thefastindustrys.children = children
                }
                dataoptions.push(thefastindustrys)
              }
              function getChildrenindustry(id) {
                var children = []
                res.data.forEach((industry) => {
                  var thefastindustrys = {}
                  if (industry.parentid === id) {
                    thefastindustrys = {
                      title: industry.title,
                      key: industry.id,
                      label: industry.title,
                      value: industry.title,
                      classtype: 2,
                      ancestors: industry.ancestors,
                    }
                    if (industry.ancestors.length == 3) {
                      thefastindustrys.classtype = 3
                    }
                    if (industry.title) {
                      var sonchildren = getChildrenindustry(industry.id)
                      if (sonchildren.length > 0) {
                        thefastindustrys.children = sonchildren
                      }
                    }
                    children.push(thefastindustrys)
                  }
                })
                return children
              }
              that.orgTree = dataoptions
              this.getUserDataByUserId()
            })
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    displayRender({ labels }) {
      return labels[labels.length - 1]
    },
    handleOk() {
      const that = this
      if (that.password == '') {
        this.$message.warning('请填写新密码!')
        return
      }
      if (that.password1 == '') {
        this.$message.warning('请确认新密码!')
        return
      }
      var arr = new Array()
      arr = that.password.split(' ')
      if (arr.length != 1) {
        this.$message.warning('请勿在密码中加入空格!')
        return
      }
      if (that.password1 != that.password) {
        this.$message.warning('请确认两次密码输入正确!')
        return
      }
      that.spinning = true
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      formdate.bills_type = 'adminForm'
      formdate.phonenumber = that.onecommonuserdata.phonenumber
      formdate.newpassword = that.password1
      formdate.type_id = that.onecommonuserdata.user_id
      formdate.user_id = that.onecommonuserdata.user_id
      formdate.updatepassword = 'yes'
      this.$request({
        url: '/user/updataAdmindataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.registerBtn = false
            that.ifchangepassword = false
            that.updatedata = {}
            that.onecommonuserdata = {}
            that.getUserDataByUserId()
            that.$message.success('重置密码成功!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.registerBtn = false
          that.onecommonuserdata = {}
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    savedata() {
      const that = this
      if (that.updatedata.nick_name == '' || that.updatedata.nick_name == null) {
        that.$message.warning('请填写用户名!')
        return
      }
      if (that.updatedata.dept_name == '' || that.updatedata.dept_name == null) {
        that.$message.warning('请选择所属部门!')
        return
      }
      if (!/^1[3456789]\d{9}$/.test(that.updatedata.phonenumber)) {
        this.$message.warning('请填写正确手机号!')
        return
      }
      if (that.updatedata.sex == '' || that.updatedata.sex == null) {
        that.$message.warning('请选择性别!')
        return
      }
      that.updatedata.user_phone = that.updatedata.phonenumber
      that.alldeptdata.forEach((item) => {
        if (item.title == that.updatedata.dept_name) {
          that.updatedata.dept_id = item.id
        }
      })

      that.spinning = true
      this.$request({
        url: '/user/updataAdmindataByid',
        method: 'get',
        params: that.updatedata,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.ifshouedit = false
            that.getUserDataByUserId()
            that.$message.success('修改成功!')
          } else if (res.code == 201) {
            that.spinning = false
            that.ifshouedit = false
            that.$message.error('抱歉,该手机号已被注册!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.ifshouedit = false
          that.$message.warning('抱歉,登录信息过期,请重新登录!')
        })
    },
    getUserDataByUserId() {
      const that = this
      that.spinning = true
      var formdate = {}
      console.log(that.$store.state.admin)
      formdate.userid = that.$store.state.admin.user_id
      this.$request({
        url: '/user/getOneAdminDataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.onecommonuserdata = res.data
            that.updatedata = res.data
            this.$store.state.admin = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
  },
}
</script>

<style>
.edit {
  width: 368px;
  margin: 0 auto;
  @media screen and (max-width: 576px) {
    width: 95%;
  }
  @media screen and (max-width: 320px) {
    .captcha-button {
      font-size: 14px;
    }
  }
}
</style>
