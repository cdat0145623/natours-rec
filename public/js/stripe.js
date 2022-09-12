import axios from "axios";
import { showAlert } from "./alerts";
// import { async } from './bundle';
// const Stripe = require('stripe');

export const bookTour = async (tourId) => {
  //1) Get checkout session from API
  const stripe = Stripe(
    "pk_test_51Lc2TPIFDKjBGOaxBAs2QcmeCZv7wHv0v2HkhlvJrLUZSjURveM3Y9xfFAWRDwvDfTVDNxwDSkRlISr4K6Mb8ZF100EBYccGk8",
    {
      apiVersion: "2022-08-01",
    }
  );

  // console.log('3 Receive tourId. Confirm API', tourId);
  try {
    // console.log('4 POST API');
    const session = await axios({
      method: "GET",
      url: `/api/v1/bookings/checkout-session/${tourId}`,
      session,
    });
    // console.log(session);
    // console.log('5) Completed API');
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    // console.log(err.response.data);
    showAlert("error", err);
  }
};
