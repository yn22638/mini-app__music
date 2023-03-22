// pages/searchDetail/index.js
import { request } from '../../request/index'
import regeneratorRuntime from '../../lib/runtime/runtime';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 搜索框内容
    inpValue: '',
    // 搜索列表
    searchList: [],
    // 取消 按钮 是否显示
    isFocus: false,

    // 搜索列表是否显示隐藏显示
    searchDisplay: false,
    // 控制页面显示隐藏
    searchConDisplay: false,
    // tabNav列表
    tabList:[
      
      {
        id:1,
        name:"单曲",
        isActive: true
      },
      {
        id: 10,
        name: "专辑",
        isActive: false
      },
      {
        id: 100,
        name: "歌手",
        isActive: false
      },
      {
        id: 1002,
        name: "用户",
        isActive: false
      },
      {
        id: 1000,
        name: "歌单",
        isActive: false
      },
      {
        id: 1004,
        name: "MV",
        isActive: false
      },
      {
        id: 1006,
        name: "歌词",
        isActive: false
      },
      {
        id: 1009,
        name: "电台",
        isActive: false
      },
      {
        id: 1014,
        name: "视频",
        isActive: false
      },
      {
        id: 1018,
        name: "综合",
        isActive: false
      },
    ],
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log(options);
    const inpValue = options.keywords;
    this.qsearch(inpValue);
    this.setData({
      inpValue
    });
    console.log('bbbbb');
    console.log(getCurrentPages().length);
    console.log('bbbbb');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  TimeId: -1,
  // 输入框的值改变 就会触发的事件
  handleInput(e) {
    // 1 获取输入框的值
    // console.log(e.detail);
    const { value } = e.detail;
    console.log(value);
    if(value == ''){
      wx.switchTab({
        url: '/pages/search/index'
      })
    }
    // 3 准备发送请求获取数据
    this.setData({
      inpValue: value,
      isFocus: true,
      searchConDisplay: true,
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
    console.log(searchList);
    this.setData({
      searchList,
      audioList:searchList
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
    wx.switchTab({
      url: '/pages/search/index'
    })
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
    console.log(id);
    const { data } = await request({ url: "/song/url", data: { id } })
    console.log(data);
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
  }
})