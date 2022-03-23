<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 8px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      type="primary"
      @click="getAllCardsDataListpage"
      :loading="spinning"
    >
      搜索
    </a-button>
    <a-button
      class="editable-add-btn"
      type="primary"
      @click="addfenfa"
      v-if="$store.state.rights[7].children[1].children[0].fenfa == 1"
      style="margin-left: 16px"
      :loading="spinning"
    >
      +发放卡券
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
    >
      导出发放卡券记录列表
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
        <template slot="user_coupon_creatime" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <template slot="coupon_status" slot-scope="text">
          <a-badge :status="text == 0 ? 'default' : text == 1 ? 'success' : 'error'" />
          {{ text == 0 ? '未使用' : text == 1 ? '已使用' : '已过期' }}
        </template>
        <template slot="title"> 卡券列表 </template>
      </a-table>
    </a-spin>

    <div>
      <a-modal
        title="发放卡券"
        :visible="ifshouaddandedit"
        :confirm-loading="false"
        okText="保存"
        @ok="savedata"
        :centered="true"
        @cancel="
          () => {
            this.ifshouaddandedit = false
            this.onecarddata = []
          }
        "
        cancelText="取消"
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <a-row>
              <a-col :span="12">
                <a-form-item label="卡券说明:">
                  <a-select
                    size="large"
                    style="width: 230px; margin-right: 8px"
                    show-search
                    placeholder="卡券说明"
                    option-filter-prop="children"
                    allowClear
                    v-model="onecarddata.coupon_id"
                  >
                    <a-select-option
                      v-for="(items, index) in allcarddata"
                      :key="index"
                      :label="items.coupon_type"
                      :value="items.coupon_id"
                      >{{ items.coupon_type }}</a-select-option
                    >
                  </a-select>
                </a-form-item></a-col
              >
              <a-col :span="12">
                <a-form-item label="发放用户:">
                  <a-select
                    size="large"
                    mode="multiple"
                    placeholder="发放用户"
                    style="width: 230px"
                    @change="changeuserdata"
                    v-model="onecarddata.user_id"
                    :allowClear="true"
                    show-search
                    option-filter-prop="children"
                  >
                    <a-select-option
                      v-for="(action, index) in alluserdata"
                      :key="index"
                      :disabled="disabled"
                      :value="action.user_id"
                      >{{ action.user_phone }}</a-select-option
                    >
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-spin>
        </div>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
const columns1 = [
  {
    title: '分发记录发编号',
    dataIndex: 'user_coupon_id',
    width: 120,
    sorter: true,
  },
  {
    title: '用户编号',
    dataIndex: 'user_id',
    width: 120,
    sorter: true,
  },
  {
    title: '用户名',
    sorter: true,
    dataIndex: 'user_name',
  },
  {
    title: '用户真实姓名',
    sorter: true,
    dataIndex: 'user_realname',
  },
  {
    title: '用户手机号',
    sorter: true,
    dataIndex: 'user_phone',
  },
  {
    title: '用户地址',
    sorter: true,
    dataIndex: 'user_address',
  },
  {
    title: '卡券说明',
    sorter: true,
    dataIndex: 'coupon_type',
  },
  {
    title: '卡券开始日期',
    dataIndex: 'coupon_front',
  },

  {
    title: '卡券到期日期',
    dataIndex: 'coupon_hours',
  },
  {
    title: '卡券状态',
    dataIndex: 'coupon_status',
    scopedSlots: { customRender: 'coupon_status' },
  },
  {
    title: '发放时间',
    dataIndex: 'user_coupon_creatime',
    scopedSlots: { customRender: 'user_coupon_creatime' },
  },
]
export default {
  name: 'CommonUser',
  components: {
    locale,
  },
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      allcarddata: [],
      alluserdata: [],
      columns1,
      locale,
      tabletype: 1,
      disabled: false,
      ifshouaddandedit: false,
      ifadddata: false,
      spinning: false,
      onecarddata: {},
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllCardsDataListpage()
    that.getAllCards()
    that.getalluser()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出卡券发放记录列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllCardDistributionListPage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '分发记录发编号',
                    '用户名',
                    '用户真实姓名',
                    '用户手机号',
                    '用户地址',
                    '卡券说明',
                    '卡券状态',
                    '卡券开始日期',
                    '卡券到期日期',
                    '卡券状态',
                    '卡券发放时间'
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.user_coupon_id == null ? '' : element.user_coupon_id,
                    element.user_name == null ? '' : element.user_name,
                    element.user_realname == null ? '' : element.user_realname,
                    element.user_phone == null ? '' : element.user_phone,
                    element.user_address == null ? '' : element.user_address,
                    element.coupon_type == null ? '' : element.coupon_type,
                    element.coupon_front == null ? '' : element.coupon_front,
                    element.coupon_hours == null ? '' : element.coupon_hours,
                    element.coupon_status == null
                      ? ''
                      : element.coupon_status == 0
                      ? '未使用'
                      : text == 1
                      ? '已使用'
                      : '已过期',
                    element.user_coupon_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.user_coupon_creatime))
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '卡券发放记录列表')
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
    changeuserdata() {
      if (this.onecarddata.user_id == 0) {
        this.disabled = true
      }
      if (this.onecarddata.user_id == '' || this.onecarddata.user_id == null) {
        this.disabled = false
      }
    },
    getalluser() {
      const that = this
      that.alluserdata = []
      var formdate = {}
      that
        .$request({
          url: '/user/getAllCommonUsersDataListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
           
            // res.data.forEach((item) => {
            //   item.onedata =
            //     item.user_phone + (item.user_realname != null && item.user_realname != '' ? '' :  '('+ item.user_realname+ ')') 
            // })
             res.data.unshift({
              user_id: 0,
              user_phone: '全部',
            })
            that.alluserdata = res.data
          }
        })
        .catch(function () {
          that.spinning = false
        })
    },
    getAllCards() {
      const that = this
      that.allcarddata = []
      var formdate = {}
      that.spinning = true
      that
        .$request({
          url: '/user/getAllCardListPage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.allcarddata = res.data
          }
        })
        .catch(function () {
          that.spinning = false
        })
    },
    addfenfa() {
      const that = this
      that.ifshouaddandedit = true
      that.ifadddata = true
    },
    savedata() {
      const that = this
      if (that.onecarddata.coupon_id == '' || that.onecarddata.coupon_id == null) {
        that.$message.warning('请选择发放卡卷类型!')
        return
      }
      if (that.onecarddata.user_id == '' || that.onecarddata.user_id == null) {
        that.$message.warning('请选择发放用户!')
        return
      }
      if (that.onecarddata.user_id == 0) {
        that.onecarddata.user_id = []
        that.alluserdata.forEach((element) => {
          if (element.user_id != 0) {
            that.onecarddata.user_id.push(element.user_id)
          }
        })
        that.onecarddata.user_id = that.onecarddata.user_id.join(',')
      } else {
        that.onecarddata.user_id = that.onecarddata.user_id.join(',')
      }
      that.onecarddata.bills_type = 'DistributionRecord'
      that.onecarddata.myid = that.$store.state.admin.user_id
      if (that.ifadddata) {
        //新增信息
        that.spinning = true
        this.$request({
          url: '/user/addCardFenfaData',
          method: 'get',
          params: that.onecarddata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.ifshouaddandedit = false
              that.ifadddata = false
              that.onecarddata = {}
              that.getAllCardsDataListpage()
              that.$message.success('卡卷分发成功!')
            } else {
              that.spinning = false
              that.$message.error('抱歉,未知错误,请联系管理员!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllCardsDataListpage()
    },
    getAllCardsDataListpage() {
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
      that.spinning = true
      that
        .$request({
          url: '/user/getAllCardDistributionListPage',
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
