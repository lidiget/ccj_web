

import Vue from 'vue';
import XLSX from 'xlsx'



Vue.mixin({
  destroyed() {

  },
  beforeDestroy() {

  },
  data() {
    return {



    };
  },

  methods: {
    getDayAll(starDay, endDay) {
      var arr = [];
      var dates = [];
      // 设置两个日期UTC时间
      var db = new Date(starDay);
      var de = new Date(endDay);
      // 获取两个日期GTM时间
      var s = db.getTime() - 24 * 60 * 60 * 1000;
      var d = de.getTime() - 24 * 60 * 60 * 1000;

      // 获取到两个日期之间的每一天的毫秒数
      for (var i = s; i <= d;) {
        i = i + 24 * 60 * 60 * 1000;
        arr.push(parseInt(i))
      }

      // 获取每一天的时间  YY-MM-DD
      for (var j in arr) {
        var time = new Date(arr[j]);
        var year = time.getFullYear(time);
        var mouth = (time.getMonth() + 1) >= 10 ? (time.getMonth() + 1) : ('0' + (time.getMonth() + 1));
        var day = time.getDate() >= 10 ? time.getDate() : ('0' + time.getDate());
        var YYMMDD = year + '-' + mouth + '-' + day;
        dates.push(YYMMDD)
      }
      return dates
    },
    dateFtt(fmt, date) {
      //yyyy-MM-dd hh:mm:ss  或 yyyy-MM-dd
      var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        S: date.getMilliseconds() //毫秒
      };
      if (/(y+)/.test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
      for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length == 1
              ? o[k]
              : ("00" + o[k]).substr(("" + o[k]).length)
          );
      return fmt;
    },
    //导出方法
    outputXlsxFile(data, xlsxName) {
      /* convert state to workbook */

      const ws = XLSX.utils.aoa_to_sheet(data)

      ws['!cols'] = [{ wch: 30 }, { wch: 30 }];

      const wb = XLSX.utils.book_new()

      XLSX.utils.book_append_sheet(wb, ws, xlsxName)

      /* generate file and send to client */

      XLSX.writeFile(wb, xlsxName + '.xlsx')
    },
    //导入方法
    importfxx(obj) {
      let _this = this;
      console.log("xxxxxxxxxxxxxxxxxxxxxxxxxxx1");
      let inputDOM = this.$refs.inputer;
      // 通过DOM取文件数据

      this.file = event.currentTarget.files[0];

      var rABS = false; //是否将文件读取为二进制字符串
      var f = this.file;

      var reader = new FileReader();
      //if (!FileReader.prototype.readAsBinaryString) {
      FileReader.prototype.readAsBinaryString = function (f) {
        var binary = "";
        var rABS = false; //是否将文件读取为二进制字符串
        var pt = this;
        var wb; //读取完成的数据
        var outdata;
        var reader = new FileReader();
        reader.onload = function (e) {
          var bytes = new Uint8Array(reader.result);
          var length = bytes.byteLength;
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          var XLSX = require("xlsx");
          if (rABS) {
            wb = XLSX.read(btoa(fixdata(binary)), {
              //手动转化
              type: "base64"
            });
          } else {
            wb = XLSX.read(binary, {
              type: "binary"
            });
          }
          outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]); //outdata就是你想要的东西
          return outdata;
        };
        reader.readAsArrayBuffer(f);
      };
      if (rABS) {
        reader.readAsArrayBuffer(f);
      } else {
        reader.readAsBinaryString(f);
      }
    }

  }

});
