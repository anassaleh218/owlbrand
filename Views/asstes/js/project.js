function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function deleteCookie(cookieName) {
  document.cookie =
    cookieName + "=; Path=/Views; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
}

function insertAfter(newNode, existingNode) {
  existingNode.parentNode.insertBefore(newNode, existingNode.nextSibling);
}
function showMessageAlert(message, state = "danger") {
  var alertDiv = document.createElement("div");
  alertDiv.className = "alert alert-" + state + " alert-dismissible fade show";
  alertDiv.setAttribute("role", "alert");

  alertDiv.innerHTML = "<strong>Message!</strong> " + message;

  var closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "close";
  closeButton.setAttribute("data-dismiss", "alert");
  closeButton.setAttribute("aria-label", "Close");
  closeButton.innerHTML = '<span aria-hidden="true">&times;</span>';
  alertDiv.appendChild(closeButton);
  myHeader = document.getElementsByTagName("header")
  insertAfter(alertDiv, myHeader[0])
  // document.body.insertBefore(alertDiv, document.body.firstChild);
  // document.body.insertAdjacentElement("afterEnd", alertDiv, myHeader[0]);
}

// function alertIfErrores(data){
//   console.log(data)
//   allErrors = []
//   data.forEach(error => {
//     if(error.defaultMessage){
//       allErrors.push(error.defaultMessage)
//       showMessageAlert(error.defaultMessage)
//     }
//   });
// }


var token = getCookie("token");
var isAdmin = getCookie("isAdmin");

if (token && isAdmin) {
  console.log(token);
  console.log(isAdmin);
  if (isAdmin == "true") {
    document.getElementById("add").style.display = "block";
  }else{
    document.getElementById("myOrders").style.display = "block";
  }
  // Delete register button
  document.getElementById("registerNavItem").style.display = "none";

  // Change login button to log out button
  var loginButton = document.getElementById("loginButton");
  loginButton.textContent = "Logout";
  loginButton.onclick = logout; // Assigning the logout function to the onclick event

  // logout function deletes token and redirects to login page
  function logout() {
    // Code to delete token
    deleteCookie("token");
    deleteCookie("isAdmin");
  }
} 
// else {
//   showMessageAlert("you must login first");
// }



$(document).ready(function() {
  // Disable other size options when "None" is checked
  $('#size_none').change(function() {
    if ($(this).is(':checked')) {
      $('.size-option').prop('disabled', true);
    } else {
      $('.size-option').prop('disabled', false);
    }
  });

  // Disable other color options when "All" is checked
  $('.color-option').change(function() {
    if ($('#color_check_all').is(':checked')) {
      $('.color-option').not(this).prop('disabled', true);
    } else {
      $('.color-option').prop('disabled', false);
    }
  });

  // Disable other type options when "All" is checked
  $('.type-option').change(function() {
    if ($('#type_check_all').is(':checked')) {
      $('.type-option').not(this).prop('disabled', true);
    } else {
      $('.type-option').prop('disabled', false);
    }
  });

  // Check/uncheck all sizes
  $('#size_check_all').change(function() {
    var isChecked = $(this).is(':checked');
    $('.size-option').prop('checked', isChecked).prop('disabled', isChecked);
  });

  // Check/uncheck all colors
  $('#color_check_all').change(function() {
    var isChecked = $(this).is(':checked');
    $('.color-option').prop('checked', isChecked).prop('disabled', isChecked);
  });

  // Check/uncheck all types
  $('#type_check_all').change(function() {
    var isChecked = $(this).is(':checked');
    $('.type-option').prop('checked', isChecked).prop('disabled', isChecked);
  });
});
