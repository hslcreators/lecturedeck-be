type HexCode = `#${string}`
const colorCodeArr: ReadonlyArray<HexCode> = [
  '#EEF5D4',
  '#DEF2F3',
  '#DC758F',
  '#E3D3E4',
  '#00FFCD',
  '#E3B23C',
  '#ECFFF8',
  '#7F5A83',
  '#A188A6',
  '#EDEBD7',
  '#EBD4CB',
  '#DA9F93',
  '#B6465F',
  '#890620',
  '#8A4FF'
];
const generateColorCode = (): HexCode => {
  return colorCodeArr[Math.floor(Math.random() * colorCodeArr.length)]
}
export {generateColorCode}