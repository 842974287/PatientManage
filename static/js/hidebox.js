function showbox() {
    var hideobj=document.getElementById("hidebg");
    hidebg.style.display="block"; //显示隐藏层
    hidebg.style.height=document.body.clientHeight+"px"; //设置隐藏层的高度为当前页面高度
    document.getElementById("hidebox").style.display="block"; //显示弹出层
}

function hidebox() {
    document.getElementById("hidebg").style.display="none";
    document.getElementById("hidebox").style.display="none";
}

function contact() {
    document.getElementById("hidebg").style.display="none";
    document.getElementById("hidebox").style.display="none";
    window.open("url");
}

function addChoice() {
    const len = $(".choice").length + 1;
    $("#choices").append("<div class=\"choice form-group\"><label for=\"choice_" +
    len + "\">选项" + len + "</label><input type=\"text\" class=\"form-control\" name=\"choice_" +
    len + "\" placeholder=\"选项" + len + "\"></div>");
}

$("form").submit(() => {
    $("#id").disable();
    return true;
})
