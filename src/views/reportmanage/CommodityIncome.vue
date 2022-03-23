<template>
  <a-card style="margin-top: 24px" :bordered="false">
    请选择时间：
    <a-range-picker style="margin-right: 16px" @change="onChange" size="default" :locale="locale"> </a-range-picker>
    选择商品：
    <a-select
      style="width: 130px; margin-right: 16px"
      show-search
      placeholder="选择商品："
      option-filter-prop="children"
      allowClear
      v-model="goodsid"
    >
      <a-select-option
        v-for="(items, index) in allgoods"
        :key="index"
        :label="items.shop_goods_name"
        :value="items.shop_goods_id"
        >{{ items.shop_goods_name }}</a-select-option
      >
    </a-select>
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-spin :spinning="spinning" size="large" style="margin-top: 40px">
      <a-table ref="table" size="default" :columns="columns1" :data-source="data" bordered :alert="false">
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">相关订单</a>
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
var columns1 = [
  {
    title: '客户名称',
    dataIndex: 'username',
  },
  {
    title: '联系方式',
    dataIndex: 'phone',
  },
  {
    title: '应收账款',
    dataIndex: 'allprice',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
export default {
  components: {
    locale,
  },
  props: {
    text: String,
  },
  data() {
    return {
      locale,
      columns1,
      detailColumns,
      confirmLoading: false,
      visible: false,
      data: [],
      oderdetail: [],
      allgoods: [],
      betweentime: {},
      spinning: false,
      cahrt: null,
      goodsid: '',
      inpMessage: '',
      clickData: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllSalesRankingListpage()
    that.getallgoodsData()
  },
  methods: {
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      var formdate = {}
      formdate.goodsid = e.shop_goods_id
      that
        .$request({
          url: '/user/getAllOrderByGoodsidListpage',
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
    getallgoodsData() {
      const that = this
      that.allgoods = []
      var formdate = {}
      that
        .$request({
          url: '/user/getAllShopGoodsListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.allgoods = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onChange(date, dateString) {
      const that = this
      that.betweentime.starttime = dateString[0]
      that.betweentime.endtime = dateString[1]
    },
    onSearch() {
      const that = this
      that.getAllSalesRankingListpage()
    },
    getAllSalesRankingListpage() {
      const that = this
      var formdate = {}
      formdate.starttime = that.betweentime.starttime
      formdate.endtime = that.betweentime.endtime
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
