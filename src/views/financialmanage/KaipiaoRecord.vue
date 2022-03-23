<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 16px; margin-left: 16px; width: 272px; margin-bottom: 16px"
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
      导出开票审核信息
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
          :rowKey="(item) => item.order_info_id"
          :locale="{ emptyText: '暂无数据' }"
        >
          <template slot="order_info_payment" slot-scope="text">{{ text == 'wxpay' ? '微信支付' : '余额' }}</template>
        </a-table>
        <template slot="order_info_voicsta" slot-scope="text">
          <a-badge :status="text == 1 ? 'default' : text == 2 ? 'success' : 'error'" />
          {{ text == 1 ? '审核中' : text == 2 ? '已开票' : '已驳回' }}
        </template>
        <template slot="order_info_status" slot-scope="text">
          <!-- <a-badge
            :status="
              text == 1 ? 'default' : text == 2 ? 'warning' : text == 3 ? 'warning' : text == 4 ? 'success' : 'error'
            "
          /> -->
          {{ text == 1 ? '待付款' : text == 2 ? '待发货' : text == 3 ? '待收货' : text == 4 ? '已完成' : '已取消' }}
        </template>
        <template slot="order_info_creatime" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <template slot="title"> 订单审核开票列表 </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="kaipiaodetail(record)">开票详情</a>
            <a-divider
              type="vertical"
              v-if="$store.state.rights[10].children[3].children[0].edit == 1 && record.order_info_voicsta == 1"
            />
          </template>
          <a-dropdown
            v-if="$store.state.rights[10].children[3].children[0].edit == 1 && record.order_info_voicsta == 1"
          >
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a href="javascript:;" @click="changekaipiao(record, (changetype = 9))">审核开票</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="changekaipiao1(record, (changetype = 10))">驳货审核</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
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
            <a-table :columns="detailColumns" :data-source="oderdetail" size="small" />
          </a-spin>
        </p>
      </a-modal>
    </div>
    <div>
      <a-modal
        title="驳回备注"
        :visible="visiblebohui"
        :confirm-loading="false"
        okText="保存"
        @ok="handleOkbohui"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.visiblebohui = false
            this.bohuidata = {}
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <p>
          <a-form-item label="驳回备注:">
            <a-input
              size="large"
              type="text"
              :maxLength="200"
              style="width: 300px"
              placeholder="驳回备注"
              v-model="bohuidata.remark"
            ></a-input>
          </a-form-item>
        </p>
      </a-modal>
    </div>
    <div>
      <a-modal
        title="开票详情"
        width="700px"
        :visible="visiblekaipiao"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visiblekaipiao = false
            this.kaipiaodetails = []
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-table :columns="kaipiaoColumns" :data-source="kaipiaodetails" size="small">
              <template slot="invoice_info_creatime" slot-scope="text">
                {{ text | dayjs }}
              </template>
              <template slot="invoice_info_type" slot-scope="text">
                {{ text == 0 ? '普票' : '专票' }}
              </template>
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const kaipiaoColumns = [
  {
    title: '开票信息编号',

    dataIndex: 'invoice_info_id',
  },
  {
    title: '票据类型',
    dataIndex: 'invoice_info_type',
    scopedSlots: { customRender: 'invoice_info_type' },
  },
  {
    title: '单位名称',
    dataIndex: 'invoice_info_name',
  },
  {
    title: '纳税人识别号',
    dataIndex: 'invoice_info_number',
  },
  {
    title: '注册地址',
    dataIndex: 'invoice_info_address',
  },
  {
    title: '开户行',
    dataIndex: 'invoice_info_bank',
  },
  {
    title: '银行账户',
    dataIndex: 'invoice_info_banknumber',
  },
  {
    title: '创建时间',
    dataIndex: 'invoice_info_creatime',
    scopedSlots: { customRender: 'invoice_info_creatime' },
  },
]
const detailColumns = [
  {
    title: '订单编号',

    dataIndex: 'order_info_id',
  },
  {
    title: '商品名称',
    dataIndex: 'shop_goods_name',
  },
  {
    title: '商品数量',
    dataIndex: 'order_info_amount',
  },
  {
    title: '规格名称',
    dataIndex: 'shop_specification_name',
  },
  {
    title: '规格价格',
    dataIndex: 'shop_specification_price',
  },
  {
    title: '总价',
    dataIndex: 'order_detail_altogether',
  },
]
const innerColumns = [
  // {
  //   title: '仓库',
  //   dataIndex: 'warehousename',
  // },
  {
    title: '收货地址',
    dataIndex: 'harvest_add',
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
    title: '支付金额',
    sorter: true,
    dataIndex: 'order_info_moneys',
  },
  {
    title: '折扣金额',
    sorter: true,
    dataIndex: 'discount',
  },
  {
    title: '收货详情',
    dataIndex: 'harvest_address',
  },
  {
    title: '支付方式',
    dataIndex: 'order_info_payment',
    scopedSlots: { customRender: 'order_info_payment' },
  },
  {
    title: '楼层(层)',
    dataIndex: 'order_info_floor',
  },
  {
    title: '距离(KM)',
    dataIndex: 'order_info_distance',
  },
  {
    title: '电梯',
    dataIndex: 'order_info_elevator',
  },
  {
    title: '户型',
    dataIndex: 'order_info_house',
  },
  {
    title: '留言',
    dataIndex: 'order_info_word',
  },
  {
    title: '送达时间',
    dataIndex: 'order_info_deliverycretime',
  },
]
const columns = [
  {
    title: '订单编号',
    width: 120,
    sorter: true,
    dataIndex: 'order_info_id',
  },
  {
    title: '订单号',
    sorter: true,
    dataIndex: 'order_info_ids',
  },
  {
    title: '收货名',
    sorter: true,
    dataIndex: 'harvest_name',
  },

  {
    title: '总价',
    sorter: true,
    dataIndex: 'order_info_altogether',
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
  {
    title: '操作',
    width: 120,
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
      visiblefukuan: false,
      visiblezhekou: false,
      shenhejieguo: false,
      spinning: false,
      visiblekaipiao: false,
      kaipiaodetails: [],
      kaipiaoColumns,
      confirmLoading: false,
      changetype: 0,
      keywords: '',
      ordertype: 2,
      orderstatus: '',
      status: '',
      invoice_info_id: '',
      shoukuandata: {},
      zhekoudata: {},
      oneorderdata: {},
      oneshenqingdata: {},
      thisdata: {},
      oderdetail: [],
      alluserorderids: [],
      allDevice: [],
      visiblebohui: false,
      bohuidata: {},
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllUserOrderIds()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出开票审核列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          var aa = ''
          aa = that.alluserorderids.join(',')
          formdate.allids = aa
          formdate.yonghudingdan = 1
          formdate.shenhe = '1'
          this.$request({
            url: '/user/getAllOrderListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '订单编号',
                    '订单号',
                    '收货名',
                    '总价',
                    '下单时间',
                    '订单状态',
                    '开票状态',
                    '收货地址',
                    '收货电话',
                    '优惠券额度',
                    '支付金额',
                    '折扣金额',
                    '收货详情',
                    '支付方式',
                    '楼层(层)',
                    '距离(KM)',
                    '电梯',
                    '户型',
                    '留言',
                    '送达时间',
                  ],
                ]
                console.log('dsdsds')
                console.log(res.data)
                res.data.forEach((element) => {
                  var onedata = [
                    element.order_info_id == null ? '' : element.order_info_id,
                    element.order_info_ids == null ? '' : element.order_info_ids,
                    element.harvest_name == null ? '' : element.harvest_name,
                    element.order_info_altogether == null ? '' : element.order_info_altogether,

                    element.order_info_creatime == null ? '' : element.order_info_creatime,

                    element.order_info_status == null
                      ? ''
                      : element.order_info_status == 1
                      ? '待付款'
                      : element.order_info_status == 2
                      ? '待发货'
                      : element.order_info_status == 3
                      ? '待收货'
                      : element.order_info_status == 4
                      ? '已完成'
                      : '已取消',
                    element.order_info_voicsta == null
                      ? ''
                      : element.order_info_voicsta == 1
                      ? '审核中'
                      : element.order_info_voicsta == 2
                      ? '已开票'
                      : '已驳回',
                    element.harvest_add == null ? '' : element.harvest_add,
                    element.harvest_phone == null ? '' : element.harvest_phone,
                    element.coupon_moeny == null ? '' : element.coupon_moeny,
                    element.order_info_moneys == null ? '' : element.order_info_moneys,
                    element.discount == null ? '' : element.discount,
                    element.harvest_address == null ? '' : element.harvest_address,
                    element.order_info_payment == null
                      ? ''
                      : element.order_info_payment == 'wxpay'
                      ? '微信支付'
                      : '余额',
                    element.order_info_floor == null ? '' : element.order_info_floor,
                    element.order_info_distance == null ? '' : element.order_info_distance,
                    element.order_info_elevator == null ? '' : element.order_info_elevator,
                    element.order_info_house == null ? '' : element.order_info_house,
                    element.order_info_word == null ? '' : element.order_info_word,
                    element.order_info_deliverycretime == null ? '' : element.order_info_deliverycretime,
                  ]
                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '开票审核记录列表')
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
    kaipiaodetail(e) {
      const that = this
      that.visiblekaipiao = true
      that.spinning = true
      var formdate = {}
      formdate.id = e.invoice_info_id
      that
        .$request({
          url: '/user/getAllKaiPiaoDetailsListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.kaipiaodetails = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleOkbohui() {
      const that = this
      if (that.bohuidata.remark == '' || that.bohuidata.remark == null) {
        that.$message.warning('请输入驳回理由!')
        return
      }
      this.$confirm({
        title: '是否确定驳回审核?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.invoice_info_id = that.invoice_info_id
          formdate.id = that.thisdata.order_info_id
          formdate.bills_type = 'KaipiaoRecord'
          formdate.reason = that.bohuidata.remark
          formdate.myid = that.$store.state.admin.user_id
          formdate.jieguo = '驳回'
          formdate.type = 3
          that.spinning = true
          this.$request({
            url: '/user/changeOrderkaipiaoStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.thisdata = {}
                that.bohuidata = {}
                that.invoice_info_id = ''
                that.spinning = false
                that.visiblebohui = false
                that.getAllOrdersListpage()
                that.$message.success('成功!')
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
    shenhebohui() {
      const that = this
      that.visiblebohui = true
      that.bohuidata = {}
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllUserOrderIds()
    },
    getAllUserOrderIds() {
      const that = this
      that.spinning = true
      that.alluserorderids = []
      that
        .$request({
          url: '/user/getAllUserOrderIds',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              that.alluserorderids.push(element.order_info_id)
            })
            that.data = res.data
            that.getAllOrdersListpage()
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },

    changekaipiao1(e) {
      const that = this
      that.thisdata = e
      that.invoice_info_id = e.invoice_info_id
      that.visiblebohui = true
    },
    changekaipiao(e) {
      console.log(e)
      const that = this
      this.$confirm({
        title: that.changetype == 9 ? '是否确定开票?' : that.changetype == 10 ? '是否确定驳回审核?' : '?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.invoice_info_id = e.invoice_info_id
          formdate.id = e.order_info_id
          formdate.bills_type = 'KaipiaoRecord'
          formdate.myid = that.$store.state.admin.user_id
          if (that.changetype == 9) {
            formdate.type = 2
            formdate.jieguo = '通过'
          } else {
            formdate.type = 3
            formdate.jieguo = '驳回'
          }
          that.spinning = true
          this.$request({
            url: '/user/changeOrderkaipiaoStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.getAllOrdersListpage()
                that.$message.success('成功!')
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
      var formdate = {}
      formdate.id = e.order_info_id
      this.$request({
        url: '/user/getOrdersAllDetailsDataById',
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
      that.getAllOrdersListpage()
    },
    getAllOrdersListpage() {
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
      var aa = ''
      aa = that.alluserorderids.join(',')
      formdate.allids = aa
      formdate.yonghudingdan = 1
      formdate.shenhe = '1'
      that.spinning = true
      that
        .$request({
          url: '/user/getAllOrderListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              var groupItem = []
              groupItem.push({
                order_info_id: element.order_info_id,
                harvest_address: element.harvest_address,
                harvest_add: element.harvest_add,
                order_info_deliverycretime: element.order_info_deliverycretime,
                order_info_distance: element.order_info_distance,
                order_info_floor: element.order_info_floor,
                order_info_house: element.order_info_house,
                order_info_word: element.order_info_word,
                order_info_payment: element.order_info_payment,
                warehousename: element.warehousename,
                order_info_elevator: element.order_info_elevator,
                harvest_phone: element.harvest_phone,
                coupon_moeny: element.coupon_moeny,
                order_info_moneys: element.order_info_moneys,
                discount: element.discount,
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
