/**
 * 环境检查
 * @param localEnv
 */

var checkCurrentEnv = function (env) {

  let port = '';

  if (!env) env = 'dev';

  var SERVER = {
    url: {
      kidscare: "/kidscare",
      saas: "/kidscare",
      credit: "/credit",
      uc: "/uc",
      qrcode: "/qrcode",
      ucm: "/ucm",
      yucai: "/yucai",
      cmw: "/cmw",
      yxb: "/yxbAppWeb",
      freedom: "/freedom",
      boss: "/boss",
      baby: "/baby",
      robrain: "/robrain",
      message: "/message",
      file: "/file",
      vip: "/vip",
      topic: "/topic",
      root: ""
    }
  };

  SERVER.env = env;

  //端口检查
  for (var obj in SERVER.url) {        
    var domain =  env+"-applet"+ ".imzhiliao.com"; 
    //var domain = env + ".imzhiliao.com"; 
    SERVER.url[obj] = "https://" + domain + port + SERVER.url[obj];    
   //var domain = env +".imzhiliao.com"; 
    // if (obj == 'qrcode') {
    //   SERVER.url[obj] = "http://172.31.120.110:" + "8080" + SERVER.url[obj];
    // }else{
    //   SERVER.url[obj] = "http://" + domain + port + SERVER.url[obj]; 
    // }
    //SERVER.url[obj] = "https://" + domain + port + SERVER.url[obj]; 
    
  }
  return SERVER;
}

//环境检测 必填
// dev：开发环境 test：测试环境 pro: 生产环境  pre 预发布
var SERVER = checkCurrentEnv("pre");
console.log("当前环境:" + JSON.stringify(SERVER));

//配置腾讯地图key
var QQ_MAP_KEY = "LE7BZ-RVTWU-5XXVL-B53RH-XVZCH-E7FVP";

export default {
  SERVER: SERVER,
  QQ_MAP_KEY: QQ_MAP_KEY
}
 

