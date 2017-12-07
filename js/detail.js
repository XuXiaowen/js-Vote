//解析url问号传参值
String.prototype.myQueryURLParameter = function myQueryURLParameter() {
  let obj = {},
    reg = /([^?=&]+)=([^?=&]+)/g;
  this.replace(reg, function () {
    obj[arguments[1]] = arguments[2];
  });
  return obj;
};
//'http://localhost:8888/detail.html?userId=587'.myQueryURLParameter();

let detailRender = (() => {
  let userId = 0,
    lookMe = true,//看自己
    uerInfo = null,
    isVote = false;

  let $headerBox = $('.headerBox'),
    $myVote = $('#myVote'),
    $voteMy = $('#voteMy');

  //展示基本信息
  //参赛了后才有编号
  //看的是自己或者已经投过她=>不显示 投他一票
  let showBaseInfo = (result) => {
    let str = ``;
    str += `
    <div class="userInfo">
            <img src="${result.picture}" alt="" class="picture">
            <p class="info">
                <span>${result.name}</span>
                ${result.isMatch == 1 ? `|
      <span>编号 #${result.matchId}</span>` : ``}
            </p>
            <p class="bio">${result.slogan}</p>
            <div class="vote">${result.voteNum}</div>
        </div>
        
        ${result.isMatch == 1 ? `<div class="slogan">${result.slogan}</div>` : ``}
        ${isVote == false ? `<a href="javascript:;" class="voteBtn">投他一票</a>` : ``}
`;
    $headerBox.html(str);
  };


  //投递信息列表
  let bindVoteList = (result, flag) => {
    let str = ``,
      title = '';
    if (flag == 0) {
      title = lookMe === true ? '我投递的人员' : '他投递的人员';
    } else {
      title = lookMe === true ? '投递我的人员' : '投递他的人员';
    }

    if (result.length>0){
      str += `
      <div class="title clearfix">
            <div class="left">
                <span></span>
                <span></span>
            </div>
            <div class="center">${title}</div>
            <div class="right">
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    }


    str += `<ul class="list">`

    $.each(result, (index, item) => {
      str += `<li>
                <a href="detail.html?userId=${item.id}">
                    <img src="${item.picture}" alt="" class="picture">
                    <p class="title">${item.name}</p>
                    <p class="bio">${item.slogan||'---'}</p>
                </a>
                <div class="vote">
                    <span class="voteNum">${item.voteNum}</span>
                    ${item.isVote == 0 ? `<a href="javascript:;" class="voteBtn" data-id="${item.id}">投他一票</a>` : ``}
                </div>
            </li>`;
    });

    str += `</ul>`;

    flag == 0 ? $myVote.html(str) : $voteMy.html(str);
  };
  let sendVoteListAjax = (flag) => {
    //flag==0 获取我投票过的人员
    //flag==1 获取投票过我的人员
    let url = flag == 0 ? '/getMyVote' : '/getVoteMy';
    $.ajax({
      url: `${url}?userId=${userId}`,
      dataType: 'json',
      cache: false,
      success: function (result) {
        if (result.code == 0) {
          bindVoteList(result.list);
        }
      }
    })
  };


  return {
    init(){
      //解析传递进来的问号传参参数值
      let obj = window.location.href.myQueryURLParameter();
      if (typeof obj.userId !== 'undefined') {
        userId = parseFloat(obj['userId']);
      }

      //验证一下是否是看自己
      uerInfo = cookie.get('userInfo');
      if (uerInfo) {
        uerInfo = JSON.parse(uerInfo);
        if (userId != 0 && userId != uerInfo.id) {//默认是看自己
          lookMe = false;//看别人
        } else {
          lookMe = true;//看自己
          userId = parseFloat(uerInfo['id']);
        }
      }

      //验证当前用户是否已经被投票过
      $.ajax({
        url: `/checkUser?userId=${uerInfo.id}&checkId=${userId}`,//userId:传进来的id,可能是自己也可能是别人//userinfo.id：我自己
        dataType: 'json',
        cache: false,
        success: function (result) {
          if (result.code == 0) {
            result.isVote == 1 ? isVote = true : null;
          }
        }
      });

      //不管是看别人还是看自己的，都要先获取基础的信息
      $.ajax({
        url: `/getUser?userId=${userId}`,
        dataType: 'json',
        cache: false,
        success: function (result) {
          if (result.code == 0) {
            showBaseInfo(result.data);
            sendVoteListAjax(0);
            sendVoteListAjax(1);
          }
        }
      })
    }
  }
})();
detailRender.init();