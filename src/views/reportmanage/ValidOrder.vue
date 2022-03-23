<template>
  <a-card style="margin-top: 24px" :bordered="false">
    请选择时间：
    <a-range-picker @change="onChange" size="default" :locale="locale"> </a-range-picker>
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-spin :spinning="spinning" size="large" style="margin-top: 40px">
      <div>
        <div ref="testChart" style="height: 500px; width: 100%; border: 1px solid black"></div>
      </div>
    </a-spin>
  </a-card>
</template>

<script>
var myChart
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
      formInline: {
        timerange: [],
      },
      spinning: false,
      cahrt: null,
      inpMessage: '',
      clickData: '',
      // option: {
      //   title: {
      //     text: '销量排行',
      //   },
      //   tooltip: {},
      //   xAxis: {
      //     data: [],
      //   },
      //   yAxis: {},
      //   series: [
      //     {
      //       name: '销量',
      //       type: 'bar',
      //       data: [],
      //     },
      //   ],
      // },
    }
  },
  created() {},
  mounted() {
    const that = this
    var endtime = new Date()
    var starttime = new Date(endtime.getTime() - 24 * 60 * 60 * 1000 * 7)
    that.formInline.timerange = [starttime, endtime]

    that.getAllSalesRankingListpage()
  },
  methods: {
    onChange(date, dateString) {
      const that = this
      that.formInline.timerange[0] = dateString[0]
      that.formInline.timerange[1] = dateString[1]
      if (dateString[0] == '') {
        that.formInline.timerange[1] = that.dateFtt('yyyy-MM-dd', new Date())
        that.formInline.timerange[0] = that.dateFtt('yyyy-MM-dd', new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7))
      }
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
      if (that.formInline.timerange) {
        that.formInline.starttime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[0]))
        that.formInline.endtime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[1]))
        if (that.formInline.times == 'month') {
          that.formInline.starttime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[0]))
          that.formInline.endtime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[1]))
        }
      }

      formdate.starttime = that.formInline.starttime
      formdate.endtime = that.formInline.endtime

      that.spinning = true
      that
        .$request({
          url: '/user/getAllValidOrderAllData',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            var xAxisdatas = []
            var ydatas = []
            this.chart = this.$echarts.init(this.$refs.testChart)
            myChart = this.chart
            that.spinning = false
            var alldates = []
            //查出全部空的日期
            alldates = that.getDayAll(formdate.starttime, formdate.endtime)

            var newdates = []
            alldates.forEach((item) => {
              newdates.push({
                creatime: item,
                number: 0,
              })
            })
            newdates.forEach((element) => {
              res.data.forEach((item) => {
                if (element.creatime == item.creatime) {
                  element.number = item.number
                }
              })
            })
            newdates.forEach((element) => {
              xAxisdatas.push(element.creatime)
              ydatas.push(element.number)
            })
            myChart.setOption({
              title: {
                text: '有效订单报表',
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
                  name: '销售单数量',
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
