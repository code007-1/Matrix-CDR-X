import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const DownloadPDF = ({ data, keys, type }) => {

    const generatePDF = () => {
        const doc = new jsPDF();
        const tableRows = [];

        // Capitalize keys for header
        const formattedKeys = keys.map(key => key.charAt(0).toUpperCase() + key.slice(1));

        data.forEach(item => {
            const itemData = keys.map((element) => item[element]);
            tableRows.push(itemData);
        });

        const fileName = `CDR Report - ${type}.pdf`;

        // Add Title
        doc.setFontSize(18);
        doc.setTextColor(40);
        doc.text(type, 14, 22);

        // Add Timestamp and Range
        doc.setFontSize(10);
        doc.setTextColor(100);
        const date = new Date().toLocaleString();
        doc.text(`Generated on: ${date}`, 14, 30);

        autoTable(doc, {
            head: [formattedKeys],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: {
                fontSize: 7,
                cellPadding: 3,
                font: 'helvetica',
                textColor: 50
            },
            headStyles: {
                fillColor: [39, 39, 42], // zinc-800
                textColor: [255, 255, 255],
                fontStyle: 'bold',
            },
            alternateRowStyles: {
                fillColor: [244, 244, 245], // zinc-100
            },
            columnStyles: {
                0: { cellWidth: 15 }, // S.No might be small
                // Adjust other columns if necessary
            },
        });
        doc.save(fileName);
    };
    generatePDF();
};

export default DownloadPDF;