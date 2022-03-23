<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search
      style="margin-right: 16px; margin-left: 16px; width: 272px; margin-bottom: 16px"
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
      导出评论数据
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
        <template slot="title"> 全部评论列表 </template>
        <span slot="slide_name" slot-scope="text">
          <a type="link" :href="text"> {{ text }} </a></span
        >
        <template slot="goods_comment_slideshow" slot-scope="text">
          <img :src="text" width="100" height="100" v-if="text != ''" />
        </template>
        <template slot="worker_detail_id" slot-scope="text">{{ text == 0 ? '暂无' : text }}</template>
        <template slot="goods_comment_creatime" slot-scope="text">
          {{ text | dayjs }}
        </template>
        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">文件</a>
          </template>
        </span>
      </a-table>
    </a-spin>

    <div>
      <a-modal
        title="相关文件"
        width="900px"
        :visible="visible"
        :confirm-loading="false"
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
          <a-table ref="table" :columns="filecolumns" :data-source="oderdetail">
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

const columns = [
  {
    title: '评论编号',
    dataIndex: 'goods_comment_id',
    width: 120,
    sorter: true,
  },
  // {
  //   title: '订单编号',
  //   sorter: true,
  //   dataIndex: 'worker_detail_id',
  //   scopedSlots: { customRender: 'worker_detail_id' },
  // },
  {
    title: '用户名',
    sorter: true,
    dataIndex: 'username',
  },
  {
    title: '材料名称',
    sorter: true,
    width: 160,
    dataIndex: 'goodsname',
  },
  // {
  //   title: '图片/视频地址',
  //   dataIndex: 'goods_comment_slideshow',
  //   scopedSlots: { customRender: 'slide_name' },
  // },
  {
    title: '评论',
    sorter: true,
    dataIndex: 'goods_comment_content',
  },
  {
    title: '评分',
    sorter: true,
    dataIndex: 'goods_comment_level',
  },
  {
    title: '评论时间',
    dataIndex: 'goods_comment_creatime',
    scopedSlots: { customRender: 'goods_comment_creatime' },
  },

  // {
  //   title: '评论状态',
  //   dataIndex: 'goods_comment_status',
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
      columns,
      filecolumns,
      visible: false,
      spinning: false,
      confirmLoading: false,
      changetype: 0,
      keywords: '',
      orderstatus: '',
      status: '',
      oderdetail: [],
      allDevice: [],
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllOrdersListpage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出评论数据列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllBadEvaluationListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['评论编号', '用户名', '材料名称', '评论', '评分', '创建时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.goods_comment_id == null ? '' : element.goods_comment_id,
                    element.username == null ? '' : element.username,
                    element.goodsname == null ? '' : element.goodsname,
                    element.goods_comment_content == null ? '' : element.goods_comment_content,
                    element.goods_comment_level == null ? '' : element.goods_comment_level,
                    element.goods_comment_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.goods_comment_creatime)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '评论记录列表')
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
    handleCancel() {
      const that = this
      that.visible = false
    },
    handleEdit(e) {
      const that = this
      console.log(e)
      that.visible = true
      that.oderdetail = []
      if (e.goods_comment_slideshow) {
        var data = []
        data = e.goods_comment_slideshow.split(',')
        data.forEach((item) => {
          that.oderdetail.push({
            slide_name: item,
            url: item,
          })
        })
      }
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
      if (that.status != '' && that.status != null) {
        formdate.status = that.status
      }
      if (that.orderstatus != '' && that.orderstatus != null) {
        formdate.orderstatus = that.orderstatus
      }

      that.spinning = true
      that
        .$request({
          url: '/user/getAllBadEvaluationListpage',
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
