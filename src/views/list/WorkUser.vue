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
      v-if="$store.state.rights[1].children[1].children[0].add == 1"
    >
      +新增工人
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
        <a-table
          :pagination="{ defaultPageSize: 999, hideOnSinglePage: true }"
          :columns="innerColumns"
          slot="expandedRowRender"
          slot-scope="data"
          :dataSource="data.groupItem"
          :rowKey="(item) => item.worker_id"
          :locale="{ emptyText: '暂无数据' }"
        >
          <span slot="worker_starttime" slot-scope="text">
            {{ text | dayjs }}
          </span>
          <span slot="worker_endtime" slot-scope="text">
            {{ text | dayjs }}
          </span>
          <span slot="user_ifhave" slot-scope="text">{{ text == 1 ? '是' : '否' }}</span>
        </a-table>
        <span slot="worker_cretime" slot-scope="text">
          {{ text | dayjs }}
        </span>
        <!-- <span slot="worker_status" slot-scope="text">
          {{ text | status }}
        </span> -->
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)" v-if="$store.state.rights[1].children[1].children[0].edit == 1">修改</a>
            <a-divider type="vertical" v-if="$store.state.rights[1].children[1].children[0].edit == 1" />
          </template>
          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a
                  href="javascript:;"
                  @click="changepassword(record)"
                  v-if="$store.state.rights[1].children[1].children[0].edit == 1"
                  >重置密码</a
                >
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="bianjigongzhong(record)">编辑工种信息</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="lookwenjian(record)">驾照信息</a>
              </a-menu-item>
              <a-menu-item>
                <a href="javascript:;" @click="showhistory(record)">历史记录</a>
              </a-menu-item>

              <a-menu-item>
                <a
                  href="javascript:;"
                  @click="deletecommonuser(record)"
                  v-if="$store.state.rights[1].children[1].children[0].delete == 1"
                  >删除</a
                >
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
        <template slot="title"> 工人用户信息列表 </template>
      </a-table>
    </a-spin>
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
        @cancel="handleCancelpassword"
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
    </div>
    <div>
      <a-modal
        :title="ifaddworkuserdata ? '新增工人信息' : '编辑工人信息'"
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
              <a-form-item label="工人名字:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="工人名字"
                  v-model="oneworkuserdata.worker_name"
                ></a-input>
              </a-form-item>
              <a-form-item label="工种:" v-if="!ifaddworkuserdata && !ifnogongzhongname">
                <a-input
                  size="large"
                  type="text"
                  style="width: 370px"
                  placeholder="工种"
                  allowClear
                  readonly="true"
                  @change="change123()"
                  v-model="oneworkuserdata.gongzhongname"
                ></a-input>
              </a-form-item>
              <a-form-item label="工种:" v-if="ifaddworkuserdata || ifnogongzhongname">
                <a-select
                  size="large"
                  mode="multiple"
                  placeholder="工种"
                  style="width: 370px"
                  v-model="oneworkuserdata.worker_two_name"
                  :allowClear="true"
                  show-search
                  option-filter-prop="children"
                >
                  <a-select-option v-for="(action, index) in gongzhong" :key="index" :value="action.id">{{
                    action.name
                  }}</a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="手机号码:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="手机号码"
                  v-model="oneworkuserdata.user_phone"
                ></a-input>
              </a-form-item>
              <a-form-item label="工人标题:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="100"
                  placeholder="工人标题"
                  v-model="oneworkuserdata.worker_headline"
                ></a-input>
              </a-form-item>
              <a-form-item label="工人身份证:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="工人身份证"
                  v-model="oneworkuserdata.worker_number"
                ></a-input>
              </a-form-item>
              <a-form-item label="工人地址:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="100"
                  placeholder="工人地址"
                  v-model="oneworkuserdata.worker_address"
                ></a-input>
              </a-form-item>
              <!-- <a-form-item label="工人价格:">
                <a-input
                  size="large"
                  :maxLength="50"
                  type="text"
                  placeholder="工人价格"
                  v-model="oneworkuserdata.worker_price"
                ></a-input>
              </a-form-item> -->
              <a-form-item label="工人状态:">
                <a-select
                  size="large"
                  style="width: 365px"
                  show-search
                  placeholder="工人状态"
                  option-filter-prop="children"
                  v-model="oneworkuserdata.worker_status"
                >
                  <a-select-option :value="'0'"> 启用 </a-select-option>
                  <a-select-option :value="'1'"> 禁用 </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item label="是否为自有工人:">
                <a-select
                  size="large"
                  style="width: 365px"
                  show-search
                  allowClear
                  placeholder="工人状态"
                  option-filter-prop="children"
                  v-model="oneworkuserdata.user_ifhave"
                >
                  <a-select-option :value="0"> 否 </a-select-option>
                  <a-select-option :value="1"> 是 </a-select-option>
                </a-select>
              </a-form-item>
              <!-- <a-form-item label="工作时间:"> 
                <div>
              <a-date-picker
                size="large"
                style="margin-bottom: 16px"
                v-model="time"
                :disabled-date="disabledStartDate"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="开始"
                @openChange="handleStartOpenChange"
              />
              <a-date-picker
                v-model="time"
                :disabled-date="disabledEndDate"
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="结束"
                :open="endOpen"
                @openChange="handleEndOpenChange"
              />
                </div>
              </a-form-item> -->
              <a-form-item label="相关联文件(文件大小小于4M):">
                <a-upload :file-list="fileListlunbo" :remove="handleRemovelunbo" :before-upload="beforeUploadlunbo">
                  <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
              <a-form-item label="工人说明:">
                <a-input
                  size="large"
                  placeholder="备注"
                  :maxLength="200"
                  v-model="oneworkuserdata.worker_explain"
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
        title="驾照信息"
        width="900px"
        :visible="visiblejiazjao"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visiblejiazjao = false
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-table ref="table" :columns="jiazhaocolumns" :data-source="jiazhaolist">
            <template slot="vehicle_classify_status" slot-scope="text">
              <a-badge :status="text == '1' ? 'success' : 'error'" />
              {{ text == '1' ? '启用' : '禁用' }}
            </template>
            <template slot="vehicle_classify_creatime" slot-scope="text">
              {{ text | dayjs }}
            </template>
            <span slot="action" slot-scope="text, record">
              <template>
                <a @click="jiazhaotupian(record)">驾照图片</a>
              </template>
            </span>
          </a-table>
        </p>
      </a-modal>
    </div>
    <div>
      <a-modal
        title="驾照图片"
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

    <div>
      <a-modal
        title="工种信息"
        width="900px"
        :visible="visiblegongzhong"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visiblegongzhong = false
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-table ref="table" :columns="gongzhongcolumns" :data-source="gongzhonglist">
            <span slot="action" slot-scope="text, record">
              <template>
                <a @click="zhongxinxi(record)">编辑</a>
              </template>
            </span>
          </a-table>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="编辑工种信息"
        :visible="ifbianjigongzhong"
        :confirm-loading="false"
        okText="提交"
        @ok="baocungongzhong"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.ifbianjigongzhong = false
            this.onegongzhong = {}
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <p>
          <a-spin :spinning="spinning" size="large">
            <row>
              <a-col :span="12">
                <a-form-item label="工种单位:" v-if="xianshidanweixin">
                  <a-input
                    size="large"
                    type="text"
                    style="width: 230px; margin-right: 8px"
                    placeholder="工种单位"
                    allowClear
                    readonly="true"
                    @change="change124()"
                    v-model="oneunit"
                  ></a-input>
                </a-form-item>
                <a-form-item label="工种单位:" v-if="!xianshidanweixin">
                  <a-select
                    size="large"
                    placeholder="工种单位"
                    style="width: 230px; margin-right: 8px"
                    v-model="onegongzhong.danwei"
                    allowClear
                  >
                    <a-select-option
                      v-for="(items, index) in allunit"
                      :key="index"
                      :label="items.name"
                      :value="items.name"
                      >{{ items.name }}</a-select-option
                    >
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="单位价格(元):">
                  <a-input-number
                    id="1"
                    size="large"
                    :maxLength="20"
                    style="width: 230px"
                    placeholder="单位价格(元)"
                    v-model="onegongzhong.jiage"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
            </row>
          </a-spin>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const gongzhongcolumns = [
  {
    title: '工种名册',
    dataIndex: 'worker_two_name',
  },
  {
    title: '单位价格(元)',
    dataIndex: 'worker_price',
  },
  {
    title: '所选单位',
    dataIndex: 'choosedunit',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]

const jiazhaocolumns = [
  {
    title: '车辆名称',
    dataIndex: 'vehicle_classify_name',
  },
  {
    title: '车辆规格',
    dataIndex: 'vehicle_classify_specification',
  },
  {
    title: '车辆载重',
    dataIndex: 'vehicle_classify_load',
  },
  {
    title: '车辆起步价',
    dataIndex: 'vehicle_classify_starting',
  },
  {
    title: '车辆状态',
    dataIndex: 'vehicle_classify_status',
    scopedSlots: { customRender: 'vehicle_classify_status' },
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
const innerColumns = [
  {
    title: '工人地址',
    dataIndex: 'worker_address',
  },
  {
    title: '工人标题',
    dataIndex: 'worker_headline',
  },
  {
    title: '是否为自有工人',
    scopedSlots: { customRender: 'user_ifhave' },
    dataIndex: 'user_ifhave',
  },
  {
    title: '工人等级',
    dataIndex: 'worker_class',
  },
  {
    title: '工人年龄',
    dataIndex: 'worker_year',
  },
  {
    title: '开始时间',
    dataIndex: 'worker_starttime',
    scopedSlots: { customRender: 'worker_starttime' },
  },
  {
    title: '结束时间',
    dataIndex: 'worker_endtime',
    scopedSlots: { customRender: 'worker_endtime' },
  },
]
const columns = [
  {
    title: '工人编号',
    width: 120,
    sorter: true,
    dataIndex: 'worker_id',
  },
  {
    title: '工种',
    sorter: true,
    width: 180,
    dataIndex: 'gongzhongname',
  },
  {
    title: '工人名字',
    sorter: true,
    dataIndex: 'worker_name',
  },
  // {
  //   title: '工人价格',
  //   sorter: true,
  //   dataIndex: 'worker_price',
  // },
  {
    title: '工人手机号',
    sorter: true,
    dataIndex: 'user_phone',
  },
  {
    title: '工人身份证',
    dataIndex: 'worker_number',
  },
  {
    title: '信用等级',
    sorter: true,
    dataIndex: 'worker_rating',
  },
  //  {
  //   title: '工人状态',
  //   dataIndex: 'worker_status',
  // },
  {
    title: '工人说明',
    dataIndex: 'worker_explain',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]

export default {
  name: 'WorkUser',
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      list: [],
      gongzhongcolumns,
      xianshidanweixin: false,
      gongzhonglist: [],
      fileListlunbo: [],
      jiazhaolist: [],
      columns,
      baseURL: 'http://8.136.103.102:8088/api',
      // baseURL:"http://47.103.34.184:8085/api",
      ifshowhistory: false,
      visiblegongzhong: false,
      historyColumns,
      jiazhaocolumns,
      filecolumns,
      historydata: [],
      allunit: [],
      ifbianjigongzhong: false,
      onegongzhong: {},
      spinning: false,
      olddata: {},
      visible: false,
      innerColumns,
      ifdaorugoods: false,
      visiblejiazjao: false,
      confirmLoading: false,
      startValue: 'time',
      endValue: 'time',
      oneunit: '',
      keywords: '',
      headers: {
        authorization: 'authorization-text',
      },
      ifnogongzhongname: false,
      ifchangepassword: false,
      ifaddworkuserdata: false,
      visiblewenjian: false,
      devicepassword: '',
      password: '',
      choseid: '',
      gongzhongid: '',
      gongzhong: [],
      workername: '',
      password1: '',
      worker_id: '',
      oneworkuserdata: {},
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllWorkUsersDataListpage()
    this.gongzhongmargement11()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出工人信息列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
        
          this.$request({
            url: '/user/getAllWorkUsersDataListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '工人编号',
                    '工种',
                    '工人名字',
                    '工人电话',
                    '工人身份证',
                    '信用等级',
                    '工人说明',
                    '工人地址',
                    '工人标题',
                    '是否为自有工人',
                    '工人等级',
                    '工人年龄'
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.worker_id == null ? '' : element.worker_id,
                    element.gongzhongname == null ? '' : element.gongzhongname,
                    // element.worker_price == null ? '' : element.worker_price,
                    element.user_phone == null ? '' : element.user_phone,
                    element.worker_number == null ? '' : element.worker_number,
                    element.worker_rating == null ? '' : element.worker_rating,
                    element.worker_explain == null ? '' : element.worker_explain,
                    element.worker_address == null ? '' : element.worker_address,
                    element.worker_headline == null ? '' : element.worker_headline,
                    element.user_ifhave == null ? '' : element.user_ifhave == 1 ? '是' : '否' ,
                    element.worker_class==null? '' : element.worker_class,
                    element.worker_year==null? '' : element.worker_year,
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '工人用户列表')
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
    baocungongzhong() {
      const that = this
      console.log('工种信息')
      console.log(that.onegongzhong)
      if (that.oneunit != null && that.oneunit != '') {
        that.onegongzhong.danwei = that.oneunit
      }
      if (that.onegongzhong.danwei == '' && that.onegongzhong.unit == null) {
        that.$message.warning('请选择工种单位信息!')
        return
      }
      if (that.onegongzhong.jiage == '' && that.onegongzhong.jiage == null) {
        that.$message.warning('请填写工种工资信息!')
        return
      }
      that.spinning = true
      this.$request({
        url: '/user/updatagongzongdataByid',
        method: 'get',
        params: that.onegongzhong,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.xianshidanweixin = false
            that.ifbianjigongzhong = false
            that.oneunit = ''
            that.onegongzhong = {}
            that.getnewdata()
            that.$message.success('修改成功!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getnewdata() {
      const that = this
      that.spinning = true
      var formdate = {}
      formdate.workid = that.choseid
      that
        .$request({
          url: '/user/getALLgongzhongxinxiListPage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.gongzhonglist = res.data
            that.visiblegongzhong = true
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    zhongxinxi(e) {
      const that = this
      console.log(e)
      that.ifbianjigongzhong = true
      var formdata = {}
      formdata.id = e.worker_two_id
      that.spinning = true
      that
        .$request({
          url: '/user/getgongzhongdatabygongzhongid',
          method: 'get',
          params: formdata,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            var aa = res.data.worker_two_unit.split(',')
            var bb = []
            var b = 1
            aa.forEach((item) => {
              b++
              bb.push({
                id: b,
                name: item,
              })
            })
            that.allunit = bb
            that.onegongzhong.user_worker_two_id = e.user_worker_two_id

            // that.onegongzhong.jiage = e.worker_price != null && e.worker_price != '' ? e.worker_price : 0

            if (e.choosedunit != null && e.choosedunit != '') {
              that.xianshidanweixin = true
              that.oneunit = e.choosedunit != null && e.choosedunit != '' ? e.choosedunit : ''
            } else {
              that.oneunit = ''
              that.xianshidanweixin = false
            }
            that.ifbianjigongzhong = true
            console.log('dfdddd')
            console.log(that.onegongzhong)
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    bianjigongzhong(e) {
      const that = this
      console.log(e)
      that.spinning = true
      var formdate = {}
      that.choseid = e.worker_id
      formdate.workid = e.worker_id
      that
        .$request({
          url: '/user/getALLgongzhongxinxiListPage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.gongzhonglist = res.data
            that.visiblegongzhong = true
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    jiazhaotupian(e) {
      const that = this

      that.list = []
      if (e.files.length > 0) {
        e.files.forEach((item) => {
          that.list.push({
            slide_name: item,
            url: item,
          })
        })
      }
      that.visiblewenjian = true
    },
    showhistory(e) {
      console.log(e)
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'WorkUser'
      formdate.id = e.worker_id
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
    lookwenjian(e) {
      const that = this
      if (e.worker_jiazhao) {
        console.log('1111')
        console.log(JSON.parse(e.worker_jiazhao))
        var newdata = JSON.parse(e.worker_jiazhao)
        var aaa = []
        newdata.forEach((item) => {
          var aa = {}
          aa = item.vehicle_class
          aa.files = []
          aa.files = aa.files.concat(item.driver).concat(item.driving)
          aaa.push(aa)
        })

        console.log('啊萨达萨达')
        console.log(aaa)
        that.jiazhaolist = aaa
        that.visiblejiazjao = true
      } else {
        that.$message.warning('该工人暂无驾照信息!')
      }
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
    gongzhongmargement11() {
      const that = this
      that
        .$request({
          url: '/user/getAllGongzhong1Listpage',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((item) => {
              item.id = item.worker_two_id
              item.name = item.worker_two_name
            })
            that.gongzhong = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    change124() {
      const that = this
      if (that.onegongzhong.danwei == '' || that.onegongzhong.danwei == null) {
        that.oneunit = ''
        that.xianshidanweixin = false
      }
    },
    change123() {
      const that = this
      if (that.oneworkuserdata.gongzhongname == '' || that.oneworkuserdata.gongzhongname == null) {
        that.oneworkuserdata.worker_two_name = []
        that.ifnogongzhongname = true
      }
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllWorkUsersDataListpage()
    },
    handleCancelpassword() {
      const that = this
      that.password = ''
      that.password1 = ''
      that.ifchangepassword = false
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
      formdate.worker_id = that.worker_id
      formdate.bills_type = 'WorkUser'
      formdate.workername = that.workername
      formdate.updatepassword = 'yes'
      this.$request({
        url: '/user/updataWorkuserdataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.status == 200) {
            that.spinning = false
            that.password = ''
            that.password1 = ''
            that.ifchangepassword = false
            that.workername = ''
            that.worker_id = ''
            that.$message.success('重置密码成功!')
          } else if (res.status == 406) {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.oneworkuserdata = {}
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    changepassword(e) {
      const that = this
      that.ifchangepassword = true
      that.worker_id = e.worker_id
      that.workername = e.worker_name
    },
    handleEdit(e) {
      const that = this
      console.log('222222')
      console.log(e)
      that.visible = true
      that.spinning = true
      that.olddata = e
      that.fileListlunbo = []
      that.ifaddworkuserdata = false
      var formdate = {}
      formdate.worker_id = e.worker_id
      this.$request({
        url: '/user/getOneWorkUserDataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.oneworkuserdata = res.data
            if (e.gongzhongname != null && e.gongzhongname != '') {
              that.oneworkuserdata.gongzhongname = e.gongzhongname
              that.ifnogongzhongname = false
            } else {
              that.oneworkuserdata.gongzhongname = null
              that.oneworkuserdata.worker_two_name = []
              that.ifnogongzhongname = true
            }
            console.log('工人名字')
            console.log(that.oneworkuserdata)
            // if (that.oneworkuserdata.worker_two_name != '' && that.oneworkuserdata.worker_two_name != null) {
            //   that.oneworkuserdata.worker_two_name = Number(that.oneworkuserdata.worker_two_name)
            // }
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
      formdate.myid = that.$store.state.admin.user_id
      formdate.worker_id = e.worker_id
      formdate.bills_type = 'WorkUser'
      formdate.workername = e.worker_name
      this.$request({
        url: '/user/deleteoneworkuserdataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.getAllWorkUsersDataListpage()
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
      that.ifaddworkuserdata = true
      that.oneworkuserdata.worker_status = '0'
    },
    handleOk() {
      const that = this
      if (that.oneworkuserdata.worker_name == null || that.oneworkuserdata.worker_name == '') {
        that.$message.warning('请输入工人名字!')
        return
      }
      if (that.oneworkuserdata.worker_two_name == null || that.oneworkuserdata.worker_two_name == '') {
        that.$message.warning('请选择工种!')
        return
      }
      if (that.oneworkuserdata.user_phone == null || that.oneworkuserdata.user_phone == '') {
        that.$message.warning('请输入工人手机号!')
        return
      }
      if (that.oneworkuserdata.worker_headline == null || that.oneworkuserdata.worker_headline == '') {
        that.$message.warning('请输入工人标题!')
        return
      }
      if (that.oneworkuserdata.worker_address == null || that.oneworkuserdata.worker_address == '') {
        that.$message.warning('请输入工人所在地!')
        return
      }
      if (that.oneworkuserdata.worker_status == null || that.oneworkuserdata.worker_status == '') {
        that.$message.warning('请选择工人状态!')
        return
      }
      if (!/^1[3456789]\d{9}$/.test(that.oneworkuserdata.user_phone)) {
        this.$message.warning('请填写正确手机号!')
        return
      }
      if (this.fileListlunbo.length > 6) {
        that.$message.error('抱歉,相关联文件只能上传5个!')
        return
      }

      if (that.oneworkuserdata.worker_explain == null) {
        that.oneworkuserdata.worker_explain = ''
      }
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
      that.spinning = true
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
                that.oneworkuserdata.user_files = allpicture.join(',')
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
          that.oneworkuserdata.user_files = nogoodspricturelunbo.join(',')
        } else {
          that.oneworkuserdata.user_files = null
        }
        this.asss()
      }
    },
    asss() {
      const that = this
      that.oneworkuserdata.bills_type = 'WorkUser'
      that.oneworkuserdata.myid = that.$store.state.admin.user_id

      var data = ''
      if (that.ifaddworkuserdata) {
        data = '新增'
      } else {
        data = '修改后'
      }
      var status1 = ''
      if (that.oneworkuserdata.worker_status == '0') {
        status1 = '启用'
      } else {
        status1 = '禁用'
      }
      var ziyou1 = ''
      if (that.oneworkuserdata.user_ifhave == 0) {
        ziyou1 = '否'
      } else {
        ziyou1 = '是'
      }
      var shenfenzheng1 = ''
      if (that.oneworkuserdata.worker_number != '' && that.oneworkuserdata.worker_number != null) {
        shenfenzheng1 = that.oneworkuserdata.worker_number
      } else {
        shenfenzheng1 = '暂无'
      }
      var gongrenjiage1 = ''
      // if (that.oneworkuserdata.worker_price != '' && that.oneworkuserdata.worker_price != null) {
      //   gongrenjiage1 = that.oneworkuserdata.worker_price
      // } else {
      //   gongrenjiage1 = '暂无'
      // }
      var beizhu1 = ''
      if (that.oneworkuserdata.worker_explain != '' && that.oneworkuserdata.worker_explain != null) {
        beizhu1 = that.oneworkuserdata.worker_explain
      } else {
        beizhu1 = '暂无'
      }

      if (that.oneworkuserdata.gongzhongname != '' && that.oneworkuserdata.gongzhongname != null) {
        that.oneworkuserdata.worker_two_name = that.oneworkuserdata.worker_two_name.split(',')
        var gongzhongname1 = ''
        that.oneworkuserdata.worker_two_name.forEach((element) => {
          that.gongzhong.forEach((item) => {
            if (element == item.worker_two_id) {
              gongzhongname1 = gongzhongname1 + item.worker_two_name + ','
            }
          })
        })
      } else {
        var gongzhongname1 = ''
        that.oneworkuserdata.worker_two_name.forEach((element) => {
          that.gongzhong.forEach((item) => {
            if (element == item.worker_two_id) {
              gongzhongname1 = gongzhongname1 + item.worker_two_name + ','
            }
          })
        })
      }

      that.oneworkuserdata.worker_two_name = that.oneworkuserdata.worker_two_name.join(',')
      if (that.ifaddworkuserdata) {
        //新增信息
        that.oneworkuserdata.user_operation_record_detail = data + '工人：' + that.oneworkuserdata.worker_name
        this.$request({
          url: '/user/addWorkuserdata',
          method: 'get',
          params: that.oneworkuserdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.oneworkuserdata = {}
              that.getAllWorkUsersDataListpage()
              that.$message.success('新增成功！默认密码:111111')
            } else if (res.status == 406) {
              that.spinning = false
              that.$message.error('抱歉,新增失败,请联系管理员!')
            } else if (res.status == 407) {
              that.spinning = false
              that.$message.error('抱歉,该手机号已经被注册!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        //修改信息
        var status = ''
        if (that.olddata.worker_status == '0') {
          status = '启用'
        } else {
          status = '禁用'
        }
        var ziyou = ''
        if (that.oneworkuserdata.user_ifhave == 0) {
          ziyou = '否'
        } else {
          ziyou = '是'
        }
        var shenfenzheng = ''
        if (that.olddata.worker_number != '' && that.olddata.worker_number != null) {
          shenfenzheng = that.olddata.worker_number
        } else {
          shenfenzheng = '暂无'
        }
        // var gongrenjiage = ''
        // if (that.olddata.worker_price != '' && that.olddata.worker_price != null) {
        //   gongrenjiage = that.olddata.worker_price
        // } else {
        //   gongrenjiage = '暂无'
        // }
        that.olddata.worker_two_name = that.olddata.gongzhongname.split(',')
        var gongzhongname = ''
        that.olddata.worker_two_name.forEach((element) => {
          that.gongzhong.forEach((item) => {
            if (element == item.worker_two_id) {
              gongzhongname = gongzhongname + item.worker_two_name + ','
            }
          })
        })
        var beizhu = ''
        if (that.olddata.worker_explain != '' && that.olddata.worker_explain != null) {
          beizhu = that.olddata.worker_explain
        } else {
          beizhu = '暂无'
        }

        var worker_name = ''
        if (that.olddata.worker_name != that.oneworkuserdata.worker_name) {
          worker_name = '工人名字：' + that.olddata.worker_name + ',修改为：' + that.oneworkuserdata.worker_name + ','
        }

        var xiugaigongzhongname = ''
        if (that.olddata.worker_two_name != that.oneworkuserdata.worker_two_name) {
          xiugaigongzhongname = '工种：' + gongzhongname + ',修改为：' + gongzhongname1
        }

        var xiugaistatus = ''
        if (that.olddata.worker_status != that.oneworkuserdata.worker_status) {
          xiugaistatus = '状态：' + status + ',修改为：' + status1 + ','
        }

        var xiugaiziyou = ''
        if (that.olddata.user_ifhave != that.oneworkuserdata.user_ifhave) {
          xiugaiziyou = '是否为自有工人：' + ziyou + ',修改为：' + ziyou1 + ','
        }

        var user_phone = ''
        if (that.olddata.user_phone != that.oneworkuserdata.user_phone) {
          user_phone = '手机号码：' + that.olddata.user_phone + ',修改为：' + that.oneworkuserdata.user_phone + ','
        }

        var xiugaiworker_headline = ''
        if (that.olddata.worker_headline != that.oneworkuserdata.worker_headline) {
          xiugaiworker_headline =
            '工人标题：' + that.olddata.worker_headline + ',修改为：' + that.oneworkuserdata.worker_headline + ','
        }

        var xiugaiworker_address = ''
        if (that.olddata.worker_address != that.oneworkuserdata.worker_address) {
          xiugaiworker_address =
            ',工人地址：' + that.olddata.worker_address + ',修改为：' + that.oneworkuserdata.worker_address + ','
        }

        var xiugaishenfenzheng = ''
        if (that.olddata.worker_number != that.oneworkuserdata.worker_number) {
          xiugaishenfenzheng = '工人身份证：' + shenfenzheng + ',修改为：' + shenfenzheng1 + ','
        }

        var xiugaigongrenjiage = ''
        // if (that.olddata.worker_price != that.oneworkuserdata.worker_price) {
        //   xiugaigongrenjiage = '工人价格：' + gongrenjiage + ',修改为：' + gongrenjiage1 + ','
        // }

        var xiugaibeizhu = ''
        if (that.olddata.worker_explain != that.oneworkuserdata.worker_explain) {
          xiugaibeizhu = ',备注：' + beizhu + ',修改为：' + beizhu1 + ','
        }

        that.oneworkuserdata.user_operation_record_detail =
          worker_name +
          xiugaigongzhongname +
          xiugaistatus +
          xiugaiziyou +
          user_phone +
          xiugaiworker_headline +
          xiugaiworker_address +
          xiugaishenfenzheng +
          xiugaigongrenjiage +
          xiugaibeizhu
        that.spinning = true
        this.$request({
          url: '/user/updataWorkuserdataByid',
          method: 'get',
          params: that.oneworkuserdata,
        })
          .then((res) => {
            if (res.code == 200) {
              that.spinning = false
              that.visible = false
              that.olddata = {}
              that.oneworkuserdata = {}
              that.getAllWorkUsersDataListpage()
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
      that.ifnogongzhongname = false
      that.oneworkuserdata = {}
    },
    onSearch() {
      const that = this
      that.getAllWorkUsersDataListpage()
    },
    getAllWorkUsersDataListpage() {
      const that = this
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
          url: '/user/getAllWorkUsersDataListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.data = res.data
            res.data.forEach((element) => {
              var groupItem = []
              groupItem.push({
                worker_address: element.worker_address,
                worker_headline: element.worker_headline,
                worker_class: element.worker_class,
                worker_year: element.worker_year,
                worker_starttime: element.worker_starttime,
                worker_endtime: element.worker_endtime,
                user_ifhave: element.user_ifhave,
              })
              element.groupItem = groupItem
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
