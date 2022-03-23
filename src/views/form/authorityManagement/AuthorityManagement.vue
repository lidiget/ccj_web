<template>
  <a-card style="margin-top: 24px" :bordered="false">
    <a-input-search style="margin-left: 16px; width: 272px; margin-bottom: 16px" v-model="keywords" />
    <a-button style="margin-left: 16px" class="editable-add-btn" type="primary" @click="onSearch" :loading="spinning">
      搜索
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      type="primary"
      @click="addroledata"
      v-if="$store.state.rights[0].children[1].children[0].add == 1"
      :loading="spinning"
    >
      +新增权限
    </a-button>
    <a-button
      style="margin-left: 16px"
      class="editable-add-btn"
      icon="vertical-align-bottom"
      @click="daochuliebiao"
      :loading="spinning"
    >
      导出角色信息列表
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
        <span slot="status" slot-scope="text">
          {{ text | status }}
        </span>
        <span slot="create_time" slot-scope="text">
          {{ text | dayjs }}
        </span>
        <span slot="action" slot-scope="text, record">
          <template>
            <a
              @click="handleEdit(record)"
              v-if="record.role_id != 1 && $store.state.rights[0].children[1].children[0].edit == 1"
              >修改</a
            >
            <a-divider
              type="vertical"
              v-if="record.role_id != 1 && $store.state.rights[0].children[1].children[0].edit == 1"
            />
          </template>
          <template>
            <a @click="handleEditGongeneng(record)" v-if="record.role_id != 1">权限范围</a>
            <a-divider type="vertical" v-if="record.role_id != 1" />
          </template>
          <!-- <template>
            <a
              @click="deleterole(record)"
              v-if="record.role_id != 1 && $store.state.rights[0].children[1].children[0].delete == 1"
              >删除</a
            >
            <a-divider type="vertical" v-if="record.role_id != 1" />
          </template>
          <template>
            <a @click="showhistory(record)" v-if="record.role_id != 1">历史记录</a>
          </template> -->

          <a-dropdown>
            <a class="ant-dropdown-link"> 更多 <a-icon type="down" /> </a>
            <a-menu slot="overlay">
              <a-menu-item v-if="record.role_id != 1 && $store.state.rights[0].children[1].children[0].edit == 1">
                <a href="javascript:;" @click="cailiaodingdan(record)">材料订单显示</a>
              </a-menu-item>

              <a-menu-item v-if="record.role_id != 1 && $store.state.rights[0].children[1].children[0].edit == 1">
                <a href="javascript:;" @click="rengongdingdan(record)">人工订单显示</a>
              </a-menu-item>

              <a-menu-item v-if="record.role_id != 1 && $store.state.rights[0].children[1].children[0].edit == 1">
                <a href="javascript:;" @click="yonghuxinxi(record)">用户信息显示</a>
              </a-menu-item>

              <a-menu-item v-if="record.role_id != 1 && $store.state.rights[0].children[1].children[0].delete == 1">
                <a href="javascript:;" @click="deleterole(record)">删除</a>
              </a-menu-item>

              <a-menu-item v-if="record.role_id != 1">
                <a href="javascript:;" @click="showhistory(record)">历史记录</a>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>
        <template slot="title"> 权限信息列表 </template>
      </a-table>
    </a-spin>
    <div>
      <a-modal
        :title="ifaddroledata ? '新增角色信息' : '编辑角色信息'"
        :visible="visible"
        :confirm-loading="confirmLoading"
        okText="保存"
        @ok="handleOk"
        :centered="true"
        cancelText="取消"
        @cancel="handleCancel"
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <p class="edit">
              <a-form-item label="角色名称:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="角色名称"
                  v-model="oneroledata.role_name"
                ></a-input>
              </a-form-item>
              <a-form-item label="权限字符:">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="权限字符"
                  v-model="oneroledata.role_key"
                ></a-input>
              </a-form-item>
              <a-form-item label="状态:">
                <a-select
                  size="large"
                  style="width: 365px"
                  show-search
                  placeholder="状态"
                  option-filter-prop="children"
                  v-model="oneroledata.status"
                >
                  <a-select-option :value="'0'"> 启用 </a-select-option>
                  <a-select-option :value="'1'"> 禁用 </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item label="创建者:" v-if="ifaddroledata">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="创建者"
                  v-model="oneroledata.create_by"
                ></a-input>
              </a-form-item>
              <a-form-item label="更新者:" v-if="!ifaddroledata">
                <a-input
                  size="large"
                  type="text"
                  :maxLength="50"
                  placeholder="更新者"
                  v-model="oneroledata.update_by"
                ></a-input>
              </a-form-item>
              <a-form-item label="备注:">
                <a-input
                  size="large"
                  placeholder="备注"
                  :maxLength="150"
                  v-model="oneroledata.remark"
                  type="textarea"
                />
              </a-form-item>
            </p>
          </a-spin>
        </div>
      </a-modal>
    </div>

    <div>
      <a-modal
        title="功能权限"
        :visible="visibleallgongneng"
        :confirm-loading="false"
        :width="1000"
        okText="保存"
        @ok="handleallgongnengOk"
        :centered="true"
        cancelText="取消"
        @cancel="
          () => {
            this.visibleallgongneng = false
          }
        "
        :maskClosable="false"
        :destroyOnClose="true"
        :confirmLoading="spinning"
      >
        <div>
          <a-spin :spinning="spinning">
            <div style="margin-bottom: 10px">提示：控制后台用户使用功能的权限范围</div>
            <div style="height: 500px">
              <row>
                <a-col :span="8">
                  <div>
                    <a-checkbox
                      :checked="allgongnengdata[0].xitong == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'xitong'))"
                    />
                    <a @click="changecheck1((changetype = 'xitong'), allgongnengdata[0].xitong)">系统管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[1].yonghu == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'yonghu'))"
                    />
                    <a @click="changecheck1((changetype = 'yonghu'), allgongnengdata[1].yonghu)">用户管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[2].yewu == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'yewu'))"
                    />
                    <a @click="changecheck1((changetype = 'yewu'), allgongnengdata[2].yewu)">业务管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[3].shuju == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'shuju'))"
                    />
                    <a @click="changecheck1((changetype = 'shuju'), allgongnengdata[3].shuju)">数据管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[4].cailiao == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'cailiao'))"
                    />
                    <a @click="changecheck1((changetype = 'cailiao'), allgongnengdata[4].cailiao)">材料管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[5].xiaoshou == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'xiaoshou'))"
                    />
                    <a @click="changecheck1((changetype = 'xiaoshou'), allgongnengdata[5].xiaoshou)">销售管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[6].renwu == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'renwu'))"
                    />
                    <a @click="changecheck1((changetype = 'renwu'), allgongnengdata[6].renwu)">任务管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[7].kaquan == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'kaquan'))"
                    />
                    <a @click="changecheck1((changetype = 'kaquan'), allgongnengdata[7].kaquan)">卡卷管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[8].canshu == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'canshu'))"
                    />
                    <a @click="changecheck1((changetype = 'canshu'), allgongnengdata[8].canshu)">参数管理</a>

                    <br /><br />

                    <a-checkbox
                      :checked="allgongnengdata[9].cheliang == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'cheliang'))"
                    />
                    <a @click="changecheck1((changetype = 'cheliang'), allgongnengdata[9].cheliang)">车辆管理</a>

                    <br /><br />
                    <a-checkbox
                      :checked="allgongnengdata[10].caiwu == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'caiwu'))"
                    />
                    <a @click="changecheck1((changetype = 'caiwu'), allgongnengdata[10].caiwu)">财务管理</a>

                    <br /><br />
                    <a-checkbox
                      :checked="allgongnengdata[11].zongjinban == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'zongjinban'))"
                    />
                    <a @click="changecheck1((changetype = 'zongjinban'), allgongnengdata[11].zongjinban)">总经办管理</a>

                    <br /><br />
                    <a-checkbox
                      :checked="allgongnengdata[12].baobiao == 1"
                      style="margin-right: 20px"
                      @change="changecheck((changetype = 'baobiao'))"
                    />
                    <a @click="changecheck1((changetype = 'baobiao'), allgongnengdata[12].baobiao)">报表管理</a>
                  </div>
                </a-col>

                <a-col :span="8">
                  <div>
                    <div v-if="allgongnengdata[0].check">
                      <a-checkbox
                        :checked="allgongnengdata[0].children[0].yonghuguanli == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'yonghuguanli'))"
                      >
                        <a>用户管理</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[0].children[1].quanxianguanli == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'quanxianguanli'))"
                      >
                        <a>权限管理</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[1].check">
                      <a-checkbox
                        :checked="allgongnengdata[1].children[0].putongyonghu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'putongyonghu'))"
                      >
                        <a>普通用户</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[1].gongrenyonghu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'gongrenyonghu'))"
                      >
                        <a>工人用户</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[2].huiyuanyonghu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'huiyuanyonghu'))"
                      >
                        <a>会员用户</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[3].jifenshezhi == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'jifenshezhi'))"
                      >
                        <a>积分升级设置</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[2].check">
                      <a-checkbox
                        :checked="allgongnengdata[2].children[0].dingdanliebiao == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'dingdanliebiao'))"
                      >
                        <a>材料订单</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[2].children[1].rengongdingdan == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'rengongdingdan'))"
                      >
                        <a>人工订单</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[2].children[2].wuliuxinxi == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'wuliuxinxi'))"
                      >
                        <a>物流信息管理</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[3].check">
                      <a-checkbox
                        :checked="allgongnengdata[3].children[0].liulanshuju == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'liulanshuju'))"
                      >
                        <a>浏览数据</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[3].children[1].pinglunshuju == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'pinglunshuju'))"
                      >
                        <a>评论数据</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[3].children[2].renwuliushui == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'renwuliushui'))"
                      >
                        <a>任务流水</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[3].children[3].kaipiaojilu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'kaipiaojilu'))"
                      >
                        <a>开票记录</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[4].check">
                      <a-checkbox
                        :checked="allgongnengdata[4].children[0].cailiaoguanli == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'cailiaoguanli'))"
                      >
                        <a>普通材料管理</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[1].zhixiaocailiaoguanli == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'zhixiaocailiaoguanli'))"
                      >
                        <a>直销材料管理</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[2].changshangxinxi == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'changshangxinxi'))"
                      >
                        <a>厂商信息管理</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[3].cailiaodanwei == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'cailiaodanwei'))"
                      >
                        <a>材料单位管理</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[4].guigedanwei == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'guigedanwei'))"
                      >
                        <a>规格单位管理</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[5].yanseguanli == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'yanseguanli'))"
                      >
                        <a>材料颜色管理</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[6].gongzhongguanli == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'gongzhongguanli'))"
                      >
                        <a>工种管理</a>
                      </a-checkbox>
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[5].check">
                      <a-checkbox
                        :checked="allgongnengdata[5].children[0].xiaoshoubiaodan == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'xiaoshoubiaodan'))"
                      >
                        <a>邀请码设置</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[5].children[1].xiaoshoufenpei == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'xiaoshoufenpei'))"
                      >
                        <a>销售分配管理</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[5].children[2].genzong == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'genzong'))"
                      >
                        <a>销售人员跟踪客户</a>
                      </a-checkbox>
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[6].check">
                      <a-checkbox
                        :checked="allgongnengdata[6].children[0].renwubiaodan == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'renwubiaodan'))"
                      >
                        <a>任务表单</a>
                      </a-checkbox>
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[7].check">
                      <a-checkbox
                        :checked="allgongnengdata[7].children[0].kaquanliebiao == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'kaquanliebiao'))"
                      >
                        <a>卡券列表</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[7].children[1].fafangjilu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'fafangjilu'))"
                      >
                        <a>卡券发放记录</a>
                      </a-checkbox>
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[8].check">
                      <a-checkbox
                        :checked="allgongnengdata[8].children[0].canshuliebiao == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'canshuliebiao'))"
                      >
                        <a>参数列表</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[8].children[1].guanggaoshezhi == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'guanggaoshezhi'))"
                      >
                        <a>广告设置</a>
                      </a-checkbox>
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[9].check">
                      <a-checkbox
                        :checked="allgongnengdata[9].children[0].cheliangcanshu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'cheliangcanshu'))"
                      >
                        <a>参数设置</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[9].children[1].shoufeibiaozhun == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'shoufeibiaozhun'))"
                      >
                        <a>收费标准</a>
                      </a-checkbox>
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[9].children[2].cheliangdingdan == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'cheliangdingdan'))"
                      >
                        <a>车辆订单</a>
                      </a-checkbox>
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[10].check">
                      <a-checkbox
                        :checked="allgongnengdata[10].children[0].jiaoyijilu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'jiaoyijilu'))"
                      >
                        <a>交易记录</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[10].children[1].tuikuanshenqing == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'tuikuanshenqing'))"
                      >
                        <a>退款申请</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[10].children[2].shoukuanjilu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'shoukuanjilu'))"
                      >
                        <a>订单后台收款记录</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[10].children[3].kaipiaoshenhe == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'kaipiaoshenhe'))"
                      >
                        <a>订单开票审核</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[10].children[4].zhekoushenhe == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'zhekoushenhe'))"
                      >
                        <a>订单折扣审核</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[11].check">
                      <a-checkbox
                        :checked="allgongnengdata[11].children[0].zhekouzongshenhe == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'zhekoushenhe'))"
                      >
                        <a>订单折扣总审核</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[11].children[1].caozuojilu == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'zhekoushenhe'))"
                      >
                        <a>用户操作记录</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    <div v-if="allgongnengdata[12].check">
                      <a-checkbox
                        :checked="allgongnengdata[12].children[0].dingdanbaobiao == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'dingdanbaobiao'))"
                      >
                        <a>有效订单报表</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[12].children[1].xiaoshoupaihang == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'xiaoshoupaihang'))"
                      >
                        <a>材料销量排行</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[12].children[2].chapingpaihang == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'chapingpaihang'))"
                      >
                        <a>材料好评排行</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[12].children[3].haopingpaihang == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'haopingpaihang'))"
                      >
                        <a>工人好评排行</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[12].children[4].yinglipaihang == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'yinglipaihang'))"
                      >
                        <a>材料盈利排行</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[12].children[5].yejibaobiao == 1"
                        style="margin-right: 20px"
                        @change="changecheckchild((changetype = 'yejibaobiao'))"
                      >
                        <a>销售业绩报表</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>
                </a-col>

                <a-col :span="8">
                  <div v-if="allgongnengdata[0].check">
                    用户管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[0].children[0].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[0].children[0].children[0].add == 1) {
                              this.allgongnengdata[0].children[0].children[0].add = 0
                            } else {
                              this.allgongnengdata[0].children[0].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[0].children[0].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[0].children[0].children[0].edit == 1) {
                              this.allgongnengdata[0].children[0].children[0].edit = 0
                            } else {
                              this.allgongnengdata[0].children[0].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[0].children[0].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[0].children[0].children[0].delete == 1) {
                              this.allgongnengdata[0].children[0].children[0].delete = 0
                            } else {
                              this.allgongnengdata[0].children[0].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    权限管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[0].children[1].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[0].children[1].children[0].add == 1) {
                              this.allgongnengdata[0].children[1].children[0].add = 0
                            } else {
                              this.allgongnengdata[0].children[1].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[0].children[1].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[0].children[1].children[0].edit == 1) {
                              this.allgongnengdata[0].children[1].children[0].edit = 0
                            } else {
                              this.allgongnengdata[0].children[1].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[0].children[1].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[0].children[1].children[0].delete == 1) {
                              this.allgongnengdata[0].children[1].children[0].delete = 0
                            } else {
                              this.allgongnengdata[0].children[1].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[1].check">
                    普通用户：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[1].children[0].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[0].children[0].add == 1) {
                              this.allgongnengdata[1].children[0].children[0].add = 0
                            } else {
                              this.allgongnengdata[1].children[0].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[0].children[0].fenxiao == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[0].children[0].fenxiao == 1) {
                              this.allgongnengdata[1].children[0].children[0].fenxiao = 0
                            } else {
                              this.allgongnengdata[1].children[0].children[0].fenxiao = 1
                            }
                          }
                        "
                      >
                        <a>设置分销金额</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[0].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[0].children[0].edit == 1) {
                              this.allgongnengdata[1].children[0].children[0].edit = 0
                            } else {
                              this.allgongnengdata[1].children[0].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[0].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[0].children[0].delete == 1) {
                              this.allgongnengdata[1].children[0].children[0].delete = 0
                            } else {
                              this.allgongnengdata[1].children[0].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[0].children[0].upload == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[0].children[0].upload == 1) {
                              this.allgongnengdata[1].children[0].children[0].upload = 0
                            } else {
                              this.allgongnengdata[1].children[0].children[0].upload = 1
                            }
                          }
                        "
                      >
                        <a>批量导入</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[0].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[0].children[0].import == 1) {
                              this.allgongnengdata[1].children[0].children[0].import = 0
                            } else {
                              this.allgongnengdata[1].children[0].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>批量导出</a></a-checkbox
                      >
                      <br /><br />

                      <a-checkbox
                        :checked="allgongnengdata[1].children[0].children[0].bangding == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[0].children[0].bangding == 1) {
                              this.allgongnengdata[1].children[0].children[0].bangding = 0
                            } else {
                              this.allgongnengdata[1].children[0].children[0].bangding = 1
                            }
                          }
                        "
                      >
                        <a>绑定销售</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    工人用户：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[1].children[1].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[1].children[0].add == 1) {
                              this.allgongnengdata[1].children[1].children[0].add = 0
                            } else {
                              this.allgongnengdata[1].children[1].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[1].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[1].children[0].edit == 1) {
                              this.allgongnengdata[1].children[1].children[0].edit = 0
                            } else {
                              this.allgongnengdata[1].children[1].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[1].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[1].children[0].delete == 1) {
                              this.allgongnengdata[1].children[1].children[0].delete = 0
                            } else {
                              this.allgongnengdata[1].children[1].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    会员用户：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[1].children[2].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[2].children[0].edit == 1) {
                              this.allgongnengdata[1].children[2].children[0].edit = 0
                            } else {
                              this.allgongnengdata[1].children[2].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[1].children[2].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[2].children[0].delete == 1) {
                              this.allgongnengdata[1].children[2].children[0].delete = 0
                            } else {
                              this.allgongnengdata[1].children[2].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />

                      <a-checkbox
                        :checked="allgongnengdata[1].children[2].children[0].bangding == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[1].children[2].children[0].bangding == 1) {
                              this.allgongnengdata[1].children[2].children[0].bangding = 0
                            } else {
                              this.allgongnengdata[1].children[2].children[0].bangding = 1
                            }
                          }
                        "
                      >
                        <a>绑定销售</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[2].check">
                    材料订单：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[2].children[0].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[2].children[0].children[0].edit == 1) {
                              this.allgongnengdata[2].children[0].children[0].edit = 0
                            } else {
                              this.allgongnengdata[2].children[0].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改订单状态</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[2].children[0].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[2].children[0].children[0].import == 1) {
                              this.allgongnengdata[2].children[0].children[0].import = 0
                            } else {
                              this.allgongnengdata[2].children[0].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    工人订单：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[2].children[1].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[2].children[1].children[0].edit == 1) {
                              this.allgongnengdata[2].children[1].children[0].edit = 0
                            } else {
                              this.allgongnengdata[2].children[1].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改订单状态</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[2].children[1].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[2].children[1].children[0].import == 1) {
                              this.allgongnengdata[2].children[1].children[0].import = 0
                            } else {
                              this.allgongnengdata[2].children[1].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    物流信息管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[2].children[2].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[2].children[2].children[0].add == 1) {
                              this.allgongnengdata[2].children[2].children[0].add = 0
                            } else {
                              this.allgongnengdata[2].children[2].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[2].children[2].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[2].children[2].children[0].edit == 1) {
                              this.allgongnengdata[2].children[2].children[0].edit = 0
                            } else {
                              this.allgongnengdata[2].children[2].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[2].children[2].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[2].children[2].children[0].delete == 1) {
                              this.allgongnengdata[2].children[2].children[0].delete = 0
                            } else {
                              this.allgongnengdata[2].children[2].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[4].check">
                    普通材料管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[4].children[0].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[0].children[0].add == 1) {
                              this.allgongnengdata[4].children[0].children[0].add = 0
                            } else {
                              this.allgongnengdata[4].children[0].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[0].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[0].children[0].edit == 1) {
                              this.allgongnengdata[4].children[0].children[0].edit = 0
                            } else {
                              this.allgongnengdata[4].children[0].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[0].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[0].children[0].delete == 1) {
                              this.allgongnengdata[4].children[0].children[0].delete = 0
                            } else {
                              this.allgongnengdata[4].children[0].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[0].children[0].upload == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[0].children[0].upload == 1) {
                              this.allgongnengdata[4].children[0].children[0].upload = 0
                            } else {
                              this.allgongnengdata[4].children[0].children[0].upload = 1
                            }
                          }
                        "
                      >
                        <a>导入</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[0].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[0].children[0].import == 1) {
                              this.allgongnengdata[4].children[0].children[0].import = 0
                            } else {
                              this.allgongnengdata[4].children[0].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    直销材料管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[4].children[1].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[1].children[0].add == 1) {
                              this.allgongnengdata[4].children[1].children[0].add = 0
                            } else {
                              this.allgongnengdata[4].children[1].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[1].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[1].children[0].edit == 1) {
                              this.allgongnengdata[4].children[1].children[0].edit = 0
                            } else {
                              this.allgongnengdata[4].children[1].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[1].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[1].children[0].delete == 1) {
                              this.allgongnengdata[4].children[1].children[0].delete = 0
                            } else {
                              this.allgongnengdata[4].children[1].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[1].children[0].upload == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[1].children[0].upload == 1) {
                              this.allgongnengdata[4].children[1].children[0].upload = 0
                            } else {
                              this.allgongnengdata[4].children[1].children[0].upload = 1
                            }
                          }
                        "
                      >
                        <a>导入</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[1].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[1].children[0].import == 1) {
                              this.allgongnengdata[4].children[1].children[0].import = 0
                            } else {
                              this.allgongnengdata[4].children[1].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    厂商信息管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[4].children[2].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[2].children[0].add == 1) {
                              this.allgongnengdata[4].children[2].children[0].add = 0
                            } else {
                              this.allgongnengdata[4].children[2].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[2].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[2].children[0].edit == 1) {
                              this.allgongnengdata[4].children[2].children[0].edit = 0
                            } else {
                              this.allgongnengdata[4].children[2].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[2].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[2].children[0].delete == 1) {
                              this.allgongnengdata[4].children[2].children[0].delete = 0
                            } else {
                              this.allgongnengdata[4].children[2].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[2].children[0].upload == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[2].children[0].upload == 1) {
                              this.allgongnengdata[4].children[2].children[0].upload = 0
                            } else {
                              this.allgongnengdata[4].children[2].children[0].upload = 1
                            }
                          }
                        "
                      >
                        <a>导入</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    材料单位管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[4].children[3].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[3].children[0].add == 1) {
                              this.allgongnengdata[4].children[3].children[0].add = 0
                            } else {
                              this.allgongnengdata[4].children[3].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[3].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[3].children[0].edit == 1) {
                              this.allgongnengdata[4].children[3].children[0].edit = 0
                            } else {
                              this.allgongnengdata[4].children[3].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[3].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[3].children[0].delete == 1) {
                              this.allgongnengdata[4].children[3].children[0].delete = 0
                            } else {
                              this.allgongnengdata[4].children[3].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    规格单位管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[4].children[4].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[4].children[0].add == 1) {
                              this.allgongnengdata[4].children[4].children[0].add = 0
                            } else {
                              this.allgongnengdata[4].children[4].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[4].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[4].children[0].edit == 1) {
                              this.allgongnengdata[4].children[4].children[0].edit = 0
                            } else {
                              this.allgongnengdata[4].children[4].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[4].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[4].children[0].delete == 1) {
                              this.allgongnengdata[4].children[4].children[0].delete = 0
                            } else {
                              this.allgongnengdata[4].children[4].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    材料颜色管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[4].children[5].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[5].children[0].add == 1) {
                              this.allgongnengdata[4].children[5].children[0].add = 0
                            } else {
                              this.allgongnengdata[4].children[5].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[5].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[5].children[0].edit == 1) {
                              this.allgongnengdata[4].children[5].children[0].edit = 0
                            } else {
                              this.allgongnengdata[4].children[5].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[5].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[5].children[0].delete == 1) {
                              this.allgongnengdata[4].children[5].children[0].delete = 0
                            } else {
                              this.allgongnengdata[4].children[5].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    工种管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[4].children[6].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[6].children[0].add == 1) {
                              this.allgongnengdata[4].children[6].children[0].add = 0
                            } else {
                              this.allgongnengdata[4].children[6].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[6].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[6].children[0].edit == 1) {
                              this.allgongnengdata[4].children[6].children[0].edit = 0
                            } else {
                              this.allgongnengdata[4].children[6].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[4].children[6].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[4].children[6].children[0].delete == 1) {
                              this.allgongnengdata[4].children[6].children[0].delete = 0
                            } else {
                              this.allgongnengdata[4].children[6].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[5].check">
                    邀请码设置：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[5].children[0].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[5].children[0].children[0].add == 1) {
                              this.allgongnengdata[5].children[0].children[0].add = 0
                            } else {
                              this.allgongnengdata[5].children[0].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[5].children[0].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[5].children[0].children[0].edit == 1) {
                              this.allgongnengdata[5].children[0].children[0].edit = 0
                            } else {
                              this.allgongnengdata[5].children[0].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    销售分配管理：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[5].children[1].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[5].children[1].children[0].add == 1) {
                              this.allgongnengdata[5].children[1].children[0].add = 0
                            } else {
                              this.allgongnengdata[5].children[1].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[5].children[1].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[5].children[1].children[0].edit == 1) {
                              this.allgongnengdata[5].children[1].children[0].edit = 0
                            } else {
                              this.allgongnengdata[5].children[1].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    销售人员跟踪客户：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[5].children[2].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[5].children[2].children[0].import == 1) {
                              this.allgongnengdata[5].children[2].children[0].import = 0
                            } else {
                              this.allgongnengdata[5].children[2].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[6].check">
                    任务表单：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[6].children[0].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[6].children[0].children[0].add == 1) {
                              this.allgongnengdata[6].children[0].children[0].add = 0
                            } else {
                              this.allgongnengdata[6].children[0].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <!-- <a-checkbox
                        :checked="allgongnengdata[6].children[0].children[0].gongzhong == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[6].children[0].children[0].gongzhong == 1) {
                              this.allgongnengdata[6].children[0].children[0].gongzhong = 0
                            } else {
                              this.allgongnengdata[6].children[0].children[0].gongzhong = 1
                            }
                          }
                        "
                      >
                        <a>工种管理</a></a-checkbox
                      >
                      <br /><br /> -->
                      <a-checkbox
                        :checked="allgongnengdata[6].children[0].children[0].renwulx == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[6].children[0].children[0].renwulx == 1) {
                              this.allgongnengdata[6].children[0].children[0].renwulx = 0
                            } else {
                              this.allgongnengdata[6].children[0].children[0].renwulx = 1
                            }
                          }
                        "
                      >
                        <a>任务类型管理</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[7].check">
                    卡卷列表：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[7].children[0].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[7].children[0].children[0].add == 1) {
                              this.allgongnengdata[7].children[0].children[0].add = 0
                            } else {
                              this.allgongnengdata[7].children[0].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[7].children[0].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[7].children[0].children[0].edit == 1) {
                              this.allgongnengdata[7].children[0].children[0].edit = 0
                            } else {
                              this.allgongnengdata[7].children[0].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[7].children[0].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[7].children[0].children[0].delete == 1) {
                              this.allgongnengdata[7].children[0].children[0].delete = 0
                            } else {
                              this.allgongnengdata[7].children[0].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    卡卷发放记录：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[7].children[1].children[0].fenfa == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[7].children[1].children[0].fenfa == 1) {
                              this.allgongnengdata[7].children[1].children[0].fenfa = 0
                            } else {
                              this.allgongnengdata[7].children[1].children[0].fenfa = 1
                            }
                          }
                        "
                      >
                        <a>分发卡卷</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[8].check">
                    广告设置：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[8].children[1].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[8].children[1].children[0].add == 1) {
                              this.allgongnengdata[8].children[1].children[0].add = 0
                            } else {
                              this.allgongnengdata[8].children[1].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[8].children[1].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[8].children[1].children[0].edit == 1) {
                              this.allgongnengdata[8].children[1].children[0].edit = 0
                            } else {
                              this.allgongnengdata[8].children[1].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[8].children[1].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[8].children[1].children[0].delete == 1) {
                              this.allgongnengdata[8].children[1].children[0].delete = 0
                            } else {
                              this.allgongnengdata[8].children[1].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[9].check">
                    参数设置：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[9].children[0].children[0].add == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[9].children[0].children[0].add == 1) {
                              this.allgongnengdata[9].children[0].children[0].add = 0
                            } else {
                              this.allgongnengdata[9].children[0].children[0].add = 1
                            }
                          }
                        "
                      >
                        <a>新增</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[9].children[0].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[9].children[0].children[0].edit == 1) {
                              this.allgongnengdata[9].children[0].children[0].edit = 0
                            } else {
                              this.allgongnengdata[9].children[0].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>修改</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[9].children[0].children[0].delete == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[9].children[0].children[0].delete == 1) {
                              this.allgongnengdata[9].children[0].children[0].delete = 0
                            } else {
                              this.allgongnengdata[9].children[0].children[0].delete = 1
                            }
                          }
                        "
                      >
                        <a>删除</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    车辆订单：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[9].children[2].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[9].children[2].children[0].import == 1) {
                              this.allgongnengdata[9].children[2].children[0].import = 0
                            } else {
                              this.allgongnengdata[9].children[2].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[10].check">
                    退款申请：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[10].children[1].children[0].tuikuan == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[10].children[1].children[0].tuikuan == 1) {
                              this.allgongnengdata[10].children[1].children[0].tuikuan = 0
                            } else {
                              this.allgongnengdata[10].children[1].children[0].tuikuan = 1
                            }
                          }
                        "
                      >
                        <a>退款</a></a-checkbox
                      >
                      <br /><br />
                      <a-checkbox
                        :checked="allgongnengdata[10].children[1].children[0].tuihuo == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[10].children[1].children[0].tuihuo == 1) {
                              this.allgongnengdata[10].children[1].children[0].tuihuo = 0
                            } else {
                              this.allgongnengdata[10].children[1].children[0].tuihuo = 1
                            }
                          }
                        "
                      >
                        <a>退货</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    订单开票审核：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[10].children[3].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[10].children[3].children[0].edit == 1) {
                              this.allgongnengdata[10].children[3].children[0].edit = 0
                            } else {
                              this.allgongnengdata[10].children[3].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>审核</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    订单折扣审核：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[10].children[4].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[10].children[4].children[0].edit == 1) {
                              this.allgongnengdata[10].children[4].children[0].edit = 0
                            } else {
                              this.allgongnengdata[10].children[4].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>审核</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[11].check">
                    订单折扣总审核：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[11].children[0].children[0].edit == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[11].children[0].children[0].edit == 1) {
                              this.allgongnengdata[11].children[0].children[0].edit = 0
                            } else {
                              this.allgongnengdata[11].children[0].children[0].edit = 1
                            }
                          }
                        "
                      >
                        <a>审核</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>

                  <div v-if="allgongnengdata[12].check">
                    有效订单报表：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[12].children[0].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[12].children[0].children[0].import == 1) {
                              this.allgongnengdata[12].children[0].children[0].import = 0
                            } else {
                              this.allgongnengdata[12].children[0].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    材料销量排行：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[12].children[1].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[12].children[1].children[0].import == 1) {
                              this.allgongnengdata[12].children[1].children[0].import = 0
                            } else {
                              this.allgongnengdata[12].children[1].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    材料好评排行：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[12].children[2].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[12].children[2].children[0].import == 1) {
                              this.allgongnengdata[12].children[2].children[0].import = 0
                            } else {
                              this.allgongnengdata[12].children[2].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    工人好评排行：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[12].children[3].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[12].children[3].children[0].import == 1) {
                              this.allgongnengdata[12].children[3].children[0].import = 0
                            } else {
                              this.allgongnengdata[12].children[3].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    材料盈利排行：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[12].children[4].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[12].children[4].children[0].import == 1) {
                              this.allgongnengdata[12].children[4].children[0].import = 0
                            } else {
                              this.allgongnengdata[12].children[4].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>

                    销售业绩：
                    <div style="margin-top: 10px">
                      <a-checkbox
                        :checked="allgongnengdata[12].children[5].children[0].import == 1"
                        style="margin-right: 20px"
                        @change="
                          () => {
                            if (this.allgongnengdata[12].children[5].children[0].import == 1) {
                              this.allgongnengdata[12].children[5].children[0].import = 0
                            } else {
                              this.allgongnengdata[12].children[5].children[0].import = 1
                            }
                          }
                        "
                      >
                        <a>导出</a></a-checkbox
                      >
                      <br /><br />
                    </div>
                  </div>
                </a-col>
              </row>
            </div>
          </a-spin>
        </div>
      </a-modal>
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
    </div>

    <div>
      <a-modal
        :title="
          xianshitype == '1' ? '材料订单显示控制' : xianshitype == '2' ? '人工订单显示控制' : '用户信息列表显示控制'
        "
        width="1000px"
        :visible="visibledanjuright"
        :confirm-loading="false"
        @cancel="
          () => {
            this.visibledanjuright = false
          }
        "
        okText="保存"
        @ok="danjuquanxian"
        cancelText="取消"
        :maskClosable="false"
        :destroyOnClose="true"
        :centered="true"
      >
        <p>
          <a-spin :spinning="spinning" v-if="xianshitype == '1'">
            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  订单编号:
                  <a-switch default-checked v-model="cailiaodanjuright[0].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  订单号:
                  <a-switch default-checked v-model="cailiaodanjuright[1].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  收货名:
                  <a-switch default-checked v-model="cailiaodanjuright[2].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  收货电话:
                  <a-switch default-checked v-model="cailiaodanjuright[3].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  利润:
                  <a-switch default-checked v-model="cailiaodanjuright[4].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  总价:
                  <a-switch default-checked v-model="cailiaodanjuright[5].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  支付金额:
                  <a-switch default-checked v-model="cailiaodanjuright[6].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 110px">
                  申请折扣总金额:
                  <a-switch default-checked v-model="cailiaodanjuright[7].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  订单状态:
                  <a-switch default-checked v-model="cailiaodanjuright[8].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  开票状态:
                  <a-switch default-checked v-model="cailiaodanjuright[9].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  下单时间:
                  <a-switch default-checked v-model="cailiaodanjuright[10].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  收货地址:
                  <a-switch default-checked v-model="cailiaodanjuright[11].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  收货详情:
                  <a-switch default-checked v-model="cailiaodanjuright[12].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 80px">
                  优惠券额度:
                  <a-switch default-checked v-model="cailiaodanjuright[13].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  支付方式:
                  <a-switch default-checked v-model="cailiaodanjuright[14].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  楼层(层):
                  <a-switch default-checked v-model="cailiaodanjuright[15].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  距离(KM):
                  <a-switch default-checked v-model="cailiaodanjuright[16].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  电梯:
                  <a-switch default-checked v-model="cailiaodanjuright[17].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  户型:
                  <a-switch default-checked v-model="cailiaodanjuright[18].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  留言:
                  <a-switch default-checked v-model="cailiaodanjuright[19].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  送达时间:
                  <a-switch default-checked v-model="cailiaodanjuright[20].show" />
                </div>
              </a-col>
              <div>.</div>
            </row>
          </a-spin>

          <a-spin :spinning="spinning" v-if="xianshitype == '2'">
            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  订单编号:
                  <a-switch default-checked v-model="rengongright[0].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  工人名称:
                  <a-switch default-checked v-model="rengongright[1].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  天数:
                  <a-switch default-checked v-model="rengongright[2].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  标题:
                  <a-switch default-checked v-model="rengongright[3].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  价格:
                  <a-switch default-checked v-model="rengongright[4].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  状态:
                  <a-switch default-checked v-model="rengongright[5].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  电话通知:
                  <a-switch default-checked v-model="rengongright[6].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  用工时间:
                  <a-switch default-checked v-model="rengongright[7].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  下单时间:
                  <a-switch default-checked v-model="rengongright[8].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  收货地址:
                  <a-switch default-checked v-model="rengongright[9].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  收货详情:
                  <a-switch default-checked v-model="rengongright[10].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 80px">
                  优惠券额度:
                  <a-switch default-checked v-model="rengongright[11].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  支付方式:
                  <a-switch default-checked v-model="rengongright[12].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 60px">
                  留言:
                  <a-switch default-checked v-model="rengongright[13].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  接单时间:
                  <a-switch default-checked v-model="rengongright[14].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  完成时间:
                  <a-switch default-checked v-model="rengongright[15].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 80px">
                  是否为司机:
                  <a-switch default-checked v-model="rengongright[16].show" />
                </div>
              </a-col>

              <div>.</div>
            </row>
          </a-spin>

          <a-spin :spinning="spinning" v-if="xianshitype == '3'">
            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  用户编号:
                  <a-switch default-checked v-model="yonghuxinxiright[0].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  用户名:
                  <a-switch default-checked v-model="yonghuxinxiright[1].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  真实姓名:
                  <a-switch default-checked v-model="yonghuxinxiright[2].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  用户地址:
                  <a-switch default-checked v-model="yonghuxinxiright[3].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 80px">
                  用户身份证:
                  <a-switch default-checked v-model="yonghuxinxiright[4].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 80px">
                  用户微信号:
                  <a-switch default-checked v-model="yonghuxinxiright[5].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 90px">
                  用户微信名称:
                  <a-switch default-checked v-model="yonghuxinxiright[6].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  实名认证:
                  <a-switch default-checked v-model="yonghuxinxiright[7].show" />
                </div>
              </a-col>
            </row>

            <row>
              <a-col :span="6">
                <div style="width: 70px">
                  用户状态:
                  <a-switch default-checked v-model="yonghuxinxiright[8].show" />
                </div>
              </a-col>
              <a-col :span="6">
                <div style="width: 70px">
                  创建时间:
                  <a-switch default-checked v-model="yonghuxinxiright[9].show" />
                </div>
              </a-col>
              <div>.</div>
            </row>
          </a-spin>
        </p>
      </a-modal>
    </div>
  </a-card>
</template>

<script>
const plainOptions = ['新增', '修改', '删除', '导入', '导出']
const defaultCheckedList = ['新增', '修改', '删除', '导入', '导出']
const plainOptionsrights = [
  '系统管理',
  '用户管理',
  '业务管理',
  '数据管理',
  '材料管理',
  '销售管理',
  '任务管理',
  '卡券管理',
  '参数管理',
  '车辆管理',
  '财务管理',
  '总经办管理',
  '报表管理',
]
const defaultCheckedListrights = [
  '系统管理',
  '用户管理',
  '业务管理',
  '数据管理',
  '材料管理',
  '销售管理',
  '任务管理',
  '卡券管理',
  '参数管理',
  '车辆管理',
  '财务管理',
  '总经办管理',
  '报表管理',
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
const columns = [
  {
    title: '角色编号',
    sorter: true,
    width: 120,
    dataIndex: 'role_id',
  },
  {
    title: '角色名称',
    sorter: true,
    dataIndex: 'role_name',
  },
  {
    title: '权限字符',
    sorter: true,
    dataIndex: 'role_key',
  },
  {
    title: '创建人',
    sorter: true,
    dataIndex: 'create_by',
  },
  {
    title: '状态',
    dataIndex: 'status',
    scopedSlots: { customRender: 'status' },
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    scopedSlots: { customRender: 'create_time' },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  },
]
export default {
  name: 'authorityManagement',
  props: {
    text: String,
  },
  data() {
    return {
      checkedList: defaultCheckedList,
      checkedListrights: defaultCheckedListrights,
      indeterminate: true,
      checkAll: false,
      indeterminaterights: true,
      checkAllrights: false,
      plainOptions,
      plainOptionsrights,
      data: [],
      olddata: {},
      columns,
      xianshitype: '1',
      historyColumns,
      spinning: false,
      visible: false,
      visibleallgongneng: false,
      visibleorder: false,
      confirmLoading: false,
      keywords: '',
      nowname: '',
      nowroleid: '',
      ifaddroledata: false,
      devicepassword: '',
      oneroledata: {},
      historydata: [],
      cailiaodanjuright: [
        {
          name: 'order_info_id',
          show: true,
        },
        {
          name: 'order_info_ids',
          show: true,
        },
        {
          name: 'harvest_name',
          show: true,
        },
        {
          name: 'harvest_phone',
          show: true,
        },
        {
          name: 'lirun',
          show: true,
        },
        {
          name: 'order_info_altogether',
          show: true,
        },
        {
          name: 'order_info_moneys',
          show: true,
        },
        {
          name: 'discount',
          show: true,
        },
        {
          name: 'order_info_status',
          show: true,
        },
        {
          name: 'order_info_voicsta',
          show: true,
        },
        {
          name: 'order_info_creatime',
          show: true,
        },
        {
          name: 'harvest_add',
          show: true,
        },
        {
          name: 'harvest_address',
          show: true,
        },
        {
          name: 'coupon_moeny',
          show: true,
        },
        {
          name: 'order_info_payment',
          show: true,
        },
        {
          name: 'order_info_floor',
          show: true,
        },
        {
          name: 'order_info_distance',
          show: true,
        },
        {
          name: 'order_info_elevator',
          show: true,
        },
        {
          name: 'order_info_house',
          show: true,
        },
        {
          name: 'order_info_word',
          show: true,
        },
        {
          name: 'order_info_deliverycretime',
          show: true,
        },
      ],
      rengongright: [
        {
          name: 'worker_info_id',
          show: true,
        },
        {
          name: 'worker_name',
          show: true,
        },
        {
          name: 'worker_info_amount',
          show: true,
        },
        {
          name: 'worker_headline',
          show: true,
        },
        {
          name: 'worker_price',
          show: true,
        },
        {
          name: 'worker_info_sta',
          show: true,
        },
        {
          name: 'worker_info_dianhua',
          show: true,
        },
        {
          name: 'worker_info_issuetime',
          show: true,
        },
        {
          name: 'worker_info_creatime',
          show: true,
        },
        {
          name: 'harvest_add',
          show: true,
        },
        {
          name: 'harvest_address',
          show: true,
        },
        {
          name: 'coupon_moeny',
          show: true,
        },
        {
          name: 'order_info_payment',
          show: true,
        },
        {
          name: 'worker_info_word',
          show: true,
        },
        {
          name: 'worker_info_receiving',
          show: true,
        },
        {
          name: 'worker_info_accomplish',
          show: true,
        },
        {
          name: 'worker_info_driver',
          show: true,
        },
      ],
      yonghuxinxiright: [
        {
          name: 'user_id',
          show: true,
        },
        {
          name: 'user_name',
          show: true,
        },
        {
          name: 'user_realname',
          show: true,
        },
        {
          name: 'user_address',
          show: true,
        },
        {
          name: 'user_identity',
          show: true,
        },
        {
          name: 'user_wechat_id',
          show: true,
        },
        {
          name: 'user_wechat_name',
          show: true,
        },
        {
          name: 'user_authentication',
          show: true,
        },
        {
          name: 'user_status',
          show: true,
        },
        {
          name: 'user_creatime',
          show: true,
        },
      ],
      visibledanjuright: false,
      ifshowhistory: false,
      allDevice: [],
      allorderdata: {},
      allgongnengdata: [
        {
          name: 'xitong',
          xitong: 1,
          check: false,
          children: [
            {
              name: 'yonghuguanli',
              yonghuguanli: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
            {
              name: 'quanxianguanli',
              quanxianguanli: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'yonghu',
          yonghu: 1,
          check: false,
          children: [
            {
              name: 'putongyonghu',
              putongyonghu: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                  fenxiao: 1,
                  upload: 1,
                  import: 1,
                  bangding: 1,
                },
              ],
            },
            {
              name: 'gongrenyonghu',
              gongrenyonghu: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
            {
              name: 'huiyuanyonghu',
              huiyuanyonghu: 1,
              children: [
                {
                  edit: 1,
                  delete: 1,
                  bangding: 1,
                },
              ],
            },
            {
              name: 'jifenshezhi',
              jifenshezhi: 1,
            },
          ],
        },

        {
          name: 'yewu',
          yewu: 1,
          check: false,
          children: [
            {
              name: 'dingdanliebiao',
              dingdanliebiao: 1,
              children: [
                {
                  edit: 1,
                  import: 1,
                },
              ],
            },
            {
              name: 'rengongdingdan',
              rengongdingdan: 1,
              children: [
                {
                  edit: 1,
                  import: 1,
                },
              ],
            },
            {
              name: 'wuliuxinxi',
              wuliuxinxi: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'shuju',
          shuju: 1,
          check: false,
          children: [
            {
              name: 'liulanshuju',
              liulanshuju: 1,
            },
            {
              name: 'pinglunshuju',
              pinglunshuju: 1,
            },
            {
              name: 'renwuliushui',
              renwuliushui: 1,
            },
            {
              name: 'kaipiaojilu',
              kaipiaojilu: 1,
            },
          ],
        },

        {
          name: 'cailiao',
          cailiao: 1,
          check: false,
          children: [
            {
              name: 'cailiaoguanli',
              cailiaoguanli: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                  upload: 1,
                  import: 1,
                },
              ],
            },
            {
              name: 'zhixiaocailiaoguanli',
              zhixiaocailiaoguanli: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                  upload: 1,
                  import: 1,
                },
              ],
            },
            {
              name: 'changshangxinxi',
              changshangxinxi: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                  upload: 1,
                },
              ],
            },
            {
              name: 'cailiaodanwei',
              cailiaodanwei: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
            {
              name: 'guigedanwei',
              guigedanwei: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
            {
              name: 'yanseguanli',
              yanseguanli: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
            {
              name: 'gongzhongguanli',
              gongzhongguanli: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'xiaoshou',
          xiaoshou: 1,
          check: false,
          children: [
            {
              name: 'xiaoshoubiaodan',
              xiaoshoubiaodan: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                },
              ],
            },
            {
              name: 'xiaoshoufenpei',
              xiaoshoufenpei: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                },
              ],
            },
            {
              name: 'genzong',
              genzong: 1,
              children: [
                {
                  import: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'renwu',
          renwu: 1,
          check: false,
          children: [
            {
              name: 'renwubiaodan',
              renwubiaodan: 1,
              children: [
                {
                  add: 1,
                  gongzhong: 1,
                  renwulx: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'kaquan',
          kaquan: 1,
          check: false,
          children: [
            {
              name: 'kaquanliebiao',
              kaquanliebiao: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
            {
              name: 'fafangjilu',
              fafangjilu: 1,
              children: [
                {
                  fenfa: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'canshu',
          canshu: 1,
          check: false,
          children: [
            {
              name: 'canshuliebiao',
              canshuliebiao: 1,
            },
            {
              name: 'guanggaoshezhi',
              guanggaoshezhi: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'cheliang',
          cheliang: 1,
          check: false,
          children: [
            {
              name: 'cheliangcanshu',
              cheliangcanshu: 1,
              children: [
                {
                  add: 1,
                  edit: 1,
                  delete: 1,
                },
              ],
            },
            {
              name: 'shoufeibiaozhun',
              shoufeibiaozhun: 1,
            },
            {
              name: 'cheliangdingdan',
              cheliangdingdan: 1,
              children: [
                {
                  import: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'caiwu',
          caiwu: 1,
          check: false,
          children: [
            {
              name: 'jiaoyijilu',
              jiaoyijilu: 1,
            },
            {
              name: 'tuikuanshenqing',
              tuikuanshenqing: 1,
              children: [
                {
                  tuikuan: 1,
                  tuihuo: 1,
                },
              ],
            },
            {
              name: 'shoukuanjilu',
              shoukuanjilu: 1,
            },
            {
              name: 'kaipiaoshenhe',
              kaipiaoshenhe: 1,
              children: [
                {
                  edit: 1,
                },
              ],
            },
            {
              name: 'zhekoushenhe',
              zhekoushenhe: 1,
              children: [
                {
                  edit: 1,
                },
              ],
            },
          ],
        },

        {
          name: 'zongjinban',
          zongjinban: 1,
          check: false,
          children: [
            {
              name: 'zhekouzongshenhe',
              zhekouzongshenhe: 1,
              children: [
                {
                  edit: 1,
                },
              ],
            },
            {
              name: 'caozuojilu',
              caozuojilu: 1,
            },
          ],
        },

        {
          name: 'baobiao',
          baobiao: 1,
          check: false,
          children: [
            {
              name: 'dingdanbaobiao',
              dingdanbaobiao: 1,
              children: [
                {
                  import: 1,
                },
              ],
            },
            {
              name: 'xiaoshoupaihang',
              xiaoshoupaihang: 1,
              children: [
                {
                  import: 1,
                },
              ],
            },
            {
              name: 'chapingpaihang',
              chapingpaihang: 1,
              children: [
                {
                  import: 1,
                },
              ],
            },
            {
              name: 'haopingpaihang',
              haopingpaihang: 1,
              children: [
                {
                  import: 1,
                },
              ],
            },
            {
              name: 'yinglipaihang',
              yinglipaihang: 1,
              children: [
                {
                  import: 1,
                },
              ],
            },
            {
              name: 'yejibaobiao',
              yejibaobiao: 1,
              children: [
                {
                  import: 1,
                },
              ],
            },
          ],
        },
      ],
    }
  },
  created() {},
  mounted() {
    const that = this
    that.getAllRoleDataListPage()
  },
  methods: {
    daochuliebiao() {
      const that = this
      this.$confirm({
        title: '是否确定导出角色信息列表?',
        okText: '继续',
        okType: 'danger',
        centered: true,
        cancelText: '取消',
        onOk: () => {
          var formdate = {}
          this.$request({
            url: '/user/getAllRoleDataListpage',
            method: 'get',
            params: formdate,
          })
            .then((res) => {
              if (res.code == 200) {
                that.spinning = false
                var alldata = [['角色编号', '角色名称', '权限字符', '创建人', '状态', '创建时间']]
                res.data.forEach((element) => {
                  var onedata = [
                    element.role_id == null ? '' : element.role_id,
                    element.role_name == null ? '' : element.role_name,
                    element.role_key == null ? '' : element.role_key,
                    element.create_by == null ? '' : element.create_by,
                    element.status == null ? '' : element.status=='0'?"启用":"禁用",
                    element.create_time == null ? '' : that.dateFtt('yyyy-MM-dd hh:mm:ss', new Date(element.create_time)),
                  ]

                  alldata.push(onedata)
                })
                this.outputXlsxFile(alldata, '角色信息列表')
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
    cailiaodingdan(e) {
      const that = this
      that.xianshitype = '1'
      that.visibledanjuright = true
      that.nowroleid = e.role_id
      that.nowname = e.role_name
      var aa = JSON.parse(e.cailiaorights)
      aa.forEach((item) => {
        if (item.show == 1) {
          item.show = true
        } else if (item.show == 2) {
          item.show = false
        }
      })
      that.cailiaodanjuright = aa
    },
    rengongdingdan(e) {
      const that = this
      that.xianshitype = '2'
      that.visibledanjuright = true
      that.nowroleid = e.role_id
      that.nowname = e.role_name
      var aa = JSON.parse(e.rengongrights)
      aa.forEach((item) => {
        if (item.show == 1) {
          item.show = true
        } else if (item.show == 2) {
          item.show = false
        }
      })
      that.rengongright = aa
    },
    yonghuxinxi(e) {
      const that = this
      that.xianshitype = '3'
      that.visibledanjuright = true
      that.nowroleid = e.role_id
      that.nowname = e.role_name
      var aa = JSON.parse(e.yonghurights)
      aa.forEach((item) => {
        if (item.show == 1) {
          item.show = true
        } else if (item.show == 2) {
          item.show = false
        }
      })
      that.yonghuxinxiright = aa
    },
    danjuquanxian() {
      const that = this
      var formdate = {}
      formdate.id = that.nowroleid
      formdate.rolename = that.nowname
      formdate.myid = that.$store.state.admin.user_id

      if (that.xianshitype == '1') {
        //cailiaodingdan
        console.log(that.cailiaodanjuright)
        that.cailiaodanjuright.forEach((item) => {
          if (item.show) {
            item.show = 1
          } else {
            item.show = 2
          }
        })
        var aa = that.cailiaodanjuright
        formdate.cailiaorights = JSON.stringify(aa)
      } else if (that.xianshitype == '2') {
        //rengongdingdan
        console.log(that.rengongright)
        that.rengongright.forEach((item) => {
          if (item.show) {
            item.show = 1
          } else {
            item.show = 2
          }
        })
        var aa = that.rengongright
        formdate.rengongrights = JSON.stringify(aa)
      } else if (that.xianshitype == '3') {
        //yonghuxinxi
        console.log(that.yonghuxinxiright)
        that.yonghuxinxiright.forEach((item) => {
          if (item.show) {
            item.show = 1
          } else {
            item.show = 2
          }
        })

        var aa = that.yonghuxinxiright
        formdate.yonghurights = JSON.stringify(aa)
      }
      //新增信息
      that.spinning = true
      this.$request({
        url: '/user/udataRoleRights',
        method: 'post',
        data: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.visibledanjuright = false
            that.nowroleid = ''
            that.nowname = ''
            that.getAllRoleDataListPage()
            that.$message.success('更新成功!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    changecheckchild(e) {
      if (e == 'yonghuguanli') {
        if (this.allgongnengdata[0].children[0].yonghuguanli == 1) {
          this.allgongnengdata[0].children[0].yonghuguanli = 0
        } else {
          this.allgongnengdata[0].children[0].yonghuguanli = 1
        }
      }
      if (e == 'quanxianguanli') {
        if (this.allgongnengdata[0].children[1].quanxianguanli == 1) {
          this.allgongnengdata[0].children[1].quanxianguanli = 0
        } else {
          this.allgongnengdata[0].children[1].quanxianguanli = 1
        }
      }

      if (e == 'putongyonghu') {
        if (this.allgongnengdata[1].children[0].putongyonghu == 1) {
          this.allgongnengdata[1].children[0].putongyonghu = 0
        } else {
          this.allgongnengdata[1].children[0].putongyonghu = 1
        }
      }

      if (e == 'gongrenyonghu') {
        if (this.allgongnengdata[1].children[1].gongrenyonghu == 1) {
          this.allgongnengdata[1].children[1].gongrenyonghu = 0
        } else {
          this.allgongnengdata[1].children[1].gongrenyonghu = 1
        }
      }

      if (e == 'huiyuanyonghu') {
        if (this.allgongnengdata[1].children[2].huiyuanyonghu == 1) {
          this.allgongnengdata[1].children[2].huiyuanyonghu = 0
        } else {
          this.allgongnengdata[1].children[2].huiyuanyonghu = 1
        }
      }

      if (e == 'jifenshezhi') {
        if (this.allgongnengdata[1].children[3].jifenshezhi == 1) {
          this.allgongnengdata[1].children[3].jifenshezhi = 0
        } else {
          this.allgongnengdata[1].children[3].jifenshezhi = 1
        }
      }

      if (e == 'dingdanliebiao') {
        if (this.allgongnengdata[2].children[0].dingdanliebiao == 1) {
          this.allgongnengdata[2].children[0].dingdanliebiao = 0
        } else {
          this.allgongnengdata[2].children[0].dingdanliebiao = 1
        }
      }

      if (e == 'rengongdingdan') {
        if (this.allgongnengdata[2].children[1].rengongdingdan == 1) {
          this.allgongnengdata[2].children[1].rengongdingdan = 0
        } else {
          this.allgongnengdata[2].children[1].rengongdingdan = 1
        }
      }

      if (e == 'wuliuxinxi') {
        if (this.allgongnengdata[2].children[2].wuliuxinxi == 1) {
          this.allgongnengdata[2].children[2].wuliuxinxi = 0
        } else {
          this.allgongnengdata[2].children[2].wuliuxinxi = 1
        }
      }

      if (e == 'liulanshuju') {
        if (this.allgongnengdata[3].children[0].liulanshuju == 1) {
          this.allgongnengdata[3].children[0].liulanshuju = 0
        } else {
          this.allgongnengdata[3].children[0].liulanshuju = 1
        }
      }

      if (e == 'pinglunshuju') {
        if (this.allgongnengdata[3].children[1].pinglunshuju == 1) {
          this.allgongnengdata[3].children[1].pinglunshuju = 0
        } else {
          this.allgongnengdata[3].children[1].pinglunshuju = 1
        }
      }

      if (e == 'renwuliushui') {
        if (this.allgongnengdata[3].children[2].renwuliushui == 1) {
          this.allgongnengdata[3].children[2].renwuliushui = 0
        } else {
          this.allgongnengdata[3].children[2].renwuliushui = 1
        }
      }

      if (e == 'kaipiaojilu') {
        if (this.allgongnengdata[3].children[3].kaipiaojilu == 1) {
          this.allgongnengdata[3].children[3].kaipiaojilu = 0
        } else {
          this.allgongnengdata[3].children[3].kaipiaojilu = 1
        }
      }

      if (e == 'cailiaoguanli') {
        if (this.allgongnengdata[4].children[0].cailiaoguanli == 1) {
          this.allgongnengdata[4].children[0].cailiaoguanli = 0
        } else {
          this.allgongnengdata[4].children[0].cailiaoguanli = 1
        }
      }

      if (e == 'zhixiaocailiaoguanli') {
        if (this.allgongnengdata[4].children[1].zhixiaocailiaoguanli == 1) {
          this.allgongnengdata[4].children[1].zhixiaocailiaoguanli = 0
        } else {
          this.allgongnengdata[4].children[1].zhixiaocailiaoguanli = 1
        }
      }

      if (e == 'changshangxinxi') {
        if (this.allgongnengdata[4].children[2].changshangxinxi == 1) {
          this.allgongnengdata[4].children[2].changshangxinxi = 0
        } else {
          this.allgongnengdata[4].children[2].changshangxinxi = 1
        }
      }

      if (e == 'cailiaodanwei') {
        if (this.allgongnengdata[4].children[3].cailiaodanwei == 1) {
          this.allgongnengdata[4].children[3].cailiaodanwei = 0
        } else {
          this.allgongnengdata[4].children[3].cailiaodanwei = 1
        }
      }

      if (e == 'guigedanwei') {
        if (this.allgongnengdata[4].children[4].guigedanwei == 1) {
          this.allgongnengdata[4].children[4].guigedanwei = 0
        } else {
          this.allgongnengdata[4].children[4].guigedanwei = 1
        }
      }

      if (e == 'yanseguanli') {
        if (this.allgongnengdata[4].children[5].yanseguanli == 1) {
          this.allgongnengdata[4].children[5].yanseguanli = 0
        } else {
          this.allgongnengdata[4].children[5].yanseguanli = 1
        }
      }

      if (e == 'gongzhongguanli') {
        if (this.allgongnengdata[4].children[6].gongzhongguanli == 1) {
          this.allgongnengdata[4].children[6].gongzhongguanli = 0
        } else {
          this.allgongnengdata[4].children[6].gongzhongguanli = 1
        }
      }

      if (e == 'xiaoshoubiaodan') {
        if (this.allgongnengdata[5].children[0].xiaoshoubiaodan == 1) {
          this.allgongnengdata[5].children[0].xiaoshoubiaodan = 0
        } else {
          this.allgongnengdata[5].children[0].xiaoshoubiaodan = 1
        }
      }

      if (e == 'xiaoshoufenpei') {
        if (this.allgongnengdata[5].children[1].xiaoshoufenpei == 1) {
          this.allgongnengdata[5].children[1].xiaoshoufenpei = 0
        } else {
          this.allgongnengdata[5].children[1].xiaoshoufenpei = 1
        }
      }

      if (e == 'genzong') {
        if (this.allgongnengdata[5].children[2].genzong == 1) {
          this.allgongnengdata[5].children[2].genzong = 0
        } else {
          this.allgongnengdata[5].children[2].genzong = 1
        }
      }

      if (e == 'renwubiaodan') {
        if (this.allgongnengdata[6].children[0].renwubiaodan == 1) {
          this.allgongnengdata[6].children[0].renwubiaodan = 0
        } else {
          this.allgongnengdata[6].children[0].renwubiaodan = 1
        }
      }

      if (e == 'kaquanliebiao') {
        if (this.allgongnengdata[7].children[0].kaquanliebiao == 1) {
          this.allgongnengdata[7].children[0].kaquanliebiao = 0
        } else {
          this.allgongnengdata[7].children[0].kaquanliebiao = 1
        }
      }

      if (e == 'fafangjilu') {
        if (this.allgongnengdata[7].children[1].fafangjilu == 1) {
          this.allgongnengdata[7].children[1].fafangjilu = 0
        } else {
          this.allgongnengdata[7].children[1].fafangjilu = 1
        }
      }

      if (e == 'canshuliebiao') {
        if (this.allgongnengdata[8].children[0].canshuliebiao == 1) {
          this.allgongnengdata[8].children[0].canshuliebiao = 0
        } else {
          this.allgongnengdata[8].children[0].canshuliebiao = 1
        }
      }

      if (e == 'guanggaoshezhi') {
        if (this.allgongnengdata[8].children[1].guanggaoshezhi == 1) {
          this.allgongnengdata[8].children[1].guanggaoshezhi = 0
        } else {
          this.allgongnengdata[8].children[1].guanggaoshezhi = 1
        }
      }

      if (e == 'cheliangcanshu') {
        if (this.allgongnengdata[9].children[0].cheliangcanshu == 1) {
          this.allgongnengdata[9].children[0].cheliangcanshu = 0
        } else {
          this.allgongnengdata[9].children[0].cheliangcanshu = 1
        }
      }

      if (e == 'shoufeibiaozhun') {
        if (this.allgongnengdata[9].children[1].shoufeibiaozhun == 1) {
          this.allgongnengdata[9].children[1].shoufeibiaozhun = 0
        } else {
          this.allgongnengdata[9].children[1].shoufeibiaozhun = 1
        }
      }

      if (e == 'cheliangdingdan') {
        if (this.allgongnengdata[9].children[2].cheliangdingdan == 1) {
          this.allgongnengdata[9].children[2].cheliangdingdan = 0
        } else {
          this.allgongnengdata[9].children[2].cheliangdingdan = 1
        }
      }

      if (e == 'jiaoyijilu') {
        if (this.allgongnengdata[10].children[0].jiaoyijilu == 1) {
          this.allgongnengdata[10].children[0].jiaoyijilu = 0
        } else {
          this.allgongnengdata[10].children[0].jiaoyijilu = 1
        }
      }

      if (e == 'tuikuanshenqing') {
        if (this.allgongnengdata[10].children[1].tuikuanshenqing == 1) {
          this.allgongnengdata[10].children[1].tuikuanshenqing = 0
        } else {
          this.allgongnengdata[10].children[1].tuikuanshenqing = 1
        }
      }

      if (e == 'shoukuanjilu') {
        if (this.allgongnengdata[10].children[2].shoukuanjilu == 1) {
          this.allgongnengdata[10].children[2].shoukuanjilu = 0
        } else {
          this.allgongnengdata[10].children[2].shoukuanjilu = 1
        }
      }

      if (e == 'kaipiaoshenhe') {
        if (this.allgongnengdata[10].children[3].kaipiaoshenhe == 1) {
          this.allgongnengdata[10].children[3].kaipiaoshenhe = 0
        } else {
          this.allgongnengdata[10].children[3].kaipiaoshenhe = 1
        }
      }

      if (e == 'zhekoushenhe') {
        if (this.allgongnengdata[10].children[4].zhekoushenhe == 1) {
          this.allgongnengdata[10].children[4].zhekoushenhe = 0
        } else {
          this.allgongnengdata[10].children[4].zhekoushenhe = 1
        }
      }

      if (e == 'zhekouzongshenhe') {
        if (this.allgongnengdata[11].children[0].zhekouzongshenhe == 1) {
          this.allgongnengdata[10].children[0].zhekouzongshenhe = 0
        } else {
          this.allgongnengdata[10].children[0].zhekouzongshenhe = 1
        }
      }

      if (e == 'caozuojilu') {
        if (this.allgongnengdata[11].children[1].caozuojilu == 1) {
          this.allgongnengdata[10].children[1].caozuojilu = 0
        } else {
          this.allgongnengdata[10].children[1].caozuojilu = 1
        }
      }
      if (e == 'dingdanbaobiao') {
        if (this.allgongnengdata[12].children[0].dingdanbaobiao == 1) {
          this.allgongnengdata[12].baobiao.children[0].dingdanbaobiao = 0
        } else {
          this.allgongnengdata[12].children[0].dingdanbaobiao = 1
        }
      }
      if (e == 'xiaoshoupaihang') {
        if (this.allgongnengdata[12].children[1].xiaoshoupaihang == 1) {
          this.allgongnengdata[12].children[1].xiaoshoupaihang = 0
        } else {
          this.allgongnengdata[12].children[1].xiaoshoupaihang = 1
        }
      }

      if (e == 'chapingpaihang') {
        if (this.allgongnengdata[12].children[2].chapingpaihang == 1) {
          this.allgongnengdata[12].children[2].chapingpaihang = 0
        } else {
          this.allgongnengdata[12].children[2].chapingpaihang = 1
        }
      }

      if (e == 'haopingpaihang') {
        if (this.allgongnengdata[12].children[3].haopingpaihang == 1) {
          this.allgongnengdata[12].children[3].haopingpaihang = 0
        } else {
          this.allgongnengdata[12].children[3].haopingpaihang = 1
        }
      }

      if (e == 'yinglipaihang') {
        if (this.allgongnengdata[12].children[4].yinglipaihang == 1) {
          this.allgongnengdata[12].children[4].yinglipaihang = 0
        } else {
          this.allgongnengdata[12].children[4].yinglipaihang = 1
        }
      }
      if (e == 'yejibaobiao') {
        if (this.allgongnengdata[12].children[5].yejibaobiao == 1) {
          this.allgongnengdata[12].children[5].yejibaobiao = 0
        } else {
          this.allgongnengdata[12].children[5].yejibaobiao = 1
        }
      }
    },
    changecheck(e) {
      if (e == 'xitong') {
        if (this.allgongnengdata[0].xitong == 1) {
          this.allgongnengdata[0].xitong = 0
          if (this.allgongnengdata[0].check) {
            this.allgongnengdata[0].check = false
          }
        } else {
          this.allgongnengdata[0].xitong = 1
        }
      }
      if (e == 'yonghu') {
        if (this.allgongnengdata[1].yonghu == 1) {
          this.allgongnengdata[1].yonghu = 0
          if (this.allgongnengdata[1].check) {
            this.allgongnengdata[1].check = false
          }
        } else {
          this.allgongnengdata[1].yonghu = 1
        }
      }
      if (e == 'yewu') {
        if (this.allgongnengdata[2].yewu == 1) {
          this.allgongnengdata[2].yewu = 0
          if (this.allgongnengdata[2].check) {
            this.allgongnengdata[2].check = false
          }
        } else {
          this.allgongnengdata[2].yewu = 1
        }
      }
      if (e == 'shuju') {
        if (this.allgongnengdata[3].shuju == 1) {
          this.allgongnengdata[3].shuju = 0
          if (this.allgongnengdata[3].check) {
            this.allgongnengdata[3].check = false
          }
        } else {
          this.allgongnengdata[3].shuju = 1
        }
      }

      if (e == 'cailiao') {
        if (this.allgongnengdata[4].cailiao == 1) {
          this.allgongnengdata[4].cailiao = 0
          if (this.allgongnengdata[4].check) {
            this.allgongnengdata[4].check = false
          }
        } else {
          this.allgongnengdata[4].cailiao = 1
        }
      }

      if (e == 'xiaoshou') {
        if (this.allgongnengdata[5].xiaoshou == 1) {
          this.allgongnengdata[5].xiaoshou = 0
          if (this.allgongnengdata[5].check) {
            this.allgongnengdata[5].check = false
          }
        } else {
          this.allgongnengdata[5].xiaoshou = 1
        }
      }

      if (e == 'renwu') {
        if (this.allgongnengdata[6].renwu == 1) {
          this.allgongnengdata[6].renwu = 0
          if (this.allgongnengdata[6].check) {
            this.allgongnengdata[6].check = false
          }
        } else {
          this.allgongnengdata[6].renwu = 1
        }
      }

      if (e == 'kaquan') {
        if (this.allgongnengdata[7].kaquan == 1) {
          this.allgongnengdata[7].kaquan = 0
          if (this.allgongnengdata[7].check) {
            this.allgongnengdata[7].check = false
          }
        } else {
          this.allgongnengdata[7].kaquan = 1
        }
      }

      if (e == 'canshu') {
        if (this.allgongnengdata[8].canshu == 1) {
          this.allgongnengdata[8].canshu = 0
          if (this.allgongnengdata[8].check) {
            this.allgongnengdata[8].check = false
          }
        } else {
          this.allgongnengdata[8].canshu = 1
        }
      }

      if (e == 'cheliang') {
        if (this.allgongnengdata[9].cheliang == 1) {
          this.allgongnengdata[9].cheliang = 0
          if (this.allgongnengdata[9].check) {
            this.allgongnengdata[9].check = false
          }
        } else {
          this.allgongnengdata[9].cheliang = 1
        }
      }

      if (e == 'caiwu') {
        if (this.allgongnengdata[10].caiwu == 1) {
          this.allgongnengdata[10].caiwu = 0
          if (this.allgongnengdata[10].check) {
            this.allgongnengdata[10].check = false
          }
        } else {
          this.allgongnengdata[10].caiwu = 1
        }
      }

      if (e == 'zongjinban') {
        if (this.allgongnengdata[11].zongjinban == 1) {
          this.allgongnengdata[11].zongjinban = 0
          if (this.allgongnengdata[11].check) {
            this.allgongnengdata[11].check = false
          }
        } else {
          this.allgongnengdata[11].zongjinban = 1
        }
      }

      if (e == 'baobiao') {
        if (this.allgongnengdata[12].baobiao == 1) {
          this.allgongnengdata[12].baobiao = 0
          if (this.allgongnengdata[12].check) {
            this.allgongnengdata[12].check = false
          }
        } else {
          this.allgongnengdata[12].baobiao = 1
        }
      }
    },
    changecheck1(e, a) {
      this.allgongnengdata.forEach((item) => {
        if (item.name == e && a == 1) {
          item.check = true
        } else {
          item.check = false
        }
      })
    },
    showhistory(e) {
      const that = this
      console.log(e)
      that.spinning = true
      that.ifshowhistory = true
      var formdate = {}
      formdate.bills_type = 'authorityManagement'
      formdate.id = e.role_id
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
    handleTableChange(pagination, filters, { field, order }) {
      this.sort = {
        field: field || '',
        order: order || '',
      }
      this.getAllRoleDataListPage()
    },
    handleallgongnengOk() {
      const that = this
      var aa = that.allgongnengdata

      var formdate = {}
      formdate.id = that.nowroleid
      formdate.myid = that.$store.state.admin.user_id
      formdate.rolename = that.nowname
      formdate.rights = JSON.stringify(aa)
      //新增信息
      that.spinning = true
      this.$request({
        url: '/user/udataRoleGongNengRights',
        method: 'post',
        data: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.visibleallgongneng = false
            that.nowroleid = ''
            that.nowname = ''
            that.getAllRoleDataListPage()
            that.$message.success('更新成功,用户重新登录即可查看!')
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    onChangerights(checkedListrights) {
      this.indeterminaterights = !!checkedListrights.length && checkedListrights.length < plainOptionsrights.length
      this.checkAllrights = checkedListrights.length === plainOptionsrights.length
    },
    onCheckAllChangerights(e) {
      Object.assign(this, {
        checkedListrights: e.target.checked ? plainOptionsrights : [],
        indeterminaterights: false,
        checkAllrights: e.target.checked,
      })
    },
    onChange(checkedList) {
      this.indeterminate = !!checkedList.length && checkedList.length < plainOptions.length
      this.checkAll = checkedList.length === plainOptions.length
    },
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedList: e.target.checked ? plainOptions : [],
        indeterminate: false,
        checkAll: e.target.checked,
      })
    },
    // handleorderOk() {
    //   const that = this
    //   var formdate = {}
    //   formdate.id = that.nowroleid
    //   formdate.rolename = that.nowname
    //   formdate.myid = that.$store.state.admin.user_id
    //   formdate.rights = JSON.stringify(that.allorderdata)
    //   //新增信息
    //   that.spinning = true
    //   this.$request({
    //     url: '/user/udataRoleRights',
    //     method: 'get',
    //     params: formdate,
    //   })
    //     .then((res) => {
    //       if (res.code == 200) {
    //         that.spinning = false
    //         that.visibleorder = false
    //         that.nowroleid = ''
    //         that.nowname = ''
    //         that.allorderdata = {}
    //         that.getAllRoleDataListPage()
    //         that.$message.success('更新成功!')
    //       }
    //     })
    //     .catch(function () {
    //       that.spinning = false
    //       that.$message.error('抱歉,未知错误,请联系管理员!')
    //     })
    // },
    handleEditGongeneng(e) {
      const that = this
      that.nowroleid = e.role_id
      that.nowname = e.role_name
      that.allgongnengdata = JSON.parse(e.rights)
      that.visibleallgongneng = true
    },

    handleEdit(e) {
      const that = this
      that.visible = true
      that.spinning = true
      that.ifaddroledata = false
      var formdate = {}
      that.olddata = e
      formdate.roleid = e.role_id
      this.$request({
        url: '/user/getOneRoleDataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.spinning = false
            that.oneroledata = res.data
          }
        })
        .catch(function () {
          that.spinning = false
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    deleterole(e) {
      this.$confirm({
        title: '是否确定删除该角色信息?',
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
      console.log(e)
      var formdate = {}
      formdate.myid = that.$store.state.admin.user_id
      formdate.roleid = e.role_id
      formdate.rolename = e.role_name
      this.$request({
        url: '/user/deleteOneRoledataByid',
        method: 'get',
        params: formdate,
      })
        .then((res) => {
          if (res.code == 200) {
            that.getAllRoleDataListPage()
            that.$message.success('删除成功!')
          } else if (res.code == 201) {
            that.$message.warning('抱歉,该权限存在用户使用,请注意!')
            return
          }
        })
        .catch(function () {
          that.$message.error('抱歉,未知错误,请联系管理员!')
        })
    },
    addroledata() {
      const that = this
      that.visible = true
      that.ifaddroledata = true
    },
    handleOk() {
      const that = this
      if (that.oneroledata.role_name == null || that.oneroledata.role_name == '') {
        that.$message.warning('请输入角色名称!')
        return
      }
      if (that.oneroledata.role_key == null || that.oneroledata.role_key == '') {
        that.$message.warning('请输入权限字符!')
        return
      }
      if (that.oneroledata.status == null || that.oneroledata.status == '') {
        that.$message.warning('请选择状态!')
        return
      }
      if (this.ifaddroledata) {
        if (that.oneroledata.create_by == null || that.oneroledata.create_by == '') {
          that.$message.warning('请输入创建者!')
          return
        }
      } else {
        if (that.oneroledata.update_by == null || that.oneroledata.update_by == '') {
          that.$message.warning('请输入更新者!')
          return
        }
      }
      // var billrights = {
      //   add: 0,
      //   edit: 0,
      //   delete: 0,
      //   upload: 0,
      //   import: 0,
      // }
      // that.checkedList.forEach((item) => {
      //   if (item == '新增') {
      //     billrights.add = 1
      //   }
      //   if (item == '修改') {
      //     billrights.edit = 1
      //   }
      //   if (item == '删除') {
      //     billrights.delete = 1
      //   }
      //   if (item == '导入') {
      //     billrights.upload = 1
      //   }
      //   if (item == '导出') {
      //     billrights.import = 1
      //   }
      // })
      // that.oneroledata.billrights = JSON.stringify(billrights)
      // var deptrights = {
      //   xitong: 0,
      //   yonghu: 0,
      //   yewu: 0,
      //   shuju: 0,
      //   cailiao: 0,
      //   xiaoshou: 0,
      //   renwu: 0,
      //   kaquan: 0,
      //   canshu: 0,
      //   cheliang: 0,
      //   caiwu: 0,
      //   zongjinban: 0,
      //   baobiao: 0,
      // }
      // that.checkedListrights.forEach((item) => {
      //   if (item == '系统管理') {
      //     deptrights.xitong = 1
      //   }
      //   if (item == '用户管理') {
      //     deptrights.yonghu = 1
      //   }
      //   if (item == '业务管理') {
      //     deptrights.yewu = 1
      //   }
      //   if (item == '数据管理') {
      //     deptrights.shuju = 1
      //   }
      //   if (item == '材料管理') {
      //     deptrights.cailiao = 1
      //   }
      //   if (item == '销售管理') {
      //     deptrights.xiaoshou = 1
      //   }
      //   if (item == '任务管理') {
      //     deptrights.renwu = 1
      //   }
      //   if (item == '卡券管理') {
      //     deptrights.kaquan = 1
      //   }
      //   if (item == '参数管理') {
      //     deptrights.canshu = 1
      //   }
      //   if (item == '车辆管理') {
      //     deptrights.cheliang = 1
      //   }
      //   if (item == '财务管理') {
      //     deptrights.caiwu = 1
      //   }
      //   if (item == '总经办管理') {
      //     deptrights.zongjinban = 1
      //   }
      //   if (item == '报表管理') {
      //     deptrights.baobiao = 1
      //   }
      // })
      // that.oneroledata.data_scope = JSON.stringify(deptrights)
      if (that.oneroledata.remark == null) {
        that.oneroledata.remark = ''
      }
      that.oneroledata.myid = that.$store.state.admin.user_id
      that.oneroledata.bills_type = 'authorityManagement'
      var data = ''
      if (that.ifaddroledata) {
        data = '新增'
      } else {
        data = '修改后'
      }
      var status = ''
      if (that.oneroledata.status == '0') {
        status = '启用'
      } else {
        status = '禁用'
      }
      var changjianzhe = ''
      if (that.oneroledata.update_by == '') {
        changjianzhe = '暂无'
      } else {
        changjianzhe = that.oneroledata.update_by
      }

      if (that.ifaddroledata) {
        //新增信息
        that.oneroledata.user_operation_record_detail = data + '角色：' + that.oneroledata.role_name
        that.oneroledata.remark
        that.spinning = true
        this.$request({
          url: '/user/addRoledata',
          method: 'get',
          params: that.oneroledata,
        })
          .then((res) => {
            if (res.status == 200) {
              that.spinning = false
              that.visible = false
              that.oneroledata = {}
              that.getAllRoleDataListPage()
              that.$message.success('新增成功!')
            } else if (res.status == 406) {
              that.spinning = false
              that.$message.error('抱歉,新增失败,请联系管理员!')
            }
          })
          .catch(function () {
            that.spinning = false
            that.$message.error('抱歉,未知错误,请联系管理员!')
          })
      } else {
        //修改信息
        var status1 = ''
        if (that.olddata.status == '0') {
          status1 = '启用'
        } else {
          status1 = '禁用'
        }
        var changjianzhe1 = ''
        if (that.olddata.update_by == '') {
          changjianzhe1 = '暂无'
        } else {
          changjianzhe1 = that.olddata.update_by
        }
        var xiugairole_name = ''
        if (that.olddata.role_name != that.oneroledata.role_name) {
          xiugairole_name = '角色名称：' + that.olddata.role_name + ',修改为：' + that.oneroledata.role_name + ','
        }

        var role_key = ''
        if (that.olddata.role_key != that.oneroledata.role_key) {
          role_key = '角色字符：' + that.olddata.role_key + ',修改为：' + that.oneroledata.role_key + ','
        }

        var xiugaichangjianzhe = ''
        if (changjianzhe1 != changjianzhe) {
          xiugaichangjianzhe = '更新者：' + changjianzhe1 + ',修改为：' + changjianzhe + ','
        }

        var xiugaistatus = ''
        if (that.olddata.status != that.oneroledata.status) {
          xiugaistatus = '状态：' + status1 + ',修改为：' + status + ','
        }

        var xiugairemark = ''
        if (that.olddata.remark != that.oneroledata.remark) {
          xiugairemark = '备注：' + that.olddata.remark + ',修改为：' + that.oneroledata.remark + ','
        }

        that.oneroledata.user_operation_record_detail =
          xiugairole_name + role_key + xiugaichangjianzhe + xiugaistatus + xiugairemark
        that.oneroledata.rights = ''
        console.log(that.oneroledata)
        that.spinning = true
        this.$request({
          url: '/user/updataRoledataByid',
          method: 'get',
          params: that.oneroledata,
        })
          .then((res) => {
            if (res.code == 200) {
              that.spinning = false
              that.visible = false
              that.oneroledata = {}
              that.olddata = {}
              that.getAllRoleDataListPage()
              that.$message.success('修改成功!')
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
      that.oneroledata = {}
    },
    onSearch() {
      const that = this
      that.getAllRoleDataListPage()
    },
    getAllRoleDataListPage() {
      const that = this
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
          url: '/user/getAllRoleDataListpage',
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
.gongnengstyle {
  width: 368px;
  height: 600px;
}
.edit {
  width: 368px;
  margin: 0 auto;
  @media screen and (max-width: 576px) {
    width: 95%;
  }
  @media screen and (max-width: 320px) {
    .captcha-button {
      font-size: 14px;
    }
  }
}
</style>
