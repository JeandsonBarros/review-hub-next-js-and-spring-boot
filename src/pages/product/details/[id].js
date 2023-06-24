import Alert from '@/components/Alert';
import Card from '@/components/Card';
import { baseURL } from '@/service/api';
import { getProduct } from '@/service/product_service';
import { deleteReview, getReviewsByProduct, postReview, putReview, selectUserReviewByProduct } from '@/service/review_service';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MdStar, MdStarHalf, MdStarOutline } from 'react-icons/md';

import stylesProducts from '../../../styles/pages_styles/products.module.css';
import stylesReviews from '../../../styles/pages_styles/reviews.module.css';
import Link from 'next/link';
import { getDataAccount } from '@/service/auth_service';
import Pagination from '@/components/Pagination';

export default function productDetails() {

    const router = useRouter()
    const id = Number(router.query.id)
    const [product, setProduct] = useState()
    const [accountData, setAccountData] = useState()
    const [reviews, setReviews] = useState([])
    const [reviewStatistics, setReviewStatistics] = useState()
    const [userReview, setUserReview] = useState({})
    const [alert, setAlert] = useState({ text: '', status: '', isVisible: false })
    const [pagination, setPagination] = useState({ page: 0, totalPages: 0 })
    const [quantityStars, setQuantityStars] = useState(null)

    useEffect(() => { if (id) getAllData() }, [id, quantityStars])

    const getAllData = () => {
        listReviews()
        getProductData()
        getUserData()
    }

    async function getUserData() {
        const responseDataUser = await getDataAccount()
        if (responseDataUser.data) {
            setAccountData(responseDataUser.data)

            const responseUserReview = await selectUserReviewByProduct(id)
            if (responseUserReview.data)
                setUserReview(responseUserReview.data)

        }
    }

    async function getProductData() {
        const response = await getProduct(id)

        if (response.data) {
            setProduct(response.data)
        } else {
            setAlert({ text: response.message, status: response.status, isVisible: true })
        }

    }

    async function listReviews(page = 1) {
        const response = await getReviewsByProduct(id, page - 1, 10, quantityStars)

        if (response.data) {

            if (quantityStars) {
                setPagination({ page: page, totalPages: response.data.totalPages })
                setReviews(response.data.content)
            } else {
                setPagination({ page: page, totalPages: response.data.reviews.totalPages })
                setReviews(response.data.reviews.content)
                setReviewStatistics(response.data.reviewStatistics)
            }

        } else {
            setAlert({ text: response.message, status: response.status, isVisible: true })
        }
    }

    async function saveReview() {
        if (!userReview.note)
            return setAlert({ text: "Note is required", status: "warning", isVisible: true })

        if (userReview?.comment && userReview.comment.length > 570)
            return setAlert({
                text: "The maximum number of characters in the comment is 570, you informed " + userReview.comment.length,
                status: "warning",
                isVisible: true
            })

        const response = await postReview(id, userReview.note, userReview.comment)
        setAlert({ text: response.message, status: response.status, isVisible: true })
        getAllData()
    }

    async function updateReview() {

        if (!userReview.note)
            return setAlert({ text: "Note is required", status: "warning", isVisible: true })

        if (userReview?.comment && userReview.comment.length > 570)
            return setAlert({
                text: "The maximum number of characters in the comment is 570, you informed " + userReview.comment.length,
                status: "warning",
                isVisible: true
            })

        const response = await putReview(userReview.id, id, userReview.note, userReview.comment)
        setAlert({ text: response.message, status: response.status, isVisible: true })
        getAllData()
    }

    async function deleteUserReview() {
        const response = await deleteReview(userReview.id)
        setAlert({ text: response.message, status: response.status, isVisible: true })
        getAllData()
        setUserReview({})
    }

    function setUserReviewForm(key, value) {
        let userReviewTemp = userReview
        userReviewTemp[key] = value
        setUserReview({ ...userReviewTemp })
    }

    function starsQuantity(note) {

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

    return (
        <section className={`${stylesProducts.container_infos}`}>

            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            <Card css={{ margin: 5 }}>

                {/* Informations about the product */}
                {product &&
                    <div className={stylesProducts.details_product}>

                        <img className={stylesProducts.img_details} src={product.imgName ? `${baseURL}/product/get-img/${product.imgName}` : "/img/card-image.svg"} />

                        <div className={stylesProducts.vertical_line} />

                        <div className={stylesProducts.more_info}>

                            <p className={stylesProducts.category_product}>{product.category}</p>

                            <h1>{product.name}</h1>

                            <p>{(() => {
                                return product.price.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                            })()}</p >

                            {starsQuantity(product.averageRating)}

                            <div style={{ marginTop: 10, maxWidth: 400 }}>{product.description}</div>

                        </div>

                    </div>
                }

                <hr style={{ width: '100%' }} />

                {/* Form to register or edit review, this form appears only for those who are logged in, 
                    if logged in a message asking to log in is displayed. */}
                <div className={stylesReviews.form_review_container}>

                    <h1>Your review</h1>

                    {accountData
                        ? <form >

                            <div >
                                <label ><span style={{ color: 'red' }}>*</span>Note:</label>
                                <div className={`${stylesReviews.stars}`} >

                                    <input
                                        type="radio"
                                        value={5}
                                        name="stars"
                                        id="radio-5"
                                        checked={userReview?.note && userReview.note == 5}
                                        onChange={() => setUserReviewForm("note", 5)}
                                    />
                                    <label title="5 stars" htmlFor="radio-5"><MdStar /></label>

                                    <input
                                        type="radio"
                                        value={4}
                                        name="stars"
                                        id="radio-4"
                                        checked={userReview?.note && userReview.note == 4}
                                        onChange={() => setUserReviewForm("note", 4)}
                                    />
                                    <label title="4 stars" htmlFor="radio-4"><MdStar /></label>

                                    <input
                                        type="radio"
                                        value={3}
                                        name="stars"
                                        id="radio-3"
                                        checked={userReview?.note && userReview.note == 3}
                                        onChange={() => setUserReviewForm("note", 3)}
                                    />
                                    <label title="3 stars" htmlFor="radio-3"><MdStar /></label>

                                    <input
                                        type="radio"
                                        value={2}
                                        name="stars"
                                        id="radio-2"
                                        checked={userReview?.note && userReview.note == 2}
                                        onChange={() => setUserReviewForm("note", 2)}
                                    />
                                    <label title="2 stars" htmlFor="radio-2"><MdStar /></label>

                                    <input
                                        type="radio"
                                        value={1}
                                        name="stars"
                                        id="radio-1"
                                        checked={userReview?.note && userReview.note == 1}
                                        onChange={() => setUserReviewForm("note", 1)}
                                    />
                                    <label title="1 stars" htmlFor="radio-1"><MdStar /></label>

                                </div>
                            </div>

                            <div style={{ marginTop: 40 }}>
                                <label>Comment:</label>
                                <textarea

                                    rows="1"
                                    onChange={event => setUserReviewForm("comment", event.target.value)}
                                    value={userReview ? userReview.comment : ''}
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

                {/* List of reviews, only reviews with comments are displayed */}
                <div className={stylesReviews.reviews_container} >

                    <hr />
                    <h1 style={{ marginTop: 10 }}>Reviews</h1>

                    {/* Review statistics, such as average, number of reviews, and ratings. */}
                    {reviewStatistics &&
                        <div style={{ margin: 20 }}>

                            <div className='flex_row wrap items_center '>

                                <p style={{ fontSize: 70, margin: 10 }} className='items_center'><MdStar />{reviewStatistics.averageRating}</p>

                                <div >
                                    {(() => {

                                        let listProgress = []
                                        for (let c = 5; c >= 1; c--) {

                                            listProgress.push(
                                                <div key={c} className='items_center' style={{ marginBottom: 5 }}>
                                                    <label htmlFor="file" className='items_center'>{c} <MdStar /></label>
                                                    <div className={`${stylesReviews.progress_container} items_center`}>
                                                        <div style={{ width: `${((reviewStatistics[c] / reviewStatistics.totalRatings) * 100)}%` }} />
                                                    </div>
                                                    <small>({reviewStatistics[c]})</small>
                                                </div>
                                            )
                                        }
                                        return listProgress

                                    })()}
                                    <p>Total ratings: {reviewStatistics.totalRatings}</p>
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
                                    All ({reviewStatistics.totalRatings})
                                </button>

                                {(() => {
                                    let buttons = []
                                    for (let i = 5; i >= 1; i--) {
                                        let text = i == 1 ? i + " star" : i + " stars"
                                        buttons.push(
                                            <button
                                                key={i}
                                                className={i == quantityStars ? "button_primary" : "button_secondary"}
                                                title={`Show ${text} reviews`}
                                                onClick={() => {
                                                    setQuantityStars(i)
                                                }}
                                            >
                                                {text} ({reviewStatistics[i]})
                                            </button>)
                                    }
                                    return buttons
                                })()}

                            </div>

                        </div>
                    }

                    {reviews.filter(review => review?.comment && review.comment.length > 0).length > 0
                        ? <>
                            {
                                reviews.map(review => {
                                    if (review.comment)
                                        return (
                                            <div key={review.id} style={{ borderBottom: '1px solid red', marginTop: 20 }}>
                                                <div className='items_center'>
                                                    <img htmlFor="input_file" src={review.user.profileImageName ? `${baseURL}/auth/get-img/${review.user.profileImageName}` : "/img/person-circle.svg"} className="img_profile_view" />
                                                    <h4 style={{ marginLeft: 8 }} >{review.user.name}</h4>
                                                </div>
                                                {starsQuantity(review.note)}
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
                            onPress={value => listReviews(value)}
                        />
                    </div>

                </div>

            </Card>

        </section >
    );
}
