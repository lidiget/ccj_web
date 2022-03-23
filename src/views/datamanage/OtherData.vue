<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 8px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
    <!-- 记录类型:
    <a-select
      style="width: 130px; margin-left: 8px; margin-right: 16px"
      show-search
      placeholder="订单状态"
      option-filter-prop="children"
      @change="onSearch"
      v-model="tabletype"
    >
      <a-select-option :value="1"> 开票记录 </a-select-option>
      <a-select-option :value="2"> 消费记录 </a-select-option>
    </a-select> -->
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
    >
      导出开票记录
    </a-button>
    <a-spin :spinning="spinning" size="large">
      <a-table
        ref="table"
        size="default"
        :columns="tabletype == 1 ? columns1 : columns2"
        :data-source="data"
        @change="handleTableChange"
        bordered
        :alert="false"
      >
        <template slot="invoice_record_status" slot-scope="text">
          <a-badge :status="text == '0' ? 'default' : text == '1' ? 'success' : 'error'" />
          {{ text == '0' ? '审核中' : text == '1' ? '已开票' : '已驳回' }}</template
        >
        <template slot="title">
          {{ tabletype == 1 ? '开票记录列表' : '消费记录列表' }}
        </template>
      </a-table>
    </a-spin>
  </a-card>
</template>

<script>
const columns1 = [
  {
    title: '开票编号',
    dataIndex: 'invoice_record_id',
    width: 120,
    sorter: true,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    sorter: true,
  },
  {
    title: '真实姓名',
    dataIndex: 'realname',
    sorter: true,
  },
  {
    title: '联系方式',
    dataIndex: 'user_phone',
    sorter: true,
  },
  {
    title: '订单总价',
    dataIndex: 'order_info_altogether',
    sorter: true,
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
const columns2 = [
  //钱包记录
  {
    title: '记录编号',
    dataIndex: 'wallet_record_id',
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
    title: '账户余额',
    dataIndex: 'walletmmoney',
  },
  {
    title: '生成备注',
    dataIndex: 'explains',
  },
  {
    title: '生成时间',
    dataIndex: 'wallet_record_creatime',
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
      columns2,
      tabletype: 1,
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
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出开票记录列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getRnvoiceRecordListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['开票编号', '用户名', '真实姓名', '联系方式', '订单总价', '开票状态', '开票时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.invoice_record_id == null ? '' : element.invoice_record_id,
                    element.username == null ? '' : element.username,
                    element.realname == null ? '' : element.realname,
                    element.user_phone == null ? '' : element.user_phone,
                    element.order_info_altogether == null ? '' : element.order_info_altogether,
                    element.invoice_record_status == null
                      ? ''
                      : element.invoice_record_status == '0'
                      ? '审核中'
                      : element.invoice_record_status == '1'
                      ? '已开票'
                      : '已驳回',
                    element.invoice_record_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.invoice_record_creatime)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '开票记录列表')
              }
            })
            .catch(function () {
              that.spinning = false
              that.$message.error('抱歉,未知错误,请联系管理员!')
            })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    onSearch() {
      const that = this
      that.getAllBrowseDataListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllBrowseDataListpage()
    },
    getAllBrowseDataListpage() {
      const that = this
      that.data = []
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      var url = ''
      if (that.tabletype == 1) {
        url = '/user/getRnvoiceRecordListpage'
      } else if (that.tabletype == 2) {
        url = '/user/getWalletRecordListpage'
      }
      that.spinning = true
      that
        .$request({
          url: url,
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
