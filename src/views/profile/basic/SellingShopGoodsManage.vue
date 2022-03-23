<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-row :gutter="8">
      <a-col :span="5">
        <div>
          <div>
            <a-input-search
              style="margin-bottom: 8px; width: 160px"
              placeholder="类别名称"
              v-model="goodsclassname"
              @search="getOneTreeData"
              enter-button
            />
            <a-button
              style="margin-left: 8px"
              class="editable-add-btn"
              type="primary"
              @click="restart"
              :loading="spinning"
            >
              重置
            </a-button>
          </div>
          <a-card>
            <div @click="orgAddoneclass" style="margin-left: 6px">
              <a-tooltip placement="top" title="新增">
                <a-icon type="plus" style="margin-right: 6px" />
                新增第一级类别
              </a-tooltip>
            </div>
            <a-tree
              :tree-data="orgTree"
              @rightClick="onRightClick"
              @select="onSelect"
              @expand="
                () => {
                  this.NodeTreeItem = false
                  this.seletdata = []
                  this.newgoodsclassname = ''
                }
              "
            />
            <div :style="this.tmpStyle" v-if="NodeTreeItem && $store.state.rights[4].children[1].children[0].edit == 1">
              <div
                class="menu-item"
                @click="orgAdd"
                style="margin-left: 8px"
                v-if="seletdata.classtype == '1' || seletdata.classtype == '2' || seletdata.classtype == '0'"
              >
                <a-tooltip placement="bottom" title="新增子组织">
                  <a-icon type="plus-circle-o" />
                </a-tooltip>
              </div>
              <div class="menu-item" @click="orgEdit" style="margin-left: 8px" v-if="seletdata.label != '其他'">
                <a-tooltip placement="bottom" title="修改">
                  <a-icon type="edit" />
                </a-tooltip>
              </div>
              <div class="menu-item" @click="orgDelete" style="margin-left: 8px" v-if="seletdata.label != '其他'">
                <a-tooltip placement="bottom" title="删除">
                  <a-icon type="minus-circle-o" />
                </a-tooltip>
              </div>
              <div
                class="menu-item"
                @click="
                  () => {
                    this.NodeTreeItem = false
                    this.seletdata = []
                    this.newgoodsclassname = ''
                  }
                "
                style="margin-left: 8px"
              >
                <a-tooltip placement="bottom" title="关闭">
                  <a-icon type="close" />
                </a-tooltip>
              </div>
            </div>
          </a-card>
        </div>
      </a-col>

      <a-col :span="19">
        <a-input-search style="margin-left: 16px; width: 272px; margin-bottom: 16px" v-model="keywords" />
        <a-button
          style="margin-left: 16px"
          class="editable-add-btn"
          type="primary"
          @click="onSearch"
          :loading="spinning"
        >
          搜索
        </a-button>
        <a-button
          style="margin-left: 16px"
          class="editable-add-btn"
          type="primary"
          @click="addGooddata"
          :loading="spinning"
          v-if="$store.state.rights[4].children[1].children[0].add == 1"
        >
          +新增材料
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
          v-if="$store.state.rights[4].children[1].children[0].upload == 1"
        >
          批量导入
        </a-button>
        <a-button
          style="margin-left: 16px"
          class="editable-add-btn"
          icon="vertical-align-top"
          v-if="$store.state.rights[4].children[1].children[0].upload == 1"
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
          v-if="$store.state.rights[4].children[1].children[0].import == 1"
        >
          导出材料信息
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
              :rowKey="(item) => item.shop_goods_id"
              :locale="{ emptyText: '暂无数据' }"
            >
            </a-table>
            <template slot="shop_goods_class" slot-scope="text">{{ text == 'no' ? '' : text }}</template>
            <span slot="action" slot-scope="text, record">
              <template v-if="$store.state.rights[4].children[1].children[0].edit == 1">
                <a @click="handleEdit(record)">修改</a>
                <a-divider type="vertical" />
              </template>
              <template v-if="$store.state.rights[4].children[1].children[0].edit == 1">
                <a @click="hadleEditGuige(record)">编辑规格</a>
                <a-divider type="vertical" />
              </template>
              <template v-if="$store.state.rights[4].children[1].children[0].edit == 1">
                <a @click="deletecommonuser(record)">删除</a>
                <a-divider type="vertical" />
              </template>
              <template>
                <a @click="showhistory(record)">历史记录</a>
              </template>
            </span>
            <template slot="title"> 全部材料列表 </template>
          </a-table>
        </a-spin>
      </a-col>
    </a-row>
    <div>
      <a-modal
        title="历史操作记录"
        width="1000px"
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
        :title="ifaddcommomuserdata ? '新增材料信息' : '编辑材料信息'"
        :visible="visible"
        :confirm-loading="spinning"
        okText="保存"
        @ok="handleOk"
        :centered="true"
        cancelText="取消"
        @cancel="handleCanceladd"
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <a-spin :spinning="spinning">
          <a-row>
            <a-col :span="12">
              <a-form-item label="材料名称:">
                <a-input
                  size="large"
                  :maxLength="50"
                  style="width: 230px; margin-right: 8px"
                  type="text"
                  placeholder="材料名称"
                  v-model="oneshopgooddata.shop_goods_name"
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="材料代号:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  style="width: 230px"
                  placeholder="材料代号"
                  v-model="oneshopgooddata.shop_goods_priority"
                ></a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="商品封面:">
                <a-upload
                  :file-list="fileList"
                  accept="image/jpeg,image/x-png,image/x-ms-bmp,image/x-photo-cd,image/x-portablebitmap,image/x-rgb,image/tiff"
                  :remove="handleRemovefengmian"
                  :before-upload="beforeUploadfengmian"
                >
                  <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="轮播图:">
                <a-upload
                  :file-list="fileListlunbo"
                  accept="image/jpeg,image/x-png,image/x-ms-bmp,image/x-photo-cd,image/x-portablebitmap,image/x-rgb,image/tiff"
                  :remove="handleRemovelunbo"
                  :before-upload="beforeUploadlunbo"
                >
                  <a-button> <a-icon type="upload" /> 选择文件 </a-button>
                </a-upload>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="材料颜色:">
                <a-select
                  size="large"
                  placeholder="材料颜色"
                  style="width: 230px; margin-right: 8px"
                  v-model="oneshopgooddata.shop_goods_color"
                  allowClear
                >
                  <a-select-option
                    v-for="(items, index) in allcolor"
                    :key="index"
                    :label="items.name"
                    :value="items.id"
                    >{{ items.name }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="材料工种:">
                <a-select
                  size="large"
                  placeholder="材料工种"
                  style="width: 230px; margin-right: 8px"
                  v-model="oneshopgooddata.shop_goods_profession"
                  allowClear
                >
                  <a-select-option
                    v-for="(items, index) in allworktype"
                    :key="index"
                    :label="items.name"
                    :value="items.id"
                    >{{ items.name }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="厂家地址:">
                <a-input
                  size="large"
                  :maxLength="100"
                  style="width: 230px; margin-right: 8px"
                  type="text"
                  placeholder="厂家地址"
                  v-model="oneshopgooddata.shop_goods_brand"
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="材料型号:">
                <a-input
                  size="large"
                  :maxLength="50"
                  style="width: 230px; margin-right: 8px"
                  type="text"
                  placeholder="材料型号"
                  v-model="oneshopgooddata.shop_goods_model"
                ></a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="材料材质:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  style="width: 230px"
                  placeholder="材料材质"
                  v-model="oneshopgooddata.shop_goods_texture"
                ></a-input>
              </a-form-item>
              、
            </a-col>
            <a-col :span="12">
              <a-form-item label="材料单位:">
                <a-select
                  size="large"
                  placeholder="材料单位"
                  style="width: 230px; margin-right: 8px"
                  v-model="oneshopgooddata.shop_goods_unit"
                  allowClear
                >
                  <a-select-option
                    v-for="(items, index) in allunit"
                    :key="index"
                    :label="items.name"
                    :value="items.id"
                    >{{ items.name }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="材料发货地:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="100"
                  style="width: 230px"
                  placeholder="材料发货地"
                  v-model="oneshopgooddata.shop_goods_origin"
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="材料分类:"
                v-if="
                  !ifaddcommomuserdata &&
                  oneshopgooddata.shop_goods_class != '' &&
                  oneshopgooddata.shop_goods_class != 'no'
                "
              >
                <a-input
                  size="large"
                  type="text"
                  style="width: 230px"
                  placeholder="材料分类"
                  allowClear
                  readonly="true"
                  v-model="oneshopgooddata.shop_goods_class"
                ></a-input>
              </a-form-item>
              <a-form-item
                label="材料分类:"
                v-if="
                  oneshopgooddata.shop_goods_class == '' ||
                  oneshopgooddata.shop_goods_class == null ||
                  ifaddcommomuserdata ||
                  oneshopgooddata.shop_goods_class == 'no'
                "
              >
                <a-cascader
                  size="large"
                  :display-render="displayRender"
                  style="width: 230px"
                  :options="orgTree"
                  @change="onChange"
                  expand-trigger="hover"
                  placeholder="材料分类"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-col :span="12">
              <a-form-item label="材料说明:">
                <a-input
                  size="large"
                  :maxLength="100"
                  style="width: 230px; margin-right: 8px"
                  type="text"
                  placeholder="材料说明"
                  v-model="oneshopgooddata.shop_goods_explain"
                ></a-input>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="材料服务:">
                <a-input
                  size="large"
                  style="width: 230px; margin-right: 8px"
                  type="text"
                  :maxLength="100"
                  placeholder="材料服务"
                  v-model="oneshopgooddata.shop_goods_server"
                ></a-input>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row>
            <a-form-item label="选择厂家:">
              <a-select
                size="large"
                placeholder="选择厂家"
                style="width: 230px; margin-right: 8px"
                v-model="oneshopgooddata.shop_goods_manufacturers"
                allowClear
              >
                <a-select-option
                  v-for="(items, index) in allsellingdata"
                  :key="index"
                  :label="items.name"
                  :value="items.id"
                  >{{ items.name }}</a-select-option
                >
              </a-select>
            </a-form-item>
          </a-row>
          <a-form :form="form" v-if="ifaddcommomuserdata">
            <a-form-item v-for="k in form.getFieldValue('keys')" :key="k">
              <a-row>
                <a-col :span="12">
                  <a-form-item label="填写规格:">
                    <a-input
                      :maxLength="50"
                      placeholder="填写规格"
                      v-decorator="[
                        `guigename[${k}]`,
                        {
                          validateTrigger: ['change', 'blur'],
                          rules: [
                            {
                              required: true,
                              whitespace: true,
                              message: '请填写规格名称',
                            },
                          ],
                        },
                      ]"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="规格代码:">
                    <a-input
                      :maxLength="50"
                      placeholder="规格代码"
                      v-decorator="[
                        `guigedaima[${k}]`,
                        {
                          validateTrigger: ['change', 'blur'],
                          rules: [
                            {
                              required: true,
                              whitespace: true,
                              message: '请填写规格代码',
                            },
                          ],
                        },
                      ]"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="12">
                  <a-form-item label="进货价格:">
                    <a-input-number
                      :maxLength="50"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                      placeholder="进货价格"
                      :min="0"
                      v-decorator="[`price[${k}]`]"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="规格单位:">
                    <a-select
                      size="large"
                      :maxLength="50"
                      placeholder="规格单位"
                      style="width: 200px; margin-right: 8px"
                      v-decorator="[`unit[${k}]`]"
                      allowClear
                    >
                      <a-select-option
                        v-for="(items, index) in allsizeunit"
                        :key="index"
                        :label="items.name"
                        :value="items.id"
                        >{{ items.name }}</a-select-option
                      >
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="12">
                  <a-form-item label="销售价格:">
                    <a-input-number
                      :maxLength="50"
                      size="large"
                      v-decorator="[`saleprice[${k}]`]"
                      style="width: 200px; margin-right: 8px"
                      placeholder="销售价格"
                      :min="0"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="库存数量:">
                    <a-input-number
                      :maxLength="50"
                      placeholder="库存数量"
                      :min="0"
                      v-decorator="[`goodsnumber[${k}]`]"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <row>
                <a-form-item label="警戒数量:">
                  <a-input-number
                    :maxLength="50"
                    v-decorator="[`jinjienumber[${k}]`]"
                    size="large"
                    style="width: 200px; margin-right: 8px"
                    placeholder="警戒数量"
                    :min="0"
                  />
                </a-form-item>
              </row>
              <a-icon
                type="minus-circle-o"
                :disabled="form.getFieldValue('keys').length === 1"
                @click="() => remove(k)"
              />
            </a-form-item>
            <!-- <a-form-item>
              <a-button type="dashed" style="width: 60%; margin-left: 90px" @click="add">
                <a-icon type="plus" /> 新增材料规格
              </a-button>
            </a-form-item> -->
          </a-form>
        </a-spin>
      </a-modal>
    </div>
    <div>
      <a-modal
        :title="ifaddguige ? '新增材料规格' : '编辑材料规格'"
        :visible="ifchuxianguige"
        :confirm-loading="confirmLoading"
        okText="保存"
        cancelText="取消"
        @ok="handleOkgoodsize"
        :centered="true"
        @cancel="
          () => {
            this.ifchuxianguige = false
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="password">
              <a-row>
                <a-col :span="12">
                  <a-form-item label="填写规格:">
                    <a-input
                      :maxLength="50"
                      placeholder="填写规格"
                      v-model="onegoodssizedata.shop_specification_name"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="规格代码:">
                    <a-input
                      :maxLength="50"
                      placeholder="规格代码"
                      v-model="onegoodssizedata.shop_specification_priority"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="12">
                  <a-form-item label="进货价格:">
                    <a-input-number
                      :maxLength="50"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                      placeholder="进货价格"
                      :min="0"
                      v-model="onegoodssizedata.shop_specification_pcsaleprice"
                    />
                  </a-form-item>

                  <!-- <a-form-item label="商品单位:">
                    <a-input
                      placeholder="商品单位"
                      v-model="onegoodssizedata.shop_specification_unit"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                    />
                  </a-form-item> -->
                </a-col>
                <a-col :span="12">
                  <a-form-item label="材料单位:">
                    <a-select
                      size="large"
                      placeholder="商品单位"
                      style="width: 200px; margin-right: 8px"
                      v-model="onegoodssizedata.shop_specification_unit"
                      allowClear
                    >
                      <a-select-option
                        v-for="(items, index) in allsizeunit"
                        :key="index"
                        :label="items.name"
                        :value="items.id"
                        >{{ items.name }}</a-select-option
                      >
                    </a-select>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row>
                <a-col :span="12">
                  <a-form-item label="销售价格:">
                    <a-input-number
                      :maxLength="50"
                      size="large"
                      v-model="onegoodssizedata.shop_specification_price"
                      style="width: 200px; margin-right: 8px"
                      placeholder="销售价格"
                      :min="0"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="12">
                  <a-form-item label="库存数量:">
                    <a-input-number
                      placeholder="库存数量"
                      :min="0"
                      :maxLength="50"
                      v-model="onegoodssizedata.shop_specification_inventory"
                      size="large"
                      style="width: 200px; margin-right: 8px"
                    />
                  </a-form-item>
                </a-col>
              </a-row>
              <row>
                <a-form-item label="警戒数量:">
                  <a-input-number
                    v-model="onegoodssizedata.shop_specification_remind"
                    size="large"
                    :maxLength="50"
                    style="width: 200px; margin-right: 8px"
                    placeholder="警戒数量"
                    :min="0"
                  />
                </a-form-item>
              </row>
            </p>
          </a-spin>
        </div>
      </a-modal>
    </div>
    <div>
      <a-modal
        :title="ifaddgoodsclass ? '新增厂商直销材料分类' : '编辑材料分类'"
        :visible="ifvisiblegoodsclass"
        :confirm-loading="confirmLoading"
        okText="保存"
        cancelText="取消"
        @ok="handlegoodsclass"
        :centered="true"
        @cancel="
          () => {
            this.ifvisiblegoodsclass = false
            this.newgoodsclassname = ''
            this.newgoodsclassprice = ''
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning" label="材料分类:">
            <a-form-item>
              <a-input size="large" placeholder="材料分类" v-model="newgoodsclassname"></a-input>
            </a-form-item>
            <a-form-item v-if="seletdata.yunfei == 'yes'" label="运费:">
              <a-input-number
                placeholder="运费"
                :min="0"
                :maxLength="50"
                v-model="newgoodsclassprice"
                size="large"
                style="width: 470px"
              />
            </a-form-item>
          </a-spin>
        </div>
      </a-modal>
    </div>

    <a-modal
      title="规格列表"
      :visible="hadleEditallsize"
      :confirm-loading="confirmLoading"
      :maskClosable="false"
      :closable="false"
      :centered="true"
    >
      <a-button
        style="margin-left: 8px"
        class="editable-add-btn"
        size="small"
        type="primary"
        @click="addguige"
        :loading="spinning"
      >
        +新增规格
      </a-button>

      <div id="components-table-demo-size">
        <a-table :columns="detailcolumns" :data-source="allgoodssizedata" size="middle">
          <span slot="action" slot-scope="text, record">
            <template>
              <a @click="xiugaiguige(record)">修改</a>
              <a-divider type="vertical" />
            </template>
            <template>
              <a @click="shanchuguige(record)">删除</a>
              <a-divider type="vertical" />
            </template>
            <template>
              <a @click="showhistory(record)">历史记录</a>
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
            this.errordetail = []
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
                  <div>1）请以每个商品名称命名图片，这样上传之后好分类。例如：shuiguan1,shuiguan2</div>
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
        :visible="ifdaorugoods"
        :confirm-loading="spinning"
        @ok="importFile"
        @cancel="
          () => {
            this.ifdaorugoods = false
            this.spinning = false
            this.file = undefined
            this.fileExcleList = []
            this.fileListlunbo = []
            this.errordetail = []
          }
        "
        okText="开始导入"
        cancelText="取消"
      >
        <template>
          <a-spin :spinning="spinning" size="large">
            <div style="font: 12px arial, 微软雅黑, 宋体">
              <div style="border: 1px solid #ccc">
                <div class="backmingxi">新增材料导入</div>
                <div style="padding: 28px; padding-top: 16px; padding-bottom: 5px">
                  <div style="margin-bottom: 6px">
                    请先下载导入明细模板:
                    <a-span @click="_export()" style="color: blue; cursor: pointer">下载模板</a-span>
                  </div>
                  <div style="margin-bottom: 4px">提示：</div>
                  <div>1）请先下载导入模板并按模板填写材料基本信息，完成后再选择导入文件</div>
                  <div>2）材料名称/规格名称为必填项，否则将导入失败</div>
                  <div>3）导入文件要求是excel格式，文件大小不能超过4M</div>
                  <div>
                    4）材料分类如果只有二级,请按照三级分类填写规则在三级分类位置写"其他",例:"木工辅材/木工板/其他"
                  </div>
                  <div>
                    5）上传时sheet1为材料列表模板，sheet2为材料规格模板，请注意材料规格模板对应材料模板的材料代码！
                  </div>
                  <div>6）导入失败后,请将修改好的excel表重新上传！</div>
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
                <!-- <a-form-item label="导入全部图片:">
                  <a-upload
                    :file-list="fileListlunbo"
                    :multiple="true"
                    :remove="handleRemovelunbo"
                    :before-upload="beforeUploadlunbo"
                  >
                    <a-button size="small" type="primary" :loading="spinning">
                      <a-icon type="upload" /> 选择图片
                    </a-button>
                  </a-upload>
                </a-form-item> -->
              </div>
            </div>
          </a-spin>
        </template>
      </a-modal>
    </div>

    <div>
      <a-modal
        :visible="ifdaoruguige"
        :confirm-loading="spinning"
        @ok="importGuiGeFile"
        @cancel="
          () => {
            this.ifdaoruguige = false
            this.spinning = false
            this.file = undefined
            this.fileExcleList = []
          }
        "
        okText="开始导入"
        cancelText="取消"
      >
        <template>
          <a-spin :spinning="spinning" size="large">
            <div style="font: 12px arial, 微软雅黑, 宋体">
              <div style="border: 1px solid #ccc">
                <div class="backmingxi">新增规格导入</div>
                <div style="padding: 28px; padding-top: 16px; padding-bottom: 5px">
                  <div style="margin-bottom: 6px">
                    请先下载导入明细模板:
                    <a-span @click="downmubancailiao()" style="color: blue; cursor: pointer">下载模板</a-span>
                  </div>
                  <div style="margin-bottom: 4px">提示：</div>
                  <div>1）请先下载导入模板并按模板填规格信息，完成后再选择导入文件</div>
                  <div>2）规格名称为必填项，否则将导入失败</div>
                  <div>3）材料编号为必填项，且该材料已经被使用，否则将导入失败</div>
                  <div>4）导入文件要求是excel格式，文件大小不能超过4M</div>
                </div>
              </div>
              <div style="margin-top: 15px">
                <a-upload :file-list="fileExcleList" :remove="handleRemove" :before-upload="beforeUploadexcel">
                  <a-button size="small" type="primary" :loading="spinning">
                    <a-icon type="upload" /> 选择文件
                  </a-button>
                </a-upload>
              </div>
            </div>
          </a-spin>
        </template>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
let id = 0
const errorcolumns = [
  {
    title: '错误原因',
    dataIndex: 'error',
  },
]
const detailcolumns = [
  {
    title: '材料规格',
    dataIndex: 'shop_specification_name',
  },
  {
    title: '材料规格代码',
    dataIndex: 'shop_specification_priority',
  },
  {
    title: '进货价格',
    dataIndex: 'shop_specification_pcsaleprice',
  },
  {
    title: '规格单位',
    dataIndex: 'sizeunitname',
  },
  {
    title: '销售价格',
    dataIndex: 'shop_specification_price',
  },
  {
    title: '库存数量',
    dataIndex: 'shop_specification_inventory',
  },
  {
    title: '警戒数量',
    dataIndex: 'shop_specification_remind',
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
    width: 400,
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
const columns = [
  {
    title: '材料编号',
    width: 120,
    sorter: true,
    dataIndex: 'shop_goods_id',
  },
  {
    title: '材料代码',
    width: 120,
    sorter: true,
    dataIndex: 'shop_goods_priority',
  },
  {
    title: '材料名称',
    sorter: true,
    dataIndex: 'shop_goods_name',
  },
  {
    title: '材料颜色',
    sorter: true,
    dataIndex: 'colorname',
  },
  {
    title: '材料单位',
    sorter: true,
    dataIndex: 'unitname',
  },
  {
    title: '材料分类',
    sorter: true,
    dataIndex: 'shop_goods_class',
    scopedSlots: { customRender: 'shop_goods_class' },
  },
  {
    title: '好评度',
    sorter: true,
    dataIndex: 'feedback',
  },

  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
import { ACCESS_TOKEN } from '@/store/mutation-types'
import storage from 'store'
import XLSX from 'xlsx'
import STree from '@/components/Tree/Tree'
import Info from '@/views/list/components/Info.vue'
export default {
  name: 'ShopGoodsManagement',
  components: {
    STree,
    Info,
  },
  data() {
    return {
      data: [],
      seletdata: [],
      fileList: [],
      errorcolumns,
      daochufenlei: [],
      errordetail: [],
      nopicturedata: [],
      fileListlunbo: [],
      oldname: '',
      oldprice: '',
      headers: {
        Authorization: storage.get(ACCESS_TOKEN),
      },
      columns,
      allsizeid: [],
      historyColumns,
      goodolddata: {},
      goodssizeolddata: {},
      cailiaolist: [],
      guigelist: [],
      allunit: [],
      alltupian: [],
      allsizeunit: [],
      ifshowhistory: false,
      historydata: [],
      ifaddguige: false,
      ifdaoruguige: false,
      ifchuxianguige: false,
      innerColumns,
      detailcolumns,
      hadleEditallsize: false,
      spinning: false,
      newgoodsclassprice: '',
      visible: false,
      ifdaorutupian: false,
      failecailiaodaoru: false,
      faileguigedaoru: false,
      loading: false,
      ifdaorugoods: false,
      confirmLoading: false,
      ifaddgoodsclass: false,
      ifvisiblegoodsclass: false,
      newgoodssizeid: '',
      goodsclassname: '',
      // baseURL: 'http://localhost:8085/api',
      baseURL: 'http://8.136.103.102:8088/api',
      // baseURL:"http://47.103.34.184:8085/api",
      NodeTreeItem: null,
      tmpStyle: '',
      keywords: '',
      classkeywords: '',
      ifaddcommomuserdata: false,
      devicepassword: '',
      password: '',
      newgoodsclassname: '',
      goodsclassid: '',
      password1: '',
      unitid: '',
      colorid: '',
      worktypeid: '',
      allsellingdata: [],
      fileExcleList: [],
      onegoodssizedata: {},
      options: [],
      file: undefined,
      oneshopgooddata: {},
      allDevice: [],
      allcolor: [],
      keywordsdelete: '',
      deletedata: [],
      allworktype: [],
      haveidgoods: [],
      haveidgoodsfuige: [],
      AllGoodsSize: [],
      threeclassdata: [],
      twoclassdata: [],
      oneclassdata: [],
      allgoodssizedata: [],
      formInline: {
        user: '',
        password: '',
      },
      orgTree: [],
    }
  },
  beforeCreate() {
    this.form = this.$form.createForm(this, { name: 'dynamic_form_item' })
    this.form.getFieldDecorator('keys', { initialValue: [], preserve: true })
  },
  created() {
    this.getOrgTreeData()
    this.getAllUnitData()
    this.getAllSizeUnitData()
    this.getAllColorData()
    this.getAllWokeTypeData()
    this.getAllSellingData()
  },
  mounted() {
    const that = this
    that.getAllShopZhiXiaoGoodsListpage()
  },
  methods: {
    importtupian() {
      const that = this
      that.errordetail = []
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
      } else {
        that.spinning = false
        that.$message.warning('该文件夹没有图片文件!')
        return
      }
    },
    showhistory(e) {
      const that = this
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      if (!e.shop_specification_id) {
        formdate.id = e.shop_goods_id
        formdate.bills_type = 'ShopGoodsManagement'
      } else {
        formdate.id = e.shop_specification_id
        formdate.bills_type = 'ShopGoodsSizeManagement'
      }

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
    getAllSellingData() {
      const that = this
      that
        .$request({
          url: '/user/getAllSellingDataListpage',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            res.data.forEach((item) => {
              item.id = item.shop_warehouse_id
              item.name = item.shop_warehouse_name
            })
            that.allsellingdata = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getAllWokeTypeData() {
      const that = this
      that
        .$request({
          url: '/user/getAllGongzhong1Listpage',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            res.data.forEach((item) => {
              item.id = item.worker_two_id
              item.name = item.worker_two_name
            })
            that.allworktype = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getAllColorData() {
      const that = this
      that
        .$request({
          url: '/user/getAllColorDataListpage',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            res.data.forEach((item) => {
              item.id = item.shop_goods_color_id
              item.name = item.shop_goods_color_name
            })
            that.allcolor = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getAllUnitData() {
      const that = this
      that
        .$request({
          url: '/user/getAllUnitsDataListpage',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            res.data.forEach((item) => {
              item.id = item.shop_goods_unit_id
              item.name = item.shop_goods_unit_name
            })
            that.allunit = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getAllSizeUnitData() {
      const that = this
      that
        .$request({
          url: '/user/getAllSizeUnitDataListPage',
          method: 'get',
          params: {},
        })
        .then((res) => {
          if (res.code == 200) {
            res.data.forEach((item) => {
              item.id = item.shop_specification_unit_id
              item.name = item.shop_specification_unit_name
            })
            that.allsizeunit = res.data
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    handleOkgoodsize() {
      const that = this
      that.spinning = true
      if (
        that.onegoodssizedata.shop_specification_name == null ||
        that.onegoodssizedata.shop_specification_name == ''
      ) {
        that.spinning = false
        that.$message.warning('请填写规格名称!')
        return
      }
      if (
        that.onegoodssizedata.shop_specification_priority == null ||
        that.onegoodssizedata.shop_specification_priority == ''
      ) {
        that.spinning = false
        that.$message.warning('请填写规格代码!')
        return
      }
      that.onegoodssizedata.bills_type = 'ShopGoodsSizeManagement'
      that.onegoodssizedata.myid = that.$store.state.admin.user_id
      var data = ''
      if (that.ifaddguige) {
        data = '新增'
      } else {
        data = '修改后'
      }

      if (that.ifaddguige) {
        that.onegoodssizedata.user_operation_record_detail =
          data + '材料规格：' + that.onegoodssizedata.shop_specification_name
        that.onegoodssizedata.shop_goods_id = that.newgoodssizeid
        this.$request({
          url: '/user/addNewZhiXiaoGoodssize',
          method: 'get',
          params: that.onegoodssizedata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.ifchuxianguige = false
              that.onegoodssizedata = {}
              that.getonedata()
              that.$message.success('新增成功!')
            } else if (res.status == 406) {
              that.spinning = false
              this.AllGoodsSize = []
              that.$message.warning('抱歉,该规格代码已经被使用,请重新填写!')
              return
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        var xiugainame = ''
        if (that.goodssizeolddata.shop_specification_name != that.onegoodssizedata.shop_specification_name) {
          xiugainame =
            '材料规格名称：' +
            that.goodssizeolddata.shop_specification_name +
            ',修改为：' +
            that.onegoodssizedata.shop_specification_name +
            ','
        }

        var xiugaidaima = ''
        if (that.goodssizeolddata.shop_specification_priority != that.onegoodssizedata.shop_specification_priority) {
          xiugaidaima =
            '材料规格代码：' +
            that.goodssizeolddata.shop_specification_priority +
            ',修改为：' +
            that.onegoodssizedata.shop_specification_priority +
            ','
        }

        var xiugaiunit = ''
        if (that.goodssizeolddata.shop_specification_unit != that.onegoodssizedata.shop_specification_unit) {
          xiugaiunit =
            '规格单位：' +
            that.goodssizeolddata.shop_specification_unit +
            ',修改为：' +
            that.onegoodssizedata.shop_specification_unit +
            ','
        }

        var xiugaijinjia = ''
        if (that.goodssizeolddata.shop_specification_price != that.onegoodssizedata.shop_specification_price) {
          xiugaijinjia =
            '销售价格：' +
            that.goodssizeolddata.shop_specification_price +
            ',修改为：' +
            that.onegoodssizedata.shop_specification_price +
            ','
        }

        var xiugaisaleprice = ''
        if (
          that.goodssizeolddata.shop_specification_pcsaleprice != that.onegoodssizedata.shop_specification_pcsaleprice
        ) {
          xiugaisaleprice =
            '进货价格：' +
            that.goodssizeolddata.shop_specification_pcsaleprice +
            ',修改为：' +
            that.onegoodssizedata.shop_specification_pcsaleprice +
            ','
        }

        var xiugaikucun = ''
        if (that.goodssizeolddata.shop_specification_inventory != that.onegoodssizedata.shop_specification_inventory) {
          xiugaikucun =
            '库存数量：' +
            that.goodssizeolddata.shop_specification_inventory +
            ',修改为：' +
            that.onegoodssizedata.shop_specification_inventory +
            ','
        }

        var xiugaijinjie = ''
        if (that.goodssizeolddata.shop_specification_remind != that.onegoodssizedata.shop_specification_remind) {
          xiugaijinjie =
            '警戒数量：' +
            that.goodssizeolddata.shop_specification_remind +
            ',修改为：' +
            that.onegoodssizedata.shop_specification_remind
        }

        that.onegoodssizedata.user_operation_record_detail =
          xiugainame + xiugaidaima + xiugaiunit + xiugaijinjia + xiugaisaleprice + xiugaikucun + xiugaijinjie

        this.$request({
          url: '/user/updateNewZhiXiaoGoodssize',
          method: 'get',
          params: that.onegoodssizedata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.onegoodssizedata = {}
              that.goodssizeolddata = {}
              that.ifchuxianguige = false
              that.getonedata()
              that.$message.success('更新成功!')
            } else if (res.status == 406) {
              that.spinning = false
              this.AllGoodsSize = []
              that.$message.warning('抱歉,该规格代码已经被使用,请重新填写!')
              return
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },
    addguige() {
      const that = this
      that.onegoodssizedata = {}
      that.ifchuxianguige = true
      that.ifaddguige = true
    },
    xiugaiguige(e) {
      const that = this
      that.ifchuxianguige = true
      that.ifaddguige = false
      that.goodssizeolddata = JSON.parse(JSON.stringify(e))
      that.onegoodssizedata = JSON.parse(JSON.stringify(e))
    },
    shanchuguige(e) {
      const that = this
      this.$confirm({
        title: '是否确定删除该规格?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          that.spinning = true
          formdate.bills_type = 'ShopGoodsSizeManagement'
          formdate.myid = that.$store.state.admin.user_id
          formdate.id = e.shop_specification_id
          formdate.shop_specification_name = e.shop_specification_name
          this.$request({
            url: '/user/deleteNewGoodssize',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                that.ifchuxianguige = false
                that.getonedata()
                that.$message.success('删除成功!')
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
    hadleEditGuige(e) {
      const that = this
      that.hadleEditallsize = true
      that.newgoodssizeid = e.shop_goods_id
      this.getonedata()
    },
    getonedata() {
      const that = this
      var formdate = {}
      formdate.shop_goods_id = that.newgoodssizeid
      this.$request({
        url: '/user/getOneShopgooddataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.allgoodssizedata = res.data.onegoodssizedata
            that.allgoodssizedata.forEach((item) => {
              if (item.shop_specification_unit) {
                item.shop_specification_unit = Number(item.shop_specification_unit)
              }
            })
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onChange(value, selectedOptions) {
      console.log(selectedOptions)
      var alldata = []
      selectedOptions.forEach((element) => {
        alldata.push(element.label)
      })
      var newdata = alldata.join('/')
      // this.oneshopgooddata.shop_goods_class = selectedOptions[value.length - 1].label
      this.oneshopgooddata.shop_goods_class = newdata
    },
    displayRender({ labels }) {
      return labels[labels.length - 1]
    },
    remove(k) {
      const { form } = this
      const keys = form.getFieldValue('keys')
      form.setFieldsValue({
        keys: keys.filter((key) => key !== k),
      })
    },
    add() {
      const { form } = this
      const keys = form.getFieldValue('keys')
      const nextKeys = keys.concat(id++)
      form.setFieldsValue({
        keys: nextKeys,
      })
    },

    handlegoodsclass() {
      const that = this
      if (that.newgoodsclassname == '' || that.newgoodsclassname == null) {
        that.$message.warning('请填写材料分类!')
        return
      }
      if (that.seletdata.yunfei == 'yes') {
        if (that.newgoodsclassprice == '' || that.newgoodsclassprice == null || that.newgoodsclassprice == 0) {
          that.$message.warning('请填写材料运费!')
          return
        }
      }
      if (that.ifaddgoodsclass) {
        //新增商品类别
        that.spinning = true
        var formdate = {}
        formdate.myid = that.$store.state.admin.user_id
        formdate.classtype = that.seletdata.classtype
        formdate.classname = that.newgoodsclassname
        formdate.shop_goods_ifzhixiao = 1
        if (that.seletdata.classtype != '0') {
          formdate.parentid = that.seletdata.id
        } else {
          formdate.shop_one_price = that.newgoodsclassprice
        }
        this.$request({
          url: '/user/addGoodsClassByClassType',
          method: 'get',
          params: formdate,
        })
          .then((res) => {
            if (res.status == 200) {
              that.ifvisiblegoodsclass = false
              that.newgoodsclassprice = ''
              that.newgoodsclassname = ''
              that.oldname = ''
              that.oldprice = ''
              that.restart()
              that.$message.success('新增厂商直销材料分类成功!')
            } else {
              that.spinning = false
              that.$message.error('抱歉,未知错误,请联系管理员!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        //新增商品类别
        that.spinning = true
        var formdate = {}
        formdate.myid = that.$store.state.admin.user_id
        formdate.id = that.seletdata.id
        formdate.classtype = that.seletdata.classtype
        formdate.classname = that.newgoodsclassname
        formdate.oldname = that.oldname
        if (that.seletdata.yunfei == 'yes') {
          formdate.shop_one_price = that.newgoodsclassprice
          formdate.oldprice = that.oldprice
        }
        this.$request({
          url: '/user/updateGoodsClassByClassType',
          method: 'get',
          params: formdate,
        })
          .then((res) => {
            if (res.status == 200) {
              that.ifvisiblegoodsclass = false
              that.newgoodsclassprice = ''
              that.restart()
              that.$message.success('编辑材料分类成功!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      }
    },

    importGuiGeFile() {
      const that = this
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
        let json = XLSX.utils.sheet_to_json($t.wb.Sheets[$t.wb.SheetNames[0]])
        if (json.length == 0) {
          setTimeout(() => {
            this.ifdaorugoods = false
            this.file = undefined
            this.fileExcleList = []
          }, 500)
        } else {
          $t.dealguigeFile($t.analyzeData(json)) // analyzeData: 解析导入数据
        }
      }
      if (this.rABS) {
        reader.readAsArrayBuffer(f)
      } else {
        reader.readAsBinaryString(f)
      }
    },
    importFile: function () {
      const that = this
      that.errordetail = []
      that.nopicturedata = []
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
          that.faileguigedaoru = true
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
          that.haveidgoods = []
          that.haveidgoodsfuige = []
          that.cailiaolist.forEach((item) => {
            that.guigelist.forEach((element) => {
              if (item.shop_goods_priority == element.shop_goods_priority) {
                item.guigedetail.push(element)
              }
            })
          })
          that.spinning = false
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
                that.cailiaolist = []
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
      formdata.cailiaolist = JSON.stringify(that.cailiaolist)
      formdata.myid = that.$store.state.admin.user_id
      that
        .$request({
          url: '/user/addAllZhiXiaoGoodsdata',
          method: 'post',
          data: formdata,
        })
        .then((res) => {
          if (res.status == 200) {
            that.fileExcleList = []
            that.fileListlunbo = []
            that.alltupian = []
            that.ifdaorugoods = false
            that.spinning = false
            that.failecailiaodaoru = false
            that.faileguigedaoru = false
            that.getAllShopZhiXiaoGoodsListpage()
            that.$message.success('导入信息成功!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,导入材料信息失败,请重新尝试!')
          return
        })
    },
    onSelect(selectedKeys, info) {
      const that = this
      var newtitle = ''
      var id = info.node.value
      var parentid = info.node._props.dataRef.parentid
      var classtype = info.node._props.dataRef.classtype
      if (classtype == '3') {
        //三级分类
        var oneid
        newtitle = info.node._props.dataRef.label
        that.twoclassdata.forEach((item) => {
          if (parentid == item.id) {
            oneid = item.parentid
            newtitle = item.title + '/' + newtitle
          }
        })
        that.oneclassdata.forEach((element) => {
          if (oneid == element.id) {
            newtitle = element.title + '/' + newtitle
          }
        })
      } else if (classtype == '2') {
        newtitle = info.node._props.dataRef.label
        that.oneclassdata.forEach((item) => {
          if (parentid == item.id) {
            newtitle = item.title + '/' + newtitle
          }
        })
      } else if (classtype == '1') {
        newtitle = info.node._props.dataRef.label
      }
      this.classkeywords = newtitle
      this.getAllShopZhiXiaoGoodsListpage()
    },
    orgAddoneclass() {
      const that = this
      that.ifaddgoodsclass = true
      that.NodeTreeItem = false
      that.ifvisiblegoodsclass = true
      that.seletdata.classtype = '0'
      that.seletdata.yunfei = 'yes'
    },
    orgAdd() {
      // 写自己的业务逻辑
      const that = this
      that.ifaddgoodsclass = true
      that.ifvisiblegoodsclass = true
    },
    orgEdit() {
      const that = this
      that.ifaddgoodsclass = false
      that.ifvisiblegoodsclass = true
      that.oldname = JSON.parse(JSON.stringify(that.seletdata.title))
      that.newgoodsclassname = JSON.parse(JSON.stringify(that.seletdata.title))
      that.newgoodsclassprice = JSON.parse(JSON.stringify(that.seletdata.price))
      that.oldprice = JSON.parse(JSON.stringify(that.seletdata.price))
      if (that.seletdata.classtype == '1') {
        that.seletdata.yunfei = 'yes'
      }
    },
    orgDelete() {
      const that = this
      this.$confirm({
        title: '是否确定删除该材料分类?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('zzzzzzzzzzzzzzzzzzzzzzzzzz')
          console.log(that.seletdata.label)
          this.keywordsdelete = that.seletdata.label
          this.getiddeletaclass()
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    onRightClick({ event, node }) {
      this.seletdata = node.dataRef
      const x = event.currentTarget.offsetLeft + event.currentTarget.clientWidth
      const y = event.currentTarget.offsetTop
      this.NodeTreeItem = {
        pageX: x,
        pageY: y,
        id: node._props.eventKey,
        title: node._props.title,
        parentOrgId: node._props.dataRef.parentOrgId || null,
      }
      this.tmpStyle = {
        position: 'absolute',
        maxHeight: 40,
        textAlign: 'center',
        left: `${x + 10 - 0}px`,
        top: `${y + 6 - 0}px`,
        display: 'flex',
        flexDirection: 'row',
      }
    },
    analyzeData: function (data) {
      // 此处可以解析导入数据
      return data
    },
    dealguigeFile: function (data) {
      const that = this
      var list = []
      var flag = true
      var kongming = 0
      var kongming1 = 0
      data.forEach((element) => {
        kongming++
        if (!element.close) {
          var str = {}
          if (element['规格名称'] && element['材料代码'] && element['规格代码']) {
            for (var i in element) {
              str[that.Englishname(i)] = (element[i] + '').trim()
            }
            list.push(str)
          } else {
            kongming1 = kongming
            flag = false
            return
          }
        }
      })
      if (data.length <= 0) {
        that.$message.error('请导入正确数据!')
        that.faileguigedaoru = true
        return
      } else {
        if (!flag) {
          that.spinning = false
          that.faileguigedaoru = true
          that.$message.error('规格列表中第' + kongming1 + '行材料代码/规格代码/规格名称不能为空,请重新填写excel')
          var data = { error: '规格列表中第' + kongming1 + '行材料代码/规格代码/规格名称不能为空,请重新填写excel' }
          that.errordetail.push(data)
          return
        }
        var havewenzi = []
        var l = 1
        var p = 0
        list.forEach((item) => {
          l++
          if (
            !isNumber(item.shop_specification_price) ||
            !isNumber(item.shop_specification_pcsaleprice) ||
            !isNumber(item.shop_specification_inventory) ||
            !isNumber(item.shop_specification_remind)
          ) {
            p = l
            havewenzi.push(item)
          }
        })
        if (havewenzi.length > 0) {
          that.spinning = false
          that.faileguigedaoru = true
          that.$message.error('规格列表中第' + p + '行规格的价格，数量都只能填写数字,请重新填写excel')
          var data = { error: '规格列表中第' + p + '行规格的价格，数量都只能填写数字,请重新填写excel' }
          that.errordetail.push(data)
          return
        } else {
          adds()
        }
        function isNumber(val) {
          var regPos = /^\d+(\.\d+)?$/ //非负浮点数
          var regNeg = /^(-(([0-9]+\.[0-9]*[1-9][0-9]*)|([0-9]*[1-9][0-9]*\.[0-9]+)|([0-9]*[1-9][0-9]*)))$/ //负浮点数
          if (regPos.test(val) || regNeg.test(val)) {
            return true
          } else {
            return false
          }
        }
        function adds() {
          var popp = []
          list.forEach((item) => {
            popp.push(item.shop_specification_priority)
          })
          var tmp = []
          if (Array.isArray(list)) {
            popp
              .concat()
              .sort()
              .sort(function (a, b) {
                if (a == b && tmp.indexOf(a) === -1) tmp.push(a)
              })
          }
          if (tmp.length > 0) {
            tmp.forEach((item) => {
              var data = { error: '抱歉,表格中规格代码：' + item + ',多个规格填写重复,请勿填写重复代码' }
              that.errordetail.push(data)
            })
            that.spinning = false
            that.faileguigedaoru = true
            return
          }
          var newlist = []
          var nodui = 1

          list.forEach((element) => {
            nodui++
            var goods = {}
            goods.shop_goods_priority = element.shop_goods_priority
            goods.shop_specification_priority = element.shop_specification_priority
            goods.shop_specification_name = element.shop_specification_name
            goods.shop_specification_price = element.shop_specification_price
            var flag = true
            that.allsizeunit.forEach((item) => {
              if (element.shop_specification_unit == item.name) {
                goods.shop_specification_unit = item.id
                flag = false
              }
            })
            if (flag) {
              that.spinning = false
              that.faileguigedaoru = true
              that.$message.error('抱歉,导入材料规格中第' + nodui + '行规格单位并不存在,请重新检查填写!')
              var data = { error: '抱歉,导入材料规格中第' + nodui + '行规格单位并不存在,请重新检查填写!' }
              that.errordetail.push(data)
              return
            }
            goods.shop_specification_pcsaleprice = element.shop_specification_pcsaleprice
            goods.shop_specification_inventory = element.shop_specification_inventory
            goods.shop_specification_remind = element.shop_specification_remind
            newlist.push(goods)
          })

          that.guigelist = newlist
          return
          var end = false
          newlist.forEach((element) => {
            that
              .$request({
                url: '/user/addNewGoodssize',
                method: 'get',
                params: element,
              })
              .then((res) => {
                if (res.status == 200) {
                  end = true
                }
              })
              .catch(function () {
                that.spinning = false
                end = false
                that.$message.error('抱歉,导入规格信息失败,请检查材料编号!')
                return
              })
          })
          setTimeout(() => {
            if (end) {
              that.fileExcleList = []
              that.ifdaoruguige = false
              that.spinning = false
              that.getonedata()
              that.$message.success('导入信息成功!')
            }
          }, 5000)
        }
      }
    },
    dealFile: function (data) {
      const that = this
      var list = []
      var flag = true
      var kongzhi = 0
      var kongzhi1 = 0
      data.forEach((element) => {
        kongzhi++
        if (!element.close) {
          var str = {}
          if (element['材料名称'] && element['材料代码']&&element["材料分类"]) {
            for (var i in element) {
              str[that.Englishname(i)] = (element[i] + '').trim()
              console.log(str)
            }
            list.push(str)
          } else {
            kongzhi1 = kongzhi
            flag = false
            return
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
          that.$message.error('材料列表中第' + kongzhi1 + '行材料名称/材料代码/材料分类不能为空,请重新填写excel')
          var data = { error: '材料列表中第' + kongzhi1 + '行材料名称/材料代码/材料分类不能为空,请重新填写excel' }
          that.errordetail.push(data)
          return
        }
        that.alltupian = []

        setTimeout(() => {
          adds()
        }, 100)

        function adds() {
          var popp = []
          list.forEach((item) => {
            popp.push(item.shop_goods_priority)
          })
          var tmp = []
          if (Array.isArray(list)) {
            popp
              .concat()
              .sort()
              .sort(function (a, b) {
                if (a == b && tmp.indexOf(a) === -1) tmp.push(a)
              })
          }
          if (tmp.length > 0) {
            tmp.forEach((item) => {
              var data = { error: '抱歉,表格中材料代码：' + item + ',多个材料填写重复,请勿填写重复编号' }
              that.errordetail.push(data)
            })
            that.spinning = false
            that.failecailiaodaoru = true
            return
          }

          var newlist = []
          var nodui = 1
          list.forEach((element) => {
            nodui++
            var goods = {}
            goods.shop_goods_priority = element.shop_goods_priority //材料代码
            goods.shop_goods_name = element.shop_goods_name
            goods.shop_goods_manufactureradd = element.shop_goods_manufactureradd
            that.allsellingdata.forEach((item) => {
              //厂商不需要必须填写
              if (element.shop_goods_manufacturers == item.name) {
                goods.shop_goods_manufacturers = item.id
              }
            })
            var flag = true
            that.allworktype.forEach((item) => {
              if (element.shop_goods_profession == item.name) {
                goods.shop_goods_profession = item.id
                flag = false
              }
            })
            if (flag) {
              that.$message.error('抱歉,导入材料中第' + nodui + '行的材料工种并不存在,请重新检查填写!')
              that.spinning = false
              that.failecailiaodaoru = true

              var data = { error: '抱歉,导入材料中第' + nodui + '行的材料工种并不存在,请重新检查填写!' }
              that.errordetail.push(data)
              return
            }
            goods.shop_goods_discount = element.shop_goods_discount
            goods.shop_goods_origin = element.shop_goods_origin
            var flag1 = true
            that.allunit.forEach((item) => {
              if (element.shop_goods_unit == item.name) {
                goods.shop_goods_unit = item.id
                flag1 = false
              }
            })
            if (flag1) {
              that.$message.error('抱歉,导入材料中第' + nodui + '行的材料单位并不存在,请重新检查填写!')
              that.spinning = false
              that.failecailiaodaoru = true
              var data = { error: '抱歉,导入材料中第' + nodui + '行的材料单位并不存在,请重新检查填写!' }
              that.errordetail.push(data)
              return
            }
            if (element.linkadress == null || element.linkadress == '') {
              that.nopicturedata.push({ number: '1' })
            }
            goods.linkadress = element.linkadress
            console.log(element.linkadress.slice(5));
            goods.shop_goods_brand = element.shop_goods_brand
            goods.shop_goods_class = element.shop_goods_class == '' ? 'no' : element.shop_goods_class
            goods.shop_goods_explain = element.shop_goods_explain
            var flag2 = true
            that.allcolor.forEach((item) => {
              if (element.shop_goods_texture == item.name) {
                goods.shop_goods_color = item.id
                flag2 = false
              }
            })
            if (flag2) {
              that.$message.error('抱歉,导入材料中第' + nodui + '行的材料颜色并不存在,请重新检查填写!')
              that.spinning = false
              that.failecailiaodaoru = true
              var data = { error: '抱歉,导入材料中第' + nodui + '行的材料颜色并不存在,请重新检查填写!' }
              that.errordetail.push(data)
              return
            }
            goods.guigedetail = []
            newlist.push(goods)
          })

          var cuowuhang = 1
          newlist.forEach((element) => {
            cuowuhang++
            var aa = []
            var aaone = []
            var aatwo = []
            var pp = element.shop_goods_class
            var cc = pp.split('/')
            if (cc.length == 2) {
              // pp = pp + '/其他'
              cc.splice(1, 0, '其他')
              console.log('333333')
              console.log(cc)
              // element.shop_goods_class = element.shop_goods_class + '/其他'
              pp = cc.join('/')
              element.shop_goods_class = pp
            }
            var bb = pp.split('/')[2]
            var bbtwo = pp.split('/')[1]
            var bbone = pp.split('/')[0]

            console.log(bbone)
            console.log(bbtwo)
            console.log(bb)
            that.oneclassdata.forEach((item) => {
              if (item.shop_goods_class != 'no' && item.title == bbone) {
                aaone.push(item)
              }
            })

            if (aaone.length > 0) {
              that.twoclassdata.forEach((item) => {
                if (item.shop_goods_class != 'no' && item.title == bbtwo && item.parentid == aaone[0].id) {
                  aatwo.push(item)
                }
              })
            } else {
              that.$message.error('抱歉,第' + cuowuhang + '行第一级分类不存在!')
              that.spinning = false
              that.failecailiaodaoru = true
              var data = {
                error: '抱歉,第' + cuowuhang + '行第一级分类不存在!',
              }
              that.errordetail.push(data)
              return
            }

            if (aatwo.length > 0) {
              that.threeclassdata.forEach((item) => {
                if (item.shop_goods_class != 'no' && item.title == bb && item.parentid == aatwo[0].id) {
                  aa.push(item)
                }
              })
            } else {
              that.$message.error('抱歉,第' + cuowuhang + '行第二级分类不存在!')
              that.spinning = false
              that.failecailiaodaoru = true
              var data = {
                error: '抱歉,第' + cuowuhang + '行第二级分类不存在!',
              }
              that.errordetail.push(data)
              return
            }

            if (element.shop_goods_class != 'no') {
              if (aa.length == 0) {
                that.$message.error('抱歉,第' + cuowuhang + '行第三级分类不存在!')
                that.spinning = false
                that.failecailiaodaoru = true
                var data = {
                  error: '抱歉,第' + cuowuhang + '行第三级分类不存在!',
                }
                that.errordetail.push(data)
                return
              } else {
                element.threeclassid = aa[0].id
              }
            }
          })
          that.cailiaolist = newlist
          return
          var end = false
          newlist.forEach((element) => {
            that
              .$request({
                url: '/user/addAllZhiXiaoGoodsdata',
                method: 'post',
                data: element,
              })
              .then((res) => {
                if (res.status == 200) {
                  end = true
                }
              })
              .catch(function () {
                that.spinning = false
                end = false
                that.$message.error('抱歉,导入材料信息失败!')
                return
              })
          })
          setTimeout(() => {
            if (end) {
              that.fileExcleList = []
              that.fileListlunbo = []
              that.alltupian = []
              that.ifdaorugoods = false
              that.spinning = false
              that.getAllShopZhiXiaoGoodsListpage()
              that.$message.success('导入信息成功!')
            }
          }, 4000)
        }
      }
    },
    Englishname(name) {
      var title = ''
      switch (name) {
        case '相关图片文件名开头':
          title = 'linkadress'
          break
        case '材料编号':
          title = 'shop_goods_id'
          break
        case '材料名称':
          title = 'shop_goods_name'
          break
        case '厂家地址':
          title = 'shop_goods_manufactureradd'
          break
        case '厂商信息':
          title = 'shop_goods_manufacturers'
          break
        case '材料代码':
          title = 'shop_goods_priority'
          break
        case '规格代码':
          title = 'shop_specification_priority'
          break
        case '工种':
          title = 'shop_goods_profession'
          break
        case '折扣':
          title = 'shop_goods_discount'
          break
        case '材料发货地':
          title = 'shop_goods_origin'
          break
        case '厂家地址':
          title = 'shop_goods_brand'
          break
        case '材料单位':
          title = 'shop_goods_unit'
          break
        case '规格单位':
          title = 'shop_specification_unit'
          break
        case '材料分类':
          title = 'shop_goods_class'
          break
        case '材料说明':
          title = 'shop_goods_explain'
          break
        case '材料颜色':
          title = 'shop_goods_texture'
          break
        case '规格名称':
          title = 'shop_specification_name'
          break
        case '进货价格':
          title = 'shop_specification_pcsaleprice'
          break
        case '材料单位':
          title = 'shop_specification_unit'
          break
        case '销售价格':
          title = 'shop_specification_price'
          break
        case '库存数量':
          title = 'shop_specification_inventory'
          break
        case '警戒数量':
          title = 'shop_specification_remind'
          break
        case '材料编号':
          title = 'shop_goods_id'
          break
      }
      return title
    },
    downmubancailiao() {
      var alldata = [
        ['材料编号', '规格名称', '进货价格', '规格单位', '销售价格', '库存数量', '警戒数量'],
        ['56', '1*10*10', '50', '斤', '80', '500', '200'],
      ]
      this.outputXlsxFile(alldata, '材料规格列表')
    },
    beforeUploadfengmian(file) {
      const that = this
      this.fileList = [...this.fileList, file]

      return false
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
    handleRemovefengmian(file) {
      const index = this.fileList.indexOf(file)
      const newFileList = this.fileList.slice()
      newFileList.splice(index, 1)
      this.fileList = newFileList
    },
    handleRemove(file) {
      const index = this.fileExcleList.indexOf(file)
      const newFileList = this.fileExcleList.slice()
      newFileList.splice(index, 1)
      this.fileExcleList = newFileList
    },
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出材料列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllShopZhiXiaoGoodsListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [
                  [
                    '材料编号',
                    '材料名称',
                    '材料颜色',
                    '材料单位',
                    '材料分类',
                    '好评度',
                    '工种',
                    '厂商信息',
                    '厂家地址',
                    '材料服务',
                    '材料发货地',
                    '折扣',
                    '材料说明',
                  ],
                ]
                res.data.forEach((element) => {
                  var onedata = [
                    element.shop_goods_id == null ? '' : element.shop_goods_id,
                    element.shop_goods_name == null ? '' : element.shop_goods_name,
                    element.colorname == null ? '' : element.colorname,
                    element.unitname == null ? '' : element.unitname,
                    element.shop_goods_class == null ? '' : element.shop_goods_class,
                    element.shop_goods_feedback == null ? '' : element.shop_goods_feedback,
                    element.worktypename == null ? '' : element.worktypename,
                    element.manufacturersname == null ? '' : element.manufacturersname,
                    element.shop_goods_brand == null ? '' : element.shop_goods_brand,
                    element.shop_goods_server == null ? '' : element.shop_goods_server,
                    element.shop_goods_origin == null ? '' : element.shop_goods_origin,
                    element.shop_goods_discount == null ? '' : element.shop_goods_discount,
                    element.shop_goods_explain == null ? '' : element.shop_goods_explain,
                  ]
                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '材料列表')
                var formdate = {}
                this.$request({
                  url: '/user/getAllShopGoodsSIzeListpage',
                  method: 'get',
                  params: formdate,
                })
                  .then((res) => {
                    if (res.code == 200) {
                      that.spinning = false
                      var alldata = [
                        [
                          '材料名称',
                          '规格编号',
                          '材料规格',
                          '进货价格',
                          '规格单位',
                          '销售价格',
                          '库存数量',
                          '警戒数量',
                        ],
                      ]
                      res.data.forEach((element) => {
                        var onedata = [
                          element.shop_goods_name == null ? '' : element.shop_goods_name,
                          element.shop_specification_id == null ? '' : element.shop_specification_id,
                          element.shop_specification_name == null ? '' : element.shop_specification_name,
                          element.shop_specification_price == null ? '' : element.shop_specification_price,
                          element.shop_specification_unit_name == null ? '' : element.shop_specification_unit_name,
                          element.shop_specification_pcsaleprice == null ? '' : element.shop_specification_pcsaleprice,
                          element.shop_specification_inventory == null ? '' : element.shop_specification_inventory,
                          element.shop_specification_remind == null ? '' : element.shop_specification_remind,
                        ]
                        alldata.push(onedata)
                      })
                      this.outputXlsxFile(alldata, '材料规格列表')
                    }
                  })
                  .catch(function () {
                    that.spinning = false
                    that.$message.error('抱歉,未知错误,请联系管理员!')
                  })
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
    handleCanceladd() {
      const that = this
      this.visible = false
      that.oneshopgooddata = {}
      that.fileList = []
      that.fileListlunbo = []
    },
    beforeUploadexcel(file) {
      const that = this
      this.fileExcleList = [...this.fileExcleList, file]
    },

    handleAddGoodsclass(item) {
      const that = this

      that.goodsclassid = item.id
      that.getAllShopZhiXiaoGoodsListpage()
    },
    getOneTreeData() {
      const that = this
      if (that.goodsclassname != '') {
        that.orgTree = []
        var formdate = {}
        this.$request({
          url: '/user/getAllGoodsClass',
          method: 'get',
          params: formdate,
        })
          .then((res) => {
            if (res.code == 200) {
              that.spinning = false
              var alldata = []
              res.data.oneclass.forEach((item) => {
                alldata.push(item)
              })
              res.data.twoclass.forEach((item) => {
                alldata.push(item)
              })
              res.data.threeclass.forEach((item) => {
                alldata.push(item)
              })
              alldata.forEach((item) => {
                if (item.label == that.goodsclassname) {
                  that.orgTree.push(item)
                }
              })
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        that.restart()
      }
    },
    getOrgTreeData() {
      //查询树形列表的全部数据
      const that = this
      that.spinning = true
      that.orgTree = []
      that.daochufenlei = []
      that.threeclassdata = []
      that.twoclassdata = []
      that.oneclassdata = []
      var formdate = {}
      formdate.zhixiao = 'yes'
      this.$request({
        url: '/user/getAllGoodsClass',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.threeclassdata = res.data.threeclass
            that.twoclassdata = res.data.twoclass
            that.oneclassdata = res.data.oneclass
            res.data.twoclass.forEach((element) => {
              element.children = []
              res.data.threeclass.forEach((item) => {
                item.isLeaf = true
                if (item.parentid == element.id) {
                  element.children.push(item)
                }
              })
            })
            var allchildren = res.data.twoclass
            res.data.oneclass.forEach((element) => {
              element.children = []
              allchildren.forEach((item) => {
                if (item.parentid == element.id) {
                  element.children.push(item)
                }
              })
            })
            var newallchildren = res.data.oneclass
            that.orgTree = newallchildren

            var newdddd = []
            res.data.threeclass.forEach((item) => {
              item.daochudata = item.label
              res.data.twoclass.forEach((element) => {
                if (item.parentid == element.id) {
                  item.daochudata = element.label + '/' + item.daochudata
                  res.data.oneclass.forEach((edd) => {
                    if (element.parentid == edd.id) {
                      item.daochudata = edd.label + '/' + item.daochudata
                      newdddd.push(item)
                    }
                  })
                }
              })
            })
            that.daochufenlei = newdddd
            console.log('撒士大夫士大夫但是')
            console.log(that.daochufenlei)
          } else {
            that.orgTree = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    restart() {
      const that = this
      that.NodeTreeItem = false
      that.keywords = ''
      ;(that.classkeywords = ''), (that.goodsclassname = ''), (that.newgoodsclassname = '')
      that.getOrgTreeData()
      that.getAllShopZhiXiaoGoodsListpage()
    },
    handleEdit(e) {
      const that = this
      that.visible = true
      that.ifaddgoodsclass = false
      that.oneshopgooddata.shop_goods_class = ''
      that.spinning = true
      that.goodolddata = e
      that.ifaddcommomuserdata = false
      var formdate = {}
      that.fileListlunbo = []
      formdate.shop_goods_id = e.shop_goods_id
      this.$request({
        url: '/user/getOneShopgooddataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.oneshopgooddata = res.data.onegoodsdata
            if (that.oneshopgooddata.shop_goods_color) {
              that.oneshopgooddata.shop_goods_color = Number(that.oneshopgooddata.shop_goods_color)
            }
            if (that.oneshopgooddata.shop_goods_unit) {
              that.oneshopgooddata.shop_goods_unit = Number(that.oneshopgooddata.shop_goods_unit)
            }
            if (that.oneshopgooddata.shop_goods_profession) {
              that.oneshopgooddata.shop_goods_profession = Number(that.oneshopgooddata.shop_goods_profession)
            }
            if (that.oneshopgooddata.shop_goods_manufacturers) {
              that.oneshopgooddata.shop_goods_manufacturers = Number(that.oneshopgooddata.shop_goods_manufacturers)
            }
            if (res.data.onegoodsdata.shop_goods_picture != null) {
              that.fileList.push({
                uid: '-1',
                name: res.data.onegoodsdata.shop_goods_picture,
                url: res.data.onegoodsdata.shop_goods_picture,
              })
            }
            var data = []
            if (res.data.onegoodsdata.shop_goods_pictures != null) {
              data = res.data.onegoodsdata.shop_goods_pictures.split(',')
              var a = 1
              data.forEach((item) => {
                a++
                that.fileListlunbo.push({
                  uid: a,
                  name: item,
                  url: item,
                })
              })
            }
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    deletecommonuser(e) {
      this.$confirm({
        title: '是否确定删除该商品的全部信息吗?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          console.log('OK')
          this.deleteByid(e)
        },
        onCancel() {
          console.log('Cancel')
        },
      })
    },
    deleteByid(e) {
      const that = this
      var formdate = {}
      that.spinning = true
      formdate.bills_type = 'ShopGoodsManagement'
      formdate.myid = that.$store.state.admin.user_id
      formdate.goodsid = e.shop_goods_id
      formdate.goodsshop_goods_nameid = e.shop_goods_name
      this.$request({
        url: '/user/deleteOneShopGoodDataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.getAllShopZhiXiaoGoodsListpage()
            that.$message.success('删除成功!')
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    addGooddata() {
      const that = this
      // that.$router.push("@/addgoods/AddGoodsDetail");
      that.oneshopgooddata.shop_goods_class = ''
      that.visible = true
      that.ifaddcommomuserdata = true
    },
    handleOk() {
      const that = this
      that.spinning = true
      if (that.oneshopgooddata.shop_goods_name == null || that.oneshopgooddata.shop_goods_name == '') {
        that.$message.warning('请输入材料名称!')
        that.spinning = false
        return
      }
      if (that.oneshopgooddata.shop_goods_priority == null || that.oneshopgooddata.shop_goods_priority == '') {
        that.$message.warning('请输入材料代号!')
        that.spinning = false
        return
      }
      if (this.fileList.length > 1) {
        that.$message.error('抱歉,商品封面只能放一张图片!')
        that.spinning = false
        return
      }
      if (this.fileListlunbo.length > 3) {
        that.$message.error('抱歉,商品轮播图最多放三张!')
        that.spinning = false
        return
      }
      if (that.oneshopgooddata.shop_goods_class == '' || that.oneshopgooddata.shop_goods_class == null) {
        that.oneshopgooddata.shop_goods_class = 'no'
      }
      if (that.oneshopgooddata.shop_goods_class != '') {
        var aa = []
        var pp = that.oneshopgooddata.shop_goods_class
        var bb = pp.split('/')[2]
        var bbone = pp.split('/')[0]
        var bbtwo = pp.split('/')[1]
        var aaone = []
        var aatwo = []

        that.oneclassdata.forEach((item) => {
          if (item.shop_goods_class != 'no' && item.title == bbone) {
            aaone.push(item)
          }
        }) //aaone[0].id 就是一级分类的id，也就是二级分类的parentid

        that.twoclassdata.forEach((item) => {
          if (item.shop_goods_class != 'no' && item.title == bbtwo && item.parentid == aaone[0].id) {
            aatwo.push(item) //aatwo[0].id 就是一级分类的id，也就是二级分类的parentid
          }
        })

        that.threeclassdata.forEach((item) => {
          if (item.title == bb && item.parentid == aatwo[0].id) {
            aa.push(item)
          }
        })
        if (that.oneshopgooddata.shop_goods_class != 'no') {
          if (aa.length == 0) {
            that.$message.error('抱歉,商品分类只能选择第三级别!')
            that.spinning = false
            return
          } else {
            that.oneshopgooddata.threeclassid = aa[0].id
          }
        }
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
              that.oneshopgooddata.shop_goods_picture = res.data.objectKey
              this.asww()
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.warning('抱歉,材料封面上传失败,请尝试重新上传!')
            return
          })
      } else {
        if (nogoodspricture.length > 0) {
          that.oneshopgooddata.shop_goods_picture = nogoodspricture[0]
        } else {
          that.oneshopgooddata.shop_goods_picture = null
        }
        this.asww()
      }
    },
    asww() {
      const that = this
      var goodspricturelunbo = []
      var nogoodspricturelunbo = []
      if (this.fileListlunbo.length > 0) {
        this.fileListlunbo.forEach((item) => {
          if (item instanceof File) {
            goodspricturelunbo.push(item)
          } else {
            nogoodspricturelunbo.push(item.url)
          }
        })
      }
      if (goodspricturelunbo.length > 0) {
        var allpicture = []
        goodspricturelunbo.forEach((file) => {
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
                if (nogoodspricturelunbo.length > 0) {
                  nogoodspricturelunbo.forEach((item) => {
                    allpicture.push(item)
                  })
                }
                that.oneshopgooddata.shop_goods_pictures = allpicture.join(',')
              }
            })
            .catch(function () {
              that.spinning = false
              that.$message.warning('抱歉,材料轮播图上传失败,请尝试重新上传!')
              return
            })
        })

        setTimeout(() => {
          this.asss()
        }, 2000)
      } else {
        if (nogoodspricturelunbo.length > 0) {
          that.oneshopgooddata.shop_goods_pictures = nogoodspricturelunbo.join(',')
        } else {
          that.oneshopgooddata.shop_goods_pictures = null
        }
        this.asss()
      }
    },
    asss() {
      const that = this
      that.oneshopgooddata.bills_type = 'ShopGoodsManagement'
      that.oneshopgooddata.myid = that.$store.state.admin.user_id
      var data = ''
      that.spinning = false
      if (that.ifaddcommomuserdata) {
        data = '新增'
      } else {
        data = '修改后'
      }
      var color1 = ''
      if (that.oneshopgooddata.shop_goods_color != '' && that.oneshopgooddata.shop_goods_color != null) {
        that.allcolor.forEach((item) => {
          if (that.oneshopgooddata.shop_goods_color == item.id) {
            color1 = item.name
          }
        })
      } else {
        color1 = '暂无'
      }
      var gongzhong1 = ''
      if (that.oneshopgooddata.shop_goods_profession != '' && that.oneshopgooddata.shop_goods_profession != null) {
        that.allworktype.forEach((item) => {
          if (that.oneshopgooddata.shop_goods_profession == item.id) {
            gongzhong1 = item.name
          }
        })
      } else {
        gongzhong1 = '暂无'
      }

      var unit1 = ''
      if (that.oneshopgooddata.shop_goods_unit != '' && that.oneshopgooddata.shop_goods_unit != null) {
        that.allunit.forEach((item) => {
          if (that.oneshopgooddata.shop_goods_unit == item.id) {
            unit1 = item.name
          }
        })
      } else {
        unit1 = '暂无'
      }
      var leibie1 = ''
      if (that.oneshopgooddata.shop_goods_class != '' && that.oneshopgooddata.shop_goods_class != null) {
        leibie1 = that.oneshopgooddata.shop_goods_class
      } else {
        leibie1 = '暂无'
      }

      var address1 = ''
      if (that.oneshopgooddata.shop_goods_brand != '' && that.oneshopgooddata.shop_goods_brand != null) {
        address1 = that.oneshopgooddata.shop_goods_brand
      } else {
        address1 = '暂无'
      }

      var xinghao1 = ''
      if (that.oneshopgooddata.shop_goods_model != '' && that.oneshopgooddata.shop_goods_model != null) {
        xinghao1 = that.oneshopgooddata.shop_goods_model
      } else {
        xinghao1 = '暂无'
      }

      var caizhi1 = ''
      if (that.oneshopgooddata.shop_goods_texture != '' && that.oneshopgooddata.shop_goods_texture != null) {
        caizhi1 = that.oneshopgooddata.shop_goods_texture
      } else {
        caizhi1 = '暂无'
      }

      var fahuodi1 = ''
      if (that.oneshopgooddata.shop_goods_origin != '' && that.oneshopgooddata.shop_goods_origin != null) {
        fahuodi1 = that.oneshopgooddata.shop_goods_origin
      } else {
        fahuodi1 = '暂无'
      }

      var shuoming1 = ''
      if (that.oneshopgooddata.shop_goods_explain != '' && that.oneshopgooddata.shop_goods_explain != null) {
        shuoming1 = that.oneshopgooddata.shop_goods_explain
      } else {
        shuoming1 = '暂无'
      }

      var fuwu1 = ''
      if (that.oneshopgooddata.shop_goods_server != '' && that.oneshopgooddata.shop_goods_server != null) {
        fuwu1 = that.oneshopgooddata.shop_goods_server
      } else {
        fuwu1 = '暂无'
      }

      var changshang1 = ''
      if (
        that.oneshopgooddata.shop_goods_manufacturers != '' &&
        that.oneshopgooddata.shop_goods_manufacturers != null
      ) {
        that.allsellingdata.forEach((item) => {
          if (that.oneshopgooddata.shop_goods_manufacturers == item.id) {
            changshang1 = item.name
          }
        })
      } else {
        changshang1 = '暂无'
      }

      if (that.ifaddcommomuserdata) {
        //新增信息
        that.oneshopgooddata.user_operation_record_detail = data + '材料名称：' + that.oneshopgooddata.shop_goods_name
        this.form.validateFields((err, values) => {
          if (!err) {
            var allguigename = []
            var allguigedaima = []
            var allprice = []
            var allunit = []
            var allsaleprice = []
            var allgoodsnumber = []
            var alljinjienumber = []
            const { keys, guigename, guigedaima, price, unit, saleprice, goodsnumber, jinjienumber } = values
            keys.forEach((item) => {
              allguigename.push(guigename[item])
              allguigedaima.push(guigedaima[item])
              allprice.push(price[item])
              allunit.push(unit[item])
              allsaleprice.push(saleprice[item])
              allgoodsnumber.push(goodsnumber[item])
              alljinjienumber.push(jinjienumber[item])
            })
            for (let i = 0; i < allguigename.length; i++) {
              var one = {}
              one.guigename = allguigename[i]
              one.guigedaima = allguigedaima[i]
              one.price = allprice[i]
              one.saleprice = allsaleprice[i]
              one.unit = allunit[i]
              one.goodsnumber = allgoodsnumber[i]
              one.jinjienumber = alljinjienumber[i]
              this.AllGoodsSize.push(one)
            }
          }
        })
        if (this.AllGoodsSize.length > 0) {
          that.oneshopgooddata.AllGoodsSize = JSON.stringify(this.AllGoodsSize)
        }
        this.$request({
          url: '/user/addZhiXiaoGoodsdata',
          method: 'post',
          data: that.oneshopgooddata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.oneshopgooddata = {}
              that.AllGoodsSize = []
              that.fileList = []
              that.fileListlunbo = []
              that.getAllShopZhiXiaoGoodsListpage()
              that.$message.success('新增材料信息成功!')
            } else if (res.status == 406) {
              that.spinning = false
              that.$message.warning('抱歉,该材料代码已经被使用,请重新填写!')
              return
            } else if (res.status == 407) {
              that.spinning = false
              that.$message.warning('抱歉,所填写规格代码已经被使用,请重新填写!')
              return
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        //修改信息

        var color = ''
        if (that.goodolddata.shop_goods_color != '' && that.goodolddata.shop_goods_color != null) {
          that.allcolor.forEach((item) => {
            if (that.goodolddata.shop_goods_color == item.id) {
              color = '材料颜色：' + item.name
            }
          })
        } else {
          color = '材料颜色：暂无'
        }
        var gongzhong = ''
        if (that.goodolddata.shop_goods_profession != '' && that.goodolddata.shop_goods_profession != null) {
          that.allworktype.forEach((item) => {
            if (that.goodolddata.shop_goods_profession == item.id) {
              gongzhong = '材料工种：' + item.name
            }
          })
        } else {
          gongzhong = '材料工种：暂无'
        }

        var unit = ''
        if (that.goodolddata.shop_goods_unit != '' && that.goodolddata.shop_goods_unit != null) {
          that.allunit.forEach((item) => {
            if (that.goodolddata.shop_goods_unit == item.id) {
              unit = '材料单位：' + item.name
            }
          })
        } else {
          unit = '材料单位：暂无'
        }

        var changshang = ''
        if (that.goodolddata.shop_goods_manufacturers != '' && that.goodolddata.shop_goods_manufacturers != null) {
          that.allsellingdata.forEach((item) => {
            if (that.goodolddata.shop_goods_manufacturers == item.id) {
              unit = '厂家地址：' + item.name
            }
          })
        } else {
          changshang = '厂家地址：暂无'
        }

        var leibie = ''
        if (that.goodolddata.shop_goods_class != '' && that.goodolddata.shop_goods_class != null) {
          leibie = '材料分类：' + that.goodolddata.shop_goods_class
        } else {
          leibie = '材料分类：暂无'
        }

        var daima = ''
        if (that.goodolddata.shop_goods_priority != '' && that.goodolddata.shop_goods_priority != null) {
          daima = '材料代码:' + that.oneshopgooddata.shop_goods_priority
        } else {
          daima = '材料代码:暂无'
        }
        var address = ''
        if (that.goodolddata.shop_goods_brand != '' && that.goodolddata.shop_goods_brand != null) {
          address = '厂家地址:' + that.oneshopgooddata.shop_goods_brand
        } else {
          address = '厂家地址:暂无'
        }

        var xinghao = ''
        if (that.goodolddata.shop_goods_model != '' && that.goodolddata.shop_goods_model != null) {
          xinghao = '材料型号:' + that.oneshopgooddata.shop_goods_model
        } else {
          xinghao = '材料型号:暂无'
        }

        var caizhi = ''
        if (that.goodolddata.shop_goods_texture != '' && that.goodolddata.shop_goods_texture != null) {
          caizhi = '材料材质:' + that.oneshopgooddata.shop_goods_texture
        } else {
          caizhi = '材料材质:暂无'
        }

        var fahuodi = ''
        if (that.goodolddata.shop_goods_origin != '' && that.goodolddata.shop_goods_origin != null) {
          fahuodi = '材料发货地:' + that.oneshopgooddata.shop_goods_origin
        } else {
          fahuodi = '材料发货地:暂无'
        }

        var shuoming = ''
        if (that.goodolddata.shop_goods_explain != '' && that.goodolddata.shop_goods_explain != null) {
          shuoming = '材料说明:' + that.oneshopgooddata.shop_goods_explain
        } else {
          shuoming = '材料说明:暂无'
        }

        var fuwu = ''
        if (that.goodolddata.shop_goods_server != '' && that.goodolddata.shop_goods_server != null) {
          fuwu = '材料服务:' + that.oneshopgooddata.shop_goods_server
        } else {
          fuwu = '材料服务:暂无'
        }
        var xiugaidaima = ''
        if (that.goodolddata.shop_goods_priority != that.oneshopgooddata.shop_goods_priority) {
          xiugaidaima =
            '材料代码：' +
            that.goodolddata.shop_goods_priority +
            ',修改为：' +
            that.oneshopgooddata.shop_goods_priority +
            ','
        }

        var shop_goods_name = ''
        if (that.goodolddata.shop_goods_name != that.oneshopgooddata.shop_goods_name) {
          shop_goods_name =
            '材料名称：' + that.goodolddata.shop_goods_name + ',修改为：' + that.oneshopgooddata.shop_goods_name + ','
        }

        var xiugaicolor = ''
        if (that.goodolddata.shop_goods_color != that.oneshopgooddata.shop_goods_color) {
          xiugaicolor = color + ',修改为：' + color1 + ','
        }

        var xiugaigongzhong = ''
        if (that.goodolddata.shop_goods_profession != that.oneshopgooddata.shop_goods_profession) {
          xiugaigongzhong = gongzhong + ',修改为：' + gongzhong1 + ','
        }

        var xiugaileibie = ''
        if (that.goodolddata.shop_goods_class != that.oneshopgooddata.shop_goods_class) {
          xiugaileibie = leibie + ',修改为：' + leibie1 + ','
        }

        var xiugaiunit = ''
        if (that.goodolddata.shop_goods_unit != that.oneshopgooddata.shop_goods_unit) {
          xiugaiunit = unit + ',修改为：' + unit1 + ','
        }

        var xiugaiaddress = ''
        if (that.goodolddata.shop_goods_brand != that.oneshopgooddata.shop_goods_brand) {
          xiugaiaddress = address + ',修改为：' + address1 + ','
        }

        var xiugaixinghao = ''
        if (that.goodolddata.shop_goods_model != that.oneshopgooddata.shop_goods_model) {
          xiugaixinghao = xinghao + ',修改为：' + xinghao1 + ','
        }

        var xiugaicaizhi = ''
        if (that.goodolddata.shop_goods_texture != that.oneshopgooddata.shop_goods_texture) {
          xiugaicaizhi = caizhi + ',修改为：' + caizhi1 + ','
        }

        var xiugaifahuodi = ''
        if (that.goodolddata.shop_goods_origin != that.oneshopgooddata.shop_goods_origin) {
          xiugaifahuodi = fahuodi + ',修改为：' + fahuodi1 + ','
        }

        var xiugaishuoming = ''
        if (that.goodolddata.shop_goods_explain != that.oneshopgooddata.shop_goods_explain) {
          xiugaishuoming = shuoming + ',修改为：' + shuoming1 + ','
        }

        var xiugaifuwu = ''
        if (that.goodolddata.shop_goods_server != that.oneshopgooddata.shop_goods_server) {
          xiugaifuwu = fuwu + ',修改为：' + fuwu1 + ','
        }

        var xiugaichangshang = ''
        if (that.goodolddata.shop_goods_manufacturers != that.oneshopgooddata.shop_goods_manufacturers) {
          xiugaichangshang = changshang + ',修改为：' + changshang1 + ','
        }

        that.oneshopgooddata.user_operation_record_detail =
          shop_goods_name +
          xiugaicolor +
          xiugaigongzhong +
          xiugaileibie +
          xiugaiunit +
          xiugaidaima +
          xiugaiaddress +
          xiugaixinghao +
          xiugaicaizhi +
          xiugaifahuodi +
          xiugaishuoming +
          xiugaifuwu +
          xiugaichangshang
        that.spinning = true
        this.$request({
          url: '/user/updataZhiXiaoGoodsdataByid',
          method: 'get',
          params: that.oneshopgooddata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.fileList = []
              that.fileListlunbo = []
              that.oneshopgooddata = {}
              that.getAllShopZhiXiaoGoodsListpage()
              that.$message.success('修改成功!')
            } else if (res.status == 406) {
              that.spinning = false
              that.$message.warning('抱歉,该材料代码已经被使用,请重新填写!')
              return
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
      that.oneshopgooddata = {}
    },
    onSearch() {
      const that = this
      that.getAllShopZhiXiaoGoodsListpage()
    },
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllShopZhiXiaoGoodsListpage()
    },

    getiddeletaclass() {
      const that = this
      var formdate = {}
      formdate.classkeywords = that.keywordsdelete
      that
        .$request({
          url: '/user/getAllShopZhiXiaoGoodsListpage',
          method: 'get',
          params: formdate,
        })
        .then((res) => {
          if (res.code == 200) {
            that.deletedata = res.data

            if (that.deletedata.length > 0) {
              that.$message.warning('该分类下存在材料,请先将材料移除该分类!')
              return
            } else {
              var formdate = {}
              formdate.myid = that.$store.state.admin.user_id
              formdate.id = that.seletdata.id
              formdate.classtype = that.seletdata.classtype
              formdate.classname = that.seletdata.title
              this.$request({
                url: '/user/deleteGoodsClassById',
                method: 'get',
                params: formdate,
              })
                .then((res) => {
                  if (res.status == 200) {
                    that.keywordsdelete = ''
                    that.NodeTreeItem = false
                    that.deletedata = []
                    that.restart()
                    that.$message.success('删除成功!')
                  }
                })
                .catch(function () {
                  that.$message.error('抱歉,未知错误,请联系管理员!')
                })
            }
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    getAllShopZhiXiaoGoodsListpage() {
      const that = this
      var formdate = {}
      if (that.sort) {
        formdate.sortField = that.sort.field
        formdate.sortOrder = that.sort.order
      }
      if (that.goodsclassid != '') {
        formdate.goodsclassid = that.goodsclassid
      }

      if (that.keywords != '') {
        formdate.keywords = that.keywords
      }
      if (that.classkeywords != '') {
        formdate.classkeywords = that.classkeywords
      }
      that.spinning = true
      that
        .$request({
          url: '/user/getAllShopZhiXiaoGoodsListpage',
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
            that.data = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },

    _export() {
      //需要导出的JSON数据

      const data = {
        材料列表: this.baseData(),

        材料规格列表: this.history1(),

        材料单位列表: this.history2(),

        规格单位列表: this.history3(),

        材料颜色列表: this.history4(),

        材料工种列表: this.history5(),

        材料分类列表: this.history6(),

        厂商信息列表: this.history7(),
      }

      let columnHeaders = {
        材料列表: {
          data0: '材料代码',

          data1: '材料名称',

          data2: '材料颜色',

          data3: '材料单位',

          data4: '材料分类',

          data5: '工种',

          data6: '厂商信息',

          data7: '厂家地址',

          data8: '材料发货地',

          data9: '折扣',

          data10: '材料说明',

          data11: '相关图片文件名开头',
        },

        材料规格列表: {
          extra: '材料代码',

          data0: '规格代码',

          data1: '规格名称',

          data2: '进货价格',

          data3: '规格单位',

          data4: '销售价格',

          data5: '库存数量',

          data6: '警戒数量',
        },

        材料单位列表: {
          extra: '材料单位名称',
        },

        规格单位列表: {
          extra: '规格单位名称',
        },

        材料颜色列表: {
          extra: '材料颜色名称',
        },

        材料工种列表: {
          extra: '材料工种名称',
        },

        材料分类列表: {
          extra: '材料分类名称',
        },

        厂商信息列表: {
          extra: '厂商名称',
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

      XLSX.writeFile(wb, '厂商直销材料模板.xlsx')
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
          data0: '12345',

          data1: '器材',

          data2: '白色',

          data3: '捆',

          data4: '木工辅材/木工板/声达',

          data5: '水电工',

          data6: '杨浦总仓',

          data7: '外滩',

          data8: '上海',

          data9: '8',

          data10: '非常好的塑胶材质的管道',

          data11: 'qicai1',
        },
      ]
    },

    history1() {
      return [
        {
          extra: '12345',
          data0: 'cl001',
          data1: '1*10*10',
          data2: '50',
          data3: '斤',
          data4: '80',
          data5: '500',
          data6: '200',
        },
      ]
    },
    history2() {
      var all = []
      this.allunit.forEach((item) => {
        all.push({
          extra: item.shop_goods_unit_name,
        })
      })
      return all
    },

    history3() {
      var all = []
      this.allsizeunit.forEach((item) => {
        all.push({
          extra: item.shop_specification_unit_name,
        })
      })
      return all
    },

    history4() {
      var all = []
      this.allcolor.forEach((item) => {
        all.push({
          extra: item.shop_goods_color_name,
        })
      })
      return all
    },

    history5() {
      var all = []
      this.allworktype.forEach((item) => {
        all.push({
          extra: item.worker_two_name,
        })
      })
      return all
    },

    history6() {
      var all = []
      this.daochufenlei.forEach((item) => {
        all.push({
          extra: item.daochudata,
        })
      })
      return all
    },

    history7() {
      var all = []
      this.allsellingdata.forEach((item) => {
        all.push({
          extra: item.name,
        })
      })
      return all
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
