//login
document.getElementById("loginDialog_btnLogin").onclick = function () {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {// 4 = "loaded"
            if (xhr.status == 200) {// 200 = OK
                alert(xhr.responseText);
            }
            else {
                alert("Login unsuccessful: " + xhr.status + " " + xhr.statusText);
            }
        }
    }
    xhr.open("POST", "http://localhost:1337/api/auth/login", true);     //!!Ҫ����Զ���ȡ��ַ
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send("user=" + encodeURIComponent(document.getElementById("username").value) + "&" +
        "pwd=" + encodeURIComponent(document.getElementById("password").value));
}