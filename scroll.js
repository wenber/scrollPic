/**
 * @file 图片轮播插件
 *
 * @插件描述：
 *     该插件主要的特色是直接轮播容器下面的子标签，子标签可以是
 *     div,img,p,img...,使用灵活，应用场景多，可以广泛永远日常的业务开发中
 * @功能持点：
 *         1,支持鼠标悬停事件
 *         2,支持鼠标滚动事件
 *         3,支持双向循环轮播
 *         4,支持数字下标索引
 *         5,支持双向自动轮播
 *         6,支持左右方向箭头
 *         7,支持单张图片轮播
 * @使用要求：
 *         1,请跟据需求设置宽高
 *         2，设置容器id
 * @使用举例：
 *     // 1，实例化对象
 *     var scrollPic = new ScrollPic({
 *         id: 'scroll-container-id',
 *         width: 500,
 *         height: 200
 *     });
 *     // 2，调用初始化方法
 *     scrollPic.init();
 *
 * @author Ming Liu (liuming07@baidu.com)
 */
var ScrollPic = (function (win, doc) {

    /**
     * 简易封装的工具方法
     *
     * @type {Object.<string, Function>}
     */
    var util = {
        /**
         * 事件绑定
         *
         * @param {Object}   ele    dom元素
         * @param {string}   eventType  事件类型
         * @param {Function} callback   回调函数
         * @public
         */
        addEvent: function (ele, eventType, callback) {
            if (ele.addEventListener) {
                ele.addEventListener(eventType, callback, false);
            }
            else if (ele.attachEvent) {
                ele.attachEvent('on' + eventType, callback);
            }
            else {
                ele['on' + eventType] = callback;
            }
        },

        /**
         * 通过id获取dom对象，简易封装
         *
         * @param  {string} id 元素id
         * @return {Object}    dom对象
         * @public
         */
        getById: function (id) {
            if ('string' === typeof id) {
                return doc.getElementById(id);
            }
            return id;
        },

        /**
         * 创建node节点，简易封装
         *
         * @param  {string} node 节点名称
         * @return {Object}      dom对象
         * @public
         */
        createNode: function (node) {
            return doc.createElement(node);
        },

        /**
         * 获取样式，简易封装
         *
         * @param  {Object} ele      dom对象
         * @param  {string} name     样式name
         * @return {string | number} 样式value
         * @public
         */
        getStyle: function (ele, name) {
            if (ele.style) {
                name = name.replace(/-(\w)/g, function (all, letter) {
                    return letter.toUpperCase();
                });
                if (win.getComputedStyle) {
                    return getComputedStyle(ele, null)[name];
                }
                return ele.currentStyle[name];
            }
        },

        /**
         * 设置样式，简易封装
         *
         * @param  {Object} element      dom对象
         * @param  {Object} styleObj     样式对象
         * @return {number}              返回成功设置样式的数量
         * @public
         */
        setStyle: function (element, styleObj) {
            var i = 0;
            for (var key in styleObj) {
                if (styleObj.hasOwnProperty(key)) {
                    element.style[key] = styleObj[key];
                    i++;
                }
            }
            return i;
        },

        /**
         * 扩展对象
         *
         * @param  {Object} target 源对象
         * @param  {Object} params 扩展对象
         * @return {Object}        扩展后的返回对象
         * @public
         */
        extend: function (target, params) {
            for (var i = 1, l = arguments.length; i < l; i++) {
                var obj = arguments[i];

                if (!obj) {
                    continue;
                }
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        target[key] = obj[key];
                    }
                }
            }
            return target;
        }
    };

    /**
     * 图片轮播默认参数
     *
     * {
     *     height: {number | string} 默认高300px
     *     width: {number | string} 默认宽600px
     *     interval: {number} 图片切换时模拟动画的setInterval时间间隔（毫秒）
     *     speed: {number} 轮播切换动画速度参数
     *     autoTimer: {Object} 图片间的切换setInterval对象
     *     stepTimer: {Object} 图片切换动画效果setInterval对象
     *     pauseTimer: {Object} 鼠标滚动后短暂延时
     *     switchInterval: {number} 默认轮播图片每3秒切换一次
     *     pauseable: {boolean} 默认支持鼠标悬停事件
     *     wheelable: {boolean} 默认不支持鼠标滚轮事件
     *     supportIndex: {boolean} 默认支持数字索引
     *     supportArrowClick: {boolean} 默认支持方向箭头控制
     * }
     * @type {Object.<string, string | boolean | number>}
     */
    var defaults = {
        height: 300,
        width: 600,
        interval: 5,
        speed: 300,
        autoTimer: null,
        stepTimer: null,
        pauseTimer: null,
        switchInterval: 3000,
        pauseable: true,
        wheelable: false,
        supportIndex: true,
        supportArrowClick: true
    };

    /**
     * 构造函数
     *
     * @param {Object<string, string | number | boolean>} options 插件初始化参数
     * {
     *     id: {string} 必须，轮播容器ID
     *     width: {string | number}  必须  容器宽
     *     height: {string | number} 必须  容器高
     *     ...  可选  参见default默认参数配置
     * }
     * @constructor
     */
    function Slider(options) {
        // 默认显示第一张图片
        this.start = 1;
        // 默认需要轮播的元素为0个
        this.nodeCount = 0;
        // 图片轮播容器id
        this.container = util.getById(options.id);
        // 合并配置参数,宽高先统一取成数
        options.width = parseFloat(options.width);
        options.height = parseFloat(options.height);
        util.extend(this, defaults, options);
    }

    /**
     * 初始化入口
     *
     * @public
     */
    Slider.prototype.init = function () {
        // 设置容器相关信息
        this._setContainer();
        // 添加其他操作方法
        this._addOptions();
        // 触发图片开始轮播
        this._autoMove();
    };

    /**
     * 添加引用工具方法接口
     *
     * @private
     */
    Slider.prototype._util = util;

    /**
     * 运动函数
     *
     * @param {string} direction 运动方向
     * @param {number} moveStep 跳转图片间数量
     * @private
     */
    Slider.prototype._animate = function (direction, moveStep) {
        var me = this;
        // 轮播图当前左边距
        var offsetLeft = parseFloat(me.scrollWrap.style.left);
        // 轮播图目标左边距
        var targetLeft;

        if (direction === 'right') {
            me.start === me.nodeCount
                ? me.start = moveStep
                : me.start += moveStep;
            // 当目前显示的是最右边最右一副图且继续向右运动，修正相关参数
            if (me.scrollWrap.style.left ===
                    -me.scrollWrap.offsetWidth + 2 * me.width + 'px') {
                me.scrollWrap.style.left = offsetLeft = 0;
                me.start = 1;
            }
        }
        else {
            me.start === 0
                ? me.start = me.nodeCount - 1
                : me.start -= moveStep;
            // 当目前显示的是最左边第一副图且继续向左边运动，修正相关参数
            if (me.scrollWrap.style.left === '0px') {
                offsetLeft = - me.scrollWrap.offsetWidth + 2 * me.width;
                me.scrollWrap.style.left = offsetLeft + 'px';
            }
        }
        targetLeft = -me.start * me.width;
        me._go(direction, offsetLeft, targetLeft);
        me.supportIndex && me._setIndex(me.start);
    };

    /**
     * 模拟动画切换效果
     *
     * @param  {string} direction  运动方向
     * @param  {number} offsetLeft 轮播大容器的left值
     * @param  {number} targetLeft 运动目的地的left值
     * @private
     */
    Slider.prototype._go = function (direction, offsetLeft, targetLeft) {
        var me = this;
        // 轮播图当前位置到目标位置的运动距离
        var distance = targetLeft - offsetLeft;
        // 轮播图片每一次移动的距离
        var step = distance / me.speed * me.interval;
        clearInterval(me.stepTimer);
        me.stepTimer = setInterval(function () {
            // 到达目标位置时强制设置左边距
            if (direction === 'right' && offsetLeft <= targetLeft
                || direction === 'left' && offsetLeft >= targetLeft
            ) {
                clearInterval(me.stepTimer);
                me.scrollWrap.style.left = targetLeft + 'px';
            }
            // 没有到达目标位置继续移动
            else {
                me.scrollWrap.style.left = offsetLeft + step + 'px';
                offsetLeft += step;
            }
        }, me.interval);
    };

    /**
     * 自动轮播函数
     *
     * @private
     */
    Slider.prototype._autoMove = function () {
        var me = this;
        me.autoTimer = setInterval(function () {
            me._animate('right', 1);
        }, me.switchInterval);
    };

    /**
     * 设置容器相关属性
     *
     * @private
     */
    Slider.prototype._setContainer = function () {
        var me = this;
        var childNodes = me.container.childNodes;
        var nodeCount = childNodes.length;
        var frag = doc.createDocumentFragment();
        me.scrollWrap = util.createNode('div');

        // 设置容器宽高
        util.setStyle(me.container, {
                overflow: 'hidden',
                height: me.height + 'px',
                width: me.width + 'px'
            });
        // 设置定位属性
        if (!/(relative)|(absolute)/.test(
                util.getStyle(me.container, 'position')
                )) {
            util.setStyle(me.container, {
                position: 'relative',
                left: 0,
                top: 0
            });
        }

         // 所有子元素左浮动, 此处需要过滤出element节点
        for (var i = 0; i < nodeCount; i++) {
            if (childNodes[i] && 1 === childNodes[i].nodeType) {
                util.setStyle(childNodes[i], {
                    'float': 'left',
                    display: 'block',
                    width: me.width + 'px',
                    height: me.height + 'px'
                });
                frag.appendChild(childNodes[i].cloneNode(true));
            }
        }
        // 原来的容器清空&修正有效节点计数
        me.container.innerHTML = '';
        me.nodeCount = frag.childElementCount || frag.childNodes.length;

        // 设置浮动元素的包裹层
        util.setStyle(me.scrollWrap, {
            height: me.height + 'px',
            width: (me.nodeCount + 2) * me.width + 'px',
            position: 'absolute',
            left: -me.width + 'px',
            top: 0
        });

        // 深度克隆首位元素，实现单向轮播
        frag.appendChild(frag.childNodes[0].cloneNode(true));
        frag.insertBefore(frag.childNodes[me.nodeCount - 1].cloneNode(true),
            frag.childNodes[0]);

        // 插入到相应的元素中
        me.scrollWrap.appendChild(frag);
        me.container.appendChild(me.scrollWrap);
    };

    /**
     * 添加用户允许的配置的操作
     *
     * @private
     */
    Slider.prototype._addOptions = function () {
        var me = this;
        if (me.supportArrowClick) {
            me._supportArrowClick();
        }
        if (me.supportIndex) {
            me._supportIndex();
        }
        if (me.pauseable) {
            me._supportPauseable();
        }
        if (me.wheelable) {
            me._supportWheelable();
        }
    };

    /**
     * 切换数子下标样式
     *     1,通过切换类名来实现
     *     2,注意数组下标从0开始
     *
     * @param {number} index 数字下标1，2，3，4...
     * @private
     */
    Slider.prototype._setIndex = function (index) {
        var me = this;
        var childNodes = me.indexWrap.childNodes;

        index = index === 0 ? me.nodeCount : index;
        for (var i = 0, c = me.nodeCount; i < c; i++) {
            childNodes[i].className = 'plugin-scroll-index';
        }
        childNodes[index - 1].className += ' plugin-scroll-tag-sel';
    };

    /**
     * 获取数子下标
     *
     * @return {number} index 当前数字下标
     * @private
     */
    Slider.prototype._getIndex = function () {
        var me = this;
        var childNodes = me.indexWrap.childNodes;

        for (var i = 0, c = me.nodeCount; i < c; i++) {
            if (/(plugin-scroll-tag-sel)/.test(childNodes[i].className)) {
                return i + 1;
            }
        }
    };

    /**
     * 左右方向箭头操作
     *
     * @private
     */
    Slider.prototype._supportArrowClick = function () {
        var me = this;
        var height = me.height;
        me.leftBtn = util.createNode('span');
        me.rightBtn = util.createNode('span');

        // 设置左右方向箭头,此处注意，需要先插入到文档中，才能取到自身高度
        me.leftBtn.className = 'plugin-scroll-left';
        me.rightBtn.className = 'plugin-scroll-right';
        me.container.appendChild(me.leftBtn);
        me.container.appendChild(me.rightBtn);
        util.setStyle(me.leftBtn, {
            top: (height - me.leftBtn.offsetHeight) / 2 + 'px'
        });
        util.setStyle(me.rightBtn, {
            top: (height - me.rightBtn.offsetHeight) / 2 + 'px'
        });

        // 绑定事件
        me.leftBtn.onclick = function () {
            clearInterval(me.autoTimer);
            clearInterval(me.stepTimer);
            me._animate('left', 1);
            me._autoMove();
        };
        me.rightBtn.onclick = function () {
            clearInterval(me.autoTimer);
            clearInterval(me.stepTimer);
            me._animate('right', 1);
            me._autoMove();
        };
    };

    /**
     * 数字索引操作
     *
     * @private
     */
    Slider.prototype._supportIndex  = function () {
        // 如果支持数字下标索引
        var me = this;
        me.indexWrap = util.createNode('div');
        me.indexWrap.className = 'plugin-scroll-index-wrap';
        for (var j = 0, n = me.nodeCount; j < n; j++) {
            var span = util.createNode('span');
            span.className = 'plugin-scroll-index';
            span.setAttribute('data-index', j + 1);
            span.setAttribute('index-tag', 1);
            if (j === 0) {
                span.className =
                    span.className + ' plugin-scroll-tag-sel';
            }
            span.innerHTML = (j + 1);
            me.indexWrap.appendChild(span);
        }
        me.container.appendChild(me.indexWrap);

        // 绑定事件
        util.addEvent(me.indexWrap, 'click', function (event) {
            var target = event.target || event.srcElement;
            clearInterval(me.autoTimer);
            event = event || win.event;

            if (target.getAttribute('index-tag')) {
                var dataIndex = target.getAttribute('data-index');
                var currentIndex = me._getIndex();

                dataIndex > currentIndex
                    ? me._animate('right', (dataIndex - currentIndex))
                    : me._animate('left', (currentIndex - dataIndex));
            }
        });
    };

    /**
     * 鼠标滚动操作
     *
     * @private
     */
    Slider.prototype._supportWheelable = function () {
        var me = this;
        var scrollFunc = function (event) {
            clearTimeout(me.pauseTimer);
            clearInterval(me.autoTimer);
            me.pauseTimer = setTimeout(function () {
                event = event || win.event;
                var scrollVal = 0;
                event.wheelDelta && (scrollVal = -event.wheelDelta);
                event.detail && (scrollVal = event.detail);

                scrollVal > 0
                    ? me._animate('right', 1)
                    : me._animate('left', 1);
                me._autoMove();
            }, 20);
        };

        // IE/Opera/Chrome/Safari
        util.addEvent(doc, 'mousewheel', scrollFunc);
        // W3C
        util.addEvent(doc, 'DOMMouseScroll', scrollFunc);
    };

    /**
     * 鼠标悬停操作
     *
     * @private
     */
    Slider.prototype._supportPauseable = function () {
        var me = this;
        me.container.onmouseenter =
        me.leftBtn.onmouseenter =
        me.rightBtn.onmouseenter = function () {
            clearInterval(me.autoTimer);
        };
        me.container.onmouseleave =
        me.leftBtn.onmousleave =
        me.rightBtn.onmousleave = function () {
            clearInterval(me.autoTimer);
            me._autoMove();
        };
    };

    return Slider;
})(window, document);
