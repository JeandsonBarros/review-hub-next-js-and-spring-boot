import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdMail, MdPassword, MdPerson } from 'react-icons/md';

import Alert from '../../components/Alert';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Load from '../../components/Load';
import { completeRegistrationByCode, login, register } from '../../service/auth_service';
import styles from '../../styles/pages_styles/auth.module.css';
import { UserDTO } from '../../types/dtos/UserDTO';

function Register() {

    const [user, setUser] = useState<UserDTO>()
    const [confirmPassword, setConfirmPassword] = useState("")
    const [code, setCode] = useState<number>()
    const [isSendCode, setIsSendCode] = useState(false)
    const router = useRouter();
    const [isLoad, setIsLoad] = useState(false)
    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })

    const closedAlert = () => {
        setAlert({ text: '', status: 'info', isVisible: false })
    }

    async function registerUser() {

        if (!user.name || !user.password || !confirmPassword || !user.email)
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true })

        if (confirmPassword !== user.password)
            return setAlert({ text: 'Passwords do not match', status: 'warning', isVisible: true })

        setIsLoad(true)

        try {
            const response = await register(user)
            setIsSendCode(true)
            setAlert({ text: response, status: 'success', isVisible: true })
        } catch (error) {
            console.log(error);

            setAlert({
                text: error.response ? error.response.data.message : 'Register error',
                status: 'error',
                isVisible: true
            })

        }

        setIsLoad(false)

    }

    async function useCode() {

        if (!code) {
            return setAlert({ text: 'Code sent to the email is mandatory', status: 'warning', isVisible: true })
        }

        setIsLoad(true)

        try {

            await completeRegistrationByCode(user.email, code)
            await login(user.email, user.password)
            router.push("/")

        } catch (error) {
            console.log(error.status);
            setAlert({
                text: error.response ? error.response.data.message : 'Register error',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    return (
        <section className="flex_col items_center justify_center">

            <Alert isVisible={alert.isVisible} status={alert.status} closed={closedAlert}>
                {alert.text}
            </Alert>

            <Card isBordered={true}>

                <div className="flex_col items_center">
                    <span style={{ fontSize: 60 }}> <MdPerson /></span>
                    <h3>Register</h3>
                </div>

                {!isSendCode ?

                    <form className={`${styles.form_auth} flex_col`}>

                        <div>
                            <Input
                                /*  value={user ? user.name : ''} */
                                placeholder="Name"
                                required={true}
                                type="text"
                                setValue={(text: string) => setUser({ ...user, name: text })}
                                icon={<MdPerson />}
                            />
                        </div>

                        <div>
                            <Input
                                /*  value={user ? user.email : ''} */
                                placeholder="Email"
                                required={true}
                                type="email"
                                setValue={(text: string) => setUser({ ...user, email: text })}
                                icon={<MdMail />}
                            />
                        </div>

                        <div>
                            <Input
                                /* value={user ? user.password : ''} */
                                placeholder="Password"
                                required={true}
                                type="password"
                                setValue={(text: string) => setUser({ ...user, password: text })}
                                icon={<MdPassword />}
                            />
                        </div>

                        <div>
                            <Input
                                /* value={confirmPassword} */
                                placeholder="Confirm password"
                                required={true}
                                type="password"
                                setValue={(text: string) => setConfirmPassword(text)}
                                icon={<MdPassword />}
                            />
                        </div>

                        <div className="flex_col items_center">

                            <button
                                type="button"
                                onClick={registerUser}
                                className="button_primary flex_row items_center"
                            >
                                {isLoad && <Load css={{ marginRight: 5 }} size={15} />}
                                <span>Sing in</span>
                            </button>

                            <Link
                                href='/auth/login'
                                style={{ marginTop: 20 }}
                                className="color_info"
                            >
                                Login
                            </Link>

                        </div>

                    </form>
                    :
                    <form className={`${styles.form_auth} flex_col items_center`}>

                        <p className="text-center m-2">A code has been sent to your email, <br /> use it to complete your registration.</p>

                        <div className="mt-7 w-full">
                            <Input
                                placeholder='Code'
                                type="number"
                                required={true}
                                value={code}
                                setValue={(value: number) => setCode(value)}
                            />
                        </div>

                        <div className="flex_row justify_center">

                            <button
                                type="button"
                                onClick={useCode}
                                className="button_primary flex_row items_center"
                            >
                                {isLoad && <Load css={{ marginRight: 5 }} size={15} />}
                                <span>Use code</span>
                            </button>

                            <button type="button" onClick={registerUser} className="button_secondary">Resend email</button>

                        </div>

                    </form>
                }

            </Card>

        </section>
    );
}

export default Register;