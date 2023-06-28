import { User } from "./User";

export interface PageUsers{
    content: User[],
    totalPages: number
}