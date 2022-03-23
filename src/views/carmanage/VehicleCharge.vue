<template>
  <a-spin :spinning="spinning" size="large">
    <a-card title="车辆收费标准"
      ><a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-model-item label="无需搬运每公里运费">
          <a-input :maxLength="50" v-model="form.banyun" />
        </a-form-model-item>
        <a-form-model-item label="无电梯每层运费">
          <a-input :maxLength="50" v-model="form.shanglou" />
        </a-form-model-item>
        <a-form-model-item label="需要搬运每公里运费">
          <a-input :maxLength="50" v-model="form.banyun2" />
        </a-form-model-item>
        <a-form-model-item label="有电梯每层运费">
          <a-input :maxLength="50" v-model="form.shanglou2" />
        </a-form-model-item>
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
          this.form = {
            banyun: res.data[2]['shop_freight_menoy'],
            shanglou: res.data[3]['shop_freight_menoy'],
            banyun2: res.data[2]['shop_freight_classify'],
            shanglou2: res.data[3]['shop_freight_classify'],
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
      this.spinning = true
      console.log('submit!', this.form)
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.banyun,
          shop_freight_id: 3,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.shanglou,
          shop_freight_id: 4,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.banyun2,
          shop_freight_id: 3,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.shanglou2,
          shop_freight_id: 4,
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
