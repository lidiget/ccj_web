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
      type="primary"
      @click="addzhuguan"
      :loading="spinning"
      v-if="$store.state.rights[5].children[1].children[0].add == 1"
    >
      +新增主管
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
        <template slot="role" slot-scope="text">{{ text == 0 ? '普通销售' : '销售主管' }}</template>
        <span slot="action" slot-scope="text, record">
          <template v-if="$store.state.rights[5].children[1].children[0].edit == 1">
            <a @click="chexiaozhuguan(record)">撤销主管</a>
            <a-divider type="vertical" v-if="$store.state.rights[5].children[1].children[0].edit == 1" />
          </template>
          <template v-if="$store.state.rights[5].children[1].children[0].edit == 1">
            <a @click="fenpeixiaoshou(record)">分配销售</a>
            <a-divider type="vertical" v-if="$store.state.rights[5].children[1].children[0].edit == 1" />
          </template>
          <template v-if="$store.state.rights[5].children[1].children[0].edit == 1">
            <a @click="chakanzuyuan(record)">查看组员</a>
          </template>
        </span>
      </a-table>
    </a-spin>
    <a-modal
      title="新增主管"
      style="top: 20px"
      :maskClosable="false"
      :destroyOnClose="true"
      v-model="visible"
      :confirmLoading="spinning"
      @ok="handleOk"
      @cancel="
        () => {
          this.visible = false
          this.newsellid = ''
        }
      "
      okText="保存"
      cancelText="取消"
    >
      <span :spinning="spinning" size="large">
        <a-form-item label="选择销售:">
          <a-select size="large" placeholder="选择销售" style="width: 230px" v-model="newsellid" allowClear>
            <a-select-option
              v-for="(items, index) in allnewzhuguan"
              :key="index"
              :label="items.name"
              :value="items.id"
              >{{ items.name }}</a-select-option
            >
          </a-select>
        </a-form-item>
      </span>
    </a-modal>

    <a-modal
      title="绑定组员"
      style="top: 20px"
      :maskClosable="false"
      :destroyOnClose="true"
      v-model="visiblebangding"
      :confirmLoading="spinning"
      @ok="handleOkbangding"
      @cancel="
        () => {
          this.visiblebangding = false
          this.onedata = {}
        }
      "
      okText="保存"
      cancelText="取消"
    >
      <span :spinning="spinning" size="large">
        <a-form-item label="选择销售:">
          <a-select
            size="large"
            mode="multiple"
            placeholder="选择销售"
            style="width: 230px"
            v-model="onedata.id"
            :allowClear="true"
            show-search
            option-filter-prop="children"
          >
            <a-select-option v-for="(action, index) in fenpeizhuguan" :key="index" :value="action.id">{{
              action.name
            }}</a-select-option>
          </a-select>
        </a-form-item>
      </span>
    </a-modal>

    <a-modal
      title="查看组员"
      style="top: 20px"
      :maskClosable="false"
      :destroyOnClose="true"
      v-model="visiblezuyuan"
      :confirmLoading="spinning"
      @cancel="
        () => {
          this.visiblezuyuan = false
          this.bangdingedid = ''
        }
      "
      :footer="null"
    >
      <span :spinning="spinning" size="large">
        <a-table :columns="zuyuancloums" :data-source="zuyuandata" size="small">
          <template slot="role" slot-scope="text">{{ text == 0 ? '普通销售' : '销售主管' }}</template>
          <span slot="action" slot-scope="text, record">
            <template v-if="$store.state.rights[5].children[1].children[0].edit == 1">
              <a @click="quchubangding(record)">解除绑定</a>
              <a-divider type="vertical" />
            </template>
            <template v-if="$store.state.rights[5].children[1].children[0].edit == 1">
              <a @click="handleEdit(record)">查看相关用户</a>
            </template>
          </span>
        </a-table>
      </span>
    </a-modal>

    <div>
      <a-modal
        title="相关用户"
        width="700px"
        :visible="visibleyonghu"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visibleyonghu = false
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-table :columns="yonghuColumns" :data-source="yonghudetail" size="small">
              <span slot="action" slot-scope="text, record">
                <template v-if="$store.state.rights[5].children[1].children[0].edit == 1">
                  <a @click="handleEdit123(record)">查看相关订单</a>
                </template>
              </span>
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="订单详情"
        width="700px"
        :visible="visibledingdan"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visibledingdan = false
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
  </a-card>
</template>

<script>
const yonghuColumns = [
  {
    title: '用户编号',
    width: 120,
    dataIndex: 'user_id',
  },
  {
    title: '用户名',
    dataIndex: 'user_name',
  },
  {
    title: '真实姓名',
    dataIndex: 'user_realname',
  },
  {
    title: '用户地址',
    dataIndex: 'user_address',
  },
  {
    title: '操作',
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
const zuyuancloums = [
  {
    title: '编号',
    dataIndex: 'id',
  },
  {
    title: '销售人员',
    dataIndex: 'name',
  },
  {
    title: '职位',
    dataIndex: 'role',
    scopedSlots: { customRender: 'role' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
const columns = [
  {
    title: '销售',
    sorter: true,
    dataIndex: 'name',
  },
  {
    title: '职位',
    sorter: true,
    dataIndex: 'role',
    scopedSlots: { customRender: 'role' },
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
      form: this.$form.createForm(this),
      columns,
      visible: false,
      visiblezuyuan: false,
      zuyuancloums,
      yonghuColumns,
      detailColumns,
      visibleyonghu: false,
      visibledingdan: false,
      visiblebangding: false,
      zuyuandata: [],
      yonghudetail: [],
      fenpeizhuguan: [],
      oderdetail: [],
      spinning: false,
      onedata: {},
      zhuguanid: '',
      newsellid: '',
      confirmLoading: false,
      changetype: 0,
      keywords: '',
      orderstatus: '',
      status: '',
      bangdingedid: '',
      oderdetail: [],
      allnewzhuguan: [],
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllSellListpage()
  },
  methods: {
    handleEdit(e) {
      const that = this
      console.log('111111111111')
      console.log(e)
      that.visibleyonghu = true
      that.spinning = true
      var formdate = {}
      formdate.sell_id = e.id
      that
        .$request({
          url: '/user/getAllCommonUsersDataListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.yonghudetail = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },

    handleEdit123(e) {
      const that = this
      console.log('111111111111')
      console.log(e)
      that.visibledingdan = true
      that.spinning = true
      var formdate = {}
      formdate.userid = e.user_id
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
    quchubangding(e) {
      const that = this
      this.$confirm({
        title: '是否确定将该销售从该销售主管中移除?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.id = e.id
          formdate.zhuguanid = 1
          that.spinning = true
          this.$request({
            url: '/user/changeRoleBySellid',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.restart()
                that.$message.success('删除成功!')
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
    handleOkbangding() {
      const that = this
      if (that.onedata.id == '' || that.onedata.id == null) {
        that.$message.warning('请选择销售!')
        return
      }
      that.onedata.id = that.onedata.id.join(',')
      var formdata = {}
      formdata.zhuguanid = that.zhuguanid
      formdata.allid = that.onedata.id
      that.spinning = true
      this.$request({
        url: '/user/updataAllzhuguanid',
        method: 'get',
        params: formdata,
      })
        .then((res) => {
          if (res.status == 200) {
            that.spinning = false
            that.visiblebangding = false
            that.zhuguanid = ''
            that.onedata = {}
            that.$message.success('新增组员信息成功!')
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
    restart() {
      const that = this
      that.spinning = true
      var formdate = {}
      formdate.bangdingid = that.bangdingedid
      that
        .$request({
          url: '/user/selectAllSell',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          that.spinning = false
          if (res.status == 200) {
            that.zuyuandata = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    chakanzuyuan(e) {
      const that = this
      that.visiblezuyuan = true
      var formdate = {}
      that.bangdingedid = e.id
      formdate.bangdingid = e.id
      that
        .$request({
          url: '/user/selectAllSell',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          that.spinning = false
          if (res.status == 200) {
            that.zuyuandata = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    addzhuguan() {
      this.visible = true
      const that = this
      var formdate = {}
      that.spinning = true
      formdate.nozhuguan = 'ye'
      that
        .$request({
          url: '/user/selectAllSell',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          that.spinning = false
          if (res.status == 200) {
            that.allnewzhuguan = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleCancel() {
      const that = this
      that.visible = false
    },
    chexiaozhuguan(e) {
      const that = this
      this.$confirm({
        title: '是否确定撤销该销售主管?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.myid = that.$store.state.admin.user_id
          formdate.id = e.id
          formdate.role = 0
          that.spinning = true
          this.$request({
            url: '/user/getUseridBySellid',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                if (res.data.user_id) {
                  formdate.user_id = res.data.user_id
                  formdate.sell_leve = '1'
                } else {
                  res.data.user_id = ''
                }
                this.$request({
                  url: '/user/changeRoleBySellid',
                  method: 'get',
                  params: formdate,
                })
                  .then((res) => {
                    if (res.code == 200) {
                      that.spinning = false
                      that.getAllSellListpage()
                      that.$message.success('撤销主管成功!')
                    }
                  })
                  .catch(function () {
                    that.spinning = false
                    that.$message.error('抱歉,未知错误,请联系管理员!')
                  })
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
    fenpeixiaoshou(e) {
      const that = this
      this.visiblebangding = true
      that.zhuguanid = e.id
      var formdate = {}
      formdate.nobangdingid = 'yes'
      that
        .$request({
          url: '/user/selectAllSell',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          that.spinning = false
          if (res.status == 200) {
            that.fenpeizhuguan = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleOk(e) {
      const that = this
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      formdate.id = that.newsellid
      formdate.role = 1
      that.spinning = true
      this.$request({
        url: '/user/getUseridBySellid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            if (res.data.user_id) {
              formdate.user_id = res.data.user_id
              formdate.sell_leve = '2'
            } else {
              res.data.user_id = ''
            }
            this.$request({
              url: '/user/changeRoleBySellid',
              method: 'get',
              params: formdate,
            })
              .then((res) => {
                if (res.code == 200) {
                  that.spinning = false
                  that.visible = false
                  that.allnewzhuguan = {}
                  that.newsellid = ''
                  that.getAllSellListpage()
                  that.$message.success('新增主管成功!')
                }
              })
              .catch(function () {
                that.spinning = false
                that.$message.error('抱歉,未知错误,请联系管理员!')
              })
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onSearch() {
      const that = this
      that.getAllSellListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllSellListpage()
    },
    getAllSellListpage() {
      const that = this
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      formdate.zhuguan = 'yes'
      that.spinning = true
      that
        .$request({
          url: '/user/selectAllSell',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          that.spinning = false
          if (res.status == 200) {
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
