//用单例模式封装业务逻辑 + 发布订阅模式
let indexRender = (() => {
  let $plan = $.Callbacks();
  let limit = 10,//每一页展示的数量(默认10)
    page = 1,//当前展示第几页
    search = '',//当前用户输入的搜索信息(为空代表展示全部)
    userId = 0,//当前登录用户的ID(如果没有登录则为0)

    pageNum = 1,
    total = 0,

    userInfo = null;

  let $userList = $('.userList'),
    $userItem = $userList.children('ul'),
    $tip = $userList.find('.tip'),

    $headerBox = $('.headerBox'),
    $search = $headerBox.find('.search'),
    $searchInp = $search.find('input'),
    $searchBtn = $search.find('.searchBtn'),

    $person = $('#person');
  //$signOut = $('#signOut');

  //1-send ajax//发送ajax请求多次用到->封装成方法
  let sendAjax = () => {
    $.ajax({
      url: '/getMatchList',
      type: 'get',//jq:method/type;zp:type
      dataType: 'json',// JSON.parse();dataType改变不了服务器的返回结果，但可以把服务器返回的数据进行二次解析成我们想要的格式(->json:因为api文档里就是一个json格式的对象)
      data: {//要传给服务器的值
        limit: limit,
        page: page,
        search: search,
        userId: userId
      },
      cache: false,//因为是get请求,最好清一下缓存//async不写，默认是异步，异步不会阻塞，和它无关的事情还可以继续操作
      //async:true,默认就是异步请求，所以可以不写
      success: function (result) {
        if (result.code == 0 && result.list && result.list.length > 0) {
          //获取到匹配的数据
          $userItem.css('display', 'block');
          $tip.css('display', 'none');

          //pageNum = result.pageNum;
          //total = result.total;
          pageNum = parseFloat(result.pageNum);//以防传过来的是字符串
          total = parseFloat(result.total);

          //api里的list是我们需要的数据，去拿到list,接下来做数据绑定//发布订阅模式
          //获取到数据后，直接通知(触发)计划表里的方法执行，并把result['list']传给每个计划表中的方法//后续想做是什么事情，直接往计划表里add方法即可
          $plan.fire(result.list);
        } else {
          //没有获取到匹配的数据
          $userItem.css('display', 'none');
          $tip.css('display', 'block');
        }
      }
    });
  };

  //2-数据绑定
  //同一个详情页面通过问号传递参数id不一样展示不同信息
  let bindData = (resultList) => {
    let str = ``;
    $.each(resultList, (index, item) => {
      str += `
        <li>
            <a href="detail.html?userId=${item.id}">
                <img src=${item.picture} alt="" class="picture">
                <p class="title">
                    <span>${item.name}</span>
                    |
                    <span>编号 #${item.matchId}</span>
                </p>
                <p class="slogan">${item.slogan}</p>
            </a>
            <div class="vote">
                <span class="voteNum">${item.voteNum}</span>
                ${item.isVote == 0 ? `<a href="javascript:;" class="voteBtn" data-id="${item['id']}">投他一票</a>` : ``}               
            </div>
        </li>
      `
    });
    $userItem.append(str);//把新绑定的数据追加到末尾
  };
  $plan.add(bindData);

  //3-滚动加载更多
  let scrollEvent = () => {
    let fn = () => {//jq,zp的事件绑定是dom2级事件绑定,定义成实名函数->方便移除
      let clientH = document.documentElement.clientHeight,
        scrollT = document.documentElement.scrollTop,
        scrollH = document.documentElement.scrollHeight;
      if (clientH + scrollT + 100 >= scrollH) {
        //还差100px就到底部，此时加载更多
        $(window).off('scroll', fn);//->解决了一个问题：请求新数据需要时间，异步，新数据没回来之前期间，page会一直++,导致我们实际得到的数据量大于想要得到的数据量
        page++;
        if (page >= pageNum) {
          return;
        }
        console.log(page);
        $.ajax({
          url: '/getMatchList',
          type: 'get',
          dataType: 'json',
          data: {
            limit: limit,
            page: page,
            search: search,
            userId: userId
          },
          cache: false,
          success: function (result) {
            if (result.code == 0 && result.list && result.list.length > 0) {
              bindData(result.list);//绑定并展示新的数据
              $(window).on('scroll', fn);
            }
          }
        });
      }
    };
    $(window).on('scroll', fn);
  };
  $plan.add(scrollEvent);

  //8-投票
  let vote = () => {
    $userItem.tap((e) => {//事件委托<=一个容器中多个按钮需要绑定点击事件
      let target = e.target;
      if (target.className !== 'voteBtn') return;
      //验证是否为登录状态 登录后才能投票
      if (userId == 0) {
        new Dialog('登录后才能投票');
        return;
      }
      //投票
      //+ data-id="${item['id']} 后期要做的事情需要用到前期绑定的数据里的值=>把值放到前期的自定义属性上
      let participantId = parseFloat(target.getAttribute('data-id'));
      $.ajax({
        url: '/vote',
        dataType: 'json',
        data: {
          userId: userId,
          participantId: participantId,
        },
        cache: false,
        success: function (result) {
          if (result.code == 1) {
            new Dialog('投票失败');
            return;
          }
          new Dialog('感谢您的支持', function () {
            let $target = $(target),
              $prev = $target.prev();
            $prev.html(parseFloat($prev.html()) + 1);
            $target.remove();
          })
        }


      })
    })
  };
  $plan.add(vote);

  return {
    init(){

      //7-验证登录态
      //index.js引入cookie.js
      userInfo = cookie.get('userInfo');
      if (userInfo) {
        userInfo = JSON.parse(userInfo);
        userId = userInfo.id;
        $person.css('display', 'block').html(`HELLO ${userInfo.name}`).siblings().css('display', 'none');
        //$signOut.css('display', 'block');

        /*$signOut.tap(() => {
         cookie.remove({'userInfo':null});
         window.location.href = window.location.href;
         debugger
         })*/
      }


      /*$signOut.tap(function () {
       if (userInfo) {
       cookie.set({
       name: 'userInfo',
       value: null
       });
       window.location.href = window.location.href;
       }
       });*/

      //1-向服务端发送ajax获取数据->2-绑定数据->3-滚动加载更多..以及其他后续操作
      //展示首页数据
      sendAjax();//page=1,search=''

      //5-搜索//没有数据的时候也可以搜索，所以写这里
      $searchBtn.tap(function () {
        search = $searchInp.val().trim();
        page = 1;//点搜索的时候，回到第一页(相当于把页面有条件地再加载一遍,也会触发bindData、scrollEvent)
        $userItem.html('');//点击搜索的时候先清空原有区域中的内容，然后再绑定最新获取的内容
        sendAjax();
      })
    }
  }
})();
indexRender.init();