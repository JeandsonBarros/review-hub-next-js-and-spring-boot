import Input from "@/components/Input";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { MdDelete, MdEditSquare, MdMoreVert, MdSearch } from 'react-icons/md';
import styles from '../../../../styles/pages_styles/products.module.css'
import Alert from "@/components/Alert";
import Load from "@/components/Load";
import Modal from "@/components/Modal";
import Pagination from "@/components/Pagination";
import { deleteProduct, findProductByName, getProducts, patchProduct, postProduct } from "@/service/product_service";
import { baseURL } from "@/service/api";
import Dropdown from "@/components/Dropdown";

export default function ProductManagement() {

    const [visibleModalAddProduct, setVisivibleModalAddProduct] = useState(false)
    const [products, setProducts] = useState([])
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
        const response = search ? await findProductByName(search, page - 1) : await getProducts(page - 1)
        setIsLoad(false)

        if (response.data) {
            setTotalPages(response.data.totalPages)
            return setProducts(response.data.content)
        }

        setAlert({ text: response.message, status: response.status, isVisible: true })
    }

    async function addProduct(product) {
        setIsLoad(true)
        const response = await postProduct(product)
        setIsLoad(false)

        listProducts()
        setAlert({ text: response.message, status: response.status, isVisible: true })
        return response
    }

    async function updateProduct(product, id) {
        setIsLoad(true)
        const response = await patchProduct(product, id)
        setIsLoad(false)

        listProducts()
        setAlert({ text: response.message, status: response.status, isVisible: true })
        return response
    }

    async function removeProduct(id) {
        setIsLoad(true)
        const response = await deleteProduct(id)
        setIsLoad(false)
        setAlert({ text: response.message, status: response.status, isVisible: true })
        listProducts()
    }

    return (
        <section>

            <div className='flex_row items_center justify_between wrap'>
                <h1>Product management</h1>
                <Input
                    placeholder="Search product"
                    icon={<MdSearch />}
                    setValue={text => router.push(`./1` + (text ? `?search=${text}` : ``))}
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
                            <Product
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
                    onPress={(value) => router.push("./" + value + (search ? `?search=${search}` : ``))}
                />
            </div>

        </section>
    );
}

function Product({ product, updateProduct, removeProduct }) {

    const [visibleModalProduct, setVisivibleModalProduct] = useState(false)
    const [isVisibleConfirmModal, setIsVisibleConfirmModal] = useState(false)

    return (
        <div>

            <div className={`${styles.item_list} flex_row justify_between`}>

                <div className='flex_row items_center'>

                    <img src={product.imgName ? `${baseURL}/product/get-img/${product.imgName}` : "/img/card-image.svg"} className={styles.img_select} />

                    <div>

                        <h3>{product.name}</h3>

                        <p style={{ marginTop: 10 }}>
                            {(() => {
                                return product.price.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
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
                            <button type="button" className="button_primary" onClick={() => removeProduct(product.id)}>Confirm</button>
                            <button type="button" className="button_secondary" onClick={() => setIsVisibleConfirmModal(false)}>Cancel</button>
                        </div>

                    </div>

                </Modal>

            </div>

        </div>
    )
}

function ModalProduct({ productUpdate, onSave, isVisible, onClosed, title }) {

    const [product, setProduct] = useState(productUpdate || {})
    const [previewImage, setPreviewImage] = useState()
    const [alert, setAlert] = useState({ text: '', status: 'info', isVisible: false })

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

    function setDataProduct(value, key) {
        let productData = product
        productData[key] = value
        setProduct({ ...productData })
    }

    async function submitForm(event) {
        event.preventDefault()

        if (!product.name || !product.description || !product.price || !product.category)
            return setAlert({ text: "Do not leave empty fields", status: "warning", isVisible: true })

        if (product.description.length > 570)
            return setAlert({
                text: "The maximum number of characters in the description is 570, you informed " + product.description.length,
                status: "warning",
                isVisible: true
            })

        const response = await onSave({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            img: product.img
        })

        if (response.status === 'success') onClosed()
    }

    return (

        <Modal isVisible={isVisible} onClosed={onClosed}>

            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            <div className={styles.container_modal_product}>

                <form onSubmit={submitForm}>

                    <h1> {title || "Form product"} </h1>

                    <Input placeholder="Name" value={product.name || ''} setValue={text => setDataProduct(text, 'name')} required={true} />

                    <Input placeholder="Category" value={product.category || ''} setValue={text => setDataProduct(text, 'category')} required={true} />

                    <Input placeholder="Price" value={product.price || ''} setValue={text => setDataProduct(text, 'price')} type="number" required={true} />

                    <div >
                        <label>Description:</label>
                        <textarea
                            rows="4"
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

                    <button type='submit' className='button_primary'> Save </button>

                </form>

            </div>

        </Modal>
    )
}