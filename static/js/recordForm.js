$(document).ready(function () {

});

function addDiagnosis() {
    var div = $(".diagnosis-default")[0].cloneNode(true);

    div.style.display = "flex";
    div.classList.remove("diagnosis-default");
    div.classList.add("diagnosis");
    div.childNodes[3].removeAttribute("disabled");

    $("form")[0].insertBefore(div, $(".addDiagnosis")[0]);
}

function addTreatment() {
    var div = $(".treatment-default").clone(true);

    div.children("select").removeAttr("disabled");
    div.find("input").removeAttr("disabled");
    div.css("display", "flex");
    div.attr("class", "treatment input-group-prepend");

    $(".addTreatment").before(div);
}

function deleteDiv(node) {
    node.parentElement.remove();
}
