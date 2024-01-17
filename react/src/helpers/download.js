import * as html from 'html-to-image';
import csvDownload from 'json-to-csv-export'
import TableToExcel from "@linways/table-to-excel";

const download = {
    csv: (params = { data: [], filename: 'export.csv', delimiter: ';', headers: [] }) =>
        csvDownload(params)
    ,
    png: (element, filename) => html
        .toPng(element, { quality: 1 })
        .then((dataUrl) => {
            var link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
        }),
    jpg: (element, filename) => html
        .toJpeg(element, { quality: 1 })
        .then((dataUrl) => {
            var link = document.createElement('a');
            link.download = filename;
            link.href = dataUrl;
            link.click();
        }),
    xlsx: (element, params = { name: "export.xlsx", sheet: { name: "Sheet 1" } }) =>
        TableToExcel.convert(element, params)
    ,
};


export default download;