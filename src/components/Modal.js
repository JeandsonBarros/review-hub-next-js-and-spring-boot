import PropTypes from 'prop-types';
import { MdOutlineClose } from 'react-icons/md';

import styles from '../styles/components_styles/modal.module.css';

export default function Modal({ children, onClosed, isVisible }) {

    return (
        <>
            {
                isVisible &&
                <>
                    <div className={styles.outside_area} onClick={onClosed} ></div>
                    <div className={styles.modal_content}>
                        <button type='button' onClick={onClosed} className={styles.closed}><MdOutlineClose /></button>
                        {children}
                    </div>
                </>
            }
        </>
    );
}

Modal.defaultProps = {
    isVisible: true,
    onClosed: () => console.log("onClosed was not informed!")
}

Modal.propTypes = {
    onClosed: PropTypes.func.isRequired,
    isVisible: PropTypes.bool,
};
