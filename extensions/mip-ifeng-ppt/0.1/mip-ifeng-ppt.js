// define('pptData', ["require"], function(require) {
//     function aaa() {
//         return {
//             'pics': [{
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p2.ifengimg.com/a/2016_44/8a95b1ecf59c535_size41_w780_h521.jpg',
//                 des: '10月22日报道，日前，国外的一条铁路上，出现了惊险一幕。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p2.ifengimg.com/a/2016_44/7594f83dbfbed5e_size50_w942_h525.jpg',
//                 des: '图中下方黑衣男子欲将自行车搬过铁轨，因为没拿稳，单车倒在了铁轨上。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p3.ifengimg.com/a/2016_44/c61506f02f7ca0b_size50_w953_h544.jpg',
//                 des: '男子戴着耳机听着音乐，将车扔过铁轨。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p0.ifengimg.com/a/2016_44/f66cbf5996efa24_size53_w956_h558.jpg',
//                 des: '随后，男子不紧不慢地捡拾掉在铁轨上的物品，由于耳机音乐声音很大，他全然没有听见火车开来的声音。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p1.ifengimg.com/a/2016_44/9161b2d82f0237a_size55_w957_h573.jpg',
//                 des: '旁边正在巡逻的铁路工人见火车开来，但男子丝毫没有要离开的意思，便三步化作两步跑向男子。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p1.ifengimg.com/a/2016_44/bd83d0afbf72578_size57_w959_h590.jpg',
//                 des: '火车开来，铁路工人扑向男子。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p0.ifengimg.com/a/2016_44/4b7972c18ee0bb7_size53_w956_h560.jpg',
//                 des: '铁路工人扑倒男子瞬间。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p1.ifengimg.com/a/2016_44/e53c803fa29ab68_size30_w645_h467.jpg',
//                 des: '铁路工人扑倒男子瞬间。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p2.ifengimg.com/a/2016_44/a1215d7e0af9515_size29_w765_h457.jpg',
//                 des: '千钧一发，火车高速开过，两人滚向一旁。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p1.ifengimg.com/a/2016_44/d2eaeb5f28bd42d_size35_w784_h507.jpg',
//                 des: '男子起身，铁路工人由于摔得不轻，躺在地上。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p2.ifengimg.com/a/2016_44/5e5e324943be820_size52_w960_h557.jpg',
//                 des: '男子起身摘掉了耳机...救人工人也爬了起来。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p2.ifengimg.com/a/2016_44/acb368a26f68853_size55_w955_h565.jpg',
//                 des: '附近工人见状赶忙跑来。'
//             }, {
//                 imgurl: 'http://d.ifengimg.com/w600_h380/p3.ifengimg.com/a/2016_44/d55d26eaad7eb98_size53_w959_h575.jpg',
//                 des: '小编叮嘱大家：在路上尽量不带耳机，注意安全！'
//             }],
//             'slideurl': "http://inews.ifeng.com/50147156/news.shtml"
//         };
//     }
//     return aaa();
// });

define('mip-ifeng-ppt', ['require', 'customElement', 'zepto'], function(require) {
    // mip 组件开发支持 zepto
    var $ = require('zepto');

    var customElem = require('customElement').create();
    
    //var pptdata = require('pptData');

    function getByClass(oParent, str) {
        if (oParent.getElementsByClassName) {
            return oParent.getElementsByClassName(str);
        }

        var aEle = oParent.getElementsByTagName('*');
        var re = new RegExp('\\b' + str + '\\b');
        var result = [];

        for (var i = 0; i < aEle.length; i++) {
            if (re.test(aEle[i].className)) {
                result.push(aEle[i]);
            }
        }

        return result;
    }
    
    function SwipeScroll(options) {

        if (typeof options != 'object') options = {};
        var self = this;

        var totalItem = options.totalItem;
        var itemWidth = options.itemWidth;
        var sortWidth = -2 * itemWidth;
        var item = options.item;
        var duration = options.duration || 200;
        var stepTime = options.stepTime || 1;
        var delay = options.delay || 5000;
        var sliderID = options.sliderID;
        var containerClass = options.containerClass;
        var sID;
        var pID;
        var sliding = 0;
        var slider;
        var container;
        var onShow = 0;
        var before;
        var len = 0;
        var tempObj = null;
        var tempStr = '';
        var dotListObj = null;
        var controllerBox = null;
        var touch = options.touch || /pad/i.test(window.location.href) || false;
        var tween = options.tween || 'Linear';
        var sliderTranslate;
        var page;

        self.slideBox = [];

        self.init = function() {

            slider = document.getElementById(sliderID);
            container = getByClass(slider, containerClass)[0];
            self.slideBox = getByClass(slider, item);
            len = self.slideBox.length;
            page = $('.js_currentIndex')[0];

            //初始化元素
            for (var i = 0; i < len; i++) {
                if (i === 0) {
                    self.slideBox[i].style.display = '';
                } else {
                    self.slideBox[i].style.display = 'none';
                }
                self.slideBox[i].style.width = itemWidth + 'px';
            }

            if (touch) {
                self.iPad();
            }
        };

        var build = function(index, onShow, slideDirection) {
            if ((index - onShow) > 0) {
                if (index - onShow == len - 1) {
                    self.slideBox[index].style.marginLeft = sortWidth + 'px';
                    self.slideBox[onShow].style.marginLeft = itemWidth + 'px';
                    sliderTranslate = itemWidth;

                    slider.scrollLeft = itemWidth + 'px';
                } else {
                    self.slideBox[index].style.marginLeft = 0;
                    self.slideBox[onShow].style.marginLeft = 0;
                    sliderTranslate = -itemWidth;

                    slider.scrollLeft = 0;
                }


            } else {
                if (index - onShow == 1 - len) {
                    self.slideBox[index].style.marginLeft = itemWidth + 'px';
                    self.slideBox[onShow].style.marginLeft = sortWidth + 'px';
                    sliderTranslate = -itemWidth;

                    slider.scrollLeft = 0;
                } else {
                    self.slideBox[index].style.marginLeft = 0;
                    self.slideBox[onShow].style.marginLeft = 0;
                    sliderTranslate = itemWidth;

                    slider.scrollLeft = itemWidth + 'px';
                }

            }
            self.slideBox[index].style.display = '';
        };

        var doMove = function(index, slideDirection, callback) {
            //修改页码
            page.innerHTML = index + 1;
            if (onShow == index || sliding) return false;

            sliding = 1;

            build(index, onShow, slideDirection);
            before = onShow;
            onShow = index;

            var startTimeTemp = 0;
            var tmpDuration = duration / 16;
            var move = function(callbackTmp) {
                startTimeTemp += stepTime;
                if (slideDirection == 'left') {
                    slider.scrollLeft = -Math.ceil(self.Tween[tween](startTimeTemp, 0, sliderTranslate, tmpDuration));
                } else if (slideDirection == 'right') {
                    slider.scrollLeft = 366 - Math.ceil(self.Tween[tween](startTimeTemp, 0, sliderTranslate, tmpDuration));
                }
                if (startTimeTemp <= tmpDuration) {
                    sID = setTimeout(function() {
                        move(callbackTmp);
                    }, 16);
                } else {
                    clearTimeout(sID);
                    if (slideDirection == 'left') {
                        self.slideBox[before].style.display = 'none';
                        self.slideBox[onShow].style.marginLeft = 0;
                    } else if (slideDirection == 'right') {
                        self.slideBox[before].style.display = 'none';
                        self.slideBox[onShow].style.marginLeft = 0;
                    }

                    slider.scrollLeft = 0;
                    sliding = 0;
                    if (typeof callbackTmp === 'function') callbackTmp();
                }
            };
            if (typeof callback === 'function') move(callback);
            else move();
            return true;
        };

        self.iPadX = 0;
        self.iPadLastX = 0;
        self.iPadStatus = 'ok';
        self.iPad = function() {
            if (typeof(window.ontouchstart) === 'undefined') {
                return
            };
            if (!touch) {
                return
            };
            self.addEvent(slider, 'touchstart', self._touchstart);
            self.addEvent(slider, 'touchmove', self._touchmove);
            self.addEvent(slider, 'touchend', self._touchend);
        };
        self._touchstart = function(e) {
            self.stop();
            self.iPadX = e.touches[0].pageX;
        };
        self._touchmove = function(e) {
            if (e.touches.length > 1) {
                self._touchend()
            };
            self.iPadLastX = e.touches[0].pageX;
            self.iPadStatus = 'touch';
            e.preventDefault();
        };
        self._touchend = function(e) {
            if (self.iPadStatus != 'touch') {
                return ;
            };
            self.iPadStatus = 'ok';
            var cX = self.iPadX - self.iPadLastX;
            var index = null;
            if (cX < 0) {
                index = onShow - 1;
                if (index < 0) {
                    index = len - 1;
                }
                doMove(index, 'right', function() {
                    //self.play();
                });
            } else {
                index = onShow + 1;
                if (index >= len) {
                    index = 0;
                }
                doMove(index, 'left', function() {
                    //self.play();
                });
            };
        };
        self._overTouch = function() {
            self.iPadStatus = 'ok'
        };

        self.prev = function(callback) {
            self.stop();
            var index = onShow - 1;
            if (index < 0) index = len - 1;
            doMove(index, 'right', function() {
                //self.play();
            });
        };

        self.next = function(callback) {
            self.stop();
            var index = onShow + 1;
            if (index >= len) index = 0;
            doMove(index, 'left', function() {
                //self.play();
            });
        };

        self.goto = self.show = function(index) {
            self.stop();
            var _direction = (index - onShow) < 0 ? ((index - onShow == 1 - len) ? 'left' : 'right') : ((index - onShow == len - 1) ? 'right' : 'left');
            if (!doMove(index, _direction, function() {
                    self.play();
                })) {
                self.play();
            }
        };

        self.play = function() {
            pID = setTimeout(function() {
                // self.prev()
                self.next();
            }, delay);
        };

        self.stop = function() {
            return clearTimeout(pID);
        };

        self.addClass = function(element, className) {
            var classArray = null;
            var c = false;
            try {
                classArray = element.className.split(' ');
                for (var i = 0; i < classArray.length; i++) {
                    if (classArray[i] == className) c = true;
                }
                if (!c) classArray.push(className);
                element.className = classArray.join(' ');
            } catch (e) {}
        };

        self.removeClass = function(element, className) {
            var classArray = null;
            var newClassArray = [];
            var c = false;
            try {
                classArray = element.className.split(' ');
                for (var i = 0; i < classArray.length; i++) {
                    if (classArray[i] !== className) newClassArray.push(classArray[i]);
                }
                element.className = newClassArray.join(' ');
            } catch (e) {}
        };

        self.addEvent = function(element, type, fn) {
            if (typeof element == 'undefined') return false;
            if (element.addEventListener) {
                element.addEventListener(type, fn, false);
            } else if (element.attachEvent) {
                //将事件缓冲到该标签上,已解决this指向window(现fn内this指向element)和移除匿名事件问题
                var _EventRef = '_' + type + 'EventRef';
                if (!element[_EventRef]) {
                    element[_EventRef] = [];
                }
                var _EventRefs = element[_EventRef];
                var index;
                for (index in _EventRefs) {
                    if (_EventRefs[index]['realFn'] == fn) {
                        return;
                    }
                }
                //propertychange事件统一为input事件
                if (type == 'input') type = 'propertychange';
                var nestFn = function() {
                    fn.apply(element, arguments);
                };
                element[_EventRef].push({
                    'realFn': fn,
                    'nestFn': nestFn
                });
                element.attachEvent('on' + type, nestFn);
            } else {
                element['on' + type] = fn;
            }
        };

        self.removeEvent = function(element, type, fn) {
            if (typeof element == 'undefined') return false;
            if (element.removeEventListener) {
                element.removeEventListener(type, fn, false);
            } else if (element.detachEvent) {
                var _EventRef = '_' + type + 'EventRef';
                if (!element[_EventRef]) {
                    element[_EventRef] = [];
                }
                var _EventRefs = element[_EventRef];
                var index;
                var nestFn;
                for (index in _EventRefs) {
                    if (_EventRefs[index]['realFn'] == fn) {
                        nestFn = _EventRefs[index]['nestFn'];
                        if (index == _EventRefs.length - 1) {
                            element[_EventRef] = _EventRefs.slice(0, index);
                        } else {
                            element[_EventRef] = _EventRefs.slice(0, index).concat(_EventRefs.slice(index + 1, _EventRefs.length - 1));
                        }
                        break;
                    }
                }
                //propertychange事件统一为input事件
                if (type == 'input') type = 'propertychange';
                if (nestFn) {
                    element.detachEvent('on' + type, nestFn);
                }
            } else {
                element['on' + type] = null;
            }
        };

        self.Tween = {
            Linear: function(t, b, c, d) {
                return c * t / d + b;
            },
            EaseIn: function(t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            EaseOut: function(t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            EaseInOut: function(t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        };

        self.destroy = function() {
            self.stop()
            self.removeEvent(slider, "mouseover", self.stop);
            self.removeEvent(slider, "mouseout", self.play);

            self.slideBox = null;
            self.dotObjArr = null;
            controllerBox = null;

            if (touch) {
                self.removeEvent(slider, 'touchstart', self._touchstart);
                self.removeEvent(slider, 'touchmove', self._touchmove);
                self.removeEvent(slider, 'touchend', self._touchend);
            }

            slider = null;
        }

        self.init();

        // self.play();
    };
    /* 生命周期 function list，根据组件情况选用，（一般情况选用 build、firstInviewCallback） start */
    // build 方法，元素插入到文档时执行，仅会执行一次
    customElem.prototype.build = function () {
        // this.element 可取到当前实例对应的 dom 元素
        var element = this.element;
        var slideWidth = $('#photoPaging').width();
        //element._index = index ++;
        swipeScroll = new SwipeScroll({
            sliderID: 'photoPaging',
            containerClass: 'swiperBox',
            item: 'small_pic',
            itemWidth: slideWidth,
            controllerOnClass: 'on',
            controllerListDomId: 'buttons',
            tween:'EaseOut',
            touch:true
        });
        var prev01 = $(element).find('.preBtn')[0];//前翻页按钮
        var next01 = $(element).find('.nextBtn')[0];//后翻页按钮
        swipeScroll.addEvent(next01, 'click', swipeScroll.next);

        swipeScroll.addEvent(prev01, 'click', swipeScroll.prev);
    };

    return customElem;
});
require(['mip-ifeng-ppt'], function (plugindemo) {
    //若组件需要有 css,自测时先用字符串，提交过来需要使用 __inline('./组件名称.css'),一个 css 文件
    MIP.css.mipplugindemo = ".mip-demo-f13 {font-size: 13px;}";
    //注册组件,若有 css 才加第三个参数，否则不要第三个参数
    MIP.registerMipElement("mip-ifeng-ppt", plugindemo);
});