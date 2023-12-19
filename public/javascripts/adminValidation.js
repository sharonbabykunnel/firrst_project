const validatString = (valueId, messageId, input) => {
    var value = document.getElementById(valueId).value;
    var massage = document.getElementById(messageId);
    if (value.length === 0) {
        massage.innerHTML = input + " Required";
        return false;
    }
    if (!value.match(/[A-Za-z0-9]/)) {
        massage.innerHTML = input + " is Not Correct";
        return false;
    }
        massage.innerHTML = '';

    return true;
};

const validatcForm = () => {
    var massage = document.getElementById('form_error');
    if (
        !validatString("product_dis", "dis_error", "Discription") ||
        !validatString("product_slug", "slug_error", "Slug") ||
        !validatString("product_name", "name_error", "Name")
    ) {
        massage.style.display = "block";
        massage.style.color = "red";
        massage.innerHTML = "Please Enter Correct Details";
        setTimeout(() => {
            massage.style.display = "non";
        }, 4000);
        return false;
    }
    return true;
};

var validatFromEditPage = () => {
    console.log('d')
  var massage = document.getElementById("form_error");
  if (
    !validatString("product_title", "title_error", "Title") ||
    !validatString("product_color", "color_error", "Color") ||
    !validatString("product_size", "size_error", "Size") ||
    !validatString("product_brand", "brand_error", "Brand") ||
    !validatString("product_discription", "discription_error", "Discription") ||
    !validatString("product_price", "price_error", "Price")
  ) {
    massage.style.display = "block";
    massage.style.color = "red";
    massage.innerHTML = "Please Enter Correct Details";
    setTimeout(() => {
      massage.style.display = "non";
    }, 4000);
    return false;
  }
  return true;
};