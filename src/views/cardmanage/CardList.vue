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
      @click="
        () => {
          this.ifshouaddandedit = true
          this.ifadddata = true
          this.xianshidata = false
        }
      "
      style="margin-left: 16px"
      :loading="spinning"
      v-if="$store.state.rights[7].children[0].children[0].add == 1"
    >
      +新增
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
    >
      导出卡券列表
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
        <template slot="cardstatus" slot-scope="text">
          <a-badge :status="text == 0 ? 'default' : text == 1 ? 'success' : 'error'" />
          {{ text == 0 ? '未使用' : text == 1 ? '已使用' : '已过期' }}
        </template>
        <template slot="coupon_creatime" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)" v-if="$store.state.rights[7].children[0].children[0].edit == 1">修改</a>
            <a-divider type="vertical" v-if="$store.state.rights[7].children[0].children[0].edit == 1" />
          </template>
          <!-- <template>
            <a
              @click="qiyong(record)"
              v-if="$store.state.rights[7].children[0].children[0].edit == 1 && record.coupon_status == 2"
              >启用</a
            >
            <a-divider
              type="vertical"
              v-if="$store.state.rights[7].children[0].children[0].edit == 1 && record.coupon_status == 2"
            />
          </template>
          <template>
            <a
              @click="jingyong(record)"
              v-if="$store.state.rights[7].children[0].children[0].edit == 1 && record.coupon_status != 2"
              >禁用</a
            >
            <a-divider
              type="vertical"
              v-if="$store.state.rights[7].children[0].children[0].edit == 1 && record.coupon_status != 2"
            />
          </template> -->
          <template>
            <a @click="handleDelete(record)" v-if="$store.state.rights[7].children[0].children[0].delete == 1">删除</a>
            <a-divider type="vertical" v-if="$store.state.rights[7].children[0].children[0].delete == 1" />
          </template>
          <template>
            <a @click="showhistory(record)">历史记录</a>
          </template>
        </span>
        <template slot="title"> 卡券列表 </template>
      </a-table>
    </a-spin>

    <div>
      <a-modal
        :title="ifadddata ? '新增卡券信息' : '卡券信息编辑'"
        :visible="ifshouaddandedit"
        :confirm-loading="false"
        okText="保存"
        @ok="savedata"
        :centered="true"
        @cancel="
          () => {
            this.ifshouaddandedit = false
            this.onecarddata = {}
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
                  <a-input
                    size="large"
                    type="text"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="卡券说明"
                    v-model="onecarddata.coupon_type"
                  ></a-input> </a-form-item
              ></a-col>
              <a-col :span="12">
                <a-form-item label="卡券金额:">
                  <a-input-number
                    id="1"
                    size="large"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="卡券金额"
                    v-model="onecarddata.coupon_moeny"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="满减额度:">
                  <a-input-number
                    id="2"
                    size="large"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="满减额度"
                    v-model="onecarddata.coupon_explain"
                    :min="0"
                  /> </a-form-item
              ></a-col>
              <a-col :span="12">
                <a-form-item label="卡券使用日期:" v-if="xianshidata">
                  <a-input
                    size="large"
                    type="text"
                    style="width: 230px"
                    placeholder="卡券使用日期"
                    allowClear
                    @change="datechange"
                    readonly="true"
                    v-model="onecarddata.usedata"
                  ></a-input>
                </a-form-item>
                <a-form-item v-if="!xianshidata" label="卡券使用日期:">
                  <a-range-picker @change="onChange" size="large" :locale="locale"> </a-range-picker>
                </a-form-item>
              </a-col>
            </a-row>
          </a-spin>
        </div>
      </a-modal>
      <div>
        <a-modal
          title="历史操作记录"
          width="700px"
          :visible="ifshowhistory"
          :confirm-loading="false"
          @cancel="
            () => {
              this.ifshowhistory = false
              this.historydata = []
            }
          "
          :destroyOnClose="true"
          :centered="true"
          :footer="null"
        >
          <p>
            <a-spin :spinning="spinning">
              <a-table :columns="historyColumns" :data-source="historydata" size="small">
                <template slot="user_operation_record_createtime" slot-scope="text">
                  {{ text | dayjs }}
                </template>
              </a-table>
            </a-spin>
          </p>
        </a-modal>
      </div>
    </div>
  </a-card>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
const columns1 = [
  {
    title: '卡券编号',
    dataIndex: 'coupon_id',
    width: 120,
    sorter: true,
  },
  {
    title: '卡券说明',
    sorter: true,
    dataIndex: 'coupon_type',
  },
  {
    title: '满减额度',
    sorter: true,
    dataIndex: 'coupon_explain',
  },
  {
    title: '卡券金额',
    sorter: true,
    dataIndex: 'coupon_moeny',
  },
  {
    title: '卡券开始日期',
    dataIndex: 'coupon_front',
  },
  {
    title: '卡券到期时期',
    dataIndex: 'coupon_hours',
  },
  {
    title: '卡券创建时间',
    dataIndex: 'coupon_creatime',
    scopedSlots: { customRender: 'coupon_creatime' },
  },
  {
    title: '卡券状态',
    dataIndex: 'cardstatus',
    scopedSlots: { customRender: 'cardstatus' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '150px',
    scopedSlots: { customRender: 'action' },
  },
]
const historyColumns = [
  {
    title: '编号',
    dataIndex: 'user_id',
  },
  {
    title: '操作人员',
    dataIndex: 'username',
  },
  {
    title: '类型',
    dataIndex: 'user_operation_record_type',
  },
  {
    title: '用户操作细节',
    dataIndex: 'user_operation_record_detail',
  },
  // {
  //   title: '修改数据记录',
  //   dataIndex: 'user_operation_record_olddetail',
  // },
  {
    title: '用户操作时间',
    width: 150,
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
      data: [],
      columns1,
      locale,
      olddata: {},
      historyColumns,
      ifshowhistory: false,
      historydata: [],
      tabletype: 1,
      xianshidata: false,
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
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出卡券信息列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllCardListPage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  ['卡券编号', '卡券说明', '满减额度', '卡券金额', '卡券开始时间', '卡券到期时间','卡券创建时间'],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.coupon_id == null ? '' : element.coupon_id,
                    element.coupon_type == null ? '' : element.coupon_type,
                    element.coupon_explain == null ? '' : element.coupon_explain,
                    element.coupon_moeny == null ? '' : element.coupon_moeny,
                    element.coupon_front == null ? '' : element.coupon_front,
                    element.coupon_hours == null ? '' : element.coupon_hours,
                    element.coupon_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.coupon_creatime))
                  ]
                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '卡券信息列表')
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
    showhistory(e) {
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'CardList'
      formdate.id = e.coupon_id
      this.$request({
        url: '/user/getAllUserOperationRecordListpage',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.historydata = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    datechange() {
      const that = this
      that.xianshidata = false
      if (that.onecarddata.usedata == '' || that.onecarddata.usedata == null) {
        that.onecarddata.coupon_front = ''
        that.onecarddata.coupon_hours = ''
      }
    },
    onChange(date, dateString) {
      const that = this
      that.onecarddata.coupon_front = dateString[0]
      that.onecarddata.coupon_hours = dateString[1]
      // that.onecarddata.usedata = dateString[0]+"~"+dateString[1];
    },
    handleEdit(e) {
      const that = this
      that.olddata = e
      that.ifadddata = false
      that.xianshidata = true
      var aa = {}
      aa.coupon_moeny = e.coupon_moeny
      aa.coupon_type = e.coupon_type
      aa.coupon_explain = e.coupon_explain
      aa.coupon_id = e.coupon_id
      aa.coupon_status = e.coupon_status
      aa.coupon_front = e.coupon_front
      aa.coupon_hours = e.coupon_hours
      aa.usedata = e.coupon_front + '~' + e.coupon_hours
      that.onecarddata = aa
      that.ifshouaddandedit = true
    },
    qiyong(e) {
      this.$confirm({
        title: '是否确定启用该卡券?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          this.updatebyid1(e)
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    jingyong(e) {
      this.$confirm({
        title: '是否确定禁用该卡券?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          this.updatebyid(e)
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    updatebyid1(e) {
      const that = this
      var formdate = {}
      formdate.bills_type = 'CardList'
      formdate.coupon_id = e.coupon_id
      formdate.coupon_type = e.coupon_type
      formdate.myid = that.$store.state.admin.user_id
      formdate.coupon_status = 1
      formdate.changetype = '启用'
      this.$request({
        url: '/user/updataCardstatusdataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.status == 200) {
            that.getAllCardsDataListpage()
            that.$message.success('启用成功!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    updatebyid(e) {
      const that = this
      var formdate = {}
      formdate.bills_type = 'CardList'
      formdate.coupon_id = e.coupon_id
      formdate.coupon_type = e.coupon_type
      formdate.myid = that.$store.state.admin.user_id
      formdate.coupon_status = 2
      formdate.changetype = '禁用'
      this.$request({
        url: '/user/updataCardstatusdataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.status == 200) {
            that.xianshidata = false
            that.getAllCardsDataListpage()
            that.$message.success('禁用成功!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleDelete(e) {
      this.$confirm({
        title: '是否确定删除该卡券?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          this.deletebyid(e)
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    deletebyid(e) {
      const that = this
      var formdate = {}
      formdate.bills_type = 'CardList'
      formdate.id = e.coupon_id
      formdate.coupon_type = e.coupon_type
      formdate.myid = that.$store.state.admin.user_id
      this.$request({
        url: '/user/deleteOneCarddataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.status == 200) {
            that.getAllCardsDataListpage()
            that.$message.success('删除卡卷信息成功!')
          } else if (res.status == 201) {
            that.$message.error('卡卷已经分发,无法删除，只能禁用!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    savedata() {
      const that = this
      console.log(that.onecarddata)
      if (that.onecarddata.coupon_type == '' || that.onecarddata.coupon_type == null) {
        that.$message.warning('请填写卡卷说明!')
        return
      }
      if (that.onecarddata.coupon_moeny == '' || that.onecarddata.coupon_moeny == null) {
        that.$message.warning('请填写卡卷金额!')
        return
      }
      if (that.onecarddata.coupon_explain == '' || that.onecarddata.coupon_explain == null) {
        that.$message.warning('请填写满减金额!')
        return
      }
      if (
        that.onecarddata.coupon_front == '' ||
        that.onecarddata.coupon_front == null ||
        that.onecarddata.coupon_hours == '' ||
        that.onecarddata.coupon_hours == null
      ) {
        that.$message.warning('请选择卡卷使用时间!')
        return
      }
      that.onecarddata.bills_type = 'CardList'
      that.onecarddata.myid = that.$store.state.admin.user_id

      if (that.ifadddata) {
        //新增信息
        that.onecarddata.user_operation_record_detail = '新增卡券：' + that.onecarddata.coupon_type
        that.spinning = true
        this.$request({
          url: '/user/addCarddata',
          method: 'get',
          params: that.onecarddata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.ifshouaddandedit = false
              that.ifadddata = false
              that.getAllCardsDataListpage()
              that.$message.success('新增卡券信息成功!')
            } else {
              that.spinning = false
              that.$message.error('抱歉,未知错误,请联系管理员!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        //编辑信息

        var xiugaicoupon_type = ''
        if (that.olddata.coupon_type != that.onecarddata.coupon_type) {
          xiugaicoupon_type = '卡券说明：' + that.olddata.coupon_type + ',修改为：' + that.onecarddata.coupon_type + ','
        }

        var xiugaicoupon_moeny = ''
        if (that.olddata.coupon_moeny != that.onecarddata.coupon_moeny) {
          xiugaicoupon_moeny =
            ',卡券金额：' + that.olddata.coupon_moeny + ',修改为：' + that.onecarddata.coupon_moeny + ','
        }

        var xiugaicoupon_explain = ''
        if (that.olddata.coupon_explain != that.onecarddata.coupon_explain) {
          xiugaicoupon_explain =
            ',满减额度：' + that.olddata.coupon_explain + ',修改为：' + that.onecarddata.coupon_explain + ','
        }

        var xiugaicoupon_front = ''
        if (that.olddata.coupon_front != that.onecarddata.coupon_front) {
          xiugaicoupon_front =
            ',开始时间：' + that.olddata.coupon_front + ',修改为：' + that.onecarddata.coupon_front + ','
        }

        var xiugaicoupon_hours = ''
        if (that.olddata.coupon_hours != that.onecarddata.coupon_hours) {
          xiugaicoupon_hours = ',结束时间：' + that.olddata.coupon_hours + ',修改为：' + that.onecarddata.coupon_hours
        }
        that.onecarddata.user_operation_record_detail =
          xiugaicoupon_type + xiugaicoupon_moeny + xiugaicoupon_explain + xiugaicoupon_front + xiugaicoupon_hours
        that.spinning = true
        this.$request({
          url: '/user/updataCarddataByid',
          method: 'get',
          params: that.onecarddata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.onecarddata = {}
              that.olddata = {}
              that.ifshouaddandedit = false
              that.getAllCardsDataListpage()
              that.$message.success('修改卡卷信息成功!')
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
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
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
