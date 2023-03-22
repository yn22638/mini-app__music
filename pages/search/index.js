// pages/search/index.js
import { request } from '../../request/index'
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //热搜数据
    hotSearch: [],
    hotSearchAll: [],
    // 搜索框内容
    inpValue: '',
    // 搜索列表
    searchList: [],


    // 取消 按钮 是否显示
    isFocus: false,

    // 控制搜索页面显示隐藏
    contentDisplay: false,

    // 搜索列表是否显示隐藏显示
    searchDisplay: false,

    
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 热搜列表
    this.getHotSearch();
    this.getHotSearchAll();
  },
  //可获取默认搜索关键词 /search/default
  // async getAboutText(){
  //   const { data } = await request({ url:"/search/default"});
  //   console.log(data);
  // }

  // 获取热搜列表 /search/hot  
  async getHotSearch() {
    const { data } = await request({ url: "/search/hot" });
    // console.log(data.result.hots);
    this.setData({
      hotSearch: data.result.hots
    })
  },
  // 获取热搜列表 详细 /search/hot/detail
  async getHotSearchAll() {
    const { data } = await request({ url: "/search/hot/detail" });
    // console.log(data.data);
    this.setData({
      hotSearchAll: data.data
    })
  },
  TimeId: -1,
  // 输入框的值改变 就会触发的事件
  handleInput(e) {
    // 1 获取输入框的值
    // console.log(e.detail);
    // 这里我太聪明了吧 宝贝
    const { value } = e.detail || e;
    // console.log(value);
    // 2 检测合法性
    if (!value.trim()) {
      this.setData({
        searchList: [],
        isFocus: false,
        contentDisplay: false,
        searchDisplay: false
      })
      // 值不合法
      return;
    }
    // 3 准备发送请求获取数据
    this.setData({
      inpValue: value,
      isFocus: true,
      contentDisplay: true,
      searchDisplay: true
    })
    clearTimeout(this.TimeId);
    this.TimeId = setTimeout(() => {
      this.qsearch(value);
    }, 1000);
  },
  // 发送请求获取搜索建议 数据  /cloudsearch?keywords= 海阔天空
  async qsearch(query) {
    const { data } = await request({ url: "/cloudsearch", data: { keywords: query } });
    // console.log(res);
    const searchList = data.result.songs;
    // console.log(searchList);
    this.setData({
      searchList
    })
  },
  // 点击 取消按钮
  handleCancel() {
    this.setData({
      inpValue: "",
      isFocus: false,
      searchList: [],
      contentDisplay: false,
      searchDisplay: false,
    })
  },
  // 点击搜索列表跳转searchDetail页面 /pages/searchDetail/index?keywords={{item.name}}
  toSearchMusic(event) {
    // console.log(event.target.dataset.keywords);
    const {keywords} = event.target.dataset;
    // console.log(keywords);
    this.setData({
      searchList: [],
      inpValue:'',
      isFocus: false,
      contentDisplay: false,
      searchDisplay: false
    })
    wx.navigateTo({
      url: '/pages/searchDetail/index?keywords=' + keywords
    })
    
  },
  // 点击热门搜索 upDateMusic
  upDateMusic(e){
    console.log(e.currentTarget.dataset);
    // inpValue
    const inpValue = e.currentTarget.dataset.value;
    this.setData({
      inpValue
    });
    this.handleInput(e.currentTarget.dataset);
  },
  // 刷新关闭下拉框
  onPullDownRefresh() {
    setInterval(() => {
      wx.stopPullDownRefresh()
    }, 2000)
  }
})