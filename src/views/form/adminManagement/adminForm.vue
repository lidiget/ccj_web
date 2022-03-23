<template>
  <a-card :bordered="false">
    <a-row :gutter="8">
      <a-col :span="5">
        <div>
          <a-card>
            <div @click="orgAddoneclass" style="margin-left: 6px">
              <a-tooltip placement="top" title="新增">
                <a-icon type="plus" style="margin-right: 6px" />
                新增第一级类别
              </a-tooltip>
            </div>
            <a-tree
              :tree-data="orgTree"
              @rightClick="onRightClick"
              @select="onSelect"
              @expand="
                () => {
                  this.NodeTreeItem = false
                  this.seletdata = []
                  this.newgoodsclassname = ''
                }
              "
            />
            <div :style="this.tmpStyle" v-if="NodeTreeItem && $store.state.rights[0].children[0].children[0].edit == 1">
              <div class="menu-item" @click="orgAdd" style="margin-left: 8px" v-if="seletdata.classtype != 2">
                <a-tooltip placement="bottom" title="新增">
                  <a-icon type="plus-circle-o" />
                </a-tooltip>
              </div>
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
                    this.newgoodsclassname = ''
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
            style="margin-bottom: 8px; width: 300px; margin-right: 8px"
            placeholder="请输入关键字搜索"
            v-model="keywords"
          />
          <a-button
            class="editable-add-btn"
            type="primary"
            @click="onserchbykeywords"
            style="margin-left: 8px"
            :loading="registerBtn"
          >
            查询
          </a-button>
          <a-button
            class="editable-add-btn"
            type="primary"
            @click="restart"
            style="margin-left: 8px"
            :loading="registerBtn"
          >
            重置
          </a-button>
          <a-button
            class="editable-add-btn"
            type="primary"
            v-if="$store.state.rights[0].children[0].children[0].add == 1"
            @click="addadmindata"
            style="margin-left: 16px"
            :loading="registerBtn"
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
            导出用户列表
          </a-button>
        </div>
        <a-spin :spinning="spinning" size="large">
          <a-table
            ref="table"
            size="default"
            :columns="columns"
            :data-source="loadData"
            bordered
            :alert="false"
            @change="handleTableChange"
          >
            <!-- <s-table row-key="user_id" ref="table" size="default" :columns="columns" :data="loadData" :alert="false"> -->
            <span slot="create_time" slot-scope="text">
              {{ text | dayjs }}
            </span>
            <span slot="status" slot-scope="text">
              {{ text | status }}
            </span>
            <template slot="sell_leve" slot-scope="text">
              {{ text == 1 ? '普通销售' : text == 2 ? '销售主管' : '普通用户' }}
            </template>
            <span slot="action" slot-scope="text, record">
              <template v-if="$store.state.rights[0].children[0].children[0].edit == 1">
                <a @click="handleEdit(record)">修改</a>
                <a-divider type="vertical" />
              </template>
              <a-dropdown>
                <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
                <a-menu slot="overlay">
                  <a-menu-item>
                    <a
                      href="javascript:;"
                      @click="ifchange(record)"
                      v-if="$store.state.rights[0].children[0].children[0].edit == 1"
                      >重置密码</a
                    >
                  </a-menu-item>
                  <a-menu-item>
                    <a
                      href="javascript:;"
                      v-if="record.user_id != 1 && $store.state.rights[0].children[0].children[0].delete == 1"
                      @click="showDeleteConfirm(record)"
                      >删除</a
                    >
                  </a-menu-item>
                  <a-menu-item>
                    <a href="javascript:;" v-if="record.user_id != 1" @click="showhistory(record)">历史记录</a>
                  </a-menu-item>
                </a-menu>
              </a-dropdown>
            </span>
          </a-table>
        </a-spin>
      </a-col>
    </a-row>
    <div>
      <a-modal
        :title="ifaddgoodsclass ? '新增部门信息' : '编辑部门信息'"
        :visible="ifvisiblegoodsclass"
        :confirm-loading="confirmLoading"
        okText="保存"
        cancelText="取消"
        @ok="handlegoodsclass"
        :centered="true"
        @cancel="
          () => {
            this.ifvisiblegoodsclass = false
            this.newgoodsclassname = ''
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <a-form-item>
              <a-input size="large" :maxLength="50" placeholder="部门名称" v-model="newgoodsclassname"></a-input>
            </a-form-item>
          </a-spin>
        </div>
      </a-modal>
    </div>
    <div>
      <a-modal
        :title="ifaddamdmindata ? '新增用户信息' : '用户信息编辑'"
        :visible="ifshouedit"
        :confirm-loading="confirmLoading1"
        okText="保存"
        @ok="savedata"
        :centered="true"
        @cancel="handleCanceluserdata"
        cancelText="取消"
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="edit">
              <a-form-item label="用户昵称:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="用户昵称"
                  v-model="oneuserdata.nick_name"
                ></a-input>
              </a-form-item>
              <a-form-item label="所属部门:" v-if="!ifaddamdmindata && oneuserdata.dept_name != ''">
                <a-input
                  size="large"
                  type="text"
                  style="width: 365px"
                  placeholder="所属部门"
                  allowClear
                  readonly="true"
                  v-model="oneuserdata.dept_name"
                ></a-input>
              </a-form-item>
              <a-form-item
                label="所属部门:"
                v-if="oneuserdata.dept_name == null || oneuserdata.dept_name == '' || ifaddamdmindata"
              >
                <a-cascader
                  size="large"
                  :display-render="displayRender"
                  style="width: 365px"
                  :options="orgTree"
                  change-on-select
                  @change="onChange"
                  expand-trigger="hover"
                  placeholder="所属部门"
                />
              </a-form-item>
              <a-form-item label="权限等级:">
                <a-select
                  size="large"
                  style="width: 365px"
                  show-search
                  placeholder="权限等级"
                  option-filter-prop="children"
                  allowClear
                  v-model="oneuserdata.role_id"
                >
                  <a-select-option
                    v-for="(items, index) in allroledata"
                    :key="index"
                    :label="items.role_name"
                    :value="items.role_id"
                    >{{ items.role_name }}</a-select-option
                  >
                </a-select>
              </a-form-item>
              <a-form-item label="电话:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="电话"
                  v-model="oneuserdata.phonenumber"
                ></a-input>
              </a-form-item>
              <a-form-item label="性别:">
                <a-select
                  size="large"
                  style="width: 365px"
                  show-search
                  placeholder="性别"
                  option-filter-prop="children"
                  v-model="oneuserdata.sex"
                >
                  <a-select-option value="1"> 男 </a-select-option>
                  <a-select-option value="2"> 女 </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="销售级别:">
                <a-select
                  size="large"
                  style="width: 365px"
                  show-search
                  placeholder="销售级别"
                  option-filter-prop="children"
                  v-model="oneuserdata.sell_leve"
                >
                  <a-select-option :value="1"> 销售人员 </a-select-option>
                  <a-select-option :value="2"> 销售主管 </a-select-option>
                  <a-select-option :value="3"> 普通用户 </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="邮箱:">
                <a-input
                  size="large"
                  :maxLength="50"
                  type="text"
                  placeholder="邮箱（非必填）"
                  v-model="oneuserdata.email"
                ></a-input>
              </a-form-item>
            </p>
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
      <div>
        <a-modal
          title="修改密码"
          :visible="ifchangepassword"
          :confirm-loading="confirmLoading"
          okText="保存"
          cancelText="取消"
          @ok="handleOk"
          :centered="true"
          @cancel="handleCancel"
          :maskClosable="false"
          :destroyOnClose="true"
          :confirmLoading="spinning"
        >
          <div>
            <a-spin :spinning="spinning">
              <p class="password">
                <a-form-item>
                  <a-input-password
                    size="large"
                    placeholder="至少6位新密码，区分大小写"
                    v-model="password"
                  ></a-input-password>
                </a-form-item>
                <a-form-item>
                  <a-input-password size="large" placeholder="确认新密码" v-model="password1"></a-input-password>
                </a-form-item>
              </p>
            </a-spin>
          </div>
        </a-modal>

        <a-modal
          title="选择销售"
          style="top: 20px"
          :maskClosable="false"
          :destroyOnClose="true"
          v-model="selectsell"
          :confirmLoading="spinning"
          @ok="handleOksell"
          @cancel="
            () => {
              this.selectsell = false
              this.newsellid = ''
            }
          "
          okText="保存"
          cancelText="取消"
        >
          <span :spinning="spinning" size="large">
            <a-form-item label="选择销售:">
              <div>因为有用户信息绑定该销售，如果需要将该用户从销售改为普通用户或者删除该销售信息需要换绑</div>
              <a-select size="large" placeholder="选择销售" style="width: 230px" v-model="newsellid" allowClear>
                <a-select-option
                  v-for="(items, index) in allsells"
                  :key="index"
                  :label="items.name"
                  :value="items.id"
                  >{{ items.name }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </span>
        </a-modal>
      </div>
    </div>

    <org-modal ref="modal" @ok="handleSaveOk" @close="handleSaveClose" />
  </a-card>
</template>

<script>
import STree from '@/components/Tree/Tree'
import { STable } from '@/components'
import OrgModal from './modules/OrgModal'
const columns = [
  {
    title: '用户编号',
    sorter: true,
    dataIndex: 'user_id',
    width: 110,
    scopedSlots: { customRender: 'user_id' },
  },
  {
    title: '用户名称',
    sorter: true,
    dataIndex: 'user_name',
  },
  {
    title: '用户昵称',
    sorter: true,
    dataIndex: 'nick_name',
  },
  {
    title: '手机号码',
    sorter: true,
    dataIndex: 'phonenumber',
  },
  {
    title: '部门',
    dataIndex: 'deptname',
  },
  {
    title: '销售级别',
    width: 100,
    dataIndex: 'sell_leve',
    scopedSlots: { customRender: 'sell_leve' },
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
  },
  // {
  //   title: '创建时间',
  //   dataIndex: 'create_time',
  //   scopedSlots: { customRender: 'create_time' },
  // },
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
  name: 'adminForm',
  components: {
    STable,
    STree,
    OrgModal,
  },
  data() {
    return {
      selectsell: false,
      confirmLoading1: false,
      confirmLoading: false,
      ifaddgoodsclass: false,
      ifvisiblegoodsclass: false,
      newsellid: '',
      oneuserdata: {},
      departmentname: '',
      newgoodsclassname: '',
      delete: false,
      selectuserdata: {},
         baseURL: 'http://8.136.103.102:8088/api',
      // baseURL:"http://47.103.34.184:8085/api",
      // baseURL: 'http://localhost:8085/api',
      classkeywords: '',
      password: '',
      password1: '',
      columns,
      queryParam: {},
      allsells: [],
      alldeit: [],
      historyColumns,
      historydata: [],
      ifshowhistory: false,
      olddata: {},
      allroledata: [],
      seletdata: [],
      allusertype: [],
      alldeptdata: [],
      keywords: '',
      alldetpeid: '',
      oldclassname: '',
      NodeTreeItem: null,
      spinning: false,
      ifaddamdmindata: false,
      ifshouedit: false,
      ifchangepassword: false,
      registerBtn: false,
      loadData: [],
      orgTree: [],
      selectedRowKeys: [],
      selectedRows: [],
    }
  },
  created() {
    this.getOrgTreeData()
    this.getAlldata()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出全部用户列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllAdminListPage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['用户编号', '用户名称', '用户昵称', '手机号码', '部门', '销售级别', '状态']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.user_id == null ? '' : element.user_id,
                    element.user_name == null ? '' : element.user_name,
                    element.nick_name == null ? '' : element.nick_name,
                    element.phonenumber == null ? '' : element.phonenumber,
                    element.deptname == null ? '' : element.deptname,
                    element.sell_leve == null
                      ? ''
                      : element.sell_leve == 1
                      ? '普通销售'
                      : element.sell_leve == 2
                      ? '销售主管'
                      : '普通用户',
                    element.status == null ? '' : element.status == '0' ? '启用' : '禁用',
                    // element.create_time == null
                    //   ? ''
                    //   : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.create_time)),
                  ]
                  element.registerdate = alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '系统用户信息列表')
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
    dateFtt(fmt, date) {
      //yyyy-MM-dd hh:mm:ss  或 yyyy-MM-dd
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
      return fmt;
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAlldata()
    },
    getAlldata() {
      const that = this
      that.spinning = true
      var formdate = {}
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      if (that.alldetpeid != '') {
        formdate.alldeptid = that.alldetpeid
      }
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      that
        .$request({
          url: '/user/getAllAdminListPage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              if (element.user_identity == '' || element.user_identity == 'null') {
                element.user_identity = '暂未实名'
              }
            })
            that.loadData = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    displayRender({ labels }) {
      return labels[labels.length - 1]
    },
    getallroledata() {
      const that = this
      that.spinning = true
      that
        .$request({
          url: '/user/getAllRoleData',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.allroledata = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    addadmindata() {
      const that = this
      that.ifshouedit = true
      that.ifaddamdmindata = true
      that.getallroledata()
    },
    showhistory(e) {
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'adminForm'
      formdate.id = e.user_id
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
    showDeleteConfirm(e) {
      const that = this
      that.selectuserdata = e
      this.$confirm({
        title: '是否确定删除该账号?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          if (e.sell_leve == 1 || e.sell_leve == 2) {
            that
              .$request({
                url: '/user/selectAllSell',
                method: 'get',
                params: {},
              })
              .then((res) => {
                that.spinning = false
                if (res.status == 200) {
                  res.data.forEach((item) => {
                    if (item.user_id == that.selectuserdata.user_id) {
                      res.data.splice(item, 1)
                    }
                  })
                  that.allsells = res.data
                  that.delete = true
                  that.selectsell = true
                }
              })
              .catch(function () {
                that.$message.error('抱歉,未知错误,请联系管理员!')
              })
          } else {
            this.deleteByid(e)
          }
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    deleteByid(e) {
      const that = this
      that.spinning = true
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      formdate.userid = e.user_id
      formdate.username = e.nick_name
      formdate.bills_type = 'adminForm'
      formdate.phonenumber = e.phonenumber
      this.$request({
        url: '/user/deleteOneAdmindataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.selectsell = false
            that.restart()
            that.$message.success('删除成功!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleOk() {
      const that = this
      if (that.password == '') {
        this.$message.warning('请填写新密码!')
        return
      }
      if (that.password1 == '') {
        this.$message.warning('请确认新密码!')
        return
      }
      var arr = new Array()
      arr = that.password.split(' ')
      if (arr.length != 1) {
        this.$message.warning('请勿在密码中加入空格!')
        return
      }
      if (that.password1 != that.password) {
        this.$message.warning('请确认两次密码输入正确!')
        return
      }
      that.spinning = true
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      formdate.phonenumber = that.oneuserdata.phonenumber
      formdate.newpassword = that.password1
      formdate.type_id = that.oneuserdata.user_id
      formdate.user_id = that.oneuserdata.user_id
      formdate.bills_type = 'adminForm'
      formdate.updatepassword = 'yes'
      this.$request({
        url: '/user/updataAdmindataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.registerBtn = false
            that.password1 = ''
            that.password = ''
            that.ifchangepassword = false
            that.oneuserdata = {}
            that.$message.success('重置密码成功!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.registerBtn = false
          that.oneuserdata = {}
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    ifchange(e) {
      const that = this
      that.ifchangepassword = true
      that.oneuserdata = e
    },
    savedata() {
      const that = this
      if (that.oneuserdata.nick_name == '' || that.oneuserdata.nick_name == null) {
        that.$message.warning('请填写用户名!')
        return
      }
      if (that.oneuserdata.dept_name == '' || that.oneuserdata.dept_name == null) {
        that.$message.warning('请选择所属部门!')
        return
      }
      if (that.oneuserdata.role_id == '' || that.oneuserdata.role_id == null) {
        that.$message.warning('请选择用户权限!')
        return
      }
      if (!/^1[3456789]\d{9}$/.test(that.oneuserdata.phonenumber)) {
        this.$message.warning('请填写正确手机号!')
        return
      }
      if (that.oneuserdata.sex == '' || that.oneuserdata.sex == null) {
        that.$message.warning('请选择性别!')
        return
      }
      if (that.oneuserdata.sell_leve == '' || that.oneuserdata.sell_leve == null) {
        that.$message.warning('请选择销售级别!')
        return
      }
      that.oneuserdata.bills_type = 'adminForm'
      that.oneuserdata.myid = that.$store.state.admin.user_id

      that.oneuserdata.user_phone = that.oneuserdata.phonenumber
      var rolename = ''
      that.allroledata.forEach((Element) => {
        if (Element.role_id == that.oneuserdata.role_id) {
          rolename = Element.role_name
        }
      })
      var xingbie = ''
      if (that.oneuserdata.sex == '1') {
        that.oneuserdata.xingbie = '男'
        xingbie = '男'
      } else {
        that.oneuserdata.xingbie = '女'
        xingbie = '女'
      }

      var renyuan = ''
      if (that.oneuserdata.sell_leve == 1 || that.oneuserdata.sell_leve == 2) {
        that.oneuserdata.renyuan = '销售人员'
        renyuan = '销售人员'
      } else {
        that.oneuserdata.renyuan = '普通人员'
        renyuan = '普通人员'
      }
      var youxiang = '暂无'
      if (that.oneuserdata.email != null) {
        youxiang = that.oneuserdata.email
      }
      var data = ''
      if (that.ifaddamdmindata) {
        data = '新增'
      } else {
        data = '修改后'
      }
      that.alldeptdata.forEach((item) => {
        if (item.title == that.oneuserdata.dept_name) {
          that.oneuserdata.dept_id = item.id
        }
      })
      if (that.ifaddamdmindata) {
        that.oneuserdata.user_operation_record_detail = data + '用户：' + that.oneuserdata.nick_name
        // +
        // ',所属部门：' +
        // that.oneuserdata.dept_name +
        // ',联系方式：' +
        // that.oneuserdata.phonenumber +
        // ',权限名称：' +
        // rolename +
        // ',邮箱地址：' +
        // youxiang +
        // ',性别：' +
        // xingbie
        that.spinning = true

        var newdata = {}
        newdata.user_phone = that.oneuserdata.phonenumber
        newdata.user_password = '111111'
        that
          .$axios({
            method: 'post', //指定请求方式
            url:that.baseURL+ '/user/houRegisterUser',
            dataType: 'json',
            params: newdata,
            headers: { 'Access-Control-Allow-Origin': '*', Authorization: '123' },
          })
          .then((res) => {
            that.spinning = false
            console.log('111111111111111ddddd')
            console.log(res.data.status)
            if (res.data.status == '200' || res.data.status == '406') {
              this.$request({
                url: '/user/addAdmindata',
                method: 'get',
                params: that.oneuserdata,
              })
                .then((res) => {
                  if (res.status == 200) {
                    that.spinning = false
                    that.ifshouedit = false
                    that.ifaddamdmindata = false
                    that.oneuserdata = {}
                    that.restart()
                    that.$message.success('新增用户信息成功,默认密码111111')
                  } else if (res.status == 407) {
                    that.spinning = false
                    that.$message.error('抱歉,该手机号已经被注册!')
                  } else if (res.status == 406) {
                    that.spinning = false
                    that.$message.error('抱歉,未知错误,请联系管理员!')
                  }
                })
                .catch(function () {
                  that.spinning = false
                  that.$message.error('抱歉,未知错误,请联系管理员!')
                })
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
        var rolename = ''
        that.allroledata.forEach((Element) => {
          if (Element.role_id == that.olddata.role_id) {
            rolename = Element.role_name
          }
        })
        var xingbie = ''
        if (that.olddata.sex == '1') {
          xingbie = '男'
        } else {
          xingbie = '女'
        }

        var renyuan = ''
        if (that.olddata.sell_leve == 1 || that.oneuserdata.sell_leve == 2) {
          renyuan = '销售人员'
        } else {
          renyuan = '普通人员'
        }
        var youxiang = '暂无'
        if (that.olddata.email != null) {
          youxiang = that.olddata.email
        }
        var nick_name = ''
        if (that.olddata.nick_name != that.oneuserdata.nick_name) {
          nick_name = '用户昵称：' + that.olddata.nick_name + ',修改为：' + that.oneuserdata.nick_name + ','
        }
        var xiugaideptname = ''
        if (that.olddata.deptname != that.oneuserdata.dept_name) {
          xiugaideptname = '所属部门：' + that.olddata.deptname + ',修改为：' + that.oneuserdata.dept_name + ','
        }
        var phonenumber = ''
        if (that.olddata.phonenumber != that.oneuserdata.phonenumber) {
          phonenumber = '联系方式：' + that.olddata.phonenumber + ',修改为：' + that.oneuserdata.phonenumber + ','
        }
        var rolename = ''
        if (that.olddata.rolename != that.oneuserdata.rolename) {
          rolename = '权限名称：' + that.olddata.rolename + ',修改为：' + that.oneuserdata.rolename + ','
        }

        var xiugaiyouxiang = ''
        if (that.olddata.email != that.oneuserdata.email) {
          xiugaiyouxiang = '邮箱地址：' + youxiang + ',修改为：' + that.oneuserdata.email + ','
        }
        var xiugaixingbie = ''
        if (xingbie != that.oneuserdata.xingbie) {
          xiugaixingbie = '性别：' + xingbie + ',修改为：' + that.oneuserdata.xingbie + ','
        }

        var xiugairenyuan = ''
        if (renyuan != that.oneuserdata.renyuan) {
          xiugairenyuan = '销售级别：' + renyuan + ',修改为：' + that.oneuserdata.renyuan
        }

        that.oneuserdata.user_operation_record_detail =
          nick_name + xiugaideptname + phonenumber + rolename + xiugaiyouxiang + xiugaixingbie + xiugairenyuan
        that.spinning = true
        //需要选择转移到哪个账户上，如果有用户信息需要转移，那就跳出来弹框选择转移到哪个上面再进行更新，如果没有用户信息直接更新
        if ((that.olddata.sell_leve == 1 || that.olddata.sell_leve == 2) && that.oneuserdata.sell_leve == 3) {
          var formdate = {}
          formdate.userid = that.oneuserdata.user_id
          this.$request({
            url: '/user/selectAllbangdinguserData',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              that.spinning = false
              console.log('全部的用户信息')
              console.log(res.data)
              if (res.data.length > 0) {
                //有用户信息选择哪个销售来换绑
                that.selectsell = true
              } else {
                //没有多的用户信息就不需要换绑直接跟新
                this.updatadata()
              }
            })
            .catch(function () {
              that.spinning = false
              that.$message.error('抱歉,未知错误,请联系管理员!')
            })
        } else {
          this.updatadata()
        }
      }
    },
    handleOksell() {
      //先更新全部的绑定销售信息
      const that = this
      var formdate = {}
      formdate.newsellid = that.newsellid
      if (that.delete == false) {
        formdate.userid = that.oneuserdata.user_id
      } else {
        formdate.userid = that.selectuserdata.user_id
      }

      this.$request({
        url: '/user/updataAllSelldataByuserid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          console.log('更新成功！')
          if (that.delete == false) {
            this.updatadata()
          } else {
            this.deleteByid(that.selectuserdata)
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    updatadata() {
      const that = this
      this.$request({
        url: '/user/updataAdmindataByid',
        method: 'get',
        params: that.oneuserdata,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.selectsell = false
            that.ifshouedit = false
            that.olddata = {}
            that.restart()
            that.$message.success('修改成功!')
          } else if (res.code == 201) {
            that.spinning = false
            that.$message.error('抱歉,该手机号已被注册!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleCancel() {
      const that = this
      that.ifchangepassword = false
      that.password = ''
      that.password1 = ''
    },
    handleCanceluserdata() {
      const that = this
      that.ifshouedit = false
      if (that.ifaddamdmindata) {
        that.ifaddamdmindata = false
      }
      that.oneuserdata = {}
    },
    handleEdit(e) {
      const that = this
      that.ifshouedit = true
      that.delete = false
      var formdata = {}
      formdata.userid = e.user_id
      that.olddata = e
      that.getallroledata()
      that
        .$request({
          url: '/user/getOneAdminDataByid',
          method: 'get',
          params: formdata,
        })
        .then((res) => {
          that.oneuserdata = res.data
          if (that.oneuserdata.sell_leve == 1 || that.oneuserdata.sell_leve == 2) {
            that
              .$request({
                url: '/user/selectAllSell',
                method: 'get',
                params: {},
              })
              .then((res) => {
                that.spinning = false
                if (res.status == 200) {
                  res.data.forEach((item) => {
                    if (item.user_id == that.oneuserdata.user_id) {
                      res.data.splice(item, 1)
                    }
                  })
                  that.allsells = res.data
                  console.log('全部是杀杀杀')
                  console.log(that.allsells)
                }
              })
              .catch(function () {
                that.$message.error('抱歉,未知错误,请联系管理员!')
              })
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onserchbykeywords() {
      const that = this
      that.registerBtn = true
      this.queryParam = {
        keywords: this.keywords,
      }
      this.getAlldata()
      that.registerBtn = false
    },

    restart() {
      const that = this
      that.keywords = ''
      that.departmentname = ''
      that.alldetpeid = ''
      that.registerBtn = true
      that.queryParam = {}
      that.getOrgTreeData()
      this.getAlldata()
      that.registerBtn = false
    },
    handlegoodsclass() {
      const that = this
      if (that.newgoodsclassname == '' || that.newgoodsclassname == null) {
        that.$message.error('请填写部门名称!')
        return
      }
      if (that.ifaddgoodsclass) {
        // that.spinning = true
        var formdate = {}
        formdate.myid = that.$store.state.admin.user_id
        formdate.classname = that.newgoodsclassname
        if (that.seletdata.classtype != 0) {
          formdate.parentid = that.seletdata.key
          if (that.seletdata.classtype == 1) {
            var newdata = '0,1,2'
          } else {
            var newdata = '0,1,2,3'
          }
          // formdate.ancestors = that.seletdata.ancestors.join(',')
          formdate.ancestors = newdata
        } else {
          formdate.parentid = 0
          formdate.ancestors = '9'
        }
        this.$request({
          url: '/user/addDeptClassData',
          method: 'get',
          params: formdate,
        })
          .then((res) => {
            if (res.status == 200) {
              that.ifvisiblegoodsclass = false
              that.newgoodsclassname = ''
              that.restart()
              that.$message.success('新增部门信息成功!')
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
        //新增商品类别
        that.spinning = true
        var formdate = {}
        formdate.myid = that.$store.state.admin.user_id
        formdate.id = that.seletdata.key
        formdate.classname = that.newgoodsclassname
        formdate.oldclassname = that.oldclassname
        this.$request({
          url: '/user/updateDeptClassById',
          method: 'get',
          params: formdate,
        })
          .then((res) => {
            if (res.status == 200) {
              that.ifvisiblegoodsclass = false
              that.restart()
              that.$message.success('编辑部门信息成功!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },
    onSelect(selectedKeys, info) {
      var nowdata = {}
      this.alldeptdata.forEach((element) => {
        if (element.id == selectedKeys[0]) {
          nowdata = element
        }
      })
      var arr = Object.keys(nowdata)
      if (!arr.length == 0) {
        var allid = []
        if (nowdata.ancestors.length == 1) {
          //一级
          var childdata = [] //全部二级的分类

          this.alldeptdata.forEach((element) => {
            if (element.parentid == selectedKeys[0]) {
              //二级
              childdata.push(element)
              allid.push(element.id)
            }
          })

          var allid = []
          if (childdata.length > 0) {
            childdata.forEach((item) => {
              this.alldeptdata.forEach((element) => {
                if (element.parentid == item.id) {
                  //二级
                  allid.push(element.id)
                }
              })
            })
          }
        } else if (nowdata.ancestors.length == 3) {
          //二级
          allid.push(nowdata.id)
          this.alldeptdata.forEach((element) => {
            if (element.parentid == selectedKeys[0]) {
              allid.push(element.id)
            }
          })
        } else if (nowdata.ancestors.length == 4) {
          //三级
          allid.push(nowdata.id)
        }
        var aa = ''
        this.classkeywords = info.node.title
        if (allid.length > 0) {
          aa = allid.join(',')
        } else {
          aa = '0'
        }
        this.alldetpeid = aa
        this.getAlldata()
      }
    },
    onSearch() {
      const that = this
      that.getOrgTreeData()
    },
    orgAddoneclass() {
      const that = this
      that.ifaddgoodsclass = true
      that.NodeTreeItem = false
      that.seletdata.classtype = 0
      that.ifvisiblegoodsclass = true
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
    orgAdd() {
      const that = this
      that.ifaddgoodsclass = true
      that.ifvisiblegoodsclass = true
    },
    orgEdit() {
      const that = this
      that.ifaddgoodsclass = false
      that.ifvisiblegoodsclass = true
      that.newgoodsclassname = that.seletdata.title
      that.oldclassname = that.seletdata.title
      that.spinning = false
    },
    orgDelete() {
      const that = this
      this.$confirm({
        title: '是否确定删除该部门信息?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var nowdata = {}
          this.alldeptdata.forEach((element) => {
            if (element.id == that.seletdata.key) {
              nowdata = element
            }
          })
          console.log('ffffffffffff')
          console.log(nowdata)
          var arr = Object.keys(nowdata)
          if (!arr.length == 0) {
            var allid = []
            if (nowdata.ancestors.length == 1) {
              //一级
              var childdata = [] //全部二级的分类
              this.alldeptdata.forEach((element) => {
                if (element.parentid == that.seletdata.key) {
                  //二级
                  childdata.push(element)
                  allid.push(element.id)
                }
              })
              var allid = []
              if (childdata.length > 0) {
                childdata.forEach((item) => {
                  this.alldeptdata.forEach((element) => {
                    if (element.parentid == item.id) {
                      //二级
                      allid.push(element.id)
                    }
                  })
                })
              }
            } else if (nowdata.ancestors.length == 2) {
              //二级

              allid.push(nowdata.id)
              this.alldeptdata.forEach((element) => {
                if (element.parentid == that.seletdata.ancestors[0]) {
                  allid.push(element.id)
                }
              })
            } else if (nowdata.ancestors.length == 3) {
              //三级
              allid.push(nowdata.id)
            }
            var aa = ''
            this.classkeywords = that.seletdata.title
            if (allid.length > 0) {
              aa = allid.join(',')
            } else {
              aa = '0'
            }
            this.alldetpeid = aa
            var formdate = {}

            if (that.alldetpeid != '') {
              formdate.alldeptid = that.alldetpeid
            }
            console.log('2222222222222')
            console.log(that.alldetpeid)
            that
              .$request({
                url: '/user/getAllAdminListPage',
                method: 'get',
                params: formdate,
              })
              .then((res) => {
                if (res.code == 200) {
                  if (res.data.length == 0) {
                    var formdate = {}
                    formdate.myid = that.$store.state.admin.user_id
                    formdate.id = that.seletdata.key
                    formdate.classname = that.seletdata.title
                    if (that.seletdata.classtype == 1) {
                      formdate.type = '一级'
                    } else if (that.seletdata.classtype == 2) {
                      formdate.type = '三级'
                    } else if (that.seletdata.classtype == 3) {
                      formdate.type = '二级'
                    } else {
                      formdate.type = '初级'
                    }
                    this.$request({
                      url: '/user/deleteDeptClassById',
                      method: 'get',
                      params: formdate,
                    })
                      .then((res) => {
                        if (res.status == 200) {
                          that.NodeTreeItem = false
                          that.restart()
                          that.$message.success('删除成功!')
                        }
                      })
                      .catch(function () {
                        that.$message.error('抱歉,未知错误,请联系管理员!')
                      })
                  } else {
                    that.$message.warning('抱歉,该部门下有用户,无法删除!')
                  }
                }
              })
              .catch(function () {
                that.spinning = false
                that.$message.error('抱歉,未知错误,请联系管理员!')
              })
          }
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    handleAdd(item) {
      //点击每个部门就添加查询条件
      console.log('添加查询关键字item.key', item.key)
      this.queryParam = {
        deptid: item.key,
      }
      this.$refs.table.refresh(true)
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onChange(value, selectedOptions) {
      // this.oneuserdata.dept_id = selectedOptions[value.length - 1].value
      this.oneuserdata.dept_name = selectedOptions[value.length - 1].value
    },
    handleSaveOk() {},
    handleSaveClose() {},
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = selectedRows
    },
    getOrgTreeData() {
      //查询树形列表的全部数据
      const that = this
      that.orgTree = []
      that.alldeptdata = []
      var dataoptions = []
      var formdate = {}
      if (that.goodsclassname != '') {
        formdate.keywords = that.goodsclassname
      }
      this.$request({
        url: '/user/getAllDeptClass',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.alldeptdata = res.data
            res.data.forEach((item) => {
              item.ancestors = item.ancestors.split(',')
            })
            res.data.forEach((industry) => {
              var thefastindustrys = {}
              if (industry.ancestors.length == 1) {
                thefastindustrys = {
                  title: industry.title,
                  key: industry.id,
                  label: industry.title,
                  value: industry.title,
                  classtype: 1,
                  ancestors: industry.ancestors,
                  icon: 'plus',
                }
                var children = getChildrenindustry(industry.id)
                if (children.length > 0) {
                  thefastindustrys.children = children
                }
                dataoptions.push(thefastindustrys)
              }
              function getChildrenindustry(id) {
                var children = []
                res.data.forEach((industry) => {
                  var thefastindustrys = {}
                  if (industry.parentid === id) {
                    thefastindustrys = {
                      title: industry.title,
                      key: industry.id,
                      label: industry.title,
                      value: industry.title,
                      classtype: 2,
                      ancestors: industry.ancestors,
                      icon: 'plus',
                    }
                    if (industry.ancestors.length == 3) {
                      thefastindustrys.classtype = 3
                    }
                    if (industry.title) {
                      var sonchildren = getChildrenindustry(industry.id)
                      if (sonchildren.length > 0) {
                        thefastindustrys.children = sonchildren
                      }
                    }
                    children.push(thefastindustrys)
                  }
                })
                return children
              }
              that.orgTree = dataoptions
            })
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

<style lang="less">
.custom-tree {
  /deep/ .ant-menu-item-group-title {
    position: relative;
    &:hover {
      .btn {
        display: block;
      }
    }
  }

  /deep/ .ant-menu-item {
    &:hover {
      .btn {
        display: block;
      }
    }
  }

  /deep/ .btn {
    display: none;
    position: absolute;
    top: 0;
    right: 10px;
    width: 20px;
    height: 40px;
    line-height: 40px;
    z-index: 1050;

    &:hover {
      transform: scale(1.2);
      transition: 0.5s all;
    }
  }
}
.edit {
  width: 368px;
  margin: 0 auto;
  @media screen and (max-width: 576px) {
    width: 95%;
  }
  @media screen and (max-width: 320px) {
    .captcha-button {
      font-size: 14px;
    }
  }
}
</style>
