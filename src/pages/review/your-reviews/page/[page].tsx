import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { MdStar, MdStarHalf, MdStarOutline } from 'react-icons/md';

import Alert from '../../../../components/Alert';
import Modal from '../../../../components/Modal';
import Pagination from '../../../../components/Pagination';
import { baseURL } from '../../../../service/api';
import { selectUserReviews } from '../../../../service/review_service';
import stylesProducts from '../../../../styles/pages_styles/products.module.css';
import stylesReviews from '../../../../styles/pages_styles/reviews.module.css';
import { Review } from '../../../../types/models/Review';

interface ReviewItemProps {
    review: Review
}

export default function YourReviews() {

    const router = useRouter()
    const page = Number(router.query.page)
    const [totalPages, setTotalPages] = useState(0)
    const [reviews, setReviews] = useState<Review[]>([])
    const [alert, setAlert] = useState({ text: '', status: '', isVisible: false })
    const search = router.query.search

    useEffect(() => {
        selectUserReviews(page - 1).then(response => {
            setReviews(response.content)
            setTotalPages(response.totalPages)
        }).catch(error => {
            setAlert({
                text: error.response ? error.response.data.message : 'Error getting reviews',
                status: 'error',
                isVisible: true
            })
        })
    }, [page])

    return (
        <section className={stylesReviews.reviews_container}>

            <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
                {alert.text}
            </Alert>

            <div>

                <h1 className={stylesProducts.title}>Your reviews</h1>

                <div className='flex_row wrap justify_center'>

                    {reviews.length > 0
                        ? reviews.map(review => {
                            return (
                                <ReviewItem key={review.id} review={review} />
                            )
                        })
                        : <>
                            <p>You haven't even done a review yet</p>
                        </>
                    }

                </div>

            </div>

            <div className='justify_center'>
                <Pagination
                    actualPage={page}
                    totalPages={totalPages}
                    onPress={(value: number) => router.push("./" + value + (search ? `?search=${search}` : ``))}
                />
            </div>

        </section>
    );
}

function ReviewItem({ review }: ReviewItemProps) {

    const [showMoreComment, setShowMoreComment] = useState(false)

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

        return (<span className={stylesReviews.stars}>{stars}</span>)

    }

    return (

        <div className={stylesReviews.review_conteiner}>

            <div className='flex_col justify_center'>

                <Link href={`/product/details/${review.product.id}`} className={`${stylesReviews.review_link_product} flex_row items_center justify_start`}>
                    <img className={stylesProducts.img_select} src={review.product.imgName ? `${baseURL}/product/get-img/${review.product.imgName}` : "/img/product-icon.webp"} />
                    <div>
                        <p >{review.product.category}</p>
                        <h1>{review.product.name}</h1>
                        <p>{(() => {
                            return review.product.price.toLocaleString("en-US", { style: "currency", currency: "USD" });
                        })()}</p >
                        {starsQuantityJSX(review.product.averageReviews)}
                    </div>
                </Link>

                <div className='flex_col' style={{ margin: 10 }}>

                    <p className='items_center'><span>Your note:</span> {starsQuantityJSX(review.note)}</p>
                    {(review?.comment && review.comment.length > 255)
                        ? <p>{review.comment.slice(0, 255)}...<button onClick={() => setShowMoreComment(true)} style={{ color: '#0077ff' }}>more</button> </p>
                        : <p>{review.comment}</p>
                    }

                    <Modal isVisible={showMoreComment} onClosed={() => setShowMoreComment(false)}>
                        <p>{review.comment}</p>
                    </Modal>

                    <small>{review.date}</small>

                </div>

            </div>

        </div>

    )
}
