/*import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const DownloadPDF = () => {
    const generatePDF = () => {
        const input = document.getElementById('pdfContent');
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'PNG', 50, 50);
            pdf.save('download.pdf');
        });
    };

    return (
        <div>
            <div id="pdfContent">
                <h1>React PDF Example</h1>
                <p>This content will be converted to a PDF file.</p>
            </div>
            <button onClick={generatePDF}>Download as PDF</button>
        </div>
    );
};

export default DownloadPDF;*/

import React from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const DownloadPDF = ({ data, keys }) => {

    const generatePDF = () => {
        const doc = new jsPDF();
        const tableRows = [];

        data.forEach(item => {
            const itemData =
                keys.map((element) =>
                    item[element]
                )

            tableRows.push(itemData);
        });

        doc.setFontSize(8);
        doc.text("Call Detail Record", 14, 15);
        doc.autoTable(keys, tableRows, {
            startY: 20,
            styles: { cellPadding: 2, fontSize: 7 },
        },
        );
        doc.save("cdr.pdf");
    };
    generatePDF();
};

export default DownloadPDF;