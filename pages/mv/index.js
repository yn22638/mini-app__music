// pages/mv/index.js
import { request } from '../../request/index'
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mvId: 0,
    mvUrl: '',
    mvMessage: [],
    // 歌手信息
    songerMessage: [],
    // 歌手id
    songerId: 0,
    mvAboutList: [],
    hotComments: [],
    newComments: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const mvId = options.id;
    this.setData({
      mvId
    });
    this.getMvDetail();
    this.getMvMessage();
    // this.getSongerMessage();
    this.getAboutMv();
    this.getAboutMusic();
    this.getHotComment();
    this.getNewComment();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 获取视频url /mv/url
  async getMvDetail() {
    const id = this.data.mvId;
    const { data } = await request({ url: '/mv/url', data: { id } });
    const mvDetail = data.data;
    this.setData({
      mvUrl: mvDetail.url,
    })
    // console.log(mvDetail);
  },
  // 获取视频信息 /mv/detail
  async getMvMessage() {
    const mvid = this.data.mvId;
    // const limit = 100;
    const { data } = await request({ url: '/mv/detail', data: { mvid } });
    const mvMessage = data.data;
    const songerId = mvMessage.artistId;
    // console.log(songerId);
    this.setData({
      mvMessage,
      songerId
    });
    this.getSongerMessage();
    // console.log(mvMessage);

  },
  // 获取歌手id /artists
  async getSongerMessage() {
    const id = this.data.songerId;
    const { data } = await request({ url: "/artists", data: { id } });
    // console.log(data);
    const songerMessage = data.artist;
    // console.log(songerMessage);
    this.setData({
      songerMessage
    })
  },
  // 获取相关音乐 /simi/song id 歌曲id 歌曲id获取的不对
  async getAboutMusic() {
    const id = this.data.mvId;
    // console.log(id);
    // const data = await request({url:"/simi/song",data:{id}});
    // console.log(data);
  },
  // 获取相关推荐/simi/mv
  async getAboutMv() {
    const mvid = this.data.mvId;
    // console.log(mvid);
    const { data } = await request({ url: "/simi/mv", data: { mvid } });
    // console.log(data);
    const mvAboutList = data.mvs;
    for (let index = 0; index < mvAboutList.length; index++) {
      if (mvAboutList[index].playCount >= 100000) {
        mvAboutList[index].playCount = parseInt(mvAboutList[index].playCount / 10000) + '万';
      }
      let min = parseInt(mvAboutList[index].duration / 1000 / 60);
      if (min < 10) {
        min = '0' + min
      }
      let sec = parseInt(mvAboutList[index].duration / 1000 % 60);
      if (sec < 10) {
        sec = '0' + sec
      }
      mvAboutList[index].duration = min + ':' + sec;
    }
    this.setData({
      mvAboutList
    });
    // console.log(mvAboutList);
  },
  // 获取精彩评论 /comment/mv
  async getHotComment() {
    const id = this.data.mvId;
    // console.log(id);
    const { data } = await request({ url: "/comment/mv", data: { id } });
    // console.log(data);
    const hotComments = data.hotComments;
    for (let index = 0; index < hotComments.length; index++) {
      hotComments[index].time = this.formatDateTimeAll(hotComments[index].time)
    }
    // console.log(hotComments);
    this.setData({
      hotComments
    })
  },
  // 获取最新评论 /comment/mv
  async getNewComment() {
    const id = this.data.mvId;
    const { data } = await request({ url: "/comment/mv", data: { id } });
    const newComments = data;
    for (let index = 0; index < newComments.comments.length; index++) {
      newComments.comments[index].time = this.formatDateTimeAll(newComments.comments[index].time)
    }
    console.log(newComments);
    this.setData({
      newComments
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
    // var h = date.getHours();
    // h = h < 10 ? ('0' + h) : h;
    // var minute = date.getMinutes();
    // var second = date.getSeconds();
    // minute = minute < 10 ? ('0' + minute) : minute;
    // second = second < 10 ? ('0' + second) : second;
    return y + '年' + m + '月' + d + '日 ';
  },
})