import Link from "next/link";

function Error404() {
    return (
        <div className="flex_col items_center justify_center" style={{height: '100vh', fontSize: '2rem'}}>
            <img src="/img/not_found.gif" height={200} />
            <h1>Error 404</h1>
            <p>Page not found</p>
            <Link href="/" className="color_info">Going to home page</Link>
        </div>
    );
}

export default Error404;