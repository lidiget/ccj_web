<template>
  <div class="main">
    <a-form id="formLogin" class="user-layout-login" ref="formLogin" :form="form" @submit="handleSubmit">
      <a-tabs
        :activeKey="customActiveKey"
        :tabBarStyle="{ textAlign: 'center', borderBottom: 'unset' }"
        @change="handleTabClick"
      >
        <a-tab-pane key="tab1" tab="账号密码登录">
          <a-alert v-if="isLoginError" type="error" showIcon style="margin-bottom: 24px" message="账户或密码错误" />
          <a-form-item>
            <a-input
              size="large"
              type="text"
              @blur="getPhone"
              placeholder="请输入手机号"
              v-decorator="[
                'user_phone',
                {
                  rules: [{ required: true, pattern: /^1[34578]\d{9}$/, message: '请输入手机号' }],
                  validateTrigger: 'change',
                },
              ]"
            >
              <a-icon slot="prefix" type="user" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-form-item>
            <a-input-password
              size="large"
              placeholder="请输入密码"
              @blur="getPassword"
              v-decorator="[
                'user_password',
                { rules: [{ required: true, message: '请输入密码' }], validateTrigger: 'blur' },
              ]"
            >
              <a-icon slot="prefix" type="lock" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input-password>
          </a-form-item>
          <a-row :gutter="16">
            <a-col class="gutter-row" :span="16">
              <a-form-item>
                <a-input
                  size="large"
                  type="text"
                  placeholder="验证码"
                  @blur="getCode"
                  v-decorator="[
                    'captcha',
                    {
                      rules: [{ required: true, message: '请输入验证码' }],
                      validateTrigger: 'blur',
                    },
                  ]"
                >
                  <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }" />
                </a-input>
              </a-form-item>
            </a-col>
            <!-- 设置验证码 -->
            <a-col class="gutter-row" :span="8">
              <Canvas @click="draw" ref="canvas" id="canvas" width="100" style="height: 30px"></Canvas>
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane key="tab2" tab="手机号登录">
          <a-form-item>
            <a-input
              size="large"
              type="text"
              placeholder="手机号"
              v-decorator="[
                'mobile',
                {
                  rules: [{ required: true, pattern: /^1[34578]\d{9}$/, message: '请输入正确的手机号' }],
                  validateTrigger: 'change',
                },
              ]"
            >
              <a-icon slot="prefix" type="mobile" :style="{ color: 'rgba(0,0,0,.25)' }" />
            </a-input>
          </a-form-item>

          <a-row :gutter="16">
            <a-col class="gutter-row" :span="16">
              <a-form-item>
                <a-input
                  size="large"
                  type="text"
                  placeholder="验证码"
                  v-decorator="[
                    'code',
                    { rules: [{ required: true, message: '请输入验证码' }], validateTrigger: 'blur' },
                  ]"
                >
                  <a-icon slot="prefix" type="mail" :style="{ color: 'rgba(0,0,0,.25)' }" />
                </a-input>
              </a-form-item>
            </a-col>
            <a-col class="gutter-row" :span="8">
              <a-button
                class="getCaptcha"
                tabindex="-1"
                :disabled="state.smsSendBtn"
                @click.stop.prevent="getCaptcha"
                v-text="(!state.smsSendBtn && '获取验证码') || state.time + ' s'"
              ></a-button>
            </a-col>
          </a-row>
        </a-tab-pane>
      </a-tabs>

      <a-form-item>
        <a-checkbox v-model="checked">自动登录</a-checkbox>
        <!-- <router-link :to="{ name: 'recover', params: { user: 'aaa' } }" class="forge-password" style="float: right"
          >忘记密码</router-link
        > -->
      </a-form-item>

      <a-form-item style="margin-top: 24px">
        <a-button
          size="large"
          type="primary"
          htmlType="submit"
          class="login-button"
          :loading="state.loginBtn"
          :disabled="state.loginBtn"
          >确定</a-button
        >
      </a-form-item>

      <div class="user-login-other">
        <!-- <span>其他登录方式</span>
        <a>
          <a-icon class="item-icon" type="alipay-circle"></a-icon>
        </a>
        <a>
          <a-icon class="item-icon" type="taobao-circle"></a-icon>
        </a>
        <a>
          <a-icon class="item-icon" type="weibo-circle"></a-icon>
        </a> -->
        <!-- <router-link class="register" :to="{ name: 'register' }">注册账户</router-link> -->
      </div>
    </a-form>

    <two-step-captcha
      v-if="requiredTwoStepCaptcha"
      :visible="stepCaptchaVisible"
      @success="stepCaptchaSuccess"
      @cancel="stepCaptchaCancel"
    ></two-step-captcha>
  </div>
</template>

<script>
import md5 from 'md5'
import TwoStepCaptcha from '@/components/tools/TwoStepCaptcha'
import { mapActions } from 'vuex'
import { timeFix } from '@/utils/util'
import { getSmsCaptcha, get2step,login } from '@/api/login'

export default {
  components: {
    TwoStepCaptcha,
  },
  data() {
    return {
      customActiveKey: 'tab1',
      loginBtn: false,
      // login type: 0 email, 1 username, 2 telephone
      loginType: 0,
      code: '',
      phone: '',
      password: '',
      isLoginError: false,
      requiredTwoStepCaptcha: false,
      stepCaptchaVisible: false,
      checked: true,
      form: this.$form.createForm(this),
      state: {
        time: 60,
        loginBtn: false,
        // login type: 0 email, 1 username, 2 telephone
        loginType: 0,
        smsSendBtn: false,
      },
    }
  },
  mounted() {
    this.draw()
  },
  created() {
    get2step({})
      .then((res) => {
        this.requiredTwoStepCaptcha = res.result.stepCode
      })
      .catch(() => {
        this.requiredTwoStepCaptcha = false
      })
    // this.requiredTwoStepCaptcha = true
  },
  methods: {
    randomColor() {
      //得到随机的颜色值
      var r = Math.floor(Math.random() * 256)
      var g = Math.floor(Math.random() * 256)
      var b = Math.floor(Math.random() * 256)
      return 'rgb(' + r + ',' + g + ',' + b + ')'
    },
    draw() {
      this.show_num = []
      var canvas_width = 100
      var canvas_height = 34

      var canvas = document.getElementById('canvas') //获取到canvas的对象，演员
      var context = canvas.getContext('2d') //获取到canvas画图的环境，演员表演的舞台
      canvas.width = canvas_width
      canvas.height = canvas_height
      var sCode = 'A,B,C,E,F,G,H,J,K,L,M,N,P,Q,R,S,T,W,X,Y,Z,1,2,3,4,5,6,7,8,9,0'
      var aCode = sCode.split(',')
      var aLength = aCode.length //获取到数组的长度

      for (var i = 0; i <= 3; i++) {
        var j = Math.floor(Math.random() * aLength) //获取到随机的索引值
        var deg = (Math.random() * 30 * Math.PI) / 180 //产生0~30之间的随机弧度
        var txt = aCode[j] //得到随机的一个内容
        this.show_num.push(txt.toLowerCase())
        var x = 10 + i * 20 //文字在canvas上的x坐标
        var y = 20 + Math.random() * 8 //文字在canvas上的y坐标
        context.font = 'bold 23px 微软雅黑'

        context.translate(x, y)
        context.rotate(deg)

        context.fillStyle = this.randomColor()
        context.fillText(txt, 0, 0)

        context.rotate(-deg)
        context.translate(-x, -y)
      }
      for (var a = 0; a <= 5; a++) {
        // 验证码上显示线条
        context.strokeStyle = this.randomColor()
        context.beginPath()
        context.moveTo(Math.random() * canvas_width, Math.random() * canvas_height)
        context.lineTo(Math.random() * canvas_width, Math.random() * canvas_height)
        context.stroke()
      }

      for (var b = 0; b <= 30; b++) {
        //验证码上显示小点
        context.strokeStyle = this.randomColor()
        context.beginPath()
        var c = Math.random() * canvas_width
        var d = Math.random() * canvas_height
        context.moveTo(c, d)
        context.lineTo(c + 1, d + 1)
        context.stroke()
      }
    },
    getCode() {
      this.code = this.form.getFieldValue('captcha')
    },
    getPhone() {
      this.phone = this.form.getFieldValue('user_phone')
    },
    getPassword() {
      this.password = this.form.getFieldValue('user_password')
    },
    ...mapActions(['Login', 'Logout']),
    // handler
    handleUsernameOrEmail(rule, value, callback) {
      const { state } = this
      const regex = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((\.[a-zA-Z0-9_-]{2,3}){1,2})$/
      if (regex.test(value)) {
        state.loginType = 0
      } else {
        state.loginType = 1
      }
      callback()
    },
    handleTabClick(key) {
      this.customActiveKey = key
      // this.form.resetFields()
    },
    handleSubmit(e) {
      e.preventDefault()
      var {
        form: { validateFields },
        state,
        customActiveKey,
        Login,
      } = this

      const validateFieldsKey =
        customActiveKey === 'tab1' ? ['user_phone', 'user_password', 'code'] : ['mobile', 'code']
      if (this.phone == null || this.phone == '') {
        this.$message.warning('请填写手机号!')
        return
      }
      if (this.password == null || this.password == '') {
        this.$message.warning('请填写密码!')
        return
      }
      var a = this.show_num[0]
      var e = a.toUpperCase()
      var b = this.show_num[1]
      var f = b.toUpperCase()
      var c = this.show_num[2]
      var g = c.toUpperCase()
      var d = this.show_num[3]
      var h = d.toUpperCase()
      var realysign = a + b + c + d
      var realysigntwo = e + f + g + h
      var sign = this.code
      if (!sign) {
        this.$message.warning('请填写验证码!')
        return
      }
      if (sign) {
        if (sign != realysign && sign != realysigntwo) {
          this.$message.warning('请输入正确验证码!')
          return
        }
      }
      validateFields(validateFieldsKey, { force: true }, (err, values) => {
        if (!err) {
          state.loginBtn = true
          console.log('login form', values)
          const loginParams = { ...values }
          loginParams.user_password = values.user_password
          if (!loginParams.user_phone) {
            loginParams.user_phone = values.mobile
          }

          login(loginParams)
            .then((res) => {
              console.log('xxxxxxxxxxx')
              console.log(res)

              if (res.result) {
                this.loginSuccess(res)
              } else {
                this.$message.warn(res.msg)
              }
            })
            .catch((err) => this.loginSuccess(err))
            .finally(() => {
              state.loginBtn = false
            })
        } else {
          setTimeout(() => {
            state.loginBtn = false
          }, 600)
        }
      })
    },
    getCaptcha(e) {
      e.preventDefault()
      const {
        form: { validateFields },
        state,
      } = this

      validateFields(['mobile'], { force: true }, (err, values) => {
        if (!err) {
          state.smsSendBtn = true

          const interval = window.setInterval(() => {
            if (state.time-- <= 0) {
              state.time = 60
              state.smsSendBtn = false
              window.clearInterval(interval)
            }
          }, 1000)

          const hide = this.$message.loading('验证码发送中..', 0)
          console.log('values.mobile', values.mobile)
          getSmsCaptcha({ user_phone: values.mobile })
            .then((res) => {
              setTimeout(hide, 2500)
            })
            .catch((err) => {
              setTimeout(hide, 1)
              clearInterval(interval)
              state.time = 60
              state.smsSendBtn = false
              this.requestFailed(err)
            })
        }
      })
    },
    stepCaptchaSuccess() {
      this.loginSuccess()
    },
    stepCaptchaCancel() {
      this.Logout().then(() => {
        this.loginBtn = false
        this.stepCaptchaVisible = false
      })
    },
    loginSuccess(res) {
      const that = this
      this.$store.state.admin = res.data
      console.log(res)
      if (res.data.rights) {
        this.$store.state.rights = res.data.rights
        window.localStorage.setItem('cailiaorights', res.data.cailiaorights)
        window.localStorage.setItem('rengongrights', res.data.rengongrights)
        window.localStorage.setItem('yonghurights', res.data.yonghurights)
        window.localStorage.setItem('rights', res.data.rights)
        window.localStorage.setItem('store', JSON.stringify(that.$store.state))

        window.localStorage.setItem('Access-Token', "23262827242022292f6a6c")

        console.log("xxxxx",this.$router)
        debugger
        this.$router.push({ name: 'index' })
          this.$notification.success({
            message: '欢迎',
            description: `${timeFix()}，欢迎回来`,
          })

        this.isLoginError = false
      } else {
        this.$message.warning('获取信息失败，请重新尝试!')
        this.isLoginError = false
      }
    },
    requestFailed(err) {
      this.isLoginError = true
      this.$notification['error']({
        message: '错误',
        description: ((err.response || {}).data || {}).message || '请求出现错误，请稍后再试',
        duration: 4,
      })
    },
  },
}
</script>

<style lang="less" scoped>
.user-layout-login {
  label {
    font-size: 14px;
  }

  .getCaptcha {
    display: block;
    width: 100%;
    height: 40px;
  }

  .forge-password {
    font-size: 14px;
  }

  button.login-button {
    padding: 0 15px;
    font-size: 16px;
    height: 40px;
    width: 100%;
  }

  .user-login-other {
    text-align: left;
    margin-top: 24px;
    line-height: 22px;

    .item-icon {
      font-size: 24px;
      color: rgba(0, 0, 0, 0.2);
      margin-left: 16px;
      vertical-align: middle;
      cursor: pointer;
      transition: color 0.3s;

      &:hover {
        color: #1890ff;
      }
    }

    .register {
      float: right;
    }
  }
}
</style>
