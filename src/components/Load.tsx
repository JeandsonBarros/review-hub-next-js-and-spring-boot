import { CSSProperties } from 'react';

import styles from '../styles/components_styles/load.module.css';

interface LoadProps {
    size?: number,
    css?: CSSProperties
}

export default function Load({ size, css }: LoadProps) {
    return (<div style={{ ...css, height: size || 25, width: size || 25 }} className={styles.load} />);
}

