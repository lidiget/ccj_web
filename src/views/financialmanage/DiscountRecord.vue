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
      导出厂商信息
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
          <a-badge :status="text == 0 ? 'default' : text == 1|| text == 2 ? 'success' : 'error'" />
          {{ text == 0 ? '审核中' : text == 1|| text == 2? '已通过' : '已驳回' }}
        </template>
        <span slot="action" slot-scope="text, record">
          <template v-if="$store.state.rights[10].children[4].children[0].edit == 1 && record.examine_status == 0">
            <a @click="handleShenhe(record)">审核</a>
            <a-divider type="vertical" v-if="$store.state.rights[10].children[4].children[0].edit == 1" />
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
              :maxLength="200"
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
    width: 120,
    dataIndex: 'examine_status',
    scopedSlots: { customRender: 'examine_status' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 200,
  },
  {
    title: '操作',
    width: 150,
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
      onedata: {},
      bohuidata: {},
      detailColumns,
      visible: false,
      spinning: false,
      visiblebohui: false,
      visibleshenhe: false,
      keywords: '',
      jinjie: 0,
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllDiscountRecordListpage()
    that.getjinjie()
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
          formdate.caiwu = 'yes'
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
    getjinjie() {
      this.$request({
        url: '/user/selectAll',
        method: 'get',
        params: {
          table: 'shop_freight',
        },
      })
        .then((res) => {
          if (res.status == 200) {
            this.spinning = false
            this.jinjie = res.data[13]['shop_freight_menoy']
            console.log('111111111')
            console.log(res.data[13])
          }
        })
        .catch(() => {
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
      var formdate = {}
      formdate.id = that.onedata.id
      formdate.money = that.onedata.totalprice
      formdate.order_info_id = that.onedata.order_info_id
      formdate.user_id = that.onedata.user_id
      formdate.myid = that.$store.state.admin.user_id
      formdate.remark = that.bohuidata.remark
      formdate.status = 4
      formdate.bills_type = 'DiscountRecord'
      formdate.changetype = '财务审核驳回'
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
      console.log('阿萨大大是')
      console.log(this.jinjie)
      if (Number(that.onedata.totalprice) > Number(this.jinjie)) {
        this.$confirm({
          title: '是否确定审核通过?,注：因为折扣大于警戒金额' + this.jinjie + '元，通过后需要移交总经办审核！',
          okText: '继续',
          okType: 'danger',
          centered: true,
          cancelText: '取消',
          onOk: () => {
            console.log('OK')
            console.log(that.onedata)
            var formdate = {}
            formdate.id = that.onedata.id
            formdate.bills_type = 'DiscountRecord'
            formdate.order_info_id = that.onedata.order_info_id
            formdate.user_id = that.onedata.user_id
            formdate.myid = that.$store.state.admin.user_id
            formdate.status = 1
            formdate.changetype = '财务审核通过'
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
      } else {
        this.$confirm({
          title: '是否确定审核通过,注：因为折扣小于警戒金额' + this.jinjie + '元，可以直接通过审核！',
          okText: '继续',
          okType: 'danger',
          centered: true,
          cancelText: '取消',
          onOk: () => {
            console.log('OK')
            console.log(that.onedata)
            var formdate = {}
            formdate.id = that.onedata.id
            formdate.bills_type = 'DiscountRecord'
            formdate.order_info_id = that.onedata.order_info_id
            formdate.user_id = that.onedata.user_id
            formdate.myid = that.$store.state.admin.user_id
            formdate.status = 2
            formdate.changetype = '财务及总经办审核通过'
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
      }
    },
    handleShenhe(e) {
      const that = this
      that.visibleshenhe = true
      that.onedata = e
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
      formdate.caiwu = 'yes'
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
