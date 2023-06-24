import styles from '../styles/components_styles/card.module.css';

function Card({ children, isBordered, css }) {
    return (
        <div style={css} className={isBordered ? styles.card_boder : styles.card}>
            {children}
        </div>
    );
}

export default Card;