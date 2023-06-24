import PropTypes from 'prop-types';
import { MdCheckCircle, MdInfo, MdOutlineClose, MdOutlineWarning, MdReport } from 'react-icons/md';

import styles from '../styles/components_styles/alert.module.css';

export default function Alert({ children, status, isVisible, closed }) {

    function iconStatus() {

        if (status === 'info')
            return <MdInfo className={styles.info} />
        else if (status === 'success')
            return <MdCheckCircle className={styles.success} />
        else if (status === 'warning')
            return <MdOutlineWarning className={styles.warning} />
        else if (status === 'error')
            return <MdReport className={styles.error} />
        else
            return <MdInfo className={styles.info} />

    }

    return (
        <>
            {isVisible &&
                <div className={styles.alert}>

                    <div className={`${styles.header} justify_between items_center`}>

                        <div className='flex_row items_center'>
                            {iconStatus()}
                            <h4>{status.charAt(0).toUpperCase() + status.slice(1)}</h4>
                        </div>

                        <button onClick={closed} className={styles.closed}><MdOutlineClose /></button>

                    </div>

                    <div>{children}</div>

                </div>}
        </>
    );
}

Alert.defaultProps = {
    status: 'info',
    isVisible: true,
}

Alert.propTypes = {
    status: PropTypes.oneOf(["info", "error", "warning", "success", ""]),
    closed: PropTypes.func.isRequired,
    isVisible: PropTypes.bool,
};
