<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 8px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-spin :spinning="spinning" size="large">
      <a-table
        ref="table"
        size="default"
        :columns="columns1"
        :data-source="data"
        bordered
        :alert="false"
      >
        <template slot="title"> 提现申请表 </template>
      </a-table>
    </a-spin>
  </a-card>
</template>

<script>
const columns1 = [
  {
    title: '开票编号',
    dataIndex: 'invoice_record_id',
    width: 100,
  },
  {
    title: '用户名',
    dataIndex: 'username',
  },
  {
    title: '真实姓名',
    dataIndex: 'realname',
  },
  {
    title: '开票状态',
    dataIndex: 'invoice_record_status',
    scopedSlots: { customRender: 'invoice_record_status' },
  },
  {
    title: '开票时间',
    dataIndex: 'invoice_record_creatime',
  },
]
export default {
  name: 'CommonUser',
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      columns1,
      tabletype: 2,
      spinning: false,
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllBrowseDataListpage()
  },
  methods: {
    onSearch() {
      const that = this
      that.getAllBrowseDataListpage()
    },
    getAllBrowseDataListpage() {
      const that = this
      that.data = []
      var formdate = {}
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      that.spinning = true
      that
        .$request({
          url: '/user/',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.data = res.data
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
.editable-add-btn {
  margin-bottom: 8px;
}
</style>
