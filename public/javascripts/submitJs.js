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

const calculatTotal = (product) => {
  return product.reduce((total, product) => {
    const productTotal = product.product_id.price * product.quantity;
    return total + productTotal;
  }, 0);
}

const display = () => {
  
}

const change = (id) => {
  console.log("Function called");
  let hid = document.getElementById(id);
  console.log("Element:", hid);
  hid.classList.toggle("icon_heart_alt");
  hid.classList.toggle("icon_heart");
};

const changestar = (id) => {
  console.log("Function called");
  let instar = document.getElementById('instar');
  instar.value = id;

  for (let i = 1; i <= 5; i++) {
    let star = document.getElementById(`star-${i}`);
    if (star) {
      if (i <= id) {
        star.classList.remove("fa-star-o");
        star.classList.add("fa-star");
      } else {
        star.classList.remove("fa-star");
        star.classList.add("fa-star-o");
      }
      console.log("Element:", star);
    }
  }
};

const addcoupon = () => {
  const coupon = document.getElementById('coupon').style.display = "block";
   document.getElementById('question').style.display = "none";
}

const removecoupon = () => {
  const coupon = document.getElementById("question").style.display = "block";
    document.getElementById("coupon").style.display = "none";
};

const updateQuantity =  (productId)=> {
    var quantity = document.getElementById('quantityInput').value;
    window.location.href = `/addtoCart?id=${productId}&quantity=${quantity}`;
}

function getProductFromListItem(element) {
  const itemName = element.getAttribute("data-item-name");
  const catName = element.getAttribute("data-cat-name");
  getProduct(itemName, catName);
}

function getPage  (page) {
console.log(page);
  choosedpage = page;
  console.log(choosedpage);
  filter();
};

const changeAddress = (addres) => {
  const address = JSON.parse(addres);
  console.log(address);
  console.log("sdfsf");
  document.getElementById("name").value = address.name;
  document.getElementById("building").value = address.building;
  document.getElementById("streat").value = address.streat;
  document.getElementById("landmark").value = address.landmark;
  document.getElementById("district").value = address.district;
  document.getElementById("state").value = address.state;
  document.getElementById("country").value = address.country;
  document.getElementById("mobile").value = address.mobile;
  document.getElementById("pincode").value = address.pincode;
  document.getElementById("id").value = address._id;
}; 
