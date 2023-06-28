import { ProductDTO } from '../types/dtos/ProductDTO';
import { PageProducts } from '../types/models/PageProducts';
import { Product } from '../types/models/Product';
import { api } from './api';

export async function getProducts(page = 0, size = 30): Promise<PageProducts> {
    const response = await api.get(`/product/?page=${page}&size=${size}`)
    return response.data
}

export async function getProduct(id: Number): Promise<Product> {
    const response = await api.get(`/product/${id}`)
    return response.data
}

export async function findProductByName(name: string, page = 0, size = 30): Promise<PageProducts> {
    const response = await api.get(`/product/?page=${page}&size=${size}&name=${name}`)
    return response.data
}

export async function getProductByCategory(category: string, page = 0, size = 30): Promise<PageProducts> {
    const response = await api.get(`/product/?page=${page}&size=${size}&category=${category}`)
    return response.data
}

export async function postProduct(productDTO: ProductDTO): Promise<string> {

    const token = localStorage.getItem('token');
    await api.post('/product/', productDTO,
        {
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )

    return "Product save";

}

export async function patchProduct(productDTO: ProductDTO, id: Number): Promise<string> {

    const token = localStorage.getItem('token');
    await api.patch(`/product/${id}`, productDTO,
        {
            headers: {
                'Authorization': `${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }
    )

    return "Product updated successfully";

}

export async function deleteProduct(id: number): Promise<string> {

    const token = localStorage.getItem('token');
    await api.delete(`/product/${id}`,
        {
            headers: {
                'Authorization': `${token}`
            }
        }
    )

    return "Product deleted";

}