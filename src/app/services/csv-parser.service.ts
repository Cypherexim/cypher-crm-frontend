import { Injectable } from '@angular/core';
import { CSVModel } from '../models/excelModel';
import { UtilitiesService } from './utilities.service';

@Injectable({
  providedIn: 'root'
})
export class CsvParserService {

  constructor(
    private utility: UtilitiesService
  ) { }

  convertIntoJson(fileInp: any, callback: Function) {
    try {
      if (!fileInp.files[0].name.endsWith(".csv")) callback("CSV file is required!", undefined);

      const reader = new FileReader();
      reader.readAsText(fileInp.files[0]);

      reader.onload = async() => {
        const csvData = reader.result;
        const csvRecordsArray = (<string>csvData).split(/\r\n|\n/);

        const headersRow = this.getHeaderArray(csvRecordsArray);

        const records = await this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
        callback(undefined, records);
      };

      reader.onerror = () => callback("Error is occured while reading file!", undefined);
    } catch (error) { callback(error, undefined); }
  }

  getHeaderArray(csvRecordsArr: any) {
    let headers = (<string>csvRecordsArr[0]).split(',');
    let headerArray = [];
    for (let j = 0; j < headers.length; j++) {
      headerArray.push(headers[j]);
    }
    return headerArray;
  }

  async getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
    const csvArr: any[] = [];

    for (let i = 1; i < csvRecordsArray.length; i++) {
      const modifiedCellVal = await this.getModifiedVal((<string>csvRecordsArray[i]));
      const curruntRecord = modifiedCellVal.split(',');
      
      if (curruntRecord.length == headerLength) {
        const csvRecord: CSVModel = new CSVModel();

        csvRecord.username = curruntRecord[0].trim().toLowerCase();
        csvRecord.company = curruntRecord[1].trim();
        csvRecord.designation = curruntRecord[2].trim();
        csvRecord.department = curruntRecord[3].trim();
        csvRecord.address = curruntRecord[4].trim().replace(new RegExp("_ ", "g"), "_").split("_").toLocaleString();
        csvRecord.location = curruntRecord[5].trim();
        csvRecord.contact = curruntRecord[6].trim().replace(new RegExp("_ ", "g"), "_").split("_").toLocaleString();
        csvRecord.email = curruntRecord[7].trim().replace(new RegExp("_ ", "g"), "_").split("_").toLocaleString().toLowerCase();
        csvRecord.source = curruntRecord[8].trim();
        csvRecord.gst = curruntRecord[9].trim();
        csvRecord.pan = curruntRecord[10].trim();
        csvRecord.iec = curruntRecord[11].trim();
        csvRecord.userId = this.utility.fetchUserSingleDetail("id");

        csvArr.push(csvRecord);
      }
    }

    return csvArr;
  }
  
  async getModifiedVal(cellVal:string):Promise<string> {
    const allIndices = [];
    const splittedLetters = cellVal.split("");
    for(let j=0; j<splittedLetters.length; j++) { if(splittedLetters[j] == '"') allIndices.push(j); }
    for(let k=1; k<=allIndices.length; k++) {
      if(k%2 == 0) {
        const quotedPart = cellVal.substring(allIndices[k-2], allIndices[k-1]).replace(new RegExp(',','g'), "_").replace(new RegExp('"','g'), " ");
        const firtPart = cellVal.substring(0, allIndices[k-2]).replace(new RegExp('"','g'), " ");
        const lastpart = cellVal.substring(allIndices[k-1], cellVal.length).replace(new RegExp('"','g'), " ");
        cellVal = firtPart + quotedPart + lastpart;
      }
      if(k == allIndices.length) return cellVal;
    }
    return cellVal;
  }
}
