import Link from 'next/link';
import { CSSProperties } from 'react';
import { MdStar, MdStarHalf, MdStarOutline } from 'react-icons/md';

import { baseURL } from '../service/api';
import styles from '../styles/components_styles/product-card.module.css';
import { Product } from '../types/models/Product';
import Card from './Card';

interface ProductCardProps {
    product: Product,
    css?: CSSProperties
}

export default function ProductCard({ product, css }: ProductCardProps) {

    function starsQuantity() {
        if (product) {

            let stars = []

            for (let c = 1; c <= 5; c++) {

                if (product.averageReviews % Math.floor(product.averageReviews) > 0 && (c - 1) + (product.averageReviews % Math.floor(product.averageReviews)) === product.averageReviews)
                    stars.push(<MdStarHalf key={c} />)
                else if (c <= product.averageReviews)
                    stars.push(<MdStar key={c} />)
                else
                    stars.push(<MdStarOutline key={c} />)

            }

            return (<div className={styles.div_stars}>{stars}</div>)

        }
    }

    return (
        <div className={styles.link} style={css}>
            <Link href={`/product/details/${product.id}`} >
                <Card isBordered>
                    <div className={styles.content_card}>
                        <img src={product.imgName ? `${baseURL}/product/get-img/${product.imgName}` : "/img/product-icon.webp"} />
                        <div>
                            <small> {product.name.length <= 70 ? product.name : product.name.slice(0, 70) + "..."}</small>
                            <h3> {product.price.toLocaleString("en-US", { style: "currency", currency: "USD" })} </h3>
                            {starsQuantity()}
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
    );
}
