const validatname = () => {
     var nameerror = document.getElementById("name-error");
     var name = document.getElementById('name').value;
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
     var email = document.getElementById("email").value;
     if (email.length === 0) {
          Emailerror.innerHTML = 'Email is Required';
          return false;
     }
     if (!email.match(/^[A-Za-z0-9._-]+@[A-Za-z0-9]+\.[a-zA-Z]{2,4}$/)) {
          Emailerror.innerHTML = 'Invalid Email';
          return false;
     }
     Emailerror.innerHTML = 'Valid Email';
     return true;
}

const validatpass = () => {
     var passerror = document.getElementById("pass-error");
     var pass = document.getElementById("pass").value;
     if (pass.length === 0) {
          passerror.innerHTML = 'invalid Password';
          return false;
     }
     if (!pass.match(/^(?=.*\d)(?=.*[a-z])(?=.*[!@#$%^&*]).{6,20}$/)) {
          passerror.innerHTML = 'inavalid Password';
          return false;
         }
     passerror.innerHTML = 'Password';
     return true;
}

const validatmobile = () => {
     var mobileerror = document.getElementById('mobile-error');
     var mobile = document.getElementById('mobile').value;
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
     console.log('1')
     var submiterror = document.getElementById("submit-error");
     console.log('2')
     if (
       !validatname() ||
       !validatemail() || 
       !validatmobile() ||
       !validatpass() ||
       !checkPass()
     ) {
       submiterror.style.display = "block";
       submiterror.style.color = "red";
       submiterror.innerHTML = "Please Enter Correct Password.";
       return false;
     }
     return true;
}

// const validatEmailForm = () => {
//   var submiterror1 = document.getElementById("submit-error1");
//   if (!validatname() || !validatemail()) {
//     submiterror1.style.display = "block";
//     submiterror1.style.color = "red";
//     submiterror1.innerHTML = "Please Enter Corrrect Details.";
//     setTimeout(() => {
//       submiterror1.style.display = "none";
//     }, 3000);
//     return false;
//   }
//   submiterror1.innerHTML = "OTP Sended";
//   return true;
// };

const checkPass = () => {
     var pass = document.getElementById('pass').value;
     var cpass = document.getElementById('cpass').value;
     var cpasserror =document.getElementById("cpass-error")
     if (cpass.length === 0) {
          cpasserror.innerHTML = "Confirm Password";
          return false;
     }
     if (pass !== cpass) {
          cpasserror.innerHTML = "Password don't Match.";
          return false;
     }
     cpasserror.innerHTML ="Password Confirmed "
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
  var cpass = document.getElementById("cpass");
  if (cpass.type === "password") {
    cpass.type = "text";
    document.getElementById("login-eye2").className = "ri-eye-line login__eye";
  } else {
    cpass.type = "password";
    document.getElementById("login-eye2").className =
      "ri-eye-off-line login__eye";
  }
};

const validatotp = () => {
     var otp = document.getElementById('otp').value;
     var otperror = document.getElementById('otp-error');
     if (otp.length == 0) {
          otperror.innerHTML = "WRON OTP";
          return false;
     }
     if (!otp.match(/[A-Za-z0-9]/)) {
          otperror.innerHTML = "wrong otp";
          return false;
     }
     otperror.innerHTML = 'Enter OTP';
     return true;
}

const otpform = () => {
     console.log('2');
     const submiterror = document.getElementById("submit-error");
     console.log('1');
     if (!validatotp) {
       submiterror.style.display = "block";
       submiterror.style.color = "red";
       submiterror.innerHTML = "Enter OTP";
       setTimeout(() => {
         submiterror.style.display = "none";
       }, 3000);
       return false;
     }
     return true;
}