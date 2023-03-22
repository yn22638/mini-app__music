import { request } from '../../request/index'
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  data: {
    musicDetail: [],
    // 歌曲url
    musicUrl:'',
    // 歌曲id
    id:0,
    // 歌词
    lyric:'',
  },
  /**
     * 生命周期函数--监听页面显示
     */
  onShow: function () {
    this.getMusicDetail();
    this.getmusicText();
  },

  /**
     * 生命周期函数--监听页面加载
     */
  // 获取传过来的歌曲id
  onLoad: function (options) {
    // console.log(options);
    const { id } = options;
    // console.log(id);
    this.setData({
      id
    })
  },
  // 通过id获取歌曲url
  async getMusicDetail(){
    const id = this.data.id;
    // console.log(id);
    const { data } = await request({ url: "/song/url", data: { id } })
    // console.log(data);
    // 获取歌曲url
    const musicUrl = data.data[0].url;
    // 获取歌曲详情/song/detail
    const detail = await request({ url: "/song/detail", data: { ids : id } })
    const musicDetail = detail.data.songs[0];
    // console.log(musicDetail);
    this.setData({
      musicUrl,
      musicDetail
    })
    // const { data } = await request({ url: `/song/url${id}` })
  },
  // 获取音乐歌词 /lyric
  async getmusicText(){
    const id = this.data.id;
    const { data } = await request({ url:"/lyric",data:{id}});
    const { lyric } = data.lrc;
    console.log(lyric);
    this.setData({
      lyric
    })
  },
  onReady: function (e) {

    // 使用 wx.createAudioContext 获取 audio 上下文 context

    this.audioCtx = wx.createAudioContext('myAudio')

  },

  audioPlay: function () {

    this.audioCtx.play()

  },

  audioPause: function () {

    this.audioCtx.pause()

  },

  audio14: function () {

    this.audioCtx.seek(14)

  },

  audioStart: function () {

    this.audioCtx.seek(0)

  }

})