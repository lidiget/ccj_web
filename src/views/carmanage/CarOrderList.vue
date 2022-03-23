<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 16px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
    <!-- 订单状态:
    <a-select
      style="width: 130px; margin-left: 8px; margin-right: 16px"
      show-search
      placeholder="订单状态"
      option-filter-prop="children"
      allowClear
      v-model="orderstatus"
    >
      <a-select-option :value="1"> 未接单 </a-select-option>
      <a-select-option :value="2"> 已接单 </a-select-option>
      <a-select-option :value="3"> 已完成 </a-select-option>
      <a-select-option :value="4"> 已取消 </a-select-option>
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
      v-if="$store.state.rights[9].children[2].children[0].import == 1"
    >
      导出订单列表
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
          :rowKey="(item) => item.order_info_id"
          :locale="{ emptyText: '暂无数据' }"
        >
          <template slot="vehicle_info_creatime" slot-scope="text">
            {{ text | dayjs }}
          </template>
          <template slot="vehicle_info_creatme" slot-scope="text">
            {{ text | dayjs }}
          </template>
          <template slot="vehicle_info_payment" slot-scope="text">{{
            text == 'wxpay' ? '微信支付' : '余额'
          }}</template>
          <template slot="vehicle_info_elevator" slot-scope="text">{{ text == 1 ? '有' : '无' }}</template>
          <template slot="vehicle_info_shifou" slot-scope="text">{{ text == 1 ? '需要' : '不需要' }}</template>
        </a-table>
        <template slot="vehicle_info_status" slot-scope="text">
          <a-badge :status="text == 1 ? 'default' : text == 2 ? 'warning' : text == 3 ? 'warning' : text == 3 ? 'warning' : text == 4 ? 'warning' : text == 5 ? 'success' : 'error'" />
          {{ text == 1 ? '待付款' : text == 2 ? '已支付' : text == 3 ? '已接取' :  text == 4 ? '确认接单': text == 5 ? '已完成':"已取消" }}
        </template>
        <template slot="vehicle_info_creatine" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <template slot="title"> 叫车订单列表 </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="lookwenjian(record)">文件</a>
          </template>
        </span>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        title="相关文件"
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
          <a-table ref="table" :columns="filecolumns" :data-source="list">
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
const innerColumns = [
  {
    title: '发车点',
    dataIndex: 'vehicle_info_depart',
  },
  {
    title: '到达点',
    dataIndex: 'vehicle_info_arrive',
  },
  {
    title: '发车联系人',
    dataIndex: 'vehicle_info_linkman',
  },
  {
    title: '到达联系人',
    dataIndex: 'vehicle_info_linkmans',
  },
  {
    title: '发车时间',
    dataIndex: 'vehicle_info_creatime',
    scopedSlots: { customRender: 'vehicle_info_creatime' },
  },
  {
    title: '到达时间',
    dataIndex: 'vehicle_info_creatme',
    scopedSlots: { customRender: 'vehicle_info_creatme' },
  },
  {
    title: '支付方式',
    dataIndex: 'vehicle_info_payment',
    scopedSlots: { customRender: 'vehicle_info_payment' },
  },
  {
    title: '楼层(层)',
    dataIndex: 'vehicle_info_floor',
  },
  {
    title: '距离(KM)',
    dataIndex: 'vehicle_info_distance',
  },
  {
    title: '有无电梯',
    dataIndex: 'vehicle_info_elevator',
    scopedSlots: { customRender: 'vehicle_info_elevator' },
  },
  {
    title: '需要搬运',
    dataIndex: 'vehicle_info_shifou',
    scopedSlots: { customRender: 'vehicle_info_shifou' },
  },
]
const columns = [
  {
    title: '编号',
    width: 120,
    sorter: true,
    dataIndex: 'vehicle_info_id',
  },
  {
    title: '订单编号',
    sorter: true,
    dataIndex: 'vehicle_info_ids',
  },
  {
    title: '车辆名字',
    sorter: true,
    dataIndex: 'cartypename',
  },
  {
    title: '车辆载重',
    sorter: true,
    dataIndex: 'carzaizhong',
  },
  {
    title: '起步价',
    sorter: true,
    dataIndex: 'carstartprice',
  },

  {
    title: '车辆规格',
    sorter: true,
    dataIndex: 'carguige',
  },

  {
    title: '预计金额',
    sorter: true,
    dataIndex: 'vehicle_info_predict',
  },
  {
    title: '实付金额',
    sorter: true,
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
  {
    title: '操作',
    dataIndex: 'action',
    width:70,
    scopedSlots: { customRender: 'action' },
  },
]
const filecolumns = [
  {
    dataIndex: 'slide_name',
    title: '文件名',
    scopedSlots: { customRender: 'slide_name' },
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
      spinning: false,
      visiblewenjian: false,
      confirmLoading: false,
      changetype: 0,
      keywords: '',
      filecolumns,
      orderstatus: '',
      allDevice: [],
      list: [],
    }
  },
  created() {
    const that = this
    that.getAllVehicleOrdersListpage()
  },

  methods: {
    lookwenjian(e) {
      const that = this
      that.list = []
      that.visiblewenjian = true
      if (e.files) {
        var data = []
        data = e.files.split(',')
        data.forEach((item) => {
          that.list.push({
            slide_name: item,
            url: item,
          })
        })
      }
    },
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出全部叫车订单列表',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllVehicleOrdersListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '订单编号',
                    '车辆名字',
                    '车辆载重',
                    '起步价',
                    '车辆规格',
                    '预计金额',
                    '实付金额',
                    '订单状态',
                    '创建时间',
                    '发车点',
                    '到达点',
                    '发车联系人',
                    '到达联系人',
                    '发车时间',
                    '到达时间',
                    '支付方式',
                    '楼层(层)',
                    '距离(KM)',
                    '有无电梯',
                    '需要搬运',
                    '创建时间'
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.vehicle_info_ids == null ? '' : element.vehicle_info_ids,
                    element.cartypename == null ? '' : element.cartypename,
                    element.carzaizhong == null ? '' : element.carzaizhong,
                    element.carstartprice == null ? '' : element.carstartprice,
                    element.carguige == null ? '' : element.carguige,
                    element.vehicle_info_predict == null ? '' : element.vehicle_info_predict,
                    element.vehicle_info_moneys == null ? '' : element.vehicle_info_moneys,
                    element.vehicle_info_status == null
                      ? ''
                      : element.vehicle_info_status == 1
                      ? '待接单'
                      : element.vehicle_info_status == 2
                      ? '已接单'
                      : element.vehicle_info_status == 3
                      ? '已完成'
                      : '已取消',
                    element.vehicle_info_creatine == null ? '' : element.vehicle_info_creatine,
                    element.vehicle_info_depart == null ? '' : element.vehicle_info_depart,

                    element.vehicle_info_arrive == null ? '' : element.vehicle_info_arrive,
                    element.vehicle_info_linkman == null ? '' : element.vehicle_info_linkman,
                    element.vehicle_info_creatime == null ? '' : element.vehicle_info_creatime,
                    element.vehicle_info_creatme == null ? '' : element.vehicle_info_creatme,
                    element.vehicle_info_payment == null
                      ? ''
                      : element.vehicle_info_payment == 'wxpay'
                      ? '微信支付'
                      : '余额',
                    element.vehicle_info_floor == null ? '' : element.vehicle_info_floor,
                    element.vehicle_info_distance == null ? '' : element.vehicle_info_distance,
                    element.vehicle_info_elevator == null ? '' : element.vehicle_info_elevator == 1 ? '有' : '无',
                    element.vehicle_info_shifou == null ? '' : element.vehicle_info_shifou == 1 ? '需要' : '不需要',
                    element.vehicle_info_creatine == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.vehicle_info_creatine))
                  ]
                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '叫车订单列表')
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
      that.getAllVehicleOrdersListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllVehicleOrdersListpage()
    },
    getAllVehicleOrdersListpage() {
      const that = this
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
      that.spinning = true
      that
        .$request({
          url: '/user/getAllVehicleOrdersListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              var groupItem = []
              groupItem.push({
                vehicle_info_depart: element.vehicle_info_depart,
                vehicle_info_arrive: element.vehicle_info_arrive,
                vehicle_info_linkman: element.vehicle_info_linkman,
                vehicle_info_linkmans: element.vehicle_info_linkmans,
                vehicle_info_creatime: element.vehicle_info_creatime,
                vehicle_info_creatme: element.vehicle_info_creatme,
                vehicle_info_payment: element.vehicle_info_payment,
                vehicle_info_floor: element.vehicle_info_floor,
                vehicle_info_distance: element.vehicle_info_distance,
                vehicle_info_elevator: element.vehicle_info_elevator,
                vehicle_info_shifou: element.vehicle_info_shifou,
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
