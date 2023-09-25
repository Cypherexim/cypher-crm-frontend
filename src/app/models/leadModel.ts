export class LeadModel {
    leadUserKeys = [
        { label: "Demo Time", key: "demo_time" },
        { label: "Comapany", key: "company_name" },
        { label: "Client Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Contact", key: "contact" },
        { label: "Remark", key: "remarks" },
        { label: "Designation", key: "designation" },
        { label: "Department", key: "department" },
        { label: "Address", key: "address" },
        { label: "Location", key: "location" },
        { label: "GST Number", key: "gst_num" },
        { label: "PAN Number", key: "pan_num" },
        { label: "IEC Number", key: "iec_num" },
        { label: "Last Followup", key: "last_followup" },
        { label: "Next Followup", key: "next_followup" },
        { label: "Assigned From", key: "assigned_from" },
        { label: "Current Stage", key: "current_stage" },
        { label: "Created on", key: "transaction_time" },
        { label: "Source", key: "source" },
    ];

    commonKeys = [
        // { label: "Last Followup", key: "last_followup" },
        // { label: "Next Followup", key: "next_followup" },
        { label: "Remark", key: "remarks" },
        { label: "Comapany Name", key: "company_name" },
        { label: "Client Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Contact", key: "contact" },
        { label: "Location", key: "location" },
        { label: "Created on", key: "transaction_time" }
    ];
    
    leadKeys:any = {
        openLeadKey: [
            { label: "Last Followup", key: "last_followup" },
            { label: "Next Followup", key: "next_followup" },
            ...this.commonKeys
        ],
        followupLeadKey: [
            { label: "Last Followup", key: "last_followup" },
            { label: "Next Followup", key: "next_followup" },
            ...this.commonKeys
        ],
        rejectLeadKey: [
            { label: "Last Followup", key: "last_followup" },
            { label: "Next Followup", key: "next_followup" },
            ...this.commonKeys
        ],
        closeLeadKey: [
            { label: "Last Followup", key: "last_followup" },
            { label: "Next Followup", key: "next_followup" },
            ...this.commonKeys
        ],
        demoLeadKey: [
            { label: "Last Followup", key: "last_followup" },
            { label: "Next Followup", key: "next_followup" },
            { label: "demo time", key: "demo_time" },
            { label: "assigned from", key: "assigned_from" },
            ...this.commonKeys
        ],
        priceLeadKey: [
            { label: "Last Followup", key: "last_followup" },
            { label: "Next Followup", key: "next_followup" },
            { label: "assigned from", key: "assigned_from" },
            ...this.commonKeys,
        ],
        invoiceLeadKey: [
            { label: "Order No.", key: "performa_num" },
            { label: "assigned from", key: "assigned_from" },
            ...this.commonKeys
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

