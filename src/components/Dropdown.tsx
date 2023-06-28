import { createRef, useEffect, useState } from 'react';

import styles from '../styles/components_styles/dropdown.module.css';

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

export default function Dropdown({ children, activationButton }) {

    const [visibleOptions, setVisibleOptions] = useState(false)
    const [marginTopContent, setMarginTopContent] = useState(30)
    const containerRef = createRef()
    const refButton = createRef()
    const content = createRef()

    const handleVisibilit = () => {
        setVisibleOptions(!visibleOptions);
    };

    useEffect(() => {

        if (visibleOptions)
            setMarginTopContent(content.current.offsetHeight + refButton.current.offsetHeight)

    }, [visibleOptions])

    return (
        <div className="justify_center items_center" ref={containerRef}>

            <div
                style={{cursor: 'pointer'}}
                ref={refButton}
                onClick={(event) => {

                    handleVisibilit()
                    
                    if (getWindowDimensions().width - event.currentTarget.offsetLeft <= 200) {
                        containerRef.current.className = 'justify_end items_center'
                    }
                    else if (event.currentTarget.offsetLeft < 200) {
                        containerRef.current.className = 'justify_start items_center'
                    }
                    else {
                        containerRef.current.className = 'justify_center items_center'
                    }

                }}
            >
                {activationButton}
            </div>

            {
                visibleOptions &&
                <>
                    <div className={styles.outside_area} onClick={handleVisibilit}></div>
                    <div
                        ref={content}
                        style={{ marginTop: marginTopContent }}
                        className={styles.content}
                        onClick={handleVisibilit}
                    >
                        {children}
                    </div>
                </>

            }

        </div>
    );
}
