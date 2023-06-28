import { PageReviews } from '../types/models/PageReviews';
import { ProductReviewStatistics } from '../types/models/ProductReviewStatistics';
import { Review } from '../types/models/Review';
import { ReviewDTO } from './../types/dtos/ReviewDTO';
import { api } from './api';

export async function getReviewsByProduct(productId: number, page = 0, size = 30, note?: number): Promise<PageReviews> {
    const response = await api.get(`/review/product/${productId}?page=${page}&size=${size}${note && ("&note=" + note)}`);
    return response.data
}

export async function getProductReviewStatistics(productId: number): Promise<ProductReviewStatistics> {
    const response = await api.get(`/review/product/${productId}/statistics`)
    return response.data
}

export async function selectUserReviewByProduct(productId: number): Promise<Review> {

    const token = localStorage.getItem('token');
    const response = await api.get(`/review/user-review-by-product/${productId}`,
        {
            headers: {
                'Authorization': `${token}`,
            }
        })

    return response.data

}

export async function selectUserReviews(page = 0, size = 30): Promise<PageReviews> {

    const token = localStorage.getItem('token');
    const response = await api.get(`/review/user-reviews?page=${page}&size=${size}`,
        {
            headers: {
                'Authorization': `${token}`,
            }
        })

    return response.data

}

export async function postReview(reviewDTO: ReviewDTO): Promise<string> {

    const token = localStorage.getItem('token');
    await api.post(`/review/`,
        { note: reviewDTO.note, comment: reviewDTO.comment, productId: reviewDTO.productId },
        {
            headers: {
                'Authorization': `${token}`,
            }
        })

    return "Review saved"

}

export async function putReview(reviewId: number, reviewDTO: ReviewDTO): Promise<string> {

    const token = localStorage.getItem('token');
    await api.put(`/review/${reviewId}`,
        { note: reviewDTO.note, comment: reviewDTO.comment, productId: reviewDTO.productId },
        {
            headers: {
                'Authorization': `${token}`,
            }
        })

    return "Review updated successfully"

}

export async function deleteReview(reviewId: number): Promise<string> {

    const token = localStorage.getItem('token');
    await api.delete(`/review/${reviewId}`,
        {
            headers: {
                'Authorization': `${token}`,
            }
        })

    return "Review deleted successfully"

}

