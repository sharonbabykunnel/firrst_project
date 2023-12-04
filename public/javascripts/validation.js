const validatname = () => {
     var nameerror = document.getElementById("name-error");
     var name = document.getElementById('login-name').value;
     if (name.length === 0) {
          nameerror.innerHTML = 'Name is Required.';
          return false;
     }
     if (!name.match(/[A-za-z]/)) {
          nameerror.innerHTML = 'Enter a Valid Name.';
          return false;
     }
     nameerror.innerHTML = 'Valid Name';
     return true;
}
function validatemail() {
     var Emailerror = document.getElementById("email-error");
     var email = document.getElementById("login-email").value;
     if (email.length === 0) {
          Emailerror.innerHTML = 'Email is Required';
          return false;
     }
     if (!email.match(/^[A-Za-z0-9._-]+@[A-Za-z]+\.[a-z]{2,4}$/)) {
          Emailerror.innerHTML = 'Invalid Email';
          return false;
     }
     Emailerror.innerHTML = 'Valid Email';
     return true;
}

const validatpass = () => {
     var passerror = document.getElementById("pass-error");
     var pass = document.getElementById("login-pass").value;
     if (pass.length === 0) {
          passerror.innerHTML = 'invalid Password';
          return false;
     }
     if (!pass.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*()\-+.]).{6,20}$/)) {
          passerror.innerHTML = 'inavalid Password';
          return false;
         }
     passerror.innerHTML = 'Password';
     return true;
}

const validatmobile = () => {
     var mobileerror = document.getElementById('mobile-error');
     var mobile = document.getElementById('login-mobile').value;
     if (!mobile.match(/[0-9]/)) {
          mobileerror.innerHTML = "Not a Number.";
          return false;
     }
     if (mobile.length < 6) {
          mobileerror.innerHTML = "Invalid";
          return false;
     }
     mobileerror.innerHTML = "Mobile No.";
     return true;
}

const validatSigninForm = () => {
     var submiterror = document.getElementById("submit-error");
     if (!validatpass() || !validatemail()) {
          submiterror.style.display = 'block';
          submiterror.style.color = "red";
          submiterror.innerHTML = 'Please Enter Corrrect Details.';
          setTimeout(() => {
               submiterror.style.display = 'none';
          }, 3000);
          return false;
     }
     return true;
}

const validatSignupForm = () => {
     var submiterror = document.getElementById("submit-error");
     if (!validatpass() || !validatemail() || !validatmobile() || !validatname()) {
          submiterror.style.display = 'block';
          submiterror.style.color = 'red';
          submiterror.innerHTML = "Please Enter Correct Password.";
          return false;
     }
     return true;
}

const validatEmailForm = () => {
  var submiterror1 = document.getElementById("submit-error1");
  if (!validatname() || validatemail()) {
    submiterror1.style.display = "block";
    submiterror1.style.color = "red";
    submiterror1.innerHTML = "Please Enter Corrrect Details.";
    setTimeout(() => {
      submiterror1.style.display = "none";
    }, 3000);
    return false;
  }
  submiterror1.innerHTML = "OTP Sended";
  return true;
};

const checkpass = () => {
     var pass = document.getElementById('login-pass').value;
     var cpass = document.getElementById('login-cpass').value;
     if (pass !== cpass) {
          cpass.innerHTML = "Password don't Match.";
          return false;
     }
     return true;
}

const showPass = () => {
     var pass = document.getElementById("login-pass");
     if (pass.type ==='password') {
          pass.type = 'text';
          document.getElementById("login-eye").className =
            "ri-eye-line login__eye";
     } else {
          pass.type = 'password';
          document.getElementById("login-eye").className =
            "ri-eye-off-line login__eye";

     }
}

const showcPass = () => {
  var cpass = document.getElementById("login-cpass");
  if (cpass.type === "password") {
    cpass.type = "text";
    document.getElementById("login-eye2").className = "ri-eye-line login__eye";
  } else {
    cpass.type = "password";
    document.getElementById("login-eye2").className =
      "ri-eye-off-line login__eye";
  }
};