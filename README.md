# facebook
关于facebook的一些登录及点赞操作
做下笔记如何建立一个Facebook App，并且让User授权应用程式，最后取得FB ID等参数来当会员资料或是参加活动的ID识别

不懂的可以在下面这个文档看下，有具体的操作跟api详细介绍
[facebook 插件文档 api] https://developers.facebook.com/docs/plugins/


# 1、facebook DEVELOPER申请身份
首先我们自己要是个Facebook App Developers，在facebook DEVELOPER申请身份，跟着流程走create new app
这里就不做截图跟流程示范了，注册完之后我们可以得到


- <code>App Name</code> :应用程式名称
- <code>App Namespace</code> :网址命名
- <code>Web Hosting </code> :如果你有自己的Web Hosting就不用勾选


# 2、fb应用编号配置
注册完成之后我们可以在应用的资料里得到类似密钥的两个值，
app_id和app_secret，这两个值是访问facebook url的必要参数；

![截图](https://github.com/JoPure/facebook/img/3.png)

- <code>app_id</code> :      应用编号
- <code>app_secret</code>  :  app密钥
- <code>redicrl_url</code> : 回调地址Oauth_url

Oauth_url:
还要对应用进行一些必要的设置，首先要设置访问facebook和facebook回调的域名，
回调域名为facebook回调当前站点的url，也就是我们的活动页地址
并且配置下白名单,里面为ip值（测试地址或者正式地址都可以），
多个逗号分隔，facebook会校验当前访问的域名解析后对应的ip是否在白名单里面；
如图：

![截图](https://github.com/JoPure/facebook/img/2.png)



接下来我们就得到了2个参数跟回调地址
就可以进行fb登录以及其他的操作啦，
如果还需要进行更高级的，可以查看facebook的api手册




# 2、fb登录
> 这里我们给出做fb js 逻辑的代码展示，html只是一个fb-btn图标，就不贴代码了
> 点击fb按钮登录跳转，在这个时候会进行fb授权登录，通过我们的appid跟回调地址，fb那边会进行校验跟账户匹配
> 然后授权登录成功后会返回到我们的活动页地址，进行checkFBLogin，带一个code值回到活动页来
```javascript
$('.fbBtn').on('click', function () {
    sessionStorage.setItem('facebook', 1);
    var random = Math.random() * 1000;
    var loginURL = "https://www.facebook.com/v2.6/dialog/oauth?client_id=" + pg_config.data.fb_app_id
        + "&redirect_uri=" + encodeURIComponent(pg_config.api.fb_redirect_uri) + "&r=" + random;
    window.location.href = loginURL;
});
```


```javascript
//fb回调后会带一个code值,页面初始化时，我们会调checkFBLogin
function checkFBLogin() {
    if (sessionStorage.facebook == 1) {
        sessionStorage.facebook = 0;
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
                handleLogin(result);
            },
            error: function (err) {
                console.log(err);
            }
        });
    }
}
```

```javascript
//登录成功后，
function handleLogin(result) {
    if (result.code == 200) {
    //这里是fb投放监控打点，可进行数据跟踪
       gtag('event', 'login success', {
            'event_category': 'login success_category',
            'event_label': 'login success_label'
        });
        fbq('track', 'Purchase');
        
        sessionStorage.setItem("facebook", 0);
        globalData.userId = result.state.userId;
        globalData.username = result.state.userName;
        globalData.token = result.state.token;
        MyLocalStorage.setItem('userId', result.state.userId);
        MyLocalStorage.setItem('username', result.state.userName);
        MyLocalStorage.setItem('token', result.state.token);
        var myTimer = new Date().getTime();
        globalData.activetime = myTimer;
        MyLocalStorage.setItem('activetime', myTimer);
        hideLogin();
        showChannel();
        loadGameZones();
        showMessage();
        if (localStorage.facebook == 1) {
            window.location.href = pg_config.api.fb_redirect_uri;
        }
    }
    else {
        $(".login-tip").show();
        $(".login-tip").text(pg_config.status[result.code]);
    }
}
```



# 2、fb分享api
[fb分享] https://developers.facebook.com/docs/plugins/share-button

# 3、fb点赞api  
[fb点赞] https://developers.facebook.com/docs/plugins/like-button

这里需要获取到该点赞引用的appId
> 主要代码

```javascript
//html 
<div class="fb-like-box">
                    <div class="step_1"></div>
                    <div class="fb-like-bg">
                        <!--todo  fb like-->
                        <div class="fb-like" style="position: absolute; top: 20%; right: 18%;"
                             data-href="https://www.facebook.com/DigitalDuel"
                             data-layout="button_count" data-action="like" data-size="large"
                             data-show-faces="false" data-share="false"></div>
                    </div>
                    <a class="fb btnFB" href="https://www.facebook.com/DigitalDuel" target="_blank"
                       onclick="fbq('track', 'AddToWishlist');"></a>
                </div>
```
```javascript
//js 文件里需要引用

function initFbZan() {
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.8&appId=" + pg_config.fb_app_id;
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

    window.fbAsyncInit = function () {
        FB.init({
            appId: pg_config.fb_app_id,
            xfbml: true,
            version: 'v2.4'
        });
    };
}

```

