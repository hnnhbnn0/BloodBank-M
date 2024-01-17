import TablePrint from 'js-table-print';

const print = (element, review = false) => {

    return new TablePrint({
        children: element,
        header: element,
        landscape: true,
        footer: true,
        water: false,
    }).print(review);

};

export default print;