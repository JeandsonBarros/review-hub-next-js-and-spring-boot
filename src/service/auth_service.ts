import { UserDTO } from '../types/dtos/UserDTO';
import { PageUsers } from '../types/models/PageUsers';
import { User } from '../types/models/User';
import { api } from './api';

export async function login(email: string, password: string): Promise<string> {

    const response = await api.post('/auth/login',
        {
            email,
            password
        })

    localStorage.setItem('token', response.data.message)
    return "Logged"

}

export async function register(userDTO: UserDTO): Promise<string> {

    const response = await api.post('/auth/start-registration', userDTO)
    return response.data.message

}

export async function completeRegistrationByCode(email: string, code: number): Promise<string> {

    const response = await api.put('/auth/complete-registration',
        {
            code,
            email,
        })

    return response.data.message

}

export async function getDataAccount(): Promise<User> {

    const token = localStorage.getItem('token');
    const response = await api.get('/auth/account-data',
        {
            headers: {
                'Authorization': `${token}`
            }
        }
    )

    return response.data

}

export async function patchAccount(userDTO: UserDTO): Promise<string> {

    const token = localStorage.getItem('token');
    await api.patch('/auth/update', userDTO,
        {
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )

    return 'Successfully updated'

}

export async function deleteAccount(): Promise<string> {

    const token = localStorage.getItem('token');
    await api.delete('/auth/account-delete',
        {
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )

    return "User deleted"

}

export async function sendEmail(email: string): Promise<string> {

    const response = await api.post(`/auth/forgotten-password/send-email`, { email })
    return response.data.message

}

export async function changeForgottenPassword(email: string, newPassword: string, recoveryCode: number): Promise<string> {

    const response = await api.put(`/auth/forgotten-password/change-password`, { email, newPassword, recoveryCode })
    return response.data.message

}

/* --------- Admin and Master functions ------------ */

export async function getUsers(page = 0, size = 30): Promise<PageUsers> {

    const token = localStorage.getItem('token');
    const response = await api.get(`/auth/list-users?page=${page}&size=${size}`,
        {
            headers: {
                'Authorization': `${token}`,
            }
        }
    )

    return response.data

}

export async function findUser(page = 0, nameToSearch = '', size = 30): Promise<PageUsers> {

    const token = localStorage.getItem('token');
    const response = await api.get(`/auth/list-users?page=${page}&size=${size}&name=${nameToSearch}`,
        {
            headers: {
                'Authorization': `${token}`,
            }
        }
    )

    return response.data

}

export async function patchAUser(email: string, user: UserDTO): Promise<string> {

    const token = localStorage.getItem('token');
    await api.patch(`/auth/update-a-user/${email}`, user,
        {
            headers: {
                'Authorization': `${token}`,
            }
        }
    )

    return 'Successfully updated'

}

export async function deleteAUser(email: string): Promise<string> {


    const token = localStorage.getItem('token');
    await api.delete(`/auth/delete-a-user/${email}`,
        {
            headers: {
                'Authorization': `${token}`
            }
        }
    )

    return "User deleted successfully"

}