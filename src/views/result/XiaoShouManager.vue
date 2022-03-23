<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 16px; margin-left: 16px; width: 272px; margin-bottom: 16px"
      v-model="keywords"
    />
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <!-- <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      type="primary"
      @click="add"
      :loading="spinning"
      v-if="$store.state.rights[5].children[0].children[0].add == 1"
    >
      +新增销售
    </a-button> -->
    <a-spin :spinning="spinning" size="large">
      <a-table
        ref="table"
        size="default"
        @change="handleTableChange"
        :columns="columns"
        :data-source="data"
        bordered
        :alert="false"
      >
        <span slot="action" slot-scope="text, record">
          <template v-if="$store.state.rights[5].children[0].children[0].edit == 1">
            <a @click="shengchengyaoqingma(record)">生成邀请码</a>
            <a-divider type="vertical" v-if="$store.state.rights[5].children[0].children[0].edit == 1" />
          </template>
          <template>
            <a @click="showhistory(record)">历史记录</a>
            <a-divider type="vertical"  />
          </template>
           <template>
            <a @click="chakanbangding(record)">查看绑定客户</a>
          </template>
        </span>
      </a-table>
    </a-spin>
    <a-modal
      title="操作"
      :width="800"
      v-model="visible"
      @ok="handleOk"
      :maskClosable="false"
      :destroyOnClose="true"
      okText="保存"
      :centered="true"
      cancelText="取消"
    >
      <a-form class="permission-form" :form="form">
        <a-form-item v-show="false">
          <a-input v-decorator="['id', { rules: [{ message: '' }] }]" placeholder="" />
        </a-form-item>
        <a-form-item label="销售名" hasFeedback>
          <a-input
            :maxLength="50"
            placeholder="销售名"
            :disabled="true"
            v-decorator="['name', { rules: [{ required: true, message: '请输入销售名' }] }]"
          />
        </a-form-item>
        <a-form-item label="邀请码" hasFeedback>
          <a-input
            :maxLength="50"
            placeholder="邀请码"
            v-decorator="['invite', { rules: [{ required: true, message: '请输入邀请码' }] }]"
          />
        </a-form-item>
      </a-form>
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
        title="已使用邀请码用户"
        width="700px"
        :visible="visibleyonghu"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visibleyonghu = false
          }
        "
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-table :columns="yonghuColumns" :data-source="yonghudetail" size="small">
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const yonghuColumns = [
  {
    title: '用户编号',
    width: 120,
    dataIndex: 'user_id',
  },
  {
    title: '用户名',
    dataIndex: 'user_name',
  },
  {
    title: '真实姓名',
    dataIndex: 'user_realname',
  },
  {
    title: '用户地址',
    dataIndex: 'user_address',
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
const columns = [
  {
    title: '销售',
    sorter: true,
    dataIndex: 'name',
  },
  {
    title: '邀请码',
    sorter: true,
    dataIndex: 'invite',
  },
  // {
  //   title: '业绩',
  //   sorter: true,
  //   dataIndex: 'achievement',
  // },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'OrderListManager',
  props: {
    text: String,
  },
  data() {
    return {
      data: [],
      form: this.$form.createForm(this),
      columns,
      visible: false,
      spinning: false,
       visibleyonghu: false,
      ifshowhistory: false,
      confirmLoading: false,
      historyColumns,
      yonghuColumns,
      changetype: 0,
      keywords: '',
      oldname: '',
      oldinvite: '',
      orderstatus: '',
      status: '',
      allyaoqingma: [],
      oderdetail: [],
      historydata: [],
      allDevice: [],
      yonghudetail: [],
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllOrdersListpage()
  },
  methods: {
    chakanbangding(e) {
      const that = this
      console.log('111111111111')
      console.log(e)
      that.visibleyonghu = true
      that.spinning = true
      var formdate = {}
      formdate.sell_id = e.id
      that
        .$request({
          url: '/user/getAllCommonUsersDataListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.yonghudetail = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    showhistory(e) {
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'XiaoShouManager'
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
    add() {
      this.form = this.$form.createForm(this)
      this.visible = true
    },
    handleCancel() {
      const that = this
      that.visible = false
    },
    shengchengyaoqingma(record) {
      console.log("ssssssssssssss");
      console.log(record);
      if (record.invite != null && record.invite != '') {
        this.$message.warning('抱歉,该销售已经生成了邀请码，请勿重复生成!')
        return
      }
      var str = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
      ]
      function generateMixed(n) {
        var res = ''
        for (var i = 0; i < n; i++) {
          var id = Math.ceil(Math.random() * 35)
          res += str[id]
        }
        return res
      }
      var aa = ''
      console.log(generateMixed(6))
      aa = generateMixed(6)
      this.visible = true
      this.oldname = JSON.parse(JSON.stringify(record.name))
      // this.oldinvite = JSON.parse(JSON.stringify(record.invite))
      this.$nextTick(() => {
        this.form.setFieldsValue({ id: record.id, name: record.name, invite: aa })
      })
    },
    handleEdit(record) {
      const that = this
      this.visible = true
      this.oldname = JSON.parse(JSON.stringify(record.name))
      // this.oldinvite = JSON.parse(JSON.stringify(record.invite))
      this.$nextTick(() => {
        this.form.setFieldsValue({ id: record.id, name: record.name, invite: record.invite })
      })
    },
    handleOk(e) {
      e.preventDefault()
      const that = this
      this.form.validateFields((err, values) => {
        if (values.name == null || values.name == '') {
          this.$message.warning('销售名称不能为空!')
          return
        }
        if (values.invite == null || values.invite == '') {
          this.$message.warning('销售邀请码不能为空!')
          return
        }
        values.bills_type = 'XiaoShouManager'
        values.myid = that.$store.state.admin.user_id
        if (values.id != null && values.id != '') {
          var xiugainame = ''
          if (values.name != that.oldname) {
            xiugainame = '销售名:' + that.oldname + '修改为：' + values.name
          }
          var xiugaiyaoqing = ''
          if (values.invite != that.oldinvite) {
            xiugaiyaoqing = '销售邀请码:' + that.oldinvite + '修改为：' + values.invite
          }
          values.user_operation_record_detail = xiugainame + xiugaiyaoqing
          var dd = []
          that.data.forEach((item) => {
            if (item.invite == values.invite && item.id != values.id) {
              dd.push(item)
            }
          })
          if (dd.length > 0) {
            this.$message.warning('该销售邀请码已被使用!')
            return
          }
          this.$request({
            url: 'user/changeSell',
            method: 'get',
            data: values,
            params: values,
          }).then((res) => {
            console.log(res)
            if (res.status == 200) {
              this.visible = false
              that.oldname = ''
              that.oldinvite = ''
              this.$message.success('修改成功')
              this.getAllOrdersListpage()
            } else {
              this.$message.error(res.message)
            }
          })
        } else {
          console.log('444444444444')
          console.log(values)
          values.user_operation_record_detail = '新增销售名:' + values.name
          console.log('4444sss')
          this.$request({
            url: 'user/addSell',
            method: 'get',
            data: values,
            params: values,
          }).then((res) => {
            if (res.status == 200) {
              this.visible = false
              this.$message.success('新增成功')
              this.getAllOrdersListpage()
            } else {
              this.$message.error(res.message)
            }
          })
        }
      })
    },
    onSearch() {
      const that = this
      that.getAllOrdersListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllOrdersListpage()
    },
    getAllOrdersListpage() {
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
          url: '/user/selectAllSell',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          that.spinning = false
          if (res.status == 200) {
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
  margin-left: 8px;
  margin-right: 8px;
}
</style>
