import * as XLSX from "xlsx"
import path from "path";

type RecordInfo = Record<string, string>;

type updateInfo = {
    input: string;
    output: string;
    sheetName: string;
    preambleInfo: RecordInfo;
    sampleRecords?: RecordInfo[];
    sampleHeader?: string;
}

const specialKeys:Record<string, string> = {
    "bead removal": "boolean"
}


export default class ExcelWriteFileUtils {
    constructor() {
    }

    /*
    This function will find the exact cell address (A123) with the targetName else return null
    */
    async findExactCell(sheet: XLSX.WorkSheet, targetName: string): Promise<string | null> {
        for (let cell of Object.keys(sheet)) {
            if (cell.startsWith("!")) continue;

            let data = sheet[cell];
            if (data?.v !== null && data?.v !== undefined && String(data.v).trim() === targetName) {
                return cell;
            }
        }
        return null
    }

    async getKeyType(key:string): Promise<string> {
        let retVal = specialKeys[key]
        if(retVal){
            return retVal;
        }
        return "string"
    }

    /*
    * This function will enter the <entry> into the <cell> address provided for the <sheet>
    * */
    async enterDataInCell(sheet: XLSX.WorkSheet, cell: string, entry: string, type:string = "string"): Promise<void> {
        let t_mapping:Record<string, string> = {
            "boolean": "b",
            "number": "n",
            "string": "s",
        }
        let dataType = t_mapping[type]
        sheet[cell] = {t: t_mapping[type], v: entry};
    }

    /*
    * This function will update the preamble section of the worksheet
    * */
    async updatePreambleInfo(sheet: XLSX.WorkSheet, preambleInfo: RecordInfo): Promise<void> {
        for (let [label, value] of Object.entries(preambleInfo)) {
            let labelAddress = await this.findExactCell(sheet, label);
            if (!labelAddress) {
                throw new Error(`Could not find label "${label}"`);
            }
            let dataType = await this.getKeyType(label.toLowerCase())
            const labelPos: XLSX.CellAddress = XLSX.utils.decode_cell(labelAddress);
            const valuePos = XLSX.utils.encode_cell({c: labelPos.c + 1, r: labelPos.r});
            await this.enterDataInCell(sheet, valuePos, value, dataType);
        }
    }

    /*
    * This function will return the address of the cell that contains the demarcation of samples data
    * (for eg."Samples" on most templates or "Run info" for cyTOF template)
    */
    async getSampleHeadingRow(sheet: XLSX.WorkSheet, cell = "Samples"): Promise<{ row: number; col: number }> {
        let sampleAddress = await this.findExactCell(sheet, cell);
        if (!sampleAddress) {
            throw new Error(`Could not find address for start of data "${cell}"`);
        }
        const {r, c} = XLSX.utils.decode_cell(sampleAddress);

        return {row: r, col: c};
    }

    /*
    * Returns a map of the column headers of the sample section. For Eg: in the case of olink you might get
    * {
    *   "Processed fcs filename": 2,
    *   "Normalization version": 3,
    *   Preprocessing_notes: 4,
    *   'Cimac id': 1
    * }
    *
     */
    async buildSampleColumnMap(sheet: XLSX.WorkSheet, sampleHeader: string = "Samples"): Promise<Record<string, number>> {
        let heading: Record<string, number> = await this.getSampleHeadingRow(sheet, sampleHeader);
        let row: number = heading.row + 1
        let col: number = heading.col
        let columnHeaderInfo: Record<string, number> = {}
        let cell = sheet[XLSX.utils.encode_cell({r: row, c: col})];
        while (cell !== undefined && cell.v !== null && cell.v !== undefined && cell.v !== "") {
            columnHeaderInfo[cell?.v] = col;
            col = col + 1
            cell = sheet[XLSX.utils.encode_cell({r: row, c: col})];
        }
        return columnHeaderInfo;
    }

    async removeAllCellNotes(sheet: XLSX.WorkSheet): Promise<void> {
        for (const addr of Object.keys(sheet)) {
            if (addr.startsWith("!")) continue;

            const cell = sheet[addr];
            if (!cell) continue;

            // SheetJS stores Excel notes/comments in the `c` property
            if ("c" in cell) {
                delete cell.c;
            }
        }
    }

    /*
    * This function is specifically to update an assay template sheet
    * Input is an object of objects
    * */
    async updateAssayWorkbook({
                                  input,
                                  output,
                                  sheetName,
                                  preambleInfo,
                                  sampleRecords = [],
                                  sampleHeader = "Samples"
                              }: updateInfo) {
        const wb: XLSX.WorkBook = XLSX.readFile(input, {
            cellStyles: true,
            cellDates: true,
        });
        const sheet: XLSX.WorkSheet = wb.Sheets[sheetName];
        if (!sheet) {
            throw new Error(`Sheet "${sheetName}" not found`);
        }

        await this.updatePreambleInfo(sheet, preambleInfo);

        if (sampleRecords.length > 0) {
            let sampleColumnHeaders = await this.buildSampleColumnMap(sheet, sampleHeader);

            let heading = await this.getSampleHeadingRow(sheet, sampleHeader);
            let row: number = heading.row + 1
            let col: number = 1
            for (let rowData of sampleRecords) {
                row = row + 1;
                for (let [key, value] of Object.entries(rowData)) {
                    col = sampleColumnHeaders[key]
                    let type = await this.getKeyType(key)
                    await this.enterDataInCell(sheet, XLSX.utils.encode_cell({r: row, c: col}), value, type);
                }
            }

        }
        // Removing all the cell comments and notes in the prepared file
        for(let sheetName of wb.SheetNames) {
            if (['legend', 'data dictionary' ].includes(sheetName)) {
                continue
            }
            if(sheetName){
                let sheetObject = wb.Sheets[sheetName];
                await this.removeAllCellNotes(sheetObject);
            }
        }

        XLSX.writeFile(wb, output);
    }
};
