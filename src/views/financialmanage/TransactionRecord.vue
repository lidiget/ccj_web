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
        :columns="tabletype == 1 ? columns1 : columns2"
        :data-source="data"
        @change="handleTableChange"
        bordered
        :alert="false"
      >
        <template slot="invoice_record_status" slot-scope="text">
          <a-badge :status="text == '0' ? 'warning' : text == '1' ? 'processing' : 'error'" />
          {{ text == '0' ? '审核中' : text == '1' ? '已完成' : '未通过' }}</template
        >
        <template slot="type" slot-scope="text"> {{ text == '1' ? '收入' : '支出' }}</template>
        <template slot="create_time" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <span slot="action" slot-scope="text, record">
          <template v-if="record.attach.order_info_id">
            <a @click="handleEdit(record)">材料订单</a>
          </template>
          <template v-if="record.attach.worker_info_id">
            <a @click="handleEditrengong(record)">工人订单</a>
          </template>
          <template v-if="record.attach.task_info_id">
            <a @click="handleEditrenwu(record)">任务订单</a>
          </template>
          <template v-if="record.attach.wallet_balance">
            <a @click="handleEditchongzhi(record)">充值记录</a>
          </template>
          <template v-if="record.attach.vehicle_info_id">
            <a @click="handleEditjiaoche(record)">叫车订单</a>
          </template>
        </span>
        <template slot="title">
          {{ tabletype == 1 ? '开票记录列表' : '交易记录列表' }}
        </template>
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
            <a-table
              :columns="
                showcolumns == 0
                  ? detailColumns //材料订单
                  : showcolumns == 1
                  ? chongzhiColumns //充值订单
                  : showcolumns == 2
                  ? renwuColumns //任务订单
                  : showcolumns == 3
                  ? gongrenColumns //人工订单
                  : jiaocheColumns
              "
              :data-source="oderdetail"
              size="small"
            >
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
              <template slot="task_info_receivtime" slot-scope="text">
                {{ text | dayjs }}
              </template>
              <template slot="task_info_creatime" slot-scope="text">
                {{ text | dayjs }}
              </template>
              <template slot="task_info_status" slot-scope="text">
                <a-badge
                  :status="
                    text == 1
                      ? 'default'
                      : text == 2
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 4
                      ? 'warning'
                      : text == 5
                      ? 'success'
                      : 'error'
                  "
                />
                {{
                  text == 1
                    ? '待付款'
                    : text == 2
                    ? '已支付'
                    : text == 3
                    ? '已接取'
                    : text == 4
                    ? '确认接单'
                    : text == 5
                    ? '已完成'
                    : '已取消'
                }}</template
              >
              <template slot="worker_info_status" slot-scope="text">
                <a-badge
                  :status="
                    text == 1
                      ? 'default'
                      : text == 2
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 4
                      ? 'warning'
                      : text == 5
                      ? 'success'
                      : 'error'
                  "
                />
                {{
                  text == 1
                    ? '待付款'
                    : text == 2
                    ? '已支付'
                    : text == 3
                    ? '已接取'
                    : text == 4
                    ? '确认接单'
                    : text == 5
                    ? '已完成'
                    : '已取消'
                }}
              </template>
              <template slot="worker_info_dianhua" slot-scope="text">
                {{ text == 0 ? '未通知' : '已通知' }}
              </template>
              <template slot="vehicle_info_creatine" slot-scope="text">
                {{ text | dayjs }}
              </template>
              <template slot="vehicle_info_status" slot-scope="text">
                <a-badge
                  :status="
                    text == 1
                      ? 'default'
                      : text == 2
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 4
                      ? 'warning'
                      : text == 5
                      ? 'success'
                      : 'error'
                  "
                />
                {{
                  text == 1
                    ? '待付款'
                    : text == 2
                    ? '已支付'
                    : text == 3
                    ? '已接取'
                    : text == 4
                    ? '确认接单'
                    : text == 5
                    ? '已完成'
                    : '已取消'
                }}
              </template>
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const jiaocheColumns = [
  {
    title: '订单编号',
    dataIndex: 'vehicle_info_ids',
  },
  {
    title: '车辆名字',
    dataIndex: 'cartypename',
  },
  {
    title: '车辆载重',
    dataIndex: 'carzaizhong',
  },
  {
    title: '起步价',
    dataIndex: 'carstartprice',
  },

  {
    title: '车辆规格',
    dataIndex: 'carguige',
  },

  {
    title: '预计金额',
    dataIndex: 'vehicle_info_predict',
  },
  {
    title: '实付金额',
    dataIndex: 'vehicle_info_moneys',
  },
  {
    title: '创建时间',
    dataIndex: 'vehicle_info_creatine',
    scopedSlots: { customRender: 'vehicle_info_creatine' },
  },
  {
    title: '订单状态',
    dataIndex: 'vehicle_info_status',
    scopedSlots: { customRender: 'vehicle_info_status' },
  },
]
const gongrenColumns = [
  {
    title: '订单编号',
    dataIndex: 'worker_info_ids',
  },
  {
    title: '收货人',
    dataIndex: 'harvest_name',
  },
  {
    title: '电话',
    dataIndex: 'harvest_phone',
  },
  {
    title: '地址',
    dataIndex: 'harvest_add',
  },
  {
    title: '详细地址',
    dataIndex: 'harvest_address',
  },
  {
    title: '优惠金额',
    dataIndex: 'coupon_moeny',
  },
  {
    title: '总金额',
    dataIndex: 'worker_info_altogether',
  },
  {
    title: '状态',
    dataIndex: 'worker_info_status',
    scopedSlots: { customRender: 'worker_info_status' },
  },
]
const renwuColumns = [
  {
    title: '任务编号',
    width: 120,
    dataIndex: 'task_info_id',
  },
  {
    title: '工人姓名',
    dataIndex: 'workername',
  },
  {
    title: '工种',
    dataIndex: 'worker_two_name',
  },
  {
    title: '任务类型',
    dataIndex: 'task_info_type',
  },
  {
    title: '城市',
    dataIndex: 'task_info_city',
  },

  {
    title: '薪酬(元)',
    dataIndex: 'task_info_specification',
  },
  {
    title: '接单时间',
    dataIndex: 'task_info_receivtime',
    scopedSlots: { customRender: 'task_info_receivtime' },
  },

  {
    title: '创建时间',
    dataIndex: 'task_info_creatime',
    scopedSlots: { customRender: 'task_info_creatime' },
  },
  {
    title: '押金',
    dataIndex: 'task_info_yajin',
  },
  {
    title: '接单状态',
    dataIndex: 'task_info_status',
    scopedSlots: { customRender: 'task_info_status' },
  },
]
const chongzhiColumns = [
  {
    title: '用户编号',
    dataIndex: 'user_id',
  },
  {
    title: '用户名',
    dataIndex: 'user_name',
  },
  {
    title: '联系方式',
    dataIndex: 'user_phone',
  },
  {
    title: '账户金额',
    dataIndex: 'wallet_balance',
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
const columns1 = [
  {
    title: '开票编号',
    dataIndex: 'invoice_record_id',
    width: 120,
    sorter: true,
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
    title: '编号',
    dataIndex: 'trade_id',
    width: 120,
    sorter: true,
  },
  {
    title: '记录编号',
    dataIndex: 'out_trade_no',
    width: 180,
  },
  {
    title: '交易金额',
    sorter: true,
    dataIndex: 'money',
  },
  {
    title: '交易类型',
    dataIndex: 'type',
    scopedSlots: { customRender: 'type' },
  },
  {
    title: '交易明细',
    dataIndex: 'trade_explain',
  },
  {
    title: '交易时间',
    dataIndex: 'create_time',
    scopedSlots: { customRender: 'create_time' },
  },
  {
    title: '查看详情',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
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
      gongrenColumns,
      chongzhiColumns,
      renwuColumns,
      jiaocheColumns,
      detailColumns,
      showcolumns: 0,
      tabletype: 2,
      visible: false,
      spinning: false,
      oderdetail: [],
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
        title: '是否确定导出交易记录列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getWalletRecordListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['编号', '记录编号', '交易金额', '交易类型', '交易明细', '交易时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.trade_id == null ? '' : element.trade_id,
                    element.out_trade_no == null ? '' : element.out_trade_no,
                    element.money == null ? '' : element.money,
                    element.type == null ? '' : element.type == '1' ? '收入' : '支出',
                    element.trade_explain == null ? '' : element.trade_explain,
                    element.create_time == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.create_time)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '交易记录列表')
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
    handleEditjiaoche(e) {
      const that = this
      that.spinning = true
      that.visible = true
      that.showcolumns = 4
      var formdate = {}
      formdate.ids = e.out_trade_no
      that
        .$request({
          url: '/user/getAllVehicleOrdersListpage',
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
    handleEditrengong(e) {
      const that = this
      that.spinning = true
      that.visible = true
      that.showcolumns = 3
      var formdate = {}
      formdate.ids = e.out_trade_no
      that
        .$request({
          url: '/user/getWorkOrdersDataByIdListPage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              element.worker_info_status = Number(element.worker_info_status)
            })
            that.oderdetail = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleEditrenwu(e) {
      const that = this
      that.spinning = true
      that.visible = true
      that.showcolumns = 2
      var formdate = {}
      formdate.ids = e.out_trade_no
      that
        .$request({
          url: '/user/getAllTakeListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              element.task_info_status = Number(element.task_info_status)
            })
            that.oderdetail = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleEditchongzhi(e) {
      const that = this
      that.showcolumns = 1
      that.spinning = true
      that.visible = true
      var formdate = {}
      formdate.userid = e.attach.user_id
      that
        .$request({
          url: '/user/getAllCommonUsersDataListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            if (res.data.length > 0) {
              res.data[0].wallet_balance = e.attach.wallet_balance
              that.oderdetail = res.data
            } else {
              that.oderdetail = []
            }
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      var formdate = {}
      formdate.ids = e.out_trade_no
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
            res.data.forEach((item) => {
              item.attach = eval('(' + item.attach + ')')
            })
            that.data = res.data
            console.log(that.data)
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
