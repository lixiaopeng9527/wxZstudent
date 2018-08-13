export default class  CommonSev {

  static getWxShare(title,url,imageUrl){
    let wxUserInfo = getApp().globalData.wxUserInfo || {};  
    let name = wxUserInfo.nickName ? wxUserInfo.nickName : "";
    // let title = `${name} 邀请你使用：微信打卡，简而不“烦”`;    
    //let title = `知了智能名片`;       
     return {
       title: title ? title :'招生效果提升5倍，3天新园变满园！',
       path: url?url:'/pages/index/index',
       imageUrl: imageUrl ? imageUrl :"https://static.imzhiliao.com/shareZs.jpg" 
     }
   }

}