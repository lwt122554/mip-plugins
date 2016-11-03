define('mip-yiqibazi-click', ['require', 'customElement', 'zepto'], function (require) {
    var $ = require('zepto');
    var customElement = require('customElement').create();

    var yiqibazi_effects = {
        //span标签切换
        labelSwitching: function () {
            var $liuniannav = $("#liunian .title span");
            var $liuniancon = $("#liunian .answer-box");
            $liuniannav.on("click",function () {
                var index = $(this).index();
                $liuniannav.removeClass("navs-active");
                $(this).addClass("navs-active");
                //$liuniancon.removeClass("mip-show")
                $liuniancon.eq(index).addClass("mip-show").siblings().removeClass("mip-show");
            });
            var $liunianyunnav = $("#liunianyun .title span");
            var $liunianyuncon = $("#liunianyun .answer-box");
            $liunianyunnav.on("click", function () {
                var index = $(this).index();
                if (index == 2) {
                    location.href = "http://wap.yiqijixiang.com/sx2017/?referraluserid=ydyiqibazi"
                } else {
                    $liunianyunnav.removeClass("navs-active");
                    $(this).addClass("navs-active");
                    //$liunianyuncon.removeClass("mip-show")
                    $liunianyuncon.eq(index).addClass("mip-show").siblings().removeClass("mip-show");
                }
            });
        },
        load: function () {
            $("#liunian").children(".list-con").children(".answer-box").eq(0).addClass("mip-show")
            $("#liunianyun").children(".list-con").children(".answer-box").eq(0).addClass("mip-show")
        },
        init: function () {
            this.load();
            this.labelSwitching();
        }
    };

    customElement.prototype.build = function () {
        yiqibazi_effects.init();
    }
    return customElement;
})

require(['mip-yiqibazi-click'], function (plugindemo) {
    // 注册mip-yiqibazi-script组件
    MIP.registerMipElement('mip-yiqibazi-click', plugindemo);
});
