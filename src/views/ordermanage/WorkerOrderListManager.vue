<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 16px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
    请选择时间：
    <a-range-picker style="margin-left: 8px; margin-right: 16px" @change="onChange" size="default" :locale="locale">
    </a-range-picker>
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
      <a-select-option :value="2"> 已支付 </a-select-option>
      <a-select-option :value="3"> 已接取 </a-select-option>
      <a-select-option :value="4"> 确认接单 </a-select-option>
      <a-select-option :value="5"> 已完成 </a-select-option>
      <a-select-option :value="9"> 已取消 </a-select-option>
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
      v-if="$store.state.rights[2].children[1].children[0].import == 1"
    >
      导出订单列表
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
        <template slot="order_info_voicsta" slot-scope="text">
          {{ text == 0 ? '未开票' : text == 1 ? '审核中' : text == 2 ? '已开票' : '驳回' }}
        </template>
        <template slot="worker_info_sta" slot-scope="text">
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

        <template slot="title"> 全部工人订单列表 </template>
        <span slot="action" slot-scope="text, record">
          <!-- <template>
            <a @click="handleEdit(record)">查看详情</a>
            <a-divider type="vertical" v-if="$store.state.rights[2].children[1].children[0].edit == 1" />
          </template> -->
          <template slot="worker_detail_creatime" slot-scope="text">
            {{ text | dayjs }}
          </template>
          <template v-if="record.worker_info_sta != 5 && record.worker_info_sta != 9">
            <a @click="changeorder(record, (changetype = 5))">完成</a>
            <a-divider type="vertical" v-if="record.worker_info_sta != 5 && record.worker_info_sta != 9" />
          </template>
          <template v-if="record.worker_info_sta != 9">
            <a href="javascript:;" @click="changeorder(record, (changetype = 9))">取消</a>
            <a-divider type="vertical" v-if="record.worker_info_sta != 9" />
          </template>

          <template>
            <a @click="lookwenjian(record)">文件</a>
          </template>
          <!-- <a-dropdown v-if="$store.state.rights[2].children[1].children[0].edit == 1 && record.worker_info_sta != 5">
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.worker_info_sta != 5 && record.worker_info_sta != 9">
                <a href="javascript:;" @click="changeorder(record, (changetype = 5))">强制完成</a>
              </a-menu-item>
              <a-menu-item v-if="record.worker_info_sta != 9">
                <a href="javascript:;" @click="changeorder(record, (changetype = 9))">取消订单</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown> -->
        </span>
      </a-table>
    </a-spin>
    <!-- <div>
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
            <a-table :columns="detailColumns" :data-source="oderdetail" size="small" @change="handleTableChange1">
              <template slot="worker_info_sta" slot-scope="text">
                {{ text == '1' ? '启用' : '禁用' }}
              </template>
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div> -->
    <div>
      <a-modal
        title="发货信息"
        :visible="iffahuo"
        :confirm-loading="false"
        okText="提交"
        @ok="aas({ id: '0' })"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.iffahuo = false
            this.fahuoxinxi = {}
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <p>
          <a-spin :spinning="spinning" size="large">
            <row>
              <a-col :span="12">
                <a-form-item label="物流公司:">
                  <a-input
                    size="large"
                    type="text"
                    style="width: 230px"
                    placeholder="物流公司"
                    v-model="fahuoxinxi.wuliugongsi"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="物流单号:">
                  <a-input
                    size="large"
                    type="text"
                    :maxLength="50"
                    style="width: 230px"
                    placeholder="物流单号"
                    v-model="fahuoxinxi.dingdan"
                  ></a-input>
                </a-form-item>
              </a-col>
            </row>
          </a-spin>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal v-model="chakanwuliuxinx" title="物流信息" :footer="null" :centered="true" :destroyOnClose="true">
        <p style="margin-left: 100px">物流公司：{{ quanbuwuliuxinx.wuliugongsi }}</p>
        <p style="margin-left: 100px">物流编号：{{ quanbuwuliuxinx.wuliuxinx }}</p>
      </a-modal>
    </div>
    <div>
      <a-modal
        title="相关文件"
        width="900px"
        :visible="visiblewenjian"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visiblewenjian = false
            this.list = []
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
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
const filecolumns = [
  {
    dataIndex: 'slide_name',
    title: '文件名',
    scopedSlots: { customRender: 'slide_name' },
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
    title: '工人名称',
    sorter: true,
    dataIndex: 'worker_name',
  },
  {
    title: '天数',
    sorter: true,
    dataIndex: 'worker_info_amount',
  },
  {
    title: '标题',
    sorter: true,
    dataIndex: 'worker_headline',
  },
  {
    title: '价格',
    sorter: true,
    dataIndex: 'worker_price',
  },
  {
    title: '状态',
    dataIndex: 'worker_info_sta',
    scopedSlots: { customRender: 'worker_info_sta' },
  },
  {
    title: '电话通知',
    dataIndex: 'worker_info_dianhua',
    scopedSlots: { customRender: 'worker_info_dianhua' },
  },
  {
    title: '用工时间',
    dataIndex: 'worker_info_issuetime',
  },
  {
    title: '操作',
    show: 3,
    width: 160,
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
const innerColumns = [
  {
    title: '下单时间',
    show: 2,
    dataIndex: 'worker_info_creatime',
    scopedSlots: { customRender: 'worker_info_creatime' },
  },
  {
    title: '收货地址',
    show: 1,
    dataIndex: 'harvest_add',
  },
  {
    title: '收货详情',
    show: 1,
    dataIndex: 'harvest_address',
  },
  {
    title: '优惠券额度',
    show: 2,
    sorter: true,
    dataIndex: 'coupon_moeny',
  },
  {
    title: '支付方式',
    show: 1,
    dataIndex: 'worker_info_payment',
    scopedSlots: { customRender: 'worker_info_payment' },
  },
  {
    title: '留言',
    show: 1,
    dataIndex: 'worker_info_word',
  },
  {
    title: '接单时间',
    show: 1,
    dataIndex: 'worker_info_receiving',
    scopedSlots: { customRender: 'worker_info_receiving' },
  },
  {
    title: '完成时间',
    show: 1,
    dataIndex: 'worker_info_accomplish',
    scopedSlots: { customRender: 'worker_info_accomplish' },
  },
  {
    title: '是否为司机',
    show: 1,
    dataIndex: 'worker_info_driver',
    scopedSlots: { customRender: 'worker_info_driver' },
  },
]
// const columns = [
//   {
//     title: '订单编号',
//     show: 1,
//     width: 120,
//     sorter: true,
//     dataIndex: 'worker_info_id',
//   },
//   {
//     title: '订单号',
//     show: 1,
//     sorter: true,
//     dataIndex: 'worker_info_ids',
//   },
//   {
//     title: '用工时间',
//     show: 1,
//     sorter: true,
//     dataIndex: 'worker_info_issuetime',
//   },
//   {
//     title: '收货名',
//     show: 1,
//     sorter: true,
//     dataIndex: 'harvest_name',
//   },
//   {
//     title: '收货电话',
//     show: 1,
//     sorter: true,
//     dataIndex: 'harvest_phone',
//   },
//   {
//     title: '总价',
//     show: 1,
//     sorter: true,
//     dataIndex: 'worker_info_altogether',
//   },
//   {
//     title: '支付金额',
//     show: 1,
//     sorter: true,
//     dataIndex: 'worker_info_moneys',
//   },
//   {
//     title: '订单状态',
//     show: 1,
//     dataIndex: 'worker_info_sta',
//     scopedSlots: { customRender: 'worker_info_sta' },
//   },
//   {
//     title: '操作',
//     show: 2,
//     width: 160,
//     dataIndex: 'action',
//     scopedSlots: { customRender: 'action' },
//   },
// ]
export default {
  name: 'OrderListManager',
  props: {
    text: String,
    locale,
  },
  data() {
    return {
      data: [],
      columns,
      innerColumns,
      // detailColumns,
      visible: false,
      visiblefukuan: false,
      visiblezhekou: false,
      shenhejieguo: false,
      chakanwuliuxinx: false,
      spinning: false,
      iffahuo: false,
      filecolumns,
      visiblewenjian: false,
      fahuoxinxi: {},
      confirmLoading: false,
      changetype: 0,
      keywords: '',
      ordertype: 2,
      list: [],
      orderstatus: '',
      status: '',
      newid: '',
      shoukuandata: {},
      zhekoudata: {},
      quanbuwuliuxinx: {},
      oneorderdata: {},
      oneshenqingdata: {},
      kaipiaoshenhejieguo: false,
      oderdetail: [],
      alluserorderids: [],
      allDevice: [],
      formInline: {
        timerange: [],
      },
    }
  },
  created() {
    const that = this
    var rights = JSON.parse(window.localStorage.getItem('rengongrights'))
    var newcolumns = []
    this.columns.forEach((item) => {
      rights.forEach((element) => {
        if (item.dataIndex == element.name && element.show == 1) {
          newcolumns.push(item)
        }
      })
    })
    if (newcolumns.length > 0) {
      newcolumns.push({
        title: '操作',
        show: 3,
        width: 160,
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' },
      })
    }
    this.columns = newcolumns
    var endtime = ''
    var starttime = ''
    this.formInline.timerange = [starttime, endtime]
    that.getAllWorkOrdersListpage()
  },
  methods: {
    onChange(date, dateString) {
      const that = this
      that.formInline.timerange[0] = dateString[0]
      that.formInline.timerange[1] = dateString[1]
      if (dateString[0] == '') {
        that.formInline.timerange[1] = that.dateFtt('yyyy-MM-dd', new Date())
        that.formInline.timerange[0] = that.dateFtt(
          'yyyy-MM-dd',
          new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7)
        )
      }
    },
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
    wuliuxinx(e) {
      const that = this
      console.log(e)
      that.quanbuwuliuxinx = {}
      if (e.order_info_wuliu) {
        that.quanbuwuliuxinx.wuliugongsi = e.order_info_wuliu
      } else {
        that.quanbuwuliuxinx.wuliugongsi = ''
      }

      if (e.order_info_danhao) {
        that.quanbuwuliuxinx.wuliuxinx = e.order_info_danhao
      } else {
        that.quanbuwuliuxinx.wuliuxinx = ''
      }

      that.chakanwuliuxinx = true
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllWorkOrdersListpage()
    },
    handleTableChange1(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAlldetail()
    },
    chongxinkaipiaoshenqing() {
      const that = this
      console.log('大苏打实打实打算')
      console.log(that.oneshenqingdata)
      this.$confirm({
        title: '是否确定将重新申请开票?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.myid = that.$store.state.admin.user_id
          formdate.bills_type = 'KaipiaoRecord'
          formdate.jieguo = '申请开票'
          formdate.id = that.oneshenqingdata.order_info_id
          formdate.type = 1
          that.spinning = true
          this.$request({
            url: '/user/changeOrderkaipiaoStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.oneshenqingdata = {}
                that.kaipiaoshenhejieguo = false
                that.getAllWorkOrdersListpage()
                that.$message.success('提交订单审核开票成功!')
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
    chongxinshenqing() {
      const that = this
      this.$confirm({
        title: '是否确定重新申请折扣审核?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          that.spinning = true
          var formdate = {}
          formdate.myid = that.$store.state.admin.user_id
          formdate.id = that.oneshenqingdata.id
          formdate.orderid = that.oneshenqingdata.order_info_id
          this.$request({
            url: '/user/deleteshenheDiscountSuccess',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.status == 200) {
                that.shenhejieguo = false
                that.spinning = false
                that.getAllWorkOrdersListpage()
                that.$message.success('重置成功，可以重新申请!')
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
    chakankaipiaoshenqing(e) {
      const that = this
      console.log(e)
      that.kaipiaoshenhejieguo = true
      that.oneshenqingdata.order_info_id = e.order_info_id
      that.oneshenqingdata.order_info_voicsta = e.order_info_voicsta
      if (e.order_info_voicsta == '3') {
        that.oneshenqingdata.jieguo = '审核被驳回'
        that.oneshenqingdata.shenhezhong = 'no'
      } else if (e.order_info_voicsta == '1') {
        that.oneshenqingdata.jieguo = '正在审核'
        that.oneshenqingdata.shenhezhong = 'yes'
      } else if (e.order_info_voicsta == '2') {
        that.oneshenqingdata.jieguo = '财务开票审核通过'
        that.oneshenqingdata.shenhezhong = 'yes'
      }
      if (e.reason != '') {
        that.oneshenqingdata.refuse_reason = e.reason
      } else {
        that.oneshenqingdata.refuse_reason = ''
      }
    },

    savezhekou() {
      const that = this
      if (that.zhekoudata.money == '' || that.zhekoudata.money == null) {
        that.$message.warning('请填写折扣金额!')
        return
      }
      if (Number(that.zhekoudata.money) > Number(that.zhekoudata.payed)) {
        that.$message.warning('折扣金额不能大于订单剩余价格!')
        return
      }
      that.zhekoudata.myid = that.$store.state.admin.user_id
      that.zhekoudata.orderid = that.oneorderdata.order_info_id
      //新增信息
      that.spinning = true
      this.$request({
        url: '/user/addZheKouBillsdata',
        method: 'get',
        params: that.zhekoudata,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.visiblezhekou = false
            that.zhekoudata = {}
            that.getAllWorkOrdersListpage()
            that.$message.success('申请折扣成功,已经移交财务审核!')
          } else {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    saveshoukuan() {
      const that = this
      if (that.shoukuandata.money == '' || that.shoukuandata.money == null) {
        that.$message.warning('请填写收款金额!')
        return
      }
      if (Number(that.shoukuandata.money) > Number(that.shoukuandata.payed)) {
        that.$message.warning('付款金额不能大于订单剩余价格!')
        return
      }
      that.shoukuandata.myid = that.$store.state.admin.user_id
      that.shoukuandata.orderid = that.oneorderdata.order_info_id
      //新增信息
      that.spinning = true
      this.$request({
        url: '/user/addColletionBillsdata',
        method: 'get',
        params: that.shoukuandata,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.visiblefukuan = false
            that.shoukuandata = {}
            that.getAllWorkOrdersListpage()
            that.$message.success('新增收款信息成功!')
          } else {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    shoukuan(e) {
      const that = this

      that.oneorderdata = {}
      that.visiblefukuan = true
      that.oneorderdata = e
      that.shoukuandata.order_info_altogether = e.order_info_altogether
      that.shoukuandata.payed = e.order_info_altogether - e.payed - e.discount
    },
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出工人订单列表',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getWorkOrdersAllDetailsDataById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['订单编号', '工人名称', '天数', '标题', '价格', '状态', '电话通知', '用工时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.worker_info_id == null ? '' : element.worker_info_id,
                    element.worker_name == null ? '' : element.worker_name,
                    element.worker_info_amount == null ? '' : element.worker_info_amount,
                    element.worker_headline == null ? '' : element.worker_headline,
                    element.worker_price == null ? '' : element.worker_price,
                    element.worker_info_sta == null
                      ? ''
                      : element.worker_info_sta == '1'
                      ? '待付款'
                      : element.worker_info_sta == '2'
                      ? '已支付'
                      : element.worker_info_sta == '3'
                      ? '已接取'
                      : element.worker_info_sta == '4'
                      ? '确认接单'
                      : element.worker_info_sta == '5'
                      ? '已完成'
                      : '已取消',
                    element.worker_info_dianhua == null ? '' : element.worker_info_dianhua == 0 ? '未通知' : '已通知',
                    element.worker_info_issuetime == null ? '' : element.worker_info_issuetime,
                  ]
                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '人工订单列表')
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
      if (that.changetype == 3) {
        that.iffahuo = true
        that.thisid = e.worker_info_id
        that.fahuoxinxi = {}
      } else {
        this.aas(e)
      }
    },
    aas(e) {
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
          that.spinning = true
          var formdate = {}
          formdate.myid = that.$store.state.admin.user_id
          if (that.changetype == 3) {
            if (that.fahuoxinxi.wuliugongsi == '') {
              that.$message.warning('请填写物流信息!')
              return
            }
            if (that.fahuoxinxi.dingdan == '') {
              that.$message.warning('请填写物流单号!')
              return
            }
            formdate.id = that.thisid
            formdate.wuliugongsi = that.fahuoxinxi.wuliugongsi
            formdate.dingdan = that.fahuoxinxi.dingdan
          } else {
            formdate.id = e.worker_info_id
          }

          formdate.type = that.changetype
          ;(formdate.typedata =
            that.changetype == 3
              ? '发货'
              : that.changetype == 4
              ? '送达'
              : that.changetype == 5
              ? '强制完成'
              : '取消订单'),
            (that.spinning = true)
          this.$request({
            url: '/user/changeWorkOrderStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.thisid = ''
                that.iffahuo = false
                that.fahuoxinxi = {}
                that.getAllWorkOrdersListpage()
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
    getAlldetail() {
      const that = this
      that.spinning = true
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      formdate.id = that.newid
      this.$request({
        url: '/user/getWorkOrdersAllDetailsDataById',
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
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      var formdate = {}
      that.newid = e.worker_info_id
      formdate.id = e.worker_info_id
      this.$request({
        url: '/user/getWorkOrdersAllDetailsDataById',
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
      that.getAllWorkOrdersListpage()
    },
    getAllWorkOrdersListpage() {
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
      if (
        that.formInline.timerange[0] != '' &&
        that.formInline.timerange[0] != null &&
        that.formInline.timerange[1] != '' &&
        that.formInline.timerange[1] != null
      ) {
        that.formInline.starttime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[0]))
        that.formInline.endtime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[1]))
        if (that.formInline.times == 'month') {
          that.formInline.starttime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[0]))
          that.formInline.endtime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[1]))
        }
      }
      if (that.formInline.starttime != '' && that.formInline.starttime != null) {
        formdate.starttime = that.formInline.starttime
      }
      if (that.formInline.endtime != '' && that.formInline.endtime != null) {
        formdate.endtime = that.formInline.endtime
      }
      that.spinning = true
      that
        .$request({
          url: '/user/getWorkOrdersAllDetailsDataById',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              element.worker_info_sta = Number(element.worker_info_sta)
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
