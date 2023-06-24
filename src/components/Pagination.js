import PropTypes from 'prop-types';
import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from 'react-icons/md';

export default function Pagination({ totalPages, actualPage, onPress }) {

    function show() {

        let buttons = []
        let pages = actualPage >= 3 ? actualPage - 2 : 1;
        let cont = pages
        while (cont < (pages + 5) && cont <= totalPages) {

            buttons.push(
                <button
                    id={cont}
                    key={cont}
                    type='button'
                    className={"rounded" + (actualPage === cont ? " button_primary" : " button_secondary")}
                    onClick={(event) => onPress(Number(event.target.id))}>
                    {cont}
                </button>
            )
            cont++
        }

        return buttons

    }

    return (
        <>
            {totalPages > 1 &&
                <div className="flex_row items_center">
                    <button onClick={() => onPress(1)} className='icon_button'><MdKeyboardDoubleArrowLeft /></button>
                    {show()}
                    <button onClick={() => onPress(totalPages)} className='icon_button'><MdKeyboardDoubleArrowRight /></button>
                </div>
            }
        </>
    );
}

Pagination.propTypes = {
    totalPages: PropTypes.number,
    actualPage: PropTypes.number
};

Pagination.defaultProps = {
    totalPages: 5,
    actualPage: 1
};