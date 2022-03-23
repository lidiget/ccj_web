<template>
  <a-card style="margin-top: 24px" :bordered="false">
    请选择时间：
    <a-range-picker style="margin-right: 16px" @change="onChange" size="default" :locale="locale"> </a-range-picker>
    销售人员：
    <a-select
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
      v-if="$store.state.rights[12].children[5].children[0].import == 1"
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
    title: '销售人员编号',
    dataIndex: 'id',
  },
  {
    title: '销售人员姓名',
    dataIndex: 'sellname',
  },
  {
    title: '销售额度',
    dataIndex: 'allprice',
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
      alluser: [],
      betweentime: {},
      spinning: false,
      cahrt: null,
      userid: '',
      inpMessage: '',
      clickData: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllSalesRankingListpage()
    that.getAllUserData()
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
          if (that.userid != '') {
            formdate.userid = that.userid
          }
          this.$request({
            url: '/user/getAllSalesRankingListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['销售人员编号', '销售人员姓名', '销售额度']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.id == null ? '' : element.id,
                    element.sellname == null ? '' : element.sellname,
                    element.allprice == null ? '' : element.allprice,
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '销售业绩列表')
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
    getAllUserData() {
      const that = this
      that.alluser = []
      var formdate = {}
      that
        .$request({
          url: '/user/getAllSalesData',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.alluser = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
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
      if (that.userid != '') {
        formdate.userid = that.userid
      }
      console.log('1111111111111')
      console.log(formdate)
      that.spinning = true
      that
        .$request({
          url: '/user/getAllSalesPerformanceAllData',
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
              xAxisdatas.push(element.sellname)
              ydatas.push(element.allprice)
            })
            myChart.setOption({
              title: {
                text: '销售业绩报表',
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
                  name: '销售业绩',
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
