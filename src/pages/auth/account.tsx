import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { MdMail, MdPassword, MdPerson } from 'react-icons/md';

import Alert from '../../components/Alert';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Load from '../../components/Load';
import Modal from '../../components/Modal';
import { baseURL } from '../../service/api';
import { deleteAccount, getDataAccount, patchAccount } from '../../service/auth_service';
import styles from '../../styles/pages_styles/auth.module.css';
import { UserDTO } from '../../types/dtos/UserDTO';

function Account() {

    const router = useRouter()

    const [selectImage, setSelectImage] = useState<File>()
    const [previewImage, setPreviewImage] = useState<string | undefined>()

    const [userDTO, setUserDTO] = useState<UserDTO>()
    const [confirmPassword, setConfirmPassword] = useState("")

    const [isLoad, setIsLoad] = useState(false)
    const [alert, setAlert] = useState({ text: '', status: '', isVisible: false })

    const [isVisibleConfirmModal, setIsVisibleConfirmModal] = useState(false)

    useEffect(() => {
        getUserData()
    }, [])

    useEffect(() => {

        if (!selectImage) {
            setPreviewImage(undefined)
            return
        }

        const objectUrl = URL.createObjectURL(selectImage)
        setPreviewImage(objectUrl)

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)

    }, [selectImage])

    const closedAlert = () => {
        setAlert({ text: '', status: '', isVisible: false })
    }

    const closedConfirmModal = () => {
        setIsVisibleConfirmModal(false)
    }

    async function getUserData() {

        try {

            const userData = await getDataAccount()
            setUserDTO({ name: userData.name, email: userData.email })

            if (userData.profileImageName) {
                setPreviewImage(`${baseURL}/auth/get-img/${userData.profileImageName}`)
            }

        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error getting account data',
                status: 'error',
                isVisible: true
            })
        }

    }

    async function updateData(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!userDTO.name || !userDTO.email) {
            return setAlert({ text: "Do not leave empty fields", status: "warning", isVisible: true })
        }

        setIsLoad(true)

        try {
            const responseMessage = await patchAccount({ name: userDTO.name, email: userDTO.email })
            setAlert({ text: responseMessage, status: 'success', isVisible: true })
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error updating data',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    async function updateImg(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!selectImage) {
            return setAlert({ text: "Please select an image", status: "warning", isVisible: true })
        }

        setIsLoad(true)

        try {
            const responseMessage = await patchAccount({ profileImage: selectImage })
            setAlert({ text: responseMessage, status: 'success', isVisible: true })
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Register error',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    async function updatePassword(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!userDTO.password || !confirmPassword) {
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true });
        }
        if (confirmPassword !== userDTO.password) {
            return setAlert({ text: 'Passwords do not match', status: 'warning', isVisible: true })
        }

        setIsLoad(true)

        try {
            const responseMessage = await patchAccount({ password: userDTO.password })
            setAlert({ text: responseMessage, status: 'success', isVisible: true })
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error updating password',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    async function deleteUserAccount() {

        setIsLoad(true)

        try {
            await deleteAccount()
            closedConfirmModal()
            localStorage.removeItem("token")
            router.push("/")
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error deleting account',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    return (
        <section className="flex_col">

            <Alert isVisible={alert.isVisible} status={alert.status} closed={closedAlert}>
                {alert.text}
            </Alert>

            {
                isLoad &&
                <div className={styles.div_loading}>
                    <Load />
                </div>
            }

            <div className="flex_row wrap justify_center">

                <Card css={{ margin: 10 }} isBordered={true}>

                    <form onSubmit={updateImg} className={`${styles.form_auth} flex_col items_center justify_center`}>

                        <h2>Profile picture</h2>

                        <label htmlFor="input_file" className={`${styles.label_input_file} flex_col items_center`}>
                            <img src={previewImage || "/img/person-circle.svg"} className={styles.img_profile_select} />
                            Select file
                        </label>

                        <input
                            type="file"
                            name="arquivo"
                            id="input_file"
                            className={styles.input_file}
                            accept="image/png, image/jpeg, image/gif, image/jpg"
                            onChange={event => {

                                if (!event.target.files || event.target.files.length === 0) {
                                    setSelectImage(undefined)
                                    return
                                }

                                // I've kept this example simple by using the first image instead of multiple
                                setSelectImage(event.target.files[0])

                            }}
                        />

                        <button type="submit" className="button_primary">Update file</button>

                    </form>

                </Card>

                <Card css={{ margin: 10 }} isBordered={true}>

                    <form onSubmit={updateData} className={`${styles.form_auth} flex_col items_center justify_center`}>

                        <h2>Account data</h2>

                        <div>
                            <Input
                                value={userDTO && userDTO.name}
                                placeholder="Name"
                                required={true}
                                type="text"
                                setValue={(text: string) => setUserDTO({ ...userDTO, name: text })}
                                icon={<MdPerson />}
                            />
                        </div>

                        <div>
                            <Input
                                value={userDTO && userDTO.email}
                                placeholder="Email"
                                required={true}
                                type="email"
                                setValue={(text: string) => setUserDTO({ ...userDTO, email: text })}
                                icon={<MdMail />}
                            />
                        </div>

                        <button type="submit" className="button_primary" >Update data</button>

                    </form>

                </Card>

                <Card css={{ margin: 10 }} isBordered={true}>

                    <form onSubmit={updatePassword} className={`${styles.form_auth} flex_col items_center justify_center`}>

                        <h2>Update password</h2>

                        <div>
                            <Input
                                value={userDTO && userDTO.password}
                                placeholder="Password"
                                required={true}
                                type="password"
                                setValue={(text: string) => setUserDTO({ ...userDTO, password: text })}
                                icon={<MdPassword />}
                            />
                        </div>

                        <div>
                            <Input
                                value={confirmPassword}
                                placeholder="Confirm password"
                                required={true}
                                type="password"
                                setValue={(text: string) => setConfirmPassword(text)}
                                icon={<MdPassword />}
                            />
                        </div>

                        <button type="submit" className="button_primary" >Update password</button>

                    </form>

                </Card>

                <Card css={{ margin: 10 }} isBordered={true}>

                    <form className={`${styles.form_auth} flex_col items_center justify_center`}>

                        <h2>Delete account</h2>

                        <div className="flex_row justify_center">

                            <Modal isVisible={isVisibleConfirmModal} onClosed={closedConfirmModal}>

                                <h1 style={{ margin: 20 }}>Delete account</h1>

                                <p>By deleting this account, all your data will be permanently removed, do you want to continue?</p>

                                <div style={{ margin: 20 }} className="flex_row">
                                    <button type="button" className="button_primary" onClick={deleteUserAccount}>Confirm</button>
                                    <button type="button" className="button_secondary" onClick={closedConfirmModal}>Cancel</button>
                                </div>

                            </Modal>

                            <button type="button" className="button_primary" onClick={() => setIsVisibleConfirmModal(true)}>
                                Delete account
                            </button>

                        </div>

                    </form>

                </Card>

            </div>

        </section>
    );
}

export default Account;