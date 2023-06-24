import Alert from "@/components/Alert";
import Pagination from "@/components/Pagination";
import { findProductByName } from "@/service/product_service";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../../../../styles/pages_styles/products.module.css';
import ProductCard from "@/components/ProductCard";

function ProductSearch() {

    const router = useRouter()
    const name = router.query.name;
    const page = Number(router.query.page)
    const [totalPages, setTotalPages] = useState(0)
    const [products, setProducts] = useState([])
    const [alert, setAlert] = useState({ text: '', status: '', isVisible: false })

    useEffect(() => { if (name) searchProduct() }, [name, page])

    async function searchProduct() {
        const response = await findProductByName(name, page - 1, 39)

        if (response.data) {
            setProducts(response.data.content)
            setTotalPages(response.data.totalPages)
        } else {
            setAlert({ text: response.message, status: response.status, isVisible: true })
        }

    }

    return (
        <section>
            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            <h1 className={styles.title}>Search by: {name}</h1>
            <div className={`${styles.list_product_category}`} >
                {
                    products.length > 0 &&
                    <div className="flex_row justify_center wrap">
                        {products.map(product => <ProductCard css={{ margin: 10 }} key={product.id} product={product} />)}
                    </div>
                }
            </div>

            <div className='justify_center' style={{ marginTop: 10 }}>
                <Pagination
                    totalPages={totalPages}
                    actualPage={page}
                    onPress={(value) => router.push("/product/search/" + name + "/page/" + value)}
                />
            </div>
        </section>
    );
}

export default ProductSearch;