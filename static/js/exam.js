function submitExam() {
    for (let dom of $(".ch:checked")) {
        if (dom.name != dom.value) {
            dom.parentNode.parentNode.getElementsByClassName("error")[0].style.display = "block";
        }
    }
}
