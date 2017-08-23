//login
document.getElementById("loginDialog_btnLogin").onclick = function () {
    var xhr = new XMLHttpRequest();    //!!要设计自动获取地址 + 简化代码
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status == 200) {// 200 = OK
                alert(xhr.responseText);
            }
            else {
                alert("Login unsuccessful: " + xhr.status + " " + xhr.statusText);
            }
        }
    }
    xhr.open("POST", "localhost:1337/api/auth/login", true);
    // 不支持FormData的浏览器的处理 
    if (typeof FormData == "undefined") {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    var data = { user: document.getElementById("username"), pwd: document.getElementById("password") };
    xhr.send(postDataFormat(data));
}



//by http://www.cnblogs.com/yuanke/p/4998516.html
// 格式化post 传递的数据
function postDataFormat(obj) {
    if (typeof obj != "object") {
        alert("输入的参数必须是对象");
        return;
    }

    // 支持有FormData的浏览器（Firefox 4+ , Safari 5+, Chrome和Android 3+版的Webkit）
    if (typeof FormData == "function") {
        var data = new FormData();
        for (var attr in obj) {
            data.append(attr, obj[attr]);
        }
        return data;
    } else {
        // 不支持FormData的浏览器的处理 
        var arr = new Array();
        var i = 0;
        for (var attr in obj) {
            arr[i] = encodeURIComponent(attr) + "=" + encodeURIComponent(obj[attr]);
            i++;
        }
        return arr.join("&");
    }
}