function addDiagnosis() {
    var div = $(".diagnosis-default").clone(true, true);
    div[0].style.display = "flex";
    div[0].classList.remove("diagnosis-default");
    div[0].classList.add("diagnosis");

    var select = div.find("select");
    select.selectpicker();

    $("form")[0].insertBefore(div[0], $(".addDiagnosis")[0]);
}

function addTreatment() {
    var div = $(".treatment-default").clone(true, true);
    div[0].style.display = "flex";
    div[0].classList.remove("treatment-default");
    div[0].classList.add("treatment");

    var select = div.find("select");
    select.selectpicker();

    $(".addTreatment").before(div);
}

function deleteDiv(node) {
    node.parentElement.remove();
}

function addNewDiagnosis(node) {
    if (node.options[node.selectedIndex].value != 'addNew') {
        return;
    }

    var input = document.createElement("INPUT");
    input.name = "newDiagnosis";

    node.parentNode.parentNode.insertBefore(input, node.parentNode);
    node.parentNode.remove();
}

function addNewTreatment(node) {
    if (node.options[node.selectedIndex].value != 'addNew') {
        return;
    }

    var input = document.createElement("INPUT");
    input.name = "newTreatments";

    var inputs = node.parentNode.parentNode.getElementsByTagName("input");
    inputs[0].name = "newDay";
    inputs[1].name = "newTime";
    inputs[2].name = "newAmount";

    node.parentNode.parentNode.insertBefore(input, node.parentNode);
    node.parentNode.remove();
}

function inqueueClick() {
    if ($("#inqueue").prop("checked")) {
        $("#urgent").show();
    }
    else {
        $("#urgent").hide();
    }
}
