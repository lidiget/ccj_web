<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <div>
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
        type="primary"
        @click="
          () => {
            this.visible = true
            this.ifaddunitdata = true
          }
        "
        :loading="spinning"
        v-if="$store.state.rights[4].children[2].children[0].add == 1"
      >
        +新增材料厂商
      </a-button>
      <a-button
        style="margin-left: 16px"
        class="editable-add-btn"
        icon="vertical-align-top"
        @click="
          () => {
            this.ifdaorugoods = true
          }
        "
        :loading="spinning"
        v-if="$store.state.rights[4].children[2].children[0].upload == 1"
      >
        批量导入
      </a-button>
      <a-button
        style="margin-left: 16px"
        class="editable-add-btn"
        icon="vertical-align-top"
        v-if="$store.state.rights[4].children[2].children[0].upload == 1"
        @click="
          () => {
            this.ifdaorutupian = true
          }
        "
        :loading="spinning"
      >
        批量导入图片
      </a-button>
      <a-button
        style="margin-left: 16px"
        class="editable-add-btn"
        icon="vertical-align-bottom"
        @click="daochuliebiao"
        :loading="spinning"
        v-if="$store.state.rights[4].children[2].children[0].import == 1"
      >
        导出厂商信息
      </a-button>
      <a-spin :spinning="spinning" size="large">
        <a-table
          ref="table"
          size="default"
          :columns="columns1"
          @change="handleTableChange"
          :data-source="data"
          bordered
          :alert="false"
        >
          <template slot="shop_warehouse_creatime" slot-scope="text">
            {{ text | dayjs }}
          </template>
          <span slot="action" slot-scope="text, record">
            <template>
              <a @click="handleEdit(record)" v-if="$store.state.rights[4].children[2].children[0].edit == 1">修改</a>
              <a-divider type="vertical" v-if="$store.state.rights[4].children[2].children[0].edit == 1" />
            </template>
            <template>
              <a @click="handleAddress(record)" v-if="$store.state.rights[4].children[2].children[0].edit == 1"
                >修改详细地址</a
              >
              <a-divider type="vertical" v-if="$store.state.rights[4].children[2].children[0].edit == 1" />
            </template>
            <template>
              <a @click="handledelete(record)" v-if="$store.state.rights[4].children[2].children[0].delete == 1"
                >删除</a
              >
              <a-divider type="vertical" v-if="$store.state.rights[4].children[2].children[0].delete == 1" />
            </template>
            <template>
              <a @click="showhistory(record)">历史记录</a>
            </template>
          </span>
          <template slot="title"> 材料厂商列表 </template>
        </a-table>
      </a-spin>
    </div>

    <div>
      <a-modal
        :title="ifaddunitdata ? '新增材料厂商信息' : '编辑材料厂商信息'"
        :visible="visible"
        :confirm-loading="false"
        okText="保存"
        @ok="handleOk"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.visible = false
            this.oneselldata = {}
            this.fileList = []
            this.getAllSellingDataListpage()
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="edit">
              <a-form-item label="材料厂商名称:">
                <a-input
                  size="large"
                  style="width: 370px"
                  :maxLength="50"
                  type="text"
                  placeholder="材料厂商名称"
                  v-model="oneselldata.shop_warehouse_name"
                ></a-input>
              </a-form-item>

              <a-form-item label="城市:" v-if="oneselldata.city == null || oneselldata.city == ''">
                <a-cascader
                  :options="allcitydata"
                  size="large"
                  style="width: 370px"
                  :display-render="displayRender"
                  expand-trigger="hover"
                  placeholder="城市"
                  @change="onChange"
                />
              </a-form-item>

              <a-form-item label="城市:" v-if="oneselldata.city && !ifaddunitdata">
                <a-input size="large" type="text" allowClear placeholder="城市" v-model="oneselldata.city"></a-input>
              </a-form-item>
              <a-row>
                <a-form-item label="厂商头像:">
                  <a-upload :file-list="fileList" :remove="handleRemovefengmian" :before-upload="beforeUploadfengmian">
                    <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                  </a-upload>
                </a-form-item>
              </a-row>
            </p>
          </a-spin>
        </div>
      </a-modal>
    </div>

    <div>
      <a-modal
        :title="ifaddguige ? '新增厂商地址信息' : '编辑厂商地址信息'"
        :visible="ifchuxianguige"
        :confirm-loading="false"
        okText="保存"
        @ok="handleOkaddress"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.ifchuxianguige = false
            this.oneaddressdata = {}
            this.getAllSAddressdata()
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="edit">
              <a-form-item label="厂商地址名称:">
                <a-input
                  size="large"
                  type="text"
                  placeholder="厂商地址名称"
                  v-model="oneaddressdata.warehouse_classify_name"
                ></a-input>
              </a-form-item>
            </p>
          </a-spin>
        </div>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="厂商地址详情"
        :visible="hadleEditallsize"
        :confirm-loading="false"
        :maskClosable="false"
        :closable="false"
        :centered="true"
      >
        <a-button
          style="margin-left: 8px"
          class="editable-add-btn"
          size="small"
          type="primary"
          @click="addaddress"
          :loading="spinning"
        >
          +新增地址
        </a-button>

        <div id="components-table-demo-size">
          <a-table :columns="detailcolumns" :data-source="allgoodssizedata" size="middle">
            <template slot="warehouse_classify_creatime" slot-scope="text">
              {{ text | dayjs }}
            </template>
            <span slot="action" slot-scope="text, record">
              <template>
                <a @click="xiugaiaddress(record)">修改</a>
                <a-divider type="vertical" />
              </template>
              <template>
                <a @click="shanchuaddress(record)">删除</a>
                <a-divider type="vertical" />
              </template>
              <template>
                <a @click="showhistory1(record)">历史记录</a>
              </template>
            </span>
          </a-table>
        </div>
        <div slot="footer">
          <a-button
            @click="
              () => {
                this.hadleEditallsize = false
              }
            "
            >关闭</a-button
          >
        </div>
      </a-modal>
    </div>

    <div>
      <a-modal
        :visible="ifdaorutupian"
        :confirm-loading="spinning"
        @ok="importtupian"
        @cancel="
          () => {
            this.ifdaorutupian = false
            this.spinning = false
            this.file = undefined
            this.fileListlunbo = []
          }
        "
        okText="开始导入"
        cancelText="取消"
      >
        <template>
          <a-spin :spinning="spinning" size="large">
            <div style="margin-top: 15px">
              <div style="border: 1px solid #ccc">
                <div class="backmingxi">导入全部图片</div>
                <div style="padding: 28px; padding-top: 16px; padding-bottom: 5px">
                  <div style="margin-bottom: 4px">提示：</div>
                  <div>1）请以每个厂商名称命名图片，这样上传之后好分类。例如：shuiguan1,shuiguan2</div>
                  <div>2）图片一次性最多上传2000张</div>
                  <div>3）将需要上传的图片放入文件夹中一次性上传</div>
                </div>
              </div>
              <div v-if="errordetail.length > 0">
                <a-table :columns="errorcolumns" :data-source="errordetail" size="middle"> </a-table>
              </div>
              <a-form-item label="导入全部图片:">
                <a-upload
                  :file-list="fileListlunbo"
                  :multiple="true"
                  :remove="handleRemovelunbo"
                  :before-upload="beforeUploadlunbo"
                  :directory="true"
                >
                  <a-button size="small" type="primary" :loading="spinning">
                    <a-icon type="upload" /> 选择文件夹
                  </a-button>
                </a-upload>
              </a-form-item>
            </div>
          </a-spin>
        </template>
      </a-modal>
    </div>
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
        :visible="ifdaorugoods"
        :confirm-loading="spinning"
        @ok="importFile"
        @cancel="
          () => {
            this.ifdaorugoods = false
            this.spinning = false
            this.file = undefined
          }
        "
        okText="开始导入"
        cancelText="取消"
      >
        <template>
          <a-spin :spinning="spinning" size="large">
            <div style="font: 12px arial, 微软雅黑, 宋体">
              <div style="border: 1px solid #ccc">
                <div class="backmingxi">新增厂商信息导入</div>
                <div style="padding: 28px; padding-top: 16px; padding-bottom: 5px">
                  <div style="margin-bottom: 6px">
                    请先下载导入明细模板:
                    <a-span @click="_export()" style="color: blue; cursor: pointer">下载模板</a-span>
                  </div>
                  <div style="margin-bottom: 4px">提示：</div>
                  <div>1）请先下载导入模板并按模板填写商场基本信息，完成后再选择导入文件</div>
                  <div>2）厂商名称/厂商地址名称为必填项，否则将导入失败</div>
                  <div>3）导入文件要求是excel格式，文件大小不能超过4M</div>
                  <div>4）导入失败后,请将修改好的excel表重新上传！</div>
                  <div>5）注意图片名称填写是截取五位之后的字符进行判断，请这样填写:例如：'10000-shuiguan01'</div>
                </div>
              </div>

              <div v-if="errordetail.length > 0">
                <a-table :columns="errorcolumns" :data-source="errordetail" size="middle"> </a-table>
              </div>

              <div style="margin-top: 15px">
                <a-form-item label="Excel文件:">
                  <a-upload
                    :file-list="fileExcleList"
                    :remove="handleRemove"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    :before-upload="beforeUploadexcel"
                  >
                    <a-button size="small" type="primary" :loading="spinning">
                      <a-icon type="upload" /> 选择文件
                    </a-button>
                  </a-upload>
                </a-form-item>
              </div>
            </div>
          </a-spin>
        </template>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
import XLSX from 'xlsx'
const detailcolumns = [
  {
    title: '仓库编号',
    dataIndex: 'warehouse_classify_id',
  },
  {
    title: '厂商编号',
    dataIndex: 'shop_warehouse_id',
  },
  {
    title: '仓库地址',
    dataIndex: 'warehouse_classify_name',
  },
  {
    title: '创建时间',
    dataIndex: 'warehouse_classify_creatime',
    scopedSlots: { customRender: 'warehouse_classify_creatime' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
const columns1 = [
  {
    title: '厂商编号',
    dataIndex: 'shop_warehouse_id',
    width: 120,
    sorter: true,
  },
  {
    title: '厂商名称',
    sorter: true,
    dataIndex: 'shop_warehouse_name',
  },
  {
    title: '创建时间',
    dataIndex: 'shop_warehouse_creatime',
    scopedSlots: { customRender: 'shop_warehouse_creatime' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
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
const errorcolumns = [
  {
    title: '错误原因',
    dataIndex: 'error',
  },
]
const shenfeng = [
  {
    ProID: 1,
    name: '北京市',
    ProSort: 1,
    ProRemark: '直辖市',
  },
  {
    ProID: 2,
    name: '天津市',
    ProSort: 2,
    ProRemark: '直辖市',
  },
  {
    ProID: 3,
    name: '河北省',
    ProSort: 5,
    ProRemark: '省份',
  },
  {
    ProID: 4,
    name: '山西省',
    ProSort: 6,
    ProRemark: '省份',
  },
  {
    ProID: 5,
    name: '内蒙古自治区',
    ProSort: 32,
    ProRemark: '自治区',
  },
  {
    ProID: 6,
    name: '辽宁省',
    ProSort: 8,
    ProRemark: '省份',
  },
  {
    ProID: 7,
    name: '吉林省',
    ProSort: 9,
    ProRemark: '省份',
  },
  {
    ProID: 8,
    name: '黑龙江省',
    ProSort: 10,
    ProRemark: '省份',
  },
  {
    ProID: 9,
    name: '上海市',
    ProSort: 3,
    ProRemark: '直辖市',
  },
  {
    ProID: 10,
    name: '江苏省',
    ProSort: 11,
    ProRemark: '省份',
  },
  {
    ProID: 11,
    name: '浙江省',
    ProSort: 12,
    ProRemark: '省份',
  },
  {
    ProID: 12,
    name: '安徽省',
    ProSort: 13,
    ProRemark: '省份',
  },
  {
    ProID: 13,
    name: '福建省',
    ProSort: 14,
    ProRemark: '省份',
  },
  {
    ProID: 14,
    name: '江西省',
    ProSort: 15,
    ProRemark: '省份',
  },
  {
    ProID: 15,
    name: '山东省',
    ProSort: 16,
    ProRemark: '省份',
  },
  {
    ProID: 16,
    name: '河南省',
    ProSort: 17,
    ProRemark: '省份',
  },
  {
    ProID: 17,
    name: '湖北省',
    ProSort: 18,
    ProRemark: '省份',
  },
  {
    ProID: 18,
    name: '湖南省',
    ProSort: 19,
    ProRemark: '省份',
  },
  {
    ProID: 19,
    name: '广东省',
    ProSort: 20,
    ProRemark: '省份',
  },
  {
    ProID: 20,
    name: '海南省',
    ProSort: 24,
    ProRemark: '省份',
  },
  {
    ProID: 21,
    name: '广西壮族自治区',
    ProSort: 28,
    ProRemark: '自治区',
  },
  {
    ProID: 22,
    name: '甘肃省',
    ProSort: 21,
    ProRemark: '省份',
  },
  {
    ProID: 23,
    name: '陕西省',
    ProSort: 27,
    ProRemark: '省份',
  },
  {
    ProID: 24,
    name: '新 疆维吾尔自治区',
    ProSort: 31,
    ProRemark: '自治区',
  },
  {
    ProID: 25,
    name: '青海省',
    ProSort: 26,
    ProRemark: '省份',
  },
  {
    ProID: 26,
    name: '宁夏回族自治区',
    ProSort: 30,
    ProRemark: '自治区',
  },
  {
    ProID: 27,
    name: '重庆市',
    ProSort: 4,
    ProRemark: '直辖市',
  },
  {
    ProID: 28,
    name: '四川省',
    ProSort: 22,
    ProRemark: '省份',
  },
  {
    ProID: 29,
    name: '贵州省',
    ProSort: 23,
    ProRemark: '省份',
  },
  {
    ProID: 30,
    name: '云南省',
    ProSort: 25,
    ProRemark: '省份',
  },
  {
    ProID: 31,
    name: '西藏自治区',
    ProSort: 29,
    ProRemark: '自治区',
  },
  {
    ProID: 33,
    name: '澳门特别行政区',
    ProSort: 33,
    ProRemark: '特别行政区',
  },
  {
    ProID: 34,
    name: '香港特别行政区',
    ProSort: 34,
    ProRemark: '特别行政区',
  },
]
const allcity = [
  {
    CityID: 1,
    name: '北京市',
    ProID: 1,
    CitySort: 1,
  },
  {
    CityID: 2,
    name: '天津市',
    ProID: 2,
    CitySort: 2,
  },
  {
    CityID: 3,
    name: '上海市',
    ProID: 9,
    CitySort: 3,
  },
  {
    CityID: 4,
    name: '重庆市',
    ProID: 27,
    CitySort: 4,
  },
  {
    CityID: 5,
    name: '邯郸市',
    ProID: 3,
    CitySort: 5,
  },
  {
    CityID: 6,
    name: '石家庄市',
    ProID: 3,
    CitySort: 6,
  },
  {
    CityID: 7,
    name: '保定市',
    ProID: 3,
    CitySort: 7,
  },
  {
    CityID: 8,
    name: '张家口市',
    ProID: 3,
    CitySort: 8,
  },
  {
    CityID: 9,
    name: '承德市',
    ProID: 3,
    CitySort: 9,
  },
  {
    CityID: 10,
    name: '唐山市',
    ProID: 3,
    CitySort: 10,
  },
  {
    CityID: 11,
    name: '廊坊市',
    ProID: 3,
    CitySort: 11,
  },
  {
    CityID: 12,
    name: '沧州市',
    ProID: 3,
    CitySort: 12,
  },
  {
    CityID: 13,
    name: '衡水市',
    ProID: 3,
    CitySort: 13,
  },
  {
    CityID: 14,
    name: '邢台市',
    ProID: 3,
    CitySort: 14,
  },
  {
    CityID: 16,
    name: '朔州市',
    ProID: 4,
    CitySort: 16,
  },
  {
    CityID: 17,
    name: '忻州市',
    ProID: 4,
    CitySort: 17,
  },
  {
    CityID: 18,
    name: '太原市',
    ProID: 4,
    CitySort: 18,
  },
  {
    CityID: 19,
    name: '大同市',
    ProID: 4,
    CitySort: 19,
  },
  {
    CityID: 20,
    name: '阳泉市',
    ProID: 4,
    CitySort: 20,
  },
  {
    CityID: 21,
    name: '晋中市',
    ProID: 4,
    CitySort: 21,
  },
  {
    CityID: 22,
    name: '长治市',
    ProID: 4,
    CitySort: 22,
  },
  {
    CityID: 23,
    name: '晋城市',
    ProID: 4,
    CitySort: 23,
  },
  {
    CityID: 24,
    name: '临汾市',
    ProID: 4,
    CitySort: 24,
  },
  {
    CityID: 25,
    name: '吕梁市',
    ProID: 4,
    CitySort: 25,
  },
  {
    CityID: 26,
    name: '运城市',
    ProID: 4,
    CitySort: 26,
  },
  {
    CityID: 27,
    name: '沈阳市',
    ProID: 6,
    CitySort: 27,
  },
  {
    CityID: 28,
    name: '铁岭市',
    ProID: 6,
    CitySort: 28,
  },
  {
    CityID: 29,
    name: '大连市',
    ProID: 6,
    CitySort: 29,
  },
  {
    CityID: 30,
    name: '鞍山市',
    ProID: 6,
    CitySort: 30,
  },
  {
    CityID: 31,
    name: '抚顺市',
    ProID: 6,
    CitySort: 31,
  },
  {
    CityID: 32,
    name: '本溪市',
    ProID: 6,
    CitySort: 32,
  },
  {
    CityID: 33,
    name: '丹东市',
    ProID: 6,
    CitySort: 33,
  },
  {
    CityID: 34,
    name: '锦州市',
    ProID: 6,
    CitySort: 34,
  },
  {
    CityID: 35,
    name: '营口市',
    ProID: 6,
    CitySort: 35,
  },
  {
    CityID: 36,
    name: '阜新市',
    ProID: 6,
    CitySort: 36,
  },
  {
    CityID: 37,
    name: '辽阳市',
    ProID: 6,
    CitySort: 37,
  },
  {
    CityID: 38,
    name: '朝阳市',
    ProID: 6,
    CitySort: 38,
  },
  {
    CityID: 39,
    name: '盘锦市',
    ProID: 6,
    CitySort: 39,
  },
  {
    CityID: 40,
    name: '葫芦岛市',
    ProID: 6,
    CitySort: 40,
  },
  {
    CityID: 41,
    name: '长春市',
    ProID: 7,
    CitySort: 41,
  },
  {
    CityID: 42,
    name: '吉林市',
    ProID: 7,
    CitySort: 42,
  },
  {
    CityID: 43,
    name: '延边朝鲜族自治州',
    ProID: 7,
    CitySort: 43,
  },
  {
    CityID: 44,
    name: '四平市',
    ProID: 7,
    CitySort: 44,
  },
  {
    CityID: 45,
    name: '通化市',
    ProID: 7,
    CitySort: 45,
  },
  {
    CityID: 46,
    name: '白城市',
    ProID: 7,
    CitySort: 46,
  },
  {
    CityID: 47,
    name: '辽源市',
    ProID: 7,
    CitySort: 47,
  },
  {
    CityID: 48,
    name: '松原市',
    ProID: 7,
    CitySort: 48,
  },
  {
    CityID: 49,
    name: '白山市',
    ProID: 7,
    CitySort: 49,
  },
  {
    CityID: 50,
    name: '哈尔滨市',
    ProID: 8,
    CitySort: 50,
  },
  {
    CityID: 51,
    name: '齐齐哈尔市',
    ProID: 8,
    CitySort: 51,
  },
  {
    CityID: 52,
    name: '鸡西市',
    ProID: 8,
    CitySort: 52,
  },
  {
    CityID: 53,
    name: '牡丹江市',
    ProID: 8,
    CitySort: 53,
  },
  {
    CityID: 54,
    name: '七台河市',
    ProID: 8,
    CitySort: 54,
  },
  {
    CityID: 55,
    name: '佳木斯市',
    ProID: 8,
    CitySort: 55,
  },
  {
    CityID: 56,
    name: '鹤岗市',
    ProID: 8,
    CitySort: 56,
  },
  {
    CityID: 57,
    name: '双鸭山市',
    ProID: 8,
    CitySort: 57,
  },
  {
    CityID: 58,
    name: '绥化市',
    ProID: 8,
    CitySort: 58,
  },
  {
    CityID: 59,
    name: '黑河市',
    ProID: 8,
    CitySort: 59,
  },
  {
    CityID: 60,
    name: '大兴安岭地区',
    ProID: 8,
    CitySort: 60,
  },
  {
    CityID: 61,
    name: '伊春市',
    ProID: 8,
    CitySort: 61,
  },
  {
    CityID: 62,
    name: '大庆市',
    ProID: 8,
    CitySort: 62,
  },
  {
    CityID: 63,
    name: '南京市',
    ProID: 10,
    CitySort: 63,
  },
  {
    CityID: 64,
    name: '无锡市',
    ProID: 10,
    CitySort: 64,
  },
  {
    CityID: 65,
    name: '镇江市',
    ProID: 10,
    CitySort: 65,
  },
  {
    CityID: 66,
    name: '苏州市',
    ProID: 10,
    CitySort: 66,
  },
  {
    CityID: 67,
    name: '南通市',
    ProID: 10,
    CitySort: 67,
  },
  {
    CityID: 68,
    name: '扬州市',
    ProID: 10,
    CitySort: 68,
  },
  {
    CityID: 69,
    name: '盐城市',
    ProID: 10,
    CitySort: 69,
  },
  {
    CityID: 70,
    name: '徐州市',
    ProID: 10,
    CitySort: 70,
  },
  {
    CityID: 71,
    name: '淮安市',
    ProID: 10,
    CitySort: 71,
  },
  {
    CityID: 72,
    name: '连云港市',
    ProID: 10,
    CitySort: 72,
  },
  {
    CityID: 73,
    name: '常州市',
    ProID: 10,
    CitySort: 73,
  },
  {
    CityID: 74,
    name: '泰州市',
    ProID: 10,
    CitySort: 74,
  },
  {
    CityID: 75,
    name: '宿迁市',
    ProID: 10,
    CitySort: 75,
  },
  {
    CityID: 76,
    name: '舟山市',
    ProID: 11,
    CitySort: 76,
  },
  {
    CityID: 77,
    name: '衢州市',
    ProID: 11,
    CitySort: 77,
  },
  {
    CityID: 78,
    name: '杭州市',
    ProID: 11,
    CitySort: 78,
  },
  {
    CityID: 79,
    name: '湖州市',
    ProID: 11,
    CitySort: 79,
  },
  {
    CityID: 80,
    name: '嘉兴市',
    ProID: 11,
    CitySort: 80,
  },
  {
    CityID: 81,
    name: '宁波市',
    ProID: 11,
    CitySort: 81,
  },
  {
    CityID: 82,
    name: '绍兴市',
    ProID: 11,
    CitySort: 82,
  },
  {
    CityID: 83,
    name: '温州市',
    ProID: 11,
    CitySort: 83,
  },
  {
    CityID: 84,
    name: '丽水市',
    ProID: 11,
    CitySort: 84,
  },
  {
    CityID: 85,
    name: '金华市',
    ProID: 11,
    CitySort: 85,
  },
  {
    CityID: 86,
    name: '台州市',
    ProID: 11,
    CitySort: 86,
  },
  {
    CityID: 87,
    name: '合肥市',
    ProID: 12,
    CitySort: 87,
  },
  {
    CityID: 88,
    name: '芜湖市',
    ProID: 12,
    CitySort: 88,
  },
  {
    CityID: 89,
    name: '蚌埠市',
    ProID: 12,
    CitySort: 89,
  },
  {
    CityID: 90,
    name: '淮南市',
    ProID: 12,
    CitySort: 90,
  },
  {
    CityID: 91,
    name: '马鞍山市',
    ProID: 12,
    CitySort: 91,
  },
  {
    CityID: 92,
    name: '淮北市',
    ProID: 12,
    CitySort: 92,
  },
  {
    CityID: 93,
    name: '铜陵市',
    ProID: 12,
    CitySort: 93,
  },
  {
    CityID: 94,
    name: '安庆市',
    ProID: 12,
    CitySort: 94,
  },
  {
    CityID: 95,
    name: '黄山市',
    ProID: 12,
    CitySort: 95,
  },
  {
    CityID: 96,
    name: '滁州市',
    ProID: 12,
    CitySort: 96,
  },
  {
    CityID: 97,
    name: '阜阳市',
    ProID: 12,
    CitySort: 97,
  },
  {
    CityID: 98,
    name: '宿州市',
    ProID: 12,
    CitySort: 98,
  },
  {
    CityID: 99,
    name: '巢湖市',
    ProID: 12,
    CitySort: 99,
  },
  {
    CityID: 100,
    name: '六安市',
    ProID: 12,
    CitySort: 100,
  },
  {
    CityID: 101,
    name: '亳州市',
    ProID: 12,
    CitySort: 101,
  },
  {
    CityID: 102,
    name: '池州市',
    ProID: 12,
    CitySort: 102,
  },
  {
    CityID: 103,
    name: '宣城市',
    ProID: 12,
    CitySort: 103,
  },
  {
    CityID: 104,
    name: '福州市',
    ProID: 13,
    CitySort: 104,
  },
  {
    CityID: 105,
    name: '厦门市',
    ProID: 13,
    CitySort: 105,
  },
  {
    CityID: 106,
    name: '宁德市',
    ProID: 13,
    CitySort: 106,
  },
  {
    CityID: 107,
    name: '莆田市',
    ProID: 13,
    CitySort: 107,
  },
  {
    CityID: 108,
    name: '泉州市',
    ProID: 13,
    CitySort: 108,
  },
  {
    CityID: 109,
    name: '漳州市',
    ProID: 13,
    CitySort: 109,
  },
  {
    CityID: 110,
    name: '龙岩市',
    ProID: 13,
    CitySort: 110,
  },
  {
    CityID: 111,
    name: '三明市',
    ProID: 13,
    CitySort: 111,
  },
  {
    CityID: 112,
    name: '南平市',
    ProID: 13,
    CitySort: 112,
  },
  {
    CityID: 113,
    name: '鹰潭市',
    ProID: 14,
    CitySort: 113,
  },
  {
    CityID: 114,
    name: '新余市',
    ProID: 14,
    CitySort: 114,
  },
  {
    CityID: 115,
    name: '南昌市',
    ProID: 14,
    CitySort: 115,
  },
  {
    CityID: 116,
    name: '九江市',
    ProID: 14,
    CitySort: 116,
  },
  {
    CityID: 117,
    name: '上饶市',
    ProID: 14,
    CitySort: 117,
  },
  {
    CityID: 118,
    name: '抚州市',
    ProID: 14,
    CitySort: 118,
  },
  {
    CityID: 119,
    name: '宜春市',
    ProID: 14,
    CitySort: 119,
  },
  {
    CityID: 120,
    name: '吉安市',
    ProID: 14,
    CitySort: 120,
  },
  {
    CityID: 121,
    name: '赣州市',
    ProID: 14,
    CitySort: 121,
  },
  {
    CityID: 122,
    name: '景德镇市',
    ProID: 14,
    CitySort: 122,
  },
  {
    CityID: 123,
    name: '萍乡市',
    ProID: 14,
    CitySort: 123,
  },
  {
    CityID: 124,
    name: '菏泽市',
    ProID: 15,
    CitySort: 124,
  },
  {
    CityID: 125,
    name: '济南市',
    ProID: 15,
    CitySort: 125,
  },
  {
    CityID: 126,
    name: '青岛市',
    ProID: 15,
    CitySort: 126,
  },
  {
    CityID: 127,
    name: '淄博市',
    ProID: 15,
    CitySort: 127,
  },
  {
    CityID: 128,
    name: '德州市',
    ProID: 15,
    CitySort: 128,
  },
  {
    CityID: 129,
    name: '烟台市',
    ProID: 15,
    CitySort: 129,
  },
  {
    CityID: 130,
    name: '潍坊市',
    ProID: 15,
    CitySort: 130,
  },
  {
    CityID: 131,
    name: '济宁市',
    ProID: 15,
    CitySort: 131,
  },
  {
    CityID: 132,
    name: '泰安市',
    ProID: 15,
    CitySort: 132,
  },
  {
    CityID: 133,
    name: '临沂市',
    ProID: 15,
    CitySort: 133,
  },
  {
    CityID: 134,
    name: '滨州市',
    ProID: 15,
    CitySort: 134,
  },
  {
    CityID: 135,
    name: '东营市',
    ProID: 15,
    CitySort: 135,
  },
  {
    CityID: 136,
    name: '威海市',
    ProID: 15,
    CitySort: 136,
  },
  {
    CityID: 137,
    name: '枣庄市',
    ProID: 15,
    CitySort: 137,
  },
  {
    CityID: 138,
    name: '日照市',
    ProID: 15,
    CitySort: 138,
  },
  {
    CityID: 139,
    name: '莱芜市',
    ProID: 15,
    CitySort: 139,
  },
  {
    CityID: 140,
    name: '聊城市',
    ProID: 15,
    CitySort: 140,
  },
  {
    CityID: 141,
    name: '商丘市',
    ProID: 16,
    CitySort: 141,
  },
  {
    CityID: 142,
    name: '郑州市',
    ProID: 16,
    CitySort: 142,
  },
  {
    CityID: 143,
    name: '安阳市',
    ProID: 16,
    CitySort: 143,
  },
  {
    CityID: 144,
    name: '新乡市',
    ProID: 16,
    CitySort: 144,
  },
  {
    CityID: 145,
    name: '许昌市',
    ProID: 16,
    CitySort: 145,
  },
  {
    CityID: 146,
    name: '平顶山市',
    ProID: 16,
    CitySort: 146,
  },
  {
    CityID: 147,
    name: '信阳市',
    ProID: 16,
    CitySort: 147,
  },
  {
    CityID: 148,
    name: '南阳市',
    ProID: 16,
    CitySort: 148,
  },
  {
    CityID: 149,
    name: '开封市',
    ProID: 16,
    CitySort: 149,
  },
  {
    CityID: 150,
    name: '洛阳市',
    ProID: 16,
    CitySort: 150,
  },
  {
    CityID: 151,
    name: '济源市',
    ProID: 16,
    CitySort: 151,
  },
  {
    CityID: 152,
    name: '焦作市',
    ProID: 16,
    CitySort: 152,
  },
  {
    CityID: 153,
    name: '鹤壁市',
    ProID: 16,
    CitySort: 153,
  },
  {
    CityID: 154,
    name: '濮阳市',
    ProID: 16,
    CitySort: 154,
  },
  {
    CityID: 155,
    name: '周口市',
    ProID: 16,
    CitySort: 155,
  },
  {
    CityID: 156,
    name: '漯河市',
    ProID: 16,
    CitySort: 156,
  },
  {
    CityID: 157,
    name: '驻马店市',
    ProID: 16,
    CitySort: 157,
  },
  {
    CityID: 158,
    name: '三门峡市',
    ProID: 16,
    CitySort: 158,
  },
  {
    CityID: 159,
    name: '武汉市',
    ProID: 17,
    CitySort: 159,
  },
  {
    CityID: 160,
    name: '襄樊市',
    ProID: 17,
    CitySort: 160,
  },
  {
    CityID: 161,
    name: '鄂州市',
    ProID: 17,
    CitySort: 161,
  },
  {
    CityID: 162,
    name: '孝感市',
    ProID: 17,
    CitySort: 162,
  },
  {
    CityID: 163,
    name: '黄冈市',
    ProID: 17,
    CitySort: 163,
  },
  {
    CityID: 164,
    name: '黄石市',
    ProID: 17,
    CitySort: 164,
  },
  {
    CityID: 165,
    name: '咸宁市',
    ProID: 17,
    CitySort: 165,
  },
  {
    CityID: 166,
    name: '荆州市',
    ProID: 17,
    CitySort: 166,
  },
  {
    CityID: 167,
    name: '宜昌市',
    ProID: 17,
    CitySort: 167,
  },
  {
    CityID: 168,
    name: '恩施土家族苗族自治州',
    ProID: 17,
    CitySort: 168,
  },
  {
    CityID: 169,
    name: '神农架林区',
    ProID: 17,
    CitySort: 169,
  },
  {
    CityID: 170,
    name: '十堰市',
    ProID: 17,
    CitySort: 170,
  },
  {
    CityID: 171,
    name: '随州市',
    ProID: 17,
    CitySort: 171,
  },
  {
    CityID: 172,
    name: '荆门市',
    ProID: 17,
    CitySort: 172,
  },
  {
    CityID: 173,
    name: '仙桃市',
    ProID: 17,
    CitySort: 173,
  },
  {
    CityID: 174,
    name: '天门市',
    ProID: 17,
    CitySort: 174,
  },
  {
    CityID: 175,
    name: '潜江市',
    ProID: 17,
    CitySort: 175,
  },
  {
    CityID: 176,
    name: '岳阳市',
    ProID: 18,
    CitySort: 176,
  },
  {
    CityID: 177,
    name: '长沙市',
    ProID: 18,
    CitySort: 177,
  },
  {
    CityID: 178,
    name: '湘潭市',
    ProID: 18,
    CitySort: 178,
  },
  {
    CityID: 179,
    name: '株洲市',
    ProID: 18,
    CitySort: 179,
  },
  {
    CityID: 180,
    name: '衡阳市',
    ProID: 18,
    CitySort: 180,
  },
  {
    CityID: 181,
    name: '郴州市',
    ProID: 18,
    CitySort: 181,
  },
  {
    CityID: 182,
    name: '常德市',
    ProID: 18,
    CitySort: 182,
  },
  {
    CityID: 183,
    name: '益阳市',
    ProID: 18,
    CitySort: 183,
  },
  {
    CityID: 184,
    name: '娄底市',
    ProID: 18,
    CitySort: 184,
  },
  {
    CityID: 185,
    name: '邵阳市',
    ProID: 18,
    CitySort: 185,
  },
  {
    CityID: 186,
    name: '湘西土家族苗族自治州',
    ProID: 18,
    CitySort: 186,
  },
  {
    CityID: 187,
    name: '张家界市',
    ProID: 18,
    CitySort: 187,
  },
  {
    CityID: 188,
    name: '怀化市',
    ProID: 18,
    CitySort: 188,
  },
  {
    CityID: 189,
    name: '永州市',
    ProID: 18,
    CitySort: 189,
  },
  {
    CityID: 190,
    name: '广州市',
    ProID: 19,
    CitySort: 190,
  },
  {
    CityID: 191,
    name: '汕尾市',
    ProID: 19,
    CitySort: 191,
  },
  {
    CityID: 192,
    name: '阳江市',
    ProID: 19,
    CitySort: 192,
  },
  {
    CityID: 193,
    name: '揭阳市',
    ProID: 19,
    CitySort: 193,
  },
  {
    CityID: 194,
    name: '茂名市',
    ProID: 19,
    CitySort: 194,
  },
  {
    CityID: 195,
    name: '惠州市',
    ProID: 19,
    CitySort: 195,
  },
  {
    CityID: 196,
    name: '江门市',
    ProID: 19,
    CitySort: 196,
  },
  {
    CityID: 197,
    name: '韶关市',
    ProID: 19,
    CitySort: 197,
  },
  {
    CityID: 198,
    name: '梅州市',
    ProID: 19,
    CitySort: 198,
  },
  {
    CityID: 199,
    name: '汕头市',
    ProID: 19,
    CitySort: 199,
  },
  {
    CityID: 200,
    name: '深圳市',
    ProID: 19,
    CitySort: 200,
  },
  {
    CityID: 201,
    name: '珠海市',
    ProID: 19,
    CitySort: 201,
  },
  {
    CityID: 202,
    name: '佛山市',
    ProID: 19,
    CitySort: 202,
  },
  {
    CityID: 203,
    name: '肇庆市',
    ProID: 19,
    CitySort: 203,
  },
  {
    CityID: 204,
    name: '湛江市',
    ProID: 19,
    CitySort: 204,
  },
  {
    CityID: 205,
    name: '中山市',
    ProID: 19,
    CitySort: 205,
  },
  {
    CityID: 206,
    name: '河源市',
    ProID: 19,
    CitySort: 206,
  },
  {
    CityID: 207,
    name: '清远市',
    ProID: 19,
    CitySort: 207,
  },
  {
    CityID: 208,
    name: '云浮市',
    ProID: 19,
    CitySort: 208,
  },
  {
    CityID: 209,
    name: '潮州市',
    ProID: 19,
    CitySort: 209,
  },
  {
    CityID: 210,
    name: '东莞市',
    ProID: 19,
    CitySort: 210,
  },
  {
    CityID: 211,
    name: '兰州市',
    ProID: 22,
    CitySort: 211,
  },
  {
    CityID: 212,
    name: '金昌市',
    ProID: 22,
    CitySort: 212,
  },
  {
    CityID: 213,
    name: '白银市',
    ProID: 22,
    CitySort: 213,
  },
  {
    CityID: 214,
    name: '天水市',
    ProID: 22,
    CitySort: 214,
  },
  {
    CityID: 215,
    name: '嘉峪关市',
    ProID: 22,
    CitySort: 215,
  },
  {
    CityID: 216,
    name: '武威市',
    ProID: 22,
    CitySort: 216,
  },
  {
    CityID: 217,
    name: '张掖市',
    ProID: 22,
    CitySort: 217,
  },
  {
    CityID: 218,
    name: '平凉市',
    ProID: 22,
    CitySort: 218,
  },
  {
    CityID: 219,
    name: '酒泉市',
    ProID: 22,
    CitySort: 219,
  },
  {
    CityID: 220,
    name: '庆阳市',
    ProID: 22,
    CitySort: 220,
  },
  {
    CityID: 221,
    name: '定西市',
    ProID: 22,
    CitySort: 221,
  },
  {
    CityID: 222,
    name: '陇南市',
    ProID: 22,
    CitySort: 222,
  },
  {
    CityID: 223,
    name: '临夏回族自治州',
    ProID: 22,
    CitySort: 223,
  },
  {
    CityID: 224,
    name: '甘南藏族自治州',
    ProID: 22,
    CitySort: 224,
  },
  {
    CityID: 225,
    name: '成都市',
    ProID: 28,
    CitySort: 225,
  },
  {
    CityID: 226,
    name: '攀枝花市',
    ProID: 28,
    CitySort: 226,
  },
  {
    CityID: 227,
    name: '自贡市',
    ProID: 28,
    CitySort: 227,
  },
  {
    CityID: 228,
    name: '绵阳市',
    ProID: 28,
    CitySort: 228,
  },
  {
    CityID: 229,
    name: '南充市',
    ProID: 28,
    CitySort: 229,
  },
  {
    CityID: 230,
    name: '达州市',
    ProID: 28,
    CitySort: 230,
  },
  {
    CityID: 231,
    name: '遂宁市',
    ProID: 28,
    CitySort: 231,
  },
  {
    CityID: 232,
    name: '广安市',
    ProID: 28,
    CitySort: 232,
  },
  {
    CityID: 233,
    name: '巴中市',
    ProID: 28,
    CitySort: 233,
  },
  {
    CityID: 234,
    name: '泸州市',
    ProID: 28,
    CitySort: 234,
  },
  {
    CityID: 235,
    name: '宜宾市',
    ProID: 28,
    CitySort: 235,
  },
  {
    CityID: 236,
    name: '资阳市',
    ProID: 28,
    CitySort: 236,
  },
  {
    CityID: 237,
    name: '内江市',
    ProID: 28,
    CitySort: 237,
  },
  {
    CityID: 238,
    name: '乐山市',
    ProID: 28,
    CitySort: 238,
  },
  {
    CityID: 239,
    name: '眉山市',
    ProID: 28,
    CitySort: 239,
  },
  {
    CityID: 240,
    name: '凉山彝族自治州',
    ProID: 28,
    CitySort: 240,
  },
  {
    CityID: 241,
    name: '雅安市',
    ProID: 28,
    CitySort: 241,
  },
  {
    CityID: 242,
    name: '甘孜藏族自治州',
    ProID: 28,
    CitySort: 242,
  },
  {
    CityID: 243,
    name: '阿坝藏族羌族自治州',
    ProID: 28,
    CitySort: 243,
  },
  {
    CityID: 244,
    name: '德阳市',
    ProID: 28,
    CitySort: 244,
  },
  {
    CityID: 245,
    name: '广元市',
    ProID: 28,
    CitySort: 245,
  },
  {
    CityID: 246,
    name: '贵阳市',
    ProID: 29,
    CitySort: 246,
  },
  {
    CityID: 247,
    name: '遵义市',
    ProID: 29,
    CitySort: 247,
  },
  {
    CityID: 248,
    name: '安顺市',
    ProID: 29,
    CitySort: 248,
  },
  {
    CityID: 249,
    name: '黔南布依族苗族自治州',
    ProID: 29,
    CitySort: 249,
  },
  {
    CityID: 250,
    name: '黔东南苗族侗族自治州',
    ProID: 29,
    CitySort: 250,
  },
  {
    CityID: 251,
    name: '铜仁地区',
    ProID: 29,
    CitySort: 251,
  },
  {
    CityID: 252,
    name: '毕节地区',
    ProID: 29,
    CitySort: 252,
  },
  {
    CityID: 253,
    name: '六盘水市',
    ProID: 29,
    CitySort: 253,
  },
  {
    CityID: 254,
    name: '黔西南布依族苗族自治州',
    ProID: 29,
    CitySort: 254,
  },
  {
    CityID: 255,
    name: '海口市',
    ProID: 20,
    CitySort: 255,
  },
  {
    CityID: 256,
    name: '三亚市',
    ProID: 20,
    CitySort: 256,
  },
  {
    CityID: 257,
    name: '五指山市',
    ProID: 20,
    CitySort: 257,
  },
  {
    CityID: 258,
    name: '琼海市',
    ProID: 20,
    CitySort: 258,
  },
  {
    CityID: 259,
    name: '儋州市',
    ProID: 20,
    CitySort: 259,
  },
  {
    CityID: 260,
    name: '文昌市',
    ProID: 20,
    CitySort: 260,
  },
  {
    CityID: 261,
    name: '万宁市',
    ProID: 20,
    CitySort: 261,
  },
  {
    CityID: 262,
    name: '东方市',
    ProID: 20,
    CitySort: 262,
  },
  {
    CityID: 263,
    name: '澄迈县',
    ProID: 20,
    CitySort: 263,
  },
  {
    CityID: 264,
    name: '定安县',
    ProID: 20,
    CitySort: 264,
  },
  {
    CityID: 265,
    name: '屯昌县',
    ProID: 20,
    CitySort: 265,
  },
  {
    CityID: 266,
    name: '临高县',
    ProID: 20,
    CitySort: 266,
  },
  {
    CityID: 267,
    name: '白沙黎族自治县',
    ProID: 20,
    CitySort: 267,
  },
  {
    CityID: 268,
    name: '昌江黎族自治县',
    ProID: 20,
    CitySort: 268,
  },
  {
    CityID: 269,
    name: '乐东黎族自治县',
    ProID: 20,
    CitySort: 269,
  },
  {
    CityID: 270,
    name: '陵水黎族自治县',
    ProID: 20,
    CitySort: 270,
  },
  {
    CityID: 271,
    name: '保亭黎族苗族自治县',
    ProID: 20,
    CitySort: 271,
  },
  {
    CityID: 272,
    name: '琼中黎族苗族自治县',
    ProID: 20,
    CitySort: 272,
  },
  {
    CityID: 273,
    name: '西双版纳傣族自治州',
    ProID: 30,
    CitySort: 273,
  },
  {
    CityID: 274,
    name: '德宏傣族景颇族自治州',
    ProID: 30,
    CitySort: 274,
  },
  {
    CityID: 275,
    name: '昭通市',
    ProID: 30,
    CitySort: 275,
  },
  {
    CityID: 276,
    name: '昆明市',
    ProID: 30,
    CitySort: 276,
  },
  {
    CityID: 277,
    name: '大理白族自治州',
    ProID: 30,
    CitySort: 277,
  },
  {
    CityID: 278,
    name: '红河哈尼族彝族自治州',
    ProID: 30,
    CitySort: 278,
  },
  {
    CityID: 279,
    name: '曲靖市',
    ProID: 30,
    CitySort: 279,
  },
  {
    CityID: 280,
    name: '保山市',
    ProID: 30,
    CitySort: 280,
  },
  {
    CityID: 281,
    name: '文山壮族苗族自治州',
    ProID: 30,
    CitySort: 281,
  },
  {
    CityID: 282,
    name: '玉溪市',
    ProID: 30,
    CitySort: 282,
  },
  {
    CityID: 283,
    name: '楚雄彝族自治州',
    ProID: 30,
    CitySort: 283,
  },
  {
    CityID: 284,
    name: '普洱市',
    ProID: 30,
    CitySort: 284,
  },
  {
    CityID: 285,
    name: '临沧市',
    ProID: 30,
    CitySort: 285,
  },
  {
    CityID: 286,
    name: '怒江傈傈族自治州',
    ProID: 30,
    CitySort: 286,
  },
  {
    CityID: 287,
    name: '迪庆藏族自治州',
    ProID: 30,
    CitySort: 287,
  },
  {
    CityID: 288,
    name: '丽江市',
    ProID: 30,
    CitySort: 288,
  },
  {
    CityID: 289,
    name: '海北藏族自治州',
    ProID: 25,
    CitySort: 289,
  },
  {
    CityID: 290,
    name: '西宁市',
    ProID: 25,
    CitySort: 290,
  },
  {
    CityID: 291,
    name: '海东地区',
    ProID: 25,
    CitySort: 291,
  },
  {
    CityID: 292,
    name: '黄南藏族自治州',
    ProID: 25,
    CitySort: 292,
  },
  {
    CityID: 293,
    name: '海南藏族自治州',
    ProID: 25,
    CitySort: 293,
  },
  {
    CityID: 294,
    name: '果洛藏族自治州',
    ProID: 25,
    CitySort: 294,
  },
  {
    CityID: 295,
    name: '玉树藏族自治州',
    ProID: 25,
    CitySort: 295,
  },
  {
    CityID: 296,
    name: '海西蒙古族藏族自治州',
    ProID: 25,
    CitySort: 296,
  },
  {
    CityID: 297,
    name: '西安市',
    ProID: 23,
    CitySort: 297,
  },
  {
    CityID: 298,
    name: '咸阳市',
    ProID: 23,
    CitySort: 298,
  },
  {
    CityID: 299,
    name: '延安市',
    ProID: 23,
    CitySort: 299,
  },
  {
    CityID: 300,
    name: '榆林市',
    ProID: 23,
    CitySort: 300,
  },
  {
    CityID: 301,
    name: '渭南市',
    ProID: 23,
    CitySort: 301,
  },
  {
    CityID: 302,
    name: '商洛市',
    ProID: 23,
    CitySort: 302,
  },
  {
    CityID: 303,
    name: '安康市',
    ProID: 23,
    CitySort: 303,
  },
  {
    CityID: 304,
    name: '汉中市',
    ProID: 23,
    CitySort: 304,
  },
  {
    CityID: 305,
    name: '宝鸡市',
    ProID: 23,
    CitySort: 305,
  },
  {
    CityID: 306,
    name: '铜川市',
    ProID: 23,
    CitySort: 306,
  },
  {
    CityID: 307,
    name: '防城港市',
    ProID: 21,
    CitySort: 307,
  },
  {
    CityID: 308,
    name: '南宁市',
    ProID: 21,
    CitySort: 308,
  },
  {
    CityID: 309,
    name: '崇左市',
    ProID: 21,
    CitySort: 309,
  },
  {
    CityID: 310,
    name: '来宾市',
    ProID: 21,
    CitySort: 310,
  },
  {
    CityID: 311,
    name: '柳州市',
    ProID: 21,
    CitySort: 311,
  },
  {
    CityID: 312,
    name: '桂林市',
    ProID: 21,
    CitySort: 312,
  },
  {
    CityID: 313,
    name: '梧州市',
    ProID: 21,
    CitySort: 313,
  },
  {
    CityID: 314,
    name: '贺州市',
    ProID: 21,
    CitySort: 314,
  },
  {
    CityID: 315,
    name: '贵港市',
    ProID: 21,
    CitySort: 315,
  },
  {
    CityID: 316,
    name: '玉林市',
    ProID: 21,
    CitySort: 316,
  },
  {
    CityID: 317,
    name: '百色市',
    ProID: 21,
    CitySort: 317,
  },
  {
    CityID: 318,
    name: '钦州市',
    ProID: 21,
    CitySort: 318,
  },
  {
    CityID: 319,
    name: '河池市',
    ProID: 21,
    CitySort: 319,
  },
  {
    CityID: 320,
    name: '北海市',
    ProID: 21,
    CitySort: 320,
  },
  {
    CityID: 321,
    name: '拉萨市',
    ProID: 31,
    CitySort: 321,
  },
  {
    CityID: 322,
    name: '日喀则地区',
    ProID: 31,
    CitySort: 322,
  },
  {
    CityID: 323,
    name: '山南地区',
    ProID: 31,
    CitySort: 323,
  },
  {
    CityID: 324,
    name: '林芝地区',
    ProID: 31,
    CitySort: 324,
  },
  {
    CityID: 325,
    name: '昌都地区',
    ProID: 31,
    CitySort: 325,
  },
  {
    CityID: 326,
    name: '那曲地区',
    ProID: 31,
    CitySort: 326,
  },
  {
    CityID: 327,
    name: '阿里地区',
    ProID: 31,
    CitySort: 327,
  },
  {
    CityID: 328,
    name: '银川市',
    ProID: 26,
    CitySort: 328,
  },
  {
    CityID: 329,
    name: '石嘴山市',
    ProID: 26,
    CitySort: 329,
  },
  {
    CityID: 330,
    name: '吴忠市',
    ProID: 26,
    CitySort: 330,
  },
  {
    CityID: 331,
    name: '固原市',
    ProID: 26,
    CitySort: 331,
  },
  {
    CityID: 332,
    name: '中卫市',
    ProID: 26,
    CitySort: 332,
  },
  {
    CityID: 333,
    name: '塔城地区',
    ProID: 24,
    CitySort: 333,
  },
  {
    CityID: 334,
    name: '哈密地区',
    ProID: 24,
    CitySort: 334,
  },
  {
    CityID: 335,
    name: '和田地区',
    ProID: 24,
    CitySort: 335,
  },
  {
    CityID: 336,
    name: '阿勒泰地区',
    ProID: 24,
    CitySort: 336,
  },
  {
    CityID: 337,
    name: '克孜勒苏柯尔克孜自治州',
    ProID: 24,
    CitySort: 337,
  },
  {
    CityID: 338,
    name: '博尔塔拉蒙古自治州',
    ProID: 24,
    CitySort: 338,
  },
  {
    CityID: 339,
    name: '克拉玛依市',
    ProID: 24,
    CitySort: 339,
  },
  {
    CityID: 340,
    name: '乌鲁木齐市',
    ProID: 24,
    CitySort: 340,
  },
  {
    CityID: 341,
    name: '石河子市',
    ProID: 24,
    CitySort: 341,
  },
  {
    CityID: 342,
    name: '昌吉回族自治州',
    ProID: 24,
    CitySort: 342,
  },
  {
    CityID: 343,
    name: '五家渠市',
    ProID: 24,
    CitySort: 343,
  },
  {
    CityID: 344,
    name: '吐鲁番地区',
    ProID: 24,
    CitySort: 344,
  },
  {
    CityID: 345,
    name: '巴音郭楞蒙古自治州',
    ProID: 24,
    CitySort: 345,
  },
  {
    CityID: 346,
    name: '阿克苏地区',
    ProID: 24,
    CitySort: 346,
  },
  {
    CityID: 347,
    name: '阿拉尔市',
    ProID: 24,
    CitySort: 347,
  },
  {
    CityID: 348,
    name: '喀什地区',
    ProID: 24,
    CitySort: 348,
  },
  {
    CityID: 349,
    name: '图木舒克市',
    ProID: 24,
    CitySort: 349,
  },
  {
    CityID: 350,
    name: '伊犁哈萨克自治州',
    ProID: 24,
    CitySort: 350,
  },
  {
    CityID: 351,
    name: '呼伦贝尔市',
    ProID: 5,
    CitySort: 351,
  },
  {
    CityID: 352,
    name: '呼和浩特市',
    ProID: 5,
    CitySort: 352,
  },
  {
    CityID: 353,
    name: '包头市',
    ProID: 5,
    CitySort: 353,
  },
  {
    CityID: 354,
    name: '乌海市',
    ProID: 5,
    CitySort: 354,
  },
  {
    CityID: 355,
    name: '乌兰察布市',
    ProID: 5,
    CitySort: 355,
  },
  {
    CityID: 356,
    name: '通辽市',
    ProID: 5,
    CitySort: 356,
  },
  {
    CityID: 357,
    name: '赤峰市',
    ProID: 5,
    CitySort: 357,
  },
  {
    CityID: 358,
    name: '鄂尔多斯市',
    ProID: 5,
    CitySort: 358,
  },
  {
    CityID: 359,
    name: '巴彦淖尔市',
    ProID: 5,
    CitySort: 359,
  },
  {
    CityID: 360,
    name: '锡林郭勒盟',
    ProID: 5,
    CitySort: 360,
  },
  {
    CityID: 361,
    name: '兴安盟',
    ProID: 5,
    CitySort: 361,
  },
  {
    CityID: 362,
    name: '阿拉善盟',
    ProID: 5,
    CitySort: 362,
  },
  {
    CityID: 363,
    name: '台北市',
    ProID: 32,
    CitySort: 363,
  },
  {
    CityID: 364,
    name: '高雄市',
    ProID: 32,
    CitySort: 364,
  },
  {
    CityID: 365,
    name: '基隆市',
    ProID: 32,
    CitySort: 365,
  },
  {
    CityID: 366,
    name: '台中市',
    ProID: 32,
    CitySort: 366,
  },
  {
    CityID: 367,
    name: '台南市',
    ProID: 32,
    CitySort: 367,
  },
  {
    CityID: 368,
    name: '新竹市',
    ProID: 32,
    CitySort: 368,
  },
  {
    CityID: 369,
    name: '嘉义市',
    ProID: 32,
    CitySort: 369,
  },
  {
    CityID: 370,
    name: '澳门特别行政区',
    ProID: 33,
    CitySort: 370,
  },
  {
    CityID: 371,
    name: '香港特别行政区',
    ProID: 34,
    CitySort: 371,
  },
]

export default {
  props: {
    text: String,
  },
  data() {
    return {
      shenfeng,
      allcity,
      data: [],
      oneaddressdata: {},
      oneselldata: {},
      fileExcleList: [],
      allgoodssizedata: [],
      fileList: [],
      fileListlunbo: [],
      changshanglist: [],
      allcitydata: [],
      errordetail: [],
      nopicturedata: [],
      file: undefined,
      errorcolumns,
      visible: false,
      ifdaorugoods: false,
      ifdaorutupian: false,
      hadleEditallsize: false,
      ifaddunitdata: false,
      ifchuxianguige: false,
      ifaddguige: false,
      failecailiaodaoru: false,
      faileguigedaoru: false,
      columns1,
      thatid: '',
      oldname: '',
      // baseURL: 'http://localhost:8085/api',
      baseURL: 'http://8.136.103.102:8088/api',
      // baseURL:"http://47.103.34.184:8085/api",
      historyColumns,
      detailcolumns,
      ifshowhistory: false,
      historydata: [],
      spinning: false,
      keywords: '',
    }
  },
  created() {},
  mounted() {
    const that = this
    this.shenfeng.forEach((item) => {
      item.children = []
      item.value = item.name
      item.label = item.name
      this.allcity.forEach((element) => {
        element.value = element.name
        element.label = element.name
        if (item.ProID == element.ProID) {
          item.children.push(element)
        }
      })
    })
    this.allcitydata = this.shenfeng
    that.getAllSellingDataListpage()
  },
  methods: {
    onChange(value) {
      const that = this
      if (value.length > 0) {
        that.oneselldata.city = value[1]
      } else {
        that.oneselldata.city = ''
      }
    },
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出厂商列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllSellingDataListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['厂商编号', '厂商名称', '创建时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.shop_warehouse_id == null ? '' : element.shop_warehouse_id,
                    element.shop_warehouse_name == null ? '' : element.shop_warehouse_name,
                    element.warehouse_classify_creatime == null
                      ? ''
                      : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.warehouse_classify_creatime)),
                  ]
                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '厂商列表')
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
    importFile() {
      const that = this
      that.errordetail = []
      if (that.fileExcleList.length > 1 || that.fileExcleList.length == 0) {
        that.$message.error('请上传单个Excel表格!')
        return
      }
      if (
        that.fileExcleList[0].type != 'application/vnd.ms-excel' &&
        that.fileExcleList[0].type != 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ) {
        that.$message.error('只接受xls,xlsx格式的Excel格式文件')
        that.fileExcleList.splice(0, that.fileExcleList.length)
        that.file = undefined
        return
      } else {
        that.file = that.fileExcleList[0]
        that.fileExcleList.splice(that.fileExcleList.length - 2, that.fileExcleList.length - 1)
      }
      this.spinning = true
      var f = this.file
      var reader = new FileReader()
      let $t = this
      reader.onload = function (e) {
        var data = e.target.result
        if ($t.rABS) {
          $t.wb = XLSX.read(btoa(this.fixdata(data)), {
            // 手动转化
            type: 'base64',
          })
        } else {
          $t.wb = XLSX.read(data, {
            type: 'binary',
          })
        }
        let json = XLSX.utils.sheet_to_json($t.wb.Sheets[$t.wb.SheetNames[0]]) //材料列表
        let json1 = XLSX.utils.sheet_to_json($t.wb.Sheets[$t.wb.SheetNames[1]]) //材料规格列表

        if (json.length == 0) {
          this.ifdaorugoods = false
          this.file = undefined
          this.fileExcleList = []
          that.failecailiaodaoru = true
          that.$message.error('抱歉,sheet1表中数据为空,请重新尝试!')
        } else {
          $t.dealFile($t.analyzeData(json)) // analyzeData: 解析导入数据
        }

        if (json1.length == 0) {
          this.ifdaorugoods = false
          this.file = undefined
          this.fileExcleList = []
          that.faileguigedaoru = false
          that.$message.error('抱歉,sheet2表中数据为空,请重新尝试!')
        } else {
          $t.dealguigeFile($t.analyzeData(json1)) // analyzeData: 解析导入数据
        }

        setTimeout(() => {
          if (!that.failecailiaodaoru && !that.faileguigedaoru) {
            addalldata()
          }
        }, 3000)

        function addalldata() {
          that.changshanglist.forEach((item) => {
            item.dizhidetail = []
            that.changshangdizhilist.forEach((element) => {
              if (item.shop_warehouse_name == element.shop_warehouse_name) {
                item.dizhidetail.push(element)
              }
            })
          })
          that.spinning = false
          console.log('需要导入的厂商信息')
          console.log(that.changshanglist)

          if (that.nopicturedata.length > 0) {
            that.spinning = false
            that.$confirm({
              title: '有' + that.nopicturedata.length + '个材料图片不存在，是否继续导入材料',
              okText: '继续',
              okType: 'danger',
              centered: true,
              cancelText: '取消',
              onOk: () => {
                that.spinning = true
                console.log('OK')
                that.daorucailiaodata()
              },
              onCancel() {
                console.log('Cancel')
                that.changshanglist = []
              },
            })
          } else {
            that.daorucailiaodata()
          }
        }
      }

      if (this.rABS) {
        reader.readAsArrayBuffer(f)
      } else {
        reader.readAsBinaryString(f)
      }
    },
    daorucailiaodata() {
      const that = this
      var formdata = {}
      formdata.changshanglist = JSON.stringify(that.changshanglist)
      formdata.myid = that.$store.state.admin.user_id
      that
        .$request({
          url: '/user/addAllSellingdata',
          method: 'post',
          data: formdata,
        })
        .then((res) => {
          if (res.status == 200) {
            that.fileExcleList = []
            that.fileListlunbo = []
            that.ifdaorugoods = false
            that.spinning = false
            that.failecailiaodaoru = false
            that.faileguigedaoru = false
            that.getAllSellingDataListpage()
            that.$message.success('导入信息成功!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,导入材料信息失败,请重新尝试!')
          return
        })
    },
    dealFile: function (data) {
      const that = this
      var list = []
      var flag = true
      var kongzhi = 0
      data.forEach((element) => {
        kongzhi++
        if (!element.close) {
          var st = true
          var str = {}
          if (element['厂商名称'] && element['所在城市']) {
            for (var i in element) {
              str[that.Englishname(i)] = (element[i] + '').trim()
              console.log(str)
            }
            list.push(str)
          } else {
            flag = false
          }
        }
      })

      if (data.length <= 0) {
        that.$message.error('请导入正确数据!')
        that.failecailiaodaoru = true
        return
      } else {
        if (!flag) {
          that.spinning = false
          that.failecailiaodaoru = true
          that.$message.error('第' + kongzhi + '行厂商名称/所在城市不能为空,请重新填写excel')
          var data = { error: '第' + kongzhi + '行厂商名称/所在城市不能为空,请重新填写excel' }
          that.errordetail.push(data)
          return
        }
        setTimeout(() => {
          adds()
        }, 100)

        function adds() {
          var newlist = []
          var nodui = 0
          list.forEach((element) => {
            nodui++
            var goods = {}
            goods.shop_warehouse_name = element.shop_warehouse_name
            if (element.linkadress == null || element.linkadress == '') {
              that.nopicturedata.push({ number: '1' })
            }
            goods.city = element.city
            goods.linkadress = element.linkadress.splice(5)
            newlist.push(goods)
          })
          that.changshanglist = newlist
          return
        }
      }
    },

    dealguigeFile: function (data) {
      const that = this
      var list = []
      var list1 = []
      var flag = true
      var flag1 = true
      var kongming = 1
      var kongming1 = 0
      var kongming2 = 0

      data.forEach((element) => {
        kongming++
        if (!element.close) {
          var st = true
          var str = {}
          if (element['厂商名称']) {
            for (var i in element) {
              str[that.Englishname(i)] = (element[i] + '').trim()
            }
            list.push(str)
          } else {
            kongming1 = kongming
            flag = false
          }
          if (element['厂商地址名称']) {
            for (var i in element) {
              str[that.Englishname(i)] = (element[i] + '').trim()
            }
            list1.push(str)
          } else {
            kongming2 = kongming
            flag1 = false
          }
        }
      })

      if (data.length <= 0) {
        that.$message.error('请导入正确数据!')
        that.faileguigedaoru = true
        return
      } else {
        if (!flag1) {
          that.spinning = false
          that.faileguigedaoru = true
          that.$message.error('第' + kongming1 + '行厂商名称不能为空,请重新填写excel')
          var data = { error: '第' + kongming1 + '行厂商名称不能为空,请重新填写excel' }
          that.errordetail.push(data)
          return
        }

        if (!flag) {
          that.spinning = false
          that.faileguigedaoru = true
          that.$message.error('第' + kongming2 + '行厂商地址名称不能为空,请重新填写excel')
          var data = { error: '第' + kongming2 + '行厂商地址名称不能为空,请重新填写excel' }
          that.errordetail.push(data)
          return
        }

        var newlist = []
        var nodui = 0
        list.forEach((element) => {
          nodui++
          var goods = {}
          goods.shop_warehouse_name = element.shop_warehouse_name
          goods.warehouse_classify_name = element.warehouse_classify_name
          newlist.push(goods)
        })

        that.changshangdizhilist = newlist
        return
      }
    },
    analyzeData: function (data) {
      // 此处可以解析导入数据
      return data
    },
    Englishname(name) {
      var title = ''
      switch (name) {
        case '相关图片文件名开头':
          title = 'linkadress'
          break
        case '厂商名称':
          title = 'shop_warehouse_name'
          break
        case '厂商地址名称':
          title = 'warehouse_classify_name'
          break
        case '所在城市':
          title = 'city'
          break
      }
      return title
    },
    _export() {
      //需要导出的JSON数据

      const data = {
        厂商列表: this.baseData(),

        厂商地址列表: this.history1(),
      }

      let columnHeaders = {
        厂商列表: {
          data0: '厂商名称',
          data1: '所在城市',
          data2: '相关图片文件名开头',
        },

        厂商地址列表: {
          extra: '厂商名称',

          data0: '厂商地址名称',
        },
      }

      let wscols = [
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
      ] //设置字段宽度

      let sheetNames = []

      let sheetsList = {}

      const wb = XLSX.utils.book_new()

      for (let key in data) {
        sheetNames.push(key)

        let columnHeader = columnHeaders[key] // 此处是每个sheet的表头

        let temp = this.transferData(data[key], columnHeader)

        sheetsList[key] = XLSX.utils.aoa_to_sheet(temp)

        sheetsList[key]['!cols'] = wscols
      }

      wb['SheetNames'] = sheetNames

      wb['Sheets'] = sheetsList

      XLSX.writeFile(wb, '厂商模板.xlsx')
    },

    transferData(data, columnHeader) {
      let content = [],
        header = []

      for (let i in columnHeader) {
        header.push(columnHeader[i])
      }

      content.push(header)

      data.forEach((item, index) => {
        let arr = []

        for (let i in columnHeader) {
          arr.push(item[i])
        }

        content.push(arr)
      })

      return content
    },

    baseData() {
      return [
        {
          data0: '浦东总仓',
          data1: '上海市',
          data2: 'pudongzongcang',
        },
      ]
    },

    history1() {
      return [
        {
          extra: '浦东总仓',
          data0: '浦东区100弄',
        },
      ]
    },
    displayRender({ labels }) {
      return labels[labels.length - 1]
    },
    importtupian() {
      const that = this
      that.spinning = true
      if (that.fileListlunbo.length > 0) {
        that.fileListlunbo.forEach((item) => {
          const formData = new FormData()
          formData.append('picture', item)
          this.$request({
            url: this.baseURL + '/pub/aliuploadImg2',
            method: 'post',
            data: formData,
          })
            .then((res) => {
              if (res.code == 0) {
                if (item == that.fileListlunbo[that.fileListlunbo.length - 1]) {
                  that.spinning = false
                  if (that.errordetail.length == 0) {
                    that.ifdaorutupian = false
                    that.fileListlunbo = []
                    that.$message.success('导入全部图片成功!')
                  } else {
                    that.fileListlunbo = []
                    that.$message.warning('导入部分图片成功,请讲没有导入的图片重新整理导入!')
                  }
                }
              }
            })
            .catch(function () {
              var fileName = item.name
              that.errordetail.push({ error: '抱歉，图片:' + fileName + '导入失败，请重新导入该图片' })
            })
        })
      }
    },
    beforeUploadlunbo(file) {
      this.fileListlunbo = [...this.fileListlunbo, file]

      return false
    },
    handleRemovelunbo(file) {
      const index = this.fileListlunbo.indexOf(file)
      const newFileList = this.fileListlunbo.slice()
      newFileList.splice(index, 1)
      this.fileListlunbo = newFileList
    },
    beforeUploadexcel(file) {
      const that = this
      this.fileExcleList = [...this.fileExcleList, file]
    },
    handleRemove(file) {
      const index = this.fileExcleList.indexOf(file)
      const newFileList = this.fileExcleList.slice()
      newFileList.splice(index, 1)
      this.fileExcleList = newFileList
    },
    handleRemovefengmian(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    beforeUploadfengmian(file) {
      this.fileList = [...this.fileList, file]
      return false
    },
    addaddress() {
      const that = this
      that.ifchuxianguige = true
      that.ifaddguige = true
    },
    handleOkaddress() {
      const that = this
      if (that.oneaddressdata.warehouse_classify_name == '' || that.oneaddressdata.warehouse_classify_name == null) {
        this.$message.warning('厂商地址信息不能为空!')
        return
      }
      that.oneaddressdata.bills_type = 'GoodsSellingAddressMange'
      that.oneaddressdata.myid = that.$store.state.admin.user_id
      that.oneaddressdata.shop_warehouse_id = that.thatid
      if (that.ifaddguige) {
        that.spinning = true
        this.$request({
          url: '/user/addsellingAddressdata',
          method: 'get',
          params: that.oneaddressdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.ifchuxianguige = false
              that.oneaddressdata = {}
              that.getAllSAddressdata()
              that.$message.success('新增成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.oneaddressdata.oldname = that.oldname
        that.spinning = true
        this.$request({
          url: '/user/updatesellingAddressdatabyid',
          method: 'get',
          params: that.oneaddressdata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.oldname = ''
              that.ifchuxianguige = false
              that.oneaddressdata = {}
              that.getAllSAddressdata()
              that.$message.success('更新成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },
    xiugaiaddress(e) {
      const that = this
      that.ifchuxianguige = true
      that.ifaddguige = false
      that.oldname = e.warehouse_classify_name
      that.oneaddressdata = e
    },
    shanchuaddress(e) {
      const that = this
      this.$confirm({
        title: '是否确定删除该厂商地址信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdata = {}
          formdata.bills_type = 'GoodsSellingAddressMange'
          formdata.myid = that.$store.state.admin.user_id
          formdata.id = e.warehouse_classify_id
          formdata.warehouse_classify_name = e.warehouse_classify_name
          that.spinning = true
          this.$request({
            url: '/user/deletesellingAddressdatabyid',
            method: 'get',
            params: formdata,
          })
            .then((res) => {
              if (res.status == 200) {
                that.spinning = false
                that.ifchuxianguige = false
                that.getAllSAddressdata()
                that.$message.success('删除信息成功')
              } else if (res.status == 201) {
                that.spinning = false
                that.$message.error('抱歉,该厂商已被使用无法删除!')
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
    getAllSAddressdata() {
      const that = this
      var formdate = {}
      formdate.id = that.thatid
      this.$request({
        url: '/user/getAllSellingAddressListpage',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.allgoodssizedata = res.data
            that.hadleEditallsize = true
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleAddress(e) {
      const that = this
      that.thatid = e.shop_warehouse_id
      var formdate = {}
      formdate.id = e.shop_warehouse_id
      this.$request({
        url: '/user/getAllSellingAddressListpage',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.allgoodssizedata = res.data
            that.hadleEditallsize = true
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    showhistory1(e) {
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'GoodsSellingAddressMange'
      formdate.id = e.warehouse_classify_id
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
    showhistory(e) {
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'GoodsSellingMange'
      formdate.id = e.shop_warehouse_id
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
    handleOk() {
      const that = this
      if (that.oneselldata.shop_warehouse_name == '' || that.oneselldata.shop_warehouse_name == null) {
        this.$message.warning('厂商名称不能为空!')
        return
      }
      if (that.oneselldata.city == '' || that.oneselldata.city == null) {
        this.$message.warning('厂商所在城市不能为空!')
        return
      }
      if (this.fileList.length > 1) {
        that.$message.error('抱歉,厂商封面只能放一张图片!')
        return
      }
      var goodspricture = []
      var nogoodspricture = []

      if (this.fileList.length > 0) {
        this.fileList.forEach((item) => {
          if (item instanceof File) {
            goodspricture.push(item)
          } else {
            nogoodspricture.push(item.url)
          }
        })
      }
      that.spinning = true
      if (goodspricture.length > 0) {
        const formData = new FormData()
        formData.append('picture', goodspricture[0])
        this.$request({
          url: this.baseURL + '/pub/aliuploadImg3',
          method: 'post',
          data: formData,
        })
          .then((res) => {
            if (res.code == 0) {
              that.oneselldata.shop_warehouse_manupicture = res.data.objectKey
              this.asww()
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.warning('厂商头像上传失败，请重新尝试上传!')
            return
          })
      } else {
        if (nogoodspricture.length > 0) {
          that.oneselldata.shop_warehouse_manupicture = nogoodspricture[0]
        } else {
          that.oneselldata.shop_warehouse_manupicture = null
        }
        this.asww()
      }
    },
    asww() {
      const that = this
      that.oneselldata.bills_type = 'GoodsSellingMange'
      that.oneselldata.myid = that.$store.state.admin.user_id
      if (that.ifaddunitdata) {
        this.$request({
          url: '/user/addsellingdata',
          method: 'get',
          params: that.oneselldata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.oneselldata = {}
              that.getAllSellingDataListpage()
              that.$message.success('新增成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.oneselldata.oldname = that.oldname
        that.spinning = true
        this.$request({
          url: '/user/updatesellingdatabyid',
          method: 'get',
          params: that.oneselldata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.oldname = ''
              that.oneselldata = {}
              that.getAllSellingDataListpage()
              that.$message.success('更新成功')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },
    handleEdit(e) {
      const that = this
      console.log(e)
      that.visible = true
      that.ifaddunitdata = false
      that.oneselldata = e
      that.oldname = e.shop_warehouse_name
      that.fileList = []
      if (e.shop_warehouse_manupicture != null) {
        that.fileList.push({
          uid: '-1',
          name: e.shop_warehouse_manupicture,
          url: e.shop_warehouse_manupicture,
        })
      }
    },
    handledelete(e) {
      const that = this
      this.$confirm({
        title: '是否确定删除该厂商信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdata = {}
          formdata.bills_type = 'GoodsSellingMange'
          formdata.myid = that.$store.state.admin.user_id
          formdata.id = e.shop_warehouse_id
          formdata.shop_warehouse_name = e.shop_warehouse_name
          that.spinning = true
          this.$request({
            url: '/user/deletesellingdatabyid',
            method: 'get',
            params: formdata,
          })
            .then((res) => {
              if (res.status == 200) {
                that.spinning = false
                that.visible = false
                that.getAllSellingDataListpage()
                that.$message.success('删除信息成功')
              } else if (res.status == 201) {
                that.spinning = false
                that.$message.error('抱歉,该厂商已被使用无法删除!')
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
      that.getAllSellingDataListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllSellingDataListpage()
    },
    getAllSellingDataListpage() {
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
          url: '/user/getAllSellingDataListpage',
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
