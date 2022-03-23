<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-row :gutter="8">
      <a-col :span="5">
        <div>
          <a-card>
            <div @click="orgAddoneclass" style="margin-left: 6px">
              <a-tooltip placement="top" title="新增">
                <a-icon type="plus" style="margin-right: 6px" />
                新增分类
              </a-tooltip>
            </div>
            <a-tree :tree-data="orgTree" @rightClick="onRightClick" @select="onSelect" />
            <div :style="this.tmpStyle" v-if="NodeTreeItem">
              <div class="menu-item" @click="orgEdit" style="margin-left: 8px">
                <a-tooltip placement="bottom" title="修改">
                  <a-icon type="edit" />
                </a-tooltip>
              </div>
              <div class="menu-item" @click="orgDelete" style="margin-left: 8px">
                <a-tooltip placement="bottom" title="删除">
                  <a-icon type="minus-circle-o" />
                </a-tooltip>
              </div>
              <div
                class="menu-item"
                @click="
                  () => {
                    this.NodeTreeItem = false
                    this.seletdata = []
                    this.newclassname = ''
                  }
                "
                style="margin-left: 8px"
              >
                <a-tooltip placement="bottom" title="关闭">
                  <a-icon type="close" />
                </a-tooltip>
              </div>
            </div>
          </a-card>
        </div>
      </a-col>
      <a-col :span="19">
        <div>
          <a-input-search
            style="margin-right: 8px; margin-left: 16px; width: 272px; margin-bottom: 16px"
            v-model="keywords"
          />
          <a-button
            style="margin-left: 16px"
            class="editable-add-btn"
            type="primary"
            @click="onSearch"
            :loading="spinning"
          >
            搜索
          </a-button>
          <a-button
            class="editable-add-btn"
            type="primary"
            @click="restart"
            style="margin-left: 8px"
            :loading="spinning"
          >
            重置
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
            v-if="$store.state.rights[4].children[6].children[0].add == 1"
          >
            +新增材料工种
          </a-button>
          <a-button
            style="margin-left: 16px"
            class="editable-add-btn"
            icon="vertical-align-bottom"
            @click="daochuliebiao"
            :loading="spinning"
          >
            导出工种列表
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
              <template slot="worker_two_creatime" slot-scope="text">
                {{ text | dayjs }}
              </template>
              <span slot="action" slot-scope="text, record">
                <template>
                  <a @click="handleEdit(record)" v-if="$store.state.rights[4].children[6].children[0].edit == 1"
                    >修改</a
                  >
                  <a-divider type="vertical" v-if="$store.state.rights[4].children[6].children[0].edit == 1" />
                </template>
                <template>
                  <a @click="handledelete(record)" v-if="$store.state.rights[4].children[6].children[0].delete == 1"
                    >删除</a
                  >
                  <a-divider type="vertical" v-if="$store.state.rights[4].children[6].children[0].delete == 1" />
                </template>
                <template>
                  <a @click="showhistory(record)">历史记录</a>
                </template>
              </span>
              <template slot="title"> 工种列表 </template>
            </a-table>
          </a-spin>
        </div>
      </a-col>
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
          :title="ifaddgoodsclass ? '新增分类信息' : '编辑分类信息'"
          :visible="ifvisiblegoodsclass"
          :confirm-loading="spinning"
          okText="保存"
          cancelText="取消"
          @ok="handlegoodsclass"
          :centered="true"
          @cancel="
            () => {
              this.ifvisiblegoodsclass = false
              this.newclassname = ''
            }
          "
          :maskClosable="false"
          :destroyOnClose="true"
          :confirmLoading="spinning"
        >
          <div>
            <a-spin :spinning="spinning">
              <a-form-item>
                <a-input size="large" :maxLength="50" placeholder="分类名称" v-model="newclassname"></a-input>
              </a-form-item>
            </a-spin>
          </div>
        </a-modal>
      </div>
      <div>
        <a-modal
          :title="ifaddunitdata ? '新增材料工种信息' : '编辑材料工种信息'"
          :visible="visible"
          :confirm-loading="false"
          okText="保存"
          @ok="handleOk"
          :centered="true"
          cancelText="取消"
          @cancel="
            () => {
              this.visible = false
              this.oneworktypedata = {}
              this.fenleiid = ''
              this.getAllWorktypeDataListpage()
            }
          "
          :maskClosable="false"
          :destroyOnClose="true"
          :confirmLoading="spinning"
        >
          <div>
            <a-spin :spinning="spinning">
              <p class="edit">
                <a-form-item label="工种名称:">
                  <a-input
                    size="large"
                    type="text"
                    style="width: 370px; margin-right: 8px"
                    placeholder="工种名称"
                    :maxLength="50"
                    v-model="oneworktypedata.worker_two_name"
                  ></a-input>
                </a-form-item>
                <a-form-item label="工种类型:">
                  <a-select
                    size="large"
                    placeholder="工种类型"
                    style="width: 370px; margin-right: 8px"
                    @change="changeleixingdata"
                    v-model="fenleiid"
                    allowClear
                  >
                    <a-select-option
                      v-for="(items, index) in orgTree"
                      :key="index"
                      :label="items.title"
                      :value="items.key"
                      >{{ items.title }}</a-select-option
                    >
                  </a-select>
                </a-form-item>

                <a-form-item label="工种单位:" v-if="!ifaddunitdata && !ifnogongzhongname">
                  <a-input
                    size="large"
                    type="text"
                    style="width: 370px"
                    placeholder="工种单位"
                    allowClear
                    readonly="true"
                    @change="change123()"
                    v-model="oneworktypedata.worker_two_unit"
                  ></a-input>
                </a-form-item>
                <a-form-item label="工种单位:" v-if="ifaddunitdata || ifnogongzhongname">
                  <a-select
                    size="large"
                    mode="multiple"
                    placeholder="工种单位"
                    style="width: 370px"
                    v-model="oneworktypedata.worker_two_unit"
                    :allowClear="true"
                    show-search
                    option-filter-prop="children"
                  >
                    <a-select-option v-for="(action, index) in gongzhong" :key="index" :value="action.name">{{
                      action.name
                    }}</a-select-option>
                  </a-select>
                </a-form-item>
              </p>
            </a-spin>
          </div>
        </a-modal>
      </div>
    </a-row>
  </a-card>
</template>

<script>
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
const columns1 = [
  {
    title: '工种编号',
    dataIndex: 'worker_two_id',
    sorter: true,
  },
  {
    title: '工种名称',
    dataIndex: 'worker_two_name',
    sorter: true,
  },
  {
    title: '工种类型',
    dataIndex: 'worker_one_name',
    sorter: true,
  },
  {
    title: '工种单位',
    dataIndex: 'worker_two_unit',
  },
  {
    title: '创建时间',
    dataIndex: 'worker_two_creatime',
    scopedSlots: { customRender: 'worker_two_creatime' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      oneworktypedata: {},
      visible: false,
      ifaddunitdata: false,
      columns1,
      newclassname: '',
      oldname: '',
      fenleiid: '',
      orgTree: [],
      ifnogongzhongname: false,
      ifaddgoodsclass: false,
      ifvisiblegoodsclass: false,
      historyColumns,
      NodeTreeItem: null,
      ifshowhistory: false,
      historydata: [],
      seletdata: [],
      keywordsfenleiid: '',
      spinning: false,
      keywords: '',
      gongzhong: [
        { id: '1', name: '天' },
        { id: '2', name: '米' },
        { id: '3', name: '平方米' },
      ],
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllWorktypeDataListpage()
    that.getAllgongfenlei()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出工种列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllGongzhong1Listpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['工种编号', '工种名称','工种类型','工种单位','创建时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.worker_two_id == null ? '' : element.worker_two_id,
                    element.worker_two_name == null ? '' : element.worker_two_name,
                    element.worker_one_name == null ? '' : element.worker_one_name,
                    element.worker_two_unit == null ? '' : element.worker_two_unit,
                    element.worker_two_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.worker_two_creatime)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '工种列表')
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
    change123() {
      const that = this
      that.oneworktypedata.worker_two_unit = []
      that.ifnogongzhongname = true
    },
    changeleixingdata(value) {
      const that = this
      if (value != null || value == '') {
        that.orgTree.forEach((item) => {
          if (that.fenleiid == item.key) {
            that.oneworktypedata.fenleiid = item.key
          }
        })
      } else {
        that.oneworktypedata.fenleiid = ''
      }
    },
    handlegoodsclass() {
      const that = this
      if (that.newclassname == '' || that.newclassname == null) {
        this.$message.warning('工种类型名称不能为空!')
        return
      }
      var formdata = {}
      formdata.worker_one_name = that.newclassname
      formdata.bills_type = 'taskworktype'
      formdata.myid = that.$store.state.admin.user_id
      if (that.ifaddgoodsclass) {
        that.spinning = true
        this.$request({
          url: '/user/addgongzhongleixingdata',
          method: 'get',
          params: formdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.ifvisiblegoodsclass = false
              this.newclassname = ''
              that.getAllgongfenlei()
              that.$message.success('新增成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        formdata.oldname = that.oldclassname
        formdata.id = that.seletdata.key
        that.spinning = true
        this.$request({
          url: '/user/updategongzhongleixingdatabyid',
          method: 'get',
          params: formdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.ifvisiblegoodsclass = false
              this.newclassname = ''
              that.oldclassname = ''
              that.getAllgongfenlei()
              that.$message.success('更新成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },
    restart() {
      const that = this
      that.NodeTreeItem = false
      that.keywordsfenleiid = ''
      that.getAllgongfenlei()
      that.getAllWorktypeDataListpage()
    },
    onSelect(selectedKeys, info) {
      const that = this
      console.log(info.selectedNodes[0].key)
      that.keywordsfenleiid = info.selectedNodes[0].key
      that.getAllWorktypeDataListpage()
    },
    orgAddoneclass() {
      const that = this
      that.ifaddgoodsclass = true
      that.ifvisiblegoodsclass = true
      that.NodeTreeItem = false
    },
    orgEdit() {
      const that = this
      that.ifaddgoodsclass = false
      that.ifvisiblegoodsclass = true
      that.newclassname = that.seletdata.title
      that.oldclassname = that.seletdata.title
      that.spinning = false
    },
    orgDelete() {
      const that = this
      this.$confirm({
        title: '是否确定删除该工种分类信息?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('ok')
          that.spinnin = true
          var formdate = {}
          formdate.fenleiid = that.seletdata.key
          that.spinning = true
          that
            .$request({
              url: '/user/getAllGongzhong1Listpage',
              method: 'get',
              params: formdate,
            })
            .then((res) => {
              if (res.code == 200) {
                if (res.data.length > 0) {
                  that.spinning = false
                  that.$message.warning('抱歉,该分类存在工种,无法删除!')
                  return
                } else {
                  this.deleteid()
                }
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
    deleteid() {
      const that = this
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      formdate.id = that.seletdata.key
      formdate.name = that.seletdata.title
      this.$request({
        url: '/user/deleteOnefenleidataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.status == 200) {
            that.selectsell = false
            that.restart()
            that.$message.success('删除成功!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onRightClick({ event, node }) {
      this.seletdata = node.dataRef
      const x = event.currentTarget.offsetLeft + event.currentTarget.clientWidth
      const y = event.currentTarget.offsetTop
      this.NodeTreeItem = {
        pageX: x,
        pageY: y,
        id: node._props.eventKey,
        title: node._props.title,
        parentOrgId: node._props.dataRef.parentOrgId || null,
      }
      this.tmpStyle = {
        position: 'absolute',
        maxHeight: 40,
        textAlign: 'center',
        left: `${x + 10 - 0}px`,
        top: `${y + 6 - 0}px`,
        display: 'flex',
        flexDirection: 'row',
      }
    },
    getAllgongfenlei() {
      const that = this
      that.orgTree = []
      var formdate = {}
      this.$request({
        url: '/user/getAllgongzhongfenlei',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((item) => {
              item.key = item.worker_one_id
              item.title = item.worker_one_name
            })
            that.orgTree = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    showhistory(e) {
      console.log(e)
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'taskworktype'
      formdate.id = e.id
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
      console.log('2222222222')
      console.log(that.oneworktypedata)
      if (that.oneworktypedata.worker_two_name == '' || that.oneworktypedata.worker_two_name == null) {
        this.$message.warning('工种名称不能为空!')
        return
      }
      if (that.oneworktypedata.fenleiid == '' || that.oneworktypedata.fenleiid == null) {
        this.$message.warning('工种类型不能为空!')
        return
      }
      if (that.oneworktypedata.worker_two_unit == '' || that.oneworktypedata.worker_two_unit == null) {
        this.$message.warning('工种单位不能为空!')
        return
      }
      that.oneworktypedata.bills_type = 'taskworktype'
      that.oneworktypedata.myid = that.$store.state.admin.user_id
      if (that.ifaddunitdata || that.ifnogongzhongname) {
        that.oneworktypedata.worker_two_unit = that.oneworktypedata.worker_two_unit.join(',')
      }
      if (that.ifaddunitdata) {
        that.spinning = true
        this.$request({
          url: '/user/addgongzhongdata',
          method: 'get',
          params: that.oneworktypedata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              this.fenleiid = ''
              that.NodeTreeItem = false
              that.oneworktypedata = {}
              that.getAllWorktypeDataListpage()
              that.$message.success('新增成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.oneworktypedata.oldname = that.oldname
        that.spinning = true
        this.$request({
          url: '/user/updategongzhongdatabyid',
          method: 'get',
          params: that.oneworktypedata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              this.fenleiid = ''
              that.NodeTreeItem = false
              that.oneworktypedata = {}
              that.getAllWorktypeDataListpage()
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
      that.oneworktypedata = e
      if (e.worker_one_id) {
        that.oneworktypedata.fenleiid = e.worker_one_id
        that.fenleiid = e.worker_one_id
      }
      that.oldname = e.worker_two_name
      that.ifnogongzhongname = false
    },
    handledelete(e) {
      const that = this
      this.$confirm({
        title: '是否确定删除该工种信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdata = {}
          formdata.id = e.worker_two_id
          formdata.worker_two_name = e.worker_two_name
          formdata.myid = that.$store.state.admin.user_id
          that.spinning = true
          this.$request({
            url: '/user/deletegongzhongdatabyid',
            method: 'get',
            params: formdata,
          })
            .then((res) => {
              if (res.status == 200) {
                that.spinning = false
                that.visible = false
                that.getAllWorktypeDataListpage()
                that.$message.success('删除信息成功')
              } else if (res.status == 201) {
                that.spinning = false
                that.$message.error('抱歉,该工种已被使用无法删除!')
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
      // const that = this
      // this.$confirm({
      //   title: '是否确定删除该工种信息吗?',
      //   okText: '继续',
      //   okType: 'danger',
      //   centered: true,
      //   cancelText: '取消',
      //   onOk: () => {
      //     var formdata = {}
      //     formdata.bills_type = 'GoodsWorktypeMange'
      //     formdata.myid = that.$store.state.admin.user_id
      //     formdata.id = e.shop_goods_worktype_id
      //     formdata.typeid = e.shop_goods_worktype_id
      //     formdata.shop_goods_worktype_name = e.shop_goods_worktype_name
      //     that.spinning = true
      //     this.$request({
      //       url: '/user/deleteworktypedatabyid',
      //       method: 'get',
      //       params: formdata,
      //     })
      //       .then((res) => {
      //         if (res.status == 200) {
      //           that.spinning = false
      //           that.visible = false
      //           that.getAllWorktypeDataListpage()
      //           that.$message.success('删除信息成功')
      //         } else if (res.status == 201) {
      //           that.spinning = false
      //           that.$message.error('抱歉,该工种已被使用无法删除!')
      //         }
      //       })
      //       .catch(function () {
      //         that.spinning = false
      //         that.$message.error('抱歉,未知错误,请联系管理员!')
      //       })
      //   },
      //   onCancel() {
      //     console.log('Cancel')
      //   },
      // })
    },
    onSearch() {
      const that = this
      that.getAllWorktypeDataListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllWorktypeDataListpage()
    },
    getAllWorktypeDataListpage() {
      const that = this
      console.log('水水水水')
      console.log(that.keywordsfenleiid)
      that.data = []
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      if (that.keywordsfenleiid != '') {
        formdate.fenleiid = that.keywordsfenleiid
      }
      that.spinning = true
      that
        .$request({
          url: '/user/getAllGongzhong1Listpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((item) => {
              item.id = item.worker_two_id
              item.name = item.worker_two_name
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
.editable-add-btn {
  margin-bottom: 8px;
}
</style>
