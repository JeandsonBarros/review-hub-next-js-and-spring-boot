import styles from '../styles/components_styles/card.module.css';

interface CardProps {
    children: any,
    isBordered?: boolean,
    css?: any
}

function Card({ children, isBordered, css }: CardProps) {
    return (
        <div style={css} className={isBordered ? styles.card_boder : styles.card}>
            {children}
        </div>
    );
}

export default Card;