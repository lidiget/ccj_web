<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search style="margin-left: 16px; width: 272px; margin-bottom: 16px" v-model="keywords" />
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      type="primary"
      @click="addCommonuserdata"
      :loading="spinning"
      v-if="$store.state.rights[1].children[0].children[0].add == 1"
    >
      +新增用户
    </a-button>

    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      type="primary"
      @click="setfenxiao"
      :loading="spinning"
      v-if="$store.state.rights[1].children[0].children[0].fenxiao == 1"
    >
      +分销提成金额设置
    </a-button>

    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-top"
      @click="
        () => {
          this.ifdaorugoods = true
        }
      "
      :loading="spinning"
      v-if="$store.state.rights[1].children[0].children[0].upload == 1"
    >
      批量导入
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
      v-if="$store.state.rights[1].children[0].children[0].import == 1"
    >
      导出用户列表
    </a-button>
    <a-spin :spinning="spinning" size="large">
      <a-table
        ref="table"
        size="default"
        :columns="columns"
        :data-source="data"
        bordered
        :alert="false"
        @change="handleTableChange"
      >
        <span slot="user_creatime" slot-scope="text">
          {{ text | dayjs }}
        </span>
        <span slot="user_status" slot-scope="text">
          {{ text == '0' ? '启用' : text == '1' ? '禁用' : text == '2' ? '重点' : '一般' }}
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)" v-if="$store.state.rights[1].children[0].children[0].edit == 1">修改</a>
            <a-divider type="vertical" v-if="$store.state.rights[1].children[0].children[0].edit == 1" />
          </template>
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a
                  href="javascript:;"
                  @click="changepassword(record)"
                  v-if="$store.state.rights[1].children[0].children[0].edit == 1"
                  >重置密码</a
                >
              </a-menu-item>
              <a-menu-item>
                <a
                  href="javascript:;"
                  @click="deletecommonuser(record)"
                  v-if="$store.state.rights[1].children[0].children[0].delete == 1"
                  >删除</a
                >
              </a-menu-item>
              <a-menu-item v-if="$store.state.rights[1].children[0].children[0].bangding == 1">
                <a href="javascript:;" @click="bangdingxiaoshou(record)">{{
                  record.sell_id ? '换绑销售' : '绑定销售'
                }}</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="lookwenjian(record)">文件信息</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="showhistory(record)">历史记录</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
        <template slot="title"> 普通用户信息列表 </template>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        :visible="ifdaorugoods"
        :confirm-loading="spinning"
        @ok="importFile"
        @cancel="
          () => {
            this.ifdaorugoods = false
            this.spinning = false
            this.file = undefined
            this.fileExcleList = []
          }
        "
        okText="开始导入"
        cancelText="取消"
      >
        <template>
          <a-spin :spinning="spinning" size="large">
            <div style="font: 12px arial, 微软雅黑, 宋体">
              <div style="border: 1px solid #ccc">
                <div class="backmingxi">新增普通用户导入</div>
                <div style="padding: 28px; padding-top: 16px; padding-bottom: 5px">
                  <div style="margin-bottom: 6px">
                    请先下载导入明细模板:
                    <a-span @click="downmuban()" style="color: blue; cursor: pointer">下载模板</a-span>
                  </div>
                  <div style="margin-bottom: 4px">提示：</div>
                  <div>1）请先下载导入模板并按模板填写普通用户基本信息，完成后再选择导入文件</div>
                  <div>2）用户名称为必填项，否则将导入失败</div>
                  <div>3）导入文件要求是excel格式，文件大小不能超过4M</div>
                </div>
              </div>
              <div style="margin-top: 15px">
                <a-upload :file-list="fileExcleList" :remove="handleRemove" :before-upload="beforeUploadexcel">
                  <a-button size="small" type="primary" :loading="spinning">
                    <a-icon type="upload" /> 选择文件
                  </a-button>
                </a-upload>
              </div>
            </div>
          </a-spin>
        </template>
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
    <div>
      <a-modal
        title="修改密码"
        :visible="ifchangepassword"
        :confirm-loading="confirmLoading"
        okText="保存"
        cancelText="取消"
        @ok="handlechangeOk"
        :centered="true"
        @cancel="
          () => {
            ifchangepassword = false
            password = ''
            password1 = ''
          }
        "
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
                  :maxLength="50"
                  placeholder="至少6位新密码，区分大小写"
                  v-model="password"
                ></a-input-password>
              </a-form-item>
              <a-form-item>
                <a-input-password
                  size="large"
                  :maxLength="50"
                  placeholder="确认新密码"
                  v-model="password1"
                ></a-input-password>
              </a-form-item>
            </p>
          </a-spin>
        </div>
      </a-modal>
    </div>
    <div>
      <a-modal
        :title="ifaddcommomuserdata ? '新增普通用户信息' : '编辑普通用户信息'"
        :visible="visible"
        :confirm-loading="confirmLoading"
        okText="保存"
        @ok="handleOk"
        :centered="true"
        cancelText="取消"
        @cancel="handleCancel"
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="edit">
              <a-form-item label="用户名:">
                <a-input
                  size="large"
                  type="text"
                  placeholder="用户名"
                  :maxLength="50"
                  v-model="onecommonuserdata.user_name"
                ></a-input>
              </a-form-item>
              <a-form-item label="真实姓名:">
                <a-input
                  :disabled="onecommonuserdata.user_authentication == '企业认证'"
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="真实姓名"
                  v-model="onecommonuserdata.user_realname"
                ></a-input>
              </a-form-item>
              <a-form-item label="用户身份证:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="用户身份证"
                  v-model="onecommonuserdata.user_identity"
                ></a-input>
              </a-form-item>
              <a-form-item label="用户地址:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="用户地址"
                  v-model="onecommonuserdata.user_address"
                ></a-input>
              </a-form-item>
              <a-form-item label="用户微信号:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="用户微信号"
                  v-model="onecommonuserdata.user_wechat_id"
                ></a-input>
              </a-form-item>
              <a-form-item label="用户微信名称:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="用户微信号"
                  v-model="onecommonuserdata.user_wechat_name"
                ></a-input>
              </a-form-item>
              <a-form-item label="用户状态:">
                <a-select
                  size="large"
                  style="width: 365px"
                  show-search
                  :maxLength="50"
                  placeholder="用户状态"
                  option-filter-prop="children"
                  v-model="onecommonuserdata.user_status"
                >
                  <a-select-option :value="'0'"> 启用 </a-select-option>
                  <a-select-option :value="'1'"> 禁用 </a-select-option>
                  <a-select-option :value="'2'"> 重点 </a-select-option>
                  <a-select-option :value="'3'"> 一般 </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="相关联文件(文件大小小于4M):">
                <a-upload :file-list="fileListlunbo" :remove="handleRemovelunbo" :before-upload="beforeUploadlunbo">
                  <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
              <a-form-item label="备注:">
                <a-input
                  size="large"
                  :maxLength="200"
                  placeholder="备注"
                  v-model="onecommonuserdata.user_remark"
                  type="textarea"
                />
              </a-form-item>
            </p>
          </a-spin>
        </div>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="设置分销提成金额"
        :visible="visiblefenxiao"
        :confirm-loading="confirmLoading"
        okText="保存"
        @ok="handleOkfenxiao"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.visiblefenxiao = false
            this.fenxiaomoney = 0
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <a-form-item label="分销金额设置:" style="margin-left: 100px">
              <a-input-number
                id="inputNumber"
                size="large"
                :maxLength="50"
                style="width: 230px"
                placeholder="分销金额"
                v-model="fenxiaomoney"
                :min="0"
              />
            </a-form-item>
          </a-spin>
        </div>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="相关文件"
        width="900px"
        :visible="visiblewenjian"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visiblewenjian = false
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-table ref="table" :columns="filecolumns" :data-source="list">
            <span slot="slide_name" slot-scope="text">
              <a type="link" :href="text"> {{ text }} </a></span
            >
          </a-table>
        </p>
      </a-modal>
    </div>

    <a-modal
      title="选择销售"
      style="top: 20px"
      :maskClosable="false"
      :destroyOnClose="true"
      v-model="visiblexiaoshou"
      :confirmLoading="false"
      @ok="handleOkxiaoshou"
      @cancel="
        () => {
          this.visiblexiaoshou = false
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
  </a-card>
</template>

<script>
const filecolumns = [
  {
    dataIndex: 'slide_name',
    title: '文件名',
    scopedSlots: { customRender: 'slide_name' },
  },
]
const columns = [
  {
    title: '用户编号',
    width: 120,
    sorter: true,
    dataIndex: 'user_id',
  },
  {
    title: '用户名',
    sorter: true,
    dataIndex: 'user_name',
  },
  {
    title: '真实姓名',
    sorter: true,
    dataIndex: 'user_realname',
  },
  {
    title: '用户地址',
    sorter: true,
    dataIndex: 'user_address',
  },
  {
    title: '用户身份证',
    dataIndex: 'user_identity',
  },
  {
    title: '用户微信号',
    dataIndex: 'user_wechat_id',
  },
  {
    title: '用户微信名称',
    dataIndex: 'user_wechat_name',
  },
  {
    title: '实名认证',
    dataIndex: 'user_authentication',
  },
  {
    title: '用户状态',
    dataIndex: 'user_status',
    scopedSlots: { customRender: 'user_status' },
  },
  {
    title: '创建时间',
    dataIndex: 'user_creatime',
    scopedSlots: { customRender: 'user_creatime' },
  },
  {
    title: '操作',
    width: 130,
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
import XLSX from 'xlsx'
export default {
  name: 'CommonUser',
  props: {
    text: String,
  },
  data() {
    return {
      visiblexiaoshou: false,
      allnewzhuguan: [],
      newsellid: '',
      oldsellid: '',
      data: [],
      list: [],
      filecolumns,
      columns,
      historyColumns,
      historydata: [],
      ifshowhistory: false,
      visiblefenxiao: false,
      spinning: false,
      ifdaorugoods: false,
      file: undefined,
      visiblewenjian: false,
      fileExcleList: [],
      visible: false,
      baseURL: 'http://8.136.103.102:8088/api',
      // baseURL:"http://47.103.34.184:8085/api",
      // baseURL: 'http://localhost:8085/api',
      confirmLoading: false,
      keywords: '',
      ifchangepassword: false,
      ifaddcommomuserdata: false,
      devicepassword: '',
      password: '',
      password1: '',
      fenxiaomoney: 0,
      olddata: 0,
      onecommonuserdata: {},
      allDevice: [],
      oldbianjidata: {},
      fileListlunbo: [],
    }
  },
  created() {
    var rights = JSON.parse(window.localStorage.getItem('yonghurights'))
    var newcolumns = []
    this.columns.forEach((item) => {
      rights.forEach((element) => {
        if (item.dataIndex == element.name && element.show == 1) {
          newcolumns.push(item)
        }
      })
    })
    if (newcolumns.length > 0) {
      newcolumns.push({
        title: '操作',
        width: 130,
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' },
      })
    }
    this.columns = newcolumns
  },
  mounted() {
    const that = this
    that.getAllCommonUsersDataListpage()
  },
  methods: {
    handleOkxiaoshou() {
      const that = this
      if (that.newsellid == '' || that.newsellid == null) {
        that.$message.warning('抱歉,请选择绑定销售人员!')
        return
      }

      var formdate = {}
      if (that.oldsellid != that.newsellid) {
        var oldname = ''
        var newname = ''
        that.allnewzhuguan.forEach((item) => {
          if (that.oldsellid == item.id) {
            oldname = item.name
          }
          if (that.newsellid == item.id) {
            newname = item.name
          }
        })
        formdate.user_operation_record_detail = '绑定销售从：' + oldname + '，修改为：' + newname
        formdate.bills_type = 'CommonUser'
        formdate.myid = that.$store.state.admin.user_id
        formdate.user_id = that.onecommonuserdata.user_id
        formdate.sell_id = that.newsellid
        that.spinning = true
        this.$request({
          url: '/user/updatesellidbyuserid',
          method: 'get',
          params: formdate,
        })
          .then((res) => {
            if (res.code == 200) {
              that.spinning = false
              that.visiblexiaoshou = false
              that.newsellid = ''
              that.oldsellid = ''
              that.onecommonuserdata = {}
              that.getAllCommonUsersDataListpage()
              that.$message.success('修改成功!')
            } else if (res.code == 201) {
              that.spinning = false
              that.$message.error('抱歉,未知错误,请联系管理员!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.visiblexiaoshou = false
        that.newsellid = ''
        that.oldsellid = ''
        that.onecommonuserdata = {}
        that.$message.success('修改成功!')
      }
    },
    bangdingxiaoshou(e) {
      console.log(e)
      const that = this
      var formdate = {}
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
            that.allnewzhuguan = res.data
            that.visiblexiaoshou = true
            that.spinning = false
            that.onecommonuserdata = e
            if (e.sell_id) {
              that.newsellid = e.sell_id
              that.oldsellid = e.sell_id
            }
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
          return
        })
    },
    showhistory(e) {
      console.log(e)
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'CommonUser'
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
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllCommonUsersDataListpage()
    },
    lookwenjian(e) {
      const that = this
      that.list = []
      that.visiblewenjian = true
      if (e.user_files) {
        var data = []
        data = e.user_files.split(',')
        data.forEach((item) => {
          that.list.push({
            slide_name: item,
            url: item,
          })
        })
      }
    },
    handleOkfenxiao() {
      const that = this
      this.$request({
        url: '/user/changeSlideShow',
        method: 'get',
        params: {
          table_name: 'shop_freight',
          column: 'shop_freight_menoy',
          columnvalue: this.fenxiaomoney,
          shop_freight_id: 5,
        },
      })
        .then((res) => {
          if (res.status == 200) {
            that.spinning = false
            that.visiblefenxiao = false
            that.fenxiaomoney = 0
            that.$message.success('设置分销金额成功!')
          }
        })
        .catch((res) => {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    setfenxiao() {
      const that = this
      that.spinning = true
      that.visiblefenxiao = true
      this.$request({
        url: '/user/selectAll',
        method: 'get',
        params: {
          table: 'shop_freight',
        },
      })
        .then((res) => {
          if (res.status == 200) {
            that.spinning = false
            that.fenxiaomoney = res.data[4]['shop_freight_menoy']
            that.olddata = res.data[4]['shop_freight_menoy']
          }
        })
        .catch((res) => {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    importFile: function () {
      const that = this
      if (that.fileExcleList.length > 1 || that.fileExcleList.length == 0) {
        that.$message.error('请上传单个Excel表格!')
        return
      }
      if (
        that.fileExcleList[0].type != 'application/vnd.ms-excel' &&
        that.fileExcleList[0].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        that.$message.error('只接受xls,xlsx格式的Excel格式文件')
        that.fileExcleList.splice(0, that.fileExcleList.length)
        that.file = undefined
        return
      } else {
        that.file = that.fileExcleList[0]
        that.fileExcleList.splice(that.fileExcleList.length - 2, that.fileExcleList.length - 1)
      }
      this.spinning = true
      var f = this.file
      var reader = new FileReader()
      let $t = this
      reader.onload = function (e) {
        var data = e.target.result
        if ($t.rABS) {
          $t.wb = XLSX.read(btoa(this.fixdata(data)), {
            // 手动转化
            type: 'base64',
          })
        } else {
          $t.wb = XLSX.read(data, {
            type: 'binary',
          })
        }
        let json = XLSX.utils.sheet_to_json($t.wb.Sheets[$t.wb.SheetNames[0]])
        if (json.length == 0) {
          setTimeout(() => {
            this.ifdaorugoods = false
            this.file = undefined
            this.fileExcleList = []
          }, 500)
        } else {
          $t.dealFile($t.analyzeData(json)) // analyzeData: 解析导入数据
        }
      }
      if (this.rABS) {
        reader.readAsArrayBuffer(f)
      } else {
        reader.readAsBinaryString(f)
      }
    },
    analyzeData: function (data) {
      // 此处可以解析导入数据
      return data
    },
    dealFile: function (data) {
      const that = this
      var list = []
      var flag = true
      data.forEach((element) => {
        if (!element.close) {
          var st = true
          var str = {}
          if (element['用户名']) {
            for (var i in element) {
              str[that.Englishname(i)] = (element[i] + '').trim()
              console.log(str)
            }
            list.push(str)
          } else {
            flag = false
          }
        }
      })
      if (data.length <= 0) {
        that.$message.error('请导入正确数据!')
      } else {
        if (!flag) {
          that.spinning = false
          that.$message.error('用户名不能为空,请重新填写excel')
          return
        }
        adds()
        function adds() {
          var newlist = []
          list.forEach((element) => {
            var goods = {}
            goods.myid = that.$store.state.admin.user_id
            goods.user_name = element.user_name
            goods.user_realname = element.user_realname
            goods.user_address = element.user_address
            goods.user_identity = element.user_identity
            goods.user_wechat_id = element.user_wechat_id
            goods.user_status = element.user_status == '一般' ? '3' : '重点' ? '2' : '禁用' ? '0' : '1'
            goods.user_wechat_name = element.user_wechat_name
            newlist.push(goods)
          })
          var end = false
          newlist.forEach((element) => {
            that
              .$request({
                url: '/user/addCommonuserdata',
                method: 'get',
                params: element,
              })
              .then((res) => {
                if (res.status == 200) {
                  end = true
                } else if (res.status == 407) {
                  that.spinning = false
                  end = false
                  that.$message.error('抱歉,表格中有用户名已经被注册!')
                  return
                } else if (res.status == 406) {
                  that.spinning = false
                  end = false
                  that.$message.error('抱歉，导入失败!')
                  return
                } else if (res.status == 200) {
                  that.spinning = false
                  end = false
                  that.$message.error('抱歉,导入失败!')
                  return
                }
              })
              .catch(function () {
                that.spinning = false
                end = false
                that.$message.error('抱歉,导入用户信息失败!')
                return
              })
          })
          setTimeout(() => {
            if (end) {
              that.fileExcleList = []
              that.ifdaorugoods = false
              that.spinning = false
              that.getAllCommonUsersDataListpage()
              that.$message.success('导入用户信息成功!')
            }
          }, 4000)
        }
      }
    },
    Englishname(name) {
      var title = ''
      switch (name) {
        case '用户名':
          title = 'user_name'
          break
        case '真实姓名':
          title = 'user_realname'
          break
        case '用户地址':
          title = 'user_address'
          break
        case '用户身份证':
          title = 'user_identity'
          break
        case '用户状态':
          title = 'user_status'
          break
        case '用户微信号':
          title = 'user_wechat_id'
          break
        case '用户微信名称':
          title = 'user_wechat_name'
          break
      }
      return title
    },
    downmuban() {
      var alldata = [
        ['用户名', '真实姓名', '用户地址', '用户身份证', '用户微信号', '用户微信名称', '用户状态'],
        ['xiaoming123', '小明', '江苏省南通市', '3206831990XXXXXXXX', 'XIAOMING123', '你好', '启用'],
      ]
      this.outputXlsxFile(alldata, '普通用户列表')
    },
    handleRemove(file) {
      const index = this.fileExcleList.indexOf(file)
      const newFileList = this.fileExcleList.slice()
      newFileList.splice(index, 1)
      this.fileExcleList = newFileList
    },
    beforeUploadexcel(file) {
      const that = this
      this.fileExcleList = [...this.fileExcleList, file]
    },
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出普通用户列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllCommonUsersDataListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '用户编号',
                    '用户名',
                    '真实姓名',
                    '用户地址',
                    '用户身份证',
                    '用户微信号',
                    '用户微信名称',
                    '是否实名认证',
                    '用户状态',
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.user_id == null ? '' : element.user_id,
                    element.user_name == null ? '' : element.user_name,
                    element.user_realname == null ? '' : element.user_realname,
                    element.user_address == null ? '' : element.user_address,
                    element.user_identity == null ? '' : element.user_identity,
                    element.user_wechat_id == null ? '' : element.user_wechat_id,
                    element.user_wechat_name == null ? '' : element.user_wechat_name,
                    element.user_authentication == null ? '' : element.user_authentication,
                    element.user_creatime == null
                      ? ''
                      : that.dateFtt('YYYY-MM-DD HH:mm:ss', new Date(element.user_creatime)),
                    element.user_status == null
                      ? ''
                      : element.user_status == '0'
                      ? '启用'
                      : '1'
                      ? '禁用'
                      : '2'
                      ? '重点'
                      : '一般',
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '普通用户列表')
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
    beforeUploadlunbo(file) {
      this.fileListlunbo = [...this.fileListlunbo, file]
      return false
    },
    handleRemovelunbo(file) {
      const index = this.fileListlunbo.indexOf(file)
      const newFileList = this.fileListlunbo.slice()
      newFileList.splice(index, 1)
      this.fileListlunbo = newFileList
    },
    handlechangeOk() {
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
      formdate.password = that.password1
      formdate.user_id = that.onecommonuserdata.user_id
      formdate.bills_type = 'CommonUser'
      formdate.username = that.onecommonuserdata.user_name
      formdate.updatepassword = 'yes'
      this.$request({
        url: '/user/updataCommonuserdataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.status == 200) {
            that.spinning = false
            that.ifchangepassword = false
            that.password = ''
            that.password1 = ''
            that.onecommonuserdata = {}
            that.$message.success('重置密码成功!')
          } else if (res.status == 406) {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.onecommonuserdata = {}
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    changepassword(e) {
      const that = this
      that.ifchangepassword = true
      that.onecommonuserdata = e
    },
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      that.ifaddcommomuserdata = false
      var formdate = {}
      that.fileListlunbo = []
      that.oldbianjidata = e
      formdate.user_id = e.user_id
      this.$request({
        url: '/user/getOneCommonUserDataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.onecommonuserdata = res.data
            var data = []
            if (res.data.user_files != null) {
              data = res.data.user_files.split(',')
              var a = 1
              data.forEach((item) => {
                a++
                that.fileListlunbo.push({
                  uid: a,
                  name: item,
                  url: item,
                })
              })
            }
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    deletecommonuser(e) {
      this.$confirm({
        title: '是否确定删除该用户的全部信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          this.deleteByid(e)
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
      formdate.user_id = e.user_id
      formdate.username = e.user_name
      formdate.bills_type = 'CommonUser'
      formdate.myid = that.$store.state.admin.user_id
      this.$request({
        url: '/user/deleteOneCommonuserdataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.getAllCommonUsersDataListpage()
            that.$message.success('删除成功!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    addCommonuserdata() {
      const that = this
      that.visible = true
      that.ifaddcommomuserdata = true
    },
    handleOk() {
      const that = this
      if (that.onecommonuserdata.user_name == null || that.onecommonuserdata.user_name == '') {
        that.$message.warning('请输入用户名!')
        return
      }
      if (that.onecommonuserdata.user_address == null || that.onecommonuserdata.user_address == '') {
        that.$message.warning('请输入用户地址!')
        return
      }
      if (that.onecommonuserdata.user_status == null || that.onecommonuserdata.user_status == '') {
        that.$message.warning('请选择用户状态!')
        return
      }
      if (this.fileListlunbo.length > 6) {
        that.$message.error('抱歉,相关联文件只能上传5个!')
        return
      }
      if (that.onecommonuserdata.user_remark == null) {
        that.onecommonuserdata.user_remark = ''
      }
      that.spinning = true
      var goodspricturelunbo = []
      var nogoodspricturelunbo = []
      if (this.fileListlunbo.length > 0) {
        this.fileListlunbo.forEach((item) => {
          if (item instanceof File) {
            goodspricturelunbo.push(item)
          } else {
            nogoodspricturelunbo.push(item.url)
          }
        })
      }
      if (goodspricturelunbo.length > 0) {
        var allpicture = []
        goodspricturelunbo.forEach((file) => {
          const formData = new FormData()
          formData.append('picture', file)
          this.$request({
            url: this.baseURL + '/pub/aliuploadImg3',
            method: 'post',
            data: formData,
          })
            .then((res) => {
              if (res.code == 0) {
                allpicture.push(res.data.objectKey)
                if (nogoodspricturelunbo.length > 0) {
                  nogoodspricturelunbo.forEach((item) => {
                    allpicture.push(item)
                  })
                }
                that.onecommonuserdata.user_files = allpicture.join(',')
              }
            })
            .catch(function () {
              that.spinning = false
              that.$message.warning('相关文件上传失败，请重新尝试上传!')
              return
            })
        })
        setTimeout(() => {
          this.asss()
        }, 2000)
      } else {
        if (nogoodspricturelunbo.length > 0) {
          that.onecommonuserdata.user_files = nogoodspricturelunbo.join(',')
        } else {
          that.onecommonuserdata.user_files = null
        }
        this.asss()
      }
    },
    asss() {
      const that = this
      that.onecommonuserdata.bills_type = 'CommonUser'
      that.onecommonuserdata.myid = that.$store.state.admin.user_id
      var data = ''
      if (that.ifaddcommomuserdata) {
        data = '新增'
      } else {
        data = '修改后'
      }
      var status = ''
      if (that.onecommonuserdata.user_status == '0') {
        status = '启用'
      } else if (that.onecommonuserdata.user_status == '1') {
        status = '禁用'
      } else if (that.onecommonuserdata.user_status == '2') {
        status = '重点'
      } else if (that.onecommonuserdata.user_status == '3') {
        status = '一般'
      }
      var shenfz = ''
      if (that.onecommonuserdata.user_identity == '' || that.oldbianjidata.user_identity == null) {
        shenfz = '暂无'
      } else {
        shenfz = that.onecommonuserdata.user_identity
      }

      var wxhao = ''
      if (that.onecommonuserdata.user_wechat_id == '' || that.oldbianjidata.user_wechat_id == null) {
        wxhao = '暂无'
      } else {
        wxhao = that.onecommonuserdata.user_wechat_id
      }
      var wxming = ''
      if (that.onecommonuserdata.user_wechat_name == '' || that.oldbianjidata.user_wechat_name == null) {
        wxming = '暂无'
      } else {
        wxming = that.onecommonuserdata.user_wechat_name
      }

      if (that.ifaddcommomuserdata) {
        //新增信息
        that.onecommonuserdata.user_operation_record_detail = data + '用户：' + that.onecommonuserdata.user_name
        this.$request({
          url: '/user/addCommonuserdata',
          method: 'get',
          params: that.onecommonuserdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.onecommonuserdata = {}
              that.fileListlunbo = []
              that.getAllCommonUsersDataListpage()
              that.$message.success('新增成功！默认密码:111111')
            } else if (res.status == 406) {
              that.spinning = false
              that.$message.error('抱歉,新增失败,请联系管理员!')
            } else if (res.status == 407) {
              that.spinning = false
              that.$message.error('抱歉,该用户名已经被注册!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        //修改信息
        var status1 = ''
        if (that.oldbianjidata.user_status == '0') {
          status1 = '启用'
        } else if (that.oldbianjidata.user_status == '1') {
          status1 = '禁用'
        } else if (that.oldbianjidata.user_status == '2') {
          status1 = '重点'
        } else if (that.oldbianjidata.user_status == '3') {
          status1 = '一般'
        }
        var shenfz1 = ''
        if (that.oldbianjidata.user_identity == '' || that.oldbianjidata.user_identity == null) {
          shenfz1 = '暂无'
        } else {
          shenfz1 = that.oldbianjidata.user_identity
        }

        var wxhao1 = ''
        if (that.oldbianjidata.user_wechat_id == '' || that.oldbianjidata.user_wechat_id == null) {
          wxhao1 = '暂无'
        } else {
          wxhao1 = that.oldbianjidata.user_wechat_id
        }
        var wxming1 = ''
        if (that.oldbianjidata.user_wechat_name == '' || that.oldbianjidata.user_wechat_name == null) {
          wxming1 = '暂无'
        } else {
          wxming1 = that.oldbianjidata.user_wechat_name
        }

        var user_name = ''
        if (that.oldbianjidata.user_name != that.onecommonuserdata.user_name) {
          user_name = '用户名：' + that.oldbianjidata.user_name + ',修改为：' + that.onecommonuserdata.user_name + ','
        }

        var user_realname = ''
        if (that.oldbianjidata.user_realname != that.onecommonuserdata.user_realname) {
          user_realname =
            '真实姓名：' + that.oldbianjidata.user_realname + ',修改为：' + that.onecommonuserdata.user_realname + ','
        }

        var dizhi = ''
        if (that.oldbianjidata.user_address != that.onecommonuserdata.user_address) {
          dizhi =
            '用户地址：' + that.oldbianjidata.user_address + ',修改为：' + that.onecommonuserdata.user_address + ','
        }
        var xiugaistatus = ''
        if (that.oldbianjidata.user_status != that.onecommonuserdata.user_status) {
          xiugaistatus = '状态：' + status1 + ',修改为：' + status + ','
        }

        var user_remark = ''
        if (
          that.oldbianjidata.user_remark != null &&
          that.oldbianjidata.user_remark != that.onecommonuserdata.user_remark
        ) {
          user_remark =
            '备注：' + that.oldbianjidata.user_remark + ',修改为：' + that.onecommonuserdata.user_remark + ','
        }

        var xiugaishenfz = ''
        if (that.oldbianjidata.user_identity != that.onecommonuserdata.user_identity) {
          xiugaishenfz = '身份证：' + shenfz1 + ',修改为：' + shenfz + ','
        }

        var xiugaiwxhao = ''
        if (that.oldbianjidata.user_wechat_id != that.onecommonuserdata.user_wechat_id) {
          xiugaiwxhao = '微信号：' + wxhao1 + ',修改为：' + wxhao + ','
        }

        var xiugaiwxming = ''
        if (that.oldbianjidata.user_wechat_name != that.onecommonuserdata.user_wechat_name) {
          xiugaiwxming = '微信名：' + wxming1 + ',修改为：' + wxming + ','
        }
        that.onecommonuserdata.user_operation_record_detail =
          user_name + user_realname + xiugaistatus + user_remark + xiugaishenfz + xiugaiwxhao + xiugaiwxming + dizhi
        that.spinning = true
        this.$request({
          url: '/user/updataCommonuserdataByid',
          method: 'get',
          params: that.onecommonuserdata,
        })
          .then((res) => {
            if (res.code == 200) {
              that.spinning = false
              that.visible = false
              that.onecommonuserdata = {}
              that.fileListlunbo = []
              that.oldbianjidata = {}
              that.getAllCommonUsersDataListpage()
              that.$message.success('修改成功!')
            } else if (res.code == 201) {
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
    handleCancel() {
      const that = this
      that.visible = false
      that.onecommonuserdata = {}
    },
    onSearch() {
      const that = this
      that.getAllCommonUsersDataListpage()
    },
    getAllCommonUsersDataListpage() {
      const that = this
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      formdate.novip = 'yes'
      formdate.number = 30
      that.spinning = true
      that
        .$request({
          url: '/user/getAllCommonUsersDataListpage',
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
