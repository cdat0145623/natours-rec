import axios from 'axios';
import { showAlert } from './alerts';

export const review_Web = async (tourId, review, rating) => {
  try {
    console.log('2 API');
    console.log({ tourId, review, rating });
    const res = await axios({
      method: 'POST',
      url: `http://127.0.0.1:3000/api/v1/tours/${tourId}/reviews`,
      data: {
        tourId,
        review,
        rating,
      },
    });
    console.log(res);
    if (res.data.status == 'success') {
      showAlert('success', 'Your review saved at database');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
