import Head from 'next/head';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

import { getDataAccount } from '../service/auth_service';
import Footer from './Footer';
import Header from './Header';

interface MainContainerProps {
    children: ReactNode
}

function MainContainer({ children }: MainContainerProps) {

    const [theme, setTheme] = useState("light");
    const pathname = usePathname();
    const router = useRouter();
    const [titleTab, setTitleTab] = useState('')

    useEffect(() => {

        if (pathname) {

            const token = localStorage.getItem('token')

            let path = pathname
            if (path.includes("/page"))
                path = path.split("/page")[0]

            switch (path) {
                case "/auth/login":
                    setTitleTab("ReviewRub - Login");
                    if (token) router.push("/");
                    break;
                case "/auth/register":
                    setTitleTab("ReviewRub - Register");
                    if (token) router.push("/");
                    break;
                case "/auth/account":
                    setTitleTab("ReviewRub - Account");
                    if (!token) router.push("/auth/login");
                    break;
                case "/auth/users":
                    setTitleTab("ReviewRub - Users");
                    if (!token) router.push("/auth/login");
                    else isAuthorized()
                    break;
                case "/auth/forgot-password":
                    setTitleTab("ReviewRub - Forgot password");
                    if (token) router.push("/");
                    break;
                case "/product/management":
                    setTitleTab("ReviewRub - Product Management");
                    if (!token) router.push("/auth/login");
                    else isAuthorized()
                    break;
                case "/review/your-reviews":
                    setTitleTab("ReviewRub - Your reviews");
                    if (!token) router.push("/auth/login");
                    break;
                default:
                    setTitleTab("ReviewRub");
            }
        }

    }, [pathname]);

    useEffect(() => {

        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const localTheme = localStorage.getItem("theme");

        if (localTheme) {
            setTheme(localTheme);
        } else {
            localStorage.setItem("theme", systemTheme);
            setTheme(systemTheme);
        }

    }, []);

    const toggleTheme = () => {
        if (theme === "light") {
            localStorage.setItem("theme", "dark");
            setTheme("dark");
        } else {
            localStorage.setItem("theme", "light");
            setTheme("light");
        }
    };

    /* Checks if the logged in user is authorized to access a certain route,
     if not, it is redirected to the home page */
    async function isAuthorized() {

        try {
            const userData = await getDataAccount()
            if (userData.role === "USER") router.push("/")
        } catch (error) {
            console.log(error);
            router.push("/")
        }

    }

    return (
        <article className={theme === "light" ? 'light-theme' : 'dark-theme'}>
            <Head>
                <title>{titleTab}</title>
            </Head>
            <Header themeChange={toggleTheme} theme={theme} />
            <main>
                {children}
            </main>
            <Footer />
        </article>
    );
}

export default MainContainer;