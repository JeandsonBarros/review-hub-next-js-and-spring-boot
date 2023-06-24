import Alert from '@/components/Alert';
import Dropdown from '@/components/Dropdown';
import Input from '@/components/Input';
import Load from '@/components/Load';
import Modal from '@/components/Modal';
import { baseURL } from '@/service/api';
import { deleteAUser, getUsers, patchAUser, findUser } from '@/service/auth_service';
import { useEffect, useState } from 'react';
import { MdDelete, MdEditSquare, MdMoreVert, MdSearch } from 'react-icons/md';

import styles from '../../../../styles/pages_styles/auth.module.css';
import Pagination from '@/components/Pagination';
import { useRouter } from 'next/router';

export default function Users() {

    const [visibleModalUser, setVisivibleModalUser] = useState(false)
    const [userTemp, setUserTemp] = useState({ name: '', email: '', password: '', confirmPassword: '', role: '' })
    const [users, setUsers] = useState([])
    const [isLoad, setIsLoad] = useState(false)
    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })
    const [isVisibleConfirmModal, setIsVisibleConfirmModal] = useState(false)
    const router = useRouter()
    const page = Number(router.query.page)
    const search = router.query.search
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        getListUsers()
    }, [page, search])

    function setDataUserUpdate(value, key) {
        let userData = userTemp
        userData[key] = value
        setUserTemp({ ...userData })
    }

    async function getListUsers() {

        setIsLoad(true)
        const response = search ? await findUser(page - 1, search) : await getUsers(page - 1)
        setIsLoad(false)

        if (response.data) {
            setTotalPages(response.data.totalPages)
            setUsers(response.data.content)
        } else if (response.message) {
            setAlert({ text: response.message, status: response.status, isVisible: true })
        }
    }

    async function updateDataUser() {

        if (!userTemp.name || !userTemp.email || !userTemp.role)
            return setAlert({ text: "Do not leave empty fields", status: "warning", isVisible: true })

        setIsLoad(true)
        const response = await patchAUser(userTemp.email, { name: userTemp.name, email: userTemp.email, role: userTemp.role })
        setIsLoad(false)

        setAlert({ text: response.message, status: response.status, isVisible: true })
        getListUsers()

    }

    async function updatePasswordUser() {

        if (!userTemp.password || !userTemp.confirmPassword)
            return setAlert({ text: 'Do not leave empty fields', status: 'warning' })

        if (userTemp.confirmPassword !== userTemp.password)
            return setAlert({ text: 'Passwords do not match', status: 'warning' })

        setIsLoad(true)
        const response = await patchAUser(userTemp.email, { password: userTemp.password })
        setIsLoad(false)

        setAlert({ text: response.message, status: response.status, isVisible: true })
        getListUsers()

    }

    async function deleteUser(email) {

        setIsLoad(true)
        const response = await deleteAUser(email)
        setIsLoad(false)

        setAlert({ text: response.message, status: response.status, isVisible: true })
        getListUsers()
        setIsVisibleConfirmModal(false)

    }

    return (
        <section>
         
            <div className='flex_row items_center justify_between wrap'>
                <h1>List users</h1>
                <Input
                    placeholder="Search by name"
                    icon={<MdSearch />}
                    setValue={text => router.push(`./1` + (text ? `?search=${text}` : ``))}
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

                        <Input placeholder="Name" value={userTemp.name} setValue={text => setDataUserUpdate(text, 'name')} required={true} />

                        <Input placeholder="Email" value={userTemp.email} setValue={text => setDataUserUpdate(text, 'email')} type="email" required={true} />

                        <div className='flex_row'>

                            <div className={styles.control_radio}>
                                <input type="radio" id="user" name="role" value="USER" defaultChecked={userTemp.role === "USER"} onChange={event => setDataUserUpdate(event.target.value, 'role')} />
                                <label htmlFor="user">User</label>
                            </div>

                            <div className={styles.control_radio}>
                                <input type="radio" id="admin" name="role" value="ADMIN" defaultChecked={userTemp.role === "ADMIN"} onChange={event => setDataUserUpdate(event.target.value, 'role')} />
                                <label htmlFor="admin">Admin</label>
                            </div>

                            <div className={styles.control_radio}>
                                <input type="radio" id="master" name="role" value="MASTER" defaultChecked={userTemp.role === "MASTER"} onChange={event => setDataUserUpdate(event.target.value, 'role')} />
                                <label htmlFor="master">Master</label>
                            </div>

                        </div>

                        <button type='button' onClick={updateDataUser} className='button_primary'>Update data</button>

                    </form>

                    <form>

                        <h1> Update password </h1>

                        <Input placeholder="Password" setValue={text => setDataUserUpdate(text, 'password')} type="password" required={true} />

                        <Input placeholder="Confirm password" setValue={text => setDataUserUpdate(text, 'confirmPassword')} type="password" required={true} />

                        <button type='button' onClick={updatePasswordUser} className='button_primary'>Update password</button>

                    </form>

                </div>

            </Modal>

            {/* Delete user confirmation modal */}
            <Modal isVisible={isVisibleConfirmModal} onClosed={() => setIsVisibleConfirmModal(false)}>

                <div className={styles.container_modal_user}>

                    <h1>Delete user</h1>

                    <p>By deleting the email user "{userTemp.email}", all of its data will be permanently removed. Do you really want to continue?</p>

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
                                    <img htmlFor="input_file" src={user.profileImageName ? `${baseURL}/auth/get-img/${user.profileImageName}` : "/img/person-circle.svg"} className="img_profile_view" />
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
                    onPress={(value) => router.push("./" + value + (search ? `?search=${search}` : ``))}
                />
            </div>

        </section >
    );
}


