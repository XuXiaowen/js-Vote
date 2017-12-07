//7-
let loginRender = (() => {
  let $userName = $('#userName'),
    $userPass = $('#userPass'),
    $submit = $('#submit');

  let submitFn = () => {
    let success = (result) => {
      if (result.code == 1) {
        //alert('登录失败，请重试');
        new Dialog('登录失败，请重试',()=>{
          window.location.href = window.location.href;
        });
        return;
      }
      cookie.set({
        name: 'userInfo',
        value: JSON.stringify(result.data)
      });
      window.location.href = 'index.html';
    };

    $.ajax({
      url: '/login',
      type: 'post',
      data: {
        name: $userName.val().trim(),
        password: hex_md5($userPass.val().trim())
      },
      dataType: 'json',
      success: success
    })
  };

  return {
    init(){
      $submit.tap(submitFn);
    }
  }
})();
loginRender.init();