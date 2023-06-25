import { api, toStringResponse } from './api';

export async function login(email, password) {
    try {
        const response = await api.post('/auth/login',
            {
                email,
                password
            })

        localStorage.setItem('token', response.data)
        return { message: "Logged", status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error", status: 'error' }
    }
}

export async function register(name, email, password) {
    try {
        const response = await api.post('/auth/register',
            {
                name,
                email,
                password
            })

        return { message: response.data, status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error", status: 'error' }
    }
}

export async function completeRegistrationByCode(email, code) {
    try {
        const response = await api.put('/auth/complete-registration',
            {
                code,
                email,
            })

        return { message: response.data, status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error", status: 'error' }
    }
}

export async function getDataAccount() {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.get('/auth/account-data',
            {
                headers: {
                    'Authorization': `${token}`
                }
            }
        )

        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error", status: 'error' }
    }
}

export async function patchAccount(user) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.patch('/auth/update', user,
            {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        )

        return { message: 'Successfully updated', status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error", status: 'error' }
    }
}

export async function deleteAccount() {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.delete('/auth/account-delete',
            {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        )

        return { message: response.data, status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error", status: 'error' }
    }
}

export async function sendEmail(email) {
    try {

        const response = await api.post(`/auth/forgotten-password/send-email`, { email })
        return { message: response.data, status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error sending code to email", status: 'error' }
    }
}

export async function changeForgottenPassword(email, newPassword, recoveryCode) {
    try {

        const response = await api.put(`/auth/forgotten-password/change-password`, { email, newPassword, recoveryCode })
        return { message: response.data, status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error updating password", status: 'error' }
    }
}

/* --------- Admin and Master functions ------------ */

export async function getUsers(page = 0) {
   
    try {

        const token = localStorage.getItem('token');     
        if (!token)
            return { message: "Not's logged", status: 'error' }
       
        const response = await api.get(`/auth/list-users?page=${page}&size=30`,
            {
                headers: {
                    'Authorization': `${token}`,
                }
            }
        )

        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error listing users", status: 'error' }
    }
}

export async function findUser(page = 0, nameToSearch = '') {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.get(`/auth/list-users?page=${page}&size=30&name=${nameToSearch}`,
            {
                headers: {
                    'Authorization': `${token}`,
                }
            }
        )

        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error finding users", status: 'error' }
    }
}

export async function patchAUser(email, user) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        await api.patch(`/auth/update-a-user/${email}`, user,
            {
                headers: {
                    'Authorization': `${token}`,
                }
            }
        )

        return { message: 'Successfully updated', status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error updating user", status: 'error' }
    }
}

export async function deleteAUser(email) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.delete(`/auth/delete-a-user/${email}`,
            {
                headers: {
                    'Authorization': `${token}`
                }
            }
        )

        return { message: response.data, status: 'success' }

    } catch (error) {
        console.log(error);
        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error", status: 'error' }
    }
}