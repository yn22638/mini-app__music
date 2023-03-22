// pages/songReview/index.js
import { request } from '../../request/index'
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 歌单信息
    songIntroduce: [],
    // 所有评论
    musicComment: [],
    // 综合评论
    commentAll: [],
    tabList:[
      {
        id:0,
        name:"推荐",
        isActive:true,
      },
      {
        id:1,
        name:"最热",
        isActive:false
      },
      {
        id: 2,
        name: "最新",
        isActive: false
      }
    ]
  },
  // 获取传过来的id
  mListId: 0,
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);
    const { id } = options;
    this.mListId = id;
    console.log('aaaaaa');
    console.log(getCurrentPages().length);
    console.log('aaaaaa');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getSongList();
    this.getMusicComment();
  },
  // 获取歌单信息
  async getSongList() {
    const id = this.mListId;
    // console.log(id);
    const { data } = await request({ url: "/playlist/detail", data: { id } })
    const songIntroduce = data.playlist;
    // console.log(songIntroduce);
    this.setData({
      songIntroduce
    })
  },
  // 通过歌单id获取歌曲评论
  async getMusicComment() {
    // 获取100条数据 后期会变成下拉就获取15条评论
    const { data } = await request({ url: "/comment/playlist?id=" + this.mListId, data: { limit: 100 } });
    const musicComment = data;
    const commentAll = [];
    for (let index = 0; index < 10; index++) {
      // 获取指定的评论数组数据 后期改成随机获取评论数据
      commentAll.push(data.hotComments[index]);
      commentAll.push(data.comments[index]);
    }
    for (let index = 0; index < musicComment.hotComments.length; index++) {
      musicComment.hotComments[index].time = this.formatDateTimeAll(musicComment.hotComments[index].time);
    }
    for (let index = 0; index < musicComment.comments.length; index++) {
      musicComment.comments[index].time = this.formatDateTimeAll(musicComment.comments[index].time);
    }
    // console.log(commentAll);
    console.log(musicComment);
    this.setData({
      musicComment,
      commentAll
    })
  },
  // 时间日期格式转换 年月日时分秒
  formatDateTimeAll(inputTime) {
    var date = new Date(inputTime);
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    m = m < 10 ? ('0' + m) : m;
    var d = date.getDate();
    d = d < 10 ? ('0' + d) : d;
    var h = date.getHours();
    h = h < 10 ? ('0' + h) : h;
    var minute = date.getMinutes();
    var second = date.getSeconds();
    minute = minute < 10 ? ('0' + minute) : minute;
    second = second < 10 ? ('0' + second) : second;
    return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + second;
  },
  // 标题点击事件变颜色
  handleItemTap(e) {
    // console.log(e);
    // 获取被点击的标题索引
    const { index } = e.target.dataset;
    // console.log(index);
    // 修改元素组
    let { tabList } = this.data;
    tabList.forEach((v, i) => {
      i == index ? v.isActive = true : v.isActive = false
    });
    // 赋值到data中
    this.setData({
      tabList
    })
  },

  // 点击进入歌单页面
  goToMusicDetail(e){
    console.log(e.currentTarget.dataset.id);
    wx.redirectTo({
      url:`/pages/songList/index?id=${e.currentTarget.dataset.id}`
    })
  },
  // 刷新关闭下拉框
  onPullDownRefresh() {
    setInterval(() => {
      wx.stopPullDownRefresh()
    }, 3000)
  }
})