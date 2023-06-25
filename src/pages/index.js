import Alert from '@/components/Alert';
import ProductCard from '@/components/ProductCard';
import { getProductByCategory } from '@/service/product_service';
import { createRef, useEffect, useLayoutEffect, useState } from 'react';
import { MdOutlineKeyboardArrowLeft, MdOutlineKeyboardArrowRight, MdOutlineAddCircle } from 'react-icons/md';

import styles from '../styles/pages_styles/products.module.css';
import Link from 'next/link';

export async function getStaticProps() {

  const resSmartphone = await getProductByCategory("Smartphone", 0, 5)
  const resFurniture = await getProductByCategory("Furniture", 0, 5)
  const resHomeAppliances = await getProductByCategory("Home appliances", 0, 5)

  return {
    props: {
      resSmartphone,
      resFurniture,
      resHomeAppliances
    }
  }

}

export default function Home({ resSmartphone, resFurniture, resHomeAppliances }) {

  const [smartphones, setSmartphones] = useState([])
  const [furnitures, setFurnitures] = useState([])
  const [homeAppliances, sethomeAppliances] = useState([])
  const [alert, setAlert] = useState({ text: '', status: '', isVisible: false })

  useEffect(() => {
    listProducts()
  }, [])

  async function listProducts() {

    if (resSmartphone) {
      if (resSmartphone.data) {
        setSmartphones(resSmartphone.data.content)
      } else {
        setAlert({ text: resSmartphone.message, status: resSmartphone.status, isVisible: true })
      }
    }

    if (resFurniture) {
      if (resFurniture.data) {
        setFurnitures(resFurniture.data.content)
      } else {
        setAlert({ text: resFurniture.message, status: resFurniture.status, isVisible: true })
      }
    }

    if (resFurniture) {
      if (resHomeAppliances.data) {
        sethomeAppliances(resHomeAppliances.data.content)
      } else {
        setAlert({ text: resHomeAppliances.message, status: resHomeAppliances.status, isVisible: true })
      }
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

  const refList = createRef(null)
  const arrowLeft = createRef(null)
  const arrowRight = createRef(null)
  const [products, setProducts] = useState([])

  useEffect(() => { setProducts(productsList) }, [productsList])

  useLayoutEffect(() => {
    if (refList.current) {
      setVisibleButtonsArrows()
    }
  }, [refList])

  const scroll = (scrollOffset) => {
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