import navigation from "../../../utils/navigationUtil";
import location from "../../../utils/locationUtil";
import UI from "../../../utils/uiUtil";
import QQMapUtil from "../../../utils/qqMapUtil";


Page({

  /**
   * 页面的初始数据
   */
  data: {
    groupCityList : [],
    isShowSelect : false,
    addressList : [],
    scrollHeihgt : 0,
    selectedCity : '',
    addressVal : '',
    isFirst : true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {    
    this.zCityList = ["110000", "120000", "310000", "500000", "810000","820000"];    

    let sysInfo = wx.getSystemInfoSync();     
    //计算公式为 顶部bar高度(单位rpx) * (屏幕宽度/750) = 顶部高度(单位px）
    let topPx = 123 * (sysInfo.windowWidth / 750);
    //scrollHeight
    let scrollHeight = sysInfo.windowHeight - topPx;  
    console.log(topPx,scrollHeight); 
    console.log(sysInfo.windowHeight);
    
    //计算height
    this.setData({
      scrollHeihgt: scrollHeight + "px"
    });

    this._loadCityList();   

    

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },


  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 城市分组
   */
  _groupCity: function(arr){       
    var map = {},
      dest = [];
    for (var i = 0; i < arr.length; i++) {
      var ai = arr[i];
      let initials = ai.pinyin[0].charAt(0);
      ai.initials = initials;
      if (!map[initials]) {
        dest.push({
          initials: initials,
          upperInitials: initials.toUpperCase(),
          data: [ai]
        });
        map[ai.initials] = ai;
      } else {
        for (var j = 0; j < dest.length; j++) {
          var dj = dest[j];
          if (dj.initials == initials) {
            dj.data.push(ai);
            break;
          }
        }
      }
    } 

    //按照字母排序
     dest.sort((a,b)=>{
      return a.upperInitials.localeCompare(b.upperInitials);
    });
    return dest;

  },


  /**
   * 加载城市列表
   */
  _loadCityList : function(){
    UI.loading(true);
    QQMapUtil.getCityList()
      //加载所有城市
      .then(list=>{
        let cityList = list[1];
        //获得直辖市+行政区
        let zCity = list[0].filter((c)=>{
          if(this.zCityList.some((z)=>z == c.id)){
            return c;
          }
        });      
        //过滤掉区
        cityList = cityList.filter((c) => {
          return c.cidx;
        });          

        cityList = cityList.concat(zCity);
            
        let groupCityList = this._groupCity(cityList);       

        //存入数据源
        this.dataSourceGroupCityList = groupCityList;
        
        console.log('source-->', this.dataSourceGroupCityList);               
        //获得当前用户地理位置
        return location.getLocation('gcj02')          
      })
      //获取用户位置
      .then((res) => {
        console.log("当前用户位置信息", res);        
        let currentLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        }               
        return QQMapUtil.reverseGeocoder({ location: currentLocation })
      })
     //根据经纬度查询物理名称
      .then(res => {
        console.log(res);
        //行政区划分
        let adInfo = res.result.ad_info;
        let  selectedCity = '';
        
        //查找对应
        for (let j = 0; j < this.dataSourceGroupCityList.length;j++){
          let letter = this.dataSourceGroupCityList[j];
           let cityList = letter.data.filter((city) => city.fullname == adInfo.city);
           if (cityList.length > 0) {
             selectedCity = cityList[0];
             break;
           }
        }       

        this.setData({
          selectedCity: selectedCity
        })

        console.log(selectedCity);

        let params = {
          keyword: '幼儿园',
          location: {
            latitude: selectedCity.location.lat,
            longitude: selectedCity.location.lng
          }         
        }   

        this._searchPoi(params);

        UI.loading(false);            
                
      },(err)=>{
        UI.loading(false);
      });

  },


  /**
   * 检索地址
   */
  _onSearchAddress : function(e){  
    let val = e.detail.value;
    let groupCityList = [];
    if(val){           
      for (let letter of this.dataSourceGroupCityList) {
        let res = letter.data.filter((city) => { return city.fullname.indexOf(val) !=  -1});
        if (res.length > 0) {
          letter.data = res;
          groupCityList.push(letter);
        }
      }   
    }
    else{
      //原始数据
      groupCityList = this.dataSourceGroupCityList;
    }   

    this.setData({
      groupCityList: groupCityList,
      citySearchVal: val
    })
      
  },

  /**
   * 查询poi幼儿园
   */
  _searchPoi: function (params){  


    QQMapUtil.searchPoi(params)
      .then(res => {
        this.setData({
          addressList: res.data         
        })
      })
  },

  _searchSchool: function (params) {

    QQMapUtil.searchAddress(params)
      .then(res => {
        this.setData({
          addressList: res.data,
          isFirst : false
        })
      })

  },

  /**
   * 查询学校地址
   */
  _onSearchSchoolAddress: function (e) {
    var val = e.detail.value;
    if (val){
      let params = {
        keyword: val,       
        region_fix : 1
      }

      if(this.data.selectedCity){
        params.region = this.data.selectedCity.fullname  
      }
    
      this._searchSchool(params);

      this.setData({
        addressVal : e.detail.value
      })
    }

  
   

  },


  /**
   * 获得园所地址焦点
   */
  _onFocusSchoolAddress : function(){
    console.log("查询次数");
    if(this.data.isShowSelect){
      this.setData({
        isShowSelect : false       
      })
    }
  },

  /**
   * 选择城市
   */
  _onSelectedCityItem : function(e){
      let index = e.currentTarget.dataset.index;
      let letterIndex = e.currentTarget.dataset.letterIndex;
      let city  = this.data.groupCityList[letterIndex].data[index];

      this.setData({
        selectedCity : city,
        isShowSelect: false,
        addressList : []
      })

      //进行搜索查询

      let params = {
        keyword: this.data.addressVal || '',
        region_fix: 1,
        region: city.fullname
      }     

      this._searchSchool(params);
  },


  /**
   * 切换选择城市 
   */  
  _onShowCityList: function(){

    this.setData({
      isShowSelect: true,
      citySearchVal: '',
    })


      setTimeout(() => {      
      this.setData({
        groupCityList: this.dataSourceGroupCityList
      })     
    }, 50);

      
  },

  /**
   * 选中城市地址
   */
  _onItemSelected : function(e){
    let index = e.currentTarget.dataset.index;
    let address  = this.data.addressList[index];
    console.log("当前选择地址..",address);
    //返回通知上一级
    getApp().event.fire("refreshAddress", address);
    navigation.navigateBack();
  }  
})