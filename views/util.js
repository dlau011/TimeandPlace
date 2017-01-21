/**
 * Created by Denise on 1/21/2017.
 */
function select(id) {
    var flag = $('#' + id).val();
    if (flag == "0") {
        $('#' + id).val = "1";
        $('#' + id).css("background-color", "red");
    } else {
        $('#' + id).val = "0";
        $('#' + id).css("background-color", "white");
    }
}