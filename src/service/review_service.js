import { api, toStringResponse } from "./api";

export async function getReviewsByProduct(productId, page = 0, size = 30, note) {
    try {

        const response = await api.get(`/review/${productId}?page=${page}&size=${size}${note && "&note="+note}`);
        return { data: response.data, status: 'success' }

    } catch (error) {

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error geting reviews", status: 'error' }
    }
}

export async function selectUserReviewByProduct(productId) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.get(`/review/user-review-by-product/${productId}`,
            {
                headers: {
                    'Authorization': `${token}`,
                }
            })

        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error geting review", status: 'error' }
    }
}

export async function selectUserReviews(page = 0, size = 30) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.get(`/review/user-reviews?page=${page}&size=${size}`,
            {
                headers: {
                    'Authorization': `${token}`,
                }
            })

        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error geting reviews", status: 'error' }
    }
}

export async function postReview(productId, note, comment) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        await api.post(`/review/`,
            { productId, note, comment },
            {
                headers: {
                    'Authorization': `${token}`,
                }
            })

        return { message: "Review saved", status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error saveing review", status: 'error' }
    }
}

export async function putReview(reviewId, productId, note, comment) {
    try {
        console.log({ productId, note, comment });
        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.put(`/review/${reviewId}`,
            { productId, note, comment },
            {
                headers: {
                    'Authorization': `${token}`,
                }
            })

        return { message: "Review updated successfully", status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error saveing review", status: 'error' }
    }
}

export async function deleteReview(reviewId) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        await api.delete(`/review/${reviewId}`,
            {
                headers: {
                    'Authorization': `${token}`,
                }
            })

        return { message: "Review deleted successfully", status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error deleted review", status: 'error' }
    }
}

