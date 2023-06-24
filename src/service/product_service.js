import { api, toStringResponse } from "./api";

export async function getProducts(page = 0, size = 30) {
    try {

        const response = await api.get(`/product/?page=${page}&size=${size}`)
        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error geting product", status: 'error' }
    }
}

export async function getProduct(id) {
    try {
       
        const response = await api.get(`/product/${id}`)
        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error geting product", status: 'error' }
    }
}

export async function findProductByName(name, page = 0, size = 30) {
    try {

        const response = await api.get(`/product/?page=${page}&size=${size}&name=${name}`)
        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error when searching for product", status: 'error' }
    }
}

export async function getProductByCategory(category, page = 0, size = 30) {
    try {

        const response = await api.get(`/product/?page=${page}&size=${size}&category=${category}`)
        return { data: response.data, status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error when searching for product", status: 'error' }
    }
}

export async function postProduct(product) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        const response = await api.post('/product/', product,
            {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        )

        return { message: "Product save", status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error registering product", status: 'error' }
    }
}

export async function patchProduct(product, id) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        await api.patch(`/product/${id}`, product,
            {
                headers: {
                    'Authorization': `${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            }
        )

        return { message: "Product updated successfully", status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error updating product", status: 'error' }
    }
}

export async function deleteProduct(id) {
    try {

        const token = localStorage.getItem('token');
        if (!token)
            return { message: "Not's logged", status: 'error' }

        await api.delete(`/product/${id}`,
            {
                headers: {
                    'Authorization': `${token}`
                }
            }
        )

        return { message: "Product deleted", status: 'success' }

    } catch (error) {
        console.log(error);

        if (error.response)
            return { message: toStringResponse(error.response), status: 'error' };

        return { message: "Error deleting product", status: 'error' }
    }
}