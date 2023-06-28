import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MdDelete, MdEditSquare, MdMoreVert, MdSearch } from 'react-icons/md';

import { deleteAUser, findUser, getUsers, patchAUser } from '../../../..//service/auth_service';
import Alert from '../../../../components/Alert';
import Dropdown from '../../../../components/Dropdown';
import Input from '../../../../components/Input';
import Load from '../../../../components/Load';
import Modal from '../../../../components/Modal';
import Pagination from '../../../../components/Pagination';
import { baseURL } from '../../../../service/api';
import styles from '../../../../styles/pages_styles/auth.module.css';
import { UserDTO } from '../../../../types/dtos/UserDTO';
import { User } from '../../../../types/models/User';

export default function Users() {

    const [userTemp, setUserTemp] = useState<UserDTO>()
    const [confirmPassword, setConfirmPassword] = useState('')
    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })
    const [isVisibleConfirmModal, setIsVisibleConfirmModal] = useState(false)
    const [visibleModalUser, setVisivibleModalUser] = useState(false)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoad, setIsLoad] = useState(false)
    const [users, setUsers] = useState<User[]>([])
    const router = useRouter()
    const page = Number(router.query.page)
    const search = router.query.search

    useEffect(() => {
        getListUsers()
    }, [page, search])

    function setDataUserUpdate(value: any, key: string) {
        let userData = userTemp
        userData[key] = value
        setUserTemp({ ...userData })
    }

    async function getListUsers() {

        setIsLoad(true)

        try {
            const response = search ? await findUser(page - 1, String(search)) : await getUsers(page - 1)
            setTotalPages(response.totalPages)
            setUsers(response.content)

        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error getting users',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    async function updateDataUser() {

        if (!userTemp.name || !userTemp.email || !userTemp.role) {
            return setAlert({ text: "Do not leave empty fields", status: "warning", isVisible: true })
        }

        setIsLoad(true)

        try {
            const responseMessage = await patchAUser(userTemp.email, { name: userTemp.name, email: userTemp.email, role: userTemp.role })
            setAlert({ text: responseMessage, status: 'success', isVisible: true })
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error updating user',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)
        getListUsers()

    }

    async function updatePasswordUser() {

        if (!userTemp.password || !confirmPassword) {
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true })
        }
        if (confirmPassword !== userTemp.password) {
            return setAlert({ text: 'Passwords do not match', status: 'warning', isVisible: true })
        }

        setIsLoad(true)

        try {
            const responseMessage = await patchAUser(userTemp.email, { password: userTemp.password })
            setAlert({ text: responseMessage, status: 'success', isVisible: true })
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error updating user',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)
        getListUsers()

    }

    async function deleteUser(email: string) {

        setIsLoad(true)

        try {
            const responseMessage = await deleteAUser(email)
            setAlert({ text: responseMessage, status: 'success', isVisible: true })

        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error deleting user',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)
        setIsVisibleConfirmModal(false)
        getListUsers()

    }

    return (
        <section>

            <div className='flex_row items_center justify_between wrap'>
                <h1>List users</h1>
                <Input
                    placeholder="Search by name"
                    icon={<MdSearch />}
                    setValue={(text: string) => router.push(`./1` + (text ? `?search=${text}` : ``))}
                />
            </div>

            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            {
                isLoad &&
                <div className={styles.div_loading}>
                    <Load />
                </div>
            }

            {/* Modal to update user */}
            <Modal isVisible={visibleModalUser} onClosed={() => setVisivibleModalUser(false)}>

                <div className={styles.container_modal_user}>

                    <form>

                        <h1> Update data </h1>

                        <Input
                            placeholder="Name"
                            value={userTemp && userTemp.name}
                            setValue={(text: string) => setDataUserUpdate(text, 'name')}
                            required={true}
                        />

                        <Input
                            placeholder="Email"
                            value={userTemp && userTemp.email}
                            setValue={(text: string) => setDataUserUpdate(text, 'email')}
                            type="email"
                            required={true}
                        />

                        <div className='flex_row'>

                            <div className={styles.control_radio}>
                                <input type="radio" id="user" name="role" value="USER" defaultChecked={userTemp && userTemp.role === "USER"} onChange={event => setDataUserUpdate(event.target.value, 'role')} />
                                <label htmlFor="user">User</label>
                            </div>

                            <div className={styles.control_radio}>
                                <input type="radio" id="admin" name="role" value="ADMIN" defaultChecked={userTemp && userTemp.role === "ADMIN"} onChange={event => setDataUserUpdate(event.target.value, 'role')} />
                                <label htmlFor="admin">Admin</label>
                            </div>

                            <div className={styles.control_radio}>
                                <input type="radio" id="master" name="role" value="MASTER" defaultChecked={userTemp && userTemp.role === "MASTER"} onChange={event => setDataUserUpdate(event.target.value, 'role')} />
                                <label htmlFor="master">Master</label>
                            </div>

                        </div>

                        <button type='button' onClick={updateDataUser} className='button_primary'>Update data</button>

                    </form>

                    <form>

                        <h1> Update password </h1>

                        <Input
                            placeholder="Password"
                            setValue={(text: string) => setDataUserUpdate(text, 'password')}
                            type="password"
                            required={true}
                        />

                        <Input
                            placeholder="Confirm password"
                            setValue={(text: string) => setConfirmPassword(text)}
                            type="password"
                            required={true}
                        />

                        <button type='button' onClick={updatePasswordUser} className='button_primary'>Update password</button>

                    </form>

                </div>

            </Modal>

            {/* Delete user confirmation modal */}
            <Modal isVisible={isVisibleConfirmModal} onClosed={() => setIsVisibleConfirmModal(false)}>

                <div className={styles.container_modal_user}>

                    <h1>Delete user</h1>

                    <p>By deleting the email user "{userTemp && userTemp.email}", all of its data will be permanently removed. Do you really want to continue?</p>

                    <div className="flex_row">
                        <button type="button" className="button_primary" onClick={() => deleteUser(userTemp.email)}>Confirm</button>
                        <button type="button" className="button_secondary" onClick={() => setIsVisibleConfirmModal(false)}>Cancel</button>
                    </div>

                </div>

            </Modal>

            {users.length > 0
                ? users.map(user => {
                    return (
                        <div key={user.id} className={styles.user_list}>

                            <div className={`${styles.item_user_list} flex_row justify_between`}>

                                <div className='flex_row'>
                                    <img src={user.profileImageName ? `${baseURL}/auth/get-img/${user.profileImageName}` : "/img/person-circle.svg"} className="img_profile_view" />
                                    <div>
                                        <p>{user.name}</p>
                                        <small>{user.email}</small>
                                    </div>
                                </div>

                                <Dropdown
                                    activationButton={
                                        <span className='icon_button' >
                                            <MdMoreVert style={{ fontSize: 20 }} />
                                        </span>
                                    }>

                                    <div style={{ padding: 5, display: 'flex', flexDirection: 'column' }}>

                                        <button
                                            className='icon_button'
                                            onClickCapture={() => {
                                                setVisivibleModalUser(true)
                                                setUserTemp(user)
                                            }}>
                                            <MdEditSquare />
                                            Edit
                                        </button>

                                        <button
                                            className='icon_button'
                                            onClick={() => {
                                                setIsVisibleConfirmModal(true)
                                                setUserTemp(user)
                                            }}>
                                            <MdDelete />Delete
                                        </button>

                                    </div>

                                </Dropdown>

                            </div>

                        </div>
                    )
                })
                : <p style={{ textAlign: 'center' }}> Not a user found </p>
            }

            <div className='justify_center' style={{ marginTop: 10 }}>
                <Pagination
                    totalPages={totalPages}
                    actualPage={page}
                    onPress={(value: number) => router.push("./" + value + (search ? `?search=${search}` : ``))}
                />
            </div>

        </section >
    );
}


