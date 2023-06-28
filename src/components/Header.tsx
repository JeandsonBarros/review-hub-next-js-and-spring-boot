import { baseURL } from '../service/api';
import { getDataAccount } from '../service/auth_service';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { MdBrightness2, MdReviews, MdSearch, MdSunny, MdOutlineClose } from 'react-icons/md';

import headerStyles from '../styles/components_styles/header.module.css';
import Dropdown from './Dropdown';
import Load from './Load';
import { User } from '../types/models/User';

function Header({ themeChange, theme }) {

    const [isLogged, setIsLogged] = useState(false)
    const [search, setSearch] = useState("")
    const [userData, setUserData] = useState<User>()
    const [isLoading, setIsLoading] = useState(false)
    const [visibleSearchSmallScreen, setVisibleSearchSmallScreen] = useState(false)
    const refInputSearchSmallScreen = useRef<any>()
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {

        if (pathname === "/auth/login" || pathname === "/auth/register" || pathname === "/auth/forgot-password") {
            setIsLogged(false)
        } else {
            getUserData()
        }

    }, [theme, pathname])

    useEffect(() => {
        if (visibleSearchSmallScreen) refInputSearchSmallScreen.current.focus()
    }, [visibleSearchSmallScreen])

    async function getUserData() {

        setIsLoading(true)

        if (localStorage.getItem("token")) {

            setIsLogged(true)

            try {
                const response = await getDataAccount()
                setUserData(response)
            } catch (error) {
                console.log(error);
            }

        } else {
            setIsLogged(false)
        }

        setIsLoading(false)

    }

    function logout() {
        localStorage.removeItem("token")
        setIsLogged(false)
        router.push("/")
    }

    function searchProduct() {
        search ? router.push(`/product/search/${search}/page/1`) : router.push(`/`)
    }

    function viewAuthOptions() {
        if (isLogged) {
            return (
                <Dropdown activationButton={

                    <button className='icon_button'>
                        <img
                            src={(userData && userData.profileImageName) ? `${baseURL}/auth/get-img/${userData.profileImageName}` : "/img/person-circle.svg"}
                            className="img_profile_view"
                        />
                    </button>

                }>

                    <div style={{ padding: 5, display: 'flex', flexDirection: 'column' }}>

                        <Link href="/auth/account" className='icon_button'>Account config</Link>
                        <Link href="/review/your-reviews/page/1" className='icon_button'>Your reviews</Link>

                        {(userData && userData.role !== "USER") &&
                            <>
                                <Link href="/auth/users/page/1" className='icon_button'>List all users</Link>
                                <Link href="/product/management/page/1" className='icon_button'>Product management</Link>
                            </>
                        }

                        <button onClick={logout} className='icon_button color_error'>Logout</button>

                    </div>

                </Dropdown>
            )
        } else {
            return (
                <div className='flex_row'>
                    <Link href="/auth/login" className="button_primary">Login</Link>
                    <Link href="/auth/register" className="button_secondary">Sing in</Link>
                </div>
            )
        }
    }

    return (
        <header className={`${headerStyles.header_component}`}>

            <div className={`justify_between wrap items_center`}>

                <Link href="/" className={`${headerStyles.logo} flex_row items_center`}> <MdReviews /> <span>ReviewHub</span> </Link>

                {(pathname != "/auth/login" && pathname != "/auth/register" && pathname != "/auth/forgot-password") &&
                    <div className={headerStyles.search}>

                        <input
                            type="search"
                            placeholder="Search product"
                            onFocus={event => event.currentTarget.style.border = '1px solid #f8b068'}
                            onBlur={event => event.currentTarget.style.border = '1px solid #a7a7a7'}
                            onChange={event => setSearch(event.target.value)}
                            onKeyUp={event => { if (event.key === 'Enter') searchProduct() }}
                        />

                        <button onClick={searchProduct}>
                            <MdSearch />
                        </button>

                    </div>
                }

                <div className='flex_row items_center'>

                    {(pathname != "/auth/login" && pathname != "/auth/register" && pathname != "/auth/forgot-password") &&
                        <div className={headerStyles.show_search}>
                            <button
                                className="icon_button"
                                onClick={() => setVisibleSearchSmallScreen(!visibleSearchSmallScreen)}
                            >
                                {visibleSearchSmallScreen ? <MdOutlineClose /> : <MdSearch />}
                            </button>
                        </div>
                    }

                    <button
                        className='icon_button'
                        title="change theme"
                        onClick={themeChange}>
                        {theme == 'dark' ? <MdBrightness2 /> : <MdSunny />}
                    </button>

                    <div className={headerStyles.vertical_line} />

                    {isLoading ? <Load /> : viewAuthOptions()}

                </div>

            </div>

            {
                visibleSearchSmallScreen &&
                <div className={headerStyles.search_small_screen}>
                    <input
                        ref={refInputSearchSmallScreen}
                        type='search'
                        value={search}
                        placeholder="Search product"
                        onChange={event => setSearch(event.target.value)}
                        onKeyUp={event => { if (event.key === 'Enter') searchProduct() }}
                    />
                    <button onClick={searchProduct} className='icon_button'><MdSearch /></button>
                </div>
            }

        </header >
    );
}


export default Header;