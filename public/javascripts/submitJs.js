// setTimeout(function () {
//   var popup = document.getElementById("popup");
//   if (popup) {
//     popup.style.display = "none";
//   }
// }, 3000);


var checkimg0 = () => {
  var filleinput = document.getElementById("0");
  var value = filleinput.files;
  if (value) {
    document.getElementById("n0").value = '0';
    console.log(value, "oihojhiiug");
  } else {
    document.getElementById("n0").value = "";
  }
};
var checkimg1 = () => {
  var filleinput = document.getElementById("1");
  var value = filleinput.files;
  if (value) {
    document.getElementById("n1").value = '1';
    console.log(value, "oihojh");
  } else {
    document.getElementById("n1").value = "";
  }
};
var checkimg2 = () => {
  var filleinput = document.getElementById("2");
  var value = filleinput.files;
  if (value) {
    document.getElementById("n2").value = "2";
    console.log(value, "oihojhii");
  } else {
    document.getElementById("n1").value = "";
  }
};
var checkimg3 = () => {
  var filleinput = document.getElementById("3");
  var value = filleinput.files.length;
  if (value) {
    document.getElementById("n3").value = '3';
    console.log(value,"oihojhiiug");
  } else {
    document.getElementById("n3").value = '';
  }
};
var check = () => {
  checkimg0();
  checkimg1();
  checkimg2();
  checkimg3();
}