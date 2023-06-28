import { CSSProperties, ReactNode } from 'react';

import styles from '../styles/components_styles/card.module.css';

interface CardProps {
    children: ReactNode,
    isBordered?: boolean,
    css?: CSSProperties
}

function Card({ children, isBordered, css }: CardProps) {
    return (
        <div style={css} className={isBordered ? styles.card_boder : styles.card}>
            {children}
        </div>
    );
}

export default Card;