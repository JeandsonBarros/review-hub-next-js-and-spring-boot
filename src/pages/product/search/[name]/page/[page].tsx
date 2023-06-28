import Alert from "../../../../../components/Alert";
import Pagination from "../../../../../components/Pagination";
import { findProductByName } from "../../../../../service/product_service";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../../../../styles/pages_styles/products.module.css';
import ProductCard from "../../../../../components/ProductCard";
import Load from "../../../../../components/Load";
import { Product } from "../../../../../types/models/Product";

function ProductSearch() {

    const router = useRouter()
    const name = String(router.query.name);
    const page = Number(router.query.page)
    const [totalPages, setTotalPages] = useState(0)
    const [products, setProducts] = useState<Product[]>([])
    const [alert, setAlert] = useState({ text: '', status: '', isVisible: false })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => { if (name) searchProduct() }, [name, page])

    async function searchProduct() {

        setIsLoading(true)

        try {
            const pageProduct = await findProductByName(name, page - 1, 39)
            setProducts(pageProduct.content)
            setTotalPages(pageProduct.totalPages)
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error getting products',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoading(false)

    }

    return (
        <section>
            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            <h1 className={styles.title}>Search by: {name}</h1>
            <div className={`${styles.list_product_category} flex_row justify_center wrap`} >
                {isLoading
                    ? <Load />
                    : <>
                        {products.map(product => <ProductCard css={{ margin: 10 }} key={product.id} product={product} />)}
                    </>
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