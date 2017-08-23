//login
document.getElementById("loginDialog_btnLogin").onclick = function () {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status == 200) {// 200 = OK
                var json = JSON.parse(xhr.responseText);
                if (json.isSuccess) {
                    window.location.href = "./manage.html"
                } else {
                    alert("Login unsuccessful: " + xhr.status + " " + xhr.responseText);
                }
            }
            else {
                alert("XHR Error: " + xhr.status + " " + xhr.responseText);
            }
        }
    }
    xhr.open("POST", "http://localhost:1337/api/auth/login", true);     //!!要设计自动获取地址
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user=" + encodeURIComponent(document.getElementById("username").value) + "&" +
        "pwd=" + encodeURIComponent(document.getElementById("password").value));
}



