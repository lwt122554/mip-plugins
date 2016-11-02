/**
 * @file 幻灯详情页
 * @author syf
*/
define('gloableSettings', ['require'], function (require) {
    var $ = require('zepto');
    var staDom = $('mip-ifeng-sta');
    var jsonArr = staDom.find('script[type="application/json"]');
    var gloableSettings = $.trim(jsonArr.eq(0).html());
    gloableSettings = JSON.parse(gloableSettings);
    return gloableSettings;
});
define('ppt', ['require'], function (require) {
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
        this.canMove = true;
        this.page = 1;
        this.pageTotal = 0;
        this.timer = null;
        this.play = false;
        this.intervalTime = arg.intervalTime ? parseInt(arg.intervalTime, 10) * 1000 : 5000;
        this.initData(arg);
        this.initDom(arg);
        this.initEvent(arg);
        this.lockSwiper = function () {
            this.canMove = false;
        };
        this.unlockSwiper = function () {
            this.canMove = true;
        };
        if (auto) {
            this.play = true;
            this.playAuto(arg);
        }
        this.tap = true;

    };
    Swiper.prototype = {
        initData: function (arg) {
            loop = arg.loop;
            auto = arg.auto;
            index = loop ? this.page : this.page - 1;
            if (arg.direction === 'vertical') {
                vertical = true;
            } else {
                vertical = false;
            }


            this.x = 0;
            this.y = 0;
            height = vertical ? (arg.height || $(window).height()) : 0;
            width = vertical ? 0 : (arg.width || $(window).width());

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
            this.pageTotal = this.swipers.length;
            if (vertical) {
                this.swipers.height(this.height);
                this.contain.height(this.height);
            } else {
                this.swipers.width(this.width);
                this.contain.width(this.width);
            }
            if (loop) {
                this.swipers.eq(0).clone(true).appendTo(this.swiperBox);
                this.swipers.eq(this.pageTotal - 1).clone(true).insertBefore(this.swipers.eq(0));
                if (vertical) {
                    this.swiperBox.css(transition, this.setLocation(0, -index * height));
                } else {
                    this.swiperBox.css(transition, this.setLocation((-index * width), 0));
                }
            }
        },
        initEvent: function (arg) {
            var t = this;
            var befTouchStart = arg.onTouchStart;
            var befTouchMove = arg.onTouchMove;
            var befTouchEnd = arg.onTouchEnd;
            var tapEvent = arg.onTap;
            var moveX;
            var moveY;
            var followMove = arg.followMove;
            this.swipers.on('touchstart', function () {
                t.tap = true;
                t.play = false;
                if (befTouchStart) {
                    befTouchStart(t, this);
                }
                if (t.canMove) {
                    t.touchStart();
                }
                if ($(event.target).closest('.swiper-no-swiping').length) {
                    t.canMove = false;
                }
            });
            this.swipers.on('touchmove', function () {
                t.tap = false;
                if (t.canMove) {
                    if (befTouchMove) {
                        befTouchMove(t);
                    }
                    var location = t.touchMove();
                    moveX = location.x;
                    moveY = location.y;
                    if (vertical) {
                        moveX = 0;
                    } else {
                        moveY = 0;
                    }
                    if (followMove) {
                        t.swiperBox.css(transition, t.setLocation(-index * width + moveX, -index * height + moveY));
                        if (!loop) {
                            if ((t.page + 1) >　t.pageTotal || (t.page - 1) === 0) {
                                t.swiperBox.css(transition, t.setLocation(-index * width, -index * height));
                            }
                        }
                    }
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
                if (t.canMove) {
                    if (followMove && Math.abs(moveX) <= 10 && Math.abs(moveY) <= 10) {
                        t.swiperBox.css(transition, t.setLocation(index * width, index * height));
                    }
                    if (moveY > 10 || moveX > 10) {
                        if (loop) {
                            t.page = (t.page - 1) < 0 ? 0 : (t.page - 1);
                        } else {
                            t.page = (t.page - 1) < 1 ? 1 : (t.page - 1);
                        }
                    } else if (moveY < -10 || moveX < -10) {
                        if (loop) {
                            t.page = (t.page + 1) > (t.pageTotal + 1) ? (t.pageTotal + 1) : (t.page + 1);
                        } else {
                            t.page = (t.page + 1) > t.pageTotal ? t.pageTotal : (t.page + 1);
                        }
                    }
                    t.swiperMove();
                    if (befTouchEnd) {
                        befTouchEnd(t);
                    }
                    if (t.tap && tapEvent) {
                        tapEvent(t);
                    }
                    t.x = t.y = moveX = moveY = 0;
                }
            });

        },
        touchStart: function () {
            var touch = event.touches[0];
            this.x = touch.pageX;
            this.y = touch.pageY;
        },
        touchMove: function () {
            var touch = event.touches[0];
            var x = touch.pageX - this.x;
            var y = touch.pageY - this.y;
            var location = {x: x, y: y};
            return location;
        },
        setLocation: function (x, y) {
            return ('WebKitCSSMatrix' in window) ? 'translate3d(' + x + 'px, ' + y + 'px, 0)' : 'translate(' + x + 'px, ' + y + 'px)';
        },
        playAuto: function (arg) {
            var t = this;
            if (this.play) {
                this.timer = setInterval(function () {
                    t.swiperBox.stop(true, true);
                    t.page = (t.page + 1) > (t.pageTotal + 1) ? (t.pageTotal + 1) : (t.page + 1);
                    t.swiperMove();

                }, this.intervalTime);
            }
        },
        swiperMove: function () {
            var t = this;
            t.swiperBox.addClass('js-anim');
            index = loop ? t.page : t.page - 1;
            t.swiperBox.css(transition, t.setLocation(-index  * width, -index * height));
            t.swiperBox[0].addEventListener(tran, function (e) {
                $(this).removeClass('js-anim');
                if (loop) {
                    if (t.page < 1) {
                        t.page = t.pageTotal;
                    } else if (t.page > t.pageTotal) {
                        t.page = 1;
                    }
                    index = t.page;
                    t.swiperBox.css(transition, t.setLocation(-index * width, -index * height));
                }
            });
        }
    };
    return Swiper;
});
define('mip-ifeng-pptdetail', ['require', 'ppt', 'gloableSettings', 'customElement', 'zepto'], function(require, ppt, gloableSettings) {
    // mip 组件开发支持 zepto
    var $ = require('zepto');
    var customElem = require('customElement').create();

    var textBox = $('.picsBox .picTxt');
    var pageDom = textBox.find('.picPage #DB_current');
    var textDom = textBox.find('ul li');
    var shareBtn = $('.picsShare');
    var shareDom = $('#black2');
    window.location.hash = 'imgnum=1';
    var hasNextDoc = !!gloableSettings.nextDataId;
    var hasPreDoc = !!gloableSettings.preDataId;

    function sendSta(page, total) {
        var oldPageUrl = window.location.href;
        var urlStart = oldPageUrl.split('imgnum=')[0];
        history.replaceState(null, 'url', urlStart + 'imgnum=' + page);
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
            } else {
                param = currentPageUrl;
            }
            sendStaRequestByJs({
                'imgnum': page,
                'ref': ref,
                'url': param
            });
        }
    }

    function swiperEnd(swiper) {
        textBox.show();
        if (swiper.page < swiper.pageTotal) {
            pageDom.html(swiper.page);
            textDom.eq(swiper.page - 1).show().siblings().hide();
        } else {
            textBox.hide();
        }
        sendSta(swiper.page, swiper.pageTotal);
    }

    function initTextEvent(textBox) {
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
                    textBox[0].style.webkitTransform = 'translateY(" + (endY + moveY) + "px)';
                } else {
                    textBox[0].style.webkitTransform = 'translateY(" + (123 - picTxtH) + "px)';
                }
            } else if (moveY > 0) {
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
        var isWeixin = /MicroMessenger/.test(navigator.userAgent);
        if (!isWeixin) {
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
        var Swiper = new ppt({
                direction: 'horizontal',
                loop: false,
                width: 0,
                height: 0,
                id: 'picsBox',
                followMove: true,
                auto: false,
                intervalTime: 5,
                onTouchStart: function (swiper, eventbox) {
                    if (swiper.page < swiper.pageTotal - 1) {
                        var next = swiper.swipers[swiper.page];
                        var child = $(next).find('mip-img')[0];
                        if (child.tagName.toLocaleLowerCase() === 'mip-img') {
                            MIP.prerenderElement(child);
                        }
                    } else {
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
                onTouchMove: function (swiper) {
                },
                onTouchEnd: function (swiper) {
                    if (!swiper.tap && index === swiper.pageTotal && swiper.page === swiper.pageTotal) {
                        if (hasNextDoc) {
                            location.href = '/' + gloableSettings.nextDataId + '/news.shtml?srctag=zbs_slide_next';
                        } else {
                            location.href = '/';
                        }
                    } else if (!swiper.tap && index === 1 && swiper.page === 1) {
                        if (hasPreDoc) {
                            location.href = '/' + gloableSettings.preDataId + '/news.shtml';
                        } else {
                            location.href = '/';
                        }
                    }
                    swiperEnd(swiper);
                    index = swiper.page;
                },
                onTap: function (swiper) {
                    if (swiper.page < swiper.pageTotal) {
                        $('.picsTit').toggleClass('js-title-top');
                        textBox.toggleClass('js-summary-top');
                    }
                }
            });
        initTextEvent(textBox);
        initShareEvent();
    };
    return customElem;
});
require(['mip-ifeng-pptdetail'], function (plugindemo) {
    MIP.registerMipElement("mip-ifeng-pptdetail", plugindemo);
});