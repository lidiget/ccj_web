<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search style="margin-right: 30px; width: 272px; margin-bottom: 16px" v-model="keywords" />
    选择用户:
    <a-select
      placeholder="选择用户"
      option-filter-prop="children"
      style="width: 190px; margin-left: 8px; margin-right: 30px"
      v-model="user_id"
      allowClear
    >
      <a-select-option v-for="(items, index) in alluser" :key="index" :label="items.nick_name" :value="items.user_id">{{
        items.nick_name
      }}</a-select-option>
    </a-select>
    表单类型:
    <a-select
      style="width: 190px; margin-left: 8px; margin-right: 30px"
      show-search
      allowClear
      placeholder="表单类型"
      option-filter-prop="children"
      v-model="jilutype"
    >
      <a-select-option :value="'adminForm'"> 系统用户管理 </a-select-option>
      <a-select-option :value="'authorityManagement'"> 权限管理 </a-select-option>
      <a-select-option :value="'CommonUser'"> 普通用户管理 </a-select-option>
      <a-select-option :value="'WorkUser'"> 工人用户管理 </a-select-option>
      <a-select-option :value="'LogisticsManagement'"> 物流信息管理 </a-select-option>
      <a-select-option :value="'ShopGoodsManagement'"> 材料管理 </a-select-option>
      <a-select-option :value="'SellingShopGoodsManage'"> 直销材料管理 </a-select-option>
      <a-select-option :value="'GoodsSellingMange'"> 厂商信息管理 </a-select-option>
      <a-select-option :value="'GoodsSellingAddressMange'"> 厂商地址信息管理 </a-select-option>
      <a-select-option :value="'GoodsUnitMange'"> 材料单位管理 </a-select-option>
      <a-select-option :value="'SizeGoodsUnitMange'"> 规格单位管理 </a-select-option>
      <a-select-option :value="'GoodsColorMange'"> 材料颜色管理 </a-select-option>
      <a-select-option :value="'taskworktype'"> 工种管理 </a-select-option>
      <a-select-option :value="'XiaoShouManager'"> 邀请码管理 </a-select-option>
      <a-select-option :value="'ProjectManager'"> 任务管理 </a-select-option>
      <a-select-option :value="'CardList'"> 卡券管理 </a-select-option>
      <a-select-option :value="'DistributionRecord'"> 卡券发放记录 </a-select-option>
      <a-select-option :value="'CarParametersSet'"> 车辆参数管理 </a-select-option>
      <a-select-option :value="'KaipiaoRecord'"> 财务开票审核 </a-select-option>
      <a-select-option :value="'DiscountRecord'"> 财务折扣审核 </a-select-option>
      <a-select-option :value="'GeneralmanagerDiscountRecord'"> 总经办折扣审核 </a-select-option>
    </a-select>
    请选择时间：
    <a-range-picker @change="onChange" size="default" :locale="locale"> </a-range-picker>
    <a-button style="margin-left: 10px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
    >
      导出用户操作记录列表
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
        <template slot="user_operation_record_createtime" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <template slot="title"> 用户操作记录 </template>
      </a-table>
    </a-spin>
  </a-card>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
const columns1 = [
  {
    title: '记录编号',
    dataIndex: 'user_operation_record_id',
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
  {
    title: '用户操作类型',
    sorter: true,
    dataIndex: 'user_operation_record_type',
  },
  {
    title: '用户操作细节',
    sorter: true,
    width: 400,
    dataIndex: 'user_operation_record_detail',
  },
  {
    title: '用户操作时间',
    dataIndex: 'user_operation_record_createtime',
    scopedSlots: { customRender: 'user_operation_record_createtime' },
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
      locale,
      alluser: [],
      data: [],
      formInline: {
        timerange: [],
      },
      columns1,
      user_id: '',
      jilutype: '',
      spinning: false,
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    var endtime = new Date()
    var starttime = new Date(endtime.getTime() - 24 * 60 * 60 * 1000 * 7)
    that.formInline.timerange = [starttime, endtime]
    that.getAllUserOperationRecordListpage()
    that.getAlluserdata()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出用户操作记录列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllUserOperationRecordListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['记录编号', '用户编号', '用户名', '用户操作类型', '用户操作细节', '用户操作时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.user_operation_record_id == null ? '' : element.user_operation_record_id,
                    element.user_id == null ? '' : element.user_id,
                    element.username == null ? '' : element.username,
                    element.user_operation_record_type == null ? '' : element.user_operation_record_type,
                    element.user_operation_record_detail == null ? '' : element.user_operation_record_detail,
                    element.user_operation_record_createtime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.user_operation_record_createtime)),
                  ]
                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '用户操作记录列表')
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
    getAlluserdata() {
      const that = this
      var formdate = {}
      that
        .$request({
          url: '/user/getAllAdminListPage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.alluser = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
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
    onSearch() {
      const that = this
      that.getAllUserOperationRecordListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllUserOperationRecordListpage()
    },
    getAllUserOperationRecordListpage() {
      const that = this
      that.data = []
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.jilutype != '') {
        formdate.bills_type = that.jilutype
      }
      if (that.user_id != '') {
        formdate.user_id = that.user_id
      }
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      if (that.formInline.timerange) {
        that.formInline.starttime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[0]))
        that.formInline.endtime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[1]))
        if (that.formInline.times == 'month') {
          that.formInline.starttime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[0]))
          that.formInline.endtime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[1]))
        }
      }
      formdate.starttime = that.formInline.starttime
      formdate.endtime = that.formInline.endtime
      that.spinning = true
      that
        .$request({
          url: '/user/getAllUserOperationRecordListpage',
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
