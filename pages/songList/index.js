// pages/songList/index.js
import { request } from '../../request/index'
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 获取歌单id
    id: null,
    // 头部数据
    songIntroduce: [],
    // 歌单歌曲
    songMusicList: [],
    // 总高度
    height: 0,
    // 歌曲播放
    playStatus: true,
    audioIndex: 0,
    progress: 0,
    duration: 0,
    audioList: [],
    showList: true,
    musicId: 0,
    musicUrl: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);
    const { id } = options;
    // console.log(id);
    this.setData({
      id
    });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getSongList();
    // 获取页面高度
    // this.getPageHeight();
    // 关闭音乐播放器
    // wx.stopBackgroundAudio();
  },
  // 通过id获取歌单里面的数据
  async getSongList() {
    const id = this.data.id;
    // console.log(id);
    const { data } = await request({ url: "/playlist/detail", data: { id } })
    const songIntroduce = data.playlist;
    const songMusicList = data.playlist.tracks;
    console.log(songMusicList);
    if (songIntroduce.playCount > 10000) {
      if (songIntroduce.playCount > 100000000) {
        songIntroduce.playCount = parseInt(songIntroduce.playCount / 100000000) + '亿';
      } else {
        songIntroduce.playCount = parseInt(songIntroduce.playCount / 10000) + '万';
      }
    }
    if (songIntroduce.subscribedCount > 100000) {
      songIntroduce.subscribedCount = '10万+';
    }
    this.setData({
      songIntroduce,
      songMusicList,
      audioList: songMusicList
    })
  },
  // 点击自动播放音乐
  playMusic: async function () {
    // console.log(this.data.audioList[this.data.audioIndex]);
    let audio = this.data.audioList[this.data.audioIndex];
    console.log(audio);
    let manager = wx.getBackgroundAudioManager();
    manager.title = audio.al.name || "音频标题";
    manager.epname = audio.epname || "专辑名称";
    manager.singer = audio.ar[0].name || "歌手名";
    manager.coverImgUrl = audio.al.picUrl;
    this.setData({
      musicId: audio.id
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
    const id = this.data.musicId;
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
    console.log(e.currentTarget.dataset);
    this.setData({
      musicId: e.currentTarget.dataset.id
    });
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
  },

  // 点击解决只能跳转10次问题
  goToMusicDetail(e){
    console.log(e.currentTarget.dataset.id);
    wx.redirectTo({
      url:`/pages/songReview/index?id=${e.currentTarget.dataset.id}`
    })
  },
  //获取当前页面高度
  // getPageHeight() {
  //   //创建节点选择器
  //   var query = wx.createSelectorQuery();
  //   //选择id
  //   var that = this;
  //   query.select('#myText').boundingClientRect(function (rect) {
  //     // console.log(rect.width)
  //     console.log((rect.height*2) + 'rpx');
  //     that.setData({
  //       height: rect.width + 'rpx'
  //     })
  //   }).exec();
  // }
})