/**
 * @file 幻灯
 * @author syf
*/
define('mip-ifeng-ppt', ['require', 'customElement', 'zepto'], function (require) {
    // mip 组件开发支持 zepto
    var $ = require('zepto');

    var customElem = require('customElement').create();
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
        if (typeof options !== 'object') {
            options = {};
        }
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
        self.init = function () {
            slider = document.getElementById(sliderID);
            container = getByClass(slider, containerClass)[0];
            self.slideBox = getByClass(slider, item);
            len = self.slideBox.length;
            page = $('.js_currentIndex')[0];

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

        var build = function (index, onShow, slideDirection) {
            var mul = index > onShow ? 1 : -1;
            var diff = mul * (index - onShow);
            if(diff === len - 1){
                self.slideBox[index].style.marginLeft = mul > 0 ? sortWidth + 'px' : itemWidth + 'px';
                self.slideBox[onShow].style.marginLeft = mul > 0 ? itemWidth + 'px' : sortWidth + 'px';
                sliderTranslate = mul * itemWidth;
                slider.scrollLeft = mul > 0 ? itemWidth + 'px' : 0;
            }else{
                self.slideBox[index].style.marginLeft = 0;
                self.slideBox[onShow].style.marginLeft = 0;
                sliderTranslate = -mul * itemWidth;
                slider.scrollLeft = mul > 0 ?  0 : itemWidth + 'px';
            }
            self.slideBox[index].style.display = '';
        };

        var doMove = function (index, slideDirection, callback) {
            page.innerHTML = index + 1;
            if (onShow === index || sliding) {
                return false;
            }

            sliding = 1;

            build(index, onShow, slideDirection);
            before = onShow;
            onShow = index;

            var startTimeTemp = 0;
            var tmpDuration = duration / 16;
            var move = function (callbackTmp) {
                startTimeTemp += stepTime;
                if (slideDirection === 'left') {
                    slider.scrollLeft = -Math.ceil(self.Tween[tween](startTimeTemp, 0, sliderTranslate, tmpDuration));
                } else if (slideDirection === 'right') {
                    slider.scrollLeft = 366 - Math.ceil(self.Tween[tween](
                            startTimeTemp, 0, sliderTranslate, tmpDuration));
                }
                if (startTimeTemp <= tmpDuration) {
                    sID = setTimeout(function () {
                        move(callbackTmp);
                    }, 16);
                } else {
                    clearTimeout(sID);
                    if (slideDirection === 'left') {
                        self.slideBox[before].style.display = 'none';
                        self.slideBox[onShow].style.marginLeft = 0;
                    } else if (slideDirection === 'right') {
                        self.slideBox[before].style.display = 'none';
                        self.slideBox[onShow].style.marginLeft = 0;
                    }

                    slider.scrollLeft = 0;
                    sliding = 0;
                    if (typeof callbackTmp === 'function') {
                        callbackTmp();
                    }
                }
            };
            if (typeof callback === 'function') {
                move(callback);
            } else {
                move();
            }
            return true;
        };

        self.iPadX = 0;
        self.iPadLastX = 0;
        self.iPadStatus = 'ok';
        self.iPad = function () {
            if (typeof(window.ontouchstart) === 'undefined') {
                return;
            }
            if (!touch) {
                return;
            }
            self.addEvent(slider, 'touchstart', self._touchstart);
            self.addEvent(slider, 'touchmove', self._touchmove);
            self.addEvent(slider, 'touchend', self._touchend);
        };
        self._touchstart = function (e) {
            self.stop();
            self.iPadX = e.touches[0].pageX;
        };
        self._touchmove = function (e) {
            if (e.touches.length > 1) {
                self._touchend();
            }
            self.iPadLastX = e.touches[0].pageX;
            self.iPadStatus = 'touch';
            e.preventDefault();
        };
        self._touchend = function (e) {
            if (self.iPadStatus !== 'touch') {
                return;
            }
            self.iPadStatus = 'ok';
            var cX = self.iPadX - self.iPadLastX;
            var index = null;
            if (cX < 0) {
                index = onShow - 1;
                if (index < 0) {
                    index = len - 1;
                }
                doMove(index, 'right', function () {});
            } else {
                index = onShow + 1;
                if (index >= len) {
                    index = 0;
                }
                doMove(index, 'left', function () {});
            }
        };
        self._overTouch = function () {
            self.iPadStatus = 'ok';
        };

        self.prev = function (callback) {
            self.stop();
            var index = onShow - 1;
            if (index < 0) {
                index = len - 1;
            }
            doMove(index, 'right', function () {});
        };

        self.next = function (callback) {
            self.stop();
            var index = onShow + 1;
            if (index >= len) {
                index = 0;
            }
            doMove(index, 'left', function () {});
        };

        self.goto = self.show = function (index) {
            self.stop();
            var direction = (index - onShow) < 0 ? (
                (index - onShow === 1 - len) ? 'left' : 'right') : (
                    (index - onShow === len - 1) ? 'right' : 'left');
            if (!doMove(index, direction, function () {
                    self.play();
                })) {
                self.play();
            }
        };

        self.play = function () {
            pID = setTimeout(function () {
                self.next();
            }, delay);
        };

        self.stop = function () {
            return clearTimeout(pID);
        };

        self.addClass = function (element, className) {
            var classArray = null;
            var c = false;
            try {
                classArray = element.className.split(' ');
                for (var i = 0; i < classArray.length; i++) {
                    if (classArray[i] === className) {
                        c = true;
                    }
                }
                if (!c) {
                    classArray.push(className);
                }
                element.className = classArray.join(' ');
            } catch (e) {}
        };

        self.removeClass = function (element, className) {
            var classArray = null;
            var newClassArray = [];
            var c = false;
            try {
                classArray = element.className.split(' ');
                for (var i = 0; i < classArray.length; i++) {
                    if (classArray[i] !== className) {
                        newClassArray.push(classArray[i]);
                    }
                }
                element.className = newClassArray.join(' ');
            } catch (e) {}
        };

        self.addEvent = function (element, type, fn) {
            if (typeof element === 'undefined') {
                return false;
            }
            if (element.addEventListener) {
                element.addEventListener(type, fn, false);
            } else if (element.attachEvent) {
                var EventRef = '_' + type + 'EventRef';
                if (!element[EventRef]) {
                    element[EventRef] = [];
                }
                var EventRefs = element[EventRef];
                var index;
                for (index in EventRefs) {
                    if (EventRefs[index].realFn === fn) {
                        return;
                    }
                }
                if (type === 'input') {
                    type = 'propertychange';
                }
                var nestFn = function () {
                    fn.apply(element, arguments);
                };
                element[EventRef].push({
                    'realFn': fn,
                    'nestFn': nestFn
                });
                element.attachEvent('on' + type, nestFn);
            } else {
                element['on' + type] = fn;
            }
        };

        self.removeEvent = function (element, type, fn) {
            if (typeof element === 'undefined') {
                return false;
            }
            if (element.removeEventListener) {
                element.removeEventListener(type, fn, false);
            } else if (element.detachEvent) {
                var EventRef = '_' + type + 'EventRef';
                if (!element[EventRef]) {
                    element[EventRef] = [];
                }
                var EventRefs = element[EventRef];
                var index;
                var nestFn;
                for (index in EventRefs) {
                    if (EventRefs[index].realFn === fn) {
                        nestFn = EventRefs[index].nestFn;
                        if (index === EventRefs.length - 1) {
                            element[EventRef] = EventRefs.slice(0, index);
                        } else {
                            element[EventRef] = EventRefs.slice(0, index)
                            .concat(EventRefs.slice(index + 1, EventRefs.length - 1));
                        }
                        break;
                    }
                }
                if (type === 'input') {
                    type = 'propertychange';
                }
                if (nestFn) {
                    element.detachEvent('on' + type, nestFn);
                }
            } else {
                element['on' + type] = null;
            }
        };

        self.Tween = {
            Linear: function (t, b, c, d) {
                return c * t / d + b;
            },
            EaseIn: function (t, b, c, d) {
                return c * (t /= d) * t + b;
            },
            EaseOut: function (t, b, c, d) {
                return -c * (t /= d) * (t - 2) + b;
            },
            EaseInOut: function (t, b, c, d) {
                if ((t /= d / 2) < 1) {
                    return c / 2 * t * t + b;
                }
                return -c / 2 * ((--t) * (t - 2) - 1) + b;
            }
        };

        self.destroy = function () {
            self.stop();
            self.removeEvent(slider, 'mouseover', self.stop);
            self.removeEvent(slider, 'mouseout', self.play);

            self.slideBox = null;
            self.dotObjArr = null;
            controllerBox = null;

            if (touch) {
                self.removeEvent(slider, 'touchstart', self._touchstart);
                self.removeEvent(slider, 'touchmove', self._touchmove);
                self.removeEvent(slider, 'touchend', self._touchend);
            }

            slider = null;
        };

        self.init();
    }

    customElem.prototype.build = function () {
        var element = this.element;
        var slideWidth = $('#photoPaging').width();

        var swipeScroll = new SwipeScroll({
            sliderID: 'photoPaging',
            containerClass: 'swiperBox',
            item: 'small_pic',
            itemWidth: slideWidth,
            controllerOnClass: 'on',
            controllerListDomId: 'buttons',
            tween: 'EaseOut',
            touch: true
        });
        var prev01 = $(element).find('.preBtn')[0];
        var next01 = $(element).find('.nextBtn')[0];
        swipeScroll.addEvent(next01, 'click', swipeScroll.next);

        swipeScroll.addEvent(prev01, 'click', swipeScroll.prev);
    };

    return customElem;
});
require(['mip-ifeng-ppt'], function (plugindemo) {
    MIP.registerMipElement("mip-ifeng-ppt", plugindemo);
});