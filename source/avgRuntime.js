/*
 * AVG Runtime
 * Made by NekoTora 2015-07
 * http://flag.moe/
 */

//全局变量
var data,
    avgGobal = {
        version: "0.9",
        nowBlock: "",
        nowDialog: "",
    };

// 页面载入时初始化框架
$(document).ready(function(){
   avgMain();
});

// 启动，加载游戏到全局变量data
function avgMain() {
    $.getJSON("game.json", "", function(json) {
        data = json;
        if (data.info.runtime_version < avgGobal.version) {
            return alert("运行库版本过低");
        }

        $("body").append("<div class=\"effectlayer\">");
        console.log(data);

        avgRun();
    });
};

// 主处理
function avgRun(action, value) {
    // 清空选项框
    $(".avgplayer .selector").remove();

    // 获取当前游戏状态
    if(!avgGobal.nowBlock) {
        // 进度为空，新游戏
        // 获取首个block，不存在为index
        if (!data.info.first_block) {
            data.info.first_block = "index";
            console.log("first_block不存在，默认index");
        }

        // 初始化游戏
        avgGobal.nowBlock = data.info.first_block;
        avgGobal.nowDialog = 0;
        console.log("游戏已初始化");
    }

    var now = data["block"][avgGobal.nowBlock][avgGobal.nowDialog];

    switch (action) {
        case "nextDialog":
            // 下一个对话
            // 将现在的对话进度+1
            avgGobal.nowDialog++;
            console.log(now);
            now = data["block"][avgGobal.nowBlock][avgGobal.nowDialog];

            if (!now || avgGobal.nowDialog > (now.length - 1)) {
                alert("这个区块中已经没有可以显示的对话了");
                return;
            }
            break;

        case 'toBlock':
            // 跳转到对话
            if (!data["block"][avgGobal.nowBlock]) {
                alert('不存在的Block');
            }

            avgGobal.nowBlock = value;
            avgGobal.nowDialog = 0;
            now = data["block"][value][0];
            console.log('toBlock:' + value);
            break;
    }


    // 输出对话
    $(".avgplayer").append("<p>" + now["content"] + "</p>");

    // 动作判断，如果不存在action则为wait
    if(!now["action"]) {
        now["action"] = "wait";
    }

    // 输出选项容器
    $(".avgplayer").append("<div class=\"selector\">");

    switch (now["action"]) {
        case "wait": // 输出选项-继续
            $(".avgplayer .selector").append("<a class=\"opition\" href=\"javascript:;\" onclick=\"avgRun('nextDialog')\">...</a>");
            break;
        case "select": // 输出选项-分支
            //循环输出选项
            for (var i = 0; i < now["selector"].length; i++) {
                var opition = $('<a>');
                opition.html(now["selector"][i]["content"]);
                opition.addClass("opition"); 
                opition.attr("href", "javascript:void(0)");

                //action为toblock时
                if (now["selector"][i]["action"] == "toblock") {
                    opition.attr("onclick", "avgRun('toBlock','" + now["selector"][i]["block"] + "')"); 
                }

                $(".avgplayer .selector").append(opition);
                console.log("here is selector");
            }
            break;
    }

    //输出特效
    if (now["effect"]) {
        console.log("effect on!");
        switch (now["effect"]) {
            case 'akari'://特效-阿卡林
                console.log("effect akari！！!");
                $(".effectlayer").css({
                    "background":"rgba(255, 255, 255, .5)",
                });
                break;
            
            case 'dark'://特效-黑屏
                $("*:not(.player)").css("background", "#000");
                $("*:not(.player) .player").css({"color": "#fff", "zoom": "1.2"});
                $("*:not(.player) .player a:hover").css("color", "#ff8484");
                break;
        }
    }
    
    console.log(avgGobal);
};

//错误处理
window.onerror=function(message,url,line) { 
    alert("(/TДT)/抱歉，AVG Runtime 在读取游戏的时候遇到了错误！\n\n错误信息\nRuntimeVerson："+avgGobal.version+"\nMassage："+message+"\nUrl："+url+"\nLine："+line+"\n\n请检查Console获取详细信息"); 
}