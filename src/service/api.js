import axios from "axios";

export const baseURL = "http://localhost:8080/api";

export const api = axios.create({
    baseURL: baseURL,
});

export function toStringResponse(response) {

    if (typeof (response.data) === "string") {
        return response.data;
    } else if (typeof (response.data) === "object") {

        let message = ''
        response.data.forEach(element => {
            message += (element + ', ')
        });

        message = message.charAt(0).toUpperCase() + message.slice(1, message.length - 2) + '.'
        return message
    }
}