<template>
  <a-spin :spinning="spinning" size="large">
    <a-card
      ><a-form-model :model="form" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-model-item label="普通用户—v1积分设置">
          <a-input v-model="form.putongv1" />
        </a-form-model-item>
        <a-form-model-item label="v1—v2积分设置">
          <a-input v-model="form.v1v2" />
        </a-form-model-item>
        <a-form-model-item label="v2—v3积分设置">
          <a-input v-model="form.v2v3" />
        </a-form-model-item>
        <a-form-model-item label="v3—v4积分设置">
          <a-input v-model="form.v3v4" />
        </a-form-model-item>
        <a-form-model-item label="v4—v5积分设置">
          <a-input v-model="form.v4v5" />
        </a-form-model-item>
        <a-form-model-item label="v4—v5积分设置">
          <a-input v-model="form.v5v6" />
        </a-form-model-item>
        <a-form-model-item label="普通用户折扣(%)">
          <a-input v-model="form.zhekou" />
        </a-form-model-item>
        <a-form-model-item label="会员v1用户折扣(%)">
          <a-input v-model="form.zhekou1" />
        </a-form-model-item>
        <a-form-model-item label="会员v2用户折扣(%)">
          <a-input v-model="form.zhekou2" />
        </a-form-model-item>
        <a-form-model-item label="会员v3用户折扣(%)">
          <a-input v-model="form.zhekou3" />
        </a-form-model-item>
        <a-form-model-item label="会员v4用户折扣(%)">
          <a-input v-model="form.zhekou4" />
        </a-form-model-item>
        <a-form-model-item label="会员v5用户折扣(%)">
          <a-input v-model="form.zhekou5" />
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
        putongv1: '',
        zhekou: '',
        v1v2: '',
        zhekou1: '',
        v2v3: '',
        zhekou2: '',
        v3v4: '',
        zhekou3: '',
        v4v5: '',
        zhekou4: '',
        v5v6: '',
        zhekou5: '',
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
            putongv1: res.data[6]['shop_freight_menoy'],
            zhekou: res.data[6]['shop_freight_classify'],
            v1v2: res.data[7]['shop_freight_menoy'],
            zhekou1: res.data[7]['shop_freight_classify'],
            v2v3: res.data[8]['shop_freight_menoy'],
            zhekou2: res.data[8]['shop_freight_classify'],
            v3v4: res.data[9]['shop_freight_menoy'],
            zhekou3: res.data[9]['shop_freight_classify'],
            v4v5: res.data[10]['shop_freight_menoy'],
            zhekou4: res.data[10]['shop_freight_classify'],
            v5v6: res.data[11]['shop_freight_menoy'],
            zhekou5: res.data[11]['shop_freight_classify'],
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
      var one = this.form.putongv1
      var two = this.form.v1v2
      var three = this.form.v2v3
      var four = this.form.v3v4
      var five = this.form.v4v5
      var six = this.form.v5v6

      var aa = this.form.zhekou
      var bb = this.form.zhekou1
      var cc = this.form.zhekou2
      var dd = this.form.zhekou3
      var ee = this.form.zhekou4
      var ff = this.form.zhekou5
      if (one > two) {
        this.$message.warning('请检查金额大小,只能递增!')
        return
      }
      if (two > three) {
        this.$message.warning('请检查金额大小,只能递增!')
        return
      }
      if (three > four) {
        this.$message.warning('请检查金额大小,只能递增!')
        return
      }
      if (four > five) {
        this.$message.warning('请检查金额大小,只能递增!')
        return
      }
      if (five > six) {
        this.$message.warning('请检查金额大小,只能递增!')
        return
      }
      if (aa < bb) {
        this.$message.warning('请检查折扣大小,只能递减少!')
        return
      }
      if (bb < cc) {
        this.$message.warning('请检查折扣大小,只能递减少!')
        return
      }
      if (cc < dd) {
        this.$message.warning('请检查折扣大小,只能递减少!')
        return
      }
      if (dd < ee) {
        this.$message.warning('请检查折扣大小,只能递减少!')
        return
      }
      if (ee < ff) {
        this.$message.warning('请检查折扣大小,只能递减少!')
        return
      }
      this.spinning = true
      console.log('submit!', this.form)
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.zhekou,
          shop_freight_id: 7,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.zhekou1,
          shop_freight_id: 8,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.zhekou2,
          shop_freight_id: 9,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.zhekou3,
          shop_freight_id: 10,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.zhekou4,
          shop_freight_id: 11,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_classify',
          columnvalue: this.form.zhekou5,
          shop_freight_id: 12,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.putongv1,
          shop_freight_id: 7,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.v1v2,
          shop_freight_id: 8,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.v2v3,
          shop_freight_id: 9,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.v3v4,
          shop_freight_id: 10,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.v4v5,
          shop_freight_id: 11,
        },
      }).then((res) => {})
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.form.v5v6,
          shop_freight_id: 12,
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
