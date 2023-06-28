import { ReactNode } from 'react';
import { MdCheckCircle, MdInfo, MdOutlineClose, MdOutlineWarning, MdReport } from 'react-icons/md';

import styles from '../styles/components_styles/alert.module.css';

interface AlertProps {
    children: ReactNode,
    status?: string /* "info" | "error" | "warning" | "success" */,
    isVisible: boolean,
    closed: () => void
}

export default function Alert({ children, status, isVisible, closed }: AlertProps) {

    function iconStatus() {

        switch(status){
            case 'info':
                return <MdInfo className={styles.info} />
            case 'success':
                return <MdCheckCircle className={styles.success} />
            case 'warning':
                return <MdOutlineWarning className={styles.warning} />
            case 'error':
                return <MdReport className={styles.error} />
            default:
                return <MdInfo className={styles.info} />
        }

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