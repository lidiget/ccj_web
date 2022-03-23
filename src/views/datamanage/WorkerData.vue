<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 16px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
    任务状态:
    <a-select
      style="width: 130px; margin-left: 8px; margin-right: 16px"
      show-search
      placeholder="订单状态"
      option-filter-prop="children"
      allowClear
      v-model="orderstatus"
    >
      <a-select-option :value="1"> 待付款 </a-select-option>
      <a-select-option :value="2"> 待发货 </a-select-option>
      <a-select-option :value="3"> 待收货 </a-select-option>
      <a-select-option :value="4"> 待评价 </a-select-option>
      <a-select-option :value="5"> 已完成 </a-select-option>
      <a-select-option :value="9"> 已关闭 </a-select-option>
    </a-select>
    驾驶人员:
    <a-select
      style="width: 130px; margin-left: 8px"
      show-search
      placeholder="开车状态"
      option-filter-prop="children"
      allowClear
      v-model="status"
    >
      <a-select-option :value="1"> 默认 </a-select-option>
      <a-select-option :value="0"> 司机 </a-select-option>
    </a-select>
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
      导出任务流水记录
    </a-button>
    <a-spin :spinning="spinning" size="large">
      <a-table
        ref="table"
        size="default"
        :columns="columns"
        :data-source="data"
        bordered
        :alert="false"
        @change="handleTableChange"
      >
        <a-table
          :pagination="{ defaultPageSize: 999, hideOnSinglePage: true }"
          :columns="innerColumns"
          slot="expandedRowRender"
          slot-scope="data"
          :dataSource="data.groupItem"
          :rowKey="(item) => item.vehicle_info_id"
          :locale="{ emptyText: '暂无数据' }"
        >
          <template slot="worker_info_driver" slot-scope="text">{{ text == 1 ? '默认' : '司机' }}</template>
          <template slot="worker_info_payment" slot-scope="text">{{
            text == 'wxpay' ? '微信支付' : '余额'
          }}</template>
        </a-table>
        <template slot="worker_info_status" slot-scope="text">
          <a-badge
            :status="
              text == 1
                ? 'default'
                : text == 2
                ? 'warning'
                : text == 3
                ? 'warning'
                : text == 4
                ? 'processing'
                : text == 5
                ? 'success'
                : 'error'
            "
          />
          {{
            text == 1
              ? '待付款'
              : text == 2
              ? '待发货'
              : text == 3
              ? '待收货'
              : text == 4
              ? '待评价'
              : text == 5
              ? '已完成'
              : '已取消'
          }}
        </template>
        <template slot="title"> 任务流水列表 </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">查看详情</a>
          </template>
        </span>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        title="订单详情"
        width="700px"
        :visible="visible"
        :confirm-loading="confirmLoading"
        @cancel="handleCancel"
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-table :columns="detailColumns" :data-source="oderdetail" size="small">
              <template slot="worker_info_sta" slot-scope="text">{{ text == 1 ? '未完成' : '完成' }}</template>
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const detailColumns = [
  {
    title: '订单编号',
    dataIndex: 'worker_info_id',
  },
  {
    title: '工人名字',
    dataIndex: 'workername',
  },
  {
    title: '天数',
    dataIndex: 'worker_info_amount',
  },
  {
    title: '工人标题',
    dataIndex: 'worker_headline',
  },
  {
    title: '工人价格',
    dataIndex: 'worker_price',
  },
  {
    title: '用工时间',
    dataIndex: 'worker_info_issuetime',
  },
  {
    title: '状态',
    dataIndex: 'worker_info_sta',
    scopedSlots: { customRender: 'worker_info_sta' },
  },
]
const innerColumns = [
  {
    title: '收货地址',
    dataIndex: 'harvest_add',
  },
  {
    title: '收货详情',
    dataIndex: 'harvest_address',
  },
  {
    title: '是否为司机',
    dataIndex: 'worker_info_driver',
    scopedSlots: { customRender: 'worker_info_driver' },
  },
  {
    title: '支付方式',
    dataIndex: 'worker_info_payment',
    scopedSlots: { customRender: 'worker_info_payment' },
  },
  {
    title: '用工时间',
    dataIndex: 'worker_info_issuetime',
  },
]
const columns = [
  {
    title: '订单编号',
    width: 120,
    sorter: true,
    dataIndex: 'worker_info_id',
  },
  {
    title: '收货名',
    sorter: true,
    dataIndex: 'harvest_name',
  },
  {
    title: '收货电话',
    sorter: true,
    dataIndex: 'harvest_phone',
  },
  {
    title: '优惠券额度',
    sorter: true,
    dataIndex: 'coupon_moeny',
  },

  {
    title: '总价',
    sorter: true,
    dataIndex: 'worker_info_altogether',
  },

  {
    title: '支付金额',
    sorter: true,
    dataIndex: 'worker_info_moneys',
  },

  {
    title: '下单时间',
    dataIndex: 'worker_info_creatime',
  },
  {
    title: '订单状态',
    dataIndex: 'worker_info_status',
    scopedSlots: { customRender: 'worker_info_status' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'OrderListManager',
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      columns,
      innerColumns,
      detailColumns,
      visible: false,
      spinning: false,
      confirmLoading: false,
      changetype: 0,
      keywords: '',
      orderstatus: '',
      status: '',
      oderdetail: [],
      allDevice: [],
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllWorkerOrdersListpage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出任务流水列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllTaskFlowListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '订单编号',
                    '收货名',
                    '收货电话',
                    '优惠券额度',
                    '总价',
                    '支付金额',
                    '订单状态',
                    '收货地址',
                    '收货详情',
                    '是否为司机',
                    '支付方式',
                    '用工时间',
                    '下单时间',
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.worker_info_id == null ? '' : element.worker_info_id,
                    element.harvest_name == null ? '' : element.harvest_name,
                    element.harvest_phone == null ? '' : element.harvest_phone,
                    element.coupon_moeny == null ? '' : element.coupon_moeny,
                    element.worker_info_altogether == null ? '' : element.worker_info_altogether,
                    element.worker_info_moneys == null ? '' : element.worker_info_moneys,
                    element.worker_info_status == null
                      ? ''
                      : element.worker_info_status == 1
                      ? '待付款'
                      : element.worker_info_status == 2
                      ? '待发货'
                      : element.worker_info_status == 3
                      ? '待收货'
                      : element.worker_info_status == 4
                      ? '待评价'
                      : element.worker_info_status == 5
                      ? '已完成'
                      : '已取消',
                    element.harvest_add == null ? '' : element.harvest_add,
                    element.harvest_address == null ? '' : element.harvest_address,
                    element.worker_info_driver == null ? '' : element.worker_info_driver == 1 ? '默认' : '司机',
                    element.worker_info_payment == null
                      ? ''
                      : element.worker_info_payment == 'wxpay'
                      ? '微信支付'
                      : '余额',
                    element.worker_info_issuetime == null ? '' : element.worker_info_issuetime,
                    element.worker_info_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.worker_info_creatime)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '任务流水列表')
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
    changeorder(e) {
      const that = this
      this.$confirm({
        title:
          that.changetype == 3
            ? '是否确定发货?'
            : that.changetype == 4
            ? '是否确定已送达?'
            : that.changetype == 5
            ? '是否确定强制完成订单?'
            : '是否确定取消该订单?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.id = e.worker_info_id
          formdate.type = that.changetype
          that.spinning = true
          this.$request({
            url: '/user/changeWorkerOrderStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.getAllWorkerOrdersListpage()
                that.$message.success('改变订单状态成功!')
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
    handleCancel() {
      const that = this
      that.visible = false
    },
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      that.ifaddcommomuserdata = false
      var formdate = {}
      formdate.id = e.worker_info_id
      this.$request({
        url: '/user/getWorkderOrdersAllDetailsDataById',
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
      that.getAllWorkerOrdersListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllWorkerOrdersListpage()
    },
    getAllWorkerOrdersListpage() {
      const that = this
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      if (that.status != '' && that.status != null) {
        formdate.status = that.status
      }
      if (that.orderstatus != '' && that.orderstatus != null) {
        formdate.orderstatus = that.orderstatus
      }

      that.spinning = true
      that
        .$request({
          url: '/user/getAllTaskFlowListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              var groupItem = []
              groupItem.push({
                vehicle_info_id: element.vehicle_info_id,
                harvest_address: element.harvest_address,
                harvest_add: element.harvest_add,
                order_info_deliverycretime: element.order_info_deliverycretime,
                worker_info_payment: element.worker_info_payment,
                warehousename: element.warehousename,
              })
              element.groupItem = groupItem
            })
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
th.column-money,
td.column-money {
  text-align: right !important;
}
.editable-add-btn {
  margin-bottom: 8px;
}
.edit {
  width: 368px;
  margin: 0 auto;
  margin-left: 8px;
  margin-right: 8px;
}
</style>
