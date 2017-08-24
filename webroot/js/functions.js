var apiUrl = "http://localhost:1337/api";     //!!要设计自动获取地址
var sessionId;
//login
document.getElementById("loginDialog_btnLogin").onclick = function () {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status == 200) {// 200 = OK
                var json = JSON.parse(xhr.responseText);
                if (json.isSuccess) {
                    sessionId = json.sessionId;
                    getNavs();
                } else {
                    alert("Login unsuccessful: " + xhr.status + " " + xhr.responseText);
                }
            }
            else {
                alert("Login XHR Error: " + xhr.status + " " + xhr.responseText);
            }
        }
    }
    xhr.open("POST", apiUrl + "/auth/login", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user=" + encodeURIComponent(document.getElementById("username").value) + "&" +
        "pwd=" + encodeURIComponent(document.getElementById("password").value));
}

//getNavs
function getNavs() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status == 200) {// 200 = OK
                var json = JSON.parse(xhr.responseText);
                if (json.isSuccess) {
                    alert(json);
                } else {
                    alert("getNavs() Error: " + xhr.status + " " + xhr.responseText);
                }
            }
            else {
                alert("getNavs() XHR Error: " + xhr.status + " " + xhr.responseText);
            }
        }
    }
    xhr.open("GET", apiUrl + "/auth/permission", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Cookie", "connect.sid=" + sessionId);
    xhr.send();
}

