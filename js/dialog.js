class Dialog {
  constructor(content, callback) {//私有属性
    this.content = content;
    this.callback = callback;
    this.init();
  }

  init() {
    this.createMark();
    //移除Mark:
    this.markEvent();//手动移除

    this.timer = setTimeout(() => {
      this.removeMark();
    }, 2000)
  }

  createMark() {
    //实例才能调用原型上的方法
    this.removeMark();//创建新的之前先把之前的移除掉

    let mark = document.createElement('div');
    this.mark = mark;//把创建的mark放到当前实例的私有属性上
    mark.className = 'mark';
    mark.innerHTML = `<div class="box">
          <h3>系统提示</h3>
          <div class="content">${this.content}</div>
      </div>`;
    document.body.appendChild(mark);
  }

  removeMark() {
    clearTimeout(this.timer);//手动点的时候要把自动的删掉
    let mark = this.mark;
    if (mark) {
      document.body.removeChild(mark);
      this.callback && this.callback();
    }
  }

  markEvent() {
    //点击空白处移除
    let mark = this.mark;
    if (!mark) return;
    if (typeof $ !== 'undefined') {//当前有zepto.js
      $(mark).tap((e) => {
        if (e.target.className === 'mark') {
          this.removeMark();
        }
      })
    }

  }
}
//new Dialog(content, callback);