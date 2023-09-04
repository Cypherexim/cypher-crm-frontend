export class LeadModel {
    leadUserKeys = [
        { label: "comapany", key: "company_name" },
        { label: "username", key: "name" },
        { label: "email", key: "email" },
        { label: "contact", key: "contact" },
        { label: "source", key: "source" },
        { label: "designation", key: "designation" },
        { label: "department", key: "department" },
        { label: "address", key: "address" },
        { label: "location", key: "location" },
        { label: "GST number", key: "gst_num" },
        { label: "PAN number", key: "pan_num" },
        { label: "IEC number", key: "iec_num" }
        // { label: "time", key: "transaction_time" }
    ];

    commonKeys = [
        { label: "comapany", key: "company_name" },
        { label: "username", key: "name" },
        { label: "email", key: "email" },
        { label: "contact", key: "contact" },
        { label: "designation", key: "designation" },
        { label: "department", key: "department" },
        { label: "address", key: "address" },
        { label: "location", key: "location" },
        { label: "GST number", key: "gst_num" },
        { label: "PAN number", key: "pan_num" },
        { label: "IEC number", key: "iec_num" },
    ];
    
    leadKeys:any = {
        openLeadKey: [
            { label: "source", key: "source" },
            ...this.commonKeys,
            { label: "time", key: "transaction_time" }
        ],
        followupLeadKey: [
            { label: "remark", key: "remarks" },
            { label: "last followup", key: "last_followup" },
            { label: "next followup", key: "next_followup" },
            ...this.commonKeys,
            // { label: "time", key: "transaction_time" }
        ],
        rejectLeadKey: [
            { label: "time", key: "transaction_time" },
            { label: "remark", key: "remarks" },
            ...this.commonKeys,
            // { label: "last followup", key: "last_followup" },
            // { label: "next followup", key: "next_followup" },
        ],
        closeLeadKey: [
            { label: "time", key: "transaction_time" },
            { label: "remark", key: "remarks" },
            ...this.commonKeys,
            // { label: "last followup", key: "last_followup" },
            // { label: "next followup", key: "next_followup" },
        ],
        demoLeadKey: [
            { label: "demo time", key: "demo_time" },
            { label: "remark", key: "remarks" },
            { label: "assigned from", key: "assigned_from" },
            ...this.commonKeys,
            // { label: "last followup", key: "last_followup" },
            // { label: "next followup", key: "next_followup" },
            { label: "time", key: "transaction_time" }
        ],
        priceLeadKey: [
            { label: "remark", key: "remarks" },
            { label: "assigned from", key: "assigned_from" },
            ...this.commonKeys,
            // { label: "last followup", key: "last_followup" },
            // { label: "next followup", key: "next_followup" },
            { label: "time", key: "transaction_time" }
        ],
        invoiceLeadKey: [
            { label: "Order No.", key: "performa_num" },
            { label: "remark", key: "remarks" },
            { label: "assigned from", key: "assigned_from" },
            ...this.commonKeys,
            // { label: "last followup", key: "last_followup" },
            // { label: "next followup", key: "next_followup" },
            { label: "time", key: "transaction_time" }
        ],
        statusLeadKey: [ //using as defaul angular excel modal keys
            { label: "comapany", key: "company" },
            { label: "username", key: "username" },
            { label: "email", key: "email" },
            { label: "contact", key: "contact" },
            { label: "location", key: "location" },
            { label: "GST number", key: "gst" },
            { label: "PAN number", key: "pan" },
            { label: "status", key: "status" },
            { label: "time", key: "transaction_time" }
        ],
        taxLeadKey: [
            { label: "Invoice Date", key: "invoice_date" },
            { label: "Order No", key: "performa_num" },
            { label: "Invoice No", key: "tax_num" },
            { label: "company", key: "company_name" },
            { label: "username", key: "name" },
            { label: "plan name", key: "plan_name" },
            { label: "GST Number", key: "gst_num" },
            { label: "Report Type", key: "report_name" },
            { label: "Duration", key: "duration" },
            { label: "Shipping Address", key: "shipping_add" },
            { label: "Billing Address", key: "billing_add" },
            { label: "HSN/SAC", key: "HSN_SAC" },
            { label: "Quantity", key: "quantity" },
            { label: "Unit", key: "unit" },
            { label: "Initial Amount", key: "amountBeforeTax" },
            { label: "Taxable Amount", key: "amountAfterTax" },
            { label: "Tax Amount", key: "tax_amt" },
            { label: "CGST Percent", key: "CGST_taxPer" },
            { label: "SGST Percent", key: "SGST_taxPer" },
            { label: "IGST Percent", key: "IGST_taxPer" },
            { label: "Issued By", key: "issued_name" },
            { label: "Payment Status", key: "payment_status" },
            { label: "Transaction time", key: "transaction_time" }
        ]
    };

    getCurrentKeys(leadKey: string): any[] {
        const key = `${leadKey}LeadKey`.replace("-","");       
        return this.leadKeys[key];
    }
}

export class StatusLead {
    leadData: string = "";
    assigners: string = "";
    status: string = "";
}

