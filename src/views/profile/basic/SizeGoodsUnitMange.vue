<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <div>
      <a-modal
        :title="ifaddsizeunitdata ? '新增规格单位信息' : '编辑规格单位信息'"
        :visible="visible1"
        :confirm-loading="false"
        okText="保存"
        @ok="handleOk1"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.visible1 = false
            this.onesizeunitdata = {}
            this.getAllSizeUnitDataListPage()
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="edit">
              <a-form-item label="规格单位名称:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="规格单位名称"
                  v-model="onesizeunitdata.shop_specification_unit_name"
                ></a-input>
              </a-form-item>
            </p>
          </a-spin>
        </div>
      </a-modal>
    </div>
    <div style="margin-top: 16px">
      <a-input-search
        style="margin-right: 8px; margin-left: 16px; width: 272px; margin-bottom: 16px"
        v-model="keywords1"
      />
      <a-button
        style="margin-left: 16px"
        class="editable-add-btn"
        type="primary"
        @click="onSearch1"
        :loading="spinning"
      >
        搜索
      </a-button>
      <a-button
        style="margin-left: 16px"
        class="editable-add-btn"
        type="primary"
        @click="
          () => {
            this.visible1 = true
            this.ifaddsizeunitdata = true
          }
        "
        :loading="spinning"
        v-if="$store.state.rights[4].children[4].children[0].add == 1"
      >
        +新增规格单位
      </a-button>
      <a-button
        style="margin-left: 16px"
        class="editable-add-btn"
        icon="vertical-align-bottom"
        @click="daochuliebiao"
        :loading="spinning"
      >
        导出规格单位列表
      </a-button>
      <a-spin :spinning="spinning" size="large">
        <a-table
          ref="table"
          size="default"
          @change="handleTableChange"
          :columns="columns2"
          :data-source="data1"
          bordered
          :alert="false"
        >
          <template slot="shop_specification_unit_creatime" slot-scope="text">
            {{ text | dayjs }}
          </template>
          <span slot="action" slot-scope="text, record">
            <template>
              <a @click="handleunitEdit(record)" v-if="$store.state.rights[4].children[4].children[0].edit == 1"
                >修改</a
              >
              <a-divider type="vertical" v-if="$store.state.rights[4].children[4].children[0].edit == 1" />
            </template>
            <template>
              <a @click="handleunitdelete(record)" v-if="$store.state.rights[4].children[4].children[0].delete == 1"
                >删除</a
              >
              <a-divider type="vertical" v-if="$store.state.rights[4].children[4].children[0].delete == 1" />
            </template>
            <template>
              <a @click="showhistory(record)">历史记录</a>
            </template>
          </span>
          <template slot="title"> 规格单位列表 </template>
        </a-table>
      </a-spin>
    </div>
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
  </a-card>
</template>

<script>
const columns2 = [
  {
    title: '材料单位编号',
    dataIndex: 'shop_specification_unit_id',
    width: 120,
    sorter: true,
  },
  {
    title: '材料单位名称',
    sorter: true,
    dataIndex: 'shop_specification_unit_name',
  },
  {
    title: '创建时间',
    dataIndex: 'shop_specification_unit_creatime',
    scopedSlots: { customRender: 'shop_specification_unit_creatime' },
  },
  {
    title: '操作',
    dataIndex: 'action',
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
  //   title: '修改前数据记录',
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
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      data1: [],
      historydata: [],
      oldname: '',
      historyColumns,
      ifshowhistory: false,
      oneunitdata: {},
      onesizeunitdata: {},
      visible: false,
      visible1: false,
      ifaddsizeunitdata: false,
      columns2,
      spinning: false,
      keywords1: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllSizeUnitDataListPage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出规格单位列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllSizeUnitDataListPage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['材料单位编号', '材料名称', '创建时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.shop_specification_unit_id == null ? '' : element.shop_specification_unit_id,
                    element.shop_specification_unit_name == null ? '' : element.shop_specification_unit_name,
                    element.shop_specification_unit_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.shop_specification_unit_creatime)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '规格单位列表')
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
      formdate.bills_type = 'SizeGoodsUnitMange'
      formdate.id = e.shop_specification_unit_id
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
    handleOk1() {
      const that = this
      if (
        that.onesizeunitdata.shop_specification_unit_name == '' ||
        that.onesizeunitdata.shop_specification_unit_name == null
      ) {
        this.$message.warning('材料单位名称不能为空!')
        return
      }
      that.onesizeunitdata.bills_type = 'SizeGoodsUnitMange'
      that.onesizeunitdata.myid = that.$store.state.admin.user_id
      if (that.ifaddsizeunitdata) {
        that.spinning = true
        this.$request({
          url: '/user/addsizeunitdata',
          method: 'get',
          params: that.onesizeunitdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible1 = false
              that.onesizeunitdata = {}
              that.getAllSizeUnitDataListPage()
              that.$message.success('新增成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.onesizeunitdata.oldname = that.oldname
        that.spinning = true
        this.$request({
          url: '/user/updatesizeunitdatabyid',
          method: 'get',
          params: that.onesizeunitdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible1 = false
              that.oldname = ''
              that.onesizeunitdata = {}
              that.getAllSizeUnitDataListPage()
              that.$message.success('更新成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },

    handleunitEdit(e) {
      const that = this
      that.visible1 = true
      that.ifaddsizeunitdata = false
      that.onesizeunitdata = e
      that.oldname = e.shop_specification_unit_name
    },
    handleunitdelete(e) {
      const that = this
      this.$confirm({
        title: '是否确定删除该规格单位信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdata = {}
          formdata.bills_type = 'SizeGoodsUnitMange'
          formdata.myid = that.$store.state.admin.user_id
          formdata.id = e.shop_specification_unit_id
          formdata.shop_specification_unit_name = e.shop_specification_unit_name
          that.spinning = true
          this.$request({
            url: '/user/deletesizeunitdatabyid',
            method: 'get',
            params: formdata,
          })
            .then((res) => {
              if (res.status == 200) {
                that.spinning = false
                that.visible1 = false
                that.getAllSizeUnitDataListPage()
                that.$message.success('删除信息成功')
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

    onSearch1() {
      const that = this
      that.getAllSizeUnitDataListPage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllSizeUnitDataListPage()
    },
    getAllSizeUnitDataListPage() {
      const that = this
      that.data1 = []
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.keywords1 != '') {
        formdate.keywords = that.keywords1
      }
      that.spinning = true
      that
        .$request({
          url: '/user/getAllSizeUnitDataListPage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.data1 = res.data
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
