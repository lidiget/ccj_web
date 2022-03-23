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
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
    >
      导出浏览记录
    </a-button>
    <a-spin :spinning="spinning" size="large">
      <a-table
        ref="table"
        size="default"
        :columns="columns1"
        :data-source="data"
        bordered
        :alert="false"
        @change="handleTableChange"
      >
        <template slot="recodes_cretime" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <template slot="title">
          {{ '浏览记录' }}
        </template>
      </a-table>
    </a-spin>
  </a-card>
</template>

<script>
const columns1 = [
  {
    title: '浏览编号',
    dataIndex: 'recodes_id',
    width: 120,
    sorter: true,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    sorter: true,
  },
  {
    title: '真实姓名',
    dataIndex: 'realname',
    sorter: true,
  },
  {
    title: '商品编号',
    sorter: true,
    dataIndex: 'shop_goods_id',
    width: 100,
  },
  {
    title: '浏览商品名称',
    sorter: true,
    dataIndex: 'shop_goods_name',
  },
  {
    title: '创建时间',
    dataIndex: 'recodes_cretime',
    scopedSlots: { customRender: 'recodes_cretime' },
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
      columns1,
      spinning: false,
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllBrowseDataListpage()
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
          this.$request({
            url: '/user/getAllBrowseDataListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['浏览编号', '用户名', '真实姓名', '商品编号', '商品名称', '浏览时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.recodes_id == null ? '' : element.recodes_id,
                    element.username == null ? '' : element.username,
                    element.realname == null ? '' : element.realname,
                    element.shop_goods_id == null ? '' : element.shop_goods_id,
                    element.shop_goods_name == null ? '' : element.shop_goods_name,
                    element.recodes_cretime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.recodes_cretime)),
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
    onSearch() {
      const that = this
      that.getAllBrowseDataListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllBrowseDataListpage()
    },
    getAllBrowseDataListpage() {
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
          url: '/user/getAllBrowseDataListpage',
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
