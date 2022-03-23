<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      刷新
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
      v-if="$store.state.rights[12].children[2].children[0].import == 1"
    >
      导出列表
    </a-button>
    <a-spin :spinning="spinning" size="large" style="margin-top: 40px">
      <a-table ref="table" size="default" :columns="columns1" :data-source="data" bordered :alert="false"> </a-table>
      <div>
        <div ref="testChart" style="height: 500px; width: 100%; border: 1px solid black"></div>
      </div>
    </a-spin>
  </a-card>
</template>

<script>
var myChart
var columns1 = [
  {
    title: '材料编号',
    dataIndex: 'shop_goods_id',
  },
  {
    title: '材料名称',
    dataIndex: 'goodsname',
  },
  {
    title: '评分',
    dataIndex: 'feedback',
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
      data: [],
      columns1,
      spinning: false,
      cahrt: null,
      inpMessage: '',
      clickData: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllBadRankingListpage()
  },
  methods: {
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
          formdate.god = 'yes'
          this.$request({
            url: '/user/getAllBadRankingAllData',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['材料编号', '材料名称', '评分']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.shop_goods_id == null ? '' : element.shop_goods_id,
                    element.goodsname == null ? '' : element.goodsname,
                    element.feedback == null ? '' : element.feedback,
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '材料好评排行列表')
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
    handleClick() {
      //赋值
      this.clickData = this.inpMessage
    },
    onSearch() {
      const that = this
      that.getAllBadRankingListpage()
    },
    getAllBadRankingListpage() {
      const that = this
      var formdate = {}
      formdate.god = 'yes'
      that.spinning = true
      that
        .$request({
          url: '/user/getAllBadRankingAllData',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            var xAxisdatas = []
            var ydatas = []
            console.log(this.$echarts)
            this.chart = this.$echarts.init(this.$refs.testChart)
            myChart = this.chart
            that.spinning = false
            that.data = res.data
            res.data.forEach((element) => {
              xAxisdatas.push(element.goodsname)
              ydatas.push(element.feedback)
            })
            myChart.setOption({
              title: {
                text: '材料好评排行',
              },
              tooltip: {
                trigger: 'axis',
                axisPointer: {
                  type: 'cross',
                  label: {
                    backgroundColor: '#6a7985',
                  },
                },
              },
              xAxis: {
                data: xAxisdatas,
              },
              yAxis: {},
              series: [
                {
                  name: '评分',
                  type: 'bar',
                  data: ydatas,
                },
              ],
            })
            that.$nextTick(() => {
              myChart.resize()
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
.editable-add-btn {
  margin-bottom: 8px;
}
</style>
