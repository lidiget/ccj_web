import { asyncRouterMap, constantRouterMap } from '@/config/router.config'

/**
 * 过滤账户是否拥有某一个权限，并将菜单从加载列表移除
 *
 * @param permission
 * @param route
 * @returns {boolean}
 */
function hasPermission(permission, route) {
  if (route.meta && route.meta.permission) {
    let flag = false
    for (let i = 0, len = permission.length; i < len; i++) {
      flag = route.meta.permission.includes(permission[i])
      if (flag) {
        return true
      }
    }
    return false
  }
  return true
}

/**
 * 单账户多角色时，使用该方法可过滤角色不存在的菜单
 *
 * @param roles
 * @param route
 * @returns {*}
 */
// eslint-disable-next-line
function hasRole(roles, route) {
  if (route.meta && route.meta.roles) {
    return route.meta.roles.includes(roles.id)
  } else {
    return true
  }
}

function filterAsyncRouter(routerMap, roles) {
  const accessedRouters = routerMap.filter(route => {
    if (hasPermission(roles.permissionList, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, roles)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },

  actions: {
    GenerateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { roles } = data
        var rights = JSON.parse(window.localStorage.getItem('rights'))


        if (rights) {
          var alldata = [];
          asyncRouterMap[0].children.forEach(element => {
            if (element.showname == "xitong") {
              element.show = rights[0].xitong
              element.children.forEach(item => {
                if (item.name == "BaseForm") {
                  item.show = rights[0].children[0].yonghuguanli
                }
                if (item.name == "authorityManagement") {
                  item.show = rights[0].children[1].quanxianguanli
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "yonghu") {
              element.show = rights[1].yonghu
              element.children.forEach(item => {
                if (item.name == "CommonUser") {
                  item.show = rights[1].children[0].putongyonghu
                }
                if (item.name == "WorkUser") {
                  item.show = rights[1].children[1].gongrenyonghu
                }
                if (item.name == "VipUser") {
                  item.show = rights[1].children[2].huiyuanyonghu
                }
                if (item.name == "UserJiFenSet") {
                  item.show = rights[1].children[3].jifenshezhi
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }
            if (element.showname == "yewu") {
              element.show = rights[2].yewu
              element.children.forEach(item => {
                if (item.name == "OrderListManager") {
                  item.show = rights[2].children[0].dingdanliebiao
                }
                if (item.name == "WorkerOrderListManager") {
                  item.show = rights[2].children[1].rengongdingdan
                }
                if (item.name == "LogisticsManagement") {
                  item.show = rights[2].children[2].wuliuxinxi
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "shuju") {
              element.show = rights[3].shuju
              element.children.forEach(item => {
                if (item.name == "BrowseData") {
                  item.show = rights[3].children[0].liulanshuju
                }
                if (item.name == "BadEvaluationData") {
                  item.show = rights[3].children[1].pinglunshuju
                }
                if (item.name == "WorkerData") {
                  item.show = rights[3].children[2].renwuliushui
                }
                if (item.name == "OtherData") {
                  item.show = rights[3].children[3].kaipiaojilu
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "cailiao") {
              element.show = rights[4].cailiao
              element.children.forEach(item => {
                if (item.name == "ShopGoodsManagement") {
                  item.show = rights[4].children[0].cailiaoguanli
                }
                if (item.name == "SellingShopGoodsManage") {
                  item.show = rights[4].children[1].zhixiaocailiaoguanli
                }
                if (item.name == "GoodsSellingMange") {
                  item.show = rights[4].children[2].changshangxinxi
                }
                if (item.name == "GoodsUnitMange") {
                  item.show = rights[4].children[3].cailiaodanwei
                }
                if (item.name == "SizeGoodsUnitMange") {
                  item.show = rights[4].children[4].guigedanwei
                }
                if (item.name == "GoodsColorMange") {
                  item.show = rights[4].children[5].yanseguanli
                }
                if (item.name == "GoodsWorktypeMange") {
                  item.show = rights[4].children[6].gongzhongguanli
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "xiaoshou") {
              element.show = rights[5].xiaoshou
              element.children.forEach(item => {
                if (item.name == "XiaoShouManager") {
                  item.show = rights[5].children[0].xiaoshoubiaodan
                }
                if (item.name == "SalesDistribution") {
                  item.show = rights[5].children[1].xiaoshoufenpei
                }
                if (item.name == "TrackingCustomers") {
                  item.show = rights[5].children[2].genzong
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "renwu") {
              element.show = rights[6].renwu
              element.children.forEach(item => {
                if (item.name == "ProjectManager") {
                  item.show = rights[6].children[0].renwubiaodan
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "kaquan") {
              element.show = rights[7].kaquan
              element.children.forEach(item => {
                if (item.name == "CardList") {
                  item.show = rights[7].children[0].kaquanliebiao
                }
                if (item.name == "DistributionRecord") {
                  item.show = rights[7].children[1].fafangjilu
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "canshu") {
              element.show = rights[8].canshu
              element.children.forEach(item => {
                if (item.name == "center") {
                  item.show = rights[8].children[0].canshuliebiao
                }
                if (item.name == "BaseSettings") {
                  item.show = rights[8].children[1].guanggaoshezhi
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "cheliang") {
              element.show = rights[9].cheliang
              element.children.forEach(item => {
                if (item.name == "CarParametersSet") {
                  item.show = rights[9].children[0].cheliangcanshu
                }
                if (item.name == "VehicleCharge") {
                  item.show = rights[9].children[1].shoufeibiaozhun
                }
                if (item.name == "CarOrderList") {
                  item.show = rights[9].children[2].cheliangdingdan
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

            if (element.showname == "caiwu") {
              element.show = rights[10].caiwu
              element.children.forEach(item => {
                if (item.name == "TransactionRecord") {
                  item.show = rights[10].children[0].jiaoyijilu
                }
                if (item.name == "RefundApplication") {
                  item.show = rights[10].children[1].tuikuanshenqing
                }
                if (item.name == "CollectionRecord") {
                  item.show = rights[10].children[2].shoukuanjilu
                }
                if (item.name == "KaipiaoRecord") {
                  item.show = rights[10].children[3].kaipiaoshenhe
                }
                if (item.name == "DiscountRecord") {
                  item.show = rights[10].children[4].zhekoushenhe
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }


            if (element.showname == "zongjinban") {
              element.show = rights[11].zongjinban
              element.children.forEach(item => {
                if (item.name == "GeneralmanagerDiscountRecord") {
                  item.show = rights[11].children[0].zhekouzongshenhe
                }
                if (item.name == "UserOperationRecord") {
                  item.show = rights[11].children[1].caozuojilu
                }
              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }




            if (element.showname == "baobiao") {
              element.show = rights[12].baobiao

              element.children.forEach(item => {
                if (item.name == "ValidOrder") {
                  item.show = rights[12].children[0].dingdanbaobiao
                }
                if (item.name == "SalesRanking") {
                  item.show = rights[12].children[1].xiaoshoupaihang
                }
                if (item.name == "BadRanking") {
                  item.show = rights[12].children[2].chapingpaihang
                }
                if (item.name == "WorkersPraise") {
                  item.show = rights[12].children[3].haopingpaihang
                }
                if (item.name == "GoodsProfit") {
                  item.show = rights[12].children[4].yinglipaihang
                }
                if (item.name == "SalesPerformance") {
                  item.show = rights[12].children[5].yejibaobiao
                }

              })
              var newdata = [];
              element.children.forEach(item => {
                if (item.show == 1) {
                  newdata.push(item)
                }
              })
              element.children = newdata;
            }

          });





          asyncRouterMap[0].children.forEach(element => {
            if (element.show == 1) {
              alldata.push(element);
            }
          });
          asyncRouterMap[0].children = alldata;
        }
        const accessedRouters = filterAsyncRouter(asyncRouterMap, roles)
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
