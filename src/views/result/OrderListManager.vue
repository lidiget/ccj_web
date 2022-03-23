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
      <a-select-option :value="1"> 待付款 </a-select-option>
      <a-select-option :value="2"> 待发货 </a-select-option>
      <a-select-option :value="3"> 待收货 </a-select-option>
      <a-select-option :value="4"> 待评价 </a-select-option>
      <a-select-option :value="5"> 已完成 </a-select-option>
      <a-select-option :value="9"> 已取消 </a-select-option>
    </a-select>
    是否开单:
    <a-select
      style="width: 130px; margin-left: 8px"
      show-search
      placeholder="开票状态"
      option-filter-prop="children"
      allowClear
      v-model="status"
    >
      <a-select-option :value="1"> 已开 </a-select-option>
      <a-select-option :value="2"> 未开 </a-select-option>
    </a-select>
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-spin :spinning="spinning" size="large">
      <a-table ref="table" size="default" :columns="columns" :data-source="data" bordered :alert="false">
        <a-table
          :pagination="{ defaultPageSize: 999, hideOnSinglePage: true }"
          :columns="innerColumns"
          slot="expandedRowRender"
          slot-scope="data"
          :dataSource="data.groupItem"
          :rowKey="(item) => item.order_info_id"
          :locale="{ emptyText: '暂无数据' }"
        >
          <template slot="order_info_payment" slot-scope="text">{{
            text == 'wxpay' ? '微信支付' : '余额'
          }}</template>
        </a-table>
        <template slot="order_info_voicsta" slot-scope="text">
          {{ text == 1 ? '开票' : '未开票' }}
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
        <template slot="title"> 全部订单列表 </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">查看详情</a>
            <a-divider type="vertical" />
          </template>
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.order_info_status == 2">
                <a href="javascript:;" @click="changeorder(record, (changetype = 3))">发货</a>
              </a-menu-item>
              <a-menu-item v-if="record.order_info_status == 3">
                <a href="javascript:;" @click="changeorder(record, (changetype = 4))">送达</a>
              </a-menu-item>
              <a-menu-item
                v-if="
                  record.order_info_status == 1 ||
                  record.order_info_status == 2 ||
                  record.order_info_status == 3 ||
                  record.order_info_status == 4
                "
              >
                <a href="javascript:;" @click="changeorder(record, (changetype = 5))">强制完成</a>
              </a-menu-item>
              <a-menu-item
                v-if="
                  record.order_info_status == 1 ||
                  record.order_info_status == 2 ||
                  record.order_info_status == 3 ||
                  record.order_info_status == 4
                "
              >
                <a href="javascript:;" @click="changeorder(record, (changetype = 9))">取消订单</a>
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
  </a-card>
</template>

<script>
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
    title: '仓库',
    dataIndex: 'warehousename',
  },
  {
    title: '收货地址',
    dataIndex: 'harvest_add',
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
    that.getAllOrdersListpage()
  },
  methods: {
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
          formdata.myid = that.$store.state.admin.user_id
          formdate.id = e.order_info_id
          formdate.type = that.changetype
          that.spinning = true
          this.$request({
            url: '/user/changeOrderStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.getAllOrdersListpage()
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
