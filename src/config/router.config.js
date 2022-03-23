// eslint-disable-next-line
import { UserLayout, BasicLayout, BlankLayout } from '@/layouts'
import { bxAnaalyse } from '@/core/icons'

const RouteView = {
  name: 'RouteView',
  render: h => h('router-view')
}

export const asyncRouterMap = [
  {
    path: '/',
    name: 'index',
    component: BasicLayout,
    meta: { title: 'menu.home' },
    redirect: '/dashboard/workplace',
    children: [
      {
        path: '/dashboard',
        name: 'dashboard',
        show: 1,
        redirect: '/dashboard/workplace',
        component: RouteView,
        meta: { title: '工作台', keepAlive: true, icon: bxAnaalyse, permission: ['dashboard'] },
        children: [
          // {
          //   path: '/dashboard/analysis/:pageNo([1-9]\\d*)?',
          //   name: 'Analysis',
          //   component: () => import('@/views/dashboard/Analysis'),
          //   meta: { title: 'menu.dashboard.analysis', keepAlive: false, permission: ['dashboard'] }
          // },
          // 外部链接
          // {
          //   path: 'https://www.baidu.com/',
          //   name: 'Monitor',
          //   meta: { title: 'menu.dashboard.monitor', target: '_blank' }
          // },
          {
            path: '/dashboard/workplace',
            name: 'Workplace',
            component: () => import('@/views/dashboard/Workplace'),
            meta: { title: '个人信息', keepAlive: true, permission: ['dashboard'] }
          }
        ]
      },
      {
        path: '/form',
        show: 0,
        showname: 'xitong',
        redirect: '/form/base-form',
        component: RouteView,
        meta: { title: '系统管理', icon: 'form', permission: ['form'] },
        children: [
          {
            path: '/form/base-form',
            name: 'BaseForm',
            show: 0,
            component: () => import('@/views/form/adminManagement/adminForm'),
            meta: { title: '用户管理', keepAlive: true, permission: ['form'] }
          },
          {
            path: '/form/step-form',
            name: 'authorityManagement',
            show: 0,
            component: () => import('@/views/form/authorityManagement/AuthorityManagement'),
            meta: { title: '权限管理', keepAlive: true, permission: ['form'] }
          }
          // {
          //   path: '/form/advanced-form',
          //   name: 'AdvanceForm',
          //   component: () => import('@/views/form/advancedForm/AdvancedForm'),
          //   meta: { title: '高级表单', keepAlive: true, permission: [ 'form' ] }
          // }
        ]
      },
      {
        path: '/list',
        name: 'list',
        show: 0,
        showname: 'yonghu',
        component: RouteView,
        redirect: '/list/table-list',
        meta: { title: '用户管理', icon: 'user', permission: ['table'] },
        children: [
          {
            path: '/list/table-list/:pageNo([1-9]\\d*)?',
            name: 'CommonUser',
            show: 0,
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/list/CommonUser'),
            meta: { title: '普通用户', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/basic-list',
            name: 'WorkUser',
            show: 0,
            component: () => import('@/views/list/WorkUser'),
            meta: { title: '工人用户', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/card',
            name: 'VipUser',
            show: 0,
            component: () => import('@/views/list/VipUser'),
            meta: { title: '会员用户', keepAlive: true, permission: ['table'] }
          }
          ,
          {
            path: '/list/UserJiFenSet',
            name: 'UserJiFenSet',
            show: 0,
            component: () => import('@/views/list/UserJiFenSet'),
            meta: { title: '积分升级设置', keepAlive: true, permission: ['table'] }
          }
        ]
      },
      {
        path: '/ordermanage',
        name: 'ordermanage',
        show: 0,
        showname: 'yewu',
        component: RouteView,
        redirect: '/list/ordermanage',
        meta: { title: '业务管理', icon: 'ordered-list', permission: ['table'] },
        children: [

          {
            path: '/list/OrderListManager',
            name: 'OrderListManager',
            show: 0,
            component: () => import('@/views/ordermanage/OrderListManager'),
            meta: { title: '材料订单', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/WorkerOrderListManager',
            name: 'WorkerOrderListManager',
            show: 0,
            component: () => import('@/views/ordermanage/WorkerOrderListManager'),
            meta: { title: '人工订单', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/LogisticsManagement',
            name: 'LogisticsManagement',
            show: 0,
            component: () => import('@/views/ordermanage/LogisticsManagement'),
            meta: { title: '物流信息管理', keepAlive: true, permission: ['table'] }
          },
        ]
      },
      {
        path: '/datamanage',
        name: 'datamanage',
        show: 0,
        showname: 'shuju',
        component: RouteView,
        redirect: '/list/datamanage',
        meta: { title: '数据管理', icon: 'pic-left', permission: ['table'] },
        children: [

          {
            path: '/list/BrowseData',
            name: 'BrowseData',
            show: 0,
            component: () => import('@/views/datamanage/BrowseData'),
            meta: { title: '浏览数据', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/BadEvaluationData',
            name: 'BadEvaluationData',
            show: 0,
            component: () => import('@/views/datamanage/BadEvaluationData'),
            meta: { title: '评论数据', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/WorkerData',
            name: 'WorkerData',
            show: 0,
            component: () => import('@/views/datamanage/WorkerData'),
            meta: { title: '任务流水', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/table-list/:pageNo([1-9]\\d*)?',
            name: 'OtherData',
            show: 0,
            hideChildrenInMenu: true, // 强制显示 MenuItem 而不是 SubMenu
            component: () => import('@/views/datamanage/OtherData'),
            meta: { title: '开票记录', keepAlive: true, permission: ['table'] }
          },
        ]
      },


      {
        path: '/profile',
        name: 'profile',
        show: 0,
        showname: 'cailiao',
        component: RouteView,
        redirect: '/profile/basic',
        meta: { title: '材料管理', icon: 'profile', permission: ['profile'] },
        children: [
          // {
          //   path: '/profile/addgoods',
          //   name: 'AddGoodsDetail',
          //   hideChildrenInMenu: true,
          //   component: () => import('@/views/profile/addgoods/AddGoodsDetail'),
          //   meta: { title: '12345',keepAlive: true, permission: ['profile'] }
          // },
          {
            path: '/profile/basic',
            name: 'ShopGoodsManagement',
            hideChildrenInMenu: true,
            show: 0,
            component: () => import('@/views/profile/basic/ShopGoodsManagement'),
            meta: { title: '材料管理', keepAlive: true, permission: ['profile'] }
          },
          {
            path: '/profile/SellingShopGoodsManage',
            name: 'SellingShopGoodsManage',
            hideChildrenInMenu: true,
            show: 0,
            component: () => import('@/views/profile/basic/SellingShopGoodsManage'),
            meta: { title: '直销材料管理', keepAlive: true, permission: ['profile'] }
          },
          {
            path: '/profile/GoodsSellingMange',
            name: 'GoodsSellingMange',
            hideChildrenInMenu: true,
            show: 0,
            component: () => import('@/views/profile/basic/GoodsSellingMange'),
            meta: { title: '厂商信息管理', keepAlive: true, permission: ['profile'] }
          },
          {
            path: '/profile/GoodsUnitMange',
            name: 'GoodsUnitMange',
            hideChildrenInMenu: true,
            show: 0,
            component: () => import('@/views/profile/basic/GoodsUnitMange'),
            meta: { title: '材料单位管理', keepAlive: true, permission: ['profile'] }
          },
          {
            path: '/profile/SizeGoodsUnitMange',
            name: 'SizeGoodsUnitMange',
            hideChildrenInMenu: true,
            show: 0,
            component: () => import('@/views/profile/basic/SizeGoodsUnitMange'),
            meta: { title: '规格单位管理', keepAlive: true, permission: ['profile'] }
          },
          {
            path: '/profile/GoodsColorMange',
            name: 'GoodsColorMange',
            hideChildrenInMenu: true,
            show: 0,
            component: () => import('@/views/profile/basic/GoodsColorMange'),
            meta: { title: '材料颜色管理', keepAlive: true, permission: ['profile'] }
          },
          {
            path: '/profile/GoodsWorktypeMange',
            name: 'GoodsWorktypeMange',
            hideChildrenInMenu: true,
            show: 0,
            component: () => import('@/views/profile/basic/GoodsWorktypeMange'),
            meta: { title: '工种管理', keepAlive: true, permission: ['profile'] }
          }
        ]
      },
      // result
      {
        path: '/result',
        name: 'result',
        show: 0,
        showname: 'xiaoshou',
        component: RouteView,
        redirect: '/result/success',
        meta: { title: '销售管理', icon: 'check-circle-o', permission: ['result'] },
        children: [
          // {
          //   path: '/result/OrderListManager',
          //   name: 'OrderListManager',
          //   component: () => import(/* webpackChunkName: "result" */ '@/views/result/OrderListManager'),
          //   meta: { title: '销售表单', keepAlive: false, hiddenHeaderContent: true, permission: ['result'] }
          // }
          {
            path: '/result/XiaoShouManager',
            name: 'XiaoShouManager',
            show: 0,
            component: () => import(/* webpackChunkName: "result" */ '@/views/result/XiaoShouManager'),
            meta: { title: '邀请码设置', keepAlive: false, hiddenHeaderContent: true, permission: ['result'] }
          },
          {
            path: '/result/SalesDistribution',
            name: 'SalesDistribution',
            show: 0,
            component: () => import(/* webpackChunkName: "result" */ '@/views/result/SalesDistribution'),
            meta: { title: '销售分配管理', keepAlive: false, hiddenHeaderContent: true, permission: ['result'] }
          },
          {
            path: '/list/TrackingCustomers',
            name: 'TrackingCustomers',
            show: 0,
            component: () => import('@/views/reportmanage/TrackingCustomers'),
            meta: { title: '销售人员跟踪客户', keepAlive: true, permission: ['table'] }
          },
          // {
          //   path: '/result/fail',
          //   name: 'ResultFail',
          //   component: () => import(/* webpackChunkName: "result" */ '@/views/result/Error'),
          //   meta: { title: '失败', keepAlive: false, hiddenHeaderContent: true, permission: ['result'] }
          // }
        ]
      },

      // Exception
      {
        path: '/exception',
        name: 'exception',
        show: 0,
        showname: 'renwu',
        component: RouteView,
        redirect: '/exception/ProjectManager',
        meta: { title: '任务管理', icon: 'slack', permission: ['exception'] },
        children: [
          {
            path: '/exception/ProjectManager',
            name: 'ProjectManager',
            show: 0,
            component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/ProjectManager'),
            meta: { title: '任务表单', permission: ['exception'] }
          }
          // {
          //   path: '/exception/404',
          //   name: 'Exception404',
          //   component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404'),
          //   meta: { title: '404', permission: ['exception'] }
          // },
          // {
          //   path: '/exception/500',
          //   name: 'Exception500',
          //   component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/500'),
          //   meta: { title: '500', permission: ['exception'] }
          // }
        ]
      },
      {
        path: '/cardmanage',
        name: 'cardmanage',
        show: 0,
        showname: 'kaquan',
        component: RouteView,
        redirect: '/view/cardmanage',
        meta: { title: '卡券管理', icon: 'table', permission: ['table'] },
        children: [

          {
            path: '/view/CardList',
            name: 'CardList',
            show: 0,
            component: () => import('@/views/cardmanage/CardList'),
            meta: { title: '卡券列表', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/view/DistributionRecord',
            name: 'DistributionRecord',
            show: 0,
            component: () => import('@/views/cardmanage/DistributionRecord'),
            meta: { title: '卡券发放记录', keepAlive: true, permission: ['table'] }
          },
        ]
      },
      // account
      {
        path: '/account',
        component: RouteView,
        show: 0,
        showname: 'canshu',
        redirect: '/account/center',
        name: 'account',
        meta: { title: '参数管理', icon: 'dot-chart', keepAlive: true, permission: ['user'] },
        children: [
          {
            path: '/account/center',
            name: 'center',
            show: 0,
            component: () => import('@/views/account/center'),
            meta: { title: '参数列表', keepAlive: true, permission: ['user'] }
          },
          {
            path: '/account/settings/base',
            name: 'BaseSettings',
            show: 0,
            component: () => import('@/views/account/settings/BaseSetting'),
            meta: { title: '广告设置', hidden: true, permission: ['user'] }
          },

          // {
          //   path: '/account/settings',
          //   name: 'settings',
          //   component: () => import('@/views/account/settings/Index'),
          //   meta: { title: '个人设置', hideHeader: true, permission: ['user'] },
          //   redirect: '/account/settings/base',
          //   hideChildrenInMenu: true,
          //   children: [
          //     {
          //       path: '/account/settings/base',
          //       name: 'BaseSettings',
          //       component: () => import('@/views/account/settings/BaseSetting'),
          //       meta: { title: '基本设置', hidden: true, permission: ['user'] }
          //     },
          //     {
          //       path: '/account/settings/security',
          //       name: 'SecuritySettings',
          //       component: () => import('@/views/account/settings/Security'),
          //       meta: { title: '安全设置', hidden: true, keepAlive: true, permission: ['user'] }
          //     },
          //     {
          //       path: '/account/settings/custom',
          //       name: 'CustomSettings',
          //       component: () => import('@/views/account/settings/Custom'),
          //       meta: { title: '个性化设置', hidden: true, keepAlive: true, permission: ['user'] }
          //     },
          //     {
          //       path: '/account/settings/binding',
          //       name: 'BindingSettings',
          //       component: () => import('@/views/account/settings/Binding'),
          //       meta: { title: '账户绑定', hidden: true, keepAlive: true, permission: ['user'] }
          //     },
          //     {
          //       path: '/account/settings/notification',
          //       name: 'NotificationSettings',
          //       component: () => import('@/views/account/settings/Notification'),
          //       meta: { title: '新消息通知', hidden: true, keepAlive: true, permission: ['user'] }
          //     }
          //   ]
          // }
        ]
      }

      // other

      // {
      //   path: '/other',
      //   name: 'otherPage',
      //   component: RouteView,
      //   meta: { title: '其他组件', icon: 'slack', permission: ['dashboard'] },
      //   redirect: '/other/icon-selector',
      //   children: [
      //     {
      //       path: '/other/icon-selector',
      //       name: 'TestIconSelect',
      //       component: () => import('@/views/other/IconSelectorView'),
      //       meta: { title: 'IconSelector', icon: 'tool', keepAlive: true, permission: ['dashboard'] }
      //     },
      //     {
      //       path: '/other/list',
      //       component: RouteView,
      //       meta: { title: '业务布局', icon: 'layout', permission: ['support'] },
      //       redirect: '/other/list/tree-list',
      //       children: [
      //         {
      //           path: '/other/list/tree-list',
      //           name: 'TreeList',
      //           component: () => import('@/views/other/TreeList'),
      //           meta: { title: '树目录表格', keepAlive: true }
      //         },
      //         {
      //           path: '/other/list/edit-table',
      //           name: 'EditList',
      //           component: () => import('@/views/other/TableInnerEditList'),
      //           meta: { title: '内联编辑表格', keepAlive: true }
      //         },
      //         {
      //           path: '/other/list/user-list',
      //           name: 'UserList',
      //           component: () => import('@/views/other/UserList'),
      //           meta: { title: '用户列表', keepAlive: true }
      //         },
      //         {
      //           path: '/other/list/role-list',
      //           name: 'RoleList',
      //           component: () => import('@/views/other/RoleList'),
      //           meta: { title: '角色列表', keepAlive: true }
      //         },
      //         {
      //           path: '/other/list/system-role',
      //           name: 'SystemRole',
      //           component: () => import('@/views/role/RoleList'),
      //           meta: { title: '角色列表2', keepAlive: true }
      //         },
      //         {
      //           path: '/other/list/permission-list',
      //           name: 'PermissionList',
      //           component: () => import('@/views/other/PermissionList'),
      //           meta: { title: '权限列表', keepAlive: true }
      //         }
      //       ]
      //     }
      //   ]
      // }
      , {
        path: '/carmanage',
        name: 'carmanage',
        showname: 'cheliang',
        show: 0,
        component: RouteView,
        redirect: '/list/carmanage',
        meta: { title: '车辆管理', icon: 'car', permission: ['table'] },
        children: [

          {
            path: '/list/CarParametersSet',
            name: 'CarParametersSet',
            show: 0,
            component: () => import('@/views/carmanage/CarParametersSet'),
            meta: { title: '参数设置', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/VehicleCharge',
            name: 'VehicleCharge',
            show: 0,
            component: () => import('@/views/carmanage/VehicleCharge'),
            meta: { title: '收费标准', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/CarOrderList',
            name: 'CarOrderList',
            show: 0,
            component: () => import('@/views/carmanage/CarOrderList'),
            meta: { title: '车辆订单', keepAlive: true, permission: ['table'] }
          },
        ]
      },
      {
        path: '/financialmanage',
        name: 'financialmanage',
        component: RouteView,
        show: 0,
        showname: 'caiwu',
        redirect: '/list/datamanage',
        meta: { title: '财务管理', icon: 'dollar', permission: ['table'] },
        children: [

          {
            path: '/list/TransactionRecord',
            name: 'TransactionRecord',
            show: 0,
            component: () => import('@/views/financialmanage/TransactionRecord'),
            meta: { title: '交易记录', keepAlive: true, permission: ['table'] }
          },
          // {
          //   path: '/list/WithdrawalApplication',
          //   name: 'WithdrawalApplication',
          //   component: () => import('@/views/financialmanage/WithdrawalApplication'),
          //   meta: { title: '提现申请', keepAlive: true, permission: ['table'] }
          // },
          {
            path: '/list/RefundApplication',
            name: 'RefundApplication',
            show: 0,
            component: () => import('@/views/financialmanage/RefundApplication'),
            meta: { title: '退款申请', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/CollectionRecord',
            name: 'CollectionRecord',
            show: 0,
            component: () => import('@/views/financialmanage/CollectionRecord'),
            meta: { title: '订单后台收款记录', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/KaipiaoRecord',
            name: 'KaipiaoRecord',
            show: 0,
            component: () => import('@/views/financialmanage/KaipiaoRecord'),
            meta: { title: '订单开票审核', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/DiscountRecord',
            name: 'DiscountRecord',
            show: 0,
            component: () => import('@/views/financialmanage/DiscountRecord'),
            meta: { title: '订单折扣审核', keepAlive: true, permission: ['table'] }
          },
        ]
      },
      {
        path: '/generalmanager',
        name: 'generalmanager',
        component: RouteView,
        show: 0,
        showname: 'zongjinban',
        redirect: '/view/generalmanager',
        meta: { title: '总经办管理', icon: 'audit', permission: ['exception'] },
        children: [
          {
            path: '/generalmanager/GeneralmanagerDiscountRecord',
            name: 'GeneralmanagerDiscountRecord',
            show: 0,
            component: () => import(/* webpackChunkName: "fail" */ '@/views/generalmanager/GeneralmanagerDiscountRecord'),
            meta: { title: '订单折扣总审核', permission: ['exception'] }
          },
          {
            path: '/generalmanager/UserOperationRecord',
            name: 'UserOperationRecord',
            show: 0,
            component: () => import(/* webpackChunkName: "fail" */ '@/views/generalmanager/UserOperationRecord'),
            meta: { title: '用户操作记录', permission: ['exception'] }
          }
        ]
      },
      {
        path: '/reportmanage',
        name: 'reportmanage',
        component: RouteView,
        show: 0,
        showname: 'baobiao',
        redirect: '/list/reportmanage',
        meta: { title: '报表管理', icon: 'line-chart', permission: ['table'] },
        children: [

          {
            path: '/list/ValidOrder',
            name: 'ValidOrder',
            show: 0,
            component: () => import('@/views/reportmanage/ValidOrder'),
            meta: { title: '有效订单报表', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/SalesRanking',
            name: 'SalesRanking',
            show: 0,
            component: () => import('@/views/reportmanage/SalesRanking'),
            meta: { title: '材料销量排行', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/BadRanking',
            name: 'BadRanking',
            show: 0,
            component: () => import('@/views/reportmanage/BadRanking'),
            meta: { title: '材料好评排行', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/WorkersPraise',
            name: 'WorkersPraise',
            show: 0,
            component: () => import('@/views/reportmanage/WorkersPraise'),
            meta: { title: '工人好评排行', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/GoodsProfit',
            name: 'GoodsProfit',
            show: 0,
            component: () => import('@/views/reportmanage/GoodsProfit'),
            meta: { title: '材料盈利排行', keepAlive: true, permission: ['table'] }
          },
          {
            path: '/list/SalesPerformance',
            name: 'SalesPerformance',
            show: 0,
            component: () => import('@/views/reportmanage/SalesPerformance'),
            meta: { title: '销售业绩报表', keepAlive: true, permission: ['table'] }
          },
         
          // {
          //   path: '/list/ShouldCollection',
          //   name: 'ShouldCollection',
          //   component: () => import('@/views/reportmanage/ShouldCollection'),
          //   meta: { title: '客户应收统计', keepAlive: true, permission: ['table'] }
          // },
          // {
          //   path: '/list/CommodityIncome',
          //   name: 'CommodityIncome',
          //   component: () => import('@/views/reportmanage/CommodityIncome'),
          //   meta: { title: '商品收益统计', keepAlive: true, permission: ['table'] }
          // },
        ]
      },
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]

/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      },
      {
        path: 'register',
        name: 'register',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Register')
      },
      {
        path: 'register-result',
        name: 'registerResult',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/RegisterResult')
      },
      {
        path: 'recover',
        name: 'recover',
        component: undefined
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }
]
