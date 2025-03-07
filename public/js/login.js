const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

//login and register form
signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
    window.history.pushState({}, '', '/register');
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
    window.history.pushState({}, '', '/login');
});

window.addEventListener('load', () => {
    if (window.location.pathname === '/register') {
        container.classList.add("right-panel-active");
    } else if (window.location.pathname === '/login') {
        container.classList.remove("right-panel-active");
    }
});

