<template>
  <a-spin :spinning="spinning" size="large">
    <a-card
      ><a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-model-item label="材料50米搬运费">
          <a-input v-model="form.banyun" />
        </a-form-model-item>
        <a-form-model-item label="材料50米上楼费">
          <a-input v-model="form.shanglou" />
        </a-form-model-item>
        <a-form-model-item label="叫车50米搬运费">
          <a-input v-model="form.banyun2" />
        </a-form-model-item>
        <a-form-model-item label="叫车50米上楼费">
          <a-input v-model="form.shanglou2" />
        </a-form-model-item>
        <a-form-model-item label="任务押金设置">
          <a-input v-model="form.yajin" />
        </a-form-model-item>
        <a-form-model-item label="发送短信时间设置(min)">
          <a-input v-model="form.duanxing" />
        </a-form-model-item>
        <a-form-model-item label="自动确认完成天数">
          <a-input v-model="form.quxiaodingdan" />
        </a-form-model-item>
        <a-form-model-item label="需移交总经办折扣金额线">
          <a-input v-model="form.jinjie" />
        </a-form-model-item>
        <a-form-model-item label="预警值发送到的邮箱地址">
          <a-input v-model="form.email" />
        </a-form-model-item>
        <a-form-model-item label="签到范围(米)">
          <a-input v-model="form.qiandao" />
        </a-form-model-item>
        <a-form-model-item label="厂家直销满多少金额减运费">
          <a-input v-model="form.mianfei" />
        </a-form-model-item>
        <a-form-model-item label="非厂家直销商品满多少减运费">
          <a-input v-model="form.mianfei1" />
        </a-form-model-item>
        <a-form-model-item label="除固定地址以外的运费">
          <a-input v-model="form.mianfei2" />
        </a-form-model-item>
        <a-form-model-item label="订单下单之后多久取消(h)">
          <a-input v-model="form.mianfei3" />
        </a-form-model-item>
        <a-row>
          <a-col :span="8">
            <a-form-model-item label="城市一" style="margin-left: 80px">
              <a-input v-model="form.chengshiyi" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="运费：">
              <a-input-number v-model="form.yunfei1" :min="0" style="width: 200px" />
            </a-form-model-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="8">
            <a-form-model-item label="城市二" style="margin-left: 80px">
              <a-input v-model="form.chengshier" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="运费：">
              <a-input-number v-model="form.yunfei2" :min="0" style="width: 200px" />
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-row>
          <a-col :span="8">
            <a-form-model-item label="城市三" style="margin-left: 80px">
              <a-input v-model="form.chengshisan" />
            </a-form-model-item>
          </a-col>
          <a-col :span="8">
            <a-form-model-item label="运费：">
              <a-input-number v-model="form.yunfei3" :min="0" style="width: 200px" />
            </a-form-model-item>
          </a-col>
        </a-row>

        <a-form-model-item :wrapper-col="{ span: 14, offset: 4 }">
          <a-button type="primary" @click="onSubmit"> 保存 </a-button>
        </a-form-model-item>
      </a-form-model></a-card
    >
  </a-spin>
</template>
<script>
export default {
  data() {
    return {
      spinning: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      form: {
        banyun: '',
        shanglou: '',
        banyun2: '',
        shanglou2: '',
        yajin: '',
        duanxing: '',
        quxiaodingdan:'',
        jinjie: '',
        email: '',
        mianfei: '',
        mianfei1: '',
        mianfei2: '',
        mianfei3: '',
        qiandao: '',
        chengshiyi: '',
        chengshier: '',
        chengshisan: '',
        yunfei1: 0,
        yunfei2: 0,
        yunfei3: 0,
      },
    }
  },
  created() {
    this.spinning = true
    this.$request({
      url: '/user/selectAll',
      method: 'get',
      params: {
        table: 'shop_freight',
      },
    })
      .then((res) => {
        if (res.status == 200) {
          this.spinning = false
          console.log(res.data[15])
          this.form = {
            banyun: res.data[0]['shop_freight_menoy'],
            shanglou: res.data[1]['shop_freight_menoy'],
            banyun2: res.data[0]['shop_freight_classify'],
            shanglou2: res.data[1]['shop_freight_classify'],
            yajin: res.data[5]['shop_freight_menoy'],
            duanxing: res.data[12]['shop_freight_menoy'],
            quxiaodingdan:res.data[21]['shop_freight_menoy'],
            jinjie: res.data[13]['shop_freight_menoy'],
            email: res.data[14]['email'],
            mianfei: res.data[15]['shop_freight_menoy'],
            mianfei1: res.data[22]['shop_freight_menoy'],
            mianfei2: res.data[23]['shop_freight_menoy'],
            mianfei3: res.data[24]['shop_freight_menoy'],
            qiandao: res.data[20]['shop_freight_menoy'],
            chengshiyi: res.data[17]['shop_freight_explain'],
            chengshier: res.data[18]['shop_freight_explain'],
            chengshisan: res.data[19]['shop_freight_explain'],
            yunfei1: res.data[17]['shop_freight_menoy'],
            yunfei2: res.data[18]['shop_freight_menoy'],
            yunfei3: res.data[19]['shop_freight_menoy'],
          }
        }
      })
      .catch((res) => {
        that.spinning = false
        that.$message.error('抱歉,未知错误,请联系管理员!')
      })
  },
  methods: {
    onSubmit() {
      const that = this
      if (this.form.duanxing <= 0) {
        that.$message.warning('抱歉,短信发送间隔时间请大于1分钟!')
        return
      }
      if (this.form.email == null || this.form.email == '') {
        that.$message.warning('请填写邮箱地址!')
        return
      }
      var reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/
      if (!reg.test(this.form.email)) {
        that.$message.warning('邮箱格式不正确!')
        return
      }
      if (
        this.form.chengshiyi == null ||
        this.form.chengshiyi == '' ||
        this.form.chengshier == null ||
        this.form.chengshier == '' ||
        this.form.chengshisan == null ||
        this.form.chengshisan == ''
      ) {
        that.$message.warning('请填写运费计算相关城市!')
        return
      }
      this.spinning = true
      console.log('submit!', this.form)
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.banyun,
          shop_freight_id: 1,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.shanglou,
          shop_freight_id: 2,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.banyun2,
          shop_freight_id: 1,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.yajin,
          shop_freight_id: 6,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.duanxing,
          shop_freight_id: 13,
        },
      }).then((res) => {})
         this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.quxiaodingdan,
          shop_freight_id: 22,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.jinjie,
          shop_freight_id: 14,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'email',
          columnvalue: this.form.email,
          shop_freight_id: 15,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.mianfei,
          shop_freight_id: 16,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.mianfei1,
          shop_freight_id: 23,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.mianfei2,
          shop_freight_id: 24,
        },
      }).then((res) => {})
       this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.mianfei3,
          shop_freight_id: 25,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.qiandao,
          shop_freight_id: 21,
        },
      }).then((res) => {})

      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_explain',
          columnvalue: this.form.chengshiyi,
          shop_freight_id: 18,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_explain',
          columnvalue: this.form.chengshier,
          shop_freight_id: 19,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_explain',
          columnvalue: this.form.chengshisan,
          shop_freight_id: 20,
        },
      }).then((res) => {})

      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.yunfei1,
          shop_freight_id: 18,
        },
      }).then((res) => {})

      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.yunfei2,
          shop_freight_id: 19,
        },
      }).then((res) => {})

      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.yunfei3,
          shop_freight_id: 20,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.shanglou2,
          shop_freight_id: 2,
        },
      })
        .then((res) => {
          this.spinning = false
          this.$message.success('修改成功!')
        })
        .catch((res) => {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
  },
}
</script>
