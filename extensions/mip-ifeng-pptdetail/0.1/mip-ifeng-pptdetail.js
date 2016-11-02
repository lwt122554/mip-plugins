/**
 * @file 幻灯详情页
 * @author syf
*/
define('gloableSettingsIfeng', ['require'], function (require) {
    var $ = require('zepto');
    var staDom = $('mip-ifeng-sta');
    var jsonArr = staDom.find('script[type="application/json"]');
    var gloableSettings = $.trim(jsonArr.eq(0).html());
    gloableSettings = JSON.parse(gloableSettings);
    return gloableSettings;
});
define('pptIfeng', ['require'], function (require) {
    var $ = require('zepto');
    var loop;
    var index;
    var vertical;
    var height;
    var width;
    var tran;
    var transition;
    var auto;
    var Swiper = function (arg) {
        this.canMove = true; // 控制是否可以滑动
        this.page = 1; // 控制显示第几页
        this.pageTotal = 0; // 可以滑动的总的页数
        this.timer = null; // 自动滑动的定时器
        this.play = false;
        this.intervalTime = arg.intervalTime ? parseInt(arg.intervalTime, 10) * 1000 : 5000; // 定时器间隔

        this.initData(arg);
        this.initDom(arg);
        this.initEvent(arg);
        // 这两个方法控制是否可以滑动
        this.lockSwiper = function () {
            this.canMove = false;
        };
        this.unlockSwiper = function () {
            this.canMove = true;
        };
        var thisO = this;
        // 自动循环

        if (auto) {
            this.play = true;
            this.playAuto(arg);
        }
        this.tap = true;

    };
    Swiper.prototype = {
        initData: function (arg) {
            loop = arg.loop; // 是否循环
            auto = arg.auto; // 是否自动播放

            index = loop ? this.page : this.page - 1; // 滑动系数
            // 滑动方向
            if (arg.direction === 'vertical') {
                // 垂直滑动
                vertical = true;
            }
            else {
                vertical = false;
            }

            this.x = 0; // 记录首次触碰的x坐标
            this.y = 0; // 记录首次触碰的y坐标
            height = vertical ? (arg.height || $(window).height()) : 0;
            width = vertical ? 0 : (arg.width || $(window).width());

            // 控制兼容性
            var vendor = (function () {
                var docElStyle = document.documentElement.style;
                var lists = ['webkitT', 'MozT', 'msT', 'OT', 't'];
                var transform;
                for (var i = 0, iLen = lists.length; i < iLen; i++) {
                    transform = lists[i] + 'ransform';
                    if (transform in docElStyle) {
                        return lists[i].substr(0, lists[i].length - 1);
                    }

                }
                return false;
            }());
            transition = 'transform';
            tran = 'transitionend';
            if (vendor) {
                transition = '-' + vendor + '-' + transition;
                tran = vendor + 'TransitionEnd';
            }
        },
        initDom: function (arg) {
            this.contain = $('#' + arg.id);
            this.swipers = this.contain.find('.swiper-slide');
            this.swiperBox = this.contain.find('.swiper-wrapper');
            this.pageTotal = this.swipers.length; // 可以滑动的图片总数

            if (vertical) {
                this.swipers.height(this.height);
                this.contain.height(this.height);
            }
            else {
                this.swipers.width(this.width);
                this.contain.width(this.width);
            }
            if (loop) {
                // 循环模式前后各复制一帧
                this.swipers.eq(0).clone(true).appendTo(this.swiperBox);
                this.swipers.eq(this.pageTotal - 1).clone(true).insertBefore(this.swipers.eq(0));
                if (vertical) {
                    this.swiperBox.css(transition, this.setLocation(0, -index * height));
                }
                else {
                    this.swiperBox.css(transition, this.setLocation((-index * width), 0));
                }
            }
        },
        initEvent: function (arg) {
            var thisO = this;
            var befTouchStart = arg.onTouchStart; // 用户定义的移动开始的逻辑
            var befTouchMove = arg.onTouchMove; // 用户定义的移动时的逻辑
            var befTouchEnd = arg.onTouchEnd; // 用户定义的移动结束后的逻辑
            var tapEvent = arg.onTap; // 用户自定义的tap事件
            var moveX;
            var moveY;
            var followMove = arg.followMove;

            this.swipers.on('touchstart', function () {
                thisO.tap = true;
                thisO.play = false;
                if (befTouchStart) {
                    befTouchStart(thisO, this);
                }
                if (thisO.canMove) {
                    thisO.touchStart(); // 记录初始位置
                }
                // 不可滑动页
                if ($(event.target).closest('.swiper-no-swiping').length) {
                    thisO.canMove = false;
                }
            });
            this.swipers.on('touchmove', function () {
                thisO.tap = false;
                if (thisO.canMove) {
                    if (befTouchMove) {
                        befTouchMove(thisO);
                    }
                    var location = thisO.touchMove(); // 记录移动距离
                    moveX = location.x;
                    moveY = location.y;
                    // 垂直滑动
                    if (vertical) {
                        moveX = 0;
                    }
                    else {
                        moveY = 0;
                    }
                    if (followMove) {
                        thisO.swiperBox.css(transition, thisO.setLocation(-index * width + moveX, -index * height + moveY));
                        // 非循环模式，阻止第一帧和最后一帧的滑动
                        if (!loop) {
                            if ((thisO.page + 1) > thisO.pageTotal || (thisO.page - 1) === 0) {
                                thisO.swiperBox.css(transition, thisO.setLocation(-index * width, -index * height));
                            }
                        }
                    }
                    // 阻止默认事件
                    if (!$(event.target).closest('.swiper-no-swiping').length) {
                        if (vertical && Math.abs(moveY) > 10) {
                            return false;
                        }
                        if (!vertical && Math.abs(moveX) > 10) {
                            return false;
                        }
                    }
                }
            });
            this.swipers.on('touchend', function () {
                // thisO.swiperBox.stop(true,true);
                if (thisO.canMove) {
                    // 防抖动,回归原位
                    if (followMove && Math.abs(moveX) <= 10 && Math.abs(moveY) <= 10) {
                        thisO.swiperBox.css(transition, thisO.setLocation(index * width, index * height));
                    }

                    // 判断滑动方向
                    if (moveY > 10 || moveX > 10) {
                        // 向下、右翻页
                        if (loop) {
                            thisO.page = (thisO.page - 1) < 0 ? 0 : (thisO.page - 1);
                        }
                        else {
                            thisO.page = (thisO.page - 1) < 1 ? 1 : (thisO.page - 1);
                        }
                    }
                    else if (moveY < -10 || moveX < -10) {
                        // 向上、左翻页
                        if (loop) {
                            thisO.page = (thisO.page + 1) > (thisO.pageTotal + 1) ? (thisO.pageTotal + 1) : (thisO.page + 1);
                        }
                        else {
                            thisO.page = (thisO.page + 1) > thisO.pageTotal ? thisO.pageTotal : (thisO.page + 1);
                        }
                    }

                    // 滑动
                    thisO.swiperMove();

                    if (befTouchEnd) {
                        befTouchEnd(thisO);
                    }
                    if (thisO.tap && tapEvent) {
                        tapEvent(thisO);
                    }

                    // 初始化
                    thisO.x = thisO.y = moveX = moveY = 0;
                }
            });

        },
        touchStart: function () {
            var touch = event.touches[0];
            // 记录初始位置
            this.x = touch.pageX;
            this.y = touch.pageY;
        },
        touchMove: function () {
            var touch = event.touches[0];
            var x = touch.pageX - this.x;
            var y = touch.pageY - this.y;
            var location = {x: x, y: y};
            // 返回移动距离
            return location;
        },
        setLocation: function (x, y) {
            // 设置位置
            return ('WebKitCSSMatrix' in window) ? 'translate3d(' + x + 'px, ' + y + 'px, 0)' : 'translate(' + x + 'px, ' + y + 'px)';
        },
        playAuto: function (arg) {
            var thisO = this;
            if (this.play) {
                this.timer = setInterval(function () {
                    thisO.swiperBox.stop(true, true);
                    thisO.page = (thisO.page + 1) > (thisO.pageTotal + 1) ? (thisO.pageTotal + 1) : (thisO.page + 1);
                    thisO.swiperMove();

                }, this.intervalTime);
            }

        },
        swiperMove: function () {
            var thisO = this;
            thisO.swiperBox.addClass('js-anim');
            index = loop ? thisO.page : thisO.page - 1;

            thisO.swiperBox.css(transition, thisO.setLocation(-index * width, -index * height));
            thisO.swiperBox[0].addEventListener(tran, function (e) {
                $(this).removeClass('js-anim');
                if (loop) {
                    if (thisO.page < 1) {
                        thisO.page = thisO.pageTotal;
                    }
                    else if (thisO.page > thisO.pageTotal) {
                        thisO.page = 1;
                    }
                    index = thisO.page;
                    thisO.swiperBox.css(transition, thisO.setLocation(-index * width, -index * height));
                }

            });
        }
    };
    return Swiper;
});
define('mip-ifeng-pptdetail', ['require', 'pptIfeng', 'gloableSettingsIfeng', 'customElement', 'zepto'], function (require, ppt, gloableSettings) {
    // mip 组件开发支持 zepto
    var $ = require('zepto');
    var customElem = require('customElement').create();
    var textadDom = $('.picTxtBox');
    var textBox = $('.picsBox .picTxt');
    var pageBox = textBox.find('.picPage');
    var pageDom = pageBox.find('#DB_current');
    var textDom = textBox.find('ul li');
    var shareBtn = $('.picsShare');
    var shareDom = $('#black2');
    var adDom = $('.bomBox');
    window.location.hash = 'imgnum=1';
    var hasNextDoc = !!gloableSettings.nextDataId; // 下一图集id
    var hasPreDoc = !!gloableSettings.preDataId; // 上一图集id

    function sendSta(page, total) {
        // 改变hash值
        var oldPageUrl = window.location.href;
        var urlStart = oldPageUrl.split('imgnum=')[0];
        history.replaceState(null, 'url', urlStart + 'imgnum=' + page);
        // 发送统计
        if (typeof sendStaRequestByJs === 'function') {
            var currentPageUrl = window.location.href;
            var param = null;
            var ref = oldPageUrl || document.referrer || '';
            var h = currentPageUrl.split('#');
            var suffix = h[0] + (location.search ? '&' : (h[0].indexOf('?') > -1 ? '' : '?'));
            var url = [
                suffix + 'srctag=zbs_slide_tj1' + '#imgnum=' + (page),
                suffix + 'srctag=zbs_slide_tj2' + '#imgnum=' + (page)
            ];

            if (page === total) {
                param = url[1];
            }
            else {
                param = currentPageUrl;
            }
            sendStaRequestByJs({
                imgnum: page,
                ref: ref,
                url: param
            });
        }
    }

    function swiperEnd(swiper) {
        textBox.show();
        textBox.removeAttr('style');
        // 滑动的最后一帧是广告
        if (swiper.page < swiper.pageTotal) {
            textadDom.height(172);
            pageDom.html(swiper.page); // 改变页码
            textDom.eq(swiper.page - 1).show().siblings().hide();
            // 隐藏分享和广告
            adDom.removeClass('js-hide');
            shareBtn.show();
        }
        else {
            // 广告页显示
            textBox.hide();
            adDom.addClass('js-hide');
            shareBtn.hide();
            $('.picsTit').removeClass('js-title-top');
            textBox.removeClass('js-summary-top');
            pageBox.removeClass('picPageOnly');
            textadDom.height(0);
        }
        // 发送统计
        sendSta(swiper.page, swiper.pageTotal);
    }

    function initTextEvent(textBox) {
        // 文字浮层
        var startY = 0;
        var moveY = 0;
        var endY = 0;
        var picTxtH;
        function statxt(e) {
            var touch = e.touches[0];
            startY = touch.pageY;
            picTxtH = textBox[0].clientHeight;
            textBox.css('transition', 'none');
            textBox.css('-webkit-transition', 'none');
        }
        function movtxt(e) {
            var touch = e.touches[0];
            moveY = touch.pageY - startY;
            if (moveY < 0) {
                if ((endY + moveY) > 123 - picTxtH && (endY + moveY) < 0) {
                    textBox[0].style.webkitTransform = 'translateY(' + (endY + moveY) + 'px)';
                }
                else {
                    textBox[0].style.webkitTransform = 'translateY(' + (123 - picTxtH) + 'px)';
                }
            }
            else if (moveY > 0) {
                resetpicTxt('translateY(0px)');
            }
        }
        function resetpicTxt(sty) {
            textBox[0].style.webkitTransition = 'transform 0.2s';
            textBox[0].style.webkitTransform = sty;
            setTimeout(function () {
                textBox[0].style.webkitTransform = 'none';
            }, 200);
            moveY = 0;
            endY = 0;
        }
        function endtxt(e) {
            var touch = e.touches[0];
            endY = endY + moveY;
        }
        textBox.on('touchstart', function (e) {
            statxt(e);
            return false;
        });
        textBox.on('touchmove', function (e) {
            movtxt(e);
            return false;
        });
        textBox.on('touchend', function (e) {
            endtxt(e);
            return false;
        });
    }

    function initShareEvent() {
        // 判断是否是微信浏览器
        var isWeixin = /MicroMessenger/.test(navigator.userAgent);
        if (!isWeixin) {
            // 移除其他的分享
            var shareList = $('#black2 .c-share-list');
            shareList.addClass('js-share');
            shareList.find('.c-share-btn').each(function (index, dom) {
                if (index !== 0 && index !== 1) {
                    $(dom).remove();
                }

            });
        }

        shareBtn.on('touchend', function () {
            shareDom.show();
        });
        shareDom.on('touchend', function (e) {
            if (!$(e.target).closest('.c-span3').length) {
                $(this).hide();
            }

        });
    }

    customElem.prototype.build = function () {
        var element = this.element;
        var index = 1;
        var swiper = new ppt({
            direction: 'horizontal', // 滑动方向
            loop: false, // 是否循环
            width: 0, // 滑动元素的宽，需要自适应窗口的宽度的时候为0
            height: 0, // 滑动元素的高,需要自适应窗口的高度的时候为0
            id: 'picsBox', // 容器的id
            followMove: true, // 滑动元素是否跟随手机的移动而移动
            auto: false, // 是否自动播放
            intervalTime: 5, // 定时器播放图画的间隔是几秒
            onTouchStart: function (swiper, eventbox) {
                // 手动触发显示图片
                if (swiper.page < swiper.pageTotal - 1) {
                    var next = swiper.swipers[swiper.page];
                    var child = $(next).find('mip-img')[0];
                    if (child.tagName.toLocaleLowerCase() === 'mip-img') {
                        MIP.prerenderElement(child);
                    }
                }
                else {
                    var next = swiper.swipers[swiper.pageTotal - 1];
                    var children = $(next).find('mip-img');
                    for (var i = 0, len = children.length; i < len; i++) {
                        var child = children.eq(i)[0];
                        if (child.tagName.toLocaleLowerCase() === 'mip-img') {
                            MIP.prerenderElement(child);
                        }

                    }
                }
            },
            onTouchMove: function (swiper) {},
            onTouchEnd: function (swiper) {
                if (!swiper.tap && index === swiper.pageTotal && swiper.page === swiper.pageTotal) {
                    // 进入下一图集
                    if (hasNextDoc) {
                        location.href = gloableSettings.suffixUrl + gloableSettings.nextDataId + '/news.shtml?srctag=zbs_slide_next';
                    }
                    else {
                        location.href = '/';
                    }
                }
                else if (!swiper.tap && index === 1 && swiper.page === 1) {
                    // 上一图集
                    if (hasPreDoc) {
                        location.href = gloableSettings.suffixUrl + gloableSettings.preDataId + '/news.shtml';
                    }
                    else {
                        location.href = '/';
                    }
                }
                if (!swiper.tap) {
                    swiperEnd(swiper);
                }
                index = swiper.page;
            },
            onTap: function (swiper) {
                // tap事件
                if (swiper.page < swiper.pageTotal) {
                    // 隐藏标题和摘要
                    $('.picsTit').toggleClass('js-title-top');
                    textBox.toggleClass('js-summary-top');
                    pageBox.toggleClass('picPageOnly');
                }

            }
        });
        initTextEvent(textBox);
        initShareEvent();
    };

    return customElem;
});
require(['mip-ifeng-pptdetail'], function (plugindemo) {
    // 注册组件,若有 css 才加第三个参数，否则不要第三个参数
    MIP.registerMipElement('mip-ifeng-pptdetail', plugindemo);
});
