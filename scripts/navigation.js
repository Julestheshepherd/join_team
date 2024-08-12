let submenuStatus = false;

function initializeSubmenu() {
    let submenuBtn = document.getElementById('user-icon-button');
    let submenu = document.getElementById('header-submenu');

    if (submenuBtn && submenu) {
        submenuBtn.addEventListener("click", function() {
            if (submenuStatus) {
                submenu.classList.toggle('slide-in');
                submenu.classList.toggle('slide-out');
                submenuStatus = false;
            } else {
                submenu.classList.toggle('slide-out');
                submenu.classList.toggle('slide-in');
                submenuStatus = true;
            }
        });
    }
}
