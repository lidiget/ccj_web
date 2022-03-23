<template>
  <div class="account-settings-info-view">
    <!-- <a-row :gutter="16">
      <a-col :md="24" :lg="8" :style="{ minHeight: '180px' }">
        <a-upload
          action="http://8.136.103.102:8088/api/pub/uploadImg/mitoufiles"
          :headers="headers"
          name="picture"
          :multiple="false"
          list-type="picture"
          @change="handleChange"
          :file-list="fileList"
        >
          <a-button> <a-icon type="upload" /> upload </a-button>
        </a-upload>
      </a-col>
    </a-row> -->
    <a-card
      ><a-button type="primary" @click="add" v-if="$store.state.rights[8].children[1].children[0].add == 1"
        >新增</a-button
      >
      <a-table ref="table" :columns="columns" :data-source="list">
        <span slot="slide_name" slot-scope="text">
          <a type="link" :href="text"> {{ text }} </a></span
        >
        <span slot="shop_goods_id" slot-scope="text">
          <a type="link" @click="linkgoodsdata(text)"> {{ text }} </a></span
        >
        <span slot="action" slot-scope="text, record">
          <a @click="change(record)" v-if="$store.state.rights[8].children[1].children[0].edit == 1">编辑</a>
          <a-divider type="vertical" v-if="$store.state.rights[8].children[1].children[0].delete == 1" />
          <a @click="handledelete(record)" v-if="$store.state.rights[8].children[1].children[0].delete == 1">删除</a>
        </span>
      </a-table></a-card
    >

    <a-modal
      title="新增广告信息"
      style="top: 20px"
      :width="800"
      v-model="visible"
      @ok="handleOk"
      cancelText="取消"
      okText="保存"
    >
      <a-form class="permission-form">
        <a-form-item label="图片" extra="">
          <a-upload
            action="http://8.136.103.102:8088/api/pub/aliuploadImg3"
            :headers="headers"
            name="picture"
            accept="image/jpeg,image/x-png,image/x-ms-bmp,image/x-photo-cd,image/x-portablebitmap,image/x-rgb,image/tiff"
            :multiple="false"
            list-type="picture"
            @change="handleChange"
            :file-list="fileList"
          >
            <a-button> <a-icon type="upload" /> 选择图片 </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item v-show="false" label="绑定商品" hasFeedback>
          <a-input v-model="record.slide_id"></a-input>
        </a-form-item>
        <a-form-item label="绑定商品" hasFeedback>
          <a-select style="width: 60%" v-model="record.shop_goods_id" show-search option-filter-prop="children">
            <a-select-option v-for="item in allgoods" :key="item.shop_goods_id" :value="item.shop_goods_id">
              {{ item.shop_goods_name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form></a-modal
    >

    <div>
      <a-modal
        width="900px"
        :visible="ifshangpingxinxi"
        :confirm-loading="spinning"
        @cancel="
          () => {
            this.ifshangpingxinxi = false
            this.onegooddata = []
          }
        "
        :footer="null"
      >
        <template>
          <a-spin :spinning="spinning" size="large">
            <a-table
              ref="table"
              size="default"
              :columns="goodcolumns"
              :data-source="onegooddata"
              bordered
              :alert="false"
            >
              <a-table
                :pagination="{ defaultPageSize: 999, hideOnSinglePage: true }"
                :columns="innerColumns"
                slot="expandedRowRender"
                slot-scope="onegooddata"
                :dataSource="onegooddata.groupItem"
                :rowKey="(item) => item.shop_goods_id"
                :locale="{ emptyText: '暂无数据' }"
              >
              </a-table>
              <template slot="shop_goods_class" slot-scope="text">{{ text == 'no' ? '' : text }}</template>
              <template slot="title"> 材料信息 </template>
            </a-table>
          </a-spin>
        </template>
      </a-modal>
    </div>
  </div>
</template>

<script>
import AvatarModal from './AvatarModal'
import storage from 'store'
import { ACCESS_TOKEN } from '@/store/mutation-types'
const innerColumns = [
  {
    title: '工种',
    dataIndex: 'worktypename',
  },
  {
    title: '厂商信息',
    dataIndex: 'manufacturersname',
  },
  {
    title: '材料服务',
    dataIndex: 'shop_goods_server',
  },
  {
    title: '厂家地址',
    dataIndex: 'shop_goods_brand',
  },
  {
    title: '材料发货地',
    dataIndex: 'shop_goods_origin',
  },
  {
    title: '折扣',
    dataIndex: 'shop_goods_discount',
  },
  {
    title: '材料说明',
    dataIndex: 'shop_goods_explain',
  },
]
const goodcolumns = [
  {
    title: '材料编号',
    width: 120,
    dataIndex: 'shop_goods_id',
  },
  {
    title: '材料代码',
    width: 130,
    dataIndex: 'shop_goods_priority',
  },
  {
    title: '材料名称',
    dataIndex: 'shop_goods_name',
  },
  {
    title: '材料颜色',
    dataIndex: 'colorname',
  },
  {
    title: '材料单位',
    dataIndex: 'unitname',
  },
  {
    title: '材料分类',
    dataIndex: 'shop_goods_class',
    scopedSlots: { customRender: 'shop_goods_class' },
  },
  {
    title: '好评度',
    dataIndex: 'feedback',
  },
]
export default {
  components: {
    AvatarModal,
  },

  data() {
    return {
      // cropper
      preview: {},
      fileList: [],
      baseURL: 'http://8.136.103.102:8088/api',
      // baseURL: 'http://47.103.34.184:8085/api',
      // baseURL: 'http://localhost:8085/api',
      visible: false,
      ifshangpingxinxi: false,
      shop_goods_id: 0,
      headers: {
        Authorization: storage.get(ACCESS_TOKEN),
      },
      list: [],
      allgoods: [],
      record: {},
      columns: [
        {
          dataIndex: 'slide_name',
          title: '文件地址',
          scopedSlots: { customRender: 'slide_name' },
        },
        {
          title: '关联材料',
          dataIndex: 'shop_goods_id',
          width: 120,
          scopedSlots: { customRender: 'shop_goods_id' },
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 120,
          scopedSlots: { customRender: 'action' },
        },
      ],
      innerColumns,
      goodcolumns,
      onegooddata: [],
      option: {
        img: '/avatar2.jpg',
        info: true,
        size: 1,
        outputType: 'jpeg',
        canScale: false,
        autoCrop: true,
        // 只有自动截图开启 宽度高度才生效
        autoCropWidth: 180,
        autoCropHeight: 180,
        fixedBox: true,
        // 开启宽度和高度比例
        fixed: true,
        fixedNumber: [1, 1],
      },
    }
  },
  created() {
    this.selectalldata()
  },
  methods: {
    linkgoodsdata(e) {
      console.log('111111111111')
      console.log(e)
      const that = this
      var formdate = {}
      formdate.goodsid = e
      that.spinning = true
      that
        .$request({
          url: '/user/getAllShopGoodsListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              var groupItem = []
              groupItem.push({
                shop_goods_profession: element.shop_goods_profession,
                manufacturersname: element.manufacturersname,
                shop_goods_server: element.shop_goods_server,
                shop_goods_manufactureradd: element.shop_goods_manufactureradd,
                shop_goods_brand: element.shop_goods_brand,
                shop_goods_origin: element.shop_goods_origin,
                shop_goods_discount: element.shop_goods_discount,
                shop_goods_explain: element.shop_goods_explain,
                worktypename: element.worktypename,
              })
              element.groupItem = groupItem
            })
            that.onegooddata = res.data
            that.ifshangpingxinxi = true
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    selectalldata() {
      console.log('sssss')
      this.$request({
        url: '/user/selectAll',
        method: 'get',
        params: {
          table: 'slide_show',
          id: 'slide_id',
        },
      }).then((res) => {
        console.log(res)
        this.list = res.data
        // this.fileList = [
        //   {
        //     uid: '-1',
        //     name: 'xxx.png',
        //     status: 'done',
        //     url: res['data']['slide_name'],
        //   },
        // ]
        // console.log(res['data']['slide_name'])
      })

      this.$request({
        url: '/user/selectAll',
        method: 'get',
        params: {
          table: 'shop_goods',
        },
      }).then((res) => {
        console.log(res)
        this.allgoods = res.data
        // this.fileList = [
        //   {
        //     uid: '-1',
        //     name: 'xxx.png',
        //     status: 'done',
        //     url: res['data']['slide_name'],
        //   },
        // ]
        // console.log(res['data']['slide_name'])
      })
    },
    handleChange(info, afileList, event) {
      console.log(info, afileList, event)
      let that = this
      let fileList = [...info.fileList]

      // 1. Limit the number of uploaded files
      //    Only to show two recent uploaded files, and old ones will be replaced by the new
      fileList = fileList.slice(-1)
      console.log(fileList)
      // 2. read from response and show file link
      fileList = fileList.map((file) => {
        if (file.response) {
          // Component will show file.url as link
          file.url = file.response.data.objectKey
          console.log(file.url)
          // that.$request({
          //   url: '/user/changeSlideShow',
          //   method: 'get',
          //   params: {
          //     table_name: 'slide_show',
          //     column: 'slide_name',
          //     columnvalue: file.url,
          //     slide_id: 1,
          //   },
          // })
        }
        return file
      })

      this.fileList = fileList
    },
    getAlldata() {
      this.$request({
        url: '/user/selectAll',
        method: 'get',
        params: {
          table: 'slide_show',
          id: 'slide_id',
        },
      }).then((res) => {
        console.log(res)
        this.list = res.data
      })
    },
    handledelete(record) {
      const that = this
      // var b = 1000
      // var a = 0
      // for (let i = 0; i < b; i++) {
      //   a++
      //   setTimeout(() => {
      //     console.log('输出aaa')
      //     console.log(a)
      //     that
      //   .$request({
      //     url: 'user/getAllGoodsDataNeedAdd',
      //     method: 'get',
      //     params: {},
      //   })
      //   .then((res) => {
      //     if (res.status == 200) {

      //       that.$message.success('删除成功')
      //     } else {
      //       that.$message.error(res.message)
      //     }
      //   })
      //   }, 72000000)
      // }
      // return
      this.$confirm({
        title: '警告',
        content: `真的要删除吗?`,
        okText: '删除',
        okType: 'danger',
        cancelText: '取消',
        onOk() {
          // 在这里调用删除接口
          that
            .$request({
              url: 'user/deleteSlideShow',
              method: 'get',
              params: { slide_id: record.slide_id },
            })
            .then((res) => {
              if (res.status == 200) {
                that.getAlldata()
                that.$message.success('删除成功')
              } else {
                that.$message.error(res.message)
              }
            })
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    setavatar(url) {
      this.option.img = url
    },
    handleOk() {
      var that = this
      if (this.record.slide_id) {
        that
          .$request({
            url: '/user/changeSlideShow',
            method: 'get',
            params: {
              table_name: 'slide_show',
              column: 'slide_name',
              columnvalue: this.fileList[0].url,
              column2: 'shop_goods_id',
              columnvalue2: this.record.shop_goods_id,
              slide_id: this.record.slide_id,
            },
          })
          .then((res) => {
            if (res.status == 200) {
              this.$message.success('修改成功')
              // location.reload()
              this.selectalldata()
              this.visible = false
            }
          })
      } else {
        that
          .$request({
            url: '/user/addSlideShow',
            method: 'get',
            params: {
              shop_goods_id: this.record.shop_goods_id,
              slide_name: this.fileList[0].url,
            },
          })
          .then((res) => {
            if (res.status == 200) {
              this.$message.success('新增成功')
              // location.reload()
              this.selectalldata()
              this.visible = false
            }
          })
      }
    },
    change(record) {
      this.fileList = [
        {
          uid: '-1',
          name: record['slide_name'],
          status: 'done',
          url: record['slide_name'],
        },
      ]
      this.shop_goods_id = record.shop_goods_id
      this.record = record
      this.visible = true
    },
    add() {
      this.fileList = []
      this.shop_goods_id = null
      this.visible = true
      this.record = {}
    },
  },
}
</script>

<style lang="less" scoped>
.avatar-upload-wrapper {
  height: 200px;
  width: 100%;
}

.ant-upload-preview {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 180px;
  border-radius: 50%;
  box-shadow: 0 0 4px #ccc;

  .upload-icon {
    position: absolute;
    top: 0;
    right: 10px;
    font-size: 1.4rem;
    padding: 0.5rem;
    background: rgba(222, 221, 221, 0.7);
    border-radius: 50%;
    border: 1px solid rgba(0, 0, 0, 0.2);
  }
  .mask {
    opacity: 0;
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
    cursor: pointer;
    transition: opacity 0.4s;

    &:hover {
      opacity: 1;
    }

    i {
      font-size: 2rem;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-left: -1rem;
      margin-top: -1rem;
      color: #d6d6d6;
    }
  }

  img,
  .mask {
    width: 100%;
    max-width: 180px;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
  }
}
</style>
