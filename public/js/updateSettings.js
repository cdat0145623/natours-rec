import axios from 'axios';
import { showAlert } from './alerts';
// import { async } from './bundle';

// 
export const updateSettings = async (data, type) => {
    try {
        const url = type === 'password' ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword' : 'http://127.0.0.1:3000/api/v1/users/updateMe'

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} Updated Successfully`);
        } 
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
}

// updatePassword

// export const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
//     try {
//         const res = await axios({
//             method: 'PATCH',
//             url: 'http://127.0.0.1:3000/api/v1/users/updateMyPassword',
//             data: {
//                 currentPassword,
//                 newPassword,
//                 confirmPassword
//             }
//         });

//         if (res.data.status === 'success') {
//             showAlert('success', 'Update New Password Successfully');
//             window.setTimeout(() => {
//                 location.assign('/me');
//             }, 1500);
//         }
//     } catch (err) {
//         showAlert('error', err.response.data.message);
//     }
// };