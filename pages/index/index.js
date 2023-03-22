import { request } from '../../request/index'
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperList: [],
    musicComment: [],
    newMusic: [],
    mvComment: [],
    playCountArr: [],
    // 歌曲播放
    playStatus: true,
    audioIndex: 0,
    progress: 0,
    duration: 0,
    audioList: [],
    showList: true,
    id: 0,
    musicUrl: '',

  },
  // 获取歌单播放次数
  playCountArr: [],
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function () {
    this.getSwiperList();
    this.getMusicComment();
    this.getNewMusic();
    this.getMvComment();
    this.getMusicDetail();
    
    // 关闭音乐播放器
    // wx.stopBackgroundAudio();
  },
  // 获取swiper数据
  async getSwiperList() {
    // console.log("123");
    const { data } = await request({ url: "/banner", data: { type: 1 } })
    // console.log(data);
    const swiperList = data.banners;
    // console.log(swiperList);
    this.setData({
      swiperList
    })
    // console.log(this.data.swiperList);
  },
  // 获取歌单推荐
  async getMusicComment() {
    const { data } = await request({ url: "/personalized" });

    const { result } = data;
    // console.log(result);
    // 15233515376
    this.setData({
      musicComment: result
    })
    this.data.musicComment.forEach((key, value) => {
      if (key.playCount > 10000) {
        key.playCount = parseInt(key.playCount / 10000) + '万';
      }
      this.playCountArr.push(key.playCount)
    });
    const playCountArr = this.playCountArr;
    this.setData({
      playCountArr
    })
    // console.log(this.playCountArr);
  },

  // 点击歌单跳转歌单列表 
  // toSongList(event){
  //   // console.log(event.currentTarget.dataset.id);
  //   const { id } = event.currentTarget.dataset;
  //   wx.navigateTo({
  //     url: '/pages/songList / index ? id =' + id
  //   })
  // },



  // 获取最新音乐
  async getNewMusic() {
    const { data } = await request({ url: "/personalized/newsong" });
    const { result } = data;
    // console.log(result);
    console.log(result);
    this.setData({
      newMusic: result,
      audioList: result
    })
  },
  // 获取推荐mv /personalized/mv
  async getMvComment() {
    const { data } = await request({ url: "/mv/all", data: { limit: 3 } });
    // const { result } = data;
    this.setData({
      mvComment: data.data
    })
  },

  // 点击自动播放音乐
  playMusic: async function () {
    // console.log(this.data.audioList[this.data.audioIndex]);
    let audio = this.data.audioList[this.data.audioIndex];
    let manager = wx.getBackgroundAudioManager();
    manager.title = audio.name || "音频标题";
    manager.epname = audio.epname || "专辑名称";
    manager.singer = audio.song.artists[0].name || "歌手名";
    manager.coverImgUrl = audio.picUrl;
    this.setData({
      id:audio.id
    })
    await this.getMusicDetail();
    // 设置了 src 之后会自动播放
    // console.log(this.data.musicUrl);
    manager.src = this.data.musicUrl;
    manager.currentTime = 0;
    let that = this;
    manager.onPlay(function () {
      console.log("======onPlay======");
      that.setData({
        playStatus: true
      })
      that.countTimeDown(that, manager);
    });
    manager.onPause(function () {
      that.setData({
        playStatus: false
      })
      console.log("======onPause======");
    });
    manager.onEnded(function () {
      console.log("======onEnded======");
      that.setData({
        playStatus: false
      })
      setTimeout(function () {
        that.nextMusic();
      }, 1500);
    });
  },
  // 通过id获取歌曲url
  async getMusicDetail() {
    const id = this.data.id;
    // console.log(id);
    const { data } = await request({ url: "/song/url", data: { id } })
    // console.log(data);
    // 获取歌曲url
    const musicUrl = data.data[0].url;
    // 获取歌曲详情/song/detail
    // const detail = await request({ url: "/song/detail", data: { ids: id } })
    // const musicDetail = detail.data.songs[0];
    // console.log(musicUrl);
    this.setData({
      musicUrl,
      // musicDetail
    })
    // const { data } = await request({ url: `/song/url${id}` })
  },
  //循环计时
  countTimeDown: function (that, manager, cancel) {
    if (that.data.playStatus) {
      setTimeout(function () {
        if (that.data.playStatus) {
          // console.log("duration: " + manager.duration);
          // console.log(manager.currentTime);
          that.setData({
            progress: Math.ceil(manager.currentTime),
            progressText: that.formatTime(Math.ceil(manager.currentTime)),
            duration: Math.ceil(manager.duration),
            durationText: that.formatTime(Math.ceil(manager.duration))
          })
          that.countTimeDown(that, manager);
        }
      }, 1000)
    }
  },

  //拖动事件
  sliderChange: function (e) {
    let manager = wx.getBackgroundAudioManager();
    manager.pause();
    manager.seek(e.detail.value);
    this.setData({
      progressText: this.formatTime(e.detail.value)
    })
    setTimeout(function () {
      manager.play();
    }, 1000);
  },

  //列表点击事件
  listClick: function (e) {
    // console.log(e.currentTarget.dataset);
    this.setData({
      id:e.currentTarget.dataset.id
    });
    wx.hideTabBar();
    let pos = e.currentTarget.dataset.pos;
    if (pos != this.data.audioIndex) {
      this.setData({
        audioIndex: pos,
        showList: false
      })
      wx.stopBackgroundAudio();
      this.playMusic();
    } else {
      this.setData({
        showList: false
      })
    }
  },

  //上一首
  lastMusic: function () {
    let audioIndex = this.data.audioIndex > 0 ? this.data.audioIndex - 1 : this.data.audioList.length - 1;
    this.setData({
      audioIndex: audioIndex,
      playStatus: false,
      progress: 0,
      progressText: "00:00",
      durationText: "00:00"
    })
    setTimeout(function () {
      this.playMusic();
    }.bind(this), 1000);
  },

  //播放按钮
  playOrpause: function () {
    let manager = wx.getBackgroundAudioManager();
    if (this.data.playStatus) {
      manager.pause();
    } else {
      manager.play();
    }
  },

  //下一首
  nextMusic: function () {
    let audioIndex = this.data.audioIndex < this.data.audioList.length - 1 ? this.data.audioIndex + 1 : 0;
    this.setData({
      audioIndex: audioIndex,
      playStatus: false,
      progress: 0,
      progressText: "00:00",
      durationText: "00:00"
    })
    setTimeout(function () {
      this.playMusic();
    }.bind(this), 1000);
  },

  //界面切换
  pageChange: function () {
    this.setData({
      showList: true
    });
    wx.showTabBar();
  },

  //格式化时长
  formatTime: function (s) {
    let t = '';
    s = Math.floor(s);
    if (s > -1) {
      let min = Math.floor(s / 60) % 60;
      let sec = s % 60;
      if (min < 10) {
        t += "0";
      }
      t += min + ":";
      if (sec < 10) {
        t += "0";
      }
      t += sec;
    }
    return t;
  },
  // 刷新关闭下拉框
  onPullDownRefresh() {
    setInterval(() => {
      wx.stopPullDownRefresh()
    }, 2000)
  }
})