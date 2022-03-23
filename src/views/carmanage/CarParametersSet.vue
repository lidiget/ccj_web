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
      type="primary"
      @click="
        () => {
          this.visible = true
          this.ifaddvehicledata = true
        }
      "
      v-if="$store.state.rights[9].children[0].children[0].add == 1"
      :loading="spinning"
    >
      +新增车辆类型
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
    >
      导出车辆信息列表
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
        <template slot="vehicle_classify_status" slot-scope="text">
          <a-badge :status="text == '1' ? 'success' : 'error'" />
          {{ text == '1' ? '启用' : '禁用' }}
        </template>

        <template slot="vehicle_classify_leixing" slot-scope="text">
          {{ text == '1' ? '小时' : '公里' }}
        </template>

        <template slot="vehicle_classify_creatime" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)" v-if="$store.state.rights[9].children[0].children[0].edit == 1">修改</a>
            <a-divider type="vertical" v-if="$store.state.rights[9].children[0].children[0].edit == 1" />
          </template>
          <template>
            <a @click="handleDelete(record)" v-if="$store.state.rights[9].children[0].children[0].delete == 1">删除</a>
            <a-divider type="vertical" v-if="$store.state.rights[9].children[0].children[0].delete == 1" />
          </template>
          <template>
            <a @click="showhistory(record)">历史记录</a>
          </template>
        </span>
        <template slot="title"> 车辆信息列表 </template>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        :title="ifaddvehicledata ? '新增车辆信息' : '编辑车辆信息'"
        :visible="visible"
        :confirm-loading="false"
        okText="保存"
        @ok="handleOk"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.visible = false
            this.onecardata = {}
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <a-row>
              <a-col :span="12">
                <a-form-item label="车辆名称:">
                  <a-input
                    size="large"
                    type="text"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="车辆名称"
                    v-model="onecardata.vehicle_classify_name"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="车辆规格:">
                  <a-input
                    size="large"
                    type="text"
                    :maxLength="50"
                    style="width: 230px"
                    placeholder="车辆规格"
                    v-model="onecardata.vehicle_classify_specification"
                  ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="车辆载重(吨):">
                  <a-input-number
                    id="inputNumber"
                    size="large"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="车辆载重"
                    v-model="onecardata.vehicle_classify_load"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="车辆起步价:">
                  <a-input-number
                    id="inputNumber"
                    size="large"
                    :maxLength="50"
                    style="width: 230px"
                    placeholder="车辆起步价"
                    v-model="onecardata.vehicle_classify_starting"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="起步公里数:">
                  <a-input-number
                    id="inputNumber"
                    size="large"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="起步公里数"
                    v-model="onecardata.vehicle_classify_startkilometre"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="后续计费:">
                  <a-input-number
                    id="inputNumber"
                    size="large"
                    :maxLength="50"
                    style="width: 230px"
                    placeholder="后续计费"
                    v-model="onecardata.vehicle_classify_subsequentprice"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="车辆状态:">
                  <a-select
                    size="large"
                    style="width: 230px"
                    show-search
                    placeholder="车辆状态"
                    option-filter-prop="children"
                    v-model="onecardata.vehicle_classify_status"
                  >
                    <a-select-option :value="'1'"> 启用 </a-select-option>
                    <a-select-option :value="'2'"> 禁用 </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="车辆收费标准:">
                  <a-select
                    size="large"
                    style="width: 230px"
                    show-search
                    placeholder="车辆状态"
                    option-filter-prop="children"
                    v-model="onecardata.vehicle_classify_leixing"
                  >
                    <a-select-option :value="'1'"> 小时 </a-select-option>
                    <a-select-option :value="'2'"> 公里 </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-spin>
        </div>
      </a-modal>
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
const columns1 = [
  {
    title: '编号',
    dataIndex: 'vehicle_classify_id',
    width: 120,
    sorter: true,
  },
  {
    title: '车辆名称',
    sorter: true,
    dataIndex: 'vehicle_classify_name',
  },
  {
    title: '车辆规格',
    sorter: true,
    dataIndex: 'vehicle_classify_specification',
  },
  {
    title: '车辆载重',
    sorter: true,
    dataIndex: 'vehicle_classify_load',
  },
  {
    title: '车辆起步价',
    sorter: true,
    dataIndex: 'vehicle_classify_starting',
  },
  {
    title: '车辆状态',
    dataIndex: 'vehicle_classify_status',
    scopedSlots: { customRender: 'vehicle_classify_status' },
  },
  {
    title: '收费标准',
    dataIndex: 'vehicle_classify_leixing',
    scopedSlots: { customRender: 'vehicle_classify_leixing' },
  },
  {
    title: '创建时间',
    dataIndex: 'vehicle_classify_creatime',
    scopedSlots: { customRender: 'vehicle_classify_creatime' },
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
  name: 'CommonUser',
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      onecardata: {},
      columns1,
      tabletype: 1,
      olddata: {},
      historyColumns,
      ifshowhistory: false,
      historydata: [],
      visible: false,
      spinning: false,
      ifaddvehicledata: false,
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllCarParametersDataListpage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出车辆信息列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllCarParametersDataListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  ['编号', '车辆名称', '车辆规格', '车辆载重', '车辆起步价', '车辆状态', '收费标准', '创建时间'],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.vehicle_classify_id == null ? '' : element.vehicle_classify_id,
                    element.vehicle_classify_name == null ? '' : element.vehicle_classify_name,
                    element.vehicle_classify_specification == null ? '' : element.vehicle_classify_specification,
                    element.vehicle_classify_load == null ? '' : element.vehicle_classify_load,
                    element.vehicle_classify_starting == null ? '' : element.vehicle_classify_starting,
                    element.vehicle_classify_status == null
                      ? ''
                      : element.vehicle_classify_status == '1'
                      ? '启用'
                      : '禁用',
                    element.vehicle_classify_leixing == null
                      ? ''
                      : element.vehicle_classify_leixing == '1'
                      ? '小时'
                      : '公里',
                    element.vehicle_classify_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.vehicle_classify_creatime)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '车辆信息列表')
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
      formdate.bills_type = 'CarParametersSet'
      formdate.id = e.vehicle_classify_id
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

      if (that.onecardata.vehicle_classify_name == null || that.onecardata.vehicle_classify_name == '') {
        that.$message.warning('请输入车辆名称!')
        return
      }
      if (
        that.onecardata.vehicle_classify_specification == null ||
        that.onecardata.vehicle_classify_specification == ''
      ) {
        that.$message.warning('请输入车辆规格!')
        return
      }
      if (that.onecardata.vehicle_classify_load == null || that.onecardata.vehicle_classify_load == '') {
        that.$message.warning('请输入车辆载重!')
        return
      }
      if (that.onecardata.vehicle_classify_starting == null || that.onecardata.vehicle_classify_starting == '') {
        that.$message.warning('请输入车辆起步价!')
        return
      }
      if (
        that.onecardata.vehicle_classify_startkilometre == null ||
        that.onecardata.vehicle_classify_startkilometre == ''
      ) {
        that.$message.warning('请输入车辆起步公里数!')
        return
      }
      if (
        that.onecardata.vehicle_classify_subsequentprice == null ||
        that.onecardata.vehicle_classify_subsequentprice == ''
      ) {
        that.$message.warning('请输入车辆后续计费!')
        return
      }
      if (that.onecardata.vehicle_classify_status == null || that.onecardata.vehicle_classify_status == '') {
        that.$message.warning('请选择车辆状态!')
        return
      }

      if (that.onecardata.vehicle_classify_leixing == null || that.onecardata.vehicle_classify_leixing == '') {
        that.$message.warning('请选择车辆收费标准!')
        return
      }

      var status1 = ''
      if (that.onecardata.vehicle_classify_status == '1') {
        status1 = '启用'
      } else {
        status1 = '禁用'
      }

      var shoufei1 = ''
      if (that.onecardata.vehicle_classify_leixing == '1') {
        shoufei1 = '小时'
      } else {
        shoufei1 = '公里'
      }

      that.onecardata.bills_type = 'CarParametersSet'
      that.onecardata.myid = that.$store.state.admin.user_id
      if (this.ifaddvehicledata) {
        that.onecardata.user_operation_record_detail = '新增' + '车辆：' + that.onecardata.vehicle_classify_name
        that.onecardata.vehicle_classify_load = that.onecardata.vehicle_classify_load + '吨'
        that.spinning = true
        this.$request({
          url: '/user/addVechiledata',
          method: 'get',
          params: that.onecardata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.onecardata = {}
              that.getAllCarParametersDataListpage()
              that.$message.success('新增车辆信息成功！')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        //修改信息

        var status = ''
        if (that.olddata.vehicle_classify_status == '1') {
          status = '启用'
        } else {
          status = '禁用'
        }

        var shoufei = ''
        if (that.olddata.vehicle_classify_leixing == '1') {
          shoufei = '小时'
        } else {
          shoufei = '公里'
        }

        var xiugaivehicle_classify_name = ''
        if (that.olddata.vehicle_classify_name != that.onecardata.vehicle_classify_name) {
          xiugaivehicle_classify_name =
            '车辆名称：' +
            that.olddata.vehicle_classify_name +
            ',修改为：' +
            that.onecardata.vehicle_classify_name +
            ','
        }

        var xiugaivehicle_classify_specification = ''
        if (that.olddata.vehicle_classify_specification != that.onecardata.vehicle_classify_specification) {
          xiugaivehicle_classify_specification =
            '车辆规格：' +
            that.olddata.vehicle_classify_specification +
            ',修改为：' +
            that.onecardata.vehicle_classify_specification +
            ','
        }

        var xiugaivehicle_classify_load = ''
        if (that.olddata.vehicle_classify_load != that.onecardata.vehicle_classify_load) {
          xiugaivehicle_classify_load =
            '车辆载重：' +
            that.olddata.vehicle_classify_load +
            ',修改为：' +
            that.onecardata.vehicle_classify_load +
            '吨,'
        }

        var xiugaivehicle_classify_starting = ''
        if (that.olddata.vehicle_classify_starting != that.onecardata.vehicle_classify_starting) {
          xiugaivehicle_classify_starting =
            '车辆起步价：' +
            that.olddata.vehicle_classify_starting +
            ',修改为：' +
            that.onecardata.vehicle_classify_starting +
            ','
        }

        var xiugaivehicle_classify_startkilometre = ''
        if (that.olddata.vehicle_classify_startkilometre != that.onecardata.vehicle_classify_startkilometre) {
          xiugaivehicle_classify_startkilometre =
            '车辆起步公里数：' +
            that.olddata.vehicle_classify_startkilometre +
            ',修改为：' +
            that.onecardata.vehicle_classify_startkilometre +
            ','
        }

        var xiugaivehicle_classify_subsequentprice = ''
        if (that.olddata.vehicle_classify_subsequentprice != that.onecardata.vehicle_classify_subsequentprice) {
          xiugaivehicle_classify_subsequentprice =
            '车辆起步公里数：' +
            that.olddata.vehicle_classify_subsequentprice +
            ',修改为：' +
            that.onecardata.vehicle_classify_subsequentprice +
            ','
        }

        var xiugaistatus = ''
        if (that.olddata.vehicle_classify_status != that.onecardata.vehicle_classify_status) {
          xiugaistatus = '车辆状态：' + status + ',修改为：' + status1 + ','
        }

        var xiugaileixing = ''
        if (that.olddata.vehicle_classify_leixing != that.onecardata.vehicle_classify_leixing) {
          xiugaileixing = '车辆收费标准：' + shoufei + ',修改为：' + shoufei1 + ','
        }

        that.onecardata.user_operation_record_detail =
          xiugaivehicle_classify_name +
          xiugaivehicle_classify_specification +
          xiugaivehicle_classify_load +
          xiugaivehicle_classify_starting +
          xiugaivehicle_classify_startkilometre +
          xiugaivehicle_classify_subsequentprice
        xiugaistatus + xiugaileixing
        that.spinning = true
        this.$request({
          url: '/user/updataVechiledataByid',
          method: 'get',
          params: that.onecardata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.onecardata = {}
              that.olddata = {}
              that.getAllCarParametersDataListpage()
              that.$message.success('修改车辆成功!')
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
      that.olddata = e
      that.ifaddvehicledata = false
      var aa = {}
      aa.vehicle_classify_id = e.vehicle_classify_id
      aa.vehicle_classify_name = e.vehicle_classify_name
      aa.vehicle_classify_specification = e.vehicle_classify_specification
      aa.vehicle_classify_load = e.vehicle_classify_load
      aa.vehicle_classify_starting = e.vehicle_classify_starting
      aa.vehicle_classify_status = e.vehicle_classify_status
      aa.vehicle_classify_startkilometre = e.vehicle_classify_startkilometre
      aa.vehicle_classify_subsequentprice = e.vehicle_classify_subsequentprice
      aa.vehicle_classify_leixing = e.vehicle_classify_leixing
      that.onecardata = aa
    },
    handleDelete(e) {
      const that = this
      this.$confirm({
        title: '是否确定删除该车辆类型的全部信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          that.spinning = true
          that
            .$request({
              url: '/user/getAllWorkUsersDataListpage',
              method: 'get',
              params: {},
            })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alljiazhao = []
                res.data.forEach((element) => {
                  if (element.worker_jiazhao) {
                    alljiazhao.push(JSON.parse(element.worker_jiazhao))
                  }
                })
                var alldata = []
                alljiazhao.forEach((element) => {
                  element.forEach((item) => {
                    alldata.push(item.vehicle_class)
                  })
                })
                var newaa = []
                alldata.forEach((element) => {
                  if (element.vehicle_classify_id == e.vehicle_classify_id) {
                    newaa.push(element)
                  }
                })
                if (newaa.length > 0) {
                  that.spinning = false
                  that.$message.warning('该车辆信息已经被用户绑定，无法删除!')
                  return
                } else {
                  this.deleteByid(e)
                }
              }
            })
            .catch(function () {
              that.spinning = false
              that.$message.error('抱歉,未知错误,请联系管理员!')
              return
            })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    deleteByid(e) {
      const that = this
      console.log(e)
      var formdate = {}
      formdate.bills_type = 'CarParametersSet'
      formdate.id = e.vehicle_classify_id
      formdate.vehicle_classify_name = e.vehicle_classify_name
      formdate.myid = that.$store.state.admin.user_id
      this.$request({
        url: '/user/deleteonevehicledataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.status == 200) {
            that.getAllCarParametersDataListpage()
            that.$message.success('删除成功!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onSearch() {
      const that = this
      that.getAllCarParametersDataListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllCarParametersDataListpage()
    },
    getAllCarParametersDataListpage() {
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
          url: '/user/getAllCarParametersDataListpage',
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
