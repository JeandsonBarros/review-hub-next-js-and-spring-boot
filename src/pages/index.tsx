import Link from 'next/link';
import { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { MdOutlineAddCircle, MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight } from 'react-icons/md';

import Alert from '../components/Alert';
import ProductCard from '../components/ProductCard';
import { getProductByCategory } from '../service/product_service';
import styles from '../styles/pages_styles/products.module.css';
import { Product } from '../types/models/Product';

export async function getStaticProps() {

  try {

    const resSmartphone = await getProductByCategory("Smartphone", 0, 5)
    const resFurniture = await getProductByCategory("Furniture", 0, 5)
    const resHomeAppliances = await getProductByCategory("Home appliances", 0, 5)

    return {
      props: {
        resSmartphone: resSmartphone.content,
        resFurniture: resFurniture.content,
        resHomeAppliances: resHomeAppliances.content
      }
    }

  } catch (error) {
    return {
      props: {
        errorMessage: "Internal server error",
      }
    }
  }

}

export default function Home({ resSmartphone, resFurniture, resHomeAppliances, errorMessage }) {

  const [smartphones, setSmartphones] = useState<Product[]>([])
  const [furnitures, setFurnitures] = useState<Product[]>([])
  const [homeAppliances, sethomeAppliances] = useState<Product[]>([])
  const [alert, setAlert] = useState<any>({ text: '', status: '', isVisible: false })

  useEffect(() => {
    listProducts()
  }, [])

  async function listProducts() {

    if (errorMessage) {
      return setAlert({ text: errorMessage, status: 'error', isVisible: true })
    }

    if (resSmartphone) {
      setSmartphones(resSmartphone)
    }

    if (resFurniture) {
      setFurnitures(resFurniture)
    }

    if (resHomeAppliances) {
      sethomeAppliances(resHomeAppliances)
    }

  }

  return (
    <section >

      <Alert isVisible={alert.isVisible} status={alert.status} closed={() => setAlert({ ...alert, isVisible: false })}>
        {alert.text}
      </Alert>

      {smartphones.length > 0 &&
        <div>
          <h1 className={`${styles.title} items_center`}>
            Smartphone
            <Link href="/product/category/smartphone/page/1" className='color_info items_center'> <MdOutlineAddCircle /></Link>
          </h1>
          <HorizontalList productsList={smartphones} />
        </div>
      }

      {furnitures.length > 0 &&
        <div>
          <h1 className={`${styles.title} items_center`}>
            Furnitures
            <Link href="/product/category/furniture/page/1" className='color_info items_center'> <MdOutlineAddCircle /></Link>
          </h1>
          <HorizontalList productsList={furnitures} />
        </div>
      }

      {homeAppliances.length > 0 &&
        <div>
          <h1 className={`${styles.title} items_center`}>
            Home appliances
            <Link href="/product/category/home-appliance/page/1" className='color_info items_center'> <MdOutlineAddCircle /></Link>
          </h1>
          <HorizontalList productsList={homeAppliances} />
        </div>
      }

    </section>
  )
}

function HorizontalList({ productsList }) {

  const refList = createRef<any>()
  const arrowLeft = createRef<any>()
  const arrowRight = createRef<any>()
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => { setProducts(productsList) }, [productsList])

  useLayoutEffect(() => {
    if (refList.current) {
      setVisibleButtonsArrows()
    }
  }, [refList])

  const scroll = (scrollOffset: number) => {
    refList.current.scrollLeft += scrollOffset
    setVisibleButtonsArrows()
  }

  const setVisibleButtonsArrows = () => {

    if (refList.current.scrollLeft + refList.current.offsetWidth >= refList.current.scrollWidth && refList.current.scrollLeft <= 0) {
      arrowRight.current.style.display = "none";
      arrowLeft.current.style.display = "none";
    } else if (refList.current.scrollLeft + refList.current.offsetWidth >= refList.current.scrollWidth) {
      arrowRight.current.style.display = "none";
      arrowLeft.current.style.display = "flex";
    } else if (refList.current.scrollLeft + refList.current.offsetWidth < refList.current.scrollWidth && refList.current.scrollLeft > 0) {
      arrowRight.current.style.display = "flex";
      arrowLeft.current.style.display = "flex";
    } else if (refList.current.scrollLeft <= 0) {
      arrowLeft.current.style.display = "none";
      arrowRight.current.style.display = "flex";
    }

  }

  return (
    <>
      {products.length > 0 &&
        <div className="flex_row items_center" >

          <button ref={arrowLeft} onClick={() => scroll(-240)} className={`${styles.button_to_left} button_primary rounded`}>
            <MdOutlineKeyboardArrowLeft />
          </button>

          <div ref={refList} className={styles.horizontal_list}>
            {products.map(product => {
              return (
                <ProductCard key={product.id} product={product} />
              )
            })}
          </div>

          <button ref={arrowRight} onClick={() => scroll(240)} className={`${styles.button_to_right} button_primary rounded`}>
            <MdOutlineKeyboardArrowRight />
          </button>

        </div>}
    </>
  )
}