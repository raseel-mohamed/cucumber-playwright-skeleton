import fs from "fs";
import path from "path";
import {defaultLogger} from "../logger/logger";
import * as XLSX from 'xlsx'
import {WorkSheet} from "xlsx";

const dataFolder = path.resolve(`${__dirname}/../../../dataFolder`)
const downloadFolder = path.resolve(`${__dirname}/../../../downloadFolder`)

export default class ExcelUtilFiles {
    constructor() {}

    async getFirstEmptyRowAssayTemplate(worksheet:XLSX.WorkSheet) {
        let range = XLSX.utils.decode_range(worksheet['!ref'] as string);
        // Finding first empty row from the second row and second column
        let firstEmptyRow = range.e.r + 1
        for(let R:number = range.s.r; R <= range.e.r; ++R) {
            let isRowEmpty = true;
            for (let C:number = range.s.c; C <= range.e.c; ++C){
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                const cell = worksheet[cellAddress];
                if (cell && cell.v !== undefined && cell.v !== null && cell.v !== "") {
                    isRowEmpty = false;
                    break;
                }
            }
            if (isRowEmpty) {
                firstEmptyRow = R;
                break;
            }
        }
        return firstEmptyRow;
    }

    async buildPreambleInfoFromAssayTemplate(worksheet:XLSX.WorkSheet) {
        let lastPreambleRow = await this.getFirstEmptyRowAssayTemplate(worksheet);
        let range = XLSX.utils.decode_range(worksheet['!ref'] as string);
        range.s.r = 1;
        range.s.c = 1;
        range.e.r = lastPreambleRow - 1;
        let dataArr:any[] = XLSX.utils.sheet_to_json(worksheet, {
            range: XLSX.utils.encode_range(range),
            header: 1
        });
        let data:{[k:string]: any} = Object.fromEntries(dataArr)
        return data;
    }

    async buildDataFromAssayTemplate(worksheet:XLSX.WorkSheet):Promise<Record<string, string>[]> {
        let lastPreambleRow = await this.getFirstEmptyRowAssayTemplate(worksheet);

        let range = XLSX.utils.decode_range(worksheet['!ref'] as string);
        range.s.r = lastPreambleRow + 2;
        range.s.c = 1;

        return XLSX.utils.sheet_to_json(worksheet, {
            range: XLSX.utils.encode_range(range),
            defval: null
        });
    }

    async buildAssayColumnHeaders(worksheet:XLSX.WorkSheet) {
        let lastPreambleRow = await this.getAssayHeaderRow(worksheet);
        let range = XLSX.utils.decode_range(worksheet['!ref'] as string);
        range.s.r = range.e.r = lastPreambleRow ;
        range.s.c = 1;
        return XLSX.utils.sheet_to_json(worksheet, {range: XLSX.utils.encode_range(range), header: 1}).flat();
    }

    async getAssayHeaderRow(worksheet:XLSX.WorkSheet):Promise<number> {
        let range = XLSX.utils.decode_range(worksheet['!ref'] as string);
        let headerRow:number = 0
        for(let row:number = headerRow; row < range.e.r; row++){
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0})
            const cell = worksheet[cellAddress];
            if (cell && cell.v !== undefined && cell.v !== null && cell.v === "#header") {
                headerRow = row;
                return headerRow;
            }
        }
        return headerRow;
    }

    async getCellAddress(sheet: XLSX.WorkSheet, targetText: string): Promise<string | null> {
        for (const addr of Object.keys(sheet)) {
            if (addr.startsWith("!")) continue;
            const cell = sheet[addr];
            if (cell && cell.v != null && String(cell.v).trim() === targetText) {
                return addr;
            }
        }
        return null;
    }

    async setCellValue(sheet:XLSX.WorkSheet, address:string, text:string):Promise<void> {
        sheet[address] =      ''
    }
}