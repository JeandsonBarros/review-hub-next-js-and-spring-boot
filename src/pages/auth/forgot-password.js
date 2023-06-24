import Alert from '@/components/Alert';
import Card from '@/components/Card';
import Input from '@/components/Input';
import Load from '@/components/Load';
import { changeForgottenPassword, sendEmail } from '@/service/auth_service';
import { useState } from 'react';
import { MdMail, MdPassword } from 'react-icons/md';

import styles from '../../styles/pages_styles/auth.module.css';
import Link from 'next/link';

function ForgotPassword() {

    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })
    const [isLoad, setIsLoad] = useState(false)
    const [isSendCode, setIsSendCode] = useState(false)
    const [isRestorationSuccessful, setIsRestorationSuccessful] = useState(false)
    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [recoveryCode, setRecoveryCode] = useState()

    const closedAlert = () => {
        setAlert({ text: '', status: 'info', isVisible: false })
    }

    async function sendCode() {

        if (!email)
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true })

        setIsLoad(true)
        const response = await sendEmail(email)
        setIsLoad(false)

        setAlert({ text: response.message, status: response.status, isVisible: true })
        if (response.status === 'success')
            setIsSendCode(true)
    }

    async function changePassword() {

        if (!newPassword || !confirmPassword || !recoveryCode)
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true })

        if (confirmPassword !== newPassword)
            return setAlert({ text: 'Passwords do not match', status: 'warning', isVisible: true })

        setIsLoad(true)
        const response = await changeForgottenPassword(email, newPassword, recoveryCode)
        setIsLoad(false)

        setAlert({ text: response.message, status: response.status, isVisible: true })
        if (response.status === 'success')
            setIsRestorationSuccessful(true)
    }

    function view() {

        if (isRestorationSuccessful) {
            return (
                <div className={`items_center flex_col`}>
                    <h1>Success</h1>
                    <p style={{ margin: 20 }}>Your password has been successfully reset.</p>
                    <Link href="/auth/login" className='color_info'>Login</Link>
                </div>
            )
        } else if (isSendCode) {
            return (
                <form className={`${styles.form_auth} flex_col justify_center items_center`}>

                    <span style={{ fontSize: 60 }}> <MdPassword /> </span>
                    <h1>Reset password</h1>
                    <p style={{ marginTop: 10 }}>Enter the code that was sent to your email and the new password.</p>

                    <div>
                        <Input
                            value={recoveryCode}
                            placeholder="Code"
                            required={true}
                            type="number"
                            setValue={text => setRecoveryCode(text)}
                        />
                    </div>

                    <div>
                        <Input
                            value={newPassword}
                            placeholder="New password"
                            required={true}
                            type="password"
                            setValue={text => setNewPassword(text)}
                        />
                    </div>

                    <div>
                        <Input
                            value={confirmPassword}
                            placeholder="Confirm password"
                            required={true}
                            type="password"
                            setValue={text => setConfirmPassword(text)}
                        />
                    </div>

                    <button type="button" className="button_primary" onClick={changePassword}>Use code</button>
                    <button type="button" className="button_secondary" onClick={() => setIsSendCode(false)}>Resend code</button>

                </form>
            )
        } else {
            return (
                <form className={`${styles.form_auth} flex_col justify_center items_center`}>

                    <span style={{ fontSize: 60 }}> <MdMail /> </span>
                    <h1>Send email to reset password</h1>
                    <p style={{ marginTop: 10 }}>An email valid for 15 minutes containing a code to reset your password will be sent.</p>

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

                    <button type="button" onClick={sendCode} className="button_primary">Send code to email</button>

                </form>
            )
        }
    }

    return (
        <section className="flex_col items_center justify_center ">

            <Alert isVisible={alert.isVisible} status={alert.status} closed={closedAlert}>
                {alert.text}
            </Alert>

            {isLoad && <div className={styles.div_loading}> <Load /> </div>}

            <Card isBordered={true}>
                {view()}
            </Card>

        </section>
    );
}

export default ForgotPassword;