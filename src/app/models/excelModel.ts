export class CSVModel {
    username: string = "";
    company: string = "";
    designation: string = "";
    department: string = "";
    remark: string = "";
    source: string = "";
    address: string = "";
    location: string = "";
    email: string = "";
    contact: string = "";
    gst: string = "";
    pan: string = "";
    iec: string = "";
    lastFollow: string = "";
    nextFollow: string = "";
    assignedFrom: string = "";
    demoTime: string = "";
    userId: string|number = "";
    leadId: string|number = "";
    currentStage: string = "";
    leadTracker: string = "";
    followupTracker: string = "";
    transTime: string = "";
    plan_name: string = "";
    plan_price: string = "";
    performa_num:number = 0;
}
// export type CSVModel = Omit<CSVObject, "lastFollow"|"nextFollow"|"assignedBy"|"currentStage"|"transTime">


