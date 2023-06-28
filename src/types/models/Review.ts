import { User } from './User';
import { Product } from './Product';
export interface Review {
    id: number,
    user: User,
    product: Product,
    note: number,
    comment: string,
    date: string,
}