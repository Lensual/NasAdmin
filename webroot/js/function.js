//login
document.getElementById("loginDialog_btnLogin").onclick = function () {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = login_xhrOnChange(xhr);
    xhr.open("POST", "http://localhost:1337/api/auth/login", true);     //!!要设计自动获取地址
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user=" + encodeURIComponent(document.getElementById("username").value) + "&" +
        "pwd=" + encodeURIComponent(document.getElementById("password").value));
}

function login_xhrOnChange(xhr) {
    if (xhr.readyState == 4) {// 4 = "loaded"
        if (xhr.status == 200) {// 200 = OK
            var json = JSON.parse(xhr.responseText);

            //alert(xhr.responseText);
        }
        else {
            alert("Login unsuccessful: " + xhr.status + " " + xhr.responseText);
        }
    }
}

