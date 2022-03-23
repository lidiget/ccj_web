<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search style="margin-left: 16px; width: 272px; margin-bottom: 16px" v-model="keywords" />
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
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
    <!-- <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      type="primary"
      @click="addCommonuserdata"
      :loading="spinning"
      v-if="$store.state.rights[1].children[2].children[0].add == 1"
    >
      +新增会员
    </a-button> -->
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
        <span slot="user_identity" slot-scope="text">
          {{ text == '' || text == null ? '未实名' : '已实名' }}
        </span>
        <span slot="user_status" slot-scope="text">
          {{ text | status }}
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)" v-if="$store.state.rights[1].children[2].children[0].edit == 1">修改</a>
            <a-divider type="vertical" v-if="$store.state.rights[1].children[2].children[0].edit == 1" />
          </template>
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a
                  href="javascript:;"
                  @click="changepassword(record)"
                  v-if="$store.state.rights[1].children[2].children[0].edit == 1"
                  >重置密码</a
                >
              </a-menu-item>
              <a-menu-item>
                <a
                  href="javascript:;"
                  @click="deletecommonuser(record)"
                  v-if="$store.state.rights[1].children[2].children[0].delete == 1"
                  >删除</a
                >
              </a-menu-item>
              <a-menu-item v-if="$store.state.rights[1].children[2].children[0].bangding == 1">
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
        <template slot="title"> 会员用户信息列表 </template>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        title="设置成为会员积分大小"
        :visible="ifsettingnumber"
        :confirm-loading="confirmLoading"
        okText="保存"
        cancelText="取消"
        @ok="handlechangeOksettting"
        :centered="true"
        @cancel="handleCancelsettting"
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="password">
              <a-form-item>
                <a-input size="large" placeholder="请输入积分" v-model="membernumber"></a-input>
              </a-form-item>
            </p>
          </a-spin>
        </div>
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
        :title="ifaddcommomuserdata ? '新增会员角色信息' : '编辑会员角色信息'"
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
                  :maxLength="50"
                  type="text"
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
                  placeholder="用户状态"
                  option-filter-prop="children"
                  v-model="onecommonuserdata.user_status"
                >
                  <a-select-option :value="'0'"> 启用 </a-select-option>
                  <a-select-option :value="'1'"> 禁用 </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="备注:">
                <a-input
                  size="large"
                  placeholder="备注"
                  :maxLength="200"
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
  {
    title: '修改数据记录',
    dataIndex: 'user_operation_record_olddetail',
  },
  {
    title: '用户操作时间',
    width: 150,
    dataIndex: 'user_operation_record_createtime',
    scopedSlots: { customRender: 'user_operation_record_createtime' },
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
    width: 120,
    sorter: true,
    dataIndex: 'user_name',
  },
  {
    title: '真实姓名',
    width: 120,
    sorter: true,
    dataIndex: 'user_realname',
  },
  {
    title: '用户地址',
    width: 120,
    sorter: true,
    dataIndex: 'user_address',
  },
  {
    title: '用户身份证',
    dataIndex: 'user_identity',
    scopedSlots: { customRender: 'user_identity' },
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
    title: '是否实名认证',
    dataIndex: 'user_authentication',
  },
  {
    title: 'VIP等级',
    dataIndex: 'vipdata',
  },
  {
    title: '创建时间',
    dataIndex: 'user_creatime',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'VipUser',
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
      filecolumns,
      columns,
      spinning: false,
      visible: false,
      ifsettingnumber: false,
      membernumber: '',
      confirmLoading: false,
      keywords: '',
      ifchangepassword: false,
      ifaddcommomuserdata: false,
      devicepassword: '',
      password: '',
      password1: '',
      historyColumns,
      visiblewenjian: false,
      list: [],
      historydata: [],
      ifshowhistory: false,
      oldbianjidata: {},
      onecommonuserdata: {},
      membernumber: '',
      allDevice: [],
      form: {
        v1v2: '',
        v2v3: '',
        v3v4: '',
        v4v5: '',
        v5v6: '',
      },
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

    that.getalldata()
  },
  methods: {
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
          formdate.vip = 'yes'
          formdate.number = 30
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
                    'VIP等级',
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
                    // element.user_creatime == null
                    //   ? ''
                    //   : that.dateFtt('YYYY-MM-DD HH:mm:ss', new Date(element.user_creatime)),
                    element.user_status == null
                      ? ''
                      : element.user_status == '0'
                      ? '启用'
                      : '1'
                      ? '禁用'
                      : '2'
                      ? '重点'
                      : '一般',
                    element.vipdata == null ? '' : element.vipdata,
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
            that.onecommonuserdata = e
            that.visiblexiaoshou = true
            that.spinning = false
            if (e.sell_id) {
              that.newsellid = e.sell_id
              that.oldsellid = e.sell_id
            }
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
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
    showhistory(e) {
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
    getalldata() {
      const that = this
      this.$request({
        url: '/user/selectAll',
        method: 'get',
        params: {
          table: 'shop_freight',
        },
      })
        .then((res) => {
          if (res.status == 200) {
            this.spinning = false
            this.form = {
              v1v2: res.data[7]['shop_freight_menoy'],
              v2v3: res.data[8]['shop_freight_menoy'],
              v3v4: res.data[9]['shop_freight_menoy'],
              v4v5: res.data[10]['shop_freight_menoy'],
              v5v6: res.data[11]['shop_freight_menoy'],
            }
            that.getAllCommonUsersDataListpage()
          }
        })
        .catch((res) => {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handlechangeOksettting() {
      const that = this
      if (that.membernumber == '') {
        this.$message.warning('请输入设置积分!')
        return
      }
      var formdata = {}
      formdata.membernumber = that.membernumber
      that
        .$request({
          url: '/user/updateMemberSettingByid',
          method: 'get',
          params: formdata,
        })
        .then((res) => {
          if (res.status == 200) {
            that.spinning = false
            that.ifsettingnumber = false
            that.getAllCommonUsersDataListpage()
            that.$message.success('设置积分门槛成功!')
          } else {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleCancelsettting() {
      const that = this
      that.ifsettingnumber = false
      that.membernumber = ''
    },
    setmembersettings() {
      const that = this
      that.ifsettingnumber = true
      that.spinning = true
      that
        .$request({
          url: '/user/getMemberSettingByid',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.membernumber = res.data.settingnumber
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
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
      console.log(e, 'ssssssssssssss')
      that.ifchangepassword = true
      that.onecommonuserdata = e
    },
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      that.oldbianjidata = e
      that.ifaddcommomuserdata = false
      var formdate = {}
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
      formdate.myid = that.$store.state.admin.user_id
      formdate.username = e.user_name
      formdate.user_id = e.user_id
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
      that.onecommonuserdata.vip = 'yes'
      that.onecommonuserdata.number = 30
      that.onecommonuserdata.user_status = '0'
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
      if (that.onecommonuserdata.user_remark == null) {
        that.onecommonuserdata.user_remark = ''
      }
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
      formdate.vip = 'yes'
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
              if (element.user_integral < this.form.v1v2) {
                element.vipdata = 'V1'
              }
              if (element.user_integral >= this.form.v1v2 && element.user_integral < this.form.v2v3) {
                element.vipdata = 'V1'
              }
              if (element.user_integral >= this.form.v2v3 && element.user_integral < this.form.v3v4) {
                element.vipdata = 'V2'
              }
              if (element.user_integral >= this.form.v3v4 && element.user_integral < this.form.v4v5) {
                element.vipdata = 'V3'
              }
              if (element.user_integral >= this.form.v4v5 && element.user_integral < this.form.v5v6) {
                element.vipdata = 'V4'
              }
              if (element.user_integral >= this.form.v5v6) {
                element.vipdata = 'V5'
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
