<template>
  <a-card style="margin-top: 24px" :bordered="false">
    请选择时间：
    <a-range-picker @change="onChange" size="default" :locale="locale"> </a-range-picker>
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
      v-if="$store.state.rights[12].children[4].children[0].import == 1"
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
    title: '盈利值',
    dataIndex: 'price',
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
      data: [],
      betweentime: {},
      spinning: false,
      cahrt: null,
      inpMessage: '',
      clickData: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllSalesRankingListpage()
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
          formdate.starttime = that.betweentime.starttime
          formdate.endtime = that.betweentime.endtime
          this.$request({
            url: '/user/getAllSalesGoodsPriceData',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['材料编号', '材料名称', '盈利值']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.shop_goods_id == null ? '' : element.shop_goods_id,
                    element.goodsname == null ? '' : element.goodsname,
                    element.price == null ? '' : element.price,
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '材料盈利排行列表')
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
    onChange(date, dateString) {
      const that = this
      that.betweentime.starttime = dateString[0]
      that.betweentime.endtime = dateString[1]
    },
    handleClick() {
      //赋值
      this.clickData = this.inpMessage
    },
    onSearch() {
      const that = this
      that.getAllSalesRankingListpage()
    },
    getAllSalesRankingListpage() {
      const that = this
      var formdate = {}
      formdate.starttime = that.betweentime.starttime
      formdate.endtime = that.betweentime.endtime
      that.spinning = true
      that
        .$request({
          url: '/user/getAllSalesGoodsPriceData',
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
              ydatas.push(element.price)
            })
            myChart.setOption({
              title: {
                text: '商品销量排行报表',
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
                  name: '盈利额度',
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
