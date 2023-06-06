export default function differenceOfArrays(
  greaterArray: Array<string>,
  lesserArray: Array<string>
) {
  return greaterArray.filter((member) => !lesserArray.includes(member))
}
