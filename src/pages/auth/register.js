import Alert from '@/components/Alert';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Load from '@/components/Load';
import { completeRegistrationByCode, login, register } from '@/service/auth_service';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdMail, MdPassword, MdPerson } from 'react-icons/md';

import styles from '../../styles/pages_styles/auth.module.css';

function Register() {

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [code, setCode] = useState()
    const [isSendCode, setIsSendCode] = useState(false)
    const router = useRouter();
    const [isLoad, setIsLoad] = useState(false)
    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })

    const closedAlert = () => {
        setAlert({ text: '', status: 'info', isVisible: false })
    }

    async function registerUser() {
       
        if (!name || !password || !confirmPassword || !email)
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true })

        if (confirmPassword !== password)
            return setAlert({ text: 'Passwords do not match', status: 'warning', isVisible: true })

        setIsLoad(true)
        const response = await register(name, email, password)
        setIsLoad(false)

        setAlert({ text: response.message, status: response.status, isVisible: true })
        if (response.status === 'success')
            setIsSendCode(true)
    }

    async function useCode() {

        if (!code)
            return setAlert({ text: 'Code sent to the email is mandatory', status: 'warning' })

        setIsLoad(true)
        const response = await completeRegistrationByCode(email, code)
        setIsLoad(false)

        if (response.status === 'success') {
            const responseLogin = await login(email, password)
            if (responseLogin.status === 'success')
                router.push("/")
        }
        else
            setAlert({ text: response.message, status: response.status, isVisible: true })

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

                <div style={{ marginTop: 10 }}>
                    {isLoad && <Load />}
                </div>

                {!isSendCode ?

                    <form className={`${styles.form_auth} flex_col`}>

                        <div>
                            <Input
                                value={name}
                                placeholder="Name"
                                required={true}
                                type="text"
                                setValue={text => setName(text)}
                                icon={<MdPerson />}
                            />
                        </div>

                        <div>
                            <Input
                                value={email}
                                placeholder="Email"
                                required={true}
                                type="email"
                                setValue={text => setEmail(text)}
                                icon={<MdMail />}
                            />
                        </div>

                        <div>
                            <Input
                                value={password}
                                placeholder="Password"
                                required={true}
                                type="password"
                                setValue={text => setPassword(text)}
                                icon={<MdPassword />}
                            />
                        </div>

                        <div>
                            <Input
                                value={confirmPassword}
                                placeholder="Confirm password"
                                required={true}
                                type="password"
                                setValue={text => setConfirmPassword(text)}
                                icon={<MdPassword />}
                            />
                        </div>

                        <div className="flex_col items_center">
                            <button type="button" onClick={registerUser} className="button_primary">Sing in</button>
                            <Link href='/auth/login' style={{marginTop: 20}} className="color_info">Login</Link>
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
                                setValue={value => setCode(value)}
                            />
                        </div>

                        <div className="flex_row justify_center">
                            <button type="button" onClick={useCode} className="button_primary">Use code</button>
                            <button type="button" onClick={registerUser} className="button_secondary">Resend email</button>
                        </div>

                    </form>
                }

            </Card>

        </section>
    );
}

export default Register;