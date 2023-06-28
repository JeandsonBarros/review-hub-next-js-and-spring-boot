import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MdMail, MdPassword, MdPerson } from 'react-icons/md';

import Alert from '../../components/Alert';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Load from '../../components/Load';
import { login } from '../../service/auth_service';
import styles from '../../styles/pages_styles/auth.module.css';

function Login() {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoad, setIsLoad] = useState(false)
    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })
    const router = useRouter();

    const closedAlert = () => {
        setAlert({ text: '', status: 'info', isVisible: false })
    }

    async function userLogin() {

        if (!password || !email)
            return setAlert({ text: 'Do not leave empty fields', status: 'warning', isVisible: true })

        setIsLoad(true)

        try {
            await login(email, password)
            router.push("/")
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Login error',
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

                <form className={`${styles.form_auth} flex_col items_center`}>

                    <div className="flex_col items_center">
                        <span style={{ fontSize: 60 }}> <MdPerson /></span>
                        <h3>Login</h3>
                    </div>

                    <div>
                        <Input
                            value={email}
                            placeholder="Email"
                            required={true}
                            type="email"
                            setValue={(text: string) => setEmail(text)}
                            icon={<MdMail />}
                        />
                    </div>

                    <div>
                        <Input
                            value={password}
                            placeholder="Password"
                            required={true}
                            type="password"
                            setValue={(text: string) => setPassword(text)}
                            icon={<MdPassword />}
                        />
                        <Link href="/auth/forgot-password" style={{ fontSize: 12 }} className="color_info">Forgot password?</Link>
                    </div>

                    <div className="flex_col items_center">

                        <button
                            type="button"
                            className="button_primary flex_row items_center"
                            onClick={userLogin}
                        >
                            {isLoad && <Load css={{ marginRight: 5 }} size={15} />}
                            <span>Login</span>
                        </button>

                        <Link
                            href='/auth/register'
                            style={{ marginTop: 20 }}
                            className="color_info"
                        >
                            Sing in
                        </Link>

                    </div>

                </form>

            </Card>

        </section>
    );
}

export default Login;