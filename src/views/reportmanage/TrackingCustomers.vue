<template>
  <a-card style="margin-top: 24px" :bordered="false">
    请选择时间：
    <a-range-picker style="margin-right: 16px" size="default" @change="onChange" :locale="locale"> </a-range-picker>
    <a v-if="ifzhuguan">销售人员：</a>
    <a-select
      v-if="ifzhuguan"
      style="width: 130px; margin-right: 16px"
      show-search
      placeholder="销售人员"
      option-filter-prop="children"
      allowClear
      v-model="userid"
    >
      <a-select-option v-for="(items, index) in alluser" :key="index" :label="items.name" :value="items.id">{{
        items.name
      }}</a-select-option>
    </a-select>
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
      v-if="$store.state.rights[5].children[2].children[0].import == 1"
    >
      导出列表
    </a-button>
    <a-spin :spinning="spinning" size="large" style="margin-top: 40px">
      <a-table ref="table" size="default" :columns="columns1" :data-source="data" bordered :alert="false">
        <template slot="title"> 关联用户列表 </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">相关订单</a>
            <a-divider type="vertical" />
          </template>
          <template>
            <a @click="gengxingenzong(record)">新增跟踪信息</a>
            <a-divider type="vertical" />
          </template>
          <template>
            <a @click="gengxingenzongliebiao(record)">信息列表</a>
          </template>
        </span>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        title="订单详情"
        width="700px"
        :visible="visible"
        :confirm-loading="confirmLoading"
        @cancel="
          () => {
            this.visible = false
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-table :columns="detailColumns" :data-source="oderdetail" size="small">
              <template slot="order_info_voicsta" slot-scope="text">
                {{ text == 1 ? '已开票' : '未开票' }}
              </template>
              <template slot="order_info_status" slot-scope="text">
                <a-badge
                  :status="
                    text == 1
                      ? 'default'
                      : text == 2
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 4
                      ? 'processing'
                      : text == 5
                      ? 'success'
                      : 'error'
                  "
                />
                {{
                  text == 1
                    ? '待付款'
                    : text == 2
                    ? '待发货'
                    : text == 3
                    ? '待收货'
                    : text == 4
                    ? '待评价'
                    : text == 5
                    ? '已完成'
                    : '已取消'
                }}
              </template>
              <template slot="order_info_creatime" slot-scope="text">
                {{ text | dayjs }}
              </template>
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div>
    <div>
      <a-modal
        title="跟踪信息"
        :visible="ifgenzong"
        :confirm-loading="false"
        okText="保存"
        @ok="genzongxinx()"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.ifgenzong = false
            this.genzongxinxi = {}
            this.fileList = []
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <p>
          <a-spin :spinning="spinning" size="large">
            <row>
              <a-form-item label="备注:">
                <a-input
                  size="large"
                  :maxLength="200"
                  placeholder="备注"
                  v-model="genzongxinxi.user_track_remark"
                  type="textarea"
                />
              </a-form-item>
            </row>
            <row>
              附加文件信息:
              <a-upload :file-list="fileList" :remove="handleRemovefengmian" :before-upload="beforeUploadfengmian">
                <a-button> <a-icon type="upload" /> 选择文件 </a-button>
              </a-upload>
            </row>
          </a-spin>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="跟踪信息详情"
        width="700px"
        :visible="visiblegenzong"
        :confirm-loading="confirmLoading"
        @cancel="
          () => {
            this.visiblegenzong = false
            this.genzongdetail = []
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-range-picker style="margin-right: 16px" size="default" @change="onChangedata" :locale="locale">
            </a-range-picker>
            <a-button
              style="margin-left: 16px"
              class="editable-add-btn"
              type="primary"
              @click="onSearch1"
              :loading="spinning"
            >
              搜索
            </a-button>
            <a-table :columns="genzongColumns" :data-source="genzongdetail" size="small">
              <template slot="user_track_createtime" slot-scope="text">
                {{ text | dayjs }}
              </template>
              <span slot="action" slot-scope="text, record">
                <template>
                  <a @click="wenjianxinxi(record)">文件信息</a>
                </template>
              </span>
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
            this.list = []
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
const genzongColumns = [
  {
    title: '信息编号',
    dataIndex: 'user_track_id',
  },
  {
    title: '备注',
    dataIndex: 'user_track_remark',
  },
  {
    title: '添加时间',
    scopedSlots: { customRender: 'user_track_createtime' },
    dataIndex: 'user_track_createtime',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
const detailColumns = [
  {
    title: '订单编号',
    dataIndex: 'order_info_ids',
  },
  {
    title: '收货名',
    dataIndex: 'harvest_name',
  },
  {
    title: '收货电话',
    dataIndex: 'harvest_phone',
  },
  {
    title: '优惠券额度',
    dataIndex: 'coupon_moeny',
  },

  {
    title: '总价',
    dataIndex: 'order_info_altogether',
  },

  {
    title: '支付金额',
    dataIndex: 'order_info_moneys',
  },

  {
    title: '下单时间',
    dataIndex: 'order_info_creatime',
    scopedSlots: { customRender: 'order_info_creatime' },
  },
  {
    title: '订单状态',
    dataIndex: 'order_info_status',
    scopedSlots: { customRender: 'order_info_status' },
  },
  {
    title: '开票状态',
    dataIndex: 'order_info_voicsta',
    scopedSlots: { customRender: 'order_info_voicsta' },
  },
]
var columns1 = [
  {
    title: '客户编号',
    dataIndex: 'userid',
  },
  {
    title: '客户名称',
    dataIndex: 'username',
  },
  {
    title: '联系方式',
    dataIndex: 'phone',
  },
  {
    title: '订单总额',
    dataIndex: 'allprice',
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
export default {
  components: {
    locale,
  },
  props: {
    text: String,
  },
  data() {
    return {
      locale,
      columns1,
      detailColumns,
      filecolumns,
      genzongColumns,
      genzongdetail: [],
      list: [],
      confirmLoading: false,
      visible: false,
      visiblewenjian: false,
      data: [],
      visiblegenzong: false,
      ifgenzong: false,
      genzongxinxi: {},
      fileList: [],
      oderdetail: [],
      alluser: [],
      ifzhuguan: false,
      betweentime: {},
      betweentime1: {},
      baseURL: 'http://8.136.103.102:8088/api',
      // baseURL:"http://47.103.34.184:8085/api",
      spinning: false,
      cahrt: null,
      userid: '',
      userid1: '',
      inpMessage: '',
      clickData: '',
    }
  },
  created() {},
  mounted() {
    const that = this

    that.getAllUserData()
  },
  methods: {
    wenjianxinxi(e) {
      const that = this
      console.log(e)
      var aa = {}
      aa = e
      that.list = []
      if (aa.user_track_file) {
        var data = []
        data = aa.user_track_file.split(',')
        data.forEach((item) => {
          that.list.push({
            slide_name: item,
            url: item,
          })
        })
      }
      that.visiblewenjian = true
    },
    gengxingenzongliebiao(e) {
      const that = this
      console.log(e)
      that.spinning = true
      var formdate = {}
      that.userid1 = e.userid
      formdate.user_id = e.userid
      that
        .$request({
          url: '/user/getAllTrackingDataByUseridListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.genzongdetail = res.data
            that.visiblegenzong = true
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    gengxingenzong(e) {
      const that = this
      that.genzongxinxi.user_id = e.userid
      that.ifgenzong = true
    },
    genzongxinx() {
      const that = this
      that.spinning = true
      if (this.fileList.length > 5) {
        that.$message.warning('抱歉,文件信息最多上传5个!')
        that.spinning = false
        return
      }
      var goodspricturelunbo = []
      var nogoodspricturelunbo = []
      if (this.fileList.length > 0) {
        this.fileList.forEach((item) => {
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
                that.genzongxinxi.user_track_file = allpicture.join(',')
              }
            })
            .catch(function () {
              that.spinning = false
              that.$message.warning('抱歉,材料轮播图上传失败,请尝试重新上传!')
              return
            })
        })

        setTimeout(() => {
          this.asss()
        }, 2000)
      } else {
        if (nogoodspricturelunbo.length > 0) {
          that.genzongxinxi.user_track_file = nogoodspricturelunbo.join(',')
        } else {
          that.genzongxinxi.user_track_file = null
        }
        this.asss()
      }
    },
    asss() {
      const that = this
      console.log('ddddddd')
      console.log(that.genzongxinxi)
      this.$request({
        url: '/user/addgenzongxinxibyuserid',
        method: 'get',
        params: that.genzongxinxi,
      })
        .then((res) => {
          if (res.status == 200) {
            that.spinning = false
            that.ifgenzong = false
            that.genzongxinxi = {}
            that.fileList = []
            that.getAllSalesRankingListpage()
            that.$message.success('更新跟踪材料信息成功!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleRemovefengmian(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUploadfengmian(file) {
      const that = this
      this.fileList = [...this.fileList, file]
      return false
    },
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.starttime = that.betweentime.starttime
          formdate.endtime = that.betweentime.endtime
          if (that.userid != '') {
            formdate.userid = that.userid
          } else {
            that.$message.warning('请先选择销售人员!')
            return
          }
          this.$request({
            url: '/user/getAllTrackingCustomersAllData',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['客户编号', '客户名称', '联系方式', '订单总额']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.userid == null ? '' : element.userid,
                    element.username == null ? '' : element.username,
                    element.phone == null ? '' : element.phone,
                    element.allprice == null ? '' : element.allprice,
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '销售人员跟踪客户列表')
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
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      var formdate = {}
      formdate.userid = e.userid
      that
        .$request({
          url: '/user/getAllOrderByuseridListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.oderdetail = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getAllUserData() {
      const that = this
      console.log('111111111111')
      console.log(JSON.parse(localStorage.getItem('store')).admin.sell_leve)
      if (
        JSON.parse(localStorage.getItem('store')).admin.sell_leve == 1 //普通销售
      ) {
        var id = JSON.parse(localStorage.getItem('store')).admin.user_id
        this.$request({
          url: '/user/getAllueridBySellid',
          method: 'get',
          params: {
            sellid: id,
          },
        })
          .then((res) => {
            if (res.data.length > 0) {
              res.data.forEach((item) => {
                this.alluser.push(item.user_id)
              })
              that.getAllSalesRankingListpage()
            } else {
              that.$message.warning('抱歉,暂无绑定客户!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else if (JSON.parse(localStorage.getItem('store')).admin.sell_leve == 2) {
        //销售主管
        that.ifzhuguan = true
        var id = JSON.parse(localStorage.getItem('store')).admin.user_id
        this.$request({
          url: '/user/getAllueridBySellzhuguanid',
          method: 'get',
          params: {
            id: id,
          },
        })
          .then((res) => {
            if (res.data.length > 0) {
              res.data.forEach((item) => {
                this.alluser.push(item.user_id)
              })
              that.getAllSalesRankingListpage()
            } else {
              that.$message.warning('抱歉,您自己或者相关组员暂未绑定相关用户!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
            return
          })
      } else {
        that.getAllSalesRankingListpage()
      }
      // const that = this
      // that.alluser = []
      // var formdate = {}
      // that
      //   .$request({
      //     url: '/user/getAllSalesData',
      //     method: 'get',
      //     params: formdate,
      //   })
      //   .then((res) => {
      //     if (res.code == 200) {
      //       that.alluser = res.data
      //     }
      //   })
      //   .catch(function () {
      //     that.spinning = false
      //     that.$message.error('抱歉,未知错误,请联系管理员!')
      //   })
    },
    onChange(date, dateString) {
      const that = this
      that.betweentime.starttime = dateString[0]
      that.betweentime.endtime = dateString[1]
    },
    onChangedata(date, dateString) {
      const that = this
      that.betweentime1.starttime = dateString[0]
      that.betweentime1.endtime = dateString[1]
    },
    onSearch() {
      const that = this
      that.getAllUserData()
    },
    onSearch1() {
      const that = this
      that.spinning = true
      var formdate = {}
      if (that.betweentime1.starttime) {
        formdate.starttime = that.betweentime1.starttime
      }
      if (that.betweentime1.endtime) {
        formdate.endtime = that.betweentime1.endtime
      }

      formdate.user_id = that.userid1
      that
        .$request({
          url: '/user/getAllTrackingDataByUseridListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.genzongdetail = res.data
            that.visiblegenzong = true
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getAllSalesRankingListpage() {
      const that = this
      var formdate = {}
      if (that.betweentime.starttime) {
        formdate.starttime = that.betweentime.starttime
      }
      if (that.betweentime.endtime) {
        formdate.endtime = that.betweentime.endtime
      }
      if (this.alluser.length > 0) {
        var aa = ''
        aa = that.alluser.join(',')
        formdate.allids = aa
      }
      if (that.userid != '') {
        formdate.userid = that.userid
      }
      that.spinning = true
      that
        .$request({
          url: '/user/getAllTrackingCustomersAllData',
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
