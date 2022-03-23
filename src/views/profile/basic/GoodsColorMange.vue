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
        v-if="$store.state.rights[4].children[5].children[0].add == 1"
      >
        +新增材料颜色
      </a-button>
      <a-button
        style="margin-left: 16px"
        class="editable-add-btn"
        icon="vertical-align-bottom"
        @click="daochuliebiao"
        :loading="spinning"
      >
        导出材料颜色列表
      </a-button>
      <a-spin :spinning="spinning" size="large">
        <a-table
          ref="table"
          size="default"
          @change="handleTableChange"
          :columns="columns1"
          :data-source="data"
          bordered
          :alert="false"
        >
          <template slot="shop_goods_color_creatime" slot-scope="text">
            {{ text | dayjs }}
          </template>
          <span slot="action" slot-scope="text, record">
            <template>
              <a @click="handleEdit(record)" v-if="$store.state.rights[4].children[5].children[0].edit == 1">修改</a>
              <a-divider type="vertical" v-if="$store.state.rights[4].children[5].children[0].edit == 1" />
            </template>
            <template>
              <a @click="handledelete(record)" v-if="$store.state.rights[4].children[5].children[0].delete == 1"
                >删除</a
              >
              <a-divider type="vertical" v-if="$store.state.rights[4].children[5].children[0].delete == 1" />
            </template>
            <template>
              <a @click="showhistory(record)">历史记录</a>
            </template>
          </span>
          <template slot="title"> 材料颜色列表 </template>
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
        :title="ifaddunitdata ? '新增材料颜色信息' : '编辑材料颜色信息'"
        :visible="visible"
        :confirm-loading="false"
        okText="保存"
        @ok="handleOk"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.visible = false
            this.onecolordata = {}
            this.getAllColorDataListpage()
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="edit">
              <a-form-item label="材料颜色名称:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="材料颜色名称"
                  v-model="onecolordata.shop_goods_color_name"
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
const columns1 = [
  {
    title: '颜色编号',
    dataIndex: 'shop_goods_color_id',
    width: 120,
    sorter: true,
  },
  {
    title: '颜色名称',
    sorter: true,
    dataIndex: 'shop_goods_color_name',
  },
  {
    title: '创建时间',
    dataIndex: 'shop_goods_color_creatime',
    scopedSlots: { customRender: 'shop_goods_color_creatime' },
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
      onecolordata: {},
      visible: false,
      ifaddunitdata: false,
      columns1,
      spinning: false,
      keywords: '',
      oldname: '',
      historyColumns,
      ifshowhistory: false,
      historydata: [],
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllColorDataListpage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出材料颜色列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllColorDataListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['颜色编号', '颜色名称', '创建时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.shop_goods_color_id == null ? '' : element.shop_goods_color_id,
                    element.shop_goods_color_name == null ? '' : element.shop_goods_color_name,
                    element.shop_goods_color_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.shop_goods_color_creatime)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '材料颜色列表')
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
      formdate.bills_type = 'GoodsColorMange'
      formdate.id = e.shop_goods_color_id
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
      if (that.onecolordata.shop_goods_color_name == '' || that.onecolordata.shop_goods_color_name == null) {
        this.$message.warning('颜色名称不能为空!')
        return
      }
      that.onecolordata.bills_type = 'GoodsColorMange'
      that.onecolordata.myid = that.$store.state.admin.user_id
      if (that.ifaddunitdata) {
        that.spinning = true
        this.$request({
          url: '/user/addcolordata',
          method: 'get',
          params: that.onecolordata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.onecolordata = {}
              that.getAllColorDataListpage()
              that.$message.success('新增成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.onecolordata.oldname = that.oldname
        that.spinning = true
        this.$request({
          url: '/user/updatecolordatabyid',
          method: 'get',
          params: that.onecolordata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.oldname = ''
              that.onecolordata = {}
              that.getAllColorDataListpage()
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
      that.onecolordata = e
      that.oldname = e.shop_goods_color_name
    },
    handledelete(e) {
      const that = this
      this.$confirm({
        title: '是否确定删除该颜色信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdata = {}
          formdata.bills_type = 'GoodsColorMange'
          formdata.myid = that.$store.state.admin.user_id
          formdata.id = e.shop_goods_color_id
          formdata.colorid = e.shop_goods_color_id
          formdata.shop_goods_color_name = e.shop_goods_color_name
          that.spinning = true
          this.$request({
            url: '/user/deletecolordatabyid',
            method: 'get',
            params: formdata,
          })
            .then((res) => {
              if (res.status == 200) {
                that.spinning = false
                that.visible = false
                that.oldname = ''
                that.getAllColorDataListpage()
                that.$message.success('删除信息成功')
              } else if (res.status == 201) {
                that.spinning = false
                that.$message.error('抱歉,该颜色已被使用无法删除!')
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
      that.getAllColorDataListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllColorDataListpage()
    },
    getAllColorDataListpage() {
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
          url: '/user/getAllColorDataListpage',
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
