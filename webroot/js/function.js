//login
document.getElementById("loginDialog_btnLogin").onclick = function () {
    var xhr = new XMLHttpRequest();    //!!Ҫ����Զ���ȡ��ַ + �򻯴���
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
    // ��֧��FormData��������Ĵ��� 
    if (typeof FormData == "undefined") {
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    }
    var data = { user: document.getElementById("username"), pwd: document.getElementById("password") };
    xhr.send(postDataFormat(data));
}



//by http://www.cnblogs.com/yuanke/p/4998516.html
// ��ʽ��post ���ݵ�����
function postDataFormat(obj) {
    if (typeof obj != "object") {
        alert("����Ĳ��������Ƕ���");
        return;
    }

    // ֧����FormData���������Firefox 4+ , Safari 5+, Chrome��Android 3+���Webkit��
    if (typeof FormData == "function") {
        var data = new FormData();
        for (var attr in obj) {
            data.append(attr, obj[attr]);
        }
        return data;
    } else {
        // ��֧��FormData��������Ĵ��� 
        var arr = new Array();
        var i = 0;
        for (var attr in obj) {
            arr[i] = encodeURIComponent(attr) + "=" + encodeURIComponent(obj[attr]);
            i++;
        }
        return arr.join("&");
    }
}