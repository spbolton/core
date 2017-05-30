import {Injectable} from '@angular/core';
/**
 * Encapsulate string utils methods.
 */
@Injectable()
export class StringUtils {
    constructor() {}
    /**
     * Get from text, the line number (indexLine), null if it does not exists.
     * @param text
     * @param indexLine
     * @returns {string}
     */
    getLine (text: string, indexLine: number): string {
        let line: string = null;

        if (text) {
            let lines = text.split('\n');
            line = lines && lines.length > indexLine ? lines[indexLine] : null;
        }

        return line;
    } // getLine.

    /**
     * Get an string and return it camelcased, ex: "Hello World" > "helloWorld"
     * @param str
     * @returns {string}
     */
    camelize(str): string {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter, index) => {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
        }).replace(/\s+/g, '');
    }

} // E:O:F:StringUtils.