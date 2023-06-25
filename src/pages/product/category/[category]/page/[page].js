import Alert from "@/components/Alert";
import ProductCard from "@/components/ProductCard";
import { getProductByCategory } from "@/service/product_service";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../../../../styles/pages_styles/products.module.css';
import Pagination from "@/components/Pagination";
import Load from "@/components/Load";

function Category() {

    const router = useRouter()
    const page = Number(router.query.page)
    const [totalPages, setTotalPages] = useState(0)
    const category = router.query.category
    const [products, setProducts] = useState([])
    const [alert, setAlert] = useState({ text: '', status: '', isVisible: false })
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (category) listProducts()
    }, [category, page])

    async function listProducts() {

        let categoryFind = category.charAt(0).toUpperCase() + category.slice(1);

        setIsLoading(true)
        const response = await getProductByCategory(categoryFind, page - 1, 30)
        setIsLoading(false)

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

            <h1 className={styles.title}>{category && category.charAt(0).toUpperCase() + category.slice(1)}</h1>
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
                    onPress={(value) => router.push("/product/category/" + category + "/page/" + value)}
                />
            </div>

        </section >
    );
}

export default Category;