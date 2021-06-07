import { IReplaceOptions } from '../contracts';
import { splitContent, findEscapeSequence } from './line-ending.helper';

/**
 * Adds or replaces content between 2 markers within a text string
 * @param inputString
 * @param content
 * @param options
 * @returns
 */
export function addContent(inputString: string, content: string | string[], options: IReplaceOptions): string {
    const replaceBelow = options?.replaceBelow;
    const replaceAbove = options?.replaceAbove;
    content = Array.isArray(content) ? content : [content];

    const lineBreak = findEscapeSequence(inputString);
    const lines = splitContent(inputString);
    const replaceBelowLine =
        replaceBelow != null ? lines.filter((line) => line.indexOf(replaceBelow) === 0)[0] : undefined;
    const replaceBelowIndex = replaceBelowLine != null ? lines.indexOf(replaceBelowLine) : -1;
    const replaceAboveLine =
        replaceAbove != null ? lines.filter((line) => line.indexOf(replaceAbove) === 0)[0] : undefined;
    const replaceAboveIndex = replaceAboveLine != null ? lines.indexOf(replaceAboveLine) : -1;

    if (replaceAboveIndex > -1 && replaceBelowIndex > -1 && replaceAboveIndex < replaceBelowIndex) {
        throw new Error(
            `The replaceAbove marker '${options.replaceAbove}' was found before the replaceBelow marker '${options.replaceBelow}'. The replaceBelow marked must be before the replaceAbove.`,
        );
    }

    const linesBefore = lines.slice(0, replaceBelowIndex + 1);
    const linesAfter = replaceAboveIndex >= 0 ? lines.slice(replaceAboveIndex) : [];

    const constantLines = content.reduce(
        (lines, currentContent) => [...lines, ...splitContent(currentContent)],
        new Array<string>(),
    );

    let allLines = [...linesBefore, ...constantLines, ...linesAfter];

    if (options.removeDoubleBlankLines) {
        allLines = allLines.filter((line, index, lines) => filterDoubleBlankLines(line, index, lines));
    }

    return allLines.join(lineBreak);
}

const nonWhitespaceRegExp = /[^ \t]/;

function filterDoubleBlankLines(line: string, index: number, lines: string[]): boolean {
    const previousLine = index > 0 ? lines[index - 1] : undefined;

    return nonWhitespaceRegExp.test(line) || previousLine == null || nonWhitespaceRegExp.test(previousLine);
}
