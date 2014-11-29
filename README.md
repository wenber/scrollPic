## scrollPic
=========

#### 插件简介
***
      该插件主要的特色是直接轮播容器下面的子标签，子标签可以是div,img,p,img...,使用灵活，应用场景多，可以广泛永远日常的业务开发中

#### 功能持点：
***
      1.支持鼠标悬停事件
      2.支持鼠标滚动事件
      3.支持双向循环轮播
      4.支持数字下标索引
      5.支持双向自动轮播
      6.支持左右方向箭头
      7.支持单张图片轮播

#### 使用方法：
***
      1,请跟据需求设置宽高
      2，设置容器id
      ```javascript
      // 1，实例化对象
      var scrollPic = new ScrollPic({
          id: 'scroll-container-id',
          width: 500,
          height: 200
      });
      // 2，调用初始化方法
      scrollPic.init();
      ```
