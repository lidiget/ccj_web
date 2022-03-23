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
      导出折扣申请列表
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

        <template slot="examine_status" slot-scope="text">
          <a-badge :status="text == 1 ? 'default' : text == 2 ? 'success' : 'error'" />
          {{ text == 1 ? '审核中' : text == 2 ? '已通过' : '已驳回' }}
        </template>
        <span slot="action" slot-scope="text, record">
          <template v-if="$store.state.rights[11].children[0].children[0].edit == 1 && record.examine_status == 1">
            <a @click="handleShenhe(record)">审核</a>
            <a-divider type="vertical" v-if="$store.state.rights[11].children[0].children[0].edit == 1" />
          </template>
          <template>
            <a @click="handleEdit(record)">相关订单</a>
          </template>
        </span>
        <template slot="title"> 订单折扣记录 </template>
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
    <div>
      <a-modal
        title="订单折扣审核"
        :visible="visibleshenhe"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visibleshenhe = false
          }
        "
        :footer="null"
        :maskClosable="false"
        :destroyOnClose="true"
        :centered="true"
      >
        <p>
          <a-spin :spinning="spinning">
            <p>用户名：{{ this.onedata.username }}</p>
            <p>真实姓名：{{ this.onedata.realname }}</p>
            <p>联系方式：{{ this.onedata.phone }}</p>
            <p>折扣金额：{{ this.onedata.totalprice }}</p>
            <p>备注：{{ this.onedata.remark == null ? '' : this.onedata.remark }}</p>
            <p>
              <a-button
                style="margin-left: 130px"
                class="editable-add-btn"
                type="danger"
                @click="shenhebohui"
                :loading="spinning"
              >
                驳回
              </a-button>
              <a-button
                style="margin-left: 70px"
                class="editable-add-btn"
                type="primary"
                @click="shenhetongguo"
                :loading="spinning"
              >
                通过
              </a-button>
            </p>
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
              style="width: 300px"
              placeholder="驳回备注"
              v-model="bohuidata.remark"
            ></a-input>
          </a-form-item>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const columns1 = [
  {
    title: '编号',
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
  // {
  //   title: '真实姓名',
  //   sorter: true,
  //   dataIndex: 'realname',
  // },
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
    title: '折扣金额',
    sorter: true,
    dataIndex: 'totalprice',
  },
  {
    title: '打折时间',
    dataIndex: 'createtime',
    scopedSlots: { customRender: 'createtime' },
  },
  {
    title: '审核状态',
    dataIndex: 'examine_status',
    width: 120,
    scopedSlots: { customRender: 'examine_status' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 200,
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
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
      onedata: {},
      bohuidata: {},
      detailColumns,
      visible: false,
      spinning: false,
      visiblebohui: false,
      visibleshenhe: false,
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllDiscountRecordListpage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出订单折扣申请列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.zongjinban = 'yes'
          this.$request({
            url: '/user/getAllDiscountRecordListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '审核编号',
                    '用户编号',
                    '用户名',
                    '真实姓名',
                    '联系方式',
                    '订单编号',
                    '折扣金额',
                    '打折时间',
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
                    element.remark == null ? '' : element.remark,
                  ]
                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '订单折扣申请列表')
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
    handleOkbohui() {
      const that = this
      if (that.bohuidata.remark == '' || that.bohuidata.remark == null) {
        that.$message.warning('请输入驳回理由!')
        return
      }
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      formdate.id = that.onedata.id
      formdate.remark = that.bohuidata.remark
      formdate.status = 4
      formdate.order_info_id = that.onedata.order_info_id
      formdate.user_id = that.onedata.user_id
      formdate.money = that.onedata.totalprice
      formdate.changetype = '总经办审核驳回'
      this.$request({
        url: '/user/shenheDiscountSuccess',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.visibleshenhe = false
            that.visiblebohui = false
            that.getAllDiscountRecordListpage()
            that.$message.success('驳回成功!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    shenhebohui() {
      const that = this
      that.visiblebohui = true
      that.bohuidata = {}
    },
    shenhetongguo() {
      const that = this
      this.$confirm({
        title: '是否确定审核通过?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          var formdate = {}
          formdate.bills_type = 'GeneralmanagerDiscountRecord'
          formdate.id = that.onedata.id
          formdate.myid = that.$store.state.admin.user_id
          formdate.order_info_id = that.onedata.order_info_id
          formdate.user_id = that.onedata.user_id
          formdate.money = that.onedata.totalprice
          formdate.status = 2
          formdate.changetype = '总经办审核通过'
          this.$request({
            url: '/user/shenheDiscountSuccess',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.visibleshenhe = false
                that.getAllDiscountRecordListpage()
                that.$message.success('审核通过!')
              }
            })
            .catch(function () {
              that.$message.error('抱歉,未知错误,请联系管理员!')
            })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    handleShenhe(e) {
      const that = this
      that.visibleshenhe = true
      that.onedata = e
      console.log('111111111')
      console.log(that.onedata)
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
      that.getAllDiscountRecordListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllDiscountRecordListpage()
    },
    getAllDiscountRecordListpage() {
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
      formdate.zongjinban = 'yes'
      that.spinning = true
      that
        .$request({
          url: '/user/getAllDiscountRecordListpage',
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
