<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 8px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
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
      导出交易记录列表
    </a-button>
    <a-spin :spinning="spinning" size="large">
      <a-table
        ref="table"
        size="default"
        :columns="columns1"
        @change="handleTableChange"
        :data-source="data"
        bordered
        :alert="false"
      >
        <template slot="createtime" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">相关订单</a>
          </template>
        </span>
        <template slot="title"> 订单后台收款记录 </template>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        title="订单详情"
        width="700px"
        :visible="visible"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visible = false
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-table :columns="detailColumns" :data-source="oderdetail" size="small">
              <template slot="order_info_voicsta" slot-scope="text">
                {{ text == 1 ? '已开票' : '未开票' }}
              </template>
              <template slot="order_info_status" slot-scope="text">
                <a-badge
                  :status="
                    text == 1
                      ? 'default'
                      : text == 2
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 4
                      ? 'success'
                      : 'error'
                  "
                />
                {{
                  text == 1 ? '待付款' : text == 2 ? '待发货' : text == 3 ? '待收货' : text == 4 ? '已完成' : '已取消'
                }}
              </template>
              <template slot="order_info_creatime" slot-scope="text">
                {{ text | dayjs }}
              </template>
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const columns1 = [
  {
    title: '记录编号',
    dataIndex: 'id',
    width: 120,
    sorter: true,
  },
  {
    title: '用户编号',
    sorter: true,
    dataIndex: 'user_id',
  },
  {
    title: '用户名',
    sorter: true,
    dataIndex: 'username',
  },
  {
    title: '真实姓名',
    sorter: true,
    dataIndex: 'realname',
  },
  {
    title: '联系方式',
    sorter: true,
    dataIndex: 'phone',
  },
  {
    title: '订单编号',
    sorter: true,
    dataIndex: 'order_info_id',
  },
  {
    title: '收款金额',
    sorter: true,
    dataIndex: 'totalprice',
  },
  {
    title: '收款时间',
    dataIndex: 'createtime',
    scopedSlots: { customRender: 'createtime' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
const detailColumns = [
  {
    title: '订单编号',
    dataIndex: 'order_info_ids',
  },
  {
    title: '收货名',
    dataIndex: 'harvest_name',
  },
  {
    title: '收货电话',
    dataIndex: 'harvest_phone',
  },
  {
    title: '优惠券额度',
    dataIndex: 'coupon_moeny',
  },

  {
    title: '总价',
    dataIndex: 'order_info_altogether',
  },

  {
    title: '支付金额',
    dataIndex: 'order_info_moneys',
  },

  {
    title: '下单时间',
    dataIndex: 'order_info_creatime',
    scopedSlots: { customRender: 'order_info_creatime' },
  },
  {
    title: '订单状态',
    dataIndex: 'order_info_status',
    scopedSlots: { customRender: 'order_info_status' },
  },
  {
    title: '开票状态',
    dataIndex: 'order_info_voicsta',
    scopedSlots: { customRender: 'order_info_voicsta' },
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
      oderdetail: [],
      columns1,
      detailColumns,
      visible: false,
      spinning: false,
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllCollectionRecordListpage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出订单后台收款记录列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllCollectionRecordListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '记录编号',
                    '用户编号',
                    '用户名',
                    '真实姓名',
                    '联系方式',
                    '订单编号',
                    '收款金额',
                    '收款时间',
                    '备注',
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.id == null ? '' : element.id,
                    element.user_id == null ? '' : element.user_id,
                    element.username == null ? '' : element.username,
                    element.realname == null ? '' : element.realname,
                    element.phone == null ? '' : element.phone,
                    element.order_info_id == null ? '' : element.order_info_id,
                    element.totalprice == null ? '' : element.totalprice,
                    element.createtime == null ? '' : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.createtime)),
                  ]
                  element.remark == null ? '' : element.remark, alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '订单后台收款记录列表')
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
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      var formdate = {}
      formdate.orderid = e.order_info_id
      that
        .$request({
          url: '/user/getAllOrderByuseridListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.oderdetail = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onSearch() {
      const that = this
      that.getAllCollectionRecordListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllCollectionRecordListpage()
    },
    getAllCollectionRecordListpage() {
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
      that.spinning = true
      that
        .$request({
          url: '/user/getAllCollectionRecordListpage',
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
