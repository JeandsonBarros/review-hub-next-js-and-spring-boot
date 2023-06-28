import { useRouter } from 'next/router';
import { FormEvent, useEffect, useState } from 'react';
import { MdDelete, MdEditSquare, MdMoreVert, MdSearch } from 'react-icons/md';

import Alert from '../../../../components/Alert';
import Dropdown from '../../../../components/Dropdown';
import Input from '../../../../components/Input';
import Load from '../../../../components/Load';
import Modal from '../../../../components/Modal';
import Pagination from '../../../../components/Pagination';
import { baseURL } from '../../../../service/api';
import {
    deleteProduct,
    findProductByName,
    getProducts,
    patchProduct,
    postProduct,
} from '../../../../service/product_service';
import styles from '../../../../styles/pages_styles/products.module.css';
import { ProductDTO } from '../../../../types/dtos/ProductDTO';
import { Product } from '../../../../types/models/Product';

interface ProductItemProps {
    product: Product,
    updateProduct: (productDTO: ProductDTO, id: Number) => Promise<void>,
    removeProduct: (id: Number) => Promise<void>,
}
interface ModalProductProps {
    productUpdate?: Product,
    onSave: (productDTO: ProductDTO) => Promise<void>,
    isVisible: boolean,
    onClosed: () => void,
    title: string
}

export default function ProductManagement() {

    const [visibleModalAddProduct, setVisivibleModalAddProduct] = useState(false)
    const [products, setProducts] = useState<Product[]>([])
    const [isLoad, setIsLoad] = useState(false)
    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })
    const router = useRouter()
    const page = Number(router.query.page)
    const search = router.query.search
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        listProducts()
    }, [page, search])

    async function listProducts() {
        setIsLoad(true)

        try {
            const pageProducts = search ? await findProductByName(String(search), page - 1) : await getProducts(page - 1)
            setTotalPages(pageProducts.totalPages)
            setProducts(pageProducts.content)
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error getting products',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    async function addProduct(productDTO: ProductDTO) {

        const respMessage = await postProduct(productDTO)
        setAlert({ text: respMessage, status: 'success', isVisible: true })
        listProducts()

    }

    async function updateProduct(productDTO: ProductDTO, id: Number) {

        const respMessage = await patchProduct(productDTO, id)
        setAlert({ text: respMessage, status: 'success', isVisible: true })
        listProducts()

    }

    async function removeProduct(id: number) {

        setIsLoad(true)

        try {
            const respMessage = await deleteProduct(id)
            setAlert({ text: respMessage, status: 'success', isVisible: true })
            listProducts()
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error deleting product',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    return (
        <section>

            <div className='flex_row items_center justify_between wrap'>
                <h1>Product management</h1>
                <Input
                    placeholder="Search product"
                    icon={<MdSearch />}
                    setValue={(text: string) => router.push(`./1` + (text ? `?search=${text}` : ``))}
                />
            </div>

            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            {
                isLoad &&
                <div className={styles.div_loading}>
                    <Load />
                </div>
            }

            {/* Modal add product */}
            <ModalProduct
                isVisible={visibleModalAddProduct}
                onClosed={() => setVisivibleModalAddProduct(false)}
                onSave={addProduct}
                title="Add product"
            />

            <div className={styles.product_list}>
                {products.length > 0
                    ? products.map(product => {
                        return (
                            <ProductItem
                                key={product.id}
                                product={product}
                                removeProduct={removeProduct}
                                updateProduct={updateProduct}
                            />
                        )
                    })
                    : <p style={{ textAlign: 'center' }}> Not a product found </p>
                }
            </div>

            <button
                title="Add new product"
                className={`${styles.add_button} rounded button_primary`}
                onClick={() => setVisivibleModalAddProduct(true)}>
                +
            </button>

            <div className='justify_center' style={{ marginTop: 10 }}>
                <Pagination
                    totalPages={totalPages}
                    actualPage={page}
                    onPress={(value: number) => router.push("./" + value + (search ? `?search=${search}` : ``))}
                />
            </div>

        </section>
    );
}

function ProductItem({ product, updateProduct, removeProduct }: ProductItemProps) {

    const [visibleModalProduct, setVisivibleModalProduct] = useState(false)
    const [isVisibleConfirmModal, setIsVisibleConfirmModal] = useState(false)
    const [isLoad, setIsLoad] = useState(false)

    return (
        <div>

            <div className={`${styles.item_list} flex_row justify_between`}>

                <div className='flex_row items_center'>

                    <img src={product.imgName ? `${baseURL}/product/get-img/${product.imgName}` : "/img/product-icon.webp"} className={styles.img_select} />

                    <div>

                        <h3>{product.name}</h3>

                        <p style={{ marginTop: 10 }}>
                            {(() => {
                                return product.price.toLocaleString("en-US", { style: "currency", currency: "USD" });
                            })()}
                        </p>

                        <small>{product.category}</small>

                    </div>

                </div>

                <Dropdown
                    activationButton={
                        <span className='icon_button' >
                            <MdMoreVert style={{ fontSize: 20 }} />
                        </span>
                    }>

                    <div style={{ padding: 5, display: 'flex', flexDirection: 'column' }}>

                        <button
                            className='icon_button'
                            onClickCapture={() => setVisivibleModalProduct(true)}>
                            <MdEditSquare />
                            Edit
                        </button>

                        <button
                            className='icon_button'
                            onClick={() => setIsVisibleConfirmModal(true)}>
                            <MdDelete />Delete
                        </button>

                    </div>

                </Dropdown>

                <ModalProduct
                    title="Update product"
                    isVisible={visibleModalProduct}
                    onClosed={() => setVisivibleModalProduct(false)}
                    productUpdate={product}
                    onSave={(productParam) => updateProduct(productParam, product.id)}
                />

                {/* Delete product confirmation modal */}
                <Modal isVisible={isVisibleConfirmModal} onClosed={() => setIsVisibleConfirmModal(false)}>

                    <div className={styles.container_modal_product}>

                        <h1>Delete product</h1>

                        <p>By deleting the product "{product.name}",
                            all product data and related data will be permanently removed.
                            Do you really want to continue?</p>

                        <div className="flex_row">

                            <button
                                type="button"
                                className="button_primary flex_row items_center"
                                onClick={async () => {
                                    setIsLoad(true)
                                    await removeProduct(product.id)
                                    setIsLoad(false)
                                    setIsVisibleConfirmModal(false)
                                }}>
                                {isLoad && <Load size={15} css={{ marginRight: 5 }} />}
                                <span>Confirm</span>
                            </button>

                            <button
                                type="button"
                                className="button_secondary"
                                onClick={() => setIsVisibleConfirmModal(false)}>
                                Cancel
                            </button>

                        </div>

                    </div>

                </Modal>

            </div>

        </div>
    )
}

function ModalProduct({ productUpdate, onSave, isVisible, onClosed, title }: ModalProductProps) {

    const [product, setProduct] = useState<Product | any>(productUpdate || {})
    const [previewImage, setPreviewImage] = useState<string | undefined>()
    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })
    const [isLoad, setIsLoad] = useState(false)

    useEffect(() => {

        if (!product.img) {
            setPreviewImage(undefined)
            return
        }

        const objectUrl = URL.createObjectURL(product.img)
        setPreviewImage(objectUrl)

        // free memory when ever this component is unmounted
        return () => URL.revokeObjectURL(objectUrl)

    }, [product.img])

    function setDataProduct(value: any, key: string) {
        let productData = product
        productData[key] = value
        setProduct({ ...productData })
    }

    async function submitForm(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!product.name || !product.description || !product.price || !product.category) {
            return setAlert({ text: "Do not leave empty fields", status: "warning", isVisible: true })
        }

        if (product.description.length > 570) {
            return setAlert({
                text: "The maximum number of characters in the description is 570, you informed " + product.description.length,
                status: "warning",
                isVisible: true
            })
        }

        setIsLoad(true)

        try {

            await onSave({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                img: product.img
            })

            onClosed()

        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : 'Error saveing product',
                status: 'error',
                isVisible: true
            })
        }

        setIsLoad(false)

    }

    return (

        <Modal isVisible={isVisible} onClosed={onClosed}>

            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            <div className={styles.container_modal_product}>

                <form onSubmit={submitForm}>

                    <h1> {title || "Form product"} </h1>

                    <Input
                        placeholder="Name"
                        value={product.name || ''}
                        setValue={(text: string) => setDataProduct(text, 'name')}
                        required={true}
                    />

                    <Input
                        placeholder="Category"
                        value={product.category || ''}
                        setValue={(text: string) => setDataProduct(text, 'category')}
                        required={true}
                    />

                    <Input
                        placeholder="Price"
                        value={product.price || NaN}
                        setValue={(text: number) => setDataProduct(text, 'price')}
                        type="number"
                        required={true}
                    />

                    <div >
                        <label>Description:</label>
                        <textarea
                            rows={4}
                            onChange={event => setDataProduct(event.target.value, "description")}
                            value={product.description || ''}
                        />
                        <small>{product?.description ? product.description.length : 0}/570</small>
                    </div>

                    <div className="flex_row wrap items_center">

                        <label htmlFor="input_file" title="Select image" className={`${styles.label_input_file} flex_col`}>
                            <img className={styles.img_select} src={previewImage || (product.imgName ? `${baseURL}/product/get-img/${product.imgName}` : "/img/card-image.svg")} />
                        </label>

                        <input
                            type="file"
                            name="arquivo"
                            id="input_file"
                            className={styles.input_file}
                            accept="image/png, image/jpeg, image/gif, image/jpg, image/webp"
                            onChange={event => {
                                if (!event.target.files || event.target.files.length === 0) {
                                    setDataProduct(undefined, "img")
                                    return
                                }
                                // I've kept this example simple by using the first image instead of multiple
                                setDataProduct(event.target.files[0], "img")
                            }}
                        />

                    </div>

                    <hr />

                    <button type='submit' className='button_primary flex_row items_center'>
                        {isLoad && <Load size={15} css={{ marginRight: 5 }} />}
                        <span>Save</span>
                    </button>

                </form>

            </div>

        </Modal>
    )
}