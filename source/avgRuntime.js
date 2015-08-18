/**
 * AVG Runtime
 *
 * @author NekoTora <i@flag.moe>
 * @author Rakuem Hayashi <i@fake.moe>
 * @copyright 2015 NekoTora & Rakume
 */

// 全局变量
;(function($) {
    var __VERSION__ = 0.9,
        logs = [];

    var avgRuntime = function(obj) {
        this.configure(obj);
        this.init();
    };

    avgRuntime.prototype.log = function(val, obj) {
        log = '[AvgRuntime/' + obj + '] ' + val + '\n' + (new Date).toString();

        logs.push(log);
        console.log(log);
    }

    avgRuntime.prototype.showLog = function() {
        console.log(logs);

        return logs;
    }

    avgRuntime.prototype.configure = function(obj) {
        this.log('加载配置', 'Configure');

        this.version = __VERSION__;
        this.game = {};

        var tmp = {
            timeout: 10000,
            dataType: 'json'
        };

        for (config in obj) {
            if (obj.hasOwnProperty(config)) {
                tmp[config] = obj[config];
            }
        }

        this.config = tmp;
        return this;
    }

    avgRuntime.prototype.init = function() {
        var that = this;

        if (!this.config.dataFile) {
            this.log('加载数据文件失败', 'Init');
            return false;
        }

        $.ajax({
            dataType: this.config.dataType,
            url: this.config.dataFile,
            timeout: this.config.timeout,
            success: function (data) {
                that.game.data = data;

                if (data.info.runtime_version < that.version) {
                    that.log('运行库版本过低', 'Init');
                    return alert('运行库版本过低');
                }

                that.log('数据加载成功', 'Init');
                $('body').append('<div class="effectlayer">');
                that.run();
            },

            error: function (XMLHttpRequest, textStatus, errorThrown) {
                that.log('数据文件加载失败', 'Init');
                console.log(textStatus + '\n' + errorThrown);
                alert('载入游戏失败\n ErrorCode:' + errorThrown);
            }
        });
    }

    avgRuntime.prototype.run = function() {
        var data = this.game.data;

        if (!data.info.first_block) {
            data.info.first_block = 'index';
            this.log('不存在 `first_block`，默认取 `index`', 'Run');
        }

        this.log('游戏数据初始化完成', 'Run');

        this.show(data.info.first_block, 0);
    };


    avgRuntime.prototype.show = function(block, dialog) {
        var data = this.game.data,
            that = data.block[block][dialog];

        this.game.block = block;
        this.game.dialog = dialog;

        // 显示对话容器
        $('.avgplayer').append('<p id="ontype"></p>');

        // 打字机效果
        var that = this;
        var s = document.getElementById('ontype');
        var i = 0;
        timer = setInterval(function() {
            s.innerHTML = that.content.substring(0, i);
            i++;

            //完成后执行
            if (s.innerHTML == that.content) {
                clearInterval(timer);
                $('.avgplayer p#ontype').attr('id', '');

                //默认action操作
                if (!that['action']) {
                    that['action'] = 'wait';
                }

                // 输出选项容器
                $('.avgplayer p:last-child').append('<div class="selector" style="display:none">');

                // 转动作
                that.action(that);

                // 转特效
                if (that['effect']) {
                    that.effect(that);
                } else {
                    that.log('无特效运行', 'Show');
                }

                that.log('Block `' + block + '`, Dialog `' + dialog + '` 的对话已输出', 'Show');
            };
        },35);
    }

    avgRuntime.prototype.action = function(obj) {
        var that = this;
        if (!obj) return;

        switch (obj.action) {
            // 动作 继续
            case 'wait':
                var option = $('.avgplayer .selector').append('<a class="opition" href="javascript:;">>></a>').fadeIn('slow');
                option.click(function() {
                    var dialog = that.game.dialog + 1;
                    // 清空选项框
                    $('.avgplayer .selector').remove();

                    if (dialog > (that.game.data.block[that.game.block].length - 1) || !that.game.data.block[that.game.block][dialog]) {
                        that.log('对话结束，结尾未封闭。', 'Action');
                        alert('对话结束，结尾未封闭。');
                        return;
                    }

                    that.show(that.game.block, dialog);
                    that.log('显示下一条对话', 'Action');
                });
                break;

            // 动作 分支
            case 'select':
                //循环输出选项
                for (var i = 0; i < obj.selector.length; i++) {
                    var option = $('<a class="option">');
                    option.html(obj.selector[i].content);
                    option.attr('data-block', obj['selector'][i]['block']);

                    //action为toblock时
                    if (obj.selector[i].action === 'toblock') {
                        option.click(function() {
                            // 清空选项框
                            $('avgplayer .selector').remove();

                            var block = $(this).attr('data-block');

                            if (!that.game.data.block[block]) {
                                alert('不存在的 Block');
                                that.log('Block 不存在', 'Action');
                                return false;
                            }

                            // 跳转到对话
                            that.show(block, 0);
                            that.log('进入分支: ' + block);
                        });
                    }

                    $('.avgplayer .selector').append(option).fadeIn('slow');
                }

                that.log('进入分支', 'Action');
                break;
        }

        this.log('动作: ' + obj.action, 'Action');
    }

    avgRuntime.prototype.effect = function(obj) {
        if (!obj || !obj['effect']) return;

        //输出特效
        this.log('特效开启', 'Effect');

        switch (obj['effect']) {
            // 阿卡林特效
            case 'akari':
                this.log('运行阿卡林特效', 'Effect');

                $('.effectlayer').css({
                    'background': 'rgba(255, 255, 255, .5)'
                });
                break;

            // 暗黑世界特效
            case 'dark':
                this.log('运行暗黑世界特效', 'Effect');

                $('*:not(.player)').css('background', '#000');
                $('*:not(.player) .player').css({'color': '#fff', 'zoom': '1.2'});
                $('*:not(.player) .player a:hover').css('color','#ff8484');
                break;
        }
    }

    $.extend({
        avgRuntime: function(obj) {
            return new avgRuntime(obj);
        }
    });

})(jQuery);
