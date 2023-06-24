import { BsGithub, BsInstagram, BsLinkedin } from 'react-icons/bs';

import style from '../styles/components_styles/footer.module.css';

function Footer() {
    return (
        <footer className={`${style.footer_component} justify_between wrap items_center`} >
            <div className='flex_row'>
                <a href="https://www.linkedin.com/in/jeandson-barros/"  target="_blank"><BsLinkedin /></a>
                <a href="https://github.com/JeandsonBarros"  target="_blank"><BsGithub /></a>
                <a href="https://www.instagram.com/jeandsonbarros/"  target="_blank"><BsInstagram /></a>
            </div>
            <span>&copy; Jeandson Barros - 2023</span>
        </footer>
    );
}

export default Footer;