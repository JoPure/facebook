/**
 * Created by jo.chan on 2018/1/15.
 */

//作为全局变量,登录之后可以存储用户信息
var globalData = {
    userId: '',
    userName: '',
    token: '',
    activeTime: ''
};

//点击fb按钮,带上fbID及fb登录配置的回调地址
$('.fbBtn').on('click', function () {
    sessionStorage.setItem('facebook', 1);
    var random = Math.random() * 1000;
    var loginURL = "https://www.facebook.com/v2.6/dialog/oauth?client_id=" + pg_config.data.fbId
        + "&redirect_uri=" + encodeURIComponent(pg_config.api.fb_redirect_uri) + "&r=" + random;
    window.location.href = loginURL;
});

//页面初始化或者回调之后检查fb是否登录,
//     clientId: pg_config.data.appId,
//     redirectUrl: pg_config.api.fb_redirect_uri,
//     code: FB_CODE


function checkFBLogin() {
    var FB_CODE = $.trim(getParameterByName("code"));
    if (FB_CODE == "") {
        return;
    }
    var requestURL = pg_config.api.server + pg_config.api.fbLogin;
    $.ajax({
        type: "GET",
        async: true,
        url: requestURL,
        data: {
            clientId: pg_config.data.appId,
            redirectUrl: pg_config.api.fb_redirect_uri,
            code: FB_CODE
        },
        beforeSend: function () {
            $(".loadingBtn").show();
        },
        success: function (result) {
            $(".loadingBtn").hide();
            //登录成功后存储信息
            handleLogin(result);
        },
        error: function (err) {
            console.log(err);
        }
    });
}

//对code值编码
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
};


function handleLogin(result) {
    if (result.code == 200) {
        globalData.userId = result.state.userId;
        globalData.username = result.state.userName;
        globalData.token = result.state.token;
        localStorage.setItem('userId', result.state.userId);
        localStorage.setItem('username', result.state.userName);
        localStorage.setItem('token', result.state.token);
        var myTimer = new Date().getTime();
        globalData.activetime = myTimer;
        localStorage.setItem('activetime', myTimer);
        if (MyLocalStorage.getItem('facebook') == 1) {
            window.location.href = pg_config.api.fb_redirect_uri;
        }
    }
    else {
        //登录框提示登录失败原因
        $(".login-tip").show();
        $(".login-tip").text(pg_config.status[result.code]);
    }
}

$(function () {
    checkFBLogin();
});