import type { components } from "./api/schema"

type SaleReceipt = components["schemas"]["SaleReceipt"]

// Function to format the date as YYYY-MM-DD HH:mm
const formatSaleDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-CA", { // en-CA gives a nice YYYY-MM-DD format
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    }).replace(",", "")
}

export const generateReceiptHtml = (sale: SaleReceipt): string => {
    // Generate the rows for the items table
    const itemsHtml = sale.items.map(item => `
        <tr>
            <td colspan=\"2\">${item.medicine_name}</td>
        </tr>
        <tr>
            <td class=\"qty-price\">${item.quantity} x GHS ${parseFloat(item.unit_price).toFixed(2)}</td>
            <td class=\"subtotal\">GHS ${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>
    `).join("")

    // Return the full HTML structure
    return `
        <!DOCTYPE html>
        <html lang=\"en\">
        <head>
            <meta charset=\"UTF-8\">
            <title>Sale Receipt - ${sale.invoice_number}</title>
            <style>
                body {
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 11px;
                    color: #000;
                    margin: 0;
                    padding: 0;
                }
                .receipt-container {
                    width: 280px;
                    margin: 0 auto;
                    padding: 10px;
                    box-sizing: border-box;
                }
                .receipt-header {
                    text-align: center;
                    margin-bottom: 10px;
                }
                .receipt-header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 0;
                }
                .receipt-header p {
                    margin: 1px 0;
                    line-height: 1.2;
                }
                .item-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 10px;
                    margin-bottom: 10px;
                }
                .item-table th, .item-table td {
                    padding: 3px 0;
                    border-bottom: 1px dashed #000;
                    text-align: left;
                }
                .item-table thead th {
                    font-weight: bold;
                    border-bottom: 1px solid #000;
                    padding-bottom: 5px;
                }
                .item-table .qty-price {
                    text-align: left;
                }
                .item-table .subtotal {
                    text-align: right;
                }
                .totals-section {
                    width: 100%;
                    margin-top: 10px;
                }
                .totals-section td {
                    padding: 2px 0;
                }
                .totals-section .label {
                    text-align: left;
                }
                .totals-section .value {
                    text-align: right;
                    font-weight: bold;
                }
                .receipt-footer {
                    text-align: center;
                    margin-top: 15px;
                    line-height: 1.2;
                }
                .receipt-footer p {
                    margin: 1px 0;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    .receipt-container {
                        width: 100%;
                        margin: 0;
                        padding: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class=\"receipt-container\">
                <div class=\"receipt-header\">
                    <h1>OTC Store</h1>
                    <p>123 Pharmacy Lane, Accra, Ghana</p>
                    <p>+233 12 345 6789</p>
                    <hr style=\"border-top: 1px dashed #000; margin: 10px 0;\">
                    <p><strong>Invoice #:</strong> ${sale.invoice_number}</p>
                    <p><strong>Date:</strong> ${formatSaleDate(sale.sale_date)}</p>
                    <p><strong>Cashier:</strong> ${sale.sold_by_full_name || "N/A"}</p>
                    <hr style=\"border-top: 1px dashed #000; margin: 10px 0;\">
                </div>

                <table class=\"item-table\">
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class=\"subtotal\">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <hr style=\"border-top: 1px dashed #000; margin: 10px 0;\">

                <table class=\"totals-section\">
                    <tbody>
                        <tr>
                            <td class=\"label\">Subtotal:</td>
                            <td class=\"value\">GHS ${parseFloat(sale.total_amount).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td class=\"label\">Tax (VAT):</td>
                            <td class=\"value\">GHS 0.00</td>
                        </tr>
                        <tr style=\"border-top: 1px solid #000;\">
                            <td class=\"label\" style=\"font-size: 13px;\"><strong>TOTAL:</strong></td>
                            <td class=\"value\" style=\"font-size: 13px;\"><strong>GHS ${parseFloat(sale.total_amount).toFixed(2)}</strong></td>
                        </tr>
                    </tbody>
                </table>

                <hr style=\"border-top: 1px dashed #000; margin: 10px 0;\">

                <div class=\"receipt-footer\">
                    <p>Thank you for your business!</p>
                    <p>Have a great day!</p>
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                };
                window.onafterprint = function() {
                    window.close();
                };
            </script>
        </body>
        </html>
    `;
}
