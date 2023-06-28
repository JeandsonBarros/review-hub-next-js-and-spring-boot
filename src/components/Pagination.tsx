import { MdKeyboardDoubleArrowRight, MdKeyboardDoubleArrowLeft } from 'react-icons/md';

interface PaginationProps {
    totalPages: number,
    actualPage: number,
    onPress?: (page: number) => void
}

export default function Pagination({ totalPages, actualPage, onPress }: PaginationProps) {

    function show() {

        let buttons = []
        let pages = actualPage >= 3 ? actualPage - 2 : 1;
        let cont = pages
        while (cont < (pages + 5) && cont <= totalPages) {

            buttons.push(
                <button
                    id={`${cont}`}
                    key={cont}
                    type='button'
                    className={"rounded" + (actualPage === cont ? " button_primary" : " button_secondary")}
                    onClick={(event: any) => onPress? onPress(Number(event.target.id)) : console.error("onPress is undefined")}
                    >
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
