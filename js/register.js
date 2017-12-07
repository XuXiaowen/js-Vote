//6-
let registerRender = (() => {
  let
    $userName = $('#userName'),
    $spanName = $('#spanName'),
    $userPhone = $('#userPhone'),
    $spanPhone = $('#spanPhone'),
    $userPass = $('#userPass'),
    $spanPass = $('#spanPass'),
    $userPassConfirm = $('#userPassConfirm'),
    $spanPassConfirm = $('#spanPassConfirm'),
    $userBio = $('#userBio'),
    $spanBio = $('#spanBio'),
    $man = $('#man'),
    $submit = $('#submit');

  //验证用户名
  let checkName = () => {
    let val = $userName.val().trim(),
      reg = /^[\u4E00-\u9FA5]{2,5}(·[\u4E00-\u9FA5]{2,5})?$/;
    if (val.length == 0) {
      $spanName.html('用户名不能为空').addClass('error');
      return false;//*
    }
    if (!reg.test(val)) {
      $spanName.html('请输入真实姓名').addClass('error');
      return false;//*
    }
    $spanName.html('').removeClass('error');
    return true;
  };

  //验证手机号
  let checkPhone = () => {
    let val = $userPhone.val().trim(),
      reg = /^1[3|4|5|8][0-9]\d{4,8}$/;
    if (val.length == 0) {
      $spanPhone.html('手机号不能为空').addClass('error');
      return false;
    }
    if (!reg.test(val)) {
      $spanPhone.html('请输入正确的手机号').addClass('error');
      return false;
    }

    //手机号重复验证
    let code = 0;
    $.ajax({
      url: '/checkPhone',
      type: 'get',
      data: {
        phone: val
      },
      dataType: 'json',
      cache: false,
      async: false,//同步=>验证成功才做下面的事
      success: function (result) {
        code = result.code;
      }
    });
    if (code == 1) {//获取上面的结果后才能判断//所以用同步
      $spanPhone.html('当前手机号已被注册').addClass('error');
      return false;
    }

    $spanPhone.html('').removeClass('error');
    return true;
  };

  //验证密码
  let checkPass = () => {
    let val = $userPass.val().trim(),
      reg = /^[\da-zA-Z]{6,12}$/;
    if (val.length == 0) {
      $spanPass.html('密码不能为空').addClass('error');
      return false;
    }
    if (!reg.test(val)) {
      $spanPass.html('密码格式错误，请重试').addClass('error');
      return false;
    }
    $spanPass.html('').removeClass('error');
    return true;
  };

  //确认密码
  let checkPassConfirm = () => {
    let val = $userPassConfirm.val().trim();
    let val1 = $userPass.val().trim();
    if (val !== val1) {
      $spanPassConfirm.html('两次输入密码不一致').addClass('error');
      return false;
    }
    $spanPassConfirm.html('').removeClass('error');
    return true;
  };

  //自我描述
  let checkBio = () => {
    let val = $userBio.val().trim();
    if (val.length < 10) {
      $spanBio.html('写十个字以上的描述吧').addClass('error');
      return false;
    }
    if (val.length > 100) {
      $spanBio.html('字数请少于100字').addClass('error');
      return false;
    }
    $spanBio.html('').removeClass('error');
    return true;
  };

  //提交信息
  let sendAjax = () => {
    let success = (result) => {
      if (result.code == 0) {
        //设置本地登录态
        cookie.set({
          name: 'userInfo',
          value: JSON.stringify(result.data)//如果存对象->也会把它转成字符串->object Object X,所以存json字符串
        });
        window.location.href = 'index.html';
      } else {
        //alert('注册失败');
        new Dialog('注册失败',()=>{
          //注册失败后把当前页面重新刷新一下=>方便用户重新填写
          window.location.href = window.location.href;
        });

      }
    };

    $.ajax({
      url: '/register',
      type: 'post',
      data: {
        name: $userName.val().trim(),
        password: hex_md5($userPass.val().trim()),//实现不可逆转的加密//hex_md5([需要加密的字符串])=>32位加密的字符串//register.html中引入md5.min.js
        phone: $userPhone.val().trim(),
        sex: $man[0].checked ? 0 : 1,//**原生的
        bio: $userBio.val().trim()
      },
      dataType: 'json',
      success: success
    })
  };

  return {
    init(){
      //失去焦点格式验证
      $userName.on('blur', checkName);
      $userPhone.on('blur', checkPhone);
      $userPass.on('blur', checkPass);
      $userPassConfirm.on('blur', checkPassConfirm);
      $userBio.on('blur', checkBio);

      //点击注册提交注册信息
      $submit.tap(() => {
        //重新执行判断false/true  return false/return true 派上用场
        if (checkName() && checkPhone() && checkPass() && checkPassConfirm() && checkBio()) {
          //验证通过->发送Ajax请求
          sendAjax();
        }
      })
    }
  }
})();
registerRender.init();


