import { ReactNode } from 'react';
import { MdOutlineClose } from 'react-icons/md';

import styles from '../styles/components_styles/modal.module.css';

interface ModalProps {
    children: ReactNode,
    onClosed: () => void,
    isVisible: boolean
}

export default function Modal({ children, onClosed, isVisible }: ModalProps) {

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
