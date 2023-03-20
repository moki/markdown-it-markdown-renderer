// omit first and last empty lines
const filterOutEmptyFstLst = (line, i, ls) => (i && i + 1 !== ls.length) || line.trim().length;

export const normalizeMD = (str: string) => str.split('\n').filter(filterOutEmptyFstLst).join('\n');
