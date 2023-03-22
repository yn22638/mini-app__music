import { request } from '../../request/index'
import regeneratorRuntime from '../../lib/runtime/runtime';
//Page Object
Page({
  data: {
    // 榜单推荐
    Recommend:[],
    // 官方榜
    officialList:[],
    // 特色榜单
    characteristicList:[],
    // 全球榜
    globalList:[],
    // 地区榜
    regionalList:[],
    // 更多榜单
    listAll:[]
  },
  //options(Object)
  onShow: function () {
    this.getRankingList()
  },
  async getRankingList() {
    // 获取所有榜单数据
    const {data} = await request({ url: "/toplist/detail" });
    // console.log(data);
    const result = data.list;
    // console.log(result);
    // 榜单推荐数据
    const arrRecommend = [];
    arrRecommend.push(result[7],result[29],result[19]);
    // console.log(arrRecommend);
    // 官方榜
    const officialList = [];
    for (let index = 0; index < 4; index++) {
      officialList.push(result[index])
    }
    // officialList.push()

    // 特色榜 result[7,30] characteristic
    const characteristicList =[];
    characteristicList.push(result[7],result[30])
    
    // 全球榜单
    const globalList = [];
    globalList.push(result[13],result[12],result[16],result[17],result[21],result[20])
    // 地区榜
    const regionalList = [];
    regionalList.push(result[19],result[26],result[9])
    // console.log(globalList);
    const listAll = [];
    listAll.push(result[8],result[10],result[15],result[18],result[22],result[23],result[24],result[25],)
    this.setData({
      Recommend: arrRecommend,
      officialList,
      characteristicList,
      globalList,
      regionalList,
      listAll
    })
  },
  // 刷新关闭下拉框
  onPullDownRefresh() {
    setInterval(() => {
      wx.stopPullDownRefresh()
    }, 2000)
  }

});
