import ET from "./lib/event.js";
import Storage from "./utils/storageUtil.js";
const  onfire =  require('./lib/onfire.js');
import Navigation from "./utils/navigationUtil.js";


//app.js
App({

  event: onfire,
  onLaunch: function (options) {

  },
  onShow:function(options){
    // console.log('我是onShow-------->');
    // var pages = getCurrentPages();
    // console.log('pages---->', pages); 
    // console.log('options---->', options);
    // // 聊天主页面下拉
    // //从后台切换到前台
    // if (options.scene == 1089 && pages.length > 0 && pages[0].route == 'pages/me/admissions/showAdmissions'){
    //   console.log('w我是从聊天主页面下拉进来的------->');
    //   Navigation.redirectTo(`/pages/index/index`);
    // }
  },
  globalData: {
    punchMusicVersion: 1.3,
    minSdkVersion : "1.6.3",
    //引导模式
    isGuide : false
  }
  
})