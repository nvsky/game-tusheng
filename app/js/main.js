'use strict';

var $ = require('jquery');
var wx = require('weixin-js-sdk');
// 使用 Amaze UI 源码中的模块
//var addToHome = require('amazeui/js/ui.add2home');
//local storage
require('amazeui/js/util.store');
// 使用 NPM 中的模块
//var detector = require('detector');

$(function() {
    //接口地址
    var BASE_URL = 'http://xdgame.duapp.com/index.php/index';
    var BASE_URL = 'http://xdyxphp.52yingzheng.com/index';

    var store = $.AMUI.store;
    //验证浏览器是否支持local storage
    var checkStore = true;
    if (!store.enabled) {
        checkStore = false;
    };

    //是否是第一次闯关
    var checkFirstPlay = true;

    var tusheng2015 = function(){
        //纪录被选择洲，默认为1、亚洲
        var clickState = 0;
        //答过题目对象
        var answerList = {};
        //洲问题题目对象
        var stateQuestionList = {
            // "msg": 1,
            // "data": [{
            //     "id": "4",
            //     "state": "1",
            //     "type": "1",
            //     "stem": ["\u90af", "\u90af", "\u90f8", "\u5b8c", "\u5168", "\u800c", "\u989d", "\u90f8", "\u53bb", "\u7684", "\u624d", "\u989d", "\u554a"],
            //     "img_path": "../i/asia.png",
            //     "answer": ["\u90af","\u90f8"]
            // }, {
            //     "id": "1",
            //     "state": "1",
            //     "type": "1",
            //     "stem": ["\u5317", "\u4eac", "\u554a", "\u662f", "\u624d", "\u989d", "\u6e29", "\u67d4", "\u6c83", "\u5c14", "\u7279", "\u5343", "\u4e07"],
            //     "img_path": "../i/southAmerica.png",
            //     "answer": ["\u5317","\u4eac"]
            // }]
        };
        //已答过题对象
        var allreadyAnswerObj = {
            "asia": [],
            "eur": [],
            "na": [],
            "sa": []
        };

        //纪录是否有答对过问题
        var checkTrue = false;

        //纪录导出分析报告时给出的分享标题
        var shareTitle = "";

        //分享
        var shareData={
            title: '全新途胜与你一起掌控自由本能',
            desc: '全新途胜与你一起掌控自由本能',
            link: window.location.href,
            imgUrl: 'i/share_icon_120x120.jpg' //图片需加上域名
        };
        
        $.ajax({
            url: BASE_URL+'/share',
            type: 'GET',
            dataType: 'JSON',
            data: {
                url: window.location.href
            },
        })
        .done(function(back) {
            console.log(back)
            if (back.errcode == 200) {
                /*微信授权*/
                var _appId=back.appid;
                var _timestamp=back.timestamp;
                var _nonceStr=back.noncestr;
                var _signature=back.signature;
                wx.config({
                  debug: false,
                  appId: _appId,
                  timestamp: _timestamp,
                  nonceStr: _nonceStr,
                  signature: _signature,
                  jsApiList: [
                      'onMenuShareTimeline',
                      'onMenuShareAppMessage'
                  ]
                });
                wx.ready(function () {
                    wx.checkJsApi({
                      jsApiList: [
                        'onMenuShareTimeline',
                        'onMenuShareAppMessage',
                        'onMenuShareQQ',
                        'onMenuShareWeibo'
                      ],
                      success: function (res) {
                        //alert(JSON.stringify(res));
                      }
                    });  
                    /*分享给朋友*/
                    wx.onMenuShareAppMessage(shareData);
                    /*分享到朋友圈*/
                    wx.onMenuShareTimeline(shareData);
                    /*分享到QQ*/
                    onMenuShareQQ(shareData);
                    /*分享到微博*/
                    onMenuShareWeibo(shareData);
                });
            };
        });


        //viewport1 loading页面
        var loading = function() {
             $('#viewport1').removeClass('am-hide').addClass('am-block');
            setTimeout(function(){
                $('#viewport1').removeClass('am-block').addClass('am-hide');
                initPlay();
            }, 2000);
        };
        //viewport2首页
        var initPlay = function() {
            var view_width = document.documentElement.clientWidth;
            $('#viewport2').removeClass('am-hide').addClass('am-block');
            $('#init-play-btn').off('click').on('click', function(event) {
                event.preventDefault();
                $('#viewport2').removeClass('am-block').addClass('am-hide');
                statePage();
            });
            // $('#game-rule').off('click').on('click', function(event) {
            //     event.preventDefault();
            //     $('#rule-modal').modal({
            //         // width: view_width-20,
            //         //heitht: "100%",
            //         toggle: true
            //     });
            //     //$('#rule-modal').modal('toggle');

            // });
        };
        //viewport3洲选择页
        var statePage = function() {
            $('#viewport3').removeClass('am-hide').addClass('am-block');
            $('body').css({
                "background": "#d1e5e9"
            });

            $.ajax({
                beforeSend: function() {$.AMUI.progress.set(0.6);},
                complete: function() {$.AMUI.progress.done(true);},
                url: BASE_URL+'/getStateFlag',
                async: true,
                type: 'POST',
                dataType: 'JSON',
                data: {},
            })
            .done(function(back) {
                //console.log(back)
                lockInit(back);
            });
            
            // $('#step-bg').attr('src', 'i/step1.png');
            // $('#step-lock1').css({
            //     "position": "relative",
            //     "top": "-18rem",
            //     "left": "10rem",
            //     "width": "2rem"
            // });
            
            var lockInit = function(back){
                // var back = {"asia":1, "eur":1, "na":1, "sa":1};
                if (back["asia"]==1 && back.eur==0 && back.na==0 && back.sa==0) {
                    var view_width = document.documentElement.clientWidth/10;
                    var img_height = view_width - 2.4;
                    var lock1x = img_height * 0.3;
                    var lock1y = -img_height * 0.6;
                    var htmlstr = '<img src="i/step1.png" class="am-img-responsive am-center" alt=""/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock1y+'rem; left:'+lock1x+'rem; width:2rem; height:2rem;" alt="1"/>';

                    
                } else if (back.asia==1 && back.eur==1 && back.na==0 && back.sa==0) {
                    var view_width = document.documentElement.clientWidth/10;
                    var img_height = view_width - 2.4;
                    var lock1x = img_height * 0.3;
                    var lock1y = -img_height * 0.6;
                    var lock2x = img_height * 0.12 - 2;
                    var lock2y = -img_height * 0.65;
                    var htmlstr = '<img src="i/step2.png" class="am-img-responsive am-center" alt=""/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock1y+'rem; left:'+lock1x+'rem; width:2rem; height:2rem;" alt="1"/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock2y+'rem; left:'+lock2x+'rem; width:2rem; height:2rem;" alt="2"/>';

                } else if (back.asia==1 && back.eur==1 && back.na==1 && back.sa==0) {
                    var view_width = document.documentElement.clientWidth/10;
                    var img_height = view_width - 2.4;
                    var lock1x = img_height * 0.3;
                    var lock1y = -img_height * 0.6;
                    var lock2x = img_height * 0.12 - 2;
                    var lock2y = -img_height * 0.65;
                    var lock3x = img_height * 0.7 - 4;
                    var lock3y = -img_height * 0.65;
                    var htmlstr = '<img src="i/step3.png" class="am-img-responsive am-center" alt=""/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock1y+'rem; left:'+lock1x+'rem; width:2rem; height:2rem;" alt="1"/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock2y+'rem; left:'+lock2x+'rem; width:2rem; height:2rem;" alt="2"/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock3y+'rem; left:'+lock3x+'rem; width:2rem; height:2rem;" alt="3"/>';

                } else if (back.asia==1 && back.eur==1 && back.na==1 && back.sa==1) {
                    var view_width = document.documentElement.clientWidth/10;
                    var img_height = view_width - 2.4;
                    var lock1x = img_height * 0.3;
                    var lock1y = -img_height * 0.6;
                    var lock2x = img_height * 0.12 - 2;
                    var lock2y = -img_height * 0.65;
                    var lock3x = img_height * 0.7 - 4;
                    var lock3y = -img_height * 0.65;
                    var lock4x = img_height * 0.8 - 6;
                    var lock4y = -img_height * 0.45;
                    var htmlstr = '<img src="i/step4.png" class="am-img-responsive am-center" alt=""/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock1y+'rem; left:'+lock1x+'rem; width:2rem; height:2rem;" alt="1"/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock2y+'rem; left:'+lock2x+'rem; width:2rem; height:2rem;" alt="2"/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock3y+'rem; left:'+lock3x+'rem; width:2rem; height:2rem;" alt="3"/>'
                        +'<img class="step-lock" src="i/yellowLock.png" style="position:relative; top:'+lock4y+'rem; left:'+lock4x+'rem; width:2rem; height:2rem;" alt="4"/>';

                };
                $('#step-container').html(htmlstr);
                lockClick();
                clickStart();
            };

            var lockClick = function(argument) {
                $('.step-lock').off('click').on('click', function(event) {
                    event.preventDefault();
                    clickState = $(this).attr('alt');
                    //console.log(clickState)
                    // $(this).attr('src', 'i/inputBg.png').siblings('.step-lock').attr('src', 'i/yellowLock.png');
                    $(this).css({
                        opacity: 0
                    }).siblings('.step-lock').css({
                        opacity: 1
                    });
                });
            };
            
            var clickStart = function(argument) {
                $('#start-state-btn').off('click').on('click', function(event) {
                    event.preventDefault();
                    if (clickState > 0) {
                        $('#viewport3').removeClass('am-block').addClass('am-hide');
                        selectStatePage();
                    } else {
                        $('#alert-modal').modal('toggle');
                        $('#alert-content').html('选择您要开启<br>旅行的大洲');
                        setTimeout(function() {
                            $('#alert-modal').modal('close');
                        }, 2000)
                    }
                });
            };

            // lockInit();
        };
        //viewport4洲引导页
        var selectStatePage = function(argument) {
            var htmlstr = '';

            if (clickState == 1) {
                htmlstr = '<div class="am-margin-top-sm">'
                    +'<h1 class="am-text-center am-margin-bottom-0">亚洲站</h1>'
                    +'<h3 class="am-text-center am-margin-top-0">古老文明 神奇秘境</h3>'
                +'</div>'
                +'<section class="am-margin-top-sm am-margin-left-xl am-margin-right-xl">'
                    +'<img src="i/asia.png" class="am-img-responsive am-center" alt=""/>'
                +'</section>'
                +'<div class="am-margin-top-sm">'
                    +'<h3 class="am-text-center am-margin-bottom-xs">全新途胜与你一起掌控自由本能</h3>'
                    +'<p class="am-text-center  am-margin-top-0 am-text-sm">1.6T涡轮发动机带你翻越喜马拉雅去探险<br>超大空间为你装下东方大陆无数文明故事<br>安全操控伴你穿越时光重走丝绸之路<br>风尚外形让你与经典一起吸引世界目光</p>'
                +'</div>';
            } else if (clickState == 2) {
                htmlstr = '<div class="am-margin-top-sm">'
                    +'<h1 class="am-text-center am-margin-bottom-0">欧洲站</h1>'
                    +'<h3 class="am-text-center am-margin-top-0">时尚都会 世界焦点</h3>'
                +'</div>'
                +'<section class="am-margin-top-sm am-margin-left-xl am-margin-right-xl">'
                    +'<img src="i/europe.png" class="am-img-responsive am-center" alt=""/>'
                +'</section>'
                +'<div class="am-margin-top-sm">'
                    +'<h3 class="am-text-center am-margin-bottom-xs">全新途胜与你一起掌控自由本能</h3>'
                    +'<p class="am-text-center  am-margin-top-0 am-text-sm">1.6T涡轮发动机带你探秘西西里净土<br>超大空间为你装下爱琴海最美的落日<br>安全操控让阿尔卑斯山探险之旅无所畏惧<br>风尚外形让你成为米兰顶级时尚T台的宠儿</p>'
                +'</div>';
            } else if (clickState == 3) {
                htmlstr = '<div class="am-margin-top-sm">'
                    +'<h1 class="am-text-center am-margin-bottom-0">北美洲站</h1>'
                    +'<h3 class="am-text-center am-margin-top-0">自由大陆 摩登牛仔</h3>'
                +'</div>'
                +'<section class="am-margin-top-sm am-margin-left-xl am-margin-right-xl">'
                    +'<img src="i/northAmerica.png" class="am-img-responsive am-center" alt=""/>'
                +'</section>'
                +'<div class="am-margin-top-sm">'
                    +'<h3 class="am-text-center am-margin-bottom-xs">全新途胜与你一起掌控自由本能</h3>'
                    +'<p class="am-text-center  am-margin-top-0 am-text-sm">1.6T涡轮发动机带你穿越阿拉斯加遇见极光<br>超大空间为你装下从落基山的万种风情<br>安全操控守护你安心向前探寻百慕大三角<br>风尚外形与你一起站在时代广场接受膜拜</p>'
                +'</div>';
            } else if (clickState == 4) {
                htmlstr = '<div class="am-margin-top-sm">'
                    +'<h1 class="am-text-center am-margin-bottom-0">南美洲站</h1>'
                    +'<h3 class="am-text-center am-margin-top-0">奇妙雨林 未解之谜</h3>'
                +'</div>'
                +'<section class="am-margin-top-sm am-margin-left-xl am-margin-right-xl">'
                    +'<img src="i/southAmerica.png" class="am-img-responsive am-center" alt=""/>'
                +'</section>'
                +'<div class="am-margin-top-sm">'
                    +'<h3 class="am-text-center am-margin-bottom-xs">全新途胜与你一起掌控自由本能</h3>'
                    +'<p class="am-text-center  am-margin-top-0 am-text-sm">1.6T涡轮发动机带你探索神奇雨林<br>超大空间为你装下矿业草原的万种风情<br>安全操控让你放心探索复活节岛的神秘<br>峰尚外形最懂你驰骋在高原上那颗拉风的心</p>'
                +'</div>';
            };

            $('#viewport4').removeClass('am-hide').addClass('am-block').html(htmlstr);

            $.ajax({
                beforeSend: function() {$.AMUI.progress.set(0.6);},
                complete: function() {$.AMUI.progress.done(true);},
                url: BASE_URL+'/getQuestionList',
                type: 'POST',
                dataType: 'JSON',
                data: {state: clickState},
            })
            .done(function(back) {
                stateQuestionList = back;
                var cache_first = new Image();
                cache_first.src = stateQuestionList.data[0].img_path;

                setTimeout(function() {
                    $('#viewport4').removeClass('am-block').addClass('am-hide');
                    questionListPage();
                }, 2000);
            });
        };
        //答题页开始viewport5
        var questionListPage = function(argument) {

            $('#viewport5').removeClass('am-hide').addClass('am-block');
            $('body').css({
                "background": "#d1e5e9"
            });
            var truenum = 0;
            var question_title = "亚洲站";
            var uspname = 'asia';
            allreadyAnswerObj.asia = [];
            if (stateQuestionList.data[0].state == 2) {
                question_title = "欧洲站";
                uspname = 'eur';
                allreadyAnswerObj.eur = [];
            } else if (stateQuestionList.data[0].state == 3) {
                question_title = "北美洲站";
                uspname = 'na';
                allreadyAnswerObj.na = [];
            } else if (stateQuestionList.data[0].state == 4) {
                question_title = "南美洲站";
                uspname = 'sa';
                allreadyAnswerObj.sa = [];
            };
            $('#state-title').html(question_title);
            //初始化保存答题数据对象

            //利用local storeage纪录是否是第一次玩显示阴道页
            if (checkStore) {
                if (!store.get('first_play')) {
                    $('#guide-popup').modal('open');
                    $('#guide-popup').off('click').on('click', function(event) {
                        event.preventDefault();
                        $('#guide-popup').modal('toggle');
                    });
                    store.set('first_play', true)
                }
            } else {
                if (checkFirstPlay) {
                    $('#guide-popup').modal('open');
                    $('#guide-popup').off('click').on('click', function(event) {
                        event.preventDefault();
                        $('#guide-popup').modal('toggle');
                    });
                    checkFirstPlay = false;
                };
            };

            //当前第几题
            var current_question_num = 0;
            //答题页初始化
            var initQuestionPage = function(argument) {
                if (current_question_num < stateQuestionList.data.length) {
                    //后面还有题生成答题页
                    var indexImg = current_question_num + 1;
                    if (indexImg < stateQuestionList.data.length) {
                        var cache_first = new Image();
                        cache_first.src = stateQuestionList.data[indexImg].img_path;
                    };
                    
                    $('.questionImgBg').html('<div class="am-circle-bugfix" style="overflow:hidden;"><img src="'+stateQuestionList.data[current_question_num].img_path+'" class="am-img-responsive am-circle am-circle-bugfix am-center" alt="" /></div>');

                    var html_answer = '';
                    for (var i = 0; i < stateQuestionList.data[current_question_num].answer.length; i++) {
                        html_answer += '<span class="answerInput qaclick">'+stateQuestionList.data[current_question_num].answer[i]+'</span>';
                    };

                    $('#answer-container').html(html_answer).attr({
                        "data-real" : stateQuestionList.data[current_question_num].answer.join(''),
                        "data-id" : stateQuestionList.data[current_question_num].id,
                        "data-type" : stateQuestionList.data[current_question_num].type
                    });

                    var html_question1 = '',
                    html_question2 = '';
                    for (var j = 0; j < stateQuestionList.data[current_question_num].stem.length; j++) {
                        if (j < 7) {
                            html_question1 += '<span class="questionBg">'+stateQuestionList.data[current_question_num].stem[j]+'</span>';
                        } else {
                            html_question2 += '<span class="questionBg">'+stateQuestionList.data[current_question_num].stem[j]+'</span>';
                        }
                    };

                    $('#qustion-container1').html(html_question1);
                    $('#qustion-container2').html(html_question2);

                    //生成完答题页后的操作
                    pageClick();
                } else {
                    //最后一题答完去导出分析报告、去其他站页
                    $('#viewport5').removeClass('am-block').addClass('am-hide');
                    var type = checkTrue?'next':'replay';
                    outputResultPage(type);
                }
            };
            //答题页面操作事件
            var pageClick = function(argument) {
                $('#answer-container span').off('click').on('click', function(event) {
                    event.preventDefault();
                    if (!$(this).hasClass('qaclick')) {
                        $(this).addClass('qaclick');
                        var click_text = $(this).text();
                        $('.questionBg').filter(function() {
                            if ($(this).text() == click_text) {
                                return true;
                            }
                        }).removeClass('qaclick');

                    };
                });

                $('.questionBg').off('click').on('click', function(event) {
                    event.preventDefault();
                    if (!$(this).hasClass('qaclick')) {
                        var click_text = $(this).text();
                        var answer_span = $('#answer-container span');
                        $(this).addClass('qaclick');
                        for (var i = 0; i < answer_span.length; i++) {
                            if (answer_span.eq(i).hasClass('qaclick')) {
                                answer_span.eq(i).removeClass('qaclick').text(click_text);

                                var next_lock = true;
                                var input_text = '';
                                for (var n = 0; n < answer_span.length; n++) {
                                    input_text += answer_span.eq(n).text();
                                    if (answer_span.eq(n).hasClass('qaclick')) {
                                        next_lock = false;
                                        break;
                                    };
                                };
                                //全部填完时操作
                                if (next_lock) {
                                    
                                    if (stateQuestionList.data[0].state == 1) {
                                        allreadyAnswerObj.asia.push({
                                            "id": $('#answer-container').attr('data-id'),
                                            "type": $('#answer-container').attr('data-type'),
                                            "res": (input_text==$('#answer-container').attr('data-real') ? 1 : 0)
                                        });
                                    } else if (stateQuestionList.data[0].state == 2) {
                                        allreadyAnswerObj.eur.push({
                                            "id": $('#answer-container').attr('data-id'),
                                            "type": $('#answer-container').attr('data-type'),
                                            "res": (input_text==$('#answer-container').attr('data-real') ? 1 : 0)
                                        });
                                    } else if (stateQuestionList.data[0].state == 3) {
                                        allreadyAnswerObj.na.push({
                                            "id": $('#answer-container').attr('data-id'),
                                            "type": $('#answer-container').attr('data-type'),
                                            "res": (input_text==$('#answer-container').attr('data-real') ? 1 : 0)
                                        });
                                    } else if (stateQuestionList.data[0].state == 4) {
                                        allreadyAnswerObj.sa.push({
                                            "id": $('#answer-container').attr('data-id'),
                                            "type": $('#answer-container').attr('data-type'),
                                            "res": (input_text==$('#answer-container').attr('data-real') ? 1 : 0)
                                        });
                                    };
                                    console.log(uspname + parseInt(Math.random()*4))
                                    //在4、8、12、16弹出ups
                                    if (current_question_num==3 || current_question_num==7 || current_question_num==11 || current_question_num==15) {
                                        
                                        var imgname = uspname + parseInt(Math.random()*4);
                                        
                                        $('#usp-img-box').attr("src",'i/'+imgname+'.png');
                                        $('#usp-modal').modal('toggle');

                                        setTimeout(function(){
                                            $('#usp-modal').modal('close');
                                        }, 2000);
                                    };

                                    if (input_text == $('#answer-container').attr('data-real')) {
                                        //进入下一题并记分
                                        truenum++;
                                        setTimeout(function(){
                                            current_question_num++;
                                            initQuestionPage();

                                            if (truenum < 10) {
                                                $('#true-num').html('0'+truenum);
                                            } else {
                                                $('#true-num').html(truenum);
                                            }
                                        }, 1000)

                                        checkTrue = true;
                                    } else {
                                        //弹出错误2秒后进入下一题
                                        if (current_question_num==3 || current_question_num==7 || current_question_num==11 || current_question_num==15) {
                                            current_question_num++;
                                            initQuestionPage();
                                        } else {
                                            $('#error-popup').modal('toggle');
                                            $('#error_gif').attr('src', 'i/error.gif');
                                            $('#error-popup').off('close.modal.amui').on('close.modal.amui', function(event) {
                                                event.preventDefault();
                                                current_question_num++;
                                                initQuestionPage();
                                            });

                                            setTimeout(function(){
                                                $('#error-popup').modal('close');
                                            }, 2000);
                                        }
                                    }
                                };
                                break;
                            }
                        };
                    };
                });
            };
            initQuestionPage();
        };

        //viewport6分析报告或者去其他站
        var outputResultPage = function(type) {
            $('body').css({
                "background": "url(./i/bg.png) no-repeat left top",
                "-moz-background-size": "100% 100%",
                "background-size": "100% 100%"
            });
            $('#viewport6').removeClass('am-hide').addClass('am-block');
            var view_width = document.documentElement.clientWidth/10;

            var htmlstr = '<div class="am-g am-margin-top-xl am-padding-xl am-padding-top-0" style="height:'+(view_width+4)+'rem; background: url(./i/roundBg.png) no-repeat -2rem top;-moz-background-size: '+(view_width+4)+'rem '+(view_width+4)+'rem;background-size: '+(view_width+4)+'rem '+(view_width+4)+'rem;">'
                +'<img src="i/outputtext.png" class="am-img-responsive" style="margin-top:0;" alt="" />'
                +'<img id="output-result" src="i/analyseResult.png" class="am-img-responsive am-center" style="margin-top:3rem;" width="180px" alt="" />'
                +'<img id="go-other" src="i/other.png" class="am-img-responsive am-center" style="margin-top:2rem;margin-bottom:4rem;" width="180px" alt="" /></div>';

            $('#viewport6').html(htmlstr);

            $('#output-result').off('click').on('click', function(event) {
                event.preventDefault();
                //console.log(allreadyAnswerObj)
                if (type == 'replay') {
                    $('#viewport6').removeClass('am-block').addClass('am-hide');
                    resultPage('replay');
                } else {
                    $.ajax({
                        beforeSend: function() {$.AMUI.progress.set(0.6);},
                        complete: function() {$.AMUI.progress.done(true);},
                        url: BASE_URL+'/getReport',
                        type: 'POST',
                        dataType: 'JSON',
                        data: allreadyAnswerObj
                    })
                    .done(function(back) {
                        $('#viewport6').removeClass('am-block').addClass('am-hide');
                        resultPage('next', back);
                    });
                }
            });

            $('#go-other').off('click').on('click', function(event) {
                event.preventDefault();
                $('#viewport6').removeClass('am-block').addClass('am-hide');
                statePage();
            });
        };

        //分析报告viewport7
        var resultPage = function(type, back) {
            var view_width = document.documentElement.clientWidth/10;
            var xy = (view_width+4)+'rem '+(view_width+4)+'rem';

            $('#viewport7').removeClass('am-hide').addClass('am-block').css({
                "background": "url(../i/roundBg.png) no-repeat -2rem 6rem",
                "-moz-background-size": xy,
                "background-size": xy
            });

            var htmlstr = '';
            var replaybox = view_width-4.8;
            if (type == 'replay') {
                htmlstr = '<div class="am-g am-g-collapse am-g-fixed">'
                    +'<div class="am-u-sm-12"><h2 class="am-margin-0">全新途胜自由本能分析报告</h2></div>'
                        +'<div class="am-u-sm-8">'
                        +'<div class="am-u-sm-12"><p class="am-margin-0">你一共猜对了0个地方</p></div>'
                            +'<div class="am-u-sm-12"><h2 class="am-margin-0">你的自由指数是</h2></div>'
                        +'</div>'
                        +'<div class="am-u-sm-4"><h1 class="am-text-xxl am-margin-0">0%</h1></div>'
                    +'</div>'
                    +'<div class="am-g am-padding" style="height: '+replaybox+'rem;background: url(./i/resultBg.png) no-repeat left top;-moz-background-size: 100% 100%;background-size: 100% 100%;">'
                        +'<button id="replay-btn" type="button" class="am-btn am-radius am-btn-secondary am-center am-margin-top-xl">重玩一次</button>'
                    +'</div>';

                $('#viewport7').html(htmlstr);
                $('#replay-btn').off('click').on('click', function(event) {
                    event.preventDefault();
                    $('#viewport7').removeClass('am-block').addClass('am-hide');
                    selectStatePage();
                });
            } else {
                // var back = {" msg":1,"data":[{"type":2,"correct_num":12,"correct_percent":"40%"}]};
                htmlstr = '<div class="am-g am-g-collapse am-g-fixed">'
                    +'<div class="am-u-sm-12"><h2 class="am-margin-0">全新途胜自由本能分析报告</h2></div>'
                        +'<div class="am-u-sm-8">'
                        +'<div class="am-u-sm-12"><p class="am-margin-0">你一共猜对了'+back.data.correct_num+'个地方</p></div>'
                            +'<div class="am-u-sm-12"><h2 class="am-margin-0">你的自由指数是</h2></div>'
                        +'</div>'
                        +'<div class="am-u-sm-4"><h1 class="am-text-xxl am-margin-0">'+back.data.correct_percent+'</h1></div>'
                    +'</div>'
                    +'<div class="am-g am-padding" style="background: url(./i/resultBg.png) no-repeat left top;-moz-background-size: 100% 100%;background-size: 100% 100%;">'
                        +'<img id="go-other" src="'+back.report+'" class="am-img-responsive am-center" style="margin-top:2rem;margin-bottom:4rem;" alt="" />'
                        // +'<h1 class="am-margin-bottom-0">你崇尚自由的时尚</h1>'
                        // +'<p class="am-margin-top-0">全宽限制最大宽度的行全宽限制最大宽度的行全宽限制最大宽度的行全宽限制最大宽度的行全宽限制最大宽度的行全宽限制最大宽度的行全宽限制最大宽度的行全宽限制最大宽度的行</p>'
                    +'</div>'
                    +'<div class="am-container am-margin-top">'
                        +'<div class="am-g am-g-collapse am-g-fixed">'
                            +'<div class="am-u-sm-5" id="share-btn"><img src="i/share1.png" class="am-img-responsive am-center" alt="" /></div>'
                            +'<div class="am-u-sm-2"></div>'
                            +'<div class="am-u-sm-5" id="lottery-btn"><img src="i/lottery.png" class="am-img-responsive am-center" alt="" /></div>'
                        +'</div>'
                    +'</div>';

                $('#viewport7').html(htmlstr);
                //存储给出的分享标题
                //shareTitle = back.title;
                var fuck = '亚洲';
                if (clickState == 2) {
                    fuck = '欧洲';
                } else if (clickState == 3) {
                    fuck = '北美州';
                } else if (clickState == 4) {
                    fuck = '南美洲';
                };

                shareTitle = '我的内心渴望追求时尚的自由，'+fuck+'是我的福地，你敢来测么？';
                if (back.data.type == 2) {
                    shareTitle = '我的内心渴望追求享受的自由，'+fuck+'是我的福地，你敢来测么？';
                } else if (back.data.type == 3) {
                    shareTitle = '我的内心渴望追求沉稳的自由，'+fuck+'是我的福地，你敢来测么？';
                } else if (back.data.type == 4) {
                    shareTitle = '我的内心渴望追求进取的自由，'+fuck+'是我的福地，你敢来测么？';
                };

                $('#share-btn').on('click', function(event) {
                    event.preventDefault();
                    sharePage();
                });

                $('#lottery-btn').on('click', function(event) {
                    event.preventDefault();
                    $('#viewport7').removeClass('am-block').addClass('am-hide');
                    userInfoPage();
                });
            }
        };



        //USP页渲染
        var uspViewPage = function(state_now) {
            
        };

        //redpack红包
        var redPackPage = function(name, phone) {
            var view_width = document.documentElement.clientWidth/10;
            var xy = (view_width+4)+'rem '+(view_width+4)+'rem';
            $('#viewport9').removeClass('am-hide').addClass('am-block').css({
                "background": "url(../i/roundBg.png) no-repeat -2rem 6rem",
                "-moz-background-size": xy,
                "background-size": xy
            });

            $('#open-redpack').off('click').on('click', function(event) {
                event.preventDefault();
                $('#redpack-box').addClass('am-animation-shake');
                $.ajax({
                    beforeSend: function() {$.AMUI.progress.set(0.6);},
                    complete: function() {$.AMUI.progress.done(true);},
                    url: BASE_URL+'/prize',
                    type: 'POST',
                    dataType: 'JSON',
                    data: {
                        name: name,
                        mobile: phone,
                        is_zero: (checkTrue?0:1)
                    },
                })
                .done(function(back) {
                    if (back.msg == 1) {
                        var htmlstr = '';
                        if (back.data == 0) {
                            htmlstr = '<h2 class="am-margin-bottom-0 am-margin-top-lg am-text-center">恭喜您获得</h2>'
                                +'<h2 class="am-margin-bottom-0 am-margin-top-0 am-text-center">全新途胜VIP试驾券</h2>'
                                +'<h2 class="am-margin-bottom-0 am-margin-top-sm am-text-center try-drive" id="click_try"><a href="http://allnewtucson.beijing-hyundai.com.cn/vipdrive" target="_blank">点击进入 试驾预约</a></h2>'
                                +'<p class="am-text-center am-margin-top-xs"><button type="submit" id="share-redpack" class="am-btn am-btn-default" style="padding: 0px; border: none;"><img src="i/share2.png" class="am-img-responsive am-center" width="160px" alt="" /></button></p>'
                                +'<p class="am-text-center am-margin-0 am-text-xs">活动主办方工作人员会在活动结束后联系您,方便您领取奖品</p>';
                                shareTitle = '我获得了全新途胜VIP试驾券！一起释放你的自由本能吧！';

                                $('#redpack-box').html(htmlstr);

                                // $('#click_try').off('click').on('click', function(event) {
                                //     event.preventDefault();
                                //     tryDrive();
                                // });
                                
                        } else if (back.data == -1) {
                            htmlstr = '<h2 class="am-margin-bottom-0 am-margin-top-lg am-text-center">谢谢参与</h2>'
                                +'<h2 class="am-margin-bottom-xl am-margin-top-0 am-text-center">邀请小伙伴们一起来玩吧</h2>'
                                +'<p class="am-text-center"><button type="submit" id="share-redpack" class="am-btn am-btn-default" style="padding: 0px; border: none; margin-bottom:4rem;"><img src="i/share3.png" class="am-img-responsive am-center" width="160px" alt="" /></button></p>';

                                $('#redpack-box').html(htmlstr);
                        } else {
                            htmlstr = '<h2 class="am-margin-bottom-0 am-margin-top-lg am-text-center">恭喜您中了</h2>'
                                +'<h2 class="am-margin-bottom-0 am-margin-top-0 am-text-center">'+(back.data==1?'一等奖':(back.data==2?'二等奖':'三等奖'))+'</h2>'
                                +'<h2 class="am-margin-bottom-0 am-margin-top-0 am-text-center">邀请小伙伴们一起来玩吧</h2>'
                                +'<p class="am-text-center"><button type="submit" id="share-redpack" class="am-btn am-btn-default" style="padding: 0px; border: none;"><img src="i/share2.png" class="am-img-responsive am-center" width="160px" alt="" /></button></p>'
                                +'<p class="am-text-center am-margin-0 am-text-xs">活动主办方工作人员会在活动结束后联系您,方便您领取奖品</p>'
                                shareTitle = '我中了'+(back.data==1?'一等奖':(back.data==2?'二等奖':'三等奖'))+'！自由本能世界之旅让你的梦想成真！';

                                $('#redpack-box').html(htmlstr);
                        };

                        

                        $('#share-redpack').off('click').on('click', function(event) {
                            event.preventDefault();
                            sharePage();
                        });
                    } else {
                        alert(back.data);
                    }
                });
                
            });

        };

        //试乘试驾留资夜
        var tryDrive = function (argument) {
            $('#trydrive-popup').modal('toggle');
            // 设置参数
            $('#region select').selected({
                //btnWidth: '300px',
                btnSize: 'sm',
                //btnStyle: 'primary',
                maxHeight: '150px',
                searchBox: true,
                dropUp: 1
            }).on('change', function() {
                $('#js-selected-info').html([
                    [$(this).find('option').eq(this.selectedIndex).text()],
                    $(this).val(),
                ].join(''));
            });

            $('#car_shop select').selected({
                //btnWidth: '300px',
                btnSize: 'sm',
                //btnStyle: 'primary',
                maxHeight: '150px',
                searchBox: true,
                dropUp: 1
            });

            $('#save-trydrive').off('click').on('click', function(event) {
                event.preventDefault();
                var name = $('#try-name').val();
                var phone = $('#try-phone').val();
                var sex = $('input[name=radio10]').val();
                var region = $('#region select').find('option').eq(1).attr('selected', true).val();
                var shop = $('#car_shop select').find('option').eq(1).attr('selected', true).val();

                if (name && /^1\d{10}$/.test(phone) && region && shop) {
                    $.ajax({
                        beforeSend: function() {$.AMUI.progress.set(0.6);},
                        complete: function() {$.AMUI.progress.done(true);},
                        url: BASE_URL+'/saveUser',
                        type: 'POST',
                        dataType: 'JSON',
                        data: {
                            name: name,
                            mobile: phone,
                            address: address
                        },
                    })
                    .done(function(back) {
                        if (back.msg == 1) {
                            $('#viewport8').removeClass('am-block').addClass('am-hide');
                            redPackPage(name, phone);
                        } else {
                            alert(back.data);
                        }
                    });
                    
                } else {
                    if (!name) {
                        alert('请输入姓名');
                    } else if (!/^1\d{10}$/.test(phone)) {
                        alert('请输入正确手机号');
                    } else if (!region) {
                        alert('请选择城市');
                    } else if (!shop) {
                        alert('请选择试驾4S店');
                    }
                };
            });
        };

        //share分享
        var sharePage = function(title) {
            var ua = window.navigator.userAgent.toLowerCase();

            if (ua.match(/MicroMessenger/i) == 'micromessenger') {
                shareData.title = shareTitle;
                document.title = shareTitle;
                // shareData.imgUrl = "";
                shareData.desc = shareTitle;
                $('#share-modal').modal('toggle');
                
            } else {
                $('#alert-modal').modal('toggle');
                $('#alert-content').html('请根据你的浏览器选择分享方式');
                document.title = shareTitle;
            };
        };

        //留资
        var userInfoPage = function(argument) {

            var view_width = document.documentElement.clientWidth/10;
            var xy = (view_width+4)+'rem '+(view_width+4)+'rem';
            $('#viewport8').removeClass('am-hide').addClass('am-block').css({
                "background": "url(../i/roundBg.png) no-repeat -2rem 6rem",
                "-moz-background-size": xy,
                "background-size": xy
            });

            $('#save-userinfo').off('click').on('click', function(event) {
                event.preventDefault();
                var name = $('#doc-ipt-name').val();
                var phone = $('#doc-ipt-phone').val();
                var address = $('#doc-ipt-address').val();
                if (name && /^1\d{10}$/.test(phone)) {
                    $.ajax({
                        beforeSend: function() {$.AMUI.progress.set(0.6);},
                        complete: function() {$.AMUI.progress.done(true);},
                        url: BASE_URL+'/saveUser',
                        type: 'POST',
                        dataType: 'JSON',
                        data: {
                            name: name,
                            mobile: phone,
                            address: address
                        },
                    })
                    .done(function(back) {
                        if (back.msg == 1) {
                            $('#viewport8').removeClass('am-block').addClass('am-hide');
                            redPackPage(name, phone);
                        } else {
                            alert(back.data);
                        }
                    });
                    
                } else {
                    if (!name) {
                        alert('请输入姓名');
                    } else if (!/^1\d{10}$/.test(phone)) {
                        alert('请输入正确手机号');
                    };
                };
            });
        };

        return {
            init : function(){
                loading();
                //selectStatePage();
                //questionListPage();
                // outputResultPage('replay');
                //userInfoPage();
                //redPackPage();
                // sharePage();
                //tryDrive();
            }
        };
    };

    tusheng2015().init();
  // $('#browser-info').append('浏览器信息：<pre>' +
  //   JSON.stringify(detector.browser) +
  //   '</pre>'
  // );

  // addToHome();
});
