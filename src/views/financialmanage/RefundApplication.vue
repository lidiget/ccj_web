<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 16px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
    订单状态:
    <a-select
      style="width: 130px; margin-left: 8px; margin-right: 16px"
      show-search
      placeholder="订单状态"
      option-filter-prop="children"
      allowClear
      v-model="orderstatus"
    >
      <a-select-option :value="1"> 未退款 </a-select-option>
      <a-select-option :value="2"> 已退款 </a-select-option>
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
      导出退款记录列表
    </a-button>
    <a-spin :spinning="spinning" size="large">
      <a-table
        ref="table"
        size="default"
        @change="handleTableChange"
        :columns="columns"
        :data-source="data"
        bordered
        :alert="false"
      >
        <a-table
          :pagination="{ defaultPageSize: 999, hideOnSinglePage: true }"
          :columns="innerColumns"
          slot="expandedRowRender"
          slot-scope="data"
          :dataSource="data.groupItem"
          :rowKey="(item) => item.refund_id"
          :locale="{ emptyText: '暂无数据' }"
        >
          <span slot="slide_name" slot-scope="text">
            <a type="link" :href="text"> {{ text }} </a></span
          >
          <template slot="order_info_id" slot-scope="text">{{ text == 0 ? '暂无' : text }}</template>
          <template slot="refund_ids" slot-scope="text">{{
            text == '' || text == null ? '余额付款无编码' : text
          }}</template>
          <template slot="order_info_payment" slot-scope="text">
            {{ text == 'wxpay' ? '微信' : text == 'alipay' ? '支付宝' : '余额' }}</template
          >
        </a-table>
        <template slot="order_info_freight" slot-scope="text">{{ text == '' || text == null ? 0 : text }}</template>

        <template slot="refund_url" slot-scope="text">
          <img :src="text" width="100" height="100" v-if="text != ''" />
        </template>
        <template slot="title"> 退货申请列表 </template>
        <template slot="refund_cargo" slot-scope="text"> {{ text == 1 ? '未退货' : '已退货' }}</template>

        <template slot="refund_status" slot-scope="text">
          <a-badge :status="text == 1 ? 'default' : text == 2 ? 'warning' : 'success'" />
          {{ text == 1 ? '申请退款' : text == 2 ? '正在处理' : '完成退款' }}</template
        >
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">查看详情</a>
          </template>
          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a
                  href="javascript:;"
                  :disabled="record.refund_url != '' && record.refund_url != null ? false : true"
                  @click="tuihuopingzhen(record)"
                  >{{ record.refund_url != '' && record.refund_url != null ? '凭证查看' : '暂无凭证' }}</a
                >
              </a-menu-item>
              <a-menu-item
                v-if="record.refund_status == 1 && $store.state.rights[10].children[1].children[0].tuikuan == 1"
              >
                <a href="javascript:;" @click="pizhun(record)">退款</a>
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
        :confirm-loading="false"
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
        title="退款凭证"
        width="900px"
        :visible="visiblewenjian"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visiblewenjian = false
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-table ref="table" :columns="filecolumnss" :data-source="filedata">
            <span slot="slide_name" slot-scope="text">
              <a type="link" :href="text"> {{ text }} </a></span
            >
          </a-table>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const filecolumnss = [
  {
    dataIndex: 'slide_name',
    title: '文件名',
    scopedSlots: { customRender: 'slide_name' },
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
  {
    title: '退款编码',
    sorter: true,
    width: 120,
    dataIndex: 'refund_ids',
    scopedSlots: { customRender: 'refund_ids' },
  },
  {
    title: '订单编号',
    sorter: true,
    dataIndex: 'order_info_id',
    scopedSlots: { customRender: 'order_info_id' },
  },
  {
    title: '退款原因',
    sorter: true,
    dataIndex: 'refund_cause',
  },
  {
    title: '付款方式',
    dataIndex: 'order_info_payment',
    scopedSlots: { customRender: 'order_info_payment' },
  },
  // {
  //   title: '退款凭证',
  //   width: 200,
  //   dataIndex: 'refund_url',
  //   scopedSlots: { customRender: 'slide_name' },
  // },
]
const columns = [
  {
    title: '编号',
    sorter: true,
    width: 120,
    dataIndex: 'refund_id',
  },

  {
    title: '退款金额',
    sorter: true,
    dataIndex: 'refund_money',
  },
  {
    title: '运费',
    sorter: true,
    dataIndex: 'order_info_freight',
    scopedSlots: { customRender: 'order_info_freight' },
  },
  {
    title: '退款状态',
    sorter: true,
    dataIndex: 'refund_cargo',
    scopedSlots: { customRender: 'refund_cargo' },
  },

  // {
  //   title: '退款凭证',
  //   dataIndex: 'refund_url',
  //   scopedSlots: { customRender: 'refund_url' },
  // },

  {
    title: '退款时间',
    dataIndex: 'refund_creatime',
  },
  {
    title: '退款进度',
    dataIndex: 'refund_status',
    scopedSlots: { customRender: 'refund_status' },
  },
  {
    title: '操作',
    width: 160,
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
      // baseUrl: 'http://47.103.34.184:8083',
      baseUrl:"http://8.136.103.102:8087",
      // baseUrlWxPay: 'http://www.10guan.cn:8083', //8083
      baseUrlWxPay:"http://www.10guan.cn:8087",//8087
      detailColumns,
      spinning: false,
      visible: false,
      innerColumns,
      changetype: 0,
      keywords: '',
      orderstatus: '',
      status: '',
      filecolumnss,
      filedata: [],
      visiblewenjian: false,
      oderdetail: [],
      allDevice: [],
    }
  },
  created() {
    console.log('ddddddd')
    console.log(this.$store.state.rights[10].children[1].children[0])
  },
  mounted() {
    const that = this
    that.getAllApplyListpage()
  },
  methods: {
    tuihuopingzhen(e) {
      const that = this
      console.log(e)
      that.visiblewenjian = true
      that.filedata = []
      if (e.refund_url) {
        var data = []
        data = e.refund_url.split(',')
        data.forEach((item) => {
          that.filedata.push({
            slide_name: item,
            url: item,
          })
        })
      }
    },
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出退款申请列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllReturnOrderListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['编号', '退款金额', '运费', '退款状态', '退款时间', '退款进度']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.refund_id == null ? '' : element.refund_id,
                    element.refund_money == null ? '' : element.refund_money,
                    element.order_info_freight == null ? '' : Number(element.order_info_freight).toFixed(2),
                    element.refund_cargo == null ? '' : element.refund_cargo == 1 ? '未退货' : '已退货',
                    element.refund_creatime == null ? '' : element.refund_creatime,
                    element.refund_status == null
                      ? ''
                      : element.refund_status == 1
                      ? '申请退款'
                      : element.refund_status == 2
                      ? '正在处理'
                      : '完成退款',
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '退款申请列表')
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
    tuihuo(e) {
      const that = this
      this.$confirm({
        title: '是否确定该订单货物已经退货?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.id = e.refund_id
          formdate.goodstype = 2
          that.spinning = true
          this.$request({
            url: '/user/changeReturnOrderStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.getAllApplyListpage()
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
    pizhun(e) {
      const that = this
      console.log('2xxxxxxx')
      console.log(e)
      this.$confirm({
        title: '是否确定批准退款该订单?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var aa = {}
          aa.outTradeNo = e.out_trade_no
          aa.total_fee = e.order_info_altogether
          aa.refund_fee = e.refund_money
          if (e.order_info_payment == 'wxpay') {
            //退款到微信
            this.$axios({
              url: that.baseUrlWxPay + '/wxPay/refund',
              dataType: 'json',
              method: 'get',
              params: aa,
              headers: { 'Access-Control-Allow-Origin': '*' },
            })
              .then(() => {
                var formdate = {}
                formdate.id = e.refund_id
                formdate.type = 3
                that.spinning = true
                this.$request({
                  url: '/user/changeReturnOrderStatusById',
                  method: 'get',
                  params: formdate,
                })
                  .then((res) => {
                    if (res.code == 200) {
                      that.spinning = false
                      that.getAllApplyListpage()
                      that.$message.success('退款成功!')
                    }
                  })
                  .catch(function () {
                    that.spinning = false
                    that.$message.error('抱歉,未知错误,请联系管理员!')
                  })
              })
              .catch(function () {
                that.spinning = false
                that.$message.error('抱歉,未知错误,请联系管理员!')
              })
          } else if (e.order_info_payment == 'yue') {
            //退款到账户
            //先通过订单编号查出用户编号
            var bb = {}
            bb.wallet_balance = e.refund_money
            bb.user_id = e.user_id
            that
              .$axios({
                method: 'get', //指定请求方式
                url: that.baseUrl + '/api/shop/changewalletbalanceByTuiKuan',
                dataType: 'json',
                params: bb,
                headers: { 'Access-Control-Allow-Origin': '*', Authorization: '123' },
              })
              .then(() => {
                var formdate = {}
                formdate.id = e.refund_id
                formdate.type = 3
                that.spinning = true
                this.$request({
                  url: '/user/changeReturnOrderStatusById',
                  method: 'get',
                  params: formdate,
                })
                  .then((res) => {
                    if (res.code == 200) {
                      that.spinning = false
                      that.getAllApplyListpage()
                      that.$message.success('退款成功!')
                    }
                  })
                  .catch(function () {
                    that.spinning = false
                    that.$message.error('抱歉,未知错误,请联系管理员!')
                  })
              })
              .catch(function () {
                that.spinning = false
                that.$message.error('抱歉,未知错误,请联系管理员!')
              })
          } else {
            //退款到支付宝
            that
              .$axios({
                method: 'get', //指定请求方式
                url: that.baseUrlWxPay + '/aliPay/tardeRefund',
                dataType: 'json',
                params: aa,
                headers: { 'Access-Control-Allow-Origin': '*' },
              })
              .then(() => {
                var formdate = {}
                formdate.id = e.refund_id
                formdate.type = 3
                that.spinning = true
                this.$request({
                  url: '/user/changeReturnOrderStatusById',
                  method: 'get',
                  params: formdate,
                })
                  .then((res) => {
                    if (res.code == 200) {
                      that.spinning = false
                      that.getAllApplyListpage()
                      that.$message.success('退款成功!')
                    }
                  })
                  .catch(function () {
                    that.spinning = false
                    that.$message.error('抱歉,未知错误,请联系管理员!')
                  })
              })
              .catch(function () {
                that.spinning = false
                that.$message.error('抱歉,未知错误,请联系管理员!')
              })
          }
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
      that.getAllApplyListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllApplyListpage()
    },
    getAllApplyListpage() {
      const that = this
      that.spinning = true
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      if (that.orderstatus != '' && that.orderstatus != null) {
        formdate.orderstatus = that.orderstatus
      }
      // that.spinning = true
      that
        .$request({
          url: '/user/getAllReturnOrderListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              var groupItem = []
              groupItem.push({
                refund_ids: element.refund_ids,
                order_info_id: element.order_info_id,
                refund_cause: element.refund_cause,
                order_info_payment: element.order_info_payment,
                refund_url: element.refund_url,
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
