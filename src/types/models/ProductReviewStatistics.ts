import { Product } from "./Product";

interface QuantityOfEachNote {
    1: number,
    2: number,
    3: number,
    4: number,
    5: number
}

export interface ProductReviewStatistics {
    averageReviews: number,
    sumOfGrades: number,
    totalReviews: number,
    approvalPercentage: number,
    product: Product,
    quantityOfEachNote: QuantityOfEachNote
}