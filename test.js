/**
 * @file 图片轮播插件测试文件
 *
 * @author Ming Liu (liuming07@baidu.com)
 */

describe('ScrollPic插件测试', function () {

    // 创建dom节点
    var wrapNode = document.createElement('div');
    var frags = document.createDocumentFragment();

    for (var i = 1; i <= 5; i++) {
        var ele = document.createElement('div');
        ele.innerHTML = '我的轮播编号是' + i;
        ele.style['text-align'] = 'center';
        ele.style.color = '#FFF';
        ele.style['background-color'] = '#' + i * 100;
        frags.appendChild(ele);
    }

    wrapNode.setAttribute('id', 'plugin-scroll-id');
    wrapNode.appendChild(frags);
    document.body.appendChild(wrapNode);

    // 实例化插件
    var scrollPic = new ScrollPic({
        id: 'plugin-scroll-id',
        width: 600,
        height: 300
    });

    // 测试工具方法util
    describe('测试工具方法util', function () {

        // util.getById测试数据
        var node1 = document.createElement('div');
        node1.setAttribute('id', 'test-id');
        document.body.appendChild(node1);

        // util.getStyle测试数据
        var node2 = document.createElement('div');
        node2.style.display = 'none';
        node2.style.height = '10px';

        // util.setStyle测试数据
        var node3 = document.createElement('div');
        var styleObj = {'width': '50px', 'height': '30px'};

        // util.extend测试数据
        var obj1 = {};
        var obj2 = {'a': 1, 'b': 1};
        var obj3 = {'b': 2};
        var obj4 = {
            'a': 1,
            'b': 2
        };

        it('util.getById Success!', function () {
            expect(typeof scrollPic._util.getById('test-id')).toEqual('object');
        });

        it('util.createNode Success!', function () {
            expect(typeof scrollPic._util.createNode('div')).toEqual('object');
        });

        it('util.getStyle Success!', function () {
            document.body.appendChild(node2);
            expect(scrollPic._util.getStyle(node2, 'height')).toEqual('10px');
        });

        it('util.setStyle Success!', function () {
            expect(scrollPic._util.setStyle(node3, styleObj)).toEqual(2);
        });

        it('util.extend Success!', function () {
            expect(scrollPic._util.extend(obj1, obj2, obj3)).toEqual(obj4);
        });
    });

    // 测试ScrollPic原型方法(同步)
    describe('测试ScrollPic原型方法(同步)', function () {
        // 测试设置容器样式
        it('prototype._setContainer Success!', function () {
            scrollPic._setContainer();
            // 测试container样式设置是否成功
            expect(scrollPic.container.style.height).toEqual('300px');
            expect(scrollPic.container.style.position).toEqual('relative');
            // 测试轮播有效节点数是否正确
            expect(scrollPic.nodeCount).toEqual(5);
            // 测试浮动包裹层样式是否设置成功
            expect(scrollPic.scrollWrap.style.height).toEqual('300px');
            // 测试克隆两端节点是否成功
            expect(scrollPic.scrollWrap.childNodes.length).toEqual(7);
        });

        // 测试数字索引
        it('prototype._supportIndex', function () {
            scrollPic._supportIndex();
            // 测试包裹容器是否创建成功
            expect(typeof scrollPic.indexWrap).toEqual('object');
            // 测试数字节点创建个数是否正确
            expect(scrollPic.indexWrap.childNodes.length).toEqual(5);
        });

        // 测试索引样式设置
        it('prototype._setIndex Success!', function () {
            scrollPic._setIndex(2);
            // 测试当前图片对应的索引数字样式是否设置正确
            expect(scrollPic.indexWrap.childNodes[1].className)
                .toBe('plugin-scroll-index plugin-scroll-tag-sel');

            // 测试当索引为0时，赋值为最后索引值是否正确
            scrollPic._setIndex(0);
            expect(scrollPic.indexWrap.lastChild.className)
                .toBe('plugin-scroll-index plugin-scroll-tag-sel');
        });

        // 测试获取索引
        it('prototype._getIndex Success!', function () {
            scrollPic._setIndex(1);
            // 测试当前图片对应的索引数字
            expect(scrollPic._getIndex()).toEqual(1);
        });

        // 测试左右方向箭头操作
        it('prototype._animate Success!', function () {
            scrollPic._supportArrowClick();
            // 测试创建两个箭头是否成功
            expect(typeof scrollPic.leftBtn).toEqual('object');
        });

    });

    // 测试ScrollPic原型方法(setTimeout)
    describe('测试ScrollPic原型方法(setTimeout)', function () {
        var timerCallback;
        beforeEach(function() {
            timerCallback = jasmine.createSpy(
                'scrollPic._animate("right", 1)');
            jasmine.clock().install();
        });

        afterEach(function() {
            jasmine.clock().uninstall();
        });

        it('prototype._go Success!', function() {
            setTimeout(function() {
                    timerCallback();
                }, 3000);
            expect(timerCallback).not.toHaveBeenCalled();
            jasmine.clock().tick(3001);
            expect(timerCallback).toHaveBeenCalled();
        });
    });
});
