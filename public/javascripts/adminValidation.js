const validatString = (valueId, messageId, input) => {
  console.log(valueId);
  var value = document.getElementById(valueId).value;
  console.log(value);
  console.log(input);
  var message = document.getElementById(messageId);
  console.log(message);
    if (value.length === 0) {
        message.innerHTML = input + " Required";
        return false;
    }
    if (!value.match(/[A-Za-z0-9]/)) {
        message.innerHTML = input + " is Not Correct";
        return false;
    }
        message.innerHTML = '';

    return true;
};
const validatName = (valueId, messageId, input) => {
  console.log(valueId);
  var value = document.getElementById(valueId).value;
  console.log(value);
  console.log(input);
  var message = document.getElementById(messageId);
  console.log(message);
    if (value.length === 0) {
        message.innerHTML = input + " Required";
        return false;
    }
    if (!value.match(/[A-Za-z]/)) {
        message.innerHTML = input + " is Not Correct";
        return false;
    }
        message.innerHTML = '';

    return true;
};

const validatNum = (valueId, messageId, input) => {
    var value = document.getElementById(valueId).value;
    var message = document.getElementById(messageId);
    if (value.length === 0) {
        message.innerHTML = input + " Required";
        return false;
    }
    if (!value.match(/[0-9]/)) {
        message.innerHTML = input + " is Not Correct";
        return false;
    }
    if (value>100 || value <0) {
        message.innerHTML = "dicount can't be greater than 100 or lessthan 0";
        return false;
    }
        message.innerHTML = '';

    return true;
};

const validatNum2 = (valueId, messageId, input) => {
  var value = document.getElementById(valueId).value;
  var message = document.getElementById(messageId);
  if (value.length === 0) {
    message.innerHTML = input + " Required";
    return false;
  }
  if (!value.match(/[0-9]/)) {
    message.innerHTML = input + " is Not Correct";
    return false;
  }
  if ( value < 0) {
    message.innerHTML = "dicount can't be greater than 100 or lessthan 0";
    return false;
  }
  // message.innerHTML = "";

  return true;
};

const validatcForm = () => {
    var message = document.getElementById('form_error');
    if (
      !validatString("product_dis", "dis_error", "Discription") ||
      !validatString("product_slug", "slug_error", "Slug") ||
      !validatName("product_name", "name_error", "Name") ||
      !validatNum("product_discount", "discount_error", "Discount") ||
      !checkStatus("status",'radio') 
    ) {
      message.style.display = "block";
      message.style.color = "red";
      message.innerHTML = "Please Enter Correct Details";
      setTimeout(() => {
        message.style.display = "none";
      }, 4000);
      return false;
    }
    return true;
};

const checkStatus = (name,inputType) => {
  const inputss = document.getElementsByName(name);
  for (const input of inputss) {
    if (input.checked && input.type == inputType) {
      return true;
    }
  }
  return false;
}

var validatFromEditPage = () => {
    console.log('d')
  var message = document.getElementById("form_error");
  if (
    !validatString("product_title", "title_error", "Title") ||
    !validatString("product_color", "color_error", "Color") ||
    !validatString("product_size", "size_error", "Size") ||
    !validatString("product_brand", "brand_error", "Brand") ||
    !validatString("product_discription", "discription_error", "Discription") ||
    !validatString("product_price", "price_error", "Price") ||
    !validatString("product_quantity", "quantity_error", "Quantity") ||
    !validatNum("product_discount", "discount_error", "Discount") ||
    !checkStatus('category','checkbox')
  ) {
    console.log("ddfgggdhdygdryhgbdfghftdjhdygdfghhhhhhhhhhhhhf");
    message.style.display = "block";
    message.style.color = "red";
    message.innerHTML = "Please Enter Correct Details";
    setTimeout(() => {
      message.style.display = "none";
    }, 4000);
    return false;
  }
  return true;
};

var reviewsss = () => {
  console.log("d");
  var message = document.getElementById("form_error");
  const stars = document.getElementById('instar').value;
  if (!validatString("rating-review", "review_error", "Review") ) {
    console.log("ddfgggdhdygdryhgbdfghftdjhdygdfghhhhhhhhhhhhhf");
    message.style.display = "block";
    message.style.color = "red";
    message.innerHTML = "Please Enter Correct Details";
    setTimeout(() => {
      message.style.display = "none";
    }, 4000);
    return false;
  } else if (stars < 1) {
    
    console.log("ddfgggdhdygdryhgbdfghftdjhdygdfghhhhhhhhhhhhhf");
    message.style.display = "block";
    message.style.color = "red";
    message.innerHTML = "Give rating";
    setTimeout(() => {
      message.style.display = "none";
    }, 4000);
    return false;
  }
  return true;
};

var validatCouponForm = () => {
  console.log("d");
  var message = document.getElementById("form_error");
  if (
    !validatString("product_code", "code_error", "Code") ||
    !validatString("coupon_dis", "dis_error", "discription") ||
    !validatNum("product_discount", "discount_error", "Discount")
  ) {
    console.log("ddfgggdhdygdryhgbdfghftdjhdygdfghhhhhhhhhhhhhf");
    message.style.display = "block";
    message.style.color = "red";
    message.innerHTML = "Please Enter Correct Details";
    setTimeout(() => {
      message.style.display = "none";
    }, 4000);
    return false;
  }
  return true;
};


var validatAddressForm = () => {
  console.log("d");
  var message = document.getElementById("form_error");
  if (
    !validatString("building", "building_error", "Hous Name/Building Number") ||
    !validatString("landmark", "landmark_error", "Land Mark") ||
    !validatString("streat", "streat_error", "Streat") ||
    !validatString("country", "country_error", "Country") ||
    !validatString("district", "district_error", "District") ||
    !validatNum2("pincode", "pincode_error", "Pincode")
  ) {
    console.log("ddfgggdhdygdryhgbdfghftdjhdygdfghhhhhhhhhhhhhf");
    message.style.display = "block";
    message.style.color = "red";
    message.innerHTML = "Please Enter Correct Details";
    setTimeout(() => {
      message.style.display = "none";
    }, 4000);
    return false;
  }
  
  checkout();
  return true;
};
