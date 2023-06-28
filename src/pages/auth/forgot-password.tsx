import Link from 'next/link';
import { useState } from 'react';
import { MdMail, MdPassword } from 'react-icons/md';

import Alert from '../../components/Alert';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Load from '../../components/Load';
import { changeForgottenPassword, sendEmail } from '../../service/auth_service';
import styles from '../../styles/pages_styles/auth.module.css';

function ForgotPassword() {

    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })
    const [isLoad, setIsLoad] = useState(false)
    const [isSendCode, setIsSendCode] = useState(false)
    const [isRestorationSuccessful, setIsRestorationSuccessful] = useState(false)
    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [recoveryCode, setRecoveryCode] = useState<number>()

    const closedAlert = () => {
        setAlert({ text: '', status: 'info', isVisible: false })
    }

    async function sendCode() {

        if (!email) {
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true })
        }

        setIsLoad(true)

        try {
            const responseMessage = await sendEmail(email)
            setIsSendCode(true)
            setAlert({ text: responseMessage, status: "success", isVisible: true })
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error sending code to email',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    async function changePassword() {

        if (!newPassword || !confirmPassword || !recoveryCode) {
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true })
        }
        if (confirmPassword !== newPassword) {
            return setAlert({ text: 'Passwords do not match', status: 'warning', isVisible: true })
        }

        setIsLoad(true)

        try {
            const responseMessage = await changeForgottenPassword(email, newPassword, recoveryCode)
            setAlert({ text: responseMessage, status: "success", isVisible: true })
            setIsRestorationSuccessful(true)
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error updating password',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    function viewJSX(): JSX.Element {

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
                            placeholder="Code"
                            required={true}
                            type="number"
                            setValue={(text: number) => setRecoveryCode(text)}
                        />
                    </div>

                    <div>
                        <Input
                            placeholder="New password"
                            required={true}
                            type="password"
                            setValue={(text: string) => setNewPassword(text)}
                        />
                    </div>

                    <div>
                        <Input
                            placeholder="Confirm password"
                            required={true}
                            type="password"
                            setValue={(text: string) => setConfirmPassword(text)}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={changePassword}
                        className="button_primary flex_row items_center"
                    >
                        {isLoad && <Load size={15} css={{ marginRight: 5 }} />}
                        <span> Use code</span>
                    </button>

                    <button
                        type="button"
                        className="button_secondary"
                        onClick={() => setIsSendCode(false)}
                    >
                        Resend code
                    </button>

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
                            placeholder="Email"
                            required={true}
                            type="email"
                            setValue={(text: string) => setEmail(text)}
                            icon={<MdMail />}
                        />
                    </div>

                    <button
                        type="button"
                        onClick={sendCode}
                        className="button_primary flex_row items_center"
                    >
                        {isLoad && <Load size={15} css={{ marginRight: 5 }} />}
                        <span>Send code to email</span>
                    </button>

                </form>
            )
        }
    }

    return (
        <section className="flex_col items_center justify_center ">

            <Alert isVisible={alert.isVisible} status={alert.status} closed={closedAlert}>
                {alert.text}
            </Alert>

            <Card isBordered={true}>
                {viewJSX()}
            </Card>

        </section>
    );
}

export default ForgotPassword;