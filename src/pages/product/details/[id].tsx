import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MdStar, MdStarHalf, MdStarOutline } from 'react-icons/md';

import Alert from '../../../components/Alert';
import Card from '../../../components/Card';
import Pagination from '../../../components/Pagination';
import { baseURL } from '../../../service/api';
import { getProduct } from '../../../service/product_service';
import {
    deleteReview,
    getProductReviewStatistics,
    getReviewsByProduct,
    postReview,
    putReview,
    selectUserReviewByProduct,
} from '../../../service/review_service';
import stylesProducts from '../../../styles/pages_styles/products.module.css';
import stylesReviews from '../../../styles/pages_styles/reviews.module.css';
import { Product } from '../../../types/models/Product';
import { ProductReviewStatistics } from '../../../types/models/ProductReviewStatistics';
import { Review } from '../../../types/models/Review';

export default function productDetails() {

    const router = useRouter()
    const id = Number(router.query.id)
    const [product, setProduct] = useState<Product>()
    const [isLogged, setIsLogged] = useState(false)
    const [reviews, setReviews] = useState<Review[]>([])
    const [reviewStatistics, setReviewStatistics] = useState<ProductReviewStatistics>()
    const [userReview, setUserReview] = useState<Review>()
    const [alert, setAlert] = useState({ text: '', status: '', isVisible: false })
    const [pagination, setPagination] = useState({ page: 0, totalPages: 0 })
    const [quantityStars, setQuantityStars] = useState<number | null>(null)

    useEffect(() => { if (id) getAllData() }, [id, quantityStars])

    const getAllData = () => {
        listReviews()
        getProductData()
        getUserReview()
        getSatatistics()
    }

    async function getProductData() {

        try {
            const productData = await getProduct(id)
            setProduct(productData)
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : "Error geting product",
                status: 'error',
                isVisible: true
            })
        }
    }

    async function getUserReview() {

        if (localStorage.getItem('token')) {
            try {
                setIsLogged(true)
                const responseUserReview = await selectUserReviewByProduct(id)
                setUserReview(responseUserReview)
            } catch (error) {
                console.log(error.response.status);
            }
        }

    }

    async function listReviews(page = 1) {

        try {
            const response = await getReviewsByProduct(id, page - 1, 10, quantityStars)
            setPagination({ page: page, totalPages: response.totalPages })
            setReviews(response.content)

        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : "Error geting reviews",
                status: 'error',
                isVisible: true
            })
        }

    }

    async function getSatatistics() {
        try {
            const response = await getProductReviewStatistics(id)
            setReviewStatistics(response)
        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : "Error geting satatistics",
                status: 'error',
                isVisible: true
            })
        }
    }

    async function saveReview() {

        if (!userReview.note) {
            return setAlert({ text: "Note is required", status: "warning", isVisible: true })
        }
        if (userReview?.comment && userReview.comment.length > 570) {
            return setAlert({
                text: "The maximum number of characters in the comment is 570, you informed " + userReview.comment.length,
                status: "warning",
                isVisible: true
            })
        }

        try {
            const response = await postReview({ ...userReview, productId: id })
            setAlert({ text: response, status: "success", isVisible: true })
            getAllData()

        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : "Error saveing review",
                status: 'error',
                isVisible: true
            })
        }

    }

    async function updateReview() {

        if (!userReview.note) {
            return setAlert({ text: "Note is required", status: "warning", isVisible: true })
        }
        if (userReview?.comment && userReview.comment.length > 570) {
            return setAlert({
                text: "The maximum number of characters in the comment is 570, you informed " + userReview.comment.length,
                status: "warning",
                isVisible: true
            })
        }

        try {
            const response = await putReview(userReview.id, { comment: userReview.comment, note: userReview.note, productId: id })
            setAlert({ text: response, status: 'success', isVisible: true })
            getAllData()

        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : "Error updating review",
                status: 'error',
                isVisible: true
            })
        }

    }

    async function deleteUserReview() {

        try {
            const responseMessage = await deleteReview(userReview.id)
            setAlert({ text: responseMessage, status: 'success', isVisible: true })
            getAllData()
            setUserReview(null)

        } catch (error) {
            setAlert({
                text: error.response ? error.response.data.message : "Error deleting review",
                status: 'error',
                isVisible: true
            })
        }

    }

    function starsQuantityJSX(note: number): JSX.Element {

        let stars = []

        for (let c = 1; c <= 5; c++) {

            if (note % Math.floor(note) > 0 && (c - 1) + (note % Math.floor(note)) === note)
                stars.push(<MdStarHalf key={c} />)
            else if (c <= note)
                stars.push(<MdStar key={c} />)
            else
                stars.push(<MdStarOutline key={c} />)

        }

        return (<div className={stylesReviews.stars}>{stars}</div>)

    }

    function inputsStarsJSX(): JSX.Element {

        let inputs = []
        for (let i = 5; i >= 1; i--) {

            inputs.push(
                <input
                    key={`input-start-${i}`}
                    type="radio"
                    name="stars"
                    id={`start-${i}`}
                    checked={userReview ? userReview.note == i : false}
                    onChange={() => setUserReview({ ...userReview, note: i })}
                />
            )
            inputs.push(<label key={`label-start-${i}`} title={`${i} stars`} htmlFor={`start-${i}`}><MdStar /></label>)
        }

        return (<div className={`${stylesReviews.stars}`} >{inputs}</div>)

    }

    function statisticsReviewsJSX(): JSX.Element[] {

        let listProgress = []
        for (let c = 5; c >= 1; c--) {

            listProgress.push(
                <div key={c} className='items_center' style={{ marginBottom: 5 }}>
                    <label htmlFor="file" className='items_center'>{c} <MdStar /></label>
                    <div className={`${stylesReviews.progress_container} items_center`}>
                        <div style={{ width: `${((reviewStatistics.quantityOfEachNote[c] / reviewStatistics.totalReviews) * 100)}%` }} />
                    </div>
                    <small>({reviewStatistics.quantityOfEachNote[c]})</small>
                </div>
            )
        }

        return listProgress

    }

    function buttonsListReviewsByStarsJSX(): JSX.Element[] {
        let buttons = []
        for (let i = 5; i >= 1; i--) {
            let text = i == 1 ? i + " star" : i + " stars"
            buttons.push(
                <button
                    key={i}
                    className={i == quantityStars ? "button_primary" : "button_secondary"}
                    title={`Show ${text} reviews`}
                    onClick={() => { setQuantityStars(i) }}
                >
                    {text} ({reviewStatistics.quantityOfEachNote[i]})
                </button>)
        }
        return buttons
    }

    return (
        <section className={`${stylesProducts.container_infos}`}>

            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            <Card css={{ margin: 5 }}>

                {/* Informations about the product */}
                {product &&
                    <div className={stylesProducts.details_product}>

                        <img className={stylesProducts.img_details} src={product.imgName ? `${baseURL}/product/get-img/${product.imgName}` : "/img/product-icon.webp"} />
                        <div className={stylesProducts.vertical_line} />

                        <div className={stylesProducts.more_info}>

                            <p className={stylesProducts.category_product}>{product.category}</p>
                            <h1>{product.name}</h1>

                            {product.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                            {starsQuantityJSX(product.averageReviews)}

                            <div style={{ marginTop: 10, maxWidth: 400 }}>{product.description}</div>

                        </div>

                    </div>
                }

                <hr style={{ width: '100%' }} />

                {/* Form to register or edit review, this form appears only for those who are logged in, 
                    if logged in a message asking to log in is displayed. */}
                <div className={stylesReviews.form_review_container}>

                    <h1>Your review</h1>

                    {isLogged
                        ? <form >

                            <div >
                                <label ><span style={{ color: 'red' }}>*</span>Note:</label>
                                {inputsStarsJSX()}
                            </div>

                            <div style={{ marginTop: 40 }}>
                                <label>Comment:</label>
                                <textarea
                                    rows={1}
                                    onChange={event => setUserReview({ ...userReview, comment: event.target.value })}
                                    value={userReview?.comment ? userReview.comment : ''}
                                />
                                <small>{userReview?.comment ? userReview.comment.length : 0}/570</small>
                            </div>

                            <div className='flex_row'>
                                {userReview?.id
                                    ? <>
                                        <button type='button' onClick={updateReview} className='button_primary' >Update</button>
                                        <button type='button' onClick={deleteUserReview} className='button_secondary' >Delete</button>
                                    </>
                                    : <button type='button' onClick={saveReview} className='button_primary' >Save</button>
                                }
                            </div>

                        </form>
                        : <div style={{ margin: '10px 0' }}>
                            <p>Login or register to leave your review about this product</p>
                            <div className='flex_row' style={{ margin: '10px 0' }}>
                                <Link href="/auth/login" className="button_primary">Login</Link>
                                <Link href="/auth/register" className="button_secondary">Sing in</Link>
                            </div>
                        </div>
                    }

                </div>

                <div className={stylesReviews.reviews_container} >

                    <hr />
                    <h1 style={{ marginTop: 10 }}>Reviews</h1>

                    {/* Review statistics, such as average, number of reviews, and ratings. */}
                    {reviewStatistics &&
                        <div style={{ margin: 20 }}>

                            <div className='flex_row wrap items_center '>

                                <p style={{ fontSize: 70, margin: 10 }} className='items_center'><MdStar />{reviewStatistics.averageReviews}</p>

                                <div >
                                    {statisticsReviewsJSX()}
                                    <p>Total ratings: {reviewStatistics.totalReviews}</p>
                                </div>

                            </div>

                            <div className='wrap' style={{ marginTop: 10 }}>

                                <button
                                    className={quantityStars == null ? "button_primary" : "button_secondary"}
                                    title="Show all reviews"
                                    onClick={() => {
                                        setQuantityStars(null)
                                    }}
                                >
                                    All ({reviewStatistics.totalReviews})
                                </button>

                                {buttonsListReviewsByStarsJSX()}

                            </div>

                        </div>
                    }

                    {/* List of reviews, only reviews with comments are displayed */}
                    {reviews.filter(review => review?.comment && review.comment.length > 0).length > 0
                        ? <>
                            {
                                reviews.map(review => {
                                    if (review.comment)
                                        return (
                                            <div key={review.id} style={{ borderBottom: '1px solid red', marginTop: 20 }}>
                                                <div className='items_center'>
                                                    <img src={review.user.profileImageName ? `${baseURL}/auth/get-img/${review.user.profileImageName}` : "/img/person-circle.svg"} className="img_profile_view" />
                                                    <h4 style={{ marginLeft: 8 }} >{review.user.name}</h4>
                                                </div>
                                                {starsQuantityJSX(review.note)}
                                                <p>{review.comment}</p>
                                                <small>{review.date}</small>
                                            </div>
                                        )
                                })
                            }
                        </>
                        : <p> Not a review with comments </p>
                    }

                    <div className='justify_center'>
                        <Pagination
                            actualPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPress={(value: number) => listReviews(value)}
                        />
                    </div>

                </div>

            </Card>

        </section >
    );
}
