<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <div>
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
        type="primary"
        @click="
          () => {
            this.visible = true
            this.ifaddunitdata = true
          }
        "
        :loading="spinning"
        v-if="$store.state.rights[4].children[3].children[0].add == 1"
      >
        +新增材料单位
      </a-button>
      <a-button
        style="margin-left: 16px"
        class="editable-add-btn"
        icon="vertical-align-bottom"
        @click="daochuliebiao"
        :loading="spinning"
      >
        导出材料单位列表
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
          <template slot="shop_goods_unit_creatime" slot-scope="text">
            {{ text | dayjs }}
          </template>
          <span slot="action" slot-scope="text, record">
            <template>
              <a @click="handleEdit(record)" v-if="$store.state.rights[4].children[3].children[0].edit == 1">修改</a>
              <a-divider type="vertical" v-if="$store.state.rights[4].children[3].children[0].edit == 1" />
            </template>
            <template>
              <a @click="handledelete(record)" v-if="$store.state.rights[4].children[3].children[0].delete == 1"
                >删除</a
              >
              <a-divider type="vertical" v-if="$store.state.rights[4].children[3].children[0].delete == 1" />
            </template>
            <template>
              <a @click="showhistory(record)">历史记录</a>
            </template>
          </span>
          <template slot="title"> 材料单位列表 </template>
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
    <div>
      <a-modal
        :title="ifaddunitdata ? '新增材料单位信息' : '编辑材料单位信息'"
        :visible="visible"
        :confirm-loading="false"
        okText="保存"
        @ok="handleOk"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.visible = false
            this.oneunitdata = {}
            this.getAllUnitsDataListpage()
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="edit">
              <a-form-item label="材料单位名称:">
                <a-input
                  size="large"
                  :maxLength="50"
                  type="text"
                  placeholder="材料单位名称"
                  v-model="oneunitdata.shop_goods_unit_name"
                ></a-input>
              </a-form-item>
            </p>
          </a-spin>
        </div>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const columns1 = [
  {
    title: '单位编号',
    dataIndex: 'shop_goods_unit_id',
    width: 120,
    sorter: true,
  },
  {
    title: '单位名称',
    sorter: true,
    dataIndex: 'shop_goods_unit_name',
  },
  {
    title: '创建时间',
    dataIndex: 'shop_goods_unit_creatime',
    scopedSlots: { customRender: 'shop_goods_unit_creatime' },
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
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      oneunitdata: {},
      visible: false,
      ifaddunitdata: false,
      columns1,
      oldname: '',
      historyColumns,
      ifshowhistory: false,
      historydata: [],
      spinning: false,
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllUnitsDataListpage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出材料单位列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllUnitsDataListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '单位编号',
                    '单位名称',
                    '创建时间'
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.shop_goods_unit_id == null ? '' : element.shop_goods_unit_id,
                    element.shop_goods_unit_name == null ? '' : element.shop_goods_unit_name,
                    element.user_operation_record_createtime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.user_operation_record_createtime)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '材料单位列表')
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
      formdate.bills_type = 'GoodsUnitMange'
      formdate.id = e.shop_goods_unit_id
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
    handleOk() {
      const that = this
      if (that.oneunitdata.shop_goods_unit_name == '' || that.oneunitdata.shop_goods_unit_name == null) {
        this.$message.warning('单位名称不能为空!')
        return
      }
      that.oneunitdata.bills_type = 'GoodsUnitMange'
      that.oneunitdata.myid = that.$store.state.admin.user_id
      if (that.ifaddunitdata) {
        that.spinning = true
        this.$request({
          url: '/user/addunitdata',
          method: 'get',
          params: that.oneunitdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.oneunitdata = {}
              that.getAllUnitsDataListpage()
              that.$message.success('新增成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.oneunitdata.oldname = that.oldname
        that.spinning = true
        this.$request({
          url: '/user/updateunitdatabyid',
          method: 'get',
          params: that.oneunitdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.oldname = ''
              that.oneunitdata = {}
              that.getAllUnitsDataListpage()
              that.$message.success('更新成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },
    handleEdit(e) {
      const that = this
      that.visible = true
      that.ifaddunitdata = false
      that.oneunitdata = e
      that.oldname = e.shop_goods_unit_name
    },
    handledelete(e) {
      const that = this
      this.$confirm({
        title: '是否确定删除该单位信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdata = {}
          formdata.bills_type = 'GoodsUnitMange'
          formdata.myid = that.$store.state.admin.user_id
          formdata.id = e.shop_goods_unit_id
          formdata.unitid = e.shop_goods_unit_id
          formdata.shop_goods_unit_name = e.shop_goods_unit_name
          that.spinning = true
          this.$request({
            url: '/user/deleteunitdatabyid',
            method: 'get',
            params: formdata,
          })
            .then((res) => {
              if (res.status == 200) {
                that.spinning = false
                that.visible = false
                that.getAllUnitsDataListpage()
                that.$message.success('删除信息成功')
              } else if (res.status == 201) {
                that.spinning = false
                that.$message.error('抱歉,该单位已被使用无法删除!')
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
      that.getAllUnitsDataListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllUnitsDataListpage()
    },
    getAllUnitsDataListpage() {
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
          url: '/user/getAllUnitsDataListpage',
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
