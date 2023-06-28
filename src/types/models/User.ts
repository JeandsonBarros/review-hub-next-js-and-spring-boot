import { Review } from "./Review";

export interface User{
    id: number,
    name: string,
    email: string,
    role: string,
    isActive: boolean,
    profileImageName?: string,
    reviews?: Review[],
}