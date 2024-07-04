let submenuStatus = false
let submenuBtn = document.getElementById('user-icon-button');
let submenu = document.getElementById('header-submenu');

submenuBtn.addEventListener("click", function(){
  if (submenuStatus){
    submenu.classList.toggle('slide-in');
    submenu.classList.toggle('slide-out');
    submenuStatus = false
  } else if (submenuStatus== false){
    submenu.classList.toggle('slide-out');
    submenu.classList.toggle('slide-in');
    submenuStatus = true
  }


  // if (submenuStatus){
    //   submenu.classList.add('slide-out');
    //   submenu.classList.remove('slide-in');
    //   submenuStatus = false
    // } else if (submenuStatus== false){
    //   submenu.classList.add('slide-in');
    //   submenu.classList.remove('slide-out');
    //   submenuStatus = true
    // }

    // submenu.classList.toggle('d-none');
});