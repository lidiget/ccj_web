<template>
  <a-card style="margin-top: 24px" :bordered="false">
    订单关键字：
    <a-input-search style="margin-right: 30px; width: 272px; margin-bottom: 16px" v-model="keywords" />
    <!-- 订单类型:
    <a-select
      style="width: 130px; margin-left: 8px; margin-right: 16px"
      show-search
      placeholder="订单类型"
      option-filter-prop="children"
      v-model="ordertype"
    >
      <a-select-option :value="1"> 材料订单 </a-select-option>
      <a-select-option :value="2"> 人工订单 </a-select-option>
    </a-select> -->
    请选择时间：
    <a-range-picker style="margin-left: 8px; margin-right: 16px" @change="onChange" size="default" :locale="locale">
    </a-range-picker>
    选择用户:
    <a-select
      placeholder="选择用户"
      option-filter-prop="children"
      style="width: 160px; margin-left: 16px; margin-right: 30px"
      v-model="userid"
      show-search
      allowClear
    >
      <a-select-option v-for="(items, index) in alluser" :key="index" :label="items.user_name" :value="items.user_id">{{
        items.user_name
      }}</a-select-option>
    </a-select>
    订单状态:
    <a-select
      style="width: 160px; margin-left: 8px; margin-right: 16px"
      show-search
      placeholder="订单状态"
      option-filter-prop="children"
      allowClear
      v-model="orderstatus"
    >
      <a-select-option :value="1"> 待付款 </a-select-option>
      <a-select-option :value="2"> 待发货 </a-select-option>
      <a-select-option :value="3"> 待收货 </a-select-option>
      <a-select-option :value="4"> 已完成 </a-select-option>
      <!-- <a-select-option :value="5"> 已完成 </a-select-option> -->
      <a-select-option :value="9"> 已取消 </a-select-option>
    </a-select>
    是否开单:
    <a-select
      style="width: 160px; margin-left: 8px"
      show-search
      placeholder="开票状态"
      option-filter-prop="children"
      allowClear
      v-model="status"
    >
      <a-select-option :value="0"> 未开 </a-select-option>
      <a-select-option :value="1"> 审核中 </a-select-option>
      <a-select-option :value="2"> 已开 </a-select-option>
      <a-select-option :value="3"> 驳回 </a-select-option>
    </a-select>
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      @click="piliangfahuo"
      :loading="spinning"
      v-if="$store.state.rights[2].children[0].children[0].edit == 1"
    >
      批量发货
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
      v-if="$store.state.rights[2].children[0].children[0].import == 1"
    >
      导出订单列表
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
        <a-table
          :pagination="{ defaultPageSize: 999, hideOnSinglePage: true }"
          :columns="innerColumns"
          slot="expandedRowRender"
          slot-scope="data"
          :dataSource="data.groupItem"
          :rowKey="(item) => item.order_info_id"
          :locale="{ emptyText: '暂无数据' }"
        >
          <template slot="order_info_payment" slot-scope="text">{{
            text == 'wxpay' ? '微信支付' : '余额'
          }}</template>
          <template slot="order_info_creatime" slot-scope="text">
            {{ text | dayjs }}
          </template>
        </a-table>
        <template slot="lirun" slot-scope="text">{{ (text = Number(text).toFixed(2)) }}</template>

        <template slot="order_info_voicsta" slot-scope="text">
          {{ text == 0 ? '未开票' : text == 1 ? '审核中' : text == 2 ? '已开票' : '驳回' }}
        </template>
        <template slot="order_info_status" slot-scope="text">
          <a-badge
            :status="
              text == 1 ? 'default' : text == 2 ? 'warning' : text == 3 ? 'warning' : text == 4 ? 'success' : 'error'
            "
          />
          {{ text == 1 ? '待付款' : text == 2 ? '待发货' : text == 3 ? '待收货' : text == 4 ? '已完成' : '已取消' }}
        </template>

        <template slot="title"> 全部订单列表 </template>
        <template slot="title">
          <div>
            当前列表全部订单总价：{{ Number(this.allordermoney).toFixed(2) }}，当前列表全部订单未付款金额：{{
              Number(this.allweifukuanmoney).toFixed(2)
            }}，当前列表全部订单已付款金额：{{ Number(this.allyifukuanmoney).toFixed(2) }}
          </div>
        </template>

        <span slot="action" slot-scope="text, record">
          <template>
            <a @click="handleEdit(record)">查看详情</a>
            <a-divider type="vertical" v-if="$store.state.rights[2].children[0].children[0].edit == 1" />
          </template>
          <a-dropdown v-if="$store.state.rights[2].children[0].children[0].edit == 1">
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.order_info_status == 2">
                <a href="javascript:;" @click="changeorder(record, (changetype = 3))">发货</a>
              </a-menu-item>
              <!-- <a-menu-item v-if="record.order_info_status == 3">
                <a href="javascript:;" @click="changeorder(record, (changetype = 4))">送达</a>
              </a-menu-item> -->
              <a-menu-item v-if="record.order_info_status == 3 || record.order_info_status == 4">
                <a href="javascript:;" @click="wuliuxinx(record)">物流信息</a>
              </a-menu-item>
              <a-menu-item v-if="record.order_info_status == 3 || record.order_info_status == 4">
                <a href="javascript:;" @click="yunfeijilu(record)">实际运费记录</a>
              </a-menu-item>
              <a-menu-item
                v-if="record.order_info_status == 1 || record.order_info_status == 2 || record.order_info_status == 3"
              >
                <a href="javascript:;" @click="changeorder(record, (changetype = 4))">强制完成</a>
              </a-menu-item>
              <a-menu-item
                v-if="record.order_info_status == 1 || record.order_info_status == 2 || record.order_info_status == 3"
              >
                <a href="javascript:;" @click="changeorder(record, (changetype = 9))">取消订单</a>
              </a-menu-item>
              <!-- <a-menu-item v-if="record.order_info_voicsta == '0'">
                <a href="javascript:;" @click="changekaipiao(record, (changetype = 9))">申请开票</a>
              </a-menu-item> -->
              <a-menu-item v-if="record.order_info_status == 1 && ordertype == 2">
                <a href="javascript:;" @click="shoukuan(record)">收款</a>
              </a-menu-item>
              <a-menu-item v-if="record.order_info_status == 1 && ordertype == 2 && record.shenhestatus == '5'">
                <a href="javascript:;" @click="dazhe(record)">打折申请</a>
              </a-menu-item>
              <!-- <a-menu-item
                v-if="
                  record.order_info_voicsta == '3' ||
                  record.order_info_voicsta == '2' ||
                  record.order_info_voicsta == '1'
                "
              >
                <a href="javascript:;" @click="chakankaipiaoshenqing(record)">开票申请结果</a>
              </a-menu-item> -->
              <a-menu-item v-if="record.order_info_status == 1 && ordertype == 2 && record.shenhestatus != '5'">
                <a href="javascript:;" @click="chakanshenqing(record)">折扣申请结果</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        title="订单详情"
        width="700px"
        :visible="visible"
        :confirm-loading="confirmLoading"
        @cancel="handleCancel"
        :destroyOnClose="true"
        :centered="true"
        :footer="null"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-table :columns="detailColumns" :data-source="oderdetail" size="small" @change="handleTableChange1" />
          </a-spin>
        </p>
      </a-modal>
    </div>
    <div>
      <a-modal
        title="直接收款"
        :visible="visiblefukuan"
        :confirm-loading="confirmLoading"
        @cancel="
          () => {
            this.visiblefukuan = false
            this.shoukuandata.money = 0
          }
        "
        okText="保存"
        @ok="saveshoukuan"
        cancelText="取消"
        :maskClosable="false"
        :destroyOnClose="true"
        :centered="true"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-row>
              <a-col :span="12">
                <a-form-item label="订单总金额:">
                  <a-input-number
                    id="1"
                    :maxLength="50"
                    size="large"
                    :disabled="true"
                    style="width: 230px; margin-right: 8px"
                    placeholder="订单总金额"
                    v-model="shoukuandata.order_info_altogether"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="未付金额:">
                  <a-input-number
                    id="1"
                    :maxLength="50"
                    size="large"
                    :disabled="true"
                    style="width: 230px; margin-right: 8px"
                    placeholder="未付金额"
                    v-model="shoukuandata.payed"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="收款金额:">
                  <a-input-number
                    id="1"
                    size="large"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="收款金额"
                    v-model="shoukuandata.money"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备注:">
                  <a-input
                    size="large"
                    type="text"
                    :maxLength="200"
                    style="width: 230px; margin-right: 8px"
                    placeholder="备注"
                    v-model="shoukuandata.remark"
                  ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
          </a-spin>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="打折申请"
        :visible="visiblezhekou"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visiblezhekou = false
            this.zhekoudata.money = 0
          }
        "
        okText="保存"
        @ok="savezhekou"
        cancelText="取消"
        :maskClosable="false"
        :destroyOnClose="true"
        :centered="true"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-row>
              <a-col :span="12">
                <a-form-item label="订单总金额:">
                  <a-input-number
                    id="1"
                    size="large"
                    :disabled="true"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="订单总金额"
                    v-model="zhekoudata.order_info_altogether"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="未付金额:">
                  <a-input-number
                    id="1"
                    size="large"
                    :disabled="true"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="未付金额"
                    v-model="zhekoudata.payed"
                  />
                </a-form-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="12">
                <a-form-item label="折扣金额:">
                  <a-input-number
                    id="1"
                    size="large"
                    :maxLength="50"
                    style="width: 230px; margin-right: 8px"
                    placeholder="折扣金额"
                    v-model="zhekoudata.money"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="备注:">
                  <a-input
                    size="large"
                    type="text"
                    style="width: 230px; margin-right: 8px"
                    placeholder="备注"
                    :maxLength="200"
                    v-model="zhekoudata.remark"
                  ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
          </a-spin>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal v-model="shenhejieguo" title="审核结果" :footer="null" :centered="true" :destroyOnClose="true">
        <a-spin :spinning="spinning">
          <p style="margin-left: 100px">审核结果：{{ oneshenqingdata.jieguo }}</p>
          <p style="margin-left: 100px">审核备注：{{ oneshenqingdata.refuse_reason }}</p>
          <a-button
            v-if="oneshenqingdata.examine_status == '4'"
            style="margin-left: 100px"
            class="editable-add-btn"
            type="danger"
            @click="chongxinshenqing"
            :loading="spinning"
          >
            重新申请
          </a-button>
        </a-spin>
      </a-modal>
    </div>

    <div>
      <a-modal v-model="kaipiaoshenhejieguo" title="审核结果" :footer="null" :centered="true" :destroyOnClose="true">
        <a-spin :spinning="spinning">
          <p style="margin-left: 100px">审核结果：{{ oneshenqingdata.jieguo }}</p>
          <p v-if="oneshenqingdata.shenhezhong != 'yes'" style="margin-left: 100px">
            审核备注：{{ oneshenqingdata.refuse_reason }}
          </p>
          <a-button
            v-if="oneshenqingdata.order_info_voicsta == '3'"
            style="margin-left: 100px"
            class="editable-add-btn"
            type="danger"
            @click="chongxinkaipiaoshenqing"
            :loading="spinning"
          >
            重新申请
          </a-button>
        </a-spin>
      </a-modal>
    </div>

    <div>
      <a-modal
        v-model="chakanwuliuxinx"
        title="物流信息"
        width="900px"
        :footer="null"
        :centered="true"
        :destroyOnClose="true"
      >
        <p style="margin-left: 100px">物流公司：{{ quanbuwuliuxinx.wuliugongsi }}</p>
        <p style="margin-left: 100px">物流编号：{{ quanbuwuliuxinx.wuliuxinx }}</p>
        <p style="margin-left: 100px">备注：{{ quanbuwuliuxinx.remark }}</p>
        <p>
          <a-table ref="table" :columns="filecolumns" :data-source="list">
            <span slot="slide_name" slot-scope="text">
              <a type="link" :href="text"> {{ text }} </a></span
            >
          </a-table>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="实际运费"
        :visible="visibleshiji"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visibleshiji = false
            this.shijiyunfei = 0
          }
        "
        okText="保存"
        @ok="saveshiji"
        cancelText="取消"
        :maskClosable="false"
        :destroyOnClose="true"
        :centered="true"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-row>
              <a-form-item label="实际运费:">
                <a-input-number
                  id="1"
                  size="large"
                  :maxLength="20"
                  style="width: 300px; margin-right: 8px"
                  placeholder="实际运费"
                  v-model="shijiyunfei"
                  :min="0"
                />
              </a-form-item>
            </a-row>
          </a-spin>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="批量出库"
        width="1000px"
        :visible="visiblepiliang"
        :confirm-loading="false"
        @cancel="
          () => {
            this.selectedRowKeys = []
            this.visiblepiliang = false
          }
        "
        okText="出库"
        @ok="allchuku"
        cancelText="取消"
        :maskClosable="false"
        :destroyOnClose="true"
        :centered="true"
      >
        <p>
          <a-spin :spinning="spinning">
            <a-table
              :columns="chukuColumns"
              :data-source="chukudetail"
              :row-selection="{
                selectedRowKeys: selectedRowKeys,
                onChange: onSelectChange,
              }"
              size="small"
            >
              <template slot="order_info_voicsta" slot-scope="text">
                {{ text == 1 ? '已开票' : '未开票' }}
              </template>
              <template slot="order_info_moneys" slot-scope="text">
                {{ text == '' || text == null ? 0 : text }}
              </template>
              <template slot="order_info_status" slot-scope="text">
                <a-badge
                  :status="
                    text == 1
                      ? 'default'
                      : text == 2
                      ? 'warning'
                      : text == 3
                      ? 'warning'
                      : text == 4
                      ? 'success'
                      : 'error'
                  "
                />
                {{
                  text == 1 ? '待付款' : text == 2 ? '待发货' : text == 3 ? '待收货' : text == 4 ? '已完成' : '已取消'
                }}
              </template>
              <template slot="order_info_creatime" slot-scope="text">
                {{ text | dayjs }}
              </template>
            </a-table>
          </a-spin>
        </p>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="发货信息"
        :visible="iffahuo"
        :confirm-loading="false"
        okText="提交"
        @ok="fahuoaa({ id: '0' })"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.ifpiliangchuku = false
            this.iffahuo = false
            this.fahuoxinxi = {}
            this.fileList = []
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <p>
          <a-spin :spinning="spinning" size="large">
            <row>
              <a-col :span="12">
                <a-form-item label="物流公司:">
                  <a-select
                    size="large"
                    placeholder="物流公司"
                    style="width: 230px; margin-right: 8px"
                    v-model="fahuoxinxi.wuliugongsi"
                    allowClear
                  >
                    <a-select-option
                      v-for="(items, index) in alllogistics"
                      :key="index"
                      :label="items.name"
                      :value="items.name"
                      >{{ items.name }}</a-select-option
                    >
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item label="物流单号:">
                  <a-input
                    size="large"
                    type="text"
                    :maxLength="50"
                    style="width: 230px"
                    placeholder="物流单号"
                    v-model="fahuoxinxi.dingdan"
                  ></a-input>
                </a-form-item>
              </a-col>
            </row>
            <row>
              <a-col :span="ifpiliangchuku ? 12 : 24">
                <a-form-item label="备注:">
                  <a-input
                    size="large"
                    type="text"
                    :maxLength="200"
                    :style="ifpiliangchuku ? 'width: 230px' : 'width: 470px'"
                    placeholder="备注"
                    v-model="fahuoxinxi.remark"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col :span="ifpiliangchuku ? 12 : 0">
                <a-form-item label="运费总额:" v-if="ifpiliangchuku">
                  <a-input-number
                    id="1"
                    size="large"
                    :maxLength="20"
                    style="width: 230px"
                    placeholder="运费总额"
                    v-model="fahuoxinxi.yunfei"
                    :min="0"
                  />
                </a-form-item>
              </a-col>
            </row>

            <row>
              附加文件信息:
              <a-upload
                accept="image/jpeg,image/x-png,image/x-ms-bmp,image/x-photo-cd,image/x-portablebitmap,image/x-rgb,image/tiff"
                :file-list="fileList"
                :remove="handleRemovefengmian"
                :before-upload="beforeUploadfengmian"
              >
                <a-button> <a-icon type="upload" /> 选择文件 </a-button>
              </a-upload>
            </row>
          </a-spin>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN'
const filecolumns = [
  {
    dataIndex: 'slide_name',
    title: '文件名',
    scopedSlots: { customRender: 'slide_name' },
  },
]
const chukuColumns = [
  {
    title: '订单编号',
    dataIndex: 'order_info_ids',
  },
  {
    title: '收货名',
    dataIndex: 'harvest_name',
  },
  {
    title: '收货电话',
    dataIndex: 'harvest_phone',
  },
  {
    title: '优惠券额度',
    dataIndex: 'coupon_moeny',
  },

  {
    title: '总价',
    dataIndex: 'order_info_altogether',
  },

  {
    title: '支付金额',
    dataIndex: 'order_info_moneys',
    scopedSlots: { customRender: 'order_info_moneys' },
  },

  {
    title: '下单时间',
    dataIndex: 'order_info_creatime',
    scopedSlots: { customRender: 'order_info_creatime' },
  },
  {
    title: '订单状态',
    dataIndex: 'order_info_status',
    scopedSlots: { customRender: 'order_info_status' },
  },
  {
    title: '开票状态',
    dataIndex: 'order_info_voicsta',
    scopedSlots: { customRender: 'order_info_voicsta' },
  },
]
const detailColumns = [
  {
    title: '订单编号',
    width: 120,
    sorter: true,
    dataIndex: 'order_info_id',
  },

  {
    title: '商品名称',
    sorter: true,
    dataIndex: 'shop_goods_name',
  },
  {
    title: '商品数量',
    sorter: true,
    dataIndex: 'order_info_amount',
  },
  {
    title: '规格名称',
    sorter: true,
    dataIndex: 'shop_specification_name',
  },
  {
    title: '规格价格',
    sorter: true,
    dataIndex: 'shop_specification_price',
  },
  {
    title: '总价',
    sorter: true,
    dataIndex: 'order_detail_altogether',
  },
]
const innerColumns = [
  {
    title: '下单时间',
    show: 2,
    dataIndex: 'order_info_creatime',
    scopedSlots: { customRender: 'order_info_creatime' },
  },
  {
    title: '收货地址',
    show: 1,
    dataIndex: 'harvest_add',
  },
  {
    title: '收货详情',
    show: 1,
    dataIndex: 'harvest_address',
  },
  {
    title: '优惠券额度',
    show: 2,
    sorter: true,
    dataIndex: 'coupon_moeny',
  },
  {
    title: '支付方式',
    show: 1,
    dataIndex: 'order_info_payment',
    scopedSlots: { customRender: 'order_info_payment' },
  },
  {
    title: '楼层(层)',
    show: 1,
    dataIndex: 'order_info_floor',
  },
  {
    title: '距离(KM)',
    show: 1,
    dataIndex: 'order_info_distance',
  },
  {
    title: '电梯',
    show: 1,
    dataIndex: 'order_info_elevator',
  },
  {
    title: '户型',
    show: 1,
    dataIndex: 'order_info_house',
  },
  {
    title: '留言',
    show: 1,
    dataIndex: 'order_info_word',
  },
  {
    title: '送达时间',
    show: 1,
    dataIndex: 'order_info_deliverycretime',
  },
]
const columns = [
  {
    title: '订单编号',
    show: 1,
    width: 120,
    sorter: true,
    dataIndex: 'order_info_id',
  },
  {
    title: '订单号',
    show: 1,
    sorter: true,
    dataIndex: 'order_info_ids',
  },
  {
    title: '收货名',
    show: 1,
    sorter: true,
    dataIndex: 'harvest_name',
  },
  {
    title: '收货电话',
    show: 1,
    sorter: true,
    dataIndex: 'harvest_phone',
  },
  {
    title: '利润',
    show: 1,
    sorter: true,
    dataIndex: 'lirun',
    scopedSlots: { customRender: 'lirun' },
  },

  {
    title: '总价',
    show: 1,
    sorter: true,
    dataIndex: 'order_info_altogether',
  },
  {
    title: '支付金额',
    show: 1,
    sorter: true,
    dataIndex: 'order_info_moneys',
  },
  {
    title: '申请折扣总金额',
    show: 1,
    sorter: true,
    dataIndex: 'discount',
  },

  {
    title: '订单状态',
    show: 1,
    dataIndex: 'order_info_status',
    scopedSlots: { customRender: 'order_info_status' },
  },
  {
    title: '开票状态',
    show: 1,
    dataIndex: 'order_info_voicsta',
    scopedSlots: { customRender: 'order_info_voicsta' },
  },
  {
    title: '操作',
    show: 3,
    width: 160,
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'OrderListManager',
  props: {
    text: String,
    locale,
  },
  data() {
    return {
      data: [],
      list: [],
      columns,
      visibleshiji: false,
      shijiyunfei: 0,
      type: '',
      innerColumns,
      detailColumns,
      visible: false,
      chukuColumns,
      visiblefukuan: false,
      visiblezhekou: false,
      shenhejieguo: false,
      chakanwuliuxinx: false,
      spinning: false,
      iffahuo: false,
      filecolumns,
      selectedRowKeys: [],
      alllogistics: [],
      fahuoxinxi: {},
      visiblepiliang: false,
      confirmLoading: false,
      changetype: 0,
      keywords: '',
      ordertype: 2,
      orderstatus: '',
      allordermoney: 0,
      allweifukuanmoney: 0,
      allyifukuanmoney: 0,
      alldanjuprice: 0,
      status: '',
      newid: '',
      userid: '',
      baseURL: 'http://8.136.103.102:8088/api',
      // baseURL:"http://47.103.34.184:8085/api",
      shoukuandata: {},
      alluser: [],
      chukudetail: [],
      fileListlunbo: [],
      zhekoudata: {},
      quanbuwuliuxinx: {},
      oneorderdata: {},
      oneshenqingdata: {},
      ifpiliangchuku: false,
      kaipiaoshenhejieguo: false,
      oderdetail: [],
      alluserorderids: [],
      allDevice: [],
      fileList: [],
      selectdata: [],
      formInline: {
        timerange: [],
      },
    }
  },
  created() {
    var rights = JSON.parse(window.localStorage.getItem('cailiaorights'))
    var newcolumns = []
    var newinnercolumns = []
    this.columns.forEach((item) => {
      rights.forEach((element) => {
        if (item.dataIndex == element.name && element.show == 1) {
          newcolumns.push(item)
        }
      })
    })
    this.innerColumns.forEach((item) => {
      rights.forEach((element) => {
        if (item.dataIndex == element.name && (element.show == 1 || item.show == 3)) {
          newinnercolumns.push(item)
        }
      })
    })
    if (newcolumns.length > 0) {
      newcolumns.push({
        title: '操作',
        show: 3,
        width: 160,
        dataIndex: 'action',
        scopedSlots: { customRender: 'action' },
      })
    }
    this.columns = newcolumns
    this.innerColumns = newinnercolumns
    var endtime = ''
    var starttime = ''
    this.formInline.timerange = [starttime, endtime]
    this.getalluserdata()
    this.getalldata()
  },
  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
  },
  methods: {
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
      this.selectdata = []
      this.selectedRowKeys.forEach((item) => {
        this.chukudetail.forEach((element) => {
          if (this.chukudetail.indexOf(element) == item) {
            this.selectdata.push(element)
          }
        })
      })
    },
    piliangfahuo() {
      const that = this
      var formdate = {}
      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      if (that.status != '' && that.status != null) {
        formdate.status = that.status
      }
      formdate.orderstatus = 2
      if (that.userid != '' && that.userid != null) {
        formdate.userid = that.userid
      }
      if (
        that.formInline.timerange[0] != '' &&
        that.formInline.timerange[0] != null &&
        that.formInline.timerange[1] != '' &&
        that.formInline.timerange[1] != null
      ) {
        that.formInline.starttime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[0]))
        that.formInline.endtime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[1]))
        if (that.formInline.times == 'month') {
          that.formInline.starttime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[0]))
          that.formInline.endtime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[1]))
        }
      }
      if (that.formInline.starttime != '' && that.formInline.starttime != null) {
        formdate.starttime = that.formInline.starttime
      }
      if (that.formInline.endtime != '' && that.formInline.endtime != null) {
        formdate.endtime = that.formInline.endtime
      }

      that.spinning = true
      that
        .$request({
          url: '/user/getAllOrderListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.chukudetail = res.data
            that.visiblepiliang = true
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    allchuku() {
      const that = this
      that.alldanjuprice = 0
      if (that.selectdata.length == 0) {
        that.$message.warning('请先选择需要出库的单据!')
        return
      } else {
        that.selectdata.forEach((item) => {
          that.alldanjuprice = that.alldanjuprice + item.order_info_altogether
        })
      }
      that.spinning = true
      this.$request({
        url: '/user/getAllLogisticsDataListpage',
        method: 'get',
        params: {},
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((item) => {
              item.id = item.shop_order_logistics_id
              item.name = item.shop_order_logistics_name
            })
            that.allunit = res.data
            that.alllogistics = res.data
            that.iffahuo = true
            that.ifpiliangchuku = true
            that.fahuoxinxi = {}
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    yunfeijilu(e) {
      const that = this
      that.visibleshiji = true
      that.shijiyunfei = Number(e.order_info_yunfei).toFixed(2)
      that.type = e.order_info_status
      that.thisid = e.order_info_id
    },
    saveshiji() {
      const that = this
      if (that.shijiyunfei == '' || that.shijiyunfei == null) {
        that.$message.warning('请填写实际运费金额!')
        return
      }
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      formdate.shijiyunfei = that.shijiyunfei
      formdate.type = that.type
      formdate.id = that.thisid
      formdate.typedata = '更新'
      formdate.history = '更新订单：' + that.thisid + ',实际运费金额：' + that.shijiyunfei
      that.spinning = true
      this.$request({
        url: '/user/changeOrderStatusById',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.visibleshiji = false
            that.type = ''
            that.thisid = ''
            that.shijiyunfei = ''
            that.getAllOrdersListpage()
            that.$message.success('记录成功!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getalluserdata() {
      const that = this
      that
        .$request({
          url: '/user/getAllCommonUsersDataListpage',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
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
      that.formInline.timerange[0] = dateString[0]
      that.formInline.timerange[1] = dateString[1]
      if (dateString[0] == '') {
        that.formInline.timerange[1] = that.dateFtt('yyyy-MM-dd', new Date())
        that.formInline.timerange[0] = that.dateFtt(
          'yyyy-MM-dd',
          new Date(new Date().getTime() - 24 * 60 * 60 * 1000 * 7)
        )
      }
    },
    getalldata() {
      const that = this
      console.log(JSON.parse(localStorage.getItem('store')).admin.sell_leve)
      if (
        JSON.parse(localStorage.getItem('store')).admin.sell_leve == 1 //普通销售
      ) {
        var id = JSON.parse(localStorage.getItem('store')).admin.user_id
        this.$request({
          url: '/user/getAllueridBySellid',
          method: 'get',
          params: {
            sellid: id,
          },
        })
          .then((res) => {
            if (res.data.length > 0) {
              res.data.forEach((item) => {
                this.alluserorderids.push(item.user_id)
              })
            }
            that.getRoleDataByRoleid()
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else if (JSON.parse(localStorage.getItem('store')).admin.sell_leve == 2) {
        //销售主管

        var id = JSON.parse(localStorage.getItem('store')).admin.user_id
        this.$request({
          url: '/user/getAllueridBySellzhuguanid',
          method: 'get',
          params: {
            id: id,
          },
        })
          .then((res) => {
            if (res.data.length > 0) {
              res.data.forEach((item) => {
                this.alluserorderids.push(item.user_id)
              })
            }
            that.getRoleDataByRoleid()
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.getRoleDataByRoleid()
      }
    },
    beforeUploadfengmian(file) {
      const that = this
      this.fileList = [...this.fileList, file]
      return false
    },
    handleRemovefengmian(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    wuliuxinx(e) {
      const that = this
      console.log(e)
      that.list = []
      that.quanbuwuliuxinx = {}
      if (e.order_info_wuliu) {
        that.quanbuwuliuxinx.wuliugongsi = e.order_info_wuliu
      } else {
        that.quanbuwuliuxinx.wuliugongsi = ''
      }
      if (e.order_info_danhao) {
        that.quanbuwuliuxinx.wuliuxinx = e.order_info_danhao
      } else {
        that.quanbuwuliuxinx.wuliuxinx = ''
      }
      if (e.order_info_remark) {
        that.quanbuwuliuxinx.remark = e.order_info_remark
      } else {
        that.quanbuwuliuxinx.remark = ''
      }
      if (e.files) {
        var data = []
        data = e.files.split(',')
        data.forEach((item) => {
          that.list.push({
            slide_name: item,
            url: item,
          })
        })
      }
      if (e.files2) {
        var data = []
        data = e.files2.split(',')
        data.forEach((item) => {
          that.list.push({
            slide_name: item,
            url: item,
          })
        })
      }
      that.chakanwuliuxinx = true
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }

      this.getAllOrdersListpage()
    },
    handleTableChange1(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAlldetail()
    },
    chongxinkaipiaoshenqing() {
      const that = this
      this.$confirm({
        title: '是否确定将重新申请开票?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.myid = that.$store.state.admin.user_id
          formdate.bills_type = 'KaipiaoRecord'
          formdate.jieguo = '申请开票'
          formdate.id = that.oneshenqingdata.order_info_id
          formdate.type = 1
          that.spinning = true
          this.$request({
            url: '/user/changeOrderkaipiaoStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.oneshenqingdata = {}
                that.kaipiaoshenhejieguo = false
                that.getAllOrdersListpage()
                that.$message.success('提交订单审核开票成功!')
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
    chongxinshenqing() {
      const that = this
      this.$confirm({
        title: '是否确定重新申请折扣审核?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          that.spinning = true
          var formdate = {}
          formdate.myid = that.$store.state.admin.user_id
          formdate.id = that.oneshenqingdata.id
          formdate.orderid = that.oneshenqingdata.order_info_id
          this.$request({
            url: '/user/deleteshenheDiscountSuccess',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.status == 200) {
                that.shenhejieguo = false
                that.spinning = false
                that.getAllOrdersListpage()
                that.$message.success('重置成功，已经重新申请!')
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
    chakankaipiaoshenqing(e) {
      const that = this
      console.log(e)
      that.kaipiaoshenhejieguo = true
      that.oneshenqingdata.order_info_id = e.order_info_id
      that.oneshenqingdata.order_info_voicsta = e.order_info_voicsta
      if (e.order_info_voicsta == '3') {
        that.oneshenqingdata.jieguo = '审核被驳回'
        that.oneshenqingdata.shenhezhong = 'no'
      } else if (e.order_info_voicsta == '1') {
        that.oneshenqingdata.jieguo = '正在审核'
        that.oneshenqingdata.shenhezhong = 'yes'
      } else if (e.order_info_voicsta == '2') {
        that.oneshenqingdata.jieguo = '财务开票审核通过'
        that.oneshenqingdata.shenhezhong = 'yes'
      }
      if (e.reason != '') {
        that.oneshenqingdata.refuse_reason = e.reason
      } else {
        that.oneshenqingdata.refuse_reason = ''
      }
    },
    chakanshenqing(e) {
      const that = this
      that.shenhejieguo = true
      that.spinning = true
      var formdate = {}
      formdate.id = e.discountid
      this.$request({
        url: '/user/getonediscountrecordbyid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.oneshenqingdata = res.data
            if (res.data.examine_status == '4') {
              that.oneshenqingdata.jieguo = '审核被驳回'
            } else if (res.data.examine_status == '0') {
              that.oneshenqingdata.jieguo = '正在审核'
            } else if (res.data.examine_status == '1') {
              that.oneshenqingdata.jieguo = '财务审核通过，等待总经办审核'
            } else if (res.data.examine_status == '2') {
              that.oneshenqingdata.jieguo = '恭喜审核通过,折扣金额已经扣除'
            }
            that.spinning = false
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getRoleDataByRoleid() {
      const that = this
      if (
        JSON.parse(localStorage.getItem('store')).admin.sell_leve != 1 &&
        JSON.parse(localStorage.getItem('store')).admin.sell_leve != 2
      ) {
        that.getAllUserOrderIds()
      }
    },
    savezhekou() {
      const that = this
      if (that.zhekoudata.money == '' || that.zhekoudata.money == null) {
        that.$message.warning('请填写折扣金额!')
        return
      }
      if (Number(that.zhekoudata.money) > Number(that.zhekoudata.payed)) {
        that.$message.warning('折扣金额不能大于订单剩余价格!')
        return
      }
      that.zhekoudata.myid = that.$store.state.admin.user_id
      that.zhekoudata.orderid = that.oneorderdata.order_info_id
      //新增信息
      that.spinning = true
      this.$request({
        url: '/user/addZheKouBillsdata',
        method: 'get',
        params: that.zhekoudata,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.visiblezhekou = false
            that.zhekoudata = {}
            that.getAllOrdersListpage()
            that.$message.success('申请折扣成功,已经移交财务审核!')
          } else {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    saveshoukuan() {
      const that = this
      if (that.shoukuandata.money == '' || that.shoukuandata.money == null) {
        that.$message.warning('请填写收款金额!')
        return
      }
      if (Number(that.shoukuandata.money) > Number(that.shoukuandata.payed)) {
        that.$message.warning('付款金额不能大于订单剩余价格!')
        return
      }
      that.shoukuandata.myid = that.$store.state.admin.user_id
      that.shoukuandata.orderid = that.oneorderdata.order_info_id
      //新增信息
      that.spinning = true
      this.$request({
        url: '/user/addColletionBillsdata',
        method: 'get',
        params: that.shoukuandata,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.visiblefukuan = false
            that.shoukuandata = {}
            that.getAllOrdersListpage()
            that.$message.success('新增收款信息成功!')
          } else {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    dazhe(e) {
      const that = this
      that.oneorderdata = {}
      that.visiblezhekou = true
      that.oneorderdata = e
      that.zhekoudata.order_info_altogether = Number(e.order_info_altogether).toFixed(2)
      that.zhekoudata.payed = Number(e.order_info_altogether - e.payed - e.discount).toFixed(2)
      // console.log('ddddddddd')
      // console.log(that.oneorderdata)
      // that.spinning = true
      // var fromdata = {}
      // fromdata.id = e.order_info_id
      // this.$request({
      //   url: '/user/getUserDataByOrderid',
      //   method: 'get',
      //   params: fromdata,
      // })
      //   .then((res) => {
      //     if (res.code == 200) {
      //        that.spinning = false
      //     }
      //   })
      //   .catch(function () {
      //     that.spinning = false
      //     that.$message.error('抱歉,未知错误,请联系管理员!')
      //   })
    },
    shoukuan(e) {
      const that = this

      that.oneorderdata = {}
      that.visiblefukuan = true
      that.oneorderdata = e
      that.shoukuandata.order_info_altogether = e.order_info_altogether
      that.shoukuandata.payed = e.order_info_altogether - e.payed - e.discount
    },
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: that.ordertype == 1 ? '是否确定导出普通订单列表?' : '是否确定导出材料订单列表',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          // var aa = ''
          // aa = that.alluserorderids.join(',')
          // formdate.allids = aa
          // if (that.ordertype == 1) {
          //   //普通订单
          //   formdate.putongdingdan = 1
          // } else {
          //   //用户订单
          //   formdate.yonghudingdan = 1
          // }
          this.$request({
            url: '/user/getAllOrderListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '订单编号',
                    '订单号',
                    '收货名',
                    '收货电话',
                    '优惠券额度',
                    '总价',
                    '折扣金额',
                    '支付金额',
                    '下单时间',
                    '订单状态',
                    '开票状态',
                    '仓库',
                    '收货地址',
                    '收货详情',
                    '支付方式',
                    '楼层(层)',
                    '距离(KM)',
                    '电梯',
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.order_info_id == null ? '' : element.order_info_id,
                    element.order_info_ids == null ? '' : element.order_info_ids,
                    element.harvest_name == null ? '' : element.harvest_name,
                    element.harvest_phone == null ? '' : element.harvest_phone,
                    element.coupon_moeny == null ? '' : element.coupon_moeny,
                    element.order_info_altogether == null ? '' : element.order_info_altogether,
                    element.discount == null ? '' : element.discount,
                    element.order_info_moneys == null ? '' : element.order_info_moneys,
                    element.order_info_creatime == null ? '' : element.order_info_creatime,
                    element.order_info_status == null
                      ? ''
                      : element.order_info_status == 1
                      ? '待付款'
                      : element.order_info_status == 2
                      ? '待发货'
                      : element.order_info_status == 3
                      ? '待收货'
                      : element.order_info_status == 4
                      ? '待评价'
                      : element.order_info_status == 5
                      ? '已完成'
                      : '已取消',
                    element.order_info_voicsta == null
                      ? ''
                      : element.order_info_voicsta == 0
                      ? '未开票'
                      : element.order_info_voicsta == 1
                      ? '审核中'
                      : element.order_info_voicsta == 2
                      ? '已开票'
                      : '驳回',
                    element.warehousename == null ? '' : element.warehousename,
                    element.harvest_add == null ? '' : element.harvest_add,
                    element.harvest_address == null ? '' : element.harvest_address,
                    element.order_info_payment == null
                      ? ''
                      : element.order_info_payment == 'wxpay'
                      ? '微信支付'
                      : '余额',
                    element.order_info_floor == null ? '' : element.order_info_floor,
                    element.order_info_house == null ? '' : element.order_info_house,
                    element.order_info_word == null ? '' : element.order_info_word,
                    element.order_info_deliverycretime == null ? '' : element.order_info_deliverycretime,
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '材料订单列表')
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
    getAllUserOrderIds() {
      const that = this
      that.spinning = true
      that.alluserorderids = []
      that
        .$request({
          url: '/user/getAllUserOrderIds',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              that.alluserorderids.push(element.order_info_id)
            })
            that.data = res.data
            that.getAllOrdersListpage()
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    changekaipiao(e) {
      const that = this
      this.$confirm({
        title: '是否确定将申请开票?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          formdate.myid = that.$store.state.admin.user_id
          formdate.bills_type = 'KaipiaoRecord'
          formdate.jieguo = '申请开票'
          formdate.id = e.order_info_id
          formdate.type = 1
          that.spinning = true
          this.$request({
            url: '/user/changeOrderkaipiaoStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.getAllOrdersListpage()
                that.$message.success('提交订单审核开票成功!')
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
    changeorder(e) {
      const that = this
      if (that.changetype == 3) {
        that.spinning = true
        this.$request({
          url: '/user/getAllLogisticsDataListpage',
          method: 'get',
          params: {},
        })
          .then((res) => {
            if (res.code == 200) {
              that.spinning = false
              res.data.forEach((item) => {
                item.id = item.shop_order_logistics_id
                item.name = item.shop_order_logistics_name
              })
              that.allunit = res.data
              that.alllogistics = res.data
              that.iffahuo = true
              that.thisid = e.order_info_id
              that.fahuoxinxi = {}
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        this.aas(e)
      }
    },

    aas(e) {
      const that = this
      if (this.fileListlunbo.length > 3) {
        that.$message.error('抱歉,附件信息最多3个!')
        return
      }
      this.$confirm({
        title:
          that.changetype == 3
            ? '是否确定发货?'
            : that.changetype == 4
            ? '是否确定强制完成订单?'
            : '是否确定取消该订单?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          that.spinning = true
          var formdate = {}
          formdate.myid = that.$store.state.admin.user_id
          if (that.changetype == 3) {
            if (that.fahuoxinxi.wuliugongsi == '') {
              that.$message.warning('请填写物流信息!')
              return
            }
            if (that.fahuoxinxi.dingdan == '') {
              that.$message.warning('请填写物流单号!')
              return
            }
            formdate.id = that.thisid
            formdate.wuliugongsi = that.fahuoxinxi.wuliugongsi
            formdate.dingdan = that.fahuoxinxi.dingdan
          } else {
            formdate.id = e.order_info_id
          }

          formdate.type = that.changetype
          formdate.history = ''
          ;(formdate.typedata =
            that.changetype == 3
              ? '发货'
              : that.changetype == 4
              ? '送达'
              : that.changetype == 5
              ? '强制完成'
              : '取消订单'),
            (that.spinning = true)
          this.$request({
            url: '/user/changeOrderStatusById',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.thisid = ''
                that.iffahuo = false
                that.fahuoxinxi = {}
                that.getAllOrdersListpage()
                that.$message.success('成功!')
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

    fahuoaa() {
      const that = this
      if (this.fileList.length > 3) {
        that.$message.error('抱歉,附件信息最多3个!')
        return
      }
      that.spinning = true
      if (that.fileList.length > 0) {
        var allpicture = []
        that.fileList.forEach((file) => {
          const formData = new FormData()
          formData.append('picture', file)
          this.$request({
            url: this.baseURL + '/pub/aliuploadImg3',
            method: 'post',
            data: formData,
          })
            .then((res) => {
              if (res.code == 0) {
                allpicture.push(res.data.objectKey)
                that.fahuoxinxi.files = allpicture.join(',')
              }
            })
            .catch(function () {
              that.spinning = false
              that.$message.warning('相关文件上传失败，请重新尝试上传!')
              return
            })
        })
        setTimeout(() => {
          this.sss()
        }, 2000)
      } else {
        that.fahuoxinxi.files = ''
        this.sss()
      }
    },
    sss() {
      const that = this
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      if (that.fahuoxinxi.wuliugongsi == '' || that.fahuoxinxi.wuliugongsi == null) {
        that.spinning = false
        that.$message.warning('请填写物流信息!')
        return
      }
      if (that.fahuoxinxi.dingdan == '' || that.fahuoxinxi.dingdan == null) {
        that.spinning = false
        that.$message.warning('请填写物流单号!')
        return
      }
      formdate.id = that.thisid != null && that.thisid != '' ? that.thisid : 0
      formdate.wuliugongsi = that.fahuoxinxi.wuliugongsi
      formdate.dingdan = that.fahuoxinxi.dingdan
      formdate.files = that.fahuoxinxi.files
      if (that.fahuoxinxi.remark != '' && that.fahuoxinxi.remark != null) {
        formdate.remark = that.fahuoxinxi.remark
      }
      formdate.history = ''
      formdate.type = that.changetype
      formdate.typedata =
        that.changetype == 3 ? '发货' : that.changetype == 4 ? '送达' : that.changetype == 5 ? '强制完成' : '取消订单'

      if (that.ifpiliangchuku) {
        var allorder = []
        if (that.fahuoxinxi.yunfei != '' && that.fahuoxinxi.yunfei != null && that.fahuoxinxi.yunfei != 0) {
          that.selectdata.forEach((item) => {
            item.yunfei = Number((item.order_info_altogether / that.alldanjuprice) * that.fahuoxinxi.yunfei).toFixed(2)
          })
        }
        that.selectdata.forEach((item) => {
          allorder.push({
            id: item.order_info_id,
            yunfei: item.yunfei != '' && item.yunfei != null ? item.yunfei : 0,
          })
        })
        var newdata = JSON.stringify(allorder)
        formdate.ids = newdata
        this.$request({
          url: '/user/changeAllOrderStatusByIds',
          method: 'post',
          data: formdate,
        })
          .then((res) => {
            if (res.code == 200) {
              that.spinning = false
              that.thisid = ''
              that.ifpiliangchuku = false
              that.iffahuo = false
              that.fahuoxinxi = {}
              that.selectedRowKeys = []
              that.visiblepiliang = false
              that.getAllOrdersListpage()
              that.$message.success('发货成功!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.spinning = true
        this.$request({
          url: '/user/changeOrderStatusById',
          method: 'get',
          params: formdate,
        })
          .then((res) => {
            if (res.code == 200) {
              that.spinning = false
              that.thisid = ''
              that.ifpiliangchuku = false
              that.iffahuo = false
              that.fahuoxinxi = {}
              that.getAllOrdersListpage()
              that.$message.success('发货成功!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },
    handleCancel() {
      const that = this
      that.visible = false
    },
    getAlldetail() {
      const that = this
      that.spinning = true
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      formdate.id = that.newid
      this.$request({
        url: '/user/getOrdersAllDetailsDataById',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.oderdetail = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      var formdate = {}
      that.newid = e.order_info_id
      formdate.id = e.order_info_id
      this.$request({
        url: '/user/getOrdersAllDetailsDataById',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.oderdetail = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onSearch() {
      const that = this
      that.getalldata()
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
      if (that.userid != '' && that.userid != null) {
        formdate.userid = that.userid
      }
      if (
        that.formInline.timerange[0] != '' &&
        that.formInline.timerange[0] != null &&
        that.formInline.timerange[1] != '' &&
        that.formInline.timerange[1] != null
      ) {
        that.formInline.starttime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[0]))
        that.formInline.endtime = that.dateFtt('yyyy-MM-dd', new Date(that.formInline.timerange[1]))
        if (that.formInline.times == 'month') {
          that.formInline.starttime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[0]))
          that.formInline.endtime = that.dateFtt('yyyy-MM', new Date(that.formInline.timerange[1]))
        }
      }
      if (that.formInline.starttime != '' && that.formInline.starttime != null) {
        formdate.starttime = that.formInline.starttime
      }
      if (that.formInline.endtime != '' && that.formInline.endtime != null) {
        formdate.endtime = that.formInline.endtime
      }

      that.spinning = true
      that
        .$request({
          url: '/user/getAllOrderListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            res.data.forEach((element) => {
              that.allordermoney += element.order_info_altogether
              that.allweifukuanmoney += element.shengxiamoney
              that.allyifukuanmoney += element.payed
              var groupItem = []
              groupItem.push({
                order_info_id: element.order_info_id,
                harvest_address: element.harvest_address,
                harvest_add: element.harvest_add,
                order_info_deliverycretime: element.order_info_deliverycretime,
                order_info_distance: element.order_info_distance,
                order_info_floor: element.order_info_floor,
                order_info_house: element.order_info_house,
                order_info_word: element.order_info_word,
                coupon_moeny: element.coupon_moeny,
                order_info_creatime: element.order_info_creatime,
                order_info_payment: element.order_info_payment,
                warehousename: element.warehousename,
                order_info_elevator: element.order_info_elevator,
              })
              element.groupItem = groupItem
            })
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
