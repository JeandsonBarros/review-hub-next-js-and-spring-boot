import Link from "next/link";
import Card from "./Card";
import { MdStar, MdStarHalf, MdStarOutline } from "react-icons/md";
import styles from "../styles/components_styles/product-card.module.css";
import { baseURL } from "@/service/api";

function ProductCard({ product, css }) {

    function starsQuantity() {
        if (product) {

            let stars = []
            
            for (let c = 1; c <= 5; c++) {

                if (product.averageRating % Math.floor(product.averageRating) > 0 && (c - 1) + (product.averageRating % Math.floor(product.averageRating)) === product.averageRating)
                    stars.push(<MdStarHalf key={c} />)
                else if (c <= product.averageRating)
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
                            <h3>
                                {(() => {
                                    return product.price.toLocaleString("en-US", {style:"currency", currency:"USD"});
                                })()}
                            </h3>
                            {starsQuantity()}
                        </div>
                    </div>
                </Card>
            </Link>
        </div>
    );
}

export default ProductCard;