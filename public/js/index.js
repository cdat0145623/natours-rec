import '@babel/polyfill';
import { displayMap } from './mapbox';
import { signup, login, logout } from './login';
import { updateSettings } from './updateSettings';
import { review_Web } from './review';
import { bookTour } from './stripe';
// DOM element
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const signupBtn = document.querySelector('.form--signup');
const updateDataBtn = document.querySelector('.form-user-data');
const updatePassBtn = document.querySelector('.form-user-settings');
const bookBtn = document.querySelector('.btnTour');
const reviewBtn = document.querySelector('.form--review');
const reviewBotton = document.querySelector('.reviewBotton');

// VALUES

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

//SIGNUP
if (signupBtn) {
  signupBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

//LOGIN
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log(password);
    login(email, password);
  });
}

//LOG OUT
if (logoutBtn) logoutBtn.addEventListener('click', logout);

//UPLOAD DATA USER
if (updateDataBtn) {
  updateDataBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);
    updateSettings(form, 'data');
  });
}

//CHANGE PASSWORD
if (updatePassBtn) {
  updatePassBtn.addEventListener('submit', async (e) => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    console.log(currentPassword);
    console.log(newPassword);
    console.log(confirmPassword);
    await updateSettings(
      { currentPassword, newPassword, confirmPassword },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';

    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });
}

if (bookBtn) {
  bookBtn.addEventListener('click', (e) => {
    console.log('1 listen');
    e.target.textContent = 'Processcing....';
    const { tourId } = e.target.dataset;
    console.log('2) Get tourId. Send bookTour', tourId);
    bookTour(tourId);
  });
}

//REVIEW
if (reviewBtn) {
  reviewBtn.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log('Listen review form');
    const review = document.getElementById('review').value;
    console.log(review);
    const rating = document.getElementById('rating').value;
    console.log(rating);
    console.log('1000');
    const { tourId } = e.target.dataset('.reviewBotton');
    console.log(tourId);
    document.querySelector('.reviewBotton').textContent = 'Processcing...';

    review_Web(tourId, review, rating);
  });
}

//1) Listen submit buttion Signup
//2) Send data(name, email, password, confirmPassword)
//3) Receive Data. Call API (axios). Run router then thuc hien middleware signup and return result.

/*
1) booked.pug => 'click' botton Review(/my-tours/my-review) => Have form review, api /my-tours/my-review => success
2) Listen "submit" => send data(name, subject) => receive review(name, subject) => call Axios thuc hien API
    API: POST from tourRoutes "tours/:tourId/reviews" => call reviewRoutes thuc thi setTourIdanduser (based on `${req.params.tourId}`)
        {req.params.tourId} = e.targer.dataset
*/
