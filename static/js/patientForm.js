$(document).ready(function() {
    $("#patientForm").submit(function() {
        var date = $(".date");
        var idn = $("#IDnumber").val();

        if (date[0].value.length * date[1].value.length != 64) {
            $("#date").html("日期格式需为形如yyyymmdd的八位数字，无法确定用00代替");
            return false;
        }

        if (idn.length != 18 && idn.length != 0) {
            return false;
        }
    });

    $("#IDnumber").blur(function() {
        var idn = $(this).val();

        if (idn.length != 18 && idn.length != 0) {
            $("#id").html("身份证格式不符合规范");
        }
        else {
            $("#id").html("");

            if (idn.length == 18) {
                if (parseInt(idn.substr(16, 1)) % 2 == 0) {
                    $("#female").prop("checked", true);
                }
                else {
                    $("#male").prop("checked", true);
                }

                $("#birthDate").val(idn.substr(6, 8));
            }
        }
    });
})

function inqueueClick() {
    if ($("#inqueue").prop("checked")) {
        $("#urgent").show();
    }
    else {
        $("#urgent").hide();
    }
}
