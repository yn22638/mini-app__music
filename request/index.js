// 封装api
export const request = (params) => {
  return new Promise((res, rej) => {
    // 定义公共的url
    const baseUrl = 'https://autumnfish.cn';
    wx.request({
      ...params,
      url: baseUrl + params.url,
      success: (result) => {
        // console.log(res);
        if (result) {
          res(result)
        }
      },
      fail: (err) => { rej(err); },
      complete: () => { }
    })
  })
}